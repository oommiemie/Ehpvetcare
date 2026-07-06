import type { ToolDef } from "./aiClient";

/** ตารางหน้าในระบบ (สำหรับให้ AI นำทางเปิดหน้าได้ทั่วทั้งแอป) */
export const PAGE_ROUTES: Record<string, { path: string; label: string }> = {
  dashboard: { path: "/", label: "แดชบอร์ด" },
  chat: { path: "/chat", label: "แชท" },
  owners: { path: "/owners", label: "เจ้าของสัตว์" },
  pets: { path: "/pets", label: "สัตว์เลี้ยง" },
  visits: { path: "/visits", label: "การตรวจรักษา" },
  appointments: { path: "/appointments", label: "นัดหมาย" },
  schedule: { path: "/schedule", label: "ตารางแพทย์" },
  grooming: { path: "/grooming", label: "บริการอาบน้ำ" },
  boarding: { path: "/boarding", label: "ฝากเลี้ยง" },
  financial: { path: "/financial", label: "การเงิน" },
  retail: { path: "/retail", label: "ร้านค้า" },
  stock: { path: "/stock", label: "สต๊อกสินค้า" },
  ipd: { path: "/ipd", label: "IPD แดชบอร์ด" },
  ward: { path: "/ipd/ward", label: "วอร์ด/กรง" },
  ipd_reports: { path: "/ipd/reports", label: "รายงาน IPD" },
  reports: { path: "/reports", label: "รายงาน" },
  notifications: { path: "/notifications", label: "การแจ้งเตือน" },
  settings: { path: "/settings", label: "ตั้งค่า" },
};

/**
 * นิยาม tools ที่ AI เรียกใช้เพื่ออ่าน/เขียนข้อมูลจริงในแอป EHP VetCare
 * (executor อยู่ในหน้า AIAssistant เพราะต้องใช้ hooks ของ context)
 */
export const APP_TOOLS: ToolDef[] = [
  {
    type: "function",
    function: {
      name: "get_pet",
      description: "ค้นหาข้อมูลสัตว์เลี้ยงจากชื่อ คืนข้อมูลชนิด พันธุ์ น้ำหนัก อายุ ประวัติแพ้ยา โรคประจำตัว วัคซีน และเจ้าของ ใช้เมื่อผู้ใช้ถามถึงคนไข้/สัตว์รายใดรายหนึ่ง",
      parameters: {
        type: "object",
        properties: { name: { type: "string", description: "ชื่อสัตว์เลี้ยง เช่น บัดดี้" } },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_owner",
      description: "ค้นหาข้อมูลเจ้าของสัตว์จากชื่อหรือชื่อเล่น คืนเบอร์โทร ช่องทางติดต่อ และรายชื่อสัตว์เลี้ยง",
      parameters: {
        type: "object",
        properties: { name: { type: "string", description: "ชื่อหรือชื่อเล่นเจ้าของ" } },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_low_stock",
      description: "แสดงรายการสินค้า/ยาที่สต๊อกต่ำกว่าจุดสั่งซื้อ (minStock) หรือหมดสต๊อก ใช้เมื่อถามเรื่องของใกล้หมด/ต้องสั่งซื้อ",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_product",
      description: "ค้นหาสินค้า/ยาจากชื่อ คืนจำนวนคงเหลือ ราคาขาย และหน่วย",
      parameters: {
        type: "object",
        properties: { name: { type: "string", description: "ชื่อสินค้า/ยา" } },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_ipd_status",
      description: "สรุปสถานะผู้ป่วยใน (IPD): จำนวนสัตว์ที่แอดมิตอยู่ กรงว่าง/ไม่ว่างแยกตามวอร์ด ใช้เมื่อถามเรื่องผู้ป่วยใน/เตียงว่าง",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "daily_overview",
      description: "สรุปภาพรวมของคลินิกวันนี้แบบรวบยอด: จำนวนนัดวันนี้ ผู้ป่วยใน/เตียงว่าง สินค้าใกล้หมด และข้อความแชทที่ยังไม่อ่าน ใช้เมื่อถามภาพรวม/สรุปวันนี้/มีอะไรต้องทำบ้าง",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "render_dashboard",
      description: "แสดงผลลัพธ์เป็นแดชบอร์ด (การ์ดตัวเลข + กราฟ) ในคำตอบ ใช้เมื่อผู้ใช้ขอ 'สรุป...เป็นแดชบอร์ด' หรือขอดูสถิติแบบเห็นภาพ เช่น สรุปผู้ป่วยวันนี้ สรุปสต๊อก สรุปนัดหมาย ให้ดึงตัวเลขจากเครื่องมืออื่นก่อน (get_ipd_status, list_low_stock, daily_overview ฯลฯ) แล้วสร้างแดชบอร์ดจากข้อมูลจริง หลังเรียกเครื่องมือนี้ให้พิมพ์สรุปสั้นๆ ต่อท้ายด้วย",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "หัวข้อแดชบอร์ด" },
          subtitle: { type: "string", description: "คำอธิบายสั้นๆ (ไม่บังคับ)" },
          cards: {
            type: "array", description: "การ์ดตัวเลขสรุป (2-6 ใบ)",
            items: {
              type: "object",
              properties: {
                label: { type: "string", description: "ชื่อตัวชี้วัด" },
                value: { type: "string", description: "ค่า เช่น '11 ตัว' หรือ '3'" },
                tone: { type: "string", enum: ["blue", "green", "red", "amber", "purple", "teal"], description: "สีตามความหมาย (แดง=เตือน เขียว=ปกติ)" },
              },
              required: ["label", "value"],
            },
          },
          chart: {
            type: "object", description: "กราฟประกอบ (ไม่บังคับ)",
            properties: {
              type: { type: "string", enum: ["bar", "pie"] },
              data: {
                type: "array",
                items: { type: "object", properties: { name: { type: "string" }, value: { type: "number" } }, required: ["name", "value"] },
              },
            },
          },
        },
        required: ["title", "cards"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "navigate_to",
      description: "เปิด/พาไปยังหน้าต่างๆ ในระบบให้ผู้ใช้ ใช้เมื่อผู้ใช้ขอให้เปิดหน้า/ไปที่หน้าใดหน้าหนึ่ง",
      parameters: {
        type: "object",
        properties: {
          page: {
            type: "string",
            enum: ["dashboard", "chat", "owners", "pets", "visits", "appointments", "schedule", "grooming", "boarding", "financial", "retail", "stock", "ipd", "ward", "ipd_reports", "reports", "notifications", "settings"],
            description: "รหัสหน้าที่จะเปิด",
          },
        },
        required: ["page"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_services",
      description: "แสดงรายการบริการของคลินิกและราคา (เช่น ตรวจ ผ่าตัด ทำหมัน) ใช้เมื่อถามเรื่องบริการ/ค่าบริการ",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "check_boarding",
      description: "ตรวจสอบห้องฝากเลี้ยง (Boarding) ว่ามีห้องว่างกี่ห้อง ห้องไหนว่าง ใช้เมื่อถามเรื่องที่พัก/ฝากเลี้ยงว่าง",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "book_boarding",
      description: "จองห้องฝากเลี้ยงให้สัตว์ (จะมีหน้าต่างให้ยืนยันก่อนจริง) ระบุชื่อสัตว์ และรหัสห้อง หรือปล่อยว่างเพื่อให้เลือกห้องว่างห้องแรกให้",
      parameters: {
        type: "object",
        properties: {
          petName: { type: "string", description: "ชื่อสัตว์ที่จะเข้าพัก" },
          roomId: { type: "string", description: "รหัสห้อง (ถ้าไม่ระบุจะเลือกห้องว่างห้องแรก)" },
        },
        required: ["petName"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_appointments",
      description: "ดูรายการนัดหมายของวันที่กำหนด (เลขวันในเดือน 1-31) ถ้าไม่ระบุจะเป็นวันนี้ ใช้เมื่อถามว่ามีนัดวันไหน/กี่ราย",
      parameters: {
        type: "object",
        properties: { day: { type: "number", description: "เลขวันในเดือน 1-31 (เว้นว่าง = วันนี้)" } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_appointment",
      description: "สร้างนัดหมายใหม่ (จะมีหน้าต่างให้ผู้ใช้ยืนยันก่อนบันทึกจริง) ใช้เมื่อผู้ใช้ต้องการนัด/นัดติดตามอาการ",
      parameters: {
        type: "object",
        properties: {
          petName: { type: "string", description: "ชื่อสัตว์เลี้ยง" },
          day: { type: "number", description: "เลขวันในเดือน 1-31" },
          time: { type: "string", description: "เวลา รูปแบบ HH:MM เช่น 10:00" },
          type: { type: "string", enum: ["การรักษา", "วัคซีน", "อาบน้ำ", "ฝากเลี้ยง"], description: "ประเภทนัด" },
          vet: { type: "string", description: "ชื่อสัตวแพทย์ (ไม่บังคับ)" },
        },
        required: ["petName", "day", "time"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "save_to_record",
      description: "บันทึกสรุป/บันทึกทางคลินิกลงในเวชระเบียนของสัตว์ (จะมีหน้าต่างให้ยืนยันก่อนบันทึก) ใช้เมื่อผู้ใช้ต้องการเก็บสรุปเคส/ผลตรวจลงประวัติสัตว์",
      parameters: {
        type: "object",
        properties: {
          petName: { type: "string", description: "ชื่อสัตว์เลี้ยง" },
          note: { type: "string", description: "เนื้อหาที่จะบันทึก (สรุปเคส/ผลตรวจ/แผนการรักษา)" },
          diagnosis: { type: "string", description: "การวินิจฉัย (ไม่บังคับ)" },
        },
        required: ["petName", "note"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_member",
      description: "ค้นหาสมาชิก/ลูกค้า (เจ้าของสัตว์) จากชื่อ ชื่อเล่น หรือเบอร์โทร คืนรายชื่อที่ตรง ใช้เมื่อจะเปิดบิล/หาลูกค้า",
      parameters: {
        type: "object",
        properties: { query: { type: "string", description: "ชื่อ/ชื่อเล่น/เบอร์โทร" } },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_bills",
      description: "แสดงรายการบิล กรองตามสถานะได้ (open=ค้างชำระ, held=พักบิล, paid=ชำระแล้ว) ใช้เมื่อถามเรื่องบิล/รายการค้างชำระ/บิลที่พักไว้",
      parameters: {
        type: "object",
        properties: { status: { type: "string", enum: ["open", "held", "paid", "all"], description: "สถานะบิล (ไม่ระบุ=ทั้งหมด)" } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_bill",
      description: "เปิดบิลใหม่ให้สมาชิก (มีหน้าต่างยืนยันก่อน) ระบุชื่อสมาชิกและรายการสินค้า/บริการพร้อมราคา",
      parameters: {
        type: "object",
        properties: {
          member: { type: "string", description: "ชื่อสมาชิก/ลูกค้า" },
          items: {
            type: "array", description: "รายการในบิล",
            items: { type: "object", properties: { name: { type: "string" }, qty: { type: "number" }, price: { type: "number", description: "ราคาต่อหน่วย (บาท)" } }, required: ["name", "price"] },
          },
        },
        required: ["member", "items"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "hold_bill",
      description: "พักบิล (พักไว้ก่อน ยังไม่ชำระ) ระบุเลขบิล เช่น B-2026-001 (มีหน้าต่างยืนยัน)",
      parameters: {
        type: "object",
        properties: { billNo: { type: "string", description: "เลขบิล" } },
        required: ["billNo"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "pay_bill",
      description: "รับชำระเงินบิลและออกใบเสร็จ (มีหน้าต่างยืนยันก่อน) ระบุเลขบิลและวิธีชำระ",
      parameters: {
        type: "object",
        properties: {
          billNo: { type: "string", description: "เลขบิล" },
          method: { type: "string", enum: ["เงินสด", "บัตร", "โอน", "QR"], description: "วิธีชำระเงิน" },
        },
        required: ["billNo"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_receipt",
      description: "แสดงบิล/ใบเสร็จของเลขบิลที่ระบุ (รายการ ยอดรวม สถานะ) เป็นการ์ดใบเสร็จ",
      parameters: {
        type: "object",
        properties: { billNo: { type: "string", description: "เลขบิล" } },
        required: ["billNo"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "message_owner",
      description: "ส่งข้อความถึงเจ้าของสัตว์ผ่านระบบแชทของคลินิก (จะมีหน้าต่างให้ผู้ใช้ยืนยันก่อนส่งจริง) ใช้เมื่อผู้ใช้ต้องการแจ้ง/ติดตาม/เตือนเจ้าของ ให้ร่างข้อความที่สุภาพและชัดเจน",
      parameters: {
        type: "object",
        properties: {
          owner: { type: "string", description: "ชื่อหรือชื่อเล่นเจ้าของที่จะส่งถึง" },
          message: { type: "string", description: "เนื้อความที่จะส่ง (ภาษาไทย สุภาพ กระชับ)" },
        },
        required: ["owner", "message"],
      },
    },
  },
];

/** ส่วนเสริม system prompt ที่บอก AI ว่ามี tools อะไรและควรใช้เมื่อไหร่ */
export const TOOLS_SYSTEM_HINT = `คุณสามารถเรียกใช้เครื่องมือเพื่อเข้าถึงข้อมูลจริงในระบบคลินิกได้ เช่น ข้อมูลสัตว์/เจ้าของ สต๊อกยา สถานะผู้ป่วยใน และส่งข้อความถึงเจ้าของ
- เมื่อผู้ใช้ถามข้อมูลเฉพาะของคลินิก (คนไข้ เจ้าของ สต๊อก ผู้ป่วยใน) ให้เรียกเครื่องมือก่อนเสมอ อย่าเดาข้อมูลเอง
- ถ้าเครื่องมือคืนว่าไม่พบข้อมูล ให้บอกผู้ใช้ตามจริง
- เมื่อจะส่งข้อความถึงเจ้าของ สร้างนัด หรือบันทึกลงเวชระเบียน ให้เตรียมข้อมูลให้เรียบร้อยแล้วเรียกเครื่องมือ (ระบบจะถามผู้ใช้ยืนยันก่อนดำเนินการจริงเสมอ)
- ก่อนสร้างนัดหรือบันทึกเวชระเบียน ควรมีชื่อสัตว์ที่ชัดเจน หากไม่แน่ใจให้เรียก get_pet ตรวจสอบก่อน
- เมื่อผู้ใช้ขอให้ "เปิดหน้า" หรือ "ไปที่" ส่วนใดของระบบ ให้เรียก navigate_to
- เมื่อถามภาพรวม/สรุปวันนี้ ให้เรียก daily_overview
- เมื่อผู้ใช้ขอให้ "สรุปเป็นแดชบอร์ด" หรือขอดูสถิติแบบเห็นภาพ ให้ดึงข้อมูลจริงจากเครื่องมือที่เกี่ยวข้องก่อน แล้วเรียก render_dashboard เพื่อวาดการ์ด/กราฟ (อย่าตอบเป็นข้อความล้วน)
- งานบิล/ชำระเงิน: หาลูกค้าด้วย search_member, ดูบิลด้วย list_bills, เปิดบิลด้วย create_bill, พักบิลด้วย hold_bill, รับชำระด้วย pay_bill, ดูใบเสร็จด้วย get_receipt — ทุกการเขียนจะมีหน้าต่างให้ผู้ใช้ยืนยันก่อน ควรอ้างอิงด้วยเลขบิล (เช่น B-2026-001)
หมายเหตุ: ข้อมูลรายได้และรายการตรวจ (visits) ยังไม่เชื่อมกับเครื่องมือ หากถูกถามให้แจ้งว่ายังดูจากส่วนนั้นในแอปโดยตรง`;
