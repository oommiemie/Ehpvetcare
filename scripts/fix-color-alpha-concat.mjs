/* ─────────────────────────────────────────────────────────────
   แก้บั๊ก: ต่อ hex alpha ท้ายค่าสีที่เป็น CSS variable

   ปัญหา
     style={{ background: `linear-gradient(135deg, ${c}, ${c}cc)` }}
     ถ้า c = "#ef4444"      → "#ef4444cc"        ✅ ใช้ได้
     ถ้า c = "var(--brand)" → "var(--brand)cc"   ❌ พังเงียบ ๆ

   เพราะ declaration ที่มี var() จะผ่าน parser ไปก่อน แล้วค่อยแทนค่า
   ทีหลัง พอแทนแล้วไม่ถูกต้อง CSS spec บังคับให้เป็น "unset"
   (IACVT) ไม่ใช่ตกไปใช้ค่าจาก class — และ inline style ชนะ class เสมอ
   ผลคือ background หาย (transparent) / box-shadow หาย แบบไม่มี error

   วิธีแก้
     `${c}cc`  →  `color-mix(in srgb, ${c} 80%, transparent)`
   ให้ผลเหมือนเดิมทุกประการเมื่อ c เป็น hex และใช้งานได้กับ var() ด้วย
   ───────────────────────────────────────────────────────────── */

import fs from "node:fs";
import path from "node:path";

const ROOT = "src";
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(e.name)) files.push(p);
  }
})(ROOT);

/* hex alpha → เปอร์เซ็นต์ (ทศนิยม 1 ตำแหน่ง, ตัด .0 ทิ้ง) */
const pct = hex => {
  const v = Math.round((parseInt(hex, 16) / 255) * 1000) / 10;
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
};

/* ${...} ตามด้วย hex 2 ตัว — กันหน่วย CSS (px/%/s/deg…) ด้วย negative lookahead */
const RE = /\$\{([^}]+)\}([0-9a-fA-F]{2})(?![0-9a-zA-Z_%.])/g;

let touched = 0, sites = 0;
const report = [];

for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  let n = 0;
  const out = src.replace(RE, (m, expr, hex) => {
    n++;
    return `color-mix(in srgb, \${${expr}} ${pct(hex)}%, transparent)`;
  });
  if (n) {
    fs.writeFileSync(f, out);
    touched++; sites += n;
    report.push(`  ${f}  (${n})`);
  }
}

console.log(report.join("\n"));
console.log(`\nแก้ ${sites} จุด ใน ${touched} ไฟล์`);
