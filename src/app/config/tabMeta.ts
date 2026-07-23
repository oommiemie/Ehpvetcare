/* ชื่อ + ไอคอนแท็บสำหรับหน้าตั้งค่า — ดึงมาไว้ที่เดียวเพื่อไม่ต้อง import
   หน้า Visits/IPDPatientDetail (ไฟล์ใหญ่มาก) เข้ามาในหน้าตั้งค่า
   ⚠️ ต้องแก้ที่นี่ด้วยทุกครั้งที่เพิ่ม/ลบแท็บในหน้านั้น */
import imgRegister     from "@/assets/medical-record-pet.png";
import imgVitals       from "@/assets/vital-sign-pet.png";
import imgExam         from "@/assets/Check-up-pet.png";
import imgDiagnosis    from "@/assets/diagnose-pet.png";
import imgVaccine      from "@/assets/vaccine-pet.png";
import imgDeworming    from "@/assets/parasite.png";
import imgLab          from "@/assets/lab-pet.png";
import imgXray         from "@/assets/xray-pet.png";
import imgPrescription from "@/assets/drug-pet.png";
import imgProcedures   from "@/assets/treatment-pet.png";
import imgService      from "@/assets/service-pet.png";
import imgAppointment  from "@/assets/appointment-pet.png";
import imgEMR          from "@/assets/emr-pet.png";
import imgNursing      from "@/assets/Nurs-recode-pet.png";
import imgIO           from "@/assets/food-pet.png";
import imgDiet         from "@/assets/Diet-Plan-pet.png";
import imgSurgery      from "@/assets/operation-pet.png";
import imgDischarge    from "@/assets/Discharge-pet.png";

export interface TabMeta { key: string; label: string; img: string }

export const OPD_TAB_META: TabMeta[] = [
  { key: "register",     label: "บันทึกส่งตรวจ",   img: imgRegister },
  { key: "vitals",       label: "สัญญาณชีพ",       img: imgVitals },
  { key: "exam",         label: "ตรวจร่างกาย",     img: imgExam },
  { key: "diagnosis",    label: "วินิจฉัย",         img: imgDiagnosis },
  { key: "vaccine",      label: "วัคซีน",           img: imgVaccine },
  { key: "deworming",    label: "ถ่ายพยาธิ",        img: imgDeworming },
  { key: "lab",          label: "แล็บ",             img: imgLab },
  { key: "imaging",      label: "Medical Imaging", img: imgXray },
  { key: "prescription", label: "ใบสั่งยา",         img: imgPrescription },
  { key: "procedures",   label: "หัตถการ",          img: imgProcedures },
  { key: "service",      label: "ค่าบริการ",        img: imgService },
  { key: "appointment",  label: "นัดหมาย",          img: imgAppointment },
  { key: "emr",          label: "EMR",             img: imgEMR },
  { key: "payment",      label: "ชำระเงิน",         img: imgService },
];

export const IPD_TAB_META: TabMeta[] = [
  { key: "overview",   label: "ภาพรวม",          img: imgRegister },
  { key: "vital",      label: "Vital Signs",     img: imgVitals },
  { key: "nursing",    label: "บันทึกพยาบาล",     img: imgNursing },
  { key: "io",         label: "เฝ้าระวัง & I/O",  img: imgIO },
  { key: "diet",       label: "Diet Plan",       img: imgDiet },
  { key: "lab",        label: "Lab",             img: imgLab },
  { key: "xray",       label: "Medical Imaging", img: imgXray },
  { key: "drug",       label: "ใบสั่งยา",         img: imgPrescription },
  { key: "surgery",    label: "ผ่าตัด",           img: imgSurgery },
  { key: "procedures", label: "หัตถการ",          img: imgProcedures },
  { key: "deworming",  label: "ถ่ายพยาธิ",        img: imgDeworming },
  { key: "emr",        label: "EMR",             img: imgEMR },
  { key: "billing",    label: "ค่าใช้จ่าย",       img: imgService },
  { key: "discharge",  label: "Discharge",       img: imgDischarge },
];
