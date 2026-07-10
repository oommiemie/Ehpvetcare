/**
 * อ่านเอกสารสั่งซื้อ (ภาพใบสั่งซื้อ/ใบเสนอราคา/ใบส่งของ) ด้วย AI vision
 * แล้วสกัดเป็นข้อมูลใบ PO — ใช้โมเดลเดียวกับหมอเหมียว (vLLM multimodal)
 */
import { AI_BASE, AI_BASE_BACKUP, AI_MODEL, type AgentMessage } from "./aiClient";

export interface ExtractedPoItem {
  name: string;
  qty: number;
  unitPrice: number;
  packUnit?: string;    // หน่วยบรรจุที่สั่งซื้อ (ถุง/ขวด/กล่อง...)
  unit?: string;        // หน่วยจ่ายเข้า Stock ถ้าเอกสารระบุ
  discount?: number;    // ส่วนลดของรายการ (บาท)
  lot?: string;         // Lot/Batch ถ้าเอกสารระบุ
  expiry?: string;      // วันหมดอายุ YYYY-MM-DD ถ้าเอกสารระบุ
  productId?: number;   // id ในระบบถ้าโมเดลจับคู่ได้, 0 = ไม่พบ
}
export interface ExtractedPo {
  supplier?: string;
  poNumber?: string;       // เลขที่ใบสั่งซื้อ (PO-...) ที่เอกสารอ้างอิง
  orderDate?: string;      // YYYY-MM-DD
  expectedDate?: string;   // YYYY-MM-DD
  deliveryMethod?: string;
  taxType?: "exclude" | "include" | "none";
  billDiscount?: number;   // ส่วนลดท้ายบิล (บาท)
  note?: string;
  items: ExtractedPoItem[];
}

/* ย่อรูปเป็น dataURL ≤ max px — ลดขนาด payload ก่อนส่งให้โมเดล */
export const fileToDataUrl = (file: File, max = 1280): Promise<string> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.88));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("อ่านไฟล์ภาพไม่ได้")); };
    img.src = url;
  });

/* ดึง JSON ก้อนแรกออกจากคำตอบโมเดล (ตัด ```fence และข้อความหุ้มออก) */
const parseJson = (raw: string): ExtractedPo => {
  const cleaned = raw.replace(/```(?:json)?/gi, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("AI ไม่ได้ตอบเป็นข้อมูล JSON");
  const obj = JSON.parse(cleaned.slice(start, end + 1));
  if (!Array.isArray(obj.items)) obj.items = [];
  return obj as ExtractedPo;
};

const callOnce = async (base: string, messages: AgentMessage[], signal?: AbortSignal): Promise<string> => {
  const res = await fetch(`${base}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({ model: AI_MODEL, messages, stream: false, temperature: 0.1, max_tokens: 1500 }),
  });
  if (!res.ok) throw new Error(`AI request failed: ${res.status}`);
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? "";
};

/**
 * ส่งภาพเอกสาร + แคตตาล็อกสินค้าให้โมเดลอ่าน แล้วคืนข้อมูล PO ที่สกัดได้
 * @param imageDataUrl ภาพเอกสาร (dataURL)
 * @param catalog รายการสินค้าในระบบ ("id|ชื่อสินค้า" ต่อบรรทัด) ให้โมเดลจับคู่ productId
 * @param suppliers รายชื่อ Supplier ที่ระบบรองรับ
 */
export async function extractPoFromImage(
  imageDataUrl: string,
  catalog: string,
  suppliers: string[],
  packUnits: string[],
  stockUnits: string[],
  signal?: AbortSignal,
): Promise<ExtractedPo> {
  const system = `คุณคือระบบอ่านเอกสารจัดซื้อของคลินิกสัตวแพทย์ หน้าที่: อ่านภาพเอกสาร (ใบสั่งซื้อ/ใบเสนอราคา/ใบส่งของ/ใบแจ้งหนี้) แล้วสกัดข้อมูลเป็น JSON เท่านั้น ห้ามมีข้อความอื่นนอกเหนือจาก JSON

รูปแบบที่ต้องตอบ:
{"supplier":"","poNumber":"","orderDate":"YYYY-MM-DD","expectedDate":"YYYY-MM-DD","deliveryMethod":"","taxType":"exclude|include|none","billDiscount":0,"note":"","items":[{"name":"","qty":1,"unitPrice":0,"packUnit":"","unit":"","discount":0,"lot":"","expiry":"","productId":0}]}

กติกา:
- supplier: เลือกจากรายชื่อนี้ถ้าใกล้เคียง: ${suppliers.join(", ")} — ถ้าไม่ตรงเลยให้ใส่ชื่อที่อ่านได้จากเอกสาร
- poNumber: เลขที่ใบสั่งซื้อที่เอกสารอ้างอิงถึง (เช่น "PO-2569-0028" มักขึ้นต้นด้วย PO) ถ้าเอกสารไม่อ้างถึงใบสั่งซื้อให้เว้น "" (เลขที่ของใบส่งของ/ใบกำกับเองใส่ใน note แทน)
- วันที่แปลงเป็น ค.ศ. รูปแบบ YYYY-MM-DD — ปีไทย (พ.ศ.) ต้องลบ 543 เสมอ เช่น "10 กรกฎาคม 2569" → "2026-07-10", "5 ม.ค. 2568" → "2025-01-05" (ห้ามเดาปีอื่น) ไม่พบให้เว้น ""
- taxType: "exclude" = VAT แยกนอกราคา, "include" = VAT รวมในราคา, "none" = ไม่มี VAT (ไม่แน่ใจใช้ "exclude")
- items: ทุกแถวรายการสินค้าในเอกสาร — qty เป็นจำนวนจากคอลัมน์จำนวนเท่านั้น อย่าเอาขนาดบรรจุในชื่อสินค้ามาใช้ (เช่น "อาหารแมว 2kg จำนวน 15" → qty=15 ไม่ใช่ 2), unitPrice ราคาต่อหน่วย (บาท) — ตรวจทานว่า qty × unitPrice ใกล้เคียงยอดรวมของแถวนั้น
- packUnit: หน่วยที่สั่งซื้อตามเอกสาร (เช่น "10 ถุง" → "ถุง") ให้เลือกคำที่ตรงหรือใกล้เคียงที่สุดจาก: ${packUnits.join(", ")} — ถ้าเอกสารไม่ระบุให้เว้น ""
- unit: หน่วยจ่าย/หน่วยย่อยเข้าคลังถ้าเอกสารระบุ เลือกจาก: ${stockUnits.join(", ")} — ไม่ระบุให้เว้น ""
- discount: ส่วนลดของรายการนั้นเป็นจำนวนเงินบาท (ถ้าเอกสารแสดงเป็น % ให้คำนวณเป็นบาทจากยอดรายการนั้น) ไม่มีใส่ 0
- billDiscount: ส่วนลดท้ายบิล/ส่วนลดรวมของทั้งใบเป็นบาท ถ้ามี (อย่านับซ้ำกับ discount รายรายการ) ไม่มีใส่ 0
- lot: เลข Lot/Batch ของรายการนั้นถ้าเอกสารระบุ ไม่มีเว้น ""
- expiry: วันหมดอายุของรายการนั้นถ้าเอกสารระบุ แปลงเป็น YYYY-MM-DD (พ.ศ. ลบ 543 เช่นกัน) ไม่มีเว้น ""
- productId: จับคู่ชื่อสินค้ากับแคตตาล็อกด้านล่าง ใส่ id เมื่อมั่นใจว่าเป็นตัวเดียวกัน ไม่มั่นใจใส่ 0
- note: ข้อมูลอื่นที่เป็นประโยชน์ (เลขที่เอกสารต้นทาง เงื่อนไขชำระ ฯลฯ) สั้นๆ

แคตตาล็อกสินค้าในระบบ (id|ชื่อ):
${catalog}`;

  const messages: AgentMessage[] = [
    { role: "system", content: system },
    {
      role: "user",
      content: [
        { type: "text", text: "อ่านเอกสารนี้แล้วตอบเป็น JSON ตามรูปแบบที่กำหนด" },
        { type: "image_url", image_url: { url: imageDataUrl } },
      ],
    },
  ];

  let raw: string;
  try { raw = await callOnce(AI_BASE, messages, signal); }
  catch { raw = await callOnce(AI_BASE_BACKUP, messages, signal); }
  return parseJson(raw);
}
