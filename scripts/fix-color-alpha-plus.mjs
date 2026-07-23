/* รอบ 2 ของ fix-color-alpha-concat.mjs — จับรูปแบบต่อสตริงด้วย +
     expr + "18"   →   `color-mix(in srgb, ${expr} 9.4%, transparent)`
   เดินถอยหลังจาก + "HH" โดยนับวงเล็บ/วงเล็บเหลี่ยมให้สมดุล
   แล้วหยุดที่ตัวคั่นระดับบนสุด ( , { ( : ? + = ) */

import fs from "node:fs";
import path from "node:path";

const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(e.name)) files.push(p);
  }
})("src");

const pct = hex => {
  const v = Math.round((parseInt(hex, 16) / 255) * 1000) / 10;
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
};

/** หาจุดเริ่มของ expression ที่อยู่ก่อน `+ "HH"` */
function exprStart(s, end) {
  let depth = 0;
  for (let i = end; i >= 0; i--) {
    const c = s[i];
    if (c === ")" || c === "]") depth++;
    else if (c === "(" || c === "[") {
      if (depth === 0) return i + 1;
      depth--;
    } else if (depth === 0 && (c === "," || c === "{" || c === ":" || c === "?" || c === "+" || c === "=" || c === ";" || c === "\n")) {
      return i + 1;
    }
  }
  return 0;
}

let sites = 0;
const report = [];

for (const f of files) {
  let src = fs.readFileSync(f, "utf8");
  let n = 0, guard = 0;
  const RE = /\s*\+\s*"([0-9a-fA-F]{2})"/;
  while (guard++ < 200) {
    const m = RE.exec(src);
    if (!m) break;
    const start = exprStart(src, m.index - 1);
    const expr = src.slice(start, m.index).trim();
    if (!expr) break;
    src = src.slice(0, start) + ` \`color-mix(in srgb, \${${expr}} ${pct(m[1])}%, transparent)\`` + src.slice(m.index + m[0].length);
    n++;
  }
  if (n) {
    fs.writeFileSync(f, src);
    sites += n;
    report.push(`  ${f}  (${n})`);
  }
}

console.log(report.join("\n"));
console.log(`\nแก้ ${sites} จุด`);
