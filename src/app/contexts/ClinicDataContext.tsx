import React, { createContext, useContext, useState, useMemo } from "react";

// ─── Shared Types ──────────────────────────────────────────────────
export interface Drug {
  id: number; code: string; name: string; genericName: string;
  category: string; unit: string; costPrice: number; sellPrice: number;
  minStock: number; active: boolean;
}
export interface ServiceItem {
  id: number; code: string; name: string; category: string; price: number; active: boolean;
}
export interface StockProduct {
  id: number; code: string; name: string; barcode: string;
  category: string; categoryEmoji: string; type: "stock" | "nostock";
  sellPrice: number; costPrice: number; unit: string;
  stock: number; minStock: number; maxStock: number;
  location: string; supplier: string; image: string; note: string; active: boolean;
  usage?: string;   // วิธีใช้ตั้งต้น (แสดงในร้านค้า/ตะกร้า) — แก้ที่ตัวสินค้า
}

export interface BoardingRoom {
  id: string;
  type: string;
  status: "ว่าง" | "ไม่ว่าง" | "ซ่อมบำรุง";
  petName?: string;
  zone?: string;
  floor?: string;
  sizeSqm?: number;
  maxCapacity?: number;
  suitableFor?: string;
  pricePerNight?: number;
  longStayDiscount?: number;
  minDeposit?: number;
  amenities?: string[];
  photo?: string;
  notes?: string;
}

// ─── Initial Data (single source of truth) ────────────────────────
export const INIT_DRUGS: Drug[] = [
  { id:1, code:"D001", name:"อะม็อกซิซิลลิน 250mg",      genericName:"Amoxicillin",    category:"ยาปฏิชีวนะ",     unit:"แผง",    costPrice:85,  sellPrice:120, minStock:10, active:true  },
  { id:2, code:"D002", name:"เพรดนิโซโลน 5mg",            genericName:"Prednisolone",   category:"สเตียรอยด์",     unit:"แผง",    costPrice:55,  sellPrice:80,  minStock:5,  active:true  },
  { id:3, code:"D003", name:"เมโทรนิดาโซล 200mg",         genericName:"Metronidazole",  category:"ยาปฏิชีวนะ",     unit:"แผง",    costPrice:60,  sellPrice:90,  minStock:10, active:true  },
  { id:4, code:"D004", name:"ด็อกซีไซคลิน 100mg",         genericName:"Doxycycline",    category:"ยาปฏิชีวนะ",     unit:"แคปซูล", costPrice:140, sellPrice:200, minStock:20, active:true  },
  { id:5, code:"D005", name:"เมล็อกซิแคม 1mg/ml",         genericName:"Meloxicam",      category:"ยาแก้ปวด NSAID", unit:"ขวด",    costPrice:250, sellPrice:350, minStock:5,  active:true  },
  { id:6, code:"D006", name:"ฟูโรเซไมด์ 40mg",            genericName:"Furosemide",     category:"ยาขับปัสสาวะ",   unit:"แผง",    costPrice:40,  sellPrice:60,  minStock:10, active:true  },
  { id:7, code:"D007", name:"เอนโรฟลอกซาซิน 50mg",        genericName:"Enrofloxacin",   category:"ยาปฏิชีวนะ",     unit:"เม็ด",   costPrice:180, sellPrice:250, minStock:20, active:false },
];

export const INIT_SERVICES: ServiceItem[] = [
  { id:1, code:"SV001", name:"ค่าตรวจ",                    category:"ทั่วไป",    price:300,  active:true },
  { id:2, code:"SV002", name:"ตรวจเลือด CBC",               category:"แล็บ",      price:450,  active:true },
  { id:3, code:"SV003", name:"ชีวเคมีในเลือด",              category:"แล็บ",      price:600,  active:true },
  { id:4, code:"SV004", name:"เอกซเรย์ทรวงอก",             category:"เอกซเรย์",  price:800,  active:true },
  { id:5, code:"SV005", name:"น้ำเกลือ IV",                 category:"การรักษา",  price:250,  active:true },
  { id:6, code:"SV006", name:"ค่าพักรักษา/วัน",             category:"วอร์ด",     price:500,  active:true },
  { id:7, code:"SV007", name:"ผ่าตัดทำหมัน (ตัวผู้)",      category:"ศัลยกรรม",  price:2500, active:true },
  { id:8, code:"SV008", name:"ผ่าตัดทำหมัน (ตัวเมีย)",     category:"ศัลยกรรม",  price:3500, active:true },
  { id:9, code:"SV009", name:"อาบน้ำ-ตัดขน (เล็ก)",        category:"Grooming",  price:350,  active:true },
  { id:10,code:"SV010", name:"อาบน้ำ-ตัดขน (กลาง)",        category:"Grooming",  price:500,  active:true },
  { id:11,code:"SV011", name:"ตัดเล็บ",                    category:"Grooming",  price:80,   active:true },
  { id:12,code:"SV012", name:"เก็บเหาหู",                  category:"Grooming",  price:120,  active:true },
];

export const INIT_STOCK_PRODUCTS: StockProduct[] = [
  { id:1,  code:"TRT-001",  name:"ขนม Milk-Bone",            barcode:"8851234000011", category:"อาหาร/ขนม",  categoryEmoji:"🍖", type:"stock",   sellPrice:49,  costPrice:28,  unit:"ชิ้น",   stock:4,  minStock:10, maxStock:100, location:"ชั้น A แถว 1",  supplier:"Pet Supply Co.",  image:"https://loremflickr.com/400/400/dog,treats?lock=21", note:"",                    active:true,  usage:"ให้เป็นของรางวัล วันละไม่เกิน 2-3 ชิ้น (สุนัขเล็ก) / 4-6 ชิ้น (สุนัขใหญ่)" },
  { id:2,  code:"FOOD-012", name:"Royal Canin Adult 3kg",    barcode:"8851234000022", category:"อาหาร/ขนม",  categoryEmoji:"🍖", type:"stock",   sellPrice:890, costPrice:620, unit:"ถุง",    stock:18, minStock:5,  maxStock:50,  location:"ชั้น A แถว 2",  supplier:"Royal Canin TH",  image:"https://loremflickr.com/400/400/dogfood?lock=22", note:"",                    active:true,  usage:"ให้อาหารตามน้ำหนักตัว ดูตารางข้างถุง · แบ่งเป็น 2 มื้อ/วัน · มีน้ำสะอาดให้ตลอด" },
  { id:3,  code:"GRM-865",  name:"แปรงขน Furminator",        barcode:"8851234000033", category:"Grooming",   categoryEmoji:"✂️",  type:"stock",   sellPrice:350, costPrice:210, unit:"ชิ้น",   stock:9,  minStock:3,  maxStock:30,  location:"ชั้น B แถว 1",  supplier:"Grooming Pro",    image:"https://loremflickr.com/400/400/pet,grooming,brush?lock=23", note:"",                    active:true,  usage:"แปรงขน 1-2 ครั้ง/สัปดาห์ · แปรงตามแนวเส้นขน · ระวังบริเวณผิวบาง" },
  { id:4,  code:"VIT-888",  name:"วิตามิน C 60 เม็ด",        barcode:"8851234000044", category:"ยา/วิตามิน", categoryEmoji:"💊", type:"stock",   sellPrice:180, costPrice:90,  unit:"กล่อง",  stock:22, minStock:10, maxStock:60,  location:"ตู้ยา A",        supplier:"MedPet TH",       image:"https://loremflickr.com/400/400/vitamins,supplement?lock=24", note:"",                    active:true,  usage:"ให้ 1 เม็ด หลังอาหารเช้า · นาน 30 วัน · ผสมในอาหารหรือป้อนตรง" },
  { id:5,  code:"TOY-001",  name:"ลูกบอลยาง S",              barcode:"8851234000055", category:"ของเล่น",   categoryEmoji:"🎾", type:"stock",   sellPrice:89,  costPrice:45,  unit:"ลูก",    stock:3,  minStock:10, maxStock:50,  location:"ชั้น C แถว 1",  supplier:"FunPet",           image:"https://loremflickr.com/400/400/dog,toy,ball?lock=25", note:"",                    active:true,  usage:"เหมาะกับสุนัขเล็ก ต้องดูแลขณะเล่น · ห้ามทิ้งไว้กับสัตว์ขณะไม่มีคนเฝ้า" },
  { id:6,  code:"ACC-B13",  name:"สายจูง Leather Premium",   barcode:"8851234000066", category:"อุปกรณ์",   categoryEmoji:"🛠️",  type:"stock",   sellPrice:450, costPrice:280, unit:"เส้น",   stock:0,  minStock:5,  maxStock:20,  location:"ชั้น B แถว 3",  supplier:"PetLeather Co",   image:"https://loremflickr.com/400/400/dog,leash?lock=26", note:"",                    active:true,  usage:"คล้องกับปลอกคอ ตรวจการล็อกก่อนใช้ทุกครั้ง · ทำความสะอาดด้วยผ้านุ่ม" },
  { id:7,  code:"ACC-M72",  name:"ชามอาหาร M",               barcode:"8851234000077", category:"อุปกรณ์",   categoryEmoji:"🥣",  type:"stock",   sellPrice:590, costPrice:320, unit:"ใบ",     stock:5,  minStock:3,  maxStock:20,  location:"ชั้น B แถว 2",  supplier:"PetHome",          image:"https://loremflickr.com/400/400/pet,bowl?lock=27", note:"",                    active:true,  usage:"ล้างทำความสะอาดทุกวัน · เหมาะกับสัตว์ขนาดกลาง" },
  { id:8,  code:"FOOD-B22", name:"Whiskas 1.2kg (แมว)",      barcode:"8851234000088", category:"อาหาร/ขนม",  categoryEmoji:"🐱", type:"stock",   sellPrice:320, costPrice:195, unit:"ถุง",    stock:12, minStock:5,  maxStock:40,  location:"ชั้น A แถว 3",  supplier:"Mars Petcare",    image:"https://loremflickr.com/400/400/cat,food?lock=28", note:"",                    active:true,  usage:"ให้แมวตามน้ำหนักตัว · 30-40g ต่อกก./วัน · แบ่ง 2-3 มื้อ" },
  { id:9,  code:"MED-022",  name:"อะม็อกซิซิลลิน 250mg",    barcode:"8851234000099", category:"ยา/วิตามิน", categoryEmoji:"💊", type:"stock",   sellPrice:120, costPrice:85,  unit:"แผง",    stock:14, minStock:10, maxStock:60,  location:"ตู้ยา B",        supplier:"VetMed",           image:"https://loremflickr.com/400/400/medicine,pills?lock=29", note:"",                    active:true,  usage:"ให้ 1 เม็ด หลังอาหารเช้า-เย็น × 7 วัน · ดื่มน้ำตามมากๆ · ห้ามหยุดยาเอง" },
  { id:10, code:"SVC-GR5",  name:"ตัดขนพิเศษ (Custom)",      barcode:"",              category:"บริการ",     categoryEmoji:"✂️",  type:"nostock", sellPrice:500, costPrice:0,   unit:"ครั้ง",  stock:0,  minStock:0,  maxStock:0,   location:"",               supplier:"",                 image:"https://loremflickr.com/400/400/dog,grooming?lock=30", note:"บริการตามความต้องการ", active:true  },
  { id:11, code:"SVC-T81",  name:"บริการรับ-ส่งถึงบ้าน",    barcode:"",              category:"บริการ",     categoryEmoji:"🚗",  type:"nostock", sellPrice:200, costPrice:0,   unit:"เที่ยว", stock:0,  minStock:0,  maxStock:0,   location:"",               supplier:"",                 image:"https://loremflickr.com/400/400/delivery,car?lock=31", note:"",                    active:true  },
];

export const INIT_BOARDING_ROOMS: BoardingRoom[] = [
  { id: "A-01", type: "ห้อง VIP", status: "ไม่ว่าง", petName: "ไกด์ดี้" },
  { id: "A-02", type: "ห้อง VIP", status: "ว่าง" },
  { id: "A-03", type: "ห้อง VIP", status: "ว่าง" },
  { id: "B-01", type: "ห้องธรรมดา", status: "ว่าง" },
  { id: "B-02", type: "ห้องธรรมดา", status: "ว่าง" },
  { id: "B-03", type: "ห้องธรรมดา", status: "ไม่ว่าง", petName: "เอ๋อเดลคอกเค่อร์" },
  { id: "C-01", type: "ห้องแมว", status: "ว่าง" },
  { id: "C-02", type: "ห้องแมว", status: "ไม่ว่าง", petName: "ซาช่า" },
  { id: "C-03", type: "ห้องแมว", status: "ว่าง" },
  { id: "D-01", type: "กรงมาตรฐาน", status: "ว่าง" },
  { id: "D-02", type: "กรงมาตรฐาน", status: "ว่าง" },
  { id: "D-03", type: "กรงมาตรฐาน", status: "ซ่อมบำรุง" },
  { id: "D-04", type: "กรงมาตรฐาน", status: "ว่าง" },
  { id: "E-01", type: "กรงมาตรฐาน", status: "ไม่ว่าง", petName: "พริก" },
  { id: "E-02", type: "กรงมาตรฐาน", status: "ว่าง" },
  { id: "E-03", type: "กรงมาตรฐาน", status: "ว่าง" },
  { id: "F-01", type: "กรงนก/สัตว์เล็ก", status: "ว่าง" },
  { id: "F-02", type: "กรงนก/สัตว์เล็ก", status: "ว่าง" },
  { id: "F-03", type: "กรงนก/สัตว์เล็ก", status: "ว่าง" },
  { id: "F-04", type: "กรงนก/สัตว์เล็ก", status: "ว่าง" },
  { id: "G-01", type: "ห้อง VIP พิเศษ", status: "ว่าง" },
  { id: "G-02", type: "ห้อง VIP พิเศษ", status: "ว่าง" },
  { id: "H-01", type: "ห้องกักกัน", status: "ว่าง" },
  { id: "H-02", type: "ห้องกักกัน", status: "ว่าง" },
];

// ─── Context Interface ────────────────────────────────────────────
interface ClinicDataContextType {
  drugs: Drug[];
  setDrugs: React.Dispatch<React.SetStateAction<Drug[]>>;
  services: ServiceItem[];
  setServices: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
  stockProducts: StockProduct[];
  setStockProducts: React.Dispatch<React.SetStateAction<StockProduct[]>>;
  boardingRooms: BoardingRoom[];
  setBoardingRooms: React.Dispatch<React.SetStateAction<BoardingRoom[]>>;
  /** ลดสต็อกจากรายการ CartItem ของ POS (เฉพาะ id ที่ขึ้นต้น "d" = drug) */
  deductStock: (cartItems: { id: string; name: string; qty: number }[]) => void;
  lowStockCount: number;
  outOfStockCount: number;
}

const ClinicDataContext = createContext<ClinicDataContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────
export function ClinicDataProvider({ children }: { children: React.ReactNode }) {
  const [drugs, setDrugs]                   = useState<Drug[]>(INIT_DRUGS);
  const [services, setServices]             = useState<ServiceItem[]>(INIT_SERVICES);
  const [stockProducts, setStockProducts]   = useState<StockProduct[]>(INIT_STOCK_PRODUCTS);
  const [boardingRooms, setBoardingRooms]   = useState<BoardingRoom[]>(INIT_BOARDING_ROOMS);

  const deductStock = (cartItems: { id: string; name: string; qty: number }[]) => {
    setStockProducts(prev => {
      const updated = [...prev];
      cartItems.forEach(item => {
        // เฉพาะรายการยา (id ขึ้นต้นด้วย "d")
        if (!item.id.startsWith("d")) return;
        const idx = updated.findIndex(
          p => p.type === "stock" && p.name.toLowerCase() === item.name.toLowerCase()
        );
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], stock: Math.max(0, updated[idx].stock - item.qty) };
        }
      });
      return updated;
    });
  };

  const lowStockCount = useMemo(
    () => stockProducts.filter(p => p.type === "stock" && p.stock > 0 && p.stock < p.minStock).length,
    [stockProducts]
  );
  const outOfStockCount = useMemo(
    () => stockProducts.filter(p => p.type === "stock" && p.stock === 0).length,
    [stockProducts]
  );

  return (
    <ClinicDataContext.Provider
      value={{ drugs, setDrugs, services, setServices, stockProducts, setStockProducts, boardingRooms, setBoardingRooms, deductStock, lowStockCount, outOfStockCount }}
    >
      {children}
    </ClinicDataContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────
export function useClinicData(): ClinicDataContextType {
  const ctx = useContext(ClinicDataContext);
  if (!ctx) throw new Error("useClinicData ต้องใช้ภายใน ClinicDataProvider");
  return ctx;
}
