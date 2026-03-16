import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { PawPrint, User, Lock, Eye, EyeOff, LogIn, AlertCircle, Heart, Stethoscope, Syringe, Scissors } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";

import clinicLogo from "figma:asset/9e42a8c1455d674552b44623404a14821a06b85e.png";

const BG_IMG =
  "https://images.unsplash.com/photo-1770836037793-95bdbf190f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZXRlcmluYXJ5JTIwY2xpbmljJTIwcGV0cyUyMGNvenl8ZW58MXx8fHwxNzcyNDM4Njk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

const HINTS = [
  { username: "admin", password: "admin", role: "สัตวแพทย์" },
  { username: "vet", password: "vet123", role: "สัตวแพทย์" },
  { username: "nurse", password: "nurse123", role: "ผู้ช่วยสัตวแพทย์" },
];

const FLOAT_ICONS = [
  { Icon: PawPrint,    x: "12%", y: "18%", size: 22, delay: 0,   duration: 4.5 },
  { Icon: Heart,       x: "80%", y: "12%", size: 18, delay: 0.8, duration: 5.2 },
  { Icon: Stethoscope, x: "72%", y: "70%", size: 24, delay: 1.5, duration: 4.8 },
  { Icon: Syringe,     x: "20%", y: "78%", size: 18, delay: 0.4, duration: 5.5 },
  { Icon: Scissors,    x: "88%", y: "42%", size: 16, delay: 2.0, duration: 4.2 },
  { Icon: PawPrint,    x: "55%", y: "85%", size: 14, delay: 1.2, duration: 5.8 },
  { Icon: Heart,       x: "8%",  y: "50%", size: 14, delay: 2.4, duration: 4.6 },
  { Icon: PawPrint,    x: "65%", y: "22%", size: 16, delay: 3.0, duration: 5.0 },
];

const BUBBLES = [
  { x: "8%",  size: 52, delay: 0,   duration: 12.0, rise: 580 },
  { x: "20%", size: 32, delay: 2.5, duration: 15.0, rise: 620 },
  { x: "35%", size: 64, delay: 1.0, duration: 13.5, rise: 540 },
  { x: "50%", size: 28, delay: 4.0, duration: 16.0, rise: 660 },
  { x: "62%", size: 44, delay: 1.5, duration: 14.0, rise: 600 },
  { x: "75%", size: 36, delay: 3.2, duration: 13.0, rise: 570 },
  { x: "85%", size: 56, delay: 0.5, duration: 15.5, rise: 640 },
  { x: "14%", size: 24, delay: 5.5, duration: 14.5, rise: 550 },
  { x: "44%", size: 40, delay: 3.0, duration: 17.0, rise: 680 },
  { x: "70%", size: 22, delay: 4.8, duration: 12.5, rise: 520 },
  { x: "90%", size: 30, delay: 6.5, duration: 16.5, rise: 610 },
  { x: "28%", size: 48, delay: 7.0, duration: 14.8, rise: 590 },
];

function Particle({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: 3,
        height: 3,
        background: "rgba(255,255,255,0.6)",
      }}
      animate={{ y: [0, -30, 0], opacity: [0, 1, 0], scale: [0, 1, 0] }}
      transition={{ duration: 4 + delay, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: (i * 37 + 11) % 100,
  y: (i * 53 + 7) % 100,
  delay: (i * 0.3) % 4,
}));

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }
    setLoading(true);
    setError("");
    const result = await login(username.trim(), password);
    setLoading(false);
    if (result.success) {
      navigate("/", { replace: true });
    } else {
      setError(result.error ?? "เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as any } },
  };

  return (
    <div className="min-h-screen flex bg-[#FEFBF8] overflow-hidden">

      {/* ═══ LEFT PANEL ═══ */}
      <div
        className="hidden lg:flex flex-col justify-between w-[55%] relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #19a589 0%, #0d7c66 60%, #084d3f 100%)" }}
      >
        {/* Background photo */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${BG_IMG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.18,
          }}
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, rgba(25,165,137,0.75) 0%, rgba(13,124,102,0.80) 60%, rgba(8,77,63,0.90) 100%)",
          }}
        />

        {/* Particles */}
        {PARTICLES.map((p) => (
          <Particle key={p.id} x={p.x} y={p.y} delay={p.delay} />
        ))}

        {/* Floating lucide icons */}
        {FLOAT_ICONS.map(({ Icon, x, y, size, delay, duration }, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: x, top: y }}
            animate={{ y: [0, -16, 0], rotate: [0, 8, -8, 0], opacity: [0.25, 0.55, 0.25] }}
            transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon style={{ width: size, height: size, color: "rgba(255,255,255,0.7)" }} strokeWidth={1.5} />
          </motion.div>
        ))}

        {/* Floating bubbles */}
        {BUBBLES.map(({ x, size, delay, duration, rise }, i) => (
          <motion.div
            key={`bubble-${i}`}
            className="absolute"
            style={{ left: x, bottom: "-80px" }}
            animate={{ y: [0, -rise], opacity: [0, 0.28, 0.18, 0] }}
            transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
          >
            <div
              style={{
                width: size,
                height: size,
                borderRadius: "50%",
                background: "radial-gradient(circle at 32% 32%, rgba(255,255,255,0.22), rgba(255,255,255,0.02))",
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow: "inset 1px 1px 4px rgba(255,255,255,0.15)",
              }}
            />
          </motion.div>
        ))}

        {/* Logo */}
        <motion.div
          className="relative z-10 p-10 flex items-center gap-3"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <motion.img
            src={clinicLogo}
            alt="EHP VetCare"
            className="w-12 h-12 rounded-2xl object-contain"
            style={{
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
            whileHover={{ scale: 1.1, rotate: 8 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <div>
            <div className="text-white" style={{ fontWeight: 700, fontSize: 20 }}>EHP VetCare</div>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>ระบบจัดการคลินิกสัตวแพทย์</div>
          </div>
        </motion.div>

        {/* Center copy */}
        <motion.div
          className="relative z-10 px-12 pb-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.h2
            className="text-white mb-4"
            style={{ fontWeight: 700, fontSize: 34, lineHeight: 1.25 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
          >
            ดูแลสุขภาพสัตว์เลี้ยง<br />อย่างมืออาชีพ
          </motion.h2>
          <motion.p
            style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.7 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
          >
            ระบบจัดการคลินิกสัตวแพทย์ครบวงจร<br />
            บันทึกประวัติ นัดหมาย และติดตามการรักษา
          </motion.p>

          {/* Stat pills */}
          <motion.div
            className="flex gap-4 mt-8 flex-wrap"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12, delayChildren: 0.65 } },
            }}
          >
            {[
              { value: "2,400+", label: "สัตว์เลี้ยง" },
              { value: "1,200+", label: "เจ้าของ" },
              { value: "98%", label: "ความพึงพอใจ" },
            ].map((s) => (
              <motion.div
                key={s.label}
                className="px-4 py-2 rounded-2xl cursor-default"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
                variants={{
                  hidden: { opacity: 0, y: 16, scale: 0.9 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                whileHover={{
                  scale: 1.06,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-white" style={{ fontWeight: 700, fontSize: 18 }}>{s.value}</div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="relative z-10 p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
            © 2026 EHP VetCare · All rights reserved
          </p>
        </motion.div>
      </div>

      {/* ═══ RIGHT PANEL ═══ */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <motion.div
          className="w-full max-w-sm"
          initial="hidden"
          animate={mounted ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {/* Mobile logo */}
          <motion.div className="flex items-center gap-3 mb-8 lg:hidden" variants={itemVariants}>
            <motion.img
              src={clinicLogo}
              alt="EHP VetCare"
              className="w-10 h-10 rounded-2xl object-contain"
              style={{ boxShadow: "0 2px 10px rgba(25,165,137,0.3)" }}
              whileHover={{ rotate: 10, scale: 1.1 }}
            />
            <div>
              <div className="text-gray-900" style={{ fontWeight: 700 }}>EHP VetCare</div>
              <div className="text-xs text-gray-400">ระบบจัดการคลินิกสัตวแพทย์</div>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div className="mb-8" variants={itemVariants}>
            <h1 className="text-gray-900 mb-1" style={{ fontWeight: 700, fontSize: 26 }}>
              เข้าสู่ระบบ
            </h1>
            <p className="text-sm text-gray-400">กรอกชื่อผู้ใช้และรหัสผ่านเพื่อเข้าใช้งาน</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm text-gray-600 mb-1.5" style={{ fontWeight: 500 }}>
                ชื่อผู้ใช้ (Username)
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                  placeholder="กรอกชื่อผู้ใช้"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#19a589]/25 focus:border-[#19a589] transition-all shadow-sm hover:shadow-md"
                  style={{ color: "#0a3d33" }}
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm text-gray-600 mb-1.5" style={{ fontWeight: 500 }}>
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="กรอกรหัสผ่าน"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 text-sm bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#19a589]/25 focus:border-[#19a589] transition-all shadow-sm hover:shadow-md"
                  style={{ color: "#0a3d33" }}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                  whileTap={{ scale: 0.85 }}
                >
                  <AnimatePresence mode="wait">
                    {showPassword ? (
                      <motion.span
                        key="eyeoff"
                        initial={{ opacity: 0, rotate: -30 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 30 }}
                        transition={{ duration: 0.2 }}
                      >
                        <EyeOff className="w-4 h-4" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="eye"
                        initial={{ opacity: 0, rotate: 30 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: -30 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Eye className="w-4 h-4" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600"
                  initial={{ opacity: 0, y: -10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm text-white"
                style={{
                  background: loading
                    ? "#9ac49d"
                    : "linear-gradient(135deg, #19a589 0%, #0d7c66 100%)",
                  boxShadow: loading ? "none" : "0 4px 20px rgba(25,165,137,0.35)",
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                whileHover={!loading ? { scale: 1.03, boxShadow: "0 8px 30px rgba(25,165,137,0.5)" } : {}}
                whileTap={!loading ? { scale: 0.97 } : {}}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.span
                      key="loading"
                      className="flex items-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      กำลังเข้าสู่ระบบ...
                    </motion.span>
                  ) : (
                    <motion.span
                      key="login"
                      className="flex items-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      
                      เข้าสู่ระบบ
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </form>

          {/* Demo accounts hint */}
          <motion.div
            className="mt-6 p-4 rounded-2xl border"
            style={{ background: "#f0f9f0", borderColor: "#d1e8d2" }}
            variants={itemVariants}
          >
            <p className="text-xs mb-2" style={{ color: "#19a589", fontWeight: 600 }}>
              บัญชีทดสอบ
            </p>
            <div className="space-y-1.5">
              {HINTS.map((h, idx) => (
                <motion.button
                  key={h.username}
                  type="button"
                  onClick={() => { setUsername(h.username); setPassword(h.password); setError(""); }}
                  className="w-full flex items-center gap-3 text-left px-3 py-2 rounded-xl transition-colors"
                  style={{ backgroundColor: "rgba(255,255,255,0)" }}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + idx * 0.1, duration: 0.4 }}
                  whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.8)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "#19a589" }}
                  >
                    <span className="text-white" style={{ fontSize: 9, fontWeight: 700 }}>
                      {h.username[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600 flex-1">
                    <span style={{ fontWeight: 600 }}>{h.username}</span>
                    {" / "}
                    <span className="text-gray-400">{h.password}</span>
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(25,165,137,0.12)", color: "#19a589", fontWeight: 500 }}
                  >
                    {h.role}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}