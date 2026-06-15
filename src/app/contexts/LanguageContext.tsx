import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Lang = "th" | "en";

const STORAGE_KEY = "ehp-lang";

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Translation dictionary. Add a `th` and `en` entry per key.
 * Missing keys fall back to the key string itself.
 */
const dict: Record<string, Record<Lang, string>> = {
  // ─── Sidebar navigation ──────────────────────────────
  "nav.group.overview":  { th: "ภาพรวม",          en: "Overview" },
  "nav.group.data":      { th: "ข้อมูล",           en: "Data" },
  "nav.group.services":  { th: "บริการ",           en: "Services" },
  "nav.group.ipd":       { th: "IPD ผู้ป่วยใน",   en: "IPD (Inpatient)" },
  "nav.group.finance":   { th: "การเงิน & สินค้า", en: "Finance & Inventory" },
  "nav.group.system":    { th: "ระบบ",             en: "System" },

  "nav.dashboard":       { th: "แดชบอร์ด",         en: "Dashboard" },
  "nav.owners":          { th: "เจ้าของสัตว์",     en: "Owners" },
  "nav.pets":            { th: "สัตว์เลี้ยง",      en: "Pets" },
  "nav.visits":          { th: "การตรวจรักษา",     en: "Visits" },
  "nav.appointments":    { th: "นัดหมาย",          en: "Appointments" },
  "nav.schedule":        { th: "ตารางแพทย์",       en: "Doctor schedule" },
  "nav.grooming":        { th: "บริการอาบน้ำ",     en: "Grooming" },
  "nav.boarding":        { th: "ฝากเลี้ยง",        en: "Boarding" },
  "nav.ipdDashboard":    { th: "IPD Dashboard",   en: "IPD Dashboard" },
  "nav.ward":            { th: "Ward ผู้ป่วยใน",  en: "Ward (Inpatient)" },
  "nav.ipdReports":      { th: "รายงาน IPD",       en: "IPD Reports" },
  "nav.financial":       { th: "การเงิน",           en: "Financial" },
  "nav.retail":          { th: "ร้านค้า & POS",    en: "Shop & POS" },
  "nav.stock":           { th: "จัดการ Stock",     en: "Stock" },
  "nav.reports":         { th: "รายงาน",           en: "Reports" },
  "nav.notifications":   { th: "การแจ้งเตือน",     en: "Notifications" },
  "nav.settings":        { th: "ตั้งค่า",          en: "Settings" },

  // Sidebar header
  "app.name":            { th: "EHP VetCare",     en: "EHP VetCare" },
  "app.tagline":         { th: "ระบบจัดการคลินิก", en: "Clinic management" },
  "sidebar.collapse":    { th: "ย่อเมนู",          en: "Collapse" },
  "sidebar.expand":      { th: "ขยายเมนู",         en: "Expand" },
  "user.role.fallback":  { th: "เจ้าหน้าที่",     en: "Staff" },
  "user.online":         { th: "ออนไลน์",          en: "Online" },
  "user.logout":         { th: "ออกจากระบบ",       en: "Logout" },
  "user.editAccount":    { th: "ตั้งค่าบัญชี",    en: "Account settings" },
  "user.permissions":    { th: "สิทธิ์",            en: "Permissions" },
  "user.username":       { th: "Username",        en: "Username" },

  // ─── Dashboard ───────────────────────────────────────
  "welcome.back":        { th: "ยินดีต้อนรับกลับมา",     en: "Welcome back" },
  "greeting.morning":    { th: "สวัสดีตอนเช้า",          en: "Good morning" },
  "greeting.afternoon":  { th: "สวัสดีตอนบ่าย",          en: "Good afternoon" },
  "greeting.evening":    { th: "สวัสดีตอนเย็น",          en: "Good evening" },
  "greeting.night":      { th: "สวัสดีตอนค่ำ",           en: "Good night" },
  "dashboard.addCase":   { th: "เพิ่มเคสใหม่",            en: "New case" },
  "dashboard.viewAppts": { th: "ดูนัด",                  en: "Appointments" },
  "vet.fallback":        { th: "สัตวแพทย์",              en: "Veterinarian" },

  // KPI labels
  "kpi.revenue":         { th: "รายได้รวม",              en: "Total revenue" },
  "kpi.cases":           { th: "จำนวนเคส",               en: "Cases" },
  "kpi.drugSales":       { th: "ยอดขายยา",               en: "Drug sales" },
  "kpi.profit":          { th: "กำไรสุทธิ",               en: "Net profit" },
  "kpi.newClients":      { th: "ลูกค้าใหม่",              en: "New clients" },
  "kpi.avgPerCase":      { th: "เฉลี่ย/เคส",              en: "Avg / case" },

  // Section titles
  "section.revenueTrend":   { th: "เทรนด์รายได้",          en: "Revenue trend" },
  "section.revenueBreak":   { th: "สัดส่วนรายได้",         en: "Revenue breakdown" },
  "section.topSelling":     { th: "รายการขายดี Top 10",   en: "Top 10 selling" },
  "section.bySpecies":      { th: "สัดส่วนตามชนิดสัตว์",   en: "Share by species" },
  "section.byHour":         { th: "เคสตามช่วงเวลา",       en: "Cases by hour" },
  "section.byDiagnosis":    { th: "เคสตามโรค/การวินิจฉัย", en: "Cases by diagnosis" },

  // ─── Common action buttons ───────────────────────────
  "btn.add":             { th: "เพิ่ม",                  en: "Add" },
  "btn.edit":            { th: "แก้ไข",                  en: "Edit" },
  "btn.delete":          { th: "ลบ",                     en: "Delete" },
  "btn.save":            { th: "บันทึก",                  en: "Save" },
  "btn.cancel":          { th: "ยกเลิก",                  en: "Cancel" },
  "btn.confirm":         { th: "ยืนยัน",                  en: "Confirm" },
  "btn.close":           { th: "ปิด",                     en: "Close" },
  "btn.search":          { th: "ค้นหา",                   en: "Search" },
  "btn.filter":          { th: "กรอง",                    en: "Filter" },
  "btn.export":          { th: "ส่งออก",                   en: "Export" },
  "btn.print":           { th: "พิมพ์",                    en: "Print" },
  "btn.back":            { th: "กลับ",                    en: "Back" },
  "btn.next":            { th: "ถัดไป",                   en: "Next" },
  "btn.prev":            { th: "ก่อนหน้า",                en: "Previous" },
  "btn.viewAll":         { th: "ดูทั้งหมด",               en: "View all" },
  "btn.viewMore":        { th: "ดูเพิ่ม",                 en: "View more" },
  "btn.expand":          { th: "ขยาย",                    en: "Expand" },
  "btn.collapse":        { th: "ย่อ",                     en: "Collapse" },
  "btn.show":            { th: "แสดง",                    en: "Show" },
  "btn.hide":            { th: "ซ่อน",                    en: "Hide" },
  "btn.refresh":         { th: "รีเฟรช",                   en: "Refresh" },
  "btn.upload":          { th: "อัพโหลด",                  en: "Upload" },
  "btn.download":        { th: "ดาวน์โหลด",                en: "Download" },
  "btn.submit":          { th: "ส่ง",                      en: "Submit" },
  "btn.continue":        { th: "ดำเนินการต่อ",             en: "Continue" },
  "btn.discard":         { th: "ทิ้ง",                     en: "Discard" },

  // ─── Common labels / fields ──────────────────────────
  "common.all":          { th: "ทั้งหมด",                 en: "All" },
  "common.none":         { th: "ไม่มี",                   en: "None" },
  "common.optional":     { th: "ไม่บังคับ",                en: "Optional" },
  "common.required":     { th: "บังคับ",                   en: "Required" },
  "common.loading":      { th: "กำลังโหลด...",             en: "Loading..." },
  "common.empty":        { th: "ยังไม่มีข้อมูล",           en: "No data" },
  "common.today":        { th: "วันนี้",                   en: "Today" },
  "common.yesterday":    { th: "เมื่อวาน",                 en: "Yesterday" },
  "common.tomorrow":     { th: "พรุ่งนี้",                 en: "Tomorrow" },
  "common.thisWeek":     { th: "สัปดาห์นี้",               en: "This week" },
  "common.thisMonth":    { th: "เดือนนี้",                 en: "This month" },
  "common.thisYear":     { th: "ปีนี้",                     en: "This year" },

  "field.name":          { th: "ชื่อ",                     en: "Name" },
  "field.phone":         { th: "เบอร์โทรศัพท์",            en: "Phone" },
  "field.email":         { th: "อีเมล",                    en: "Email" },
  "field.address":       { th: "ที่อยู่",                   en: "Address" },
  "field.date":          { th: "วันที่",                    en: "Date" },
  "field.time":          { th: "เวลา",                     en: "Time" },
  "field.note":          { th: "หมายเหตุ",                  en: "Note" },
  "field.status":        { th: "สถานะ",                    en: "Status" },
  "field.type":          { th: "ประเภท",                   en: "Type" },
  "field.amount":        { th: "จำนวน",                   en: "Amount" },
  "field.price":         { th: "ราคา",                    en: "Price" },
  "field.total":         { th: "รวม",                     en: "Total" },
  "field.species":       { th: "ชนิดสัตว์",                en: "Species" },
  "field.breed":         { th: "พันธุ์",                    en: "Breed" },
  "field.weight":        { th: "น้ำหนัก",                  en: "Weight" },
  "field.age":           { th: "อายุ",                    en: "Age" },
  "field.gender":        { th: "เพศ",                     en: "Sex" },
  "field.diagnosis":     { th: "การวินิจฉัย",              en: "Diagnosis" },
  "field.symptoms":      { th: "อาการ",                   en: "Symptoms" },
  "field.treatment":     { th: "การรักษา",                en: "Treatment" },
  "field.doctor":        { th: "แพทย์",                    en: "Doctor" },
  "field.owner":         { th: "เจ้าของ",                  en: "Owner" },
  "field.pet":           { th: "สัตว์เลี้ยง",              en: "Pet" },
  "field.dose":          { th: "ขนาดยา",                  en: "Dose" },
  "field.route":         { th: "ช่องทาง",                 en: "Route" },
  "field.frequency":     { th: "ความถี่",                  en: "Frequency" },
  "field.duration":      { th: "ระยะเวลา",                en: "Duration" },

  // Generic statuses
  "status.pending":      { th: "รอ",                     en: "Pending" },
  "status.inProgress":   { th: "กำลังดำเนินการ",          en: "In progress" },
  "status.completed":    { th: "เสร็จแล้ว",               en: "Completed" },
  "status.cancelled":    { th: "ยกเลิก",                  en: "Cancelled" },
  "status.active":       { th: "ใช้งาน",                  en: "Active" },
  "status.inactive":     { th: "ไม่ใช้งาน",                en: "Inactive" },
  "status.enabled":      { th: "เปิดใช้งาน",              en: "Enabled" },
  "status.disabled":     { th: "ปิดใช้งาน",                en: "Disabled" },

  // ─── IPD / Ward terms ────────────────────────────────
  "ipd.admit":           { th: "Admit",                  en: "Admit" },
  "ipd.discharge":       { th: "Discharge",              en: "Discharge" },
  "ipd.admitNew":        { th: "Admit ใหม่",              en: "New admission" },
  "ipd.cancelAdmit":     { th: "ยกเลิก admit",           en: "Cancel admission" },
  "ipd.ward":            { th: "Ward",                   en: "Ward" },
  "ipd.cage":            { th: "กรง",                    en: "Cage" },
  "ipd.cages":           { th: "ห้อง/กรง",                en: "Rooms / cages" },
  "ipd.bed":             { th: "เตียง",                  en: "Bed" },
  "ipd.admitDate":       { th: "วันที่ Admit",            en: "Admit date" },
  "ipd.severity":        { th: "ระดับ",                  en: "Severity" },
  "ipd.duration":        { th: "ระยะเวลา",                en: "Duration" },
  "ipd.an":              { th: "AN (Admission No.)",     en: "AN (Admission No.)" },
  "ipd.hn":              { th: "HN",                     en: "HN" },

  // IPD tabs
  "ipd.tab.overview":    { th: "ภาพรวม",                 en: "Overview" },
  "ipd.tab.vitals":      { th: "Vital Signs",            en: "Vital Signs" },
  "ipd.tab.nursing":     { th: "บันทึกพยาบาล",           en: "Nursing notes" },
  "ipd.tab.io":          { th: "I/O & อาหาร",            en: "I/O & Feeding" },
  "ipd.tab.diet":        { th: "Diet Plan",              en: "Diet Plan" },
  "ipd.tab.lab":         { th: "Lab",                    en: "Lab" },
  "ipd.tab.xray":        { th: "X-Ray",                  en: "X-Ray" },
  "ipd.tab.medication":  { th: "ใบสั่งยา",                en: "Medication" },
  "ipd.tab.surgery":     { th: "ผ่าตัด",                  en: "Surgery" },
  "ipd.tab.billing":     { th: "ค่าใช้จ่าย",              en: "Billing" },
  "ipd.tab.discharge":   { th: "Discharge",              en: "Discharge" },

  // Ward management (settings)
  "ward.manage":         { th: "จัดการ Ward (IPD)",      en: "Manage Wards (IPD)" },
  "ward.addNew":         { th: "เพิ่ม Ward",             en: "Add Ward" },
  "ward.addCage":        { th: "เพิ่มห้อง",               en: "Add room" },
  "ward.empty":          { th: "ยังไม่มี Ward — กดปุ่ม \"เพิ่ม Ward\" ด้านบน", en: "No wards yet — tap \"Add Ward\" above" },

  // ─── Settings page ───────────────────────────────────
  "settings.title":      { th: "ตั้งค่าระบบ",             en: "Settings" },
  "settings.subtitle":   { th: "จัดการข้อมูลพื้นฐาน • ผู้ใช้งาน • การแจ้งเตือน", en: "Manage master data • users • notifications" },
  "settings.adminOnly":  { th: "เฉพาะผู้ดูแลระบบ",        en: "Admin only" },
  "settings.tab.notify": { th: "ระบบแจ้งเตือน",          en: "Notifications" },
  "settings.tab.master": { th: "ข้อมูลพื้นฐาน",          en: "Master data" },
  "settings.tab.users":  { th: "ระบบผู้ใช้งาน",          en: "Users" },
  "settings.sub.notify":    { th: "ตั้งค่าการแจ้งเตือน",  en: "Alert preferences" },
  "settings.sub.drugs":     { th: "รายการยา",            en: "Drugs" },
  "settings.sub.species":   { th: "ประเภทสัตว์",          en: "Species" },
  "settings.sub.breeds":    { th: "พันธุ์สัตว์",          en: "Breeds" },
  "settings.sub.services":  { th: "ค่าบริการ",            en: "Services" },
  "settings.sub.vaccines":  { th: "วัคซีน",              en: "Vaccines" },
  "settings.sub.wards":     { th: "Ward (IPD)",         en: "Ward (IPD)" },
  "settings.sub.rooms":     { th: "ห้องทำงาน",          en: "Rooms" },
  "settings.sub.personnel": { th: "บุคลากร",              en: "Personnel" },
  "settings.sub.roles":     { th: "กำหนดสิทธิ์ Role",    en: "Roles" },
  "settings.sub.access":    { th: "สิทธิ์เข้าใช้งาน",     en: "Access control" },

  // ─── Owners page ─────────────────────────────────────
  "owners.title":           { th: "เจ้าของสัตว์",                en: "Pet Owners" },
  "owners.subtitle":        { th: "จัดการข้อมูลลูกค้าและสัตว์เลี้ยง", en: "Manage clients and their pets" },
  "owners.searchPlaceholder": { th: "ค้นหาชื่อ, เบอร์โทร, บัตรประชาชน...", en: "Search name, phone, ID..." },
  "owners.add":             { th: "เพิ่มเจ้าของ",                en: "Add owner" },
  "owners.addSuccess":      { th: "เพิ่มเจ้าของสัตว์สำเร็จแล้ว", en: "Owner added successfully" },
  "owners.pets":            { th: "สัตว์เลี้ยง",                en: "Pets" },
  "owners.visits":          { th: "ครั้งที่ตรวจ",                en: "Visits" },
  "owners.totalSpent":      { th: "ค่าใช้จ่ายรวม",                en: "Total spent" },
  "owners.lastVisit":       { th: "ตรวจล่าสุด",                  en: "Last visit" },
  "owners.empty":           { th: "ยังไม่มีข้อมูลเจ้าของ",        en: "No owners yet" },

  // ─── Pets page ───────────────────────────────────────
  "pets.title":             { th: "สัตว์เลี้ยง",                en: "Pets" },
  "pets.subtitle":          { th: "จัดการข้อมูลสัตว์เลี้ยงและประวัติการรักษา", en: "Manage pet profiles and history" },
  "pets.searchPlaceholder": { th: "ค้นหาชื่อสัตว์, HN, เจ้าของ...", en: "Search pet name, HN, owner..." },
  "pets.add":               { th: "เพิ่มสัตว์เลี้ยง",            en: "Add pet" },

  // ─── IPD Dashboard / Ward / Patient Detail ───────────
  "ipd.dashboard.title":    { th: "IPD Dashboard",            en: "IPD Dashboard" },
  "ipd.dashboard.subtitle": { th: "ภาพรวมผู้ป่วยใน",            en: "Inpatient overview" },
  "ipd.ward.title":         { th: "Ward ผู้ป่วยใน",            en: "Ward (Inpatient)" },
  "ipd.ward.subtitle":      { th: "ภาพรวมการเข้าพักของผู้ป่วย", en: "Patient occupancy overview" },
  "ipd.ward.search":        { th: "ค้นหา ชื่อ / HN / กรง",     en: "Search name / HN / cage" },
  "ipd.ward.level":         { th: "ระดับ",                    en: "Severity" },
  "ipd.appBar.back":        { th: "กลับ",                     en: "Back" },
  "ipd.printRecord":        { th: "พิมพ์บันทึก IPD",            en: "Print IPD record" },

  "ipd.severity.critical":     { th: "วิกฤต",         en: "Critical" },
  "ipd.severity.observation":  { th: "เฝ้าระวัง",     en: "Observation" },
  "ipd.severity.recovering":   { th: "ฟื้นฟู",         en: "Recovering" },
  "ipd.severity.isolation":    { th: "แยกกักโรค",     en: "Isolation" },

  // ─── IPD KPI strip + summaries ───────────────────────
  "ipd.kpi.activeDrugs":    { th: "ยาใช้งาน",         en: "Active drugs" },
  "ipd.kpi.pending":        { th: "รอให้ยา",          en: "Pending doses" },
  "ipd.kpi.late":           { th: "เลยเวลา",          en: "Late" },

  // ─── Common phrases used widely ──────────────────────
  "common.success":         { th: "สำเร็จ",            en: "Success" },
  "common.error":           { th: "เกิดข้อผิดพลาด",    en: "Error" },
  "common.warning":         { th: "คำเตือน",           en: "Warning" },
  "common.info":            { th: "ข้อมูล",             en: "Info" },
  "common.deleted":         { th: "ลบแล้ว",            en: "Deleted" },
  "common.saved":           { th: "บันทึกแล้ว",        en: "Saved" },
  "common.updated":         { th: "อัปเดตแล้ว",        en: "Updated" },
  "common.records":         { th: "รายการ",            en: "records" },
  "common.persons":         { th: "คน",                en: "persons" },
  "common.cases":           { th: "เคส",                en: "cases" },
  "common.times":           { th: "ครั้ง",             en: "times" },
  "common.items":           { th: "ชิ้น",              en: "items" },
  "common.days":            { th: "วัน",                en: "days" },
  "common.hours":           { th: "ชม.",               en: "hrs" },
  "common.minutes":         { th: "นาที",              en: "min" },

  // ─── Lang picker ─────────────────────────────────────
  "lang.thai":           { th: "ไทย",                    en: "Thai" },
  "lang.english":        { th: "อังกฤษ",                 en: "English" },

  // ─── Page hero titles + subtitles ────────────────────
  "visits.title":           { th: "ระบบตรวจรักษา",            en: "Visits" },
  "visits.subtitle":        { th: "จัดการเคสตรวจรักษา OPD",   en: "Manage outpatient visits" },
  "visits.search":          { th: "ค้นหาชื่อสัตว์, HN, เจ้าของ...", en: "Search pet, HN, owner..." },
  "visits.new":             { th: "เปิดเคสใหม่",              en: "New case" },

  "appointments.title":     { th: "นัดหมาย",                  en: "Appointments" },
  "appointments.subtitle":  { th: "ตารางนัดหมายและจองคิว",      en: "Booking schedule" },
  "appointments.new":       { th: "นัดหมายใหม่",              en: "New appointment" },

  "schedule.title":         { th: "ตารางแพทย์",                en: "Doctor Schedule" },
  "schedule.subtitle":      { th: "จัดตารางคิวของสัตวแพทย์",  en: "Vet roster &amp; slots" },
  "schedule.newSlot":       { th: "+ สร้าง Slot",              en: "+ New slot" },

  "grooming.title":         { th: "บริการอาบน้ำ-ตัดขน",         en: "Grooming" },
  "grooming.subtitle":      { th: "จัดการคิว Grooming",         en: "Manage grooming queue" },

  "boarding.title":         { th: "ระบบฝากเลี้ยง",              en: "Pet Boarding" },
  "boarding.subtitle":      { th: "จัดการห้องพัก/กรง และการจองฝากเลี้ยง", en: "Manage rooms &amp; bookings" },

  "ipdReports.title":       { th: "รายงาน IPD",                 en: "IPD Reports" },
  "ipdReports.subtitle":    { th: "สรุปข้อมูลผู้ป่วยใน",         en: "Inpatient summaries" },

  "financial.title":        { th: "ระบบการเงิน",                en: "Financial" },
  "financial.subtitle":     { th: "ใบแจ้งหนี้, การชำระเงิน และคืนเงิน", en: "Invoices, payments &amp; refunds" },

  "retail.title":           { th: "ร้านค้า & POS",              en: "Shop &amp; POS" },
  "retail.subtitle":        { th: "จัดการสินค้า สต็อก และจุดขาย", en: "Products, stock &amp; sales" },
  "retail.salesReport":     { th: "รายงานยอดขาย",                en: "Sales report" },
  "retail.latestReceipts":  { th: "ใบเสร็จล่าสุด",                en: "Latest receipts" },
  "retail.tab.pos":         { th: "ขายสินค้า (POS)",             en: "Sell (POS)" },
  "retail.tab.stock":       { th: "สต็อกสินค้า",                 en: "Inventory" },
  "retail.tab.history":     { th: "ประวัติการขาย",               en: "Sales history" },

  "stock.title":            { th: "จัดการ Stock คลังสินค้า",    en: "Stock &amp; Inventory" },
  "stock.subtitle":         { th: "ติดตามและบริหารสินค้าคงเหลือ", en: "Track and manage stock" },
  "stock.movement":         { th: "ความเคลื่อนไหว",              en: "Movement" },
  "stock.po":               { th: "ใบสั่งซื้อสินค้า (PO)",       en: "Purchase orders" },
  "stock.add":              { th: "เพิ่มสินค้า",                 en: "Add product" },
  "stock.kpi.total":        { th: "จำนวนทั้งหมด",                en: "Total products" },
  "stock.kpi.value":        { th: "มูลค่าสินค้า",                en: "Stock value" },
  "stock.kpi.low":          { th: "Stock ใกล้หมด",               en: "Low stock" },
  "stock.kpi.out":          { th: "ขาด Stock",                   en: "Out of stock" },

  "reports.title":          { th: "ระบบรายงาน",                  en: "Reports" },
  "reports.subtitle":       { th: "รายงานและสถิติ",              en: "Statistics &amp; analytics" },

  "notifications.title":    { th: "การแจ้งเตือน",                en: "Notifications" },
  "notifications.unreadCount": { th: "ยังไม่อ่าน {n} รายการ",   en: "{n} unread" },
  "notifications.allRead":  { th: "อ่านครบทุกรายการแล้ว",        en: "All caught up" },
  "notifications.markAllRead": { th: "ทำเครื่องหมายอ่านทั้งหมด", en: "Mark all read" },
  "notifications.filter.all":      { th: "ทั้งหมด",     en: "All" },
  "notifications.filter.vaccine":  { th: "วัคซีน",      en: "Vaccines" },
  "notifications.filter.appointment": { th: "นัดหมาย",  en: "Appointments" },
  "notifications.filter.drug":     { th: "ยา",          en: "Medications" },
  "notifications.filter.boarding": { th: "ฝากเลี้ยง",   en: "Boarding" },
  "notifications.filter.system":   { th: "ระบบ",        en: "System" },

  "emr.title":              { th: "EHR — เวชระเบียนอิเล็กทรอนิกส์", en: "EHR — Electronic Health Records" },
  "emr.subtitle":           { th: "ประวัติการรักษาทั้งหมด",       en: "Complete medical history" },

  "dashboard.title":        { th: "แดชบอร์ด",                    en: "Dashboard" },
  "dashboard.subtitle":     { th: "ภาพรวมคลินิก",                 en: "Clinic overview" },

  "settings.adminBadge":    { th: "เฉพาะผู้ดูแลระบบ",            en: "Admin only" },

  // ─── IPD Patient Detail tabs ─────────────────────────
  "ipd.tab.overview":       { th: "ภาพรวม",                       en: "Overview" },
  "ipd.tab.vital":          { th: "Vital Signs",                  en: "Vital Signs" },
  "ipd.tab.nursing":        { th: "บันทึกพยาบาล",                  en: "Nursing notes" },
  "ipd.tab.io":             { th: "I/O & อาหาร",                   en: "I/O & Diet" },
  "ipd.tab.diet":           { th: "Diet Plan",                    en: "Diet Plan" },
  "ipd.tab.lab":            { th: "Lab",                          en: "Lab" },
  "ipd.tab.xray":           { th: "X-Ray",                        en: "X-Ray" },
  "ipd.tab.drug":           { th: "ใบสั่งยา",                      en: "Prescriptions" },
  "ipd.tab.surgery":        { th: "ผ่าตัด",                        en: "Surgery" },
  "ipd.tab.procedures":     { th: "หัตถการ",                       en: "Procedures" },
  "ipd.tab.deworming":      { th: "ถ่ายพยาธิ",                     en: "Deworming" },
  "ipd.tab.billing":        { th: "ค่าใช้จ่าย",                    en: "Billing" },
  "ipd.tab.discharge":      { th: "Discharge",                    en: "Discharge" },

  // ─── OPD Visit detail tabs ───────────────────────────
  "opd.tab.register":       { th: "บันทึกส่งตรวจ",                  en: "Check-in" },
  "opd.tab.vitals":         { th: "สัญญาณชีพ",                      en: "Vital Signs" },
  "opd.tab.exam":           { th: "ตรวจร่างกาย",                    en: "Examination" },
  "opd.tab.diagnosis":      { th: "วินิจฉัย",                       en: "Diagnosis" },
  "opd.tab.vaccine":        { th: "วัคซีน",                         en: "Vaccine" },
  "opd.tab.deworming":      { th: "ถ่ายพยาธิ",                      en: "Deworming" },
  "opd.tab.lab":            { th: "แล็บ / เอกซเรย์",                 en: "Lab / X-Ray" },
  "opd.tab.prescription":   { th: "ใบสั่งยา",                       en: "Prescription" },
  "opd.tab.service":        { th: "ค่าบริการ",                      en: "Services" },
  "opd.tab.payment":        { th: "ชำระเงิน",                       en: "Payment" },
  "opd.tab.appointment":    { th: "นัดหมาย",                        en: "Appointment" },
  "opd.tab.emr":            { th: "EMR",                          en: "EMR" },
};

function loadLang(): Lang {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "th" || raw === "en") return raw;
  } catch { /* ignore */ }
  return "th";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => loadLang());

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* ignore */ }
    document.documentElement.lang = lang === "th" ? "th-TH" : "en-US";
  }, [lang]);

  const t = (key: string) => dict[key]?.[lang] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang: setLangState, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
