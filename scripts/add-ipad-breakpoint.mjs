/* เติม md: ให้ grid ที่ข้ามจาก sm: ไป lg: — iPad แนวตั้ง (768–1023px) จะได้ใช้พื้นที่เต็มขึ้น
   เว้น QuickShortcuts ไว้ (6 ช่อง/แถวอ่านง่ายกว่า 8 ที่ความกว้างนี้) */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
const SRC='/Users/oommie/Ehpvetcare/src';
const SKIP=['QuickShortcuts.tsx'];
const RULES={ '2|3':3, '2|4':3, '3|6':4, '3|4':4 };
const walk=d=>readdirSync(d).flatMap(f=>{const p=join(d,f);return statSync(p).isDirectory()?walk(p):(/\.tsx$/.test(p)?[p]:[])});
let n=0, files=0; const log=[];
for(const f of walk(SRC)){
  if (SKIP.some(s=>f.endsWith(s))) continue;
  const src=readFileSync(f,'utf8');
  let k=0;
  const out=src.replace(/(grid-cols-\d+ +)(sm:grid-cols-(\d+) +)(lg:grid-cols-(\d+))/g,
    (m,base,smPart,sm,lgPart,lg)=>{
      const md=RULES[`${sm}|${lg}`];
      if(!md) return m;
      k++; log.push(`${f.replace(SRC+'/','')}  sm:${sm} → md:${md} → lg:${lg}`);
      return `${base}${smPart}md:grid-cols-${md} ${lgPart}`;
    });
  if(out!==src){ writeFileSync(f,out); files++; n+=k; }
}
console.log(`แก้ ${files} ไฟล์ ${n} จุด\n`);
log.forEach(l=>console.log(' ',l));
