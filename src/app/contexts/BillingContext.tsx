import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type BillStatus = "open" | "held" | "paid";
export interface BillItem { name: string; qty: number; price: number; }
export interface Bill {
  id: number;
  billNo: string;
  memberId?: number;
  memberName: string;
  items: BillItem[];
  status: BillStatus;
  createdAt: string;      // ISO
  paidAt?: string;        // ISO
  method?: string;        // เงินสด/บัตร/โอน/QR
  receiptNo?: string;
}

export const billTotal = (b: Bill) => b.items.reduce((s, it) => s + it.qty * it.price, 0);

const STORAGE_KEY = "ehp_billing_v1";
const load = (): Bill[] | null => {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? (JSON.parse(r) as Bill[]) : null; } catch { return null; }
};

/* ─── บิลตัวอย่าง (seed) ─── */
const seed = (): Bill[] => {
  const now = new Date().toISOString();
  return [
    { id: 1, billNo: "B-2026-001", memberId: 1, memberName: "สมศักดิ์ ใจดี", status: "open", createdAt: now,
      items: [{ name: "ตรวจร่างกาย", qty: 1, price: 300 }, { name: "วัคซีนรวม DHPP", qty: 1, price: 500 }] },
    { id: 2, billNo: "B-2026-002", memberId: 2, memberName: "วรรณา ศรีสุข", status: "open", createdAt: now,
      items: [{ name: "ทำแผล", qty: 1, price: 250 }, { name: "ยาปฏิชีวนะ (7 วัน)", qty: 1, price: 180 }] },
    { id: 3, billNo: "B-2026-003", memberId: 3, memberName: "ประพันธ์ มงคล", status: "held", createdAt: now,
      items: [{ name: "ตรวจเลือด (CBC)", qty: 1, price: 800 }] },
  ];
};

interface BillingContextType {
  bills: Bill[];
  addBill: (memberName: string, items: BillItem[], memberId?: number) => Bill;
  holdBill: (id: number) => void;
  payBill: (id: number, method: string) => string;   // คืนเลขใบเสร็จ
  getBill: (id: number) => Bill | undefined;
  findByNo: (billNo: string) => Bill | undefined;
}
const BillingContext = createContext<BillingContextType | null>(null);

export function BillingProvider({ children }: { children: ReactNode }) {
  const [bills, setBills] = useState<Bill[]>(() => load() ?? seed());
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(bills)); } catch { /* quota */ } }, [bills]);

  const nextId = () => bills.reduce((m, b) => Math.max(m, b.id), 0) + 1;

  const addBill = (memberName: string, items: BillItem[], memberId?: number) => {
    const id = nextId();
    const bill: Bill = {
      id, billNo: `B-2026-${String(id).padStart(3, "0")}`, memberId, memberName,
      items, status: "open", createdAt: new Date().toISOString(),
    };
    setBills(prev => [...prev, bill]);
    return bill;
  };
  const holdBill = (id: number) => setBills(prev => prev.map(b => b.id === id ? { ...b, status: "held" } : b));
  const payBill = (id: number, method: string) => {
    const receiptNo = `RC-2026-${String(id).padStart(4, "0")}`;
    setBills(prev => prev.map(b => b.id === id ? { ...b, status: "paid", method, paidAt: new Date().toISOString(), receiptNo } : b));
    return receiptNo;
  };
  const getBill = (id: number) => bills.find(b => b.id === id);
  const findByNo = (billNo: string) => bills.find(b => b.billNo.toLowerCase() === billNo.trim().toLowerCase());

  return (
    <BillingContext.Provider value={{ bills, addBill, holdBill, payBill, getBill, findByNo }}>
      {children}
    </BillingContext.Provider>
  );
}

export function useBilling() {
  const c = useContext(BillingContext);
  if (!c) throw new Error("useBilling must be used within BillingProvider");
  return c;
}
