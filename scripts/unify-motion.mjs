/* จัดจังหวะแอนิเมชันให้เป็นระบบเดียว (ดู src/app/config/motion.ts)
   1) ปัด duration เข้าสเกล fast/base/slow/hero
   2) เติม ease ให้ transition ที่ไม่ได้ระบุ — ต้นเหตุที่แอปมีจังหวะ 2 แบบปนกัน
   ยกเว้น: แอนิเมชันวนซ้ำ (repeat), ที่ระบุ ease เองแล้ว, spring, PageLoader */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
const SRC='/Users/oommie/Ehpvetcare/src';
const SKIP=['PageLoader.tsx','config/motion.ts'];
const DRY=process.argv.includes('--dry');
const EASE='[0.22, 1, 0.36, 1]';

const tier = d =>
  d<=0.155 ? 0.15 :
  d<=0.275 ? 0.22 :
  d<=0.455 ? 0.35 :
  d<=0.70  ? 0.5  : null;   // >0.7 = ตกแต่ง/วนซ้ำ ไม่แตะ

const walk=d=>readdirSync(d).flatMap(f=>{const p=join(d,f);return statSync(p).isDirectory()?walk(p):(/\.tsx?$/.test(p)?[p]:[])});
let nDur=0,nEase=0,files=0,skipped=0;

for(const f of walk(SRC)){
  if(SKIP.some(s=>f.endsWith(s))) continue;
  const src=readFileSync(f,'utf8');
  let d=0,e=0;
  // จับ object ของ transition: {{...}} หรือ transition: {...}
  const out=src.replace(/(transition=\{\{|transition:\s*\{)([^{}]*?)(\}\}|\})/g,(m,open,body,close)=>{
    if(!/duration:\s*[\d.]/.test(body)) return m;      // spring / ไม่มี duration
    if(/repeat/.test(body)) { skipped++; return m; }   // วนซ้ำ — EASE ไม่เหมาะ
    let b=body;
    b=b.replace(/duration:\s*([\d.]+)/,(mm,v)=>{
      const t=tier(parseFloat(v));
      if(t===null){ return mm; }
      if(parseFloat(v)!==t) d++;
      return `duration: ${t}`;
    });
    if(!/ease:/.test(b)){
      b=b.replace(/duration:\s*[\d.]+/,mm=>`${mm}, ease: ${EASE}`);
      e++;
    }
    return open+b+close;
  });
  if(out!==src){ if(!DRY) writeFileSync(f,out); files++; nDur+=d; nEase+=e; }
}
console.log(`${DRY?'[ตรวจสอบ] ':''}ไฟล์ ${files} | ปัด duration ${nDur} จุด | เติม ease ${nEase} จุด | ข้าม repeat ${skipped} จุด`);
