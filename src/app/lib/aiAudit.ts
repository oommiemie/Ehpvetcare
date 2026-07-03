/**
 * บันทึกการใช้งาน AI (audit log) — เก็บว่า AI เรียกเครื่องมือ/ทำ action อะไรบ้าง
 * เก็บใน localStorage (เก็บล่าสุด 200 รายการ) จำเป็นสำหรับระบบการแพทย์เพื่อตรวจสอบย้อนหลัง
 */
export interface AuditEntry { ts: number; tool: string; args: Record<string, unknown>; result: string; }
const KEY = "ehp_ai_audit_v1";
const MAX = 200;

export function logAudit(tool: string, args: Record<string, unknown>, result: string) {
  try {
    const arr = getAudit();
    arr.push({ ts: Date.now(), tool, args, result: result.slice(0, 300) });
    localStorage.setItem(KEY, JSON.stringify(arr.slice(-MAX)));
  } catch { /* quota */ }
}

export function getAudit(): AuditEntry[] {
  try { const r = localStorage.getItem(KEY); return r ? (JSON.parse(r) as AuditEntry[]) : []; } catch { return []; }
}
