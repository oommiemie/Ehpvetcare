import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
const SRC = '/Users/oommie/Ehpvetcare/src';
const DRY = process.argv.includes('--dry');
const walk = d => readdirSync(d).flatMap(f => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : (/\.(tsx|ts)$/.test(p) ? [p] : []);
});

// ช่วงที่ห้ามแตะ: tick={{...}} ของ recharts (เป็น SVG attribute — calc() ใช้ไม่ได้)
const guarded = src => {
  const spans = [];
  for (const m of src.matchAll(/\btick=\{\{[^}]*\}\}/g)) spans.push([m.index, m.index + m[0].length]);
  return i => spans.some(([a, b]) => i >= a && i < b);
};

const scale = (val, unit) => `"calc(${val}${unit} * var(--fs))"`;
let totF = 0, totL = 0, files = 0, skipped = 0;

for (const f of walk(SRC)) {
  const src = readFileSync(f, 'utf8');
  const inGuard = guarded(src);
  let nF = 0, nL = 0;

  let out = src.replace(
    /\b(fontSize|lineHeight)\s*:\s*(?:([0-9]+(?:\.[0-9]+)?)\b(?!\s*\*)|"([0-9]+(?:\.[0-9]+)?)(px|rem|em)")/g,
    (m, prop, bare, quoted, unit, off) => {
      if (inGuard(off)) { skipped++; return m; }
      // lineHeight ที่เป็นตัวเลขล้วน = unitless (เช่น 1.2) ขยายตามฟอนต์อยู่แล้ว ไม่ต้องแตะ
      if (prop === 'lineHeight' && bare !== undefined) return m;
      prop === 'fontSize' ? nF++ : nL++;
      return `${prop}: ${bare !== undefined ? scale(bare, 'px') : scale(quoted, unit)}`;
    }
  );

  if (out !== src) {
    if (!DRY) writeFileSync(f, out);
    files++; totF += nF; totL += nL;
  }
}
console.log(`${DRY ? '[ตรวจสอบ] ' : ''}ไฟล์ ${files} | fontSize ${totF} | lineHeight(px) ${totL} | ข้าม recharts tick ${skipped}`);
