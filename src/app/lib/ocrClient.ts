/**
 * OCR / สกัดข้อความจากเอกสาร (pdf-ocr-mcp ของ BMS Cloud, Thai-tuned)
 * CORS เปิด (*) ไม่ต้องใช้ key
 */
export const OCR_BASE = import.meta.env.VITE_OCR_BASE ?? "https://pdf-ocr-mcp.bmscloud.in.th/api";

/** สกัดข้อความจากไฟล์ (PDF ใช้ hybrid extract, รูปใช้ OCR) คืนข้อความล้วน */
export async function extractText(file: File): Promise<string> {
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  const fd = new FormData();
  fd.append("file", file);
  const url = isPdf
    ? `${OCR_BASE}/pdf_extract/upload`   // typed PDF ฟรี + OCR เฉพาะหน้าที่สแกน
    : `${OCR_BASE}/ocr_image/upload`;    // OCR รูปภาพ (typhoon backend, ไทย)

  const res = await fetch(url, { method: "POST", body: fd });
  if (!res.ok) throw new Error(`OCR failed: ${res.status}`);
  const json = await res.json();
  return (json.text ?? json.result ?? "").trim();
}
