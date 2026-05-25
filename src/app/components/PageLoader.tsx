import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import clinicLogo from "@/assets/logo ehpvetcare.png";

export function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar
    const start = performance.now();
    const duration = 1600;

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(elapsed / duration, 1);
      // Ease-out curve
      setProgress(1 - Math.pow(1 - pct, 3));
      if (pct < 1) requestAnimationFrame(tick);
      else {
        setTimeout(() => setVisible(false), 200);
      }
    };
    requestAnimationFrame(tick);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: "#FEFBF8" }}
        >
          {/* Background blobs */}
          <div
            className="absolute w-[520px] h-[520px] rounded-full opacity-[0.07] blur-3xl pointer-events-none"
            style={{ background: "#19a589", top: "-80px", right: "-100px" }}
          />
          <div
            className="absolute w-[360px] h-[360px] rounded-full opacity-[0.05] blur-3xl pointer-events-none"
            style={{ background: "#19a589", bottom: "-40px", left: "-80px" }}
          />

          {/* Logo + text */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-5"
          >
            {/* Icon ring */}
            <div className="relative">
              {/* Rotating outer ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
                className="absolute rounded-full"
                style={{
                  border: "2.5px solid transparent",
                  borderTopColor: "#19a589",
                  borderRightColor: "rgba(25,165,137,0.30)",
                  width: 104,
                  height: 104,
                  top: -8,
                  left: -8,
                }}
              />
              {/* Logo bubble — brand gradient card */}
              <motion.div
                animate={{ rotate: [0, -6, 6, -6, 0] }}
                transition={{ delay: 0.5, duration: 0.6, ease: "easeInOut" }}
                className="rounded-3xl flex items-center justify-center overflow-hidden"
                style={{
                  width: 88,
                  height: 88,
                  background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
                  border: "1px solid rgba(255,255,255,0.6)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,1), 0 12px 36px rgba(25,165,137,0.40), 0 4px 12px rgba(0,0,0,0.10)",
                }}
              >
                <img src={clinicLogo} alt="EHP VetCare" className="w-[72px] h-[72px] object-contain" />
              </motion.div>
            </div>

            {/* Name */}
            <div className="text-center">
              <div
                className="text-2xl tracking-tight"
                style={{ color: "#0a3d33", fontWeight: 800, letterSpacing: "-0.02em" }}
              >
                EHP VetCare
              </div>
              <div
                className="text-sm mt-1"
                style={{ color: "#19a589", fontWeight: 500, opacity: 0.8 }}
              >
                ระบบจัดการคลินิกสัตวแพทย์
              </div>
            </div>

            {/* Progress bar */}
            <div
              className="w-48 h-1 rounded-full overflow-hidden mt-2"
              style={{ background: "rgba(25,165,137,0.12)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${progress * 100}%`,
                  background: "linear-gradient(90deg, #19a589, #4dd4b0)",
                }}
              />
            </div>

            {/* Dot pulse */}
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#19a589" }}
                  animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.1, 0.8] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.18,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}