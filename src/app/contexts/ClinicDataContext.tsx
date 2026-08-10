import React, { createContext, useContext, useState, useMemo, useRef, useEffect } from "react";
import { INIT_STOCK_PRODUCTS } from "../data/products";
import { WAREHOUSES, stockByWarehouse } from "../config/warehouses";

// ─── Shared Types ──────────────────────────────────────────────────
/* รายการสินค้าที่จะถูกตัดสต๊อกเมื่อจ่ายยา 1 หน่วย (ตาราง stock_item_drugitems)
   ยา 1 ตัวผูกได้หลายสินค้า เช่น ยาน้ำ 1 ขวด = ตัวยา 1 ขวด + กระบอกฉีด 1 อัน */
export interface DrugStockLink {
  productId: number;   // อ้างถึง StockProduct.id
  qty: number;         // จำนวนที่ตัดต่อการจ่ายยา 1 หน่วย
  unit: string;        // หน่วยบรรจุที่ใช้ตัด (เม็ด / กล่อง / ขวด …)
}

export interface Drug {
  id: number; code: string; name: string; genericName: string;
  category: string; unit: string; costPrice: number; sellPrice: number;
  minStock: number; active: boolean;
  /** ความแรง เช่น "250 mg" — ต่อท้ายชื่อยาเวลาสร้างสินค้าในคลัง */
  strength?: string;
  /** ใช้ในงานผ่าตัด — ยานี้จะขึ้นในรายการยาสลบ/ยาหลังผ่าตัด ของบันทึกการผ่าตัด */
  surgeryUse?: boolean;
  /** รูปยา (data URL) — ช่วยให้หยิบยาถูกตัว ส่งต่อเป็นรูปสินค้าตอนสร้าง stock_item ด้วย */
  image?: string;
  /** ผูกกับสินค้าในคลังเพื่อตัดสต๊อกแบบ realtime — ไม่มี = ยังไม่ได้ผูก */
  stockLinks?: DrugStockLink[];
}
/* ราคาตามช่วงน้ำหนักตัวสัตว์
   หัตถการอย่างทำหมัน ผ่าตัด วางยาสลบ คิดราคาตามน้ำหนักเป็นปกติ
   ถ้าไม่มีตรงนี้ ผู้ใช้ต้องสร้างรายการซ้ำหลายอันหรือแก้ราคาเองทุกครั้ง */
export interface WeightTier {
  id: string;
  unit: string;    // หน่วยน้ำหนัก — เผื่อสัตว์เล็กที่คิดเป็นกรัม
  from: number;    // น้ำหนักเริ่มต้น (รวมค่านี้)
  to: number;      // น้ำหนักสิ้นสุด (รวมค่านี้)
  price: number;
}

export interface ServiceItem {
  id: number; code: string; name: string; category: string;
  /** ราคาขาย — คงชื่อ price ไว้ตามเดิม เพราะมีที่อ้างถึงอยู่หลายจุดในระบบ
      และค่าที่ผู้ใช้บันทึกไว้ก่อนหน้าทั้งหมดคือราคาขาย */
  price: number;
  /** ราคาทุน — ไม่ระบุ = 0 (รายการเก่าที่บันทึกก่อนมีช่องนี้) */
  costPrice?: number;
  active: boolean;
  /** หน่วยนับ — ใช้เป็นหน่วยพื้นฐานตอนส่งเข้าคลังสินค้า (เวชภัณฑ์ที่มิใช่ยา) */
  unit?: string;
  /** ราคาตามช่วงน้ำหนัก — ไม่มี/ว่าง = ใช้ price ราคาเดียวตามเดิม */
  weightTiers?: WeightTier[];
}

/** หาราคาตามน้ำหนักสัตว์ — ไม่มีช่วงที่ตรง หรือไม่รู้น้ำหนัก ให้ใช้ราคาปกติ */
export function priceForWeight(svc: { price: number; weightTiers?: WeightTier[] }, weightKg?: number | null): number {
  const tiers = svc.weightTiers;
  if (!tiers?.length || weightKg == null || !isFinite(weightKg)) return svc.price;
  const hit = tiers.find(t => weightKg >= t.from && weightKg <= t.to);
  return hit ? hit.price : svc.price;
}

/* ตาราง stock_item_unit — หน่วยบรรจุของสินค้า 1 ตัว (มีได้หลายหน่วย)
   หน่วย standard = หน่วยพื้นฐาน (หน่วยเล็กที่สุด) ที่ใช้เก็บยอดสต็อก */
export interface StockItemUnit {
  id: string;
  name: string;          // ชื่อหน่วย เช่น เม็ด / แผง / กล่อง
  qty: number;           // = กี่หน่วยพื้นฐาน
  standard: boolean;     // หน่วยพื้นฐาน / หน่วยขายหลัก
  barcode?: string;
  price?: number;
}

export interface StockProduct {
  id: number; code: string; name: string; barcode: string;
  category: string; categoryEmoji: string; type: "stock" | "nostock";
  sellPrice: number; costPrice: number; unit: string;
  stock: number; minStock: number; maxStock: number;
  location: string; supplier: string; image: string; note: string; active: boolean;
  usage?: string;   // วิธีใช้ตั้งต้น (แสดงในร้านค้า/ตะกร้า) — แก้ที่ตัวสินค้า
  expiry?: string;  // วันหมดอายุล่าสุด (ISO) — อัปเดตตอนรับสินค้าเข้าคลัง
  /** หน่วยบรรจุ (stock_item_unit) — ไม่มี = ใช้ unit เดี่ยวแบบเดิม */
  units?: StockItemUnit[];
  /** ที่มาของสินค้า — สร้างอัตโนมัติจากทะเบียนยา/ค่าบริการ */
  sourceType?: "drug" | "service";
  sourceId?: number;
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

/* ─────────────────────────────────────────────────────────────
   Stock Card — บรรทัดเดินบัญชีสินค้า (ledger)

   ทุกครั้งที่สต็อกขยับต้องมี 1 บรรทัดที่นี่ ไม่ว่าจะมาจากทางไหน
   รับเข้า : ใบสั่งซื้อ (po) · ไม่มีใบสั่งซื้อ (nopo) · ปรับยอดเข้า (adjust-in)
   จ่ายออก : ขายหน้าร้าน (pos) · ใบสั่งยา OPD/IPD (rx) · จ่ายเอง (manual) · ปรับยอดออก (adjust-out)

   คงเหลือไม่ได้เก็บในบรรทัด — คำนวณสะสมตอนแสดง Stock Card
   เพราะยอดยกมาขึ้นกับช่วงวันที่ที่ผู้ใช้เลือก
   ───────────────────────────────────────────────────────────── */
export type LedgerSource = "po" | "nopo" | "adjust-in" | "pos" | "rx" | "manual" | "adjust-out";

export interface StockLedgerEntry {
  id: string;
  productId: number;
  productName: string;
  date: string;            // ISO datetime — ใช้เรียงและกรองช่วงวันที่
  kind: "in" | "out";      // ปรับยอดเข้า = in / ปรับยอดออก = out
  source: LedgerSource;
  dept: string;            // หน่วยงาน เช่น "รับจากคลัง คลังยา", "ตัด manual คลังย่อย"
  docNo: string;           // เลขเอกสาร PO-xxxx / RC-xxxx / INV-xxxx / RX-xxxx
  lot?: string;
  expiry?: string;         // ISO
  price: number;           // ราคาต่อหน่วย ณ รายการนั้น
  qty: number;             // จำนวน (บวกเสมอ — ทิศทางดูที่ kind)
  unit: string;
  warehouse?: string;      // key ของหน่วยจ่ายที่รายการนี้เกิด — ไม่ระบุ = ยังไม่ผูกคลัง
  patient?: string;        // ชื่อสัตว์ป่วย (เฉพาะใบสั่งยา)
  hn?: string;
  by?: string;             // ผู้บันทึก
  note?: string;
}

/* ความเคลื่อนไหว Stock ของหน้าคลังสินค้า
   อยู่ที่นี่เพราะทั้งหน้า Stock และหน้าคลังแยกหน่วยจ่ายต้องอ่านชุดเดียวกัน */
export interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  type: "in" | "out" | "adjust";
  qty: number;
  costPerUnit: number;
  date: string;
  ref: string;
  supplier: string;
  lot: string;
  note: string;
  expiry?: string;   // วันหมดอายุ (ISO) ของล็อตที่รับเข้า
  at?: string;       // เวลาจริง (ISO) — ใช้เรียง/กรองช่วงวันที่ใน Stock Card
  warehouse?: string; // key ของหน่วยจ่าย
}

/** หมวดสินค้าในคลัง → อีโมจิที่ใช้แสดงในตาราง */
export const CATEGORY_EMOJI: Record<string, string> = {
  "ยา/วิตามิน": "💊",
  "อาหาร/ขนม": "🍖",
  "ของเล่น": "🧸",
  "อุปกรณ์": "🧰",
  "Grooming": "✂️",
};
export const STOCK_CATEGORIES = Object.keys(CATEGORY_EMOJI);

// ─── Initial Data (single source of truth) ────────────────────────
/* ── คลังยา (formulary) ──
   รหัส icode 7 หลักตามที่ใช้จริง ไม่ใช่ D001 — รหัสชุดนี้คือสิ่งที่ผูก
   รายการยาถ่ายพยาธิ/วัคซีน เข้ากับตัวยา เวลาเลือกในหน้าตั้งค่าจะเห็นชุดนี้

   ชื่อเขียนเป็น "ชื่อการค้า (ตัวยา ความแรง รูปแบบ)" — ชื่อการค้าอย่างเดียว
   บอกไม่ได้ว่าตัวยาอะไร ส่วนตัวยาอย่างเดียวก็หาของบนชั้นไม่เจอ ต้องมีคู่กัน */
export const INIT_DRUGS: Drug[] = [
  { id:1,  code:"1000001", name:"Enrofloxacin (50 mg/ml inj 100 ml)",              genericName:"Enrofloxacin",                        strength:"50 mg/ml",  category:"ยาปฏิชีวนะ",     unit:"ขวด",    costPrice:420, sellPrice:600, minStock:5,  active:true },
  { id:2,  code:"1000002", name:"Amoxy-Clav (Amoxicillin/Clavulanate 250 mg tab)", genericName:"Amoxicillin + Clavulanic acid",       strength:"250 mg",    category:"ยาปฏิชีวนะ",     unit:"แผง",    costPrice:85,  sellPrice:120, minStock:10, active:true },
  { id:3,  code:"1000003", name:"Carprofen (50 mg tab)",                            genericName:"Carprofen",                           strength:"50 mg",     category:"ยาแก้ปวด NSAID", unit:"แผง",    costPrice:190, sellPrice:280, minStock:10, active:true },
  { id:4,  code:"1000004", name:"Euro-Fer (sterile iron dextran inj 100 ml)",       genericName:"Iron dextran",                        strength:"100 mg/ml", category:"วิตามิน",        unit:"ขวด",    costPrice:260, sellPrice:380, minStock:3,  active:true },
  { id:5,  code:"1000005", name:"Famotidine (10 mg tab)",                           genericName:"Famotidine",                          strength:"10 mg",     category:"อื่นๆ",          unit:"แผง",    costPrice:70,  sellPrice:110, minStock:10, active:true },
  { id:6,  code:"1000006", name:"Meloxicam (1.5 mg/ml oral susp 32 ml)",            genericName:"Meloxicam",                           strength:"1.5 mg/ml", category:"ยาแก้ปวด NSAID", unit:"ขวด",    costPrice:250, sellPrice:350, minStock:5,  active:true },
  { id:7,  code:"1000007", name:"Metronidazole (200 mg tab)",                       genericName:"Metronidazole",                       strength:"200 mg",    category:"ยาปฏิชีวนะ",     unit:"แผง",    costPrice:60,  sellPrice:90,  minStock:10, active:true },
  { id:8,  code:"1000008", name:"Mirax (ยาถ่ายพยาธิ Praziquantel/Pyrantel/Febantel เม็ด)", genericName:"Praziquantel + Pyrantel + Febantel", strength:"1 เม็ด/10 กก.", category:"ยาถ่ายพยาธิ", unit:"เม็ด", costPrice:72,  sellPrice:120, minStock:20, active:true },
  { id:9,  code:"1000009", name:"Nexgard Spectra (Afoxolaner/Milbemycin เม็ดเคี้ยว)", genericName:"Afoxolaner + Milbemycin oxime",     strength:"ตามช่วงน้ำหนัก", category:"ยาถ่ายพยาธิ", unit:"เม็ด",   costPrice:340, sellPrice:520, minStock:10, active:true },
  { id:10, code:"1000010", name:"Poly-Oph (5 ml eye drop)",                         genericName:"Polymyxin B + Neomycin + Gramicidin", strength:"5 ml",      category:"ยาทาภายนอก",     unit:"หลอด",   costPrice:95,  sellPrice:150, minStock:8,  active:true },
  { id:11, code:"1000011", name:"Prednisolone (5 mg tab)",                          genericName:"Prednisolone",                        strength:"5 mg",      category:"สเตียรอยด์",     unit:"แผง",    costPrice:55,  sellPrice:80,  minStock:10, active:true },
  { id:12, code:"1000012", name:"Panacur (Fenbendazole 10% oral susp 100 ml)",      genericName:"Fenbendazole",                        strength:"100 mg/ml", category:"ยาถ่ายพยาธิ",    unit:"ขวด",    costPrice:280, sellPrice:450, minStock:5,  active:true },
  { id:13, code:"1000013", name:"Revolution Plus (Selamectin/Sarolaner หยดหลัง แมว)", genericName:"Selamectin + Sarolaner",            strength:"ตามช่วงน้ำหนัก", category:"ยาถ่ายพยาธิ", unit:"หลอด",   costPrice:310, sellPrice:480, minStock:10, active:true },
  { id:14, code:"1000014", name:"Tramadol (50 mg cap)",                             genericName:"Tramadol HCl",                        strength:"50 mg",     category:"อื่นๆ",          unit:"แคปซูล", costPrice:120, sellPrice:180, minStock:10, active:true },
  { id:15, code:"1000015", name:"Vitamin B Complex (inj 10 ml)",                    genericName:"Vitamin B Complex",                   strength:"10 ml",     category:"วิตามิน",        unit:"ขวด",    costPrice:85,  sellPrice:140, minStock:6,  active:true },
  { id:16, code:"1000016", name:"Chloramphenicol (250 mg cap)",                     genericName:"Chloramphenicol",                     strength:"250 mg",    category:"ยาปฏิชีวนะ",     unit:"แคปซูล", costPrice:110, sellPrice:170, minStock:10, active:false },

  /* ── ยาถ่ายพยาธิ ──
     หน้าตั้งค่ายาถ่ายพยาธิเลือกจากหมวดนี้เท่านั้น จึงต้องมีให้ครบทั้ง
     ชนิดกิน หยดหลัง และฉีด รวมถึงตัวที่คุมพยาธิหนอนหัวใจแยกต่างหาก */
  { id:17, code:"1000017", name:"Drontal Plus (Praziquantel/Pyrantel/Febantel เม็ด สุนัข)", genericName:"Praziquantel + Pyrantel + Febantel", strength:"1 เม็ด/10 กก.",  category:"ยาถ่ายพยาธิ", unit:"เม็ด",  costPrice:72,  sellPrice:120, minStock:20, active:true },
  { id:18, code:"1000018", name:"Drontal Cat (Praziquantel/Pyrantel เม็ด แมว)",             genericName:"Praziquantel + Pyrantel",            strength:"1 เม็ด/4 กก.",   category:"ยาถ่ายพยาธิ", unit:"เม็ด",  costPrice:65,  sellPrice:110, minStock:15, active:true },
  { id:19, code:"1000019", name:"Milbemax (Milbemycin Oxime/Praziquantel เม็ด สุนัข)",      genericName:"Milbemycin oxime + Praziquantel",    strength:"ตามช่วงน้ำหนัก", category:"ยาถ่ายพยาธิ", unit:"เม็ด",  costPrice:110, sellPrice:180, minStock:12, active:true },
  { id:20, code:"1000020", name:"Pyrantel Pamoate (50 mg/ml oral susp 60 ml)",              genericName:"Pyrantel pamoate",                   strength:"50 mg/ml",       category:"ยาถ่ายพยาธิ", unit:"ขวด",   costPrice:120, sellPrice:210, minStock:8,  active:true },
  { id:21, code:"1000021", name:"Advocate (Imidacloprid/Moxidectin หยดหลัง สุนัข)",         genericName:"Imidacloprid + Moxidectin",          strength:"ตามช่วงน้ำหนัก", category:"ยาถ่ายพยาธิ", unit:"หลอด",  costPrice:280, sellPrice:440, minStock:8,  active:true },
  { id:22, code:"1000022", name:"Bravecto Plus (Fluralaner/Moxidectin หยดหลัง แมว)",        genericName:"Fluralaner + Moxidectin",            strength:"ตามช่วงน้ำหนัก", category:"ยาถ่ายพยาธิ", unit:"หลอด",  costPrice:620, sellPrice:950, minStock:6,  active:true },
  { id:23, code:"1000023", name:"Simparica Trio (Sarolaner/Moxidectin/Pyrantel เม็ดเคี้ยว)", genericName:"Sarolaner + Moxidectin + Pyrantel",  strength:"ตามช่วงน้ำหนัก", category:"ยาถ่ายพยาธิ", unit:"เม็ด",  costPrice:380, sellPrice:580, minStock:10, active:true },
  { id:24, code:"1000024", name:"Heartgard Plus (Ivermectin/Pyrantel เม็ดเคี้ยว)",          genericName:"Ivermectin + Pyrantel pamoate",      strength:"ตามช่วงน้ำหนัก", category:"ยาถ่ายพยาธิ", unit:"เม็ด",  costPrice:150, sellPrice:250, minStock:12, active:true },
  { id:25, code:"1000025", name:"Droncit (Praziquantel 56.8 mg/ml inj 10 ml)",              genericName:"Praziquantel",                       strength:"56.8 mg/ml",     category:"ยาถ่ายพยาธิ", unit:"ขวด",   costPrice:340, sellPrice:520, minStock:4,  active:true },
  { id:26, code:"1000026", name:"Ivermectin 1% (inj 50 ml)",                                genericName:"Ivermectin",                         strength:"10 mg/ml",       category:"ยาถ่ายพยาธิ", unit:"ขวด",   costPrice:230, sellPrice:380, minStock:4,  active:true },
  { id:27, code:"1000027", name:"Baycox (Toltrazuril 5% oral susp 100 ml)",                 genericName:"Toltrazuril",                        strength:"50 mg/ml",       category:"ยาถ่ายพยาธิ", unit:"ขวด",   costPrice:410, sellPrice:620, minStock:4,  active:true },
  { id:28, code:"1000028", name:"Levamisole (7.5% oral 100 ml)",                            genericName:"Levamisole HCl",                     strength:"75 mg/ml",       category:"ยาถ่ายพยาธิ", unit:"ขวด",   costPrice:130, sellPrice:220, minStock:5,  active:false },
];

export const INIT_SERVICES: ServiceItem[] = [
  { id:1, code:"SV001", name:"ค่าตรวจ",                    category:"ทั่วไป",    price:300,  active:true },
  { id:2, code:"SV002", name:"ตรวจเลือด CBC",               category:"แล็บ",      price:450,  active:true },
  { id:3, code:"SV003", name:"ชีวเคมีในเลือด",              category:"แล็บ",      price:600,  active:true },
  { id:4, code:"SV004", name:"Medical Imagingทรวงอก",             category:"Medical Imaging",  price:800,  active:true },
  { id:5, code:"SV005", name:"น้ำเกลือ IV",                 category:"การรักษา",  price:250,  active:true },
  { id:6, code:"SV006", name:"ค่าพักรักษา/วัน",             category:"วอร์ด",     price:500,  active:true },
  { id:7, code:"SV007", name:"ผ่าตัดทำหมัน (ตัวผู้)",      category:"ศัลยกรรม",  price:2500, active:true },
  { id:8, code:"SV008", name:"ผ่าตัดทำหมัน (ตัวเมีย)",     category:"ศัลยกรรม",  price:3500, active:true },
  { id:9, code:"SV009", name:"อาบน้ำ-ตัดขน (เล็ก)",        category:"Grooming",  price:350,  active:true },
  { id:10,code:"SV010", name:"อาบน้ำ-ตัดขน (กลาง)",        category:"Grooming",  price:500,  active:true },
  { id:11,code:"SV011", name:"ตัดเล็บ",                    category:"Grooming",  price:80,   active:true },
  { id:12,code:"SV012", name:"เก็บเหาหู",                  category:"Grooming",  price:120,  active:true },
];

/* รายการสินค้า 54 รายการ (ภาพจริง) ย้ายไป src/app/data/products.ts */
export { INIT_STOCK_PRODUCTS };

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

const INIT_STOCK_MOVEMENTS: StockMovement[] = [
  { id:1, productId:2,  productName:"PUREPUP อาหารสุนัข สูตรไก่ 1.5kg", type:"in",     qty:24, costPerUnit:320, date:"6 ก.ค. 10:30", ref:"PO-2569-0028", supplier:"PurePup TH", lot:"LOT-690706", note:"", warehouse:"main" },
  { id:2, productId:2,  productName:"PUREPUP อาหารสุนัข สูตรไก่ 1.5kg", type:"out",    qty:1,  costPerUnit:320, date:"7 ก.ค. 16:22", ref:"INV-O089",     supplier:"",           lot:"",          note:"ขาย POS", warehouse:"pos" },
  { id:3, productId:1,  productName:"Complete Nutrition อาหารแมวสูตรครบถ้วน 2kg", type:"adjust", qty:-2, costPerUnit:430, date:"7 ก.ค. 09:00", ref:"ADJ-001",  supplier:"",           lot:"",          note:"ปรับยอด", warehouse:"main" },
  { id:4, productId:2,  productName:"PUREPUP อาหารสุนัข สูตรไก่ 1.5kg", type:"out",    qty:3,  costPerUnit:320, date:"7 ก.ค. 16:00", ref:"INV-O088",     supplier:"",           lot:"",          note:"ขาย POS", warehouse:"pos" },
  { id:5, productId:21, productName:"PURR CARE อาหารเสริมแมว",           type:"in",     qty:20, costPerUnit:300, date:"5 ก.ค. 14:00", ref:"PO-2569-0027", supplier:"MedPet TH",  lot:"LOT-690705", note:"", warehouse:"main" },
];

/* ─────────────────────────────────────────────────────────────
   ข้อมูลตัวอย่างของ Stock Card — สร้างให้ทุกสินค้ามีประวัติให้ดู

   ⚠️ เป็นข้อมูลจำลอง (mock) ไม่ใช่ธุรกรรมจริง — ต่อ backend เมื่อไหร่ให้ลบทิ้ง
   สร้างแบบ deterministic จาก product.id (ไม่ใช้ Math.random)
   เปิดหน้าใหม่กี่ครั้งก็ได้ประวัติชุดเดิม ยอดคงเหลือจึงไม่กระโดด

   ครอบคลุมทุกทางเข้า-ออกตาม journey ของระบบ
     รับ  : ใบสั่งซื้อ (มี lot/expiry/ราคา) · ไม่มีใบสั่งซื้อ · ปรับยอดเข้า
     จ่าย : ใบสั่งยา OPD/IPD · ขาย POS · ตัด manual · ปรับยอดออก
   ───────────────────────────────────────────────────────────── */
const DEMO_SUPPLIERS = ["บจก. สยามเวชภัณฑ์", "PurePup TH", "MedPet TH", "VetSupply Asia", "บจก. เพ็ทโปรดักส์"];
const DEMO_PATIENTS  = ["โมจิ / HN-2026-012", "บัดดี้ / HN-2026-001", "โคโค่ / HN-2026-042", "ชาร์ลี / HN-2026-005", "แม็กซ์ / HN-2026-003", "ลูน่า / HN-2026-011"];
const DEMO_MANUAL    = ["ของเสีย/ชำรุด", "หมดอายุ", "คืนสินค้าให้บริษัท", "เบิกใช้ภายใน"];

/** วันที่ย้อนหลัง n วัน เวลา hh:mm — คืนเป็น ISO */
const daysAgoAt = (n: number, hh: number, mm: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
};
const thaiShort = (iso: string) =>
  new Date(iso).toLocaleString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function buildDemoHistory(products: StockProduct[]) {
  const movements: StockMovement[] = [];
  const ledger: StockLedgerEntry[] = [];
  let mid = 1000, lid = 0;

  products.filter(p => p.type === "stock").forEach((p, idx) => {
    const isDrug = p.category === "ยา/วิตามิน";
    const sup = DEMO_SUPPLIERS[idx % DEMO_SUPPLIERS.length];
    const poNo = `PO-2569-${String(100 + (idx % 90)).padStart(4, "0")}`;
    const lot  = `LOT-69${String(1000 + idx * 7).slice(-4)}`;
    /* วันหมดอายุ ~1–2 ปีข้างหน้า (ยาสั้นกว่าของใช้) */
    const exp = new Date();
    exp.setMonth(exp.getMonth() + (isDrug ? 10 + (idx % 8) : 18 + (idx % 12)));
    const expiry = exp.toISOString().slice(0, 10);

    const mv = (o: Partial<StockMovement> & Pick<StockMovement, "type" | "qty" | "at">) => {
      movements.push({
        id: ++mid, productId: p.id, productName: p.name, costPerUnit: p.costPrice,
        date: thaiShort(o.at), ref: "", supplier: "", lot: "", note: "", warehouse: "main",
        ...o,
      } as StockMovement);
    };
    const lg = (o: Omit<StockLedgerEntry, "id" | "productId" | "productName" | "unit" | "price">) => {
      ledger.push({ id: `demo-${++lid}`, productId: p.id, productName: p.name, unit: p.unit, price: p.costPrice, ...o });
    };

    /* ── ออกก่อน แล้วค่อยคำนวณยอดรับเข้าย้อนกลับ ──
       ตั้งจำนวนรับตามใบสั่งซื้อ = คงเหลือจริง − ผลรวมของรายการอื่น
       บัญชีตัวอย่างจึงปิดพอดีที่ยอดคงเหลือจริง ยอดยกมาเป็น 0 ไม่ติดลบ */
    let otherDelta = 0;
    /* จ่ายออกรายคลังย่อย — ใช้คำนวณยอดที่ต้องโอนเข้าให้ปิดพอดี */
    const subOut: Record<string, number> = {};

    /* จ่ายตามใบสั่งยา — เฉพาะกลุ่มยา ไปห้องยา OPD/IPD */
    if (isDrug) {
      [110, 78, 45].forEach((d, k) => {
        const ipd = k === 1;
        const qty = 1 + ((idx + k) % 3);
        otherDelta -= qty;
        subOut[ipd ? "ipd" : "opd"] = (subOut[ipd ? "ipd" : "opd"] ?? 0) + qty;
        lg({
          date: daysAgoAt(d - (idx % 7), 9 + k * 3, 15 + k * 10), kind: "out", source: "rx",
          dept: ipd ? "จ่ายตามใบสั่งยา IPD" : "จ่ายตามใบสั่งยา OPD",
          docNo: `RX-${String(4200 + idx * 3 + k)}`, lot, expiry,
          qty, warehouse: ipd ? "ipd" : "opd",
          patient: DEMO_PATIENTS[(idx + k) % DEMO_PATIENTS.length],
        });
      });
    }

    /* ขายหน้าร้าน POS */
    [95, 52].forEach((d, k) => {
      const qty = 1 + ((idx + k) % 2);
      otherDelta -= qty;
      subOut.pos = (subOut.pos ?? 0) + qty;
      lg({
        date: daysAgoAt(d - (idx % 5), 14 + k * 2, 5 + k * 20), kind: "out", source: "pos",
        dept: "ขายหน้าร้าน POS", docNo: `INV-${String(70000 + idx * 11 + k)}`, lot, expiry,
        qty, warehouse: "pos",
        patient: DEMO_PATIENTS[(idx + k + 2) % DEMO_PATIENTS.length].split(" / ")[0],
      });
    });

    /* รับเข้าไม่มีใบสั่งซื้อ (ซื้อสด) */
    const noPoQty = Math.max(2, Math.round(p.stock * 0.25));
    otherDelta += noPoQty;
    mv({ type: "in", qty: noPoQty, at: daysAgoAt(64 - (idx % 9), 11, 0), ref: `DN-69${String(500 + idx)}`, supplier: sup, lot: `${lot}-B`, expiry, note: "ซื้อสด ไม่มีใบสั่งซื้อ" });

    /* ปรับยอดจากการตรวจนับ — สลับเข้า/ออกตามลำดับสินค้า */
    const adj = idx % 2 === 0 ? 1 : -1;
    otherDelta += adj;
    mv({ type: "adjust", qty: adj, at: daysAgoAt(30 - (idx % 6), 9, 0), ref: `ADJ-${String(200 + idx)}`, note: "ตรวจนับสต็อกประจำเดือน" });

    /* ตัด manual — ของเสีย / หมดอายุ / คืนบริษัท */
    otherDelta -= 1;
    mv({ type: "out", qty: 1, at: daysAgoAt(12 - (idx % 8), 16, 40), ref: `OUT-${String(9000 + idx)}`, note: DEMO_MANUAL[idx % DEMO_MANUAL.length] });

    /* รับตามใบสั่งซื้อ — ตัวปิดยอด มี lot / วันหมดอายุ / ราคาที่รับจริง */
    mv({ type: "in", qty: Math.max(1, p.stock - otherDelta), at: daysAgoAt(150 - (idx % 20), 10, 30), ref: poNo, supplier: sup, lot, expiry, note: "รับตามใบสั่งซื้อ ครั้งที่ 1" });

    /* ── โอนจากคลังหลักไปคลังย่อย ──
       ของเข้าคลังหลักก่อนเสมอ แล้วค่อยกระจายไปห้องยา/หน้าร้าน แต่ข้อมูล
       ตัวอย่างเดิมมีแต่ "จ่ายออก" จากคลังย่อยโดยไม่เคยรับเข้า ยอดจึงติดลบ
       และคลังย่อยไม่มีรายการรับสักใบให้แสดง

       ยอดที่โอน = ยอดที่ควรเหลือ + ที่จ่ายออกไปแล้ว → ปิดพอดีที่ยอดเดิม
       ผลรวมทุกคลังยังเท่า p.stock เพราะเป็นการย้ายที่ ไม่ได้เพิ่มของ */
    const target = stockByWarehouse(p);
    WAREHOUSES.filter(w => !w.main).forEach((w, k) => {
      const qty = (target[w.key] ?? 0) + (subOut[w.key] ?? 0);
      if (qty <= 0) return;
      const at = daysAgoAt(140 - (idx % 15) - k, 8 + k, 20);
      const ref = `TF-69${String(300 + idx * 5 + k)}`;
      mv({ type: "out", qty, at, ref, lot, expiry, warehouse: "main",  note: `โอนไป${w.label}` });
      mv({ type: "in",  qty, at, ref, lot, expiry, warehouse: w.key,   note: "รับโอนจากคลังหลัก" });
    });
  });

  return { movements, ledger };
}

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
  deductStock: (cartItems: { id: string; name: string; qty: number }[], meta?: DeductMeta) => void;
  /** บรรทัดเดินบัญชีสินค้า — แหล่งข้อมูลของ Stock Card */
  stockLedger: StockLedgerEntry[];
  addLedger: (rows: Omit<StockLedgerEntry, "id">[]) => void;
  stockMovements: StockMovement[];
  setStockMovements: React.Dispatch<React.SetStateAction<StockMovement[]>>;
  /** สร้างสินค้าในคลัง (stock_item + stock_item_unit) จากทะเบียนยา/ค่าบริการ
      ถ้ามีสินค้าชื่อเดียวกันอยู่แล้วจะคืนตัวเดิม ไม่สร้างซ้ำ */
  addStockItem: (input: NewStockItem) => { product: StockProduct; created: boolean };
  lowStockCount: number;
  outOfStockCount: number;
}

/** ที่มาของการตัดจ่าย — ใช้เขียนลง Stock Card ให้รู้ว่าตัดจากเอกสารไหน */
export interface DeductMeta {
  source?: "pos" | "rx";
  dept?: string;
  docNo?: string;
  patient?: string;
  hn?: string;
  by?: string;
  warehouse?: string;
}

/** ข้อมูลตั้งต้นสำหรับสร้างสินค้าในคลัง — กรอกเท่าที่มี ที่เหลือเติมค่าเริ่มต้นให้ */
export interface NewStockItem {
  name: string;
  unit: string;
  category?: string;
  categoryEmoji?: string;
  costPrice?: number;
  sellPrice?: number;
  minStock?: number;
  note?: string;
  image?: string;
  sourceType?: "drug" | "service";
  sourceId?: number;
}

const ClinicDataContext = createContext<ClinicDataContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────
export function ClinicDataProvider({ children }: { children: React.ReactNode }) {
  const [drugs, setDrugs]                   = useState<Drug[]>(INIT_DRUGS);
  /* ref เพื่อให้ deductStock อ่านรายการยาล่าสุดเสมอ (กัน stale closure ตอนอ่าน stockLinks) */
  const drugsRef = useRef(drugs);
  useEffect(() => { drugsRef.current = drugs; }, [drugs]);
  const [services, setServices]             = useState<ServiceItem[]>(INIT_SERVICES);
  const [stockProducts, setStockProducts]   = useState<StockProduct[]>(INIT_STOCK_PRODUCTS);
  const [boardingRooms, setBoardingRooms]   = useState<BoardingRoom[]>(INIT_BOARDING_ROOMS);

  /* ตัดสต๊อกเมื่อขาย/จ่ายยา
     - ถ้ายาตัวนั้นผูกสินค้าไว้ (stockLinks) → ตัดตามที่ผูก คูณจำนวนที่จ่าย (แม่นยำ ตัดได้หลายตัว)
     - ถ้ายังไม่ผูก → fallback เทียบชื่อสินค้าแบบเดิม (ของเก่ายังทำงานได้) */
  const deductStock = (cartItems: { id: string; name: string; qty: number }[], meta: DeductMeta = {}) => {
    const rows: Omit<StockLedgerEntry, "id">[] = [];
    const stamp = new Date().toISOString();
    const src = meta.source ?? "pos";
    const dept = meta.dept ?? (src === "rx" ? "จ่ายตามใบสั่งยา OPD/IPD" : "ขายหน้าร้าน POS");

    setStockProducts(prev => {
      const updated = [...prev];
      /* ตัดสต็อก + จดบรรทัด Stock Card ให้ทุกครั้ง (lot/expiry เอาจากล็อตล่าสุดของสินค้า) */
      const cut = (productId: number, amount: number) => {
        const idx = updated.findIndex(p => p.id === productId && p.type === "stock");
        if (idx === -1) return;
        const p = updated[idx];
        updated[idx] = { ...p, stock: Math.max(0, p.stock - amount) };
        rows.push({
          productId: p.id, productName: p.name, date: stamp, kind: "out", source: src,
          dept, docNo: meta.docNo ?? "", expiry: p.expiry, price: p.costPrice,
          qty: amount, unit: p.unit, patient: meta.patient, hn: meta.hn, by: meta.by,
          /* POS ตัดจากคลังร้านค้า · ใบสั่งยาตัดจากห้องยา OPD (ระบุเองได้ผ่าน meta.warehouse) */
          warehouse: meta.warehouse ?? (src === "pos" ? "pos" : "opd"),
        });
      };

      cartItems.forEach(item => {
        // เฉพาะรายการยา (id ขึ้นต้นด้วย "d")
        if (!item.id.startsWith("d")) return;
        const drugId = Number(item.id.slice(1));
        const drug = drugsRef.current.find(d => d.id === drugId);

        if (drug?.stockLinks?.length) {
          drug.stockLinks.forEach(l => cut(l.productId, l.qty * item.qty));
          return;
        }
        /* fallback เดิม — เทียบชื่อ */
        const idx = updated.findIndex(
          p => p.type === "stock" && p.name.toLowerCase() === item.name.toLowerCase()
        );
        if (idx !== -1) cut(updated[idx].id, item.qty);
      });
      return updated;
    });

    if (rows.length) addLedger(rows);
  };

  /* ประวัติตัวอย่างของ Stock Card — คำนวณครั้งเดียวตอน mount */
  const demo = useMemo(() => buildDemoHistory(INIT_STOCK_PRODUCTS), []);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => demo.movements);
  const [stockLedger, setStockLedger] = useState<StockLedgerEntry[]>(() => demo.ledger);
  const ledgerSeq = useRef(0);
  const addLedger = (rows: Omit<StockLedgerEntry, "id">[]) => {
    if (!rows.length) return;
    setStockLedger(prev => [...prev, ...rows.map(r => ({ ...r, id: `lg-${++ledgerSeq.current}` }))]);
  };

  /* ref ของรายการสินค้าล่าสุด — addStockItem ต้องคืนตัวสินค้าทันที (sync)
     ให้ผู้เรียกเอา id ไปผูก stockLinks ต่อได้ จึงอ่านจาก ref แทน state ใน updater */
  const stockRef = useRef(stockProducts);
  useEffect(() => { stockRef.current = stockProducts; }, [stockProducts]);

  /* สร้างสินค้าในคลังจากทะเบียนยา/ค่าบริการ (stock_item + stock_item_unit)
     กันซ้ำด้วยชื่อสินค้า (ตัดช่องว่าง + ไม่สนตัวพิมพ์) — กดบันทึกซ้ำจะไม่ได้สินค้าซ้ำ */
  const addStockItem = (input: NewStockItem) => {
    const name = input.name.trim().replace(/\s+/g, " ");
    const unit = (input.unit || "ชิ้น").trim();
    const list = stockRef.current;

    const existing = list.find(p => p.name.trim().toLowerCase() === name.toLowerCase());
    if (existing) return { product: existing, created: false };

    const id = list.reduce((m, p) => Math.max(m, p.id), 0) + 1;
    const category = input.category ?? "อุปกรณ์";
    const product: StockProduct = {
      id,
      code: `SKU-${String(id).padStart(4, "0")}`,
      name,
      barcode: "",
      category,
      categoryEmoji: input.categoryEmoji ?? CATEGORY_EMOJI[category] ?? "📦",
      type: "stock",
      sellPrice: input.sellPrice ?? 0,
      costPrice: input.costPrice ?? 0,
      unit,
      stock: 0,
      minStock: input.minStock ?? 0,
      maxStock: 0,
      location: "",
      supplier: "",
      image: input.image ?? "",
      note: input.note ?? "",
      active: true,
      /* หน่วยพื้นฐาน 1 หน่วย — ตาราง stock_item_unit */
      units: [{ id: `u-${id}-base`, name: unit, qty: 1, standard: true }],
      sourceType: input.sourceType,
      sourceId: input.sourceId,
    };
    stockRef.current = [...list, product];          // ให้เรียกติด ๆ กันหลายครั้งไม่ชนกัน
    setStockProducts(prev => [...prev, product]);
    return { product, created: true };
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
      value={{ drugs, setDrugs, services, setServices, stockProducts, setStockProducts, boardingRooms, setBoardingRooms, deductStock, stockLedger, addLedger, stockMovements, setStockMovements, addStockItem, lowStockCount, outOfStockCount }}
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
