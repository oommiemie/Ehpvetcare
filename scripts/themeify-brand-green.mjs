/* กวาดแบรนด์เขียว hardcode (#19a589/#0d7c66 + rgba เทียบเท่า) → CSS vars ตามธีม
   ธีม teal เดิมค่า var ตรงกับสีเก่าเป๊ะ = ธีมเดิมไม่เปลี่ยนโดยนิยาม

   ข้อยกเว้น:
   - DisplayContext.tsx (ตารางนิยามธีม — ต้องเป็นค่าจริง)
   - config/nav.ts (สี accent รายเมนู)
   - บรรทัด PIE_COLORS/TONE_COLORS (พาเลตต์กราฟ — สีข้อมูล ไม่ใช่แบรนด์)
   - บรรทัดนิยาม --brand ใน theme.css (กันอ้างตัวเอง)
   - heroFilter.ts (template literal — แก้มือแยก) */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
const SRC = '/Users/oommie/Ehpvetcare/src';
const DRY = process.argv.includes('--dry');
const SKIP_FILES = ['contexts/DisplayContext.tsx', 'config/nav.ts', 'utils/heroFilter.ts'];
const SKIP_LINE = /PIE_COLORS|TONE_COLORS|^\s*--brand(-dark)?:\s*#/;

const pct = a => Math.round(parseFloat(a) * 100);
const hexPct = h => Math.round(parseInt(h, 16) / 255 * 100);
const stats = {};
const bump = k => { stats[k] = (stats[k] || 0) + 1; };

const transformLine = (line) => {
  if (SKIP_LINE.test(line)) return line;
  let s = line;
  // 1) className 8 หลัก (มี alpha): bg-[#19a58922] → bg-(--brand)/13
  s = s.replace(/\[#19a589([0-9a-fA-F]{2})\]/g, (_, a) => { bump('class+alpha'); return `(--brand)/${hexPct(a)}`; });
  s = s.replace(/\[#0d7c66([0-9a-fA-F]{2})\]/g, (_, a) => { bump('class+alpha'); return `(--brand-dark)/${hexPct(a)}`; });
  // 2) className 6 หลัก: text-[#19a589] → text-(--brand)  (Tailwind v4 var shorthand)
  s = s.replace(/\[#19a589\]/g, () => { bump('class'); return '(--brand)'; });
  s = s.replace(/\[#0d7c66\]/g, () => { bump('class'); return '(--brand-dark)'; });
  // 3) rgba ใน arbitrary class (นำหน้าด้วย _ — ห้ามมีช่องว่าง): ใช้ color-mix แบบ underscore
  s = s.replace(/_rgba\(25,\s*165,\s*137,\s*([\d.]+)\)/g, (_, a) => { bump('class-rgba'); return `_color-mix(in_srgb,var(--brand)_${pct(a)}%,transparent)`; });
  s = s.replace(/_rgba\(13,\s*124,\s*102,\s*([\d.]+)\)/g, (_, a) => { bump('class-rgba'); return `_color-mix(in_srgb,var(--brand-dark)_${pct(a)}%,transparent)`; });
  // 4) rgba ใน style/css ปกติ
  s = s.replace(/rgba\(25,\s*165,\s*137,\s*([\d.]+)\)/g, (_, a) => { bump('style-rgba'); return `color-mix(in srgb, var(--brand) ${pct(a)}%, transparent)`; });
  s = s.replace(/rgba\(13,\s*124,\s*102,\s*([\d.]+)\)/g, (_, a) => { bump('style-rgba'); return `color-mix(in srgb, var(--brand-dark) ${pct(a)}%, transparent)`; });
  // 5) hex + alpha ใน style string: #19a58933 → color-mix 20%
  s = s.replace(/#19a589([0-9a-fA-F]{2})(?![0-9a-fA-F])/g, (_, a) => { bump('hex+alpha'); return `color-mix(in srgb, var(--brand) ${hexPct(a)}%, transparent)`; });
  s = s.replace(/#0d7c66([0-9a-fA-F]{2})(?![0-9a-fA-F])/g, (_, a) => { bump('hex+alpha'); return `color-mix(in srgb, var(--brand-dark) ${hexPct(a)}%, transparent)`; });
  // 6) hex เพียว
  s = s.replace(/#19a589/g, () => { bump('hex'); return 'var(--brand)'; });
  s = s.replace(/#0d7c66/g, () => { bump('hex'); return 'var(--brand-dark)'; });
  return s;
};

const walk = d => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : (/\.(tsx?|css)$/.test(p) ? [p] : []); });
let files = 0;
for (const f of walk(SRC)) {
  if (SKIP_FILES.some(s => f.endsWith(s))) continue;
  const src = readFileSync(f, 'utf8');
  const out = src.split('\n').map(transformLine).join('\n');
  if (out !== src) { files++; if (!DRY) writeFileSync(f, out); }
}
console.log(`${DRY ? '[ตรวจสอบ] ' : ''}ไฟล์ ${files} |`, Object.entries(stats).map(([k, v]) => `${k}: ${v}`).join(' | '));
