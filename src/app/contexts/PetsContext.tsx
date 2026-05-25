import { createContext, useContext, useState, ReactNode } from "react";

export interface PetVaccine {
  name: string;
  date: string;
  nextDue: string;
  batch: string;
}

export interface PetSurgery {
  name: string;
  date: string;
  vet: string;
  notes: string;
}

export interface PetVisit {
  id: number;
  date: string;
  time: string;
  type: string;
  weight: string;
  chiefComplaint: string;
  diagnosis: string;
  treatment: string;
  medications: string[];
  vet: string;
  notes: string;
}

export interface Pet {
  id: number;
  hn: string;
  name: string;
  nameEn: string;
  species: string;
  breed: string;
  gender: string;
  weight: string;
  age: string;
  microchip: string;
  color: string;
  owner: string;
  ownerPhone: string;
  allergies: string;
  chronic: string;
  sterilized: boolean;
  image: string | null;
  vaccines: PetVaccine[];
  surgeries: PetSurgery[];
  visits: number;
  visitHistory: PetVisit[];
}

const initialPets: Pet[] = [
  {
    id: 1, hn: "HN-2026-001", name: "บัดดี้", nameEn: "Buddy", species: "สุนัข", breed: "โกลเดน รีทรีฟเวอร์", gender: "เพศผู้",
    weight: "28.5 กก.", age: "4 ปี", microchip: "985112345678901", color: "สีทอง",
    owner: "สมศักดิ์ ใจดี", ownerPhone: "081-234-5678",
    allergies: "เพนิซิลิน", chronic: "ไม่มี", sterilized: true,
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80&auto=format&fit=crop",
    vaccines: [
      { name: "พิษสุนัขบ้า", date: "15 ต.ค. 2568", nextDue: "15 ต.ค. 2569", batch: "RB-2025-001" },
      { name: "DHPP", date: "15 ต.ค. 2568", nextDue: "15 ต.ค. 2569", batch: "DH-2025-002" },
      { name: "บอร์เดเทลลา", date: "20 เม.ย. 2568", nextDue: "20 เม.ย. 2569", batch: "BD-2025-003" },
    ],
    surgeries: [{ name: "ทำหมัน", date: "10 มิ.ย. 2565", vet: "สพ.ว. สมชาย", notes: "ผ่าตัดปกติ ฟื้นตัวดี" }],
    visits: 24,
    visitHistory: [
      {
        id: 1, date: "2 มี.ค. 2569", time: "10:30 น.", type: "OPD", weight: "28.5 กก.",
        chiefComplaint: "ซึมเศร้า ไม่กินข้าว 2 วัน",
        diagnosis: "Gastroenteritis (ลำไส้อักเสบเฉียบพลัน)",
        treatment: "ให้น้ำเกลือ IV 500 ml, ฉีดยาแก้อาเจียน",
        medications: ["Metronidazole 250mg 2x1 PC 5 วัน", "Omeprazole 20mg 1x1 AC 5 วัน"],
        vet: "สพ.ว. สมชาย รักสัตว์",
        notes: "นัดติดตามอาการ 5 วัน หากอาเจียนต่อเนื่องให้กลับมาก่อน",
      },
      {
        id: 2, date: "10 ก.พ. 2569", time: "14:00 น.", type: "OPD", weight: "28.3 กก.",
        chiefComplaint: "ตรวจสุขภาพประจำปี",
        diagnosis: "สุขภาพปกติ ไม่พบความผิดปกติ",
        treatment: "ตรวจร่างกายทั่วไป เจาะเลือด CBC",
        medications: ["Ivermectin (กำจัดพยาธิ) ฉีดครั้งเดียว"],
        vet: "สพ.ว. สุภา มีสุข",
        notes: "ผลเลือดปกติ นัดฉีดวัคซีนประจำปี ต.ค. 2569",
      },
      {
        id: 3, date: "5 ธ.ค. 2568", time: "09:15 น.", type: "OPD", weight: "27.9 กก.",
        chiefComplaint: "ขาหลังขวาเดินกะเผลก หลังออกกำลังกาย",
        diagnosis: "Muscle strain (กล้ามเนื้อฉีก) บริเวณต้นขา",
        treatment: "นวดและประคบเย็น แนะนำพักผ่อน",
        medications: ["Meloxicam 15mg 1x1 PC 3 วัน", "Tramadol 50mg 2x1 PC 3 วัน"],
        vet: "สพ.ว. สมชาย รักสัตว์",
        notes: "ห้ามออกกำลังกายหนัก 2 สัปดาห์ หากไม่ดีขึ้นให้เอกซเรย์",
      },
    ],
  },
  {
    id: 2, hn: "HN-2026-002", name: "ลูน่า", nameEn: "Luna", species: "แมว", breed: "เปอร์เซีย", gender: "เพศเมีย",
    weight: "3.8 กก.", age: "2 ปี", microchip: "985198765432109", color: "ขาว",
    owner: "วรรณา ศรีสุข", ownerPhone: "089-876-5432",
    allergies: "ไม่มี", chronic: "ความดันโลหิตสูง", sterilized: true,
    image: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400&q=80&auto=format&fit=crop",
    vaccines: [
      { name: "FVRCP", date: "1 ก.ย. 2568", nextDue: "1 ก.ย. 2569", batch: "FV-2025-001" },
      { name: "พิษสุนัขบ้า", date: "1 ก.ย. 2568", nextDue: "1 ก.ย. 2569", batch: "RB-2025-004" },
    ],
    surgeries: [{ name: "ทำหมัน", date: "14 ก.พ. 2567", vet: "สพ.ว. สุภา", notes: "ไม่มีภาวะแทรกซ้อน" }],
    visits: 12,
    visitHistory: [
      {
        id: 1, date: "15 ก.พ. 2569", time: "11:00 น.", type: "OPD", weight: "3.8 กก.",
        chiefComplaint: "ติดตามความดันโลหิต",
        diagnosis: "Hypertension controlled (ความดันอยู่ในเกณฑ์ดี)",
        treatment: "วัดความดัน, ตรวจปัสสาวะ",
        medications: ["Amlodipine 0.625mg 1x1 ต่อเนื่อง"],
        vet: "สพ.ว. สุภา มีสุข",
        notes: "ความดัน 130/85 mmHg ปกติดี นัดติดตาม 3 เดือน",
      },
    ],
  },
  {
    id: 3, hn: "HN-2026-003", name: "แม็กซ์", nameEn: "Max", species: "สุนัข", breed: "แบล็ก แลบราดอร์", gender: "เพศผู้",
    weight: "35.2 กก.", age: "6 ปี", microchip: "985111222333444", color: "ดำ",
    owner: "ประพันธ์ มงคล", ownerPhone: "062-111-2233",
    allergies: "โปรตีนไก่", chronic: "สะโพกเสื่อม", sterilized: false,
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80&auto=format&fit=crop",
    vaccines: [
      { name: "พิษสุนัขบ้า", date: "20 ส.ค. 2568", nextDue: "20 ส.ค. 2569", batch: "RB-2025-007" },
    ],
    surgeries: [],
    visits: 18,
    visitHistory: [
      {
        id: 1, date: "28 ก.พ. 2569", time: "13:30 น.", type: "OPD", weight: "35.2 กก.",
        chiefComplaint: "ขาหลังอ่อนแรง เดินกะเผลก",
        diagnosis: "Hip Dysplasia progression (สะโพกเสื่อมมากขึ้น)",
        treatment: "เอกซเรย์สะโพก, กายภาพบำบัด",
        medications: ["Meloxicam 15mg 1x1 PC 7 วัน", "Glucosamine 500mg 1x1 7 วัน"],
        vet: "สพ.ว. สมชาย รักสัตว์",
        notes: "แนะนำลดการออกกำลังกายหนัก ควรพิจารณาผ่าตัดหากอาการไม่ดีขึ้น",
      },
      {
        id: 2, date: "10 ม.ค. 2569", time: "10:00 น.", type: "OPD", weight: "35.5 กก.",
        chiefComplaint: "แพ้อาหาร ผื่นคันตามตัว",
        diagnosis: "Food allergy (แพ้โปรตีนไก่)",
        treatment: "ฉีดยาแก้แพ้, แนะนำเปลี่ยนอาหาร",
        medications: ["Chlorpheniramine 4mg 2x1 5 วัน", "Prednisolone 5mg 1x1 PC 3 วัน"],
        vet: "สพ.ว. สุภา มีสุข",
        notes: "หลีกเลี่ยงอาหารที่มีส่วนผสมของไก่ทุกชนิด",
      },
    ],
  },
  {
    id: 4, hn: "HN-2026-004", name: "ทวีป", nameEn: "Tweep", species: "นก", breed: "คอกคาเทล", gender: "เพศผู้",
    weight: "0.09 กก.", age: "1 ปี 6 เดือน", microchip: "-", color: "เทา-เหลือง",
    owner: "นภาพร รุ่งเรือง", ownerPhone: "091-555-7788",
    allergies: "ไม่มี", chronic: "ไม่มี", sterilized: false,
    image: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400&q=80&auto=format&fit=crop",
    vaccines: [
      { name: "Newcastle Disease", date: "5 มี.ค. 2568", nextDue: "5 มี.ค. 2569", batch: "ND-2025-011" },
    ],
    surgeries: [],
    visits: 3,
    visitHistory: [
      {
        id: 1, date: "20 ก.พ. 2569", time: "09:00 น.", type: "OPD", weight: "0.09 กก.",
        chiefComplaint: "ขนร่วงผิดปกติ ขูดคันตลอดเวลา",
        diagnosis: "Feather Destructive Behavior (นกทำลายขนตัวเอง)",
        treatment: "ตรวจร่างกายทั่วไป เก็บตัวอย่างขน",
        medications: ["Vitamin A supplement 1 หยด/วัน 14 วัน"],
        vet: "สพ.ว. สุภา มีสุข",
        notes: "แนะนำปรับสภาพแวดล้อม เพิ่มของเล่นในกรง ลดความเครียด",
      },
    ],
  },
  {
    id: 5, hn: "HN-2026-005", name: "มิลค์", nameEn: "Milk", species: "สัตว์เลี้ยงขนาดเล็ก", breed: "กระต่ายดัตช์", gender: "เพศเมีย",
    weight: "1.8 กก.", age: "3 ปี", microchip: "985100099988877", color: "ขาว-น้ำตาล",
    owner: "ศิริพร แก้วมณี", ownerPhone: "083-321-6655",
    allergies: "ไม่มี", chronic: "ไม่มี", sterilized: true,
    image: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400&q=80&auto=format&fit=crop",
    vaccines: [],
    surgeries: [{ name: "ทำหมัน", date: "3 ส.ค. 2566", vet: "สพ.ว. สมชาย", notes: "ผ่าตัดปกติ ฟื้นตัวดีภายใน 3 วัน" }],
    visits: 5,
    visitHistory: [
      {
        id: 1, date: "12 ม.ค. 2569", time: "10:00 น.", type: "OPD", weight: "1.8 กก.",
        chiefComplaint: "ท้องอืด ไม่กินหญ้า 1 วัน",
        diagnosis: "GI Stasis (ลำไส้หยุดเคลื่อนไหว)",
        treatment: "ฉีดยากระตุ้นลำไส้, ให้สารน้ำใต้ผิวหนัง",
        medications: ["Metoclopramide 0.5mg/kg ฉีด", "Simethicone 20mg 3x1 3 วัน"],
        vet: "สพ.ว. สุภา มีสุข",
        notes: "เพิ่มหญ้าทิโมธีในอาหารประจำวัน ลดเม็ดอาหาร",
      },
    ],
  },
  {
    id: 6, hn: "HN-2026-006", name: "ทองคำ", nameEn: "Goldie", species: "ปลา", breed: "ปลาทอง (Oranda)", gender: "-",
    weight: "0.05 กก.", age: "2 ปี", microchip: "-", color: "ส้ม-ขาว",
    owner: "กิตติพงษ์ วงษ์ทอง", ownerPhone: "086-447-2211",
    allergies: "ไม่มี", chronic: "ไม่มี", sterilized: false,
    image: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400&q=80&auto=format&fit=crop",
    vaccines: [],
    surgeries: [],
    visits: 2,
    visitHistory: [
      {
        id: 1, date: "8 ก.พ. 2569", time: "14:30 น.", type: "OPD", weight: "0.05 กก.",
        chiefComplaint: "ครีบกร่อน มีจุดขาวตามลำตัว",
        diagnosis: "Ich (White Spot Disease) ระยะแรก",
        treatment: "เปลี่ยนน้ำ 50%, ปรับอุณหภูมิน้ำ",
        medications: ["Malachite Green 0.1ppm ใส่ตู้ปลา 3 วัน"],
        vet: "สพ.ว. สมชาย รักสัตว์",
        notes: "แยกตู้กักกันก่อน ตรวจคุณภาพน้ำทุกวัน",
      },
    ],
  },
  {
    id: 7, hn: "HN-2026-007", name: "เร็กซ์", nameEn: "Rex", species: "สัตว์เลื้อยคลาน", breed: "อีกัวน่าเขียว", gender: "เพศผู้",
    weight: "2.3 กก.", age: "5 ปี", microchip: "-", color: "เขียว",
    owner: "ธนากร ชัยชนะ", ownerPhone: "094-882-0033",
    allergies: "ไม่มี", chronic: "ขาดแคลเซียม", sterilized: false,
    image: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=400&q=80&auto=format&fit=crop",
    vaccines: [],
    surgeries: [],
    visits: 4,
    visitHistory: [
      {
        id: 1, date: "25 ก.พ. 2569", time: "11:30 น.", type: "OPD", weight: "2.3 กก.",
        chiefComplaint: "ขาอ่อนแรง งอผิดรูป",
        diagnosis: "Metabolic Bone Disease (โรคกระดูกขาดแคลเซียม)",
        treatment: "เอกซเรย์กระดูก, ให้แคลเซียมเสริม",
        medications: ["Calcium Gluconate 100mg/kg ฉีด", "Vitamin D3 supplement 2 หยด/วัน"],
        vet: "สพ.ว. สมชาย รักสัตว์",
        notes: "เพิ่มการรับแสง UVB อย่างน้อย 12 ชั่วโมง/วัน ปรับอาหารเป็นผักใบเขียวเข้ม",
      },
    ],
  },
  {
    id: 8, hn: "HN-2026-008", name: "ร็อคกี้", nameEn: "Rocky", species: "สุนัข", breed: "โกลเดน รีทรีฟเวอร์", gender: "เพศผู้",
    weight: "26.8 กก.", age: "3 ปี", microchip: "985112345678902", color: "สีทอง",
    owner: "สมศักดิ์ ใจดี", ownerPhone: "081-234-5678",
    allergies: "ไม่มี", chronic: "ไม่มี", sterilized: true,
    image: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=400&q=80&auto=format&fit=crop",
    vaccines: [
      { name: "พิษสุนัขบ้า", date: "10 ก.ย. 2568", nextDue: "10 ก.ย. 2569", batch: "RB-2025-012" },
      { name: "DHPP", date: "10 ก.ย. 2568", nextDue: "10 ก.ย. 2569", batch: "DH-2025-013" },
    ],
    surgeries: [{ name: "ทำหมัน", date: "5 มี.ค. 2567", vet: "สพ.ว. สมชาย", notes: "ผ่าตัดปกติ ฟื้นตัวดี" }],
    visits: 9,
    visitHistory: [
      {
        id: 1, date: "5 ม.ค. 2569", time: "10:00 น.", type: "OPD", weight: "26.8 กก.",
        chiefComplaint: "ตรวจสุขภาพประจำปี",
        diagnosis: "สุขภาพปกติ ไม่พบความผิดปกติ",
        treatment: "ตรวจร่างกายทั่วไป เจาะเลือด CBC",
        medications: ["Ivermectin (กำจัดพยาธิ) ฉีดครั้งเดียว"],
        vet: "สพ.ว. สุภา มีสุข",
        notes: "ผลเลือดปกติ นัดฉีดวัคซีนประจำปี ก.ย. 2569",
      },
    ],
  },
  {
    id: 9, hn: "HN-2026-009", name: "โมจิ", nameEn: "Mochi", species: "แมว", breed: "เมนคูน", gender: "เพศเมีย",
    weight: "5.5 กก.", age: "2 ปี", microchip: "985198765432110", color: "น้ำตาล-ลาย",
    owner: "ประพันธ์ มงคล", ownerPhone: "062-111-2233",
    allergies: "ไม่มี", chronic: "ไม่มี", sterilized: true,
    image: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&q=80&auto=format&fit=crop",
    vaccines: [
      { name: "FVRCP", date: "15 ก.ย. 2568", nextDue: "15 ก.ย. 2569", batch: "FV-2025-015" },
      { name: "พิษสุนัขบ้า", date: "15 ก.ย. 2568", nextDue: "15 ก.ย. 2569", batch: "RB-2025-016" },
    ],
    surgeries: [{ name: "ทำหมัน", date: "20 เม.ย. 2567", vet: "สพ.ว. สุภา", notes: "ไม่มีภาวะแทรกซ้อน" }],
    visits: 6,
    visitHistory: [
      {
        id: 1, date: "15 มี.ค. 2569", time: "13:00 น.", type: "OPD", weight: "5.5 กก.",
        chiefComplaint: "ตรวจสุขภาพ ฉีดวัคซีน FVRCP",
        diagnosis: "สุขภาพปกติ",
        treatment: "ฉีดวัคซีน FVRCP บูสเตอร์",
        medications: [],
        vet: "สพ.ว. สุภา มีสุข",
        notes: "นัดวัคซีนครั้งต่อไป ก.ย. 2569",
      },
    ],
  },
  {
    id: 10, hn: "HN-2026-010", name: "โคโค่", nameEn: "CoCo", species: "สัตว์เลี้ยงขนาดเล็ก", breed: "Holland Lop (กระต่าย)", gender: "เพศเมีย",
    weight: "2.1 กก.", age: "2 ปี", microchip: "-", color: "ขาว-น้ำตาล",
    owner: "อรอนงค์ พรมเสน", ownerPhone: "091-444-5566",
    allergies: "ไม่มี", chronic: "ไม่มี", sterilized: false,
    image: "https://images.unsplash.com/photo-1535241749838-299277b6305f?w=400&q=80&auto=format&fit=crop",
    vaccines: [],
    surgeries: [],
    visits: 8,
    visitHistory: [
      {
        id: 1, date: "27 ก.พ. 2569", time: "10:00 น.", type: "OPD", weight: "2.1 กก.",
        chiefComplaint: "เหาในหู ตบหัวบ่อย",
        diagnosis: "Ear Mite Infestation (เหาในหู)",
        treatment: "ทำความสะอาดหู, หยอดยากำจัดเหา",
        medications: ["Ivermectin drops 1 หยด/ข้าง 2 ครั้ง", "Vitamin B Complex 2 หยด/วัน"],
        vet: "สพ.ว. สุภา มีสุข",
        notes: "นัดติดตามอาการ 2 สัปดาห์",
      },
    ],
  },
  {
    id: 11, hn: "HN-2026-011", name: "ชาร์ลี", nameEn: "Charlie", species: "สุนัข", breed: "บีเกิ้ล", gender: "เพศผู้",
    weight: "9.5 กก.", age: "5 ปี", microchip: "985111333555777", color: "น้ำตาล-ขาว-ดำ",
    owner: "ธีรพล วงศ์สุวรรณ", ownerPhone: "085-777-8899",
    allergies: "ไม่มี", chronic: "ไม่มี", sterilized: false,
    image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&q=80&auto=format&fit=crop",
    vaccines: [
      { name: "พิษสุนัขบ้า", date: "12 ก.ย. 2568", nextDue: "12 ก.ย. 2569", batch: "RB-2025-020" },
      { name: "DHPP", date: "12 ก.ย. 2568", nextDue: "12 ก.ย. 2569", batch: "DH-2025-021" },
    ],
    surgeries: [{ name: "ผ่าตัดฟันผุ", date: "15 ส.ค. 2568", vet: "สพ.ว. สมชาย", notes: "ถอนฟัน 2 ซี่ ฟื้นตัวดี" }],
    visits: 33,
    visitHistory: [
      {
        id: 1, date: "2 มี.ค. 2569", time: "10:30 น.", type: "OPD", weight: "9.5 กก.",
        chiefComplaint: "ติดตามผลหลังผ่าตัด 7 วัน",
        diagnosis: "ฟื้นตัวดีหลังผ่าตัดฟัน ไม่มีภาวะแทรกซ้อน",
        treatment: "ตรวจช่องปาก ล้างแผล",
        medications: ["Amoxicillin 250mg 2x1 PC 3 วัน"],
        vet: "สพ.ว. วรรณา จันทร์",
        notes: "ฟื้นตัวดี แผลปิดสนิท",
      },
    ],
  },
  {
    id: 12, hn: "HN-2026-012", name: "เดซี่", nameEn: "Daisy", species: "นก", breed: "คอกคาเทล", gender: "เพศเมีย",
    weight: "0.085 กก.", age: "1 ปี", microchip: "-", color: "เทา-เหลือง-ขาว",
    owner: "ธีรพล วงศ์สุวรรณ", ownerPhone: "085-777-8899",
    allergies: "ไม่มี", chronic: "ไม่มี", sterilized: false,
    image: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=400&q=80&auto=format&fit=crop",
    vaccines: [],
    surgeries: [],
    visits: 2,
    visitHistory: [
      {
        id: 1, date: "10 ม.ค. 2569", time: "11:00 น.", type: "OPD", weight: "0.085 กก.",
        chiefComplaint: "ตรวจสุขภาพทั่วไป",
        diagnosis: "สุขภาพปกติ",
        treatment: "ตรวจร่างกายทั่วไป",
        medications: ["Vitamin A supplement 1 หยด/วัน 7 วัน"],
        vet: "สพ.ว. สุภา มีสุข",
        notes: "สุขภาพดี ควรเพิ่มของเล่นในกรง",
      },
    ],
  },
  {
    id: 13, hn: "HN-2026-013", name: "เบลล่า", nameEn: "Bella", species: "สุนัข", breed: "ลาบราดอร์ รีทรีฟเวอร์", gender: "เพศเมีย",
    weight: "24.3 กก.", age: "3 ปี", microchip: "985144556677889", color: "สีดำ",
    owner: "ปรียาภรณ์ ทองดี", ownerPhone: "094-321-6543",
    allergies: "ไม่มี", chronic: "ไม่มี", sterilized: true,
    image: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400&q=80&auto=format&fit=crop",
    vaccines: [
      { name: "พิษสุนัขบ้า", date: "5 ต.ค. 2568", nextDue: "5 ต.ค. 2569", batch: "RB-2025-025" },
      { name: "DHPP", date: "5 ต.ค. 2568", nextDue: "5 ต.ค. 2569", batch: "DH-2025-026" },
    ],
    surgeries: [{ name: "ทำหมัน", date: "8 ก.ค. 2566", vet: "สพ.ว. สุภา", notes: "ผ่าตัดปกติ ฟื้นตัวดี" }],
    visits: 5,
    visitHistory: [
      {
        id: 1, date: "10 ก.ย. 2568", time: "09:00 น.", type: "OPD", weight: "24.3 กก.",
        chiefComplaint: "ตรวจสุขภาพก่อนฉีดวัคซีน",
        diagnosis: "สุขภาพปกติ",
        treatment: "ตรวจร่างกายทั่วไป ฉีดวัคซีนประจำปี",
        medications: [],
        vet: "สพ.ว. สมชาย รักสัตว์",
        notes: "นัดวัคซีนครั้งต่อไป ต.ค. 2569",
      },
    ],
  },
];

interface PetsContextType {
  pets: Pet[];
  addPet: (pet: Pet) => void;
  updatePet: (id: number, patch: Partial<Pet>) => void;
  deletePet: (id: number) => void;
  getPet: (id: number) => Pet | undefined;
}

const PetsContext = createContext<PetsContextType | null>(null);

export function PetsProvider({ children }: { children: ReactNode }) {
  const [pets, setPets] = useState<Pet[]>(initialPets);

  const addPet = (pet: Pet) => setPets(prev => [pet, ...prev]);
  const updatePet = (id: number, patch: Partial<Pet>) =>
    setPets(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)));
  const deletePet = (id: number) => setPets(prev => prev.filter(p => p.id !== id));
  const getPet = (id: number) => pets.find(p => p.id === id);

  return (
    <PetsContext.Provider value={{ pets, addPet, updatePet, deletePet, getPet }}>
      {children}
    </PetsContext.Provider>
  );
}

export function usePets() {
  const ctx = useContext(PetsContext);
  if (!ctx) throw new Error("usePets must be used within PetsProvider");
  return ctx;
}
