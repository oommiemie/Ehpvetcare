import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft, Bed, Activity, Pill, Receipt, LogOut,
  Phone, FileText, Heart, Droplet,
  ClipboardList, FlaskConical, Image as ImageIcon, Stethoscope,
  Utensils, Scissors, Bug,
} from "lucide-react";

/* ─── Tab icons (new -pet.png set) ─── */
import imgOverview     from "@/assets/medical-record-pet.png";
import imgVitals       from "@/assets/vital-sign-pet.png";
import imgNursing      from "@/assets/Nurs-recode-pet.png";
import imgIO           from "@/assets/food-pet.png";
import imgLab          from "@/assets/lab-pet.png";
import imgXray         from "@/assets/xray-pet.png";
import imgDrug         from "@/assets/drug-pet.png";
import imgDiet         from "@/assets/Diet-Plan-pet.png";
import imgSurgery      from "@/assets/operation-pet.png";
import imgProcedures   from "@/assets/treatment-pet.png";
import imgDeworming    from "@/assets/parasite.png";
import imgBilling      from "@/assets/service-pet.png";
import imgDischarge    from "@/assets/Discharge-pet.png";
import imgEMR          from "@/assets/emr-pet.png";
import { useIPD, type AdmitSeverity } from "../contexts/IPDContext";
import { usePets } from "../contexts/PetsContext";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useConfirm } from "../contexts/ConfirmContext";
import { useLang } from "../contexts/LanguageContext";
import { formatPhone } from "../utils/format";
import { OverviewTab } from "../components/ipd/OverviewTab";
import { VitalSignsTab } from "../components/ipd/VitalSignsTab";
import { NursingNotesTab } from "../components/ipd/NursingNotesTab";
import { IOFeedingTab } from "../components/ipd/IOFeedingTab";
import { LabTab } from "../components/ipd/LabTab";
import { ImagingTab } from "../components/ipd/ImagingTab";
import { DrugMARTab } from "../components/ipd/DrugMARTab";
import { DietPlanTab } from "../components/ipd/DietPlanTab";
import { SurgeryRecordTab } from "../components/ipd/SurgeryRecordTab";
import { ProceduresTab } from "../components/ipd/ProceduresTab";
import { DewormingTab } from "../components/DewormingTab";
import { BillingTab } from "../components/ipd/BillingTab";
import { EMRTab } from "../components/ipd/EMRTab";
import { DischargeTab } from "../components/ipd/DischargeTab";

type TabKey = "overview" | "vital" | "nursing" | "io" | "diet" | "lab" | "xray" | "drug" | "surgery" | "procedures" | "deworming" | "emr" | "billing" | "discharge";

const sevCfg: Record<AdmitSeverity, { color: string; bg: string; grad: string }> = {
  Critical:    { color: "#ef4444", bg: "rgba(239,68,68,0.10)",  grad: "linear-gradient(135deg, #f87171, #dc2626)" },
  Observation: { color: "#f59e0b", bg: "rgba(245,158,11,0.10)", grad: "linear-gradient(135deg, #fbbf24, #d97706)" },
  Recovering:  { color: "#10b981", bg: "rgba(16,185,129,0.10)", grad: "linear-gradient(135deg, #34d399, #059669)" },
  Isolation:   { color: "#8b5cf6", bg: "rgba(139,92,246,0.10)", grad: "linear-gradient(135deg, #a78bfa, #7c3aed)" },
};

const tabs: { key: TabKey; labelKey: string; icon: typeof Activity; img?: string }[] = [
  { key: "overview",  labelKey: "ipd.tab.overview",   icon: ClipboardList, img: imgOverview },
  { key: "vital",     labelKey: "ipd.tab.vital",      icon: Heart,         img: imgVitals },
  { key: "nursing",   labelKey: "ipd.tab.nursing",    icon: Activity,      img: imgNursing },
  { key: "io",        labelKey: "ipd.tab.io",         icon: Droplet,       img: imgIO },
  { key: "diet",      labelKey: "ipd.tab.diet",       icon: Utensils,      img: imgDiet },
  { key: "lab",       labelKey: "ipd.tab.lab",        icon: FlaskConical,  img: imgLab },
  { key: "xray",      labelKey: "ipd.tab.xray",       icon: ImageIcon,     img: imgXray },
  { key: "drug",      labelKey: "ipd.tab.drug",       icon: Pill,          img: imgDrug },
  { key: "surgery",   labelKey: "ipd.tab.surgery",    icon: Scissors,      img: imgSurgery },
  { key: "procedures",labelKey: "ipd.tab.procedures", icon: Stethoscope,   img: imgProcedures },
  { key: "deworming", labelKey: "ipd.tab.deworming",  icon: Bug,           img: imgDeworming },
  { key: "emr",       labelKey: "ipd.tab.emr",        icon: FileText,      img: imgEMR },
  { key: "billing",   labelKey: "ipd.tab.billing",    icon: Receipt,       img: imgBilling },
  { key: "discharge", labelKey: "ipd.tab.discharge",  icon: LogOut,        img: imgDischarge },
];

export function IPDPatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAdmit, discharge, admits } = useIPD();
  const { pets } = usePets();
  const { showSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const admit = id ? getAdmit(parseInt(id)) : undefined;
  const pet = admit ? pets.find(p => p.hn === admit.hn) : undefined;
  const isFemale = pet?.gender?.includes("เมีย");
  const isMale = pet?.gender?.includes("ผู้");

  /* DEBUG */
  console.log("[IPD] PatientDetail mounted", { id, parsedId: id ? parseInt(id) : null, foundAdmit: !!admit, totalAdmits: admits.length, admitIds: admits.map(a => a.id) });

  if (!admit) {
    return (
      <div className="p-4 min-h-full flex items-center justify-center" style={{ background: "#FEFBF8" }}>
        <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-gray-100" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-100 mb-3">
            <Bed className="w-7 h-7 text-gray-400" strokeWidth={1.6} />
          </div>
          <div className="text-[14px] text-gray-900" style={{ fontWeight: 700 }}>ไม่พบข้อมูลผู้ป่วยใน</div>
          <div className="text-[12px] text-gray-500 mt-1">ผู้ป่วยอาจถูก Discharge หรือ ID ไม่ถูกต้อง</div>
          <button onClick={() => navigate("/ipd/ward")} className="vet-btn vet-btn-primary mt-4">
            <ArrowLeft className="w-3.5 h-3.5" /> กลับไป Ward
          </button>
        </div>
      </div>
    );
  }

  const sev = sevCfg[admit.severity] ?? sevCfg.Observation;

  const handleDischarge = async () => {
    const ok = await confirm({
      title: `Discharge ${admit.petName}?`,
      description: "แนะนำให้ไปที่ Discharge tab เพื่อกรอกสรุปการรักษา · ยากลับบ้าน · นัด follow-up ก่อน",
      confirmLabel: "Discharge ทันที",
      kind: "danger",
    });
    if (!ok) return;
    discharge(admit.id);
    showSnackbar("success", `Discharge ${admit.petName} สำเร็จ`);
    navigate("/ipd/ward");
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto p-4 gap-4" style={{ background: "#FEFBF8" }}>
      {/* APPBAR */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between gap-3 bg-white rounded-2xl px-3 py-2 border border-gray-100 flex-shrink-0"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate("/ipd/ward")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
            style={{ fontWeight: 500 }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> กลับ
          </button>
          <div className="hidden sm:flex items-center gap-2 min-w-0 text-[12px]">
            <span className="text-gray-400">IPD</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 truncate" style={{ fontWeight: 600 }}>{admit.petName}</span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-500 truncate" style={{ fontWeight: 500 }}>{admit.hn}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="hidden md:inline-flex items-center gap-1.5 h-[34px] pl-2.5 pr-3 rounded-full text-[12px] text-white"
            style={{
              fontWeight: 700,
              background: sev.color,
              border: `1px solid ${sev.color}`,
              boxShadow: `0 4px 14px ${sev.color}55, inset 0 1px 0 rgba(255,255,255,0.30)`,
              textShadow: "0 1px 2px rgba(0,0,0,0.15)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/85" />
            {admit.severity}
          </span>

          <span className="hidden md:block w-px h-5 bg-gray-200" />

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleDischarge}
            className="h-[34px] inline-flex items-center gap-1.5 text-[12px] pl-2.5 pr-3 rounded-full text-white transition-all hover:brightness-110 hover:-translate-y-0.5"
            style={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #f87171, #dc2626)",
              border: "1px solid #b91c1c",
              boxShadow: "0 4px 14px rgba(239,68,68,0.40), inset 0 1px 0 rgba(255,255,255,0.40)",
              textShadow: "0 1px 2px rgba(0,0,0,0.15)",
            }}
          >
            <LogOut className="w-3.5 h-3.5 text-white" strokeWidth={2.8} />
            <span className="hidden sm:inline">Discharge</span>
          </motion.button>
        </div>
      </motion.div>

      {/* HERO */}
      <motion.section
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl overflow-hidden bg-gray-200 flex-shrink-0"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <img src={admit.photo} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: "blur(36px) saturate(150%)", transform: "scale(1.4)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.55) 100%)" }} />
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45) 50%, transparent)" }} />
        </div>

        <div className="relative p-4">
          {/* Top row */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-shrink-0">
              <div
                className="rounded-full p-[3px]"
                style={{
                  background: "conic-gradient(from 180deg, #a78bfa, #ec4899, #f59e0b, #22c55e, #3b82f6, #a78bfa)",
                  boxShadow: "0 10px 28px rgba(0,0,0,0.25)",
                }}
              >
                <div className="w-[84px] h-[84px] rounded-full overflow-hidden bg-white">
                  <img src={admit.photo} alt={admit.petName} className="w-full h-full object-cover" />
                </div>
              </div>
              {(isMale || isFemale) && (
                <span
                  className="absolute -bottom-1 right-0 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{
                    background: isFemale ? "linear-gradient(135deg, #f472b6, #db2777)" : "linear-gradient(135deg, #38bdf8, #0284c7)",
                    border: "3px solid #ffffff",
                    boxShadow: isFemale ? "0 3px 10px rgba(236,72,153,0.45)" : "0 3px 10px rgba(14,165,233,0.45)",
                  }}
                >
                  <span className="text-[13px] text-white" style={{ fontWeight: 700, lineHeight: 1 }}>{isFemale ? "♀" : "♂"}</span>
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-white" style={{ fontWeight: 700, fontSize: "calc(24px * var(--fs))", letterSpacing: "-0.5px", lineHeight: 1.3, paddingBottom: 2, textShadow: "0 2px 8px rgba(0,0,0,0.35)" }}>
                  {admit.petName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-white" style={{ background: sev.grad, boxShadow: `0 2px 6px ${sev.color}55`, fontWeight: 600 }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/85" /> {admit.severity}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-white" style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.30)", backdropFilter: "blur(8px)", fontWeight: 600 }}>
                  <Bed className="w-2.5 h-2.5" /> {admit.cageId} · {admit.cageType}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-white" style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.24)", backdropFilter: "blur(8px)", fontWeight: 700, letterSpacing: "0.2px" }}>
                  {admit.hn}
                </span>
              </div>
              <p className="text-white/85 truncate" style={{ fontSize: "calc(12.5px * var(--fs))", fontWeight: 500, textShadow: "0 1px 4px rgba(0,0,0,0.30)" }}>
                {admit.species} · {admit.breed} · {admit.diagnosis}{admit.diagnosisCode && ` (${admit.diagnosisCode})`}
              </p>
              <p className="text-white/70 truncate mt-0.5" style={{ fontSize: "calc(11.5px * var(--fs))", fontWeight: 500, textShadow: "0 1px 4px rgba(0,0,0,0.30)" }}>
                <Phone className="w-3 h-3 inline -mt-0.5 mr-1" />
                {admit.owner} · {formatPhone(admit.ownerPhone)} · <Stethoscope className="w-3 h-3 inline -mt-0.5 mx-1" /> {admit.doctor}
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap justify-end flex-shrink-0">
              <button
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-white transition-all hover:-translate-y-0.5"
                style={{
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.30)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  fontWeight: 600,
                  textShadow: "0 1px 2px rgba(0,0,0,0.15)",
                }}
              >
                <FileText className="w-3.5 h-3.5" /> พิมพ์บันทึก IPD
              </button>
            </div>
          </div>

          {/* Tab bar */}
          <div className="relative bg-white rounded-full border border-gray-100 mt-5 px-1.5 py-1" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.10)" }}>
            <div className="overflow-x-auto scrollbar-hide" style={{ paddingTop: 6, paddingBottom: 6, marginTop: -6, marginBottom: -6 }}>
              <div className="flex items-center gap-1 min-w-min">
                {tabs.map(tab => {
                  const Ico = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <motion.button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      whileTap={{ scale: 0.94 }}
                      className="relative inline-flex items-center gap-1.5 pl-1.5 pr-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0"
                      style={{
                        color: isActive ? "#ffffff" : "#374151",
                        fontSize: "calc(12px * var(--fs))",
                        fontWeight: isActive ? 700 : 600,
                        textShadow: isActive ? "0 1px 2px rgba(0,0,0,0.15)" : "none",
                      }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#f9fafb"; }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="ipd-tab-indicator"
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: "linear-gradient(135deg, #19a589 0%, #0d7c66 100%)",
                            border: "1px solid #0d7c66",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.30)",
                          }}
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span
                        className="relative z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isActive ? "#ffffff" : "#f3f4f6",
                          boxShadow: isActive ? "inset 0 1px 0 rgba(255,255,255,0.40)" : "none",
                          transition: "background 0.2s ease",
                        }}
                      >
                        {tab.img ? (
                          <motion.img
                            src={tab.img}
                            alt=""
                            className="w-4 h-4 object-contain"
                            animate={isActive ? { rotate: [0, -10, 8, 0], scale: [1, 1.15, 1] } : { rotate: 0, scale: 1 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                          />
                        ) : (
                          <motion.span
                            animate={isActive ? { rotate: [0, -10, 8, 0], scale: [1, 1.15, 1] } : { rotate: 0, scale: 1 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            className="flex items-center justify-center"
                          >
                            <Ico className="w-3.5 h-3.5" strokeWidth={2.2} style={{ color: isActive ? "#0d7c66" : "#6b7280" }} />
                          </motion.span>
                        )}
                      </span>
                      <span className="relative z-10">{t(tab.labelKey)}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* TAB BODY */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="pb-4"
      >
        {activeTab === "overview"  && <OverviewTab admit={admit} />}
        {activeTab === "vital"     && <VitalSignsTab admitId={admit.id} />}
        {activeTab === "nursing"   && <NursingNotesTab admitId={admit.id} />}
        {activeTab === "io"        && <IOFeedingTab admitId={admit.id} />}
        {activeTab === "diet"      && <DietPlanTab admitId={admit.id} patientSpecies={admit.species} />}
        {activeTab === "lab"       && <LabTab admitId={admit.id} />}
        {activeTab === "xray"      && <ImagingTab admitId={admit.id} />}
        {activeTab === "drug"      && <DrugMARTab admitId={admit.id} patientWeightKg={parseFloat((pet?.weight ?? "").replace(/[^\d.]/g, "")) || 0} petAllergies={pet?.allergies} />}
        {activeTab === "surgery"   && <SurgeryRecordTab admitId={admit.id} />}
        {activeTab === "procedures" && <ProceduresTab admitId={admit.id} />}
        {activeTab === "deworming"  && <DewormingTab storageKey={`vet-pet-deworming-${admit.hn}`} />}
        {activeTab === "emr"       && <EMRTab admit={admit} pet={pet} />}
        {activeTab === "billing"   && <BillingTab admit={admit} />}
        {activeTab === "discharge" && <DischargeTab admit={admit} />}
      </motion.div>
    </div>
  );
}
