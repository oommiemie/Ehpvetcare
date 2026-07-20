import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const SRC = '/Users/oommie/Ehpvetcare/src';
const walk = d => readdirSync(d).flatMap(f => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : (/\.(tsx|ts|jsx|js)$/.test(p) ? [p] : []);
});
const files = walk(SRC);
const all = files.map(f => readFileSync(f, 'utf8')).join('\n');

const uniq = re => [...new Set([...all.matchAll(re)].map(m => m[1]))]
  .map(Number).filter(n => n > 0).sort((a, b) => a - b);

const texts   = uniq(/text-\[([0-9.]+)px\]/g);
const leads   = uniq(/leading-\[([0-9.]+)px\]/g);
const esc = n => String(n).replace('.', '\\.');

const out = `/* ══════════════════════════════════════════════════════════════
   ขนาดตัวอักษร (เล็ก / กลาง / ใหญ่) — สเกลเฉพาะ "ตัวหนังสือ" เท่านั้น
   padding / margin / ความกว้าง / ไอคอน ไม่ถูกแตะ (ไม่ใช่การซูมหน้าเว็บ)

   ⚠️ ไฟล์นี้ถูก generate — อย่าแก้มือ
   ถ้าเพิ่ม text-[Npx] / leading-[Npx] ค่าใหม่ ให้รัน scripts/gen-fontsize-css.mjs ใหม่

   ทำไมต้อง override: ขนาดฟอนต์ในแอปเขียนเป็น px ตายตัว (text-[12px])
   ซึ่งไม่ขยับตาม root font-size — และการปรับ root font-size จะไปขยาย
   spacing ของ Tailwind (p-4 = 1rem) ด้วย ซึ่งกลายเป็นการซูมทั้งหน้า
   ── กฎในไฟล์นี้อยู่นอก @layer จึงชนะ utility ของ Tailwind ตามลำดับ cascade
   ══════════════════════════════════════════════════════════════ */

:root { --fs: 1; }

/* เอกสารสำหรับพิมพ์ (A4) ต้องคงขนาดจริงเสมอ ไม่ผูกกับค่าที่ผู้ใช้เลือก */
@media print { :root { --fs: 1; } }

/* ── สเกลของ Tailwind เอง (text-xs / text-sm / ...) ── */
:root {
  --text-xs:   calc(0.75rem  * var(--fs));
  --text-sm:   calc(0.875rem * var(--fs));
  --text-base: calc(1rem     * var(--fs));
  --text-lg:   calc(1.125rem * var(--fs));
  --text-xl:   calc(1.25rem  * var(--fs));
  --text-2xl:  calc(1.5rem   * var(--fs));
  --text-3xl:  calc(1.875rem * var(--fs));
  --text-4xl:  calc(2.25rem  * var(--fs));
}

/* ── ขนาดที่เขียนตรง ๆ ในโค้ด: text-[Npx] (${texts.length} ค่า) ── */
${texts.map(n => `.text-\\[${esc(n)}px\\] { font-size: calc(${n}px * var(--fs)); }`).join('\n')}

/* ── line-height ตายตัว: leading-[Npx] (${leads.length} ค่า)
      ต้องสเกลตามด้วย ไม่งั้นตัวอักษรจะซ้อนกันตอนเลือก "ใหญ่" ── */
${leads.map(n => `.leading-\\[${esc(n)}px\\] { line-height: calc(${n}px * var(--fs)); }`).join('\n')}
`;

writeFileSync(join(SRC, 'styles/fontsize.css'), out);
console.log(`text-[Npx]: ${texts.length} ค่า -> ${texts.join(', ')}`);
console.log(`leading-[Npx]: ${leads.length} ค่า`);
