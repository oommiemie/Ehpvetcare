import { motion } from "motion/react";
import { Construction } from "lucide-react";

export function PlaceholderTab({ icon: Ico, title, description }: { icon: typeof Construction; title: string; description?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl border border-gray-100"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
    >
      <div className="p-12 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, rgba(25,165,137,0.10), rgba(13,124,102,0.05))", border: "1px solid rgba(25,165,137,0.15)" }}>
          <Ico className="w-8 h-8 text-[#0d7c66]" strokeWidth={1.8} />
        </div>
        <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "calc(18px * var(--fs))", letterSpacing: "-0.3px" }}>{title}</h3>
        {description && <p className="text-[12.5px] text-gray-500 mt-1 max-w-md" style={{ lineHeight: 1.5 }}>{description}</p>}
        <span className="inline-flex items-center gap-1 mt-4 text-[10.5px] text-amber-700 px-2 py-1 rounded-full" style={{ background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.20)", fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>
          <Construction className="w-3 h-3" /> กำลังพัฒนา
        </span>
      </div>
    </motion.section>
  );
}
