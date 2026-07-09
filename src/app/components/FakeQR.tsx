/* QR จำลอง (deterministic ตาม payload) — ใช้แสดงบนหน้าจอชำระเงิน/ใบเสร็จ */
export function FakeQR({ text, size = 168 }: { text: string; size?: number }) {
  const n = 25, cell = size / n;
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  const rnd = (i: number) => { const x = Math.sin(h + i * 97.13) * 43758.5453; return x - Math.floor(x); };
  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const corner = (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
    let on: boolean;
    if (corner) {
      const fx = x < 7 ? x : x - (n - 7), fy = y < 7 ? y : y - (n - 7);
      on = (fx === 0 || fx === 6 || fy === 0 || fy === 6) || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4);
    } else on = rnd(y * n + x) > 0.52;
    if (on) cells.push({ x, y });
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: 12 }}>
      <rect width={size} height={size} fill="#fff" />
      {cells.map((c, i) => <rect key={i} x={c.x * cell} y={c.y * cell} width={cell} height={cell} fill="#0f172a" />)}
    </svg>
  );
}
