/**
 * อ่านเอกสาร LAB ด้วย AI vision —  2 งาน
 *   1) extractLabOrderFromImage  — อ่าน "ใบสั่งตรวจ" → รายการ profile/item ที่จะสั่ง
 *   2) extractLabResultsFromImage — อ่าน "ใบรายงานผล" → ค่าผลตรวจของแต่ละรายการ
 * ใช้โมเดลเดียวกับหมอเหมียว (vLLM multimodal) · แนบภาพ png/jpg/jpeg
 */
import { AI_BASE, AI_BASE_BACKUP, AI_MODEL, type AgentMessage } from "./aiClient";

/* ── ดึง JSON ก้อนแรกออกจากคำตอบโมเดล ── */
function parseJsonObj(raw: string): any {
  const cleaned = raw.replace(/```(?:json)?/gi, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("AI ไม่ได้ตอบเป็นข้อมูล JSON");
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function callOnce(base: string, messages: AgentMessage[], signal?: AbortSignal): Promise<string> {
  const res = await fetch(`${base}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({ model: AI_MODEL, messages, stream: false, temperature: 0.1, max_tokens: 1500 }),
  });
  if (!res.ok) throw new Error(`AI request failed: ${res.status}`);
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? "";
}

async function callWithFallback(messages: AgentMessage[], signal?: AbortSignal): Promise<string> {
  try { return await callOnce(AI_BASE, messages, signal); }
  catch { return await callOnce(AI_BASE_BACKUP, messages, signal); }
}

/* ═══════════════ 1) อ่านใบสั่งตรวจ LAB ═══════════════ */
export interface ExtractedLabOrder {
  profiles: string[];   // ชื่อ profile ที่จับคู่กับรายการในระบบได้
  items: string[];      // ชื่อ lab item ที่จับคู่ได้
}

export async function extractLabOrderFromImage(
  imageDataUrl: string,
  profileList: string[],
  itemList: string[],
  signal?: AbortSignal,
): Promise<ExtractedLabOrder> {
  const system = `คุณคือระบบอ่านใบสั่งตรวจแล็บของคลินิกสัตวแพทย์ หน้าที่: อ่านภาพเอกสาร แล้วสกัด "รายการที่ต้องการตรวจ" เป็น JSON เท่านั้น ห้ามมีข้อความอื่น

รูปแบบที่ต้องตอบ:
{"profiles":[],"items":[]}

กติกา:
- profiles: ชุดตรวจ/แพ็กเกจ (เช่น CBC, Liver Function Test) — เลือกจากรายการนี้เท่านั้นเมื่อชื่อตรงหรือใกล้เคียงมาก: ${profileList.join(", ")}
- items: รายการตรวจย่อยเดี่ยว ๆ (เช่น WBC Count, BUN) — เลือกจากรายการนี้เท่านั้นเมื่อตรงหรือใกล้เคียงมาก: ${itemList.join(", ")}
- ถ้าเอกสารมีชื่อที่ตรงกับ "profiles" ให้ใส่ใน profiles; ถ้าตรงกับ item เดี่ยวให้ใส่ items
- ห้ามแต่งชื่อขึ้นเอง — ตอบเฉพาะชื่อที่มีในรายการด้านบนแบบสะกดตรงเป๊ะ
- ไม่พบรายการที่ตรงเลย ให้ตอบ {"profiles":[],"items":[]}`;

  const messages: AgentMessage[] = [
    { role: "system", content: system },
    { role: "user", content: [
      { type: "text", text: "อ่านใบสั่งตรวจนี้แล้วตอบเป็น JSON ตามรูปแบบ" },
      { type: "image_url", image_url: { url: imageDataUrl } },
    ] },
  ];
  const obj = parseJsonObj(await callWithFallback(messages, signal));
  const norm = (arr: unknown, pool: string[]): string[] => {
    if (!Array.isArray(arr)) return [];
    /* ยอมรับเฉพาะชื่อที่มีในรายการจริง (กันโมเดลแต่งชื่อ) — เทียบไม่สนตัวพิมพ์/ช่องว่าง */
    const key = (s: string) => s.toLowerCase().replace(/\s+/g, "");
    return arr
      .map(x => pool.find(p => key(p) === key(String(x))))
      .filter((x): x is string => !!x);
  };
  return { profiles: norm(obj.profiles, profileList), items: norm(obj.items, itemList) };
}

/* ═══════════════ 2) อ่านใบรายงานผล LAB ═══════════════ */
export interface ExtractedLabResult { name: string; value: string; unit?: string; ref?: string; }

export async function extractLabResultsFromImage(
  imageDataUrl: string,
  orderedNames: string[],
  signal?: AbortSignal,
): Promise<ExtractedLabResult[]> {
  const system = `คุณคือระบบอ่านใบรายงานผลแล็บของคลินิกสัตวแพทย์ หน้าที่: อ่านภาพเอกสาร แล้วสกัด "ค่าผลตรวจ" ของแต่ละรายการเป็น JSON เท่านั้น ห้ามมีข้อความอื่น

รูปแบบที่ต้องตอบ:
{"results":[{"name":"","value":"","unit":"","ref":""}]}

กติกา:
- อ่านค่าผลตรวจของรายการเหล่านี้ที่แพทย์สั่งไว้ (ถ้าเอกสารมี): ${orderedNames.join(", ")}
- name: ชื่อรายการ — ให้สะกดตรงกับชื่อที่สั่งไว้ด้านบนถ้าเป็นตัวเดียวกัน (เช่น "Total RBC", "WBC")
- value: ค่าผลตรวจ (ตัวเลขหรือข้อความ เช่น "5.2", "Positive") — เอาเฉพาะค่า ไม่รวมหน่วย
- unit: หน่วย เช่น "x10^6/µL", "%" ถ้าเอกสารระบุ ไม่มีเว้น ""
- ref: ค่าอ้างอิง/ช่วงปกติ เช่น "5.5-8.5" ถ้าเอกสารระบุ ไม่มีเว้น ""
- ตอบทุกรายการที่อ่านค่าได้จากเอกสาร แม้ไม่อยู่ในรายการที่สั่งไว้ก็ได้ (ระบบจะจับคู่ตามลำดับ)
- อ่านไม่ได้เลยให้ตอบ {"results":[]}`;

  const messages: AgentMessage[] = [
    { role: "system", content: system },
    { role: "user", content: [
      { type: "text", text: "อ่านใบรายงานผลนี้แล้วตอบค่าผลตรวจเป็น JSON ตามรูปแบบ" },
      { type: "image_url", image_url: { url: imageDataUrl } },
    ] },
  ];
  const obj = parseJsonObj(await callWithFallback(messages, signal));
  if (!Array.isArray(obj.results)) return [];
  return obj.results
    .filter((r: any) => r && (r.value ?? "") !== "")
    .map((r: any) => ({ name: String(r.name ?? ""), value: String(r.value ?? ""), unit: r.unit ? String(r.unit) : undefined, ref: r.ref ? String(r.ref) : undefined }));
}
