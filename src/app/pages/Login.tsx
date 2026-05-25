import { useState } from "react";
import { useNavigate } from "react-router";
import {
  User, Lock, Eye, EyeOff, AlertCircle, ShieldCheck, Check,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";

import clinicLogo from "@/assets/logo ehpvetcare.png";
import bgLogin from "@/assets/bglogin.png";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

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

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ═══ Full-screen bg image ═══ */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${bgLogin})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Very subtle tint to bind the design to the page (no heavy overlay — let the photo breathe) */}
      <div
        aria-hidden
        className="absolute inset-0 lg:hidden"
        style={{
          background: "linear-gradient(180deg, rgba(254,251,248,0.30) 0%, rgba(254,251,248,0.55) 70%, rgba(254,251,248,0.85) 100%)",
        }}
      />

      {/* Right-aligned card container */}
      <div className="relative min-h-screen flex items-center justify-center lg:justify-end px-6 sm:px-10 lg:pr-[8%] lg:pl-10 py-10">

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[440px]"
        >
          {/* ═══ Login Card — soft glass on teal bg ═══ */}
          <div
            className="relative rounded-[28px] overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.92)",
              border: "1px solid rgba(255,255,255,0.70)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow: "0 30px 80px rgba(8,75,62,0.30), 0 12px 28px rgba(8,75,62,0.18), inset 0 1px 0 rgba(255,255,255,0.95)",
            }}
          >
            {/* Top accent line */}
            <div
              aria-hidden
              className="absolute top-0 left-10 right-10 h-[3px] rounded-full"
              style={{ background: "linear-gradient(90deg, transparent, #19a589 25%, #0d7c66 75%, transparent)" }}
            />

            <div className="p-9 sm:p-10">

              {/* ── Logo + Brand title ── */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col items-center"
              >
                {/* Logo with soft halo */}
                <div className="relative w-[96px] h-[96px] flex items-center justify-center mb-3">
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "radial-gradient(circle, rgba(25,165,137,0.20) 0%, rgba(25,165,137,0.08) 50%, transparent 75%)",
                      filter: "blur(8px)",
                    }}
                  />
                  <img src={clinicLogo} alt="EHP VetCare" className="relative w-[84px] h-[84px] object-contain" />
                </div>

                {/* Brand title */}
                <div className="flex items-baseline gap-1.5" style={{ letterSpacing: "-0.6px" }}>
                  <span style={{ fontWeight: 800, fontSize: 28, background: "linear-gradient(135deg, #19a589 0%, #0d7c66 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    EHP
                  </span>
                  <span className="text-gray-900" style={{ fontWeight: 800, fontSize: 28 }}>
                    VetCare
                  </span>
                </div>

                {/* Subtitle */}
                <p className="text-gray-400 text-[11px] mt-1.5" style={{ fontWeight: 500, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  Veterinary Clinic Management
                </p>
              </motion.div>

              {/* Welcome chip */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, delay: 0.22, ease: "backOut" }}
                className="flex justify-center mt-5 mb-4"
              >
                <span
                  className="inline-flex items-center gap-1.5 pl-1.5 pr-3 py-1 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, rgba(25,165,137,0.10), rgba(13,124,102,0.05))",
                    border: "1px solid rgba(25,165,137,0.20)",
                  }}
                >
                  <span className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #34d399, #059669)" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </span>
                  <span className="text-[11px] text-[#0d7c66]" style={{ fontWeight: 700, letterSpacing: "0.3px" }}>ยินดีต้อนรับกลับ</span>
                </span>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Username */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.32 }}
                  className="relative group"
                >
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#19a589] transition-colors">
                    <User className="w-[18px] h-[18px]" strokeWidth={2} />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(""); }}
                    placeholder="Username"
                    autoComplete="username"
                    className="w-full h-[52px] rounded-full text-[14px] text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.85)",
                      border: "1.5px solid rgba(25,165,137,0.15)",
                      paddingLeft: 48,
                      paddingRight: 16,
                      fontWeight: 500,
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#19a589";
                      e.target.style.background = "#ffffff";
                      e.target.style.boxShadow = "0 0 0 4px rgba(25,165,137,0.10)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(25,165,137,0.15)";
                      e.target.style.background = "rgba(255,255,255,0.85)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </motion.div>

                {/* Password */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.38 }}
                  className="relative group"
                >
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#19a589] transition-colors">
                    <Lock className="w-[18px] h-[18px]" strokeWidth={2} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="Password"
                    autoComplete="current-password"
                    className="w-full h-[52px] rounded-full text-[14px] text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.85)",
                      border: "1.5px solid rgba(25,165,137,0.15)",
                      paddingLeft: 48,
                      paddingRight: 48,
                      fontWeight: 500,
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#19a589";
                      e.target.style.background = "#ffffff";
                      e.target.style.boxShadow = "0 0 0 4px rgba(25,165,137,0.10)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(25,165,137,0.15)";
                      e.target.style.background = "rgba(255,255,255,0.85)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </motion.div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -6, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12.5px] text-rose-700"
                        style={{
                          background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
                          border: "1px solid #fecaca",
                        }}
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" strokeWidth={2.4} />
                        <span style={{ fontWeight: 600 }}>{error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: loading ? 1 : 0.97 }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.44 }}
                  className="w-full h-[52px] mt-1.5 rounded-full text-white text-[14px] flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:brightness-110 hover:-translate-y-0.5 group"
                  style={{
                    background: "linear-gradient(135deg, #19a589 0%, #0d7c66 50%, #084d3f 100%)",
                    border: "1px solid #0d7c66",
                    fontWeight: 700,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    boxShadow: "0 8px 24px rgba(25,165,137,0.40), inset 0 1px 0 rgba(255,255,255,0.30)",
                    textShadow: "0 1px 2px rgba(0,0,0,0.20)",
                  }}
                >
                  {loading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
                        <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      LOADING
                    </>
                  ) : (
                    <>LOGIN</>
                  )}
                </motion.button>
              </form>

              {/* Remember me + Forgot password */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="flex items-center justify-between mt-4"
              >
                <label className="flex items-center gap-2 cursor-pointer group/check select-none">
                  <span
                    className="relative w-[18px] h-[18px] rounded-md flex items-center justify-center transition-all"
                    style={{
                      background: rememberMe ? "linear-gradient(135deg, #19a589, #0d7c66)" : "#ffffff",
                      border: rememberMe ? "1.5px solid #0d7c66" : "1.5px solid #d1d5db",
                      boxShadow: rememberMe ? "0 2px 6px rgba(25,165,137,0.30)" : "none",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    {rememberMe && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </span>
                  <span className="text-[12.5px] text-gray-600 group-hover/check:text-gray-900 transition-colors" style={{ fontWeight: 500 }}>
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  className="text-[12.5px] text-[#0d7c66] hover:text-[#19a589] hover:underline transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  Forgot Password?
                </button>
              </motion.div>

              {/* Security badge — pill */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="flex justify-center mt-6"
              >
                <span
                  className="inline-flex items-center gap-1.5 pl-1.5 pr-3 py-1 rounded-full"
                  style={{
                    background: "rgba(25,165,137,0.06)",
                    border: "1px solid rgba(25,165,137,0.15)",
                  }}
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #34d399, #059669)" }}>
                    <ShieldCheck className="w-3 h-3 text-white" strokeWidth={2.6} />
                  </span>
                  <span className="text-[11px] text-[#0d7c66]" style={{ fontWeight: 600, letterSpacing: "0.2px" }}>
                    เข้ารหัสปลอดภัยตามมาตรฐาน
                  </span>
                </span>
              </motion.div>
            </div>
          </div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="text-center text-[10.5px] text-white/85 mt-5"
            style={{ letterSpacing: "0.3px", textShadow: "0 1px 4px rgba(0,0,0,0.40)" }}
          >
            © {new Date().getFullYear()} EHP VetCare · v1.0
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
