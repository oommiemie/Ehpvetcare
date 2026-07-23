import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Check, CreditCard, Banknote, Smartphone, FileText,
  Printer, BedDouble, Sparkles, Receipt, Shield,
} from "lucide-react";

interface BookingData {
  id: number;
  petName: string;
  species: string;
  breed: string;
  ownerName: string;
  ownerPhone: string;
  photo: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  roomNumber: string;
  dailyRate: number;
  services: string[];
  deposit?: number;
}

export interface PaymentResult {
  method: string;
  totalBeforeVat: number;
  vat: number;
  totalAfterVat: number;
  depositDeducted: number;
  netPayable: number;
  receiptNumber: string;
}

const servicePriceMap: Record<string, number> = {
  "ให้อาหารวันละ 2 มื้อ": 0,
  "ให้อาหารวันละ 3 มื้อ": 150,
  "พาเดินเล่นเช้า-เย็น": 200,
  "อาบน้ำก่อนกลับ": 450,
  "ตัดเล็บ": 150,
  "ให้ยาตามใบสั่งแพทย์": 300,
  "ดูแลพิเศษ 24 ชม.": 800,
};

const paymentMethods = [
  { id: "promptpay", label: "PromptPay", icon: Smartphone, color: "#1e40af" },
  { id: "credit", label: "บัตรเครดิต", icon: CreditCard, color: "#7c3aed" },
  { id: "cash", label: "เงินสด", icon: Banknote, color: "#059669" },
];

export function BoardingPaymentModal({ open, booking, onClose, onComplete }: {
  open: boolean;
  booking: BookingData;
  onClose: () => void;
  onComplete: (result: PaymentResult) => void;
}) {
  const [selectedMethod, setSelectedMethod] = useState("promptpay");
  const [confirmed, setConfirmed] = useState(false);

  // Calculate billing
  const nights = 6; // mock
  const roomTotal = booking.dailyRate * nights;
  const serviceItems = booking.services.map(s => ({
    name: s,
    price: servicePriceMap[s] ?? 200,
  }));
  const servicesTotal = serviceItems.reduce((sum, s) => sum + s.price, 0);
  const subtotal = roomTotal + servicesTotal;
  const vat = Math.round(subtotal * 0.07);
  const totalWithVat = subtotal + vat;
  const deposit = booking.deposit || 0;
  const netPayable = Math.max(0, totalWithVat - deposit);

  const receiptNumber = `RCP-${new Date().getFullYear()}-${String(booking.id).padStart(5, "0")}`;

  const handleConfirm = () => {
    onComplete({
      method: selectedMethod,
      totalBeforeVat: subtotal,
      vat,
      totalAfterVat: totalWithVat,
      depositDeducted: deposit,
      netPayable,
      receiptNumber,
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="w-full max-w-[520px] vet-modal"
              style={{ height: "min(760px, calc(100vh - 2rem))" }}
            >
              {/* Header */}
              <div className="vet-modal-header rounded-t-3xl">
                <div className="pointer-events-none absolute right-[-20px] top-[-30px] w-[120px] h-[120px] opacity-[0.07] rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(139,92,246,1) 0%, transparent 70%)" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="vet-modal-header-icon" style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}>
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="vet-section-title">ชำระค่าบริการฝากเลี้ยง</h2>
                      <p className="vet-tiny mt-[2px]">{booking.petName} · {booking.ownerName}</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="vet-modal-close"><X className="w-4 h-4 text-gray-500" /></button>
                </div>
              </div>

              {/* Body */}
              <div className="vet-modal-body">
                <div className="space-y-[20px]">

                  {/* Bill Breakdown */}
                  <div>
                    <p className="vet-divider">รายละเอียดค่าใช้จ่าย</p>
                    <div className="space-y-2">
                      {/* Room */}
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 rounded-xl bg-(--brand)/10 flex items-center justify-center flex-shrink-0">
                          <BedDouble className="w-4 h-4 text-(--brand)" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-800" style={{ fontWeight: 600 }}>{booking.roomType} ({booking.roomNumber})</p>
                          <p className="text-[10px] text-gray-400">{booking.dailyRate.toLocaleString()} บาท × {nights} คืน</p>
                        </div>
                        <span className="text-xs text-gray-800" style={{ fontWeight: 600 }}>฿{roomTotal.toLocaleString()}</span>
                      </div>

                      {/* Services */}
                      {serviceItems.filter(s => s.price > 0).map((s, i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl">
                          <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-800" style={{ fontWeight: 500 }}>{s.name}</p>
                          </div>
                          <span className="text-xs text-gray-700" style={{ fontWeight: 500 }}>฿{s.price.toLocaleString()}</span>
                        </div>
                      ))}

                      {/* Subtotal / VAT / Total */}
                      <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">ยอดรวมก่อน VAT</span>
                          <span className="text-gray-700" style={{ fontWeight: 500 }}>฿{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">VAT 7%</span>
                          <span className="text-gray-700" style={{ fontWeight: 500 }}>฿{vat.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">ยอดรวม (รวม VAT)</span>
                          <span className="text-gray-800" style={{ fontWeight: 600 }}>฿{totalWithVat.toLocaleString()}</span>
                        </div>
                        {deposit > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-(--brand) flex items-center gap-1"><Shield className="w-3 h-3" /> หักมัดจำ</span>
                            <span className="text-(--brand)" style={{ fontWeight: 500 }}>-฿{deposit.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="border-t border-gray-200 pt-3">
                          <div className="flex justify-between items-end">
                            <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>ยอดชำระสุทธิ</span>
                            <span className="text-2xl text-(--brand)" style={{ fontWeight: 800 }}>฿{netPayable.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <p className="vet-divider">วิธีชำระเงิน</p>
                    <div className="grid grid-cols-3 gap-3">
                      {paymentMethods.map(m => {
                        const Icon = m.icon;
                        const isSelected = selectedMethod === m.id;
                        return (
                          <button key={m.id}
                            onClick={() => setSelectedMethod(m.id)}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                              isSelected ? "border-purple-400 bg-purple-50" : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                              background: isSelected ? `linear-gradient(135deg, ${m.color}, ${m.color}dd)` : "rgba(0,0,0,0.04)",
                            }}>
                              <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-gray-400"}`} />
                            </div>
                            <span className={`text-[11px] ${isSelected ? "text-purple-700" : "text-gray-500"}`}
                              style={{ fontWeight: isSelected ? 600 : 400 }}>{m.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* PromptPay QR (if selected) */}
                  {selectedMethod === "promptpay" && (
                    <div className="flex items-center justify-center py-4 bg-blue-50/50 rounded-xl border border-blue-100">
                      <div className="text-center">
                        <div className="w-24 h-24 mx-auto mb-2 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                          <Smartphone className="w-10 h-10 text-blue-400" />
                        </div>
                        <p className="text-xs text-blue-700" style={{ fontWeight: 600 }}>สแกน PromptPay QR Code</p>
                        <p className="text-[10px] text-blue-400 mt-0.5">฿{netPayable.toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  {/* Receipt info */}
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                    <Receipt className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-400">เลขที่ใบเสร็จ</p>
                      <p className="text-xs text-gray-700" style={{ fontWeight: 600 }}>{receiptNumber}</p>
                    </div>
                    <span className="text-[10px] text-gray-400">รายได้บัญชี "ฝากเลี้ยง"</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="vet-modal-footer">
                <button onClick={onClose} className="vet-btn vet-btn-secondary">ยกเลิก</button>
                <div className="flex items-center gap-2 ml-auto">
                  <button className="vet-btn vet-btn-secondary">
                    <Printer className="w-3.5 h-3.5" /> พิมพ์บิล
                  </button>
                  <button onClick={handleConfirm}
                    className="vet-btn vet-btn-primary btn-green"
                    style={{ background: "linear-gradient(177deg, #8b5cf6, #7c3aed)", boxShadow: "0 4px 14px rgba(139,92,246,0.28)" }}
                  >
                    <Check className="w-4 h-4" /> ยืนยันชำระเงิน ฿{netPayable.toLocaleString()}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
