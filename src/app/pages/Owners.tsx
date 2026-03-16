import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, User, Phone, Mail, MapPin, Edit2, Trash2, PawPrint, ChevronRight, Calendar, Heart, ArrowLeft, AlertTriangle } from "lucide-react";
import { AddOwnerModal } from "../components/AddOwnerModal";
import { getSpeciesAvatar, getGenderAvatar } from "../components/petAvatars";
import { useSnackbar } from "../contexts/SnackbarContext";

/* ── Pet name → species mapping for avatar fallback ── */
const petSpeciesMap: Record<string, string> = {
  "บัดดี้": "สุนัข", "ร็อคกี้": "สุนัข", "ลูน่า": "แมว", "แม็กซ์": "สุนัข",
  "เบลล่า": "สุนัข", "โมจิ": "แมว", "โคโค่": "สุนัข", "ชาร์ลี": "แมว",
  "เดซี่": "นก", "โทโร่": "กระต่าย", "ทวีป": "นก", "มิลค์": "สัตว์เลี้ยงขนาดเล็ก",
  "ทองคำ": "ปลา", "เร็กซ์": "สัตว์เลี้ยงคลาน",
};

const initialOwners = [
  {
    id: 1, name: "สมศักดิ์ ใจดี", nickname: "ศักดิ์", gender: "ชาย", phone: "081-234-5678", email: "somsak@email.com",
    lineId: "@somsak", address: "123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110", idCard: "1-1001-00001-00-0",
    pets: ["บัดดี้", "ร็อคกี้"] as string[], joinDate: "15 ม.ค. 2567", totalVisits: 24,
    photo: "https://images.unsplash.com/photo-1718307701476-bf46ac964396?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 2, name: "วรรณา ศรีสุข", nickname: "นุ้ย", gender: "หญิง", phone: "089-876-5432", email: "wanna@email.com",
    lineId: "@wannas", address: "45 ถ.ลาดพร้าว แขวงจอมพล เขตจตุจักร กรุงเทพฯ 10900", idCard: "1-1002-00002-00-0",
    pets: ["ลูน่า"] as string[], joinDate: "22 มี.ค. 2567", totalVisits: 12,
    photo: "https://images.unsplash.com/photo-1570984429335-39f89baffcca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 3, name: "ประพันธ์ มงคล", nickname: "พันธ์", gender: "ชาย", phone: "062-111-2233", email: "praphan@email.com",
    lineId: "@praphanm", address: "78 ถ.พระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310", idCard: "1-1003-00003-00-0",
    pets: ["แม็กซ์", "เบลล่า", "โมจิ"] as string[], joinDate: "8 พ.ย. 2566", totalVisits: 41,
    photo: "https://images.unsplash.com/photo-1729559149688-bee985e447ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 4, name: "อรอนงค์ พรมเสน", nickname: "อ้อ", gender: "หญิง", phone: "091-444-5566", email: "oranong@email.com",
    lineId: "@oranongg", address: "12 ถ.รัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400", idCard: "1-1004-00004-00-0",
    pets: ["โคโค่"] as string[], joinDate: "1 มิ.ย. 2567", totalVisits: 8,
    photo: "https://images.unsplash.com/photo-1770364016646-04cececdde3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 5, name: "ธีรพล วงศ์สุวรรณ", nickname: "ไก่", gender: "ชาย", phone: "085-777-8899", email: "teerapon@email.com",
    lineId: "@teeraponw", address: "99 ถ.เจริญนคร แขวงบางลำภูล่าง เขตคลองสาน กรุงเทพฯ 10600", idCard: "1-1005-00005-00-0",
    pets: ["ชาร์ลี", "เดซี่"] as string[], joinDate: "14 ส.ค. 2566", totalVisits: 33,
    photo: "https://images.unsplash.com/photo-1717985498747-f081679d2c33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 6, name: "ปรียาภรณ์ ทองดี", nickname: "แพร", gender: "หญิง", phone: "094-321-6543", email: "preeyaporn@email.com",
    lineId: "@preeyaphornt", address: "56 ถ.สีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500", idCard: "1-1006-00006-00-0",
    pets: ["เบลล่า"] as string[], joinDate: "10 ก.ย. 2567", totalVisits: 5,
    photo: "https://images.unsplash.com/photo-1770363759112-3f3a3dd874c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
];

/* ── Thai month helper ── */
const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
function todayThai() {
  const d = new Date();
  return `${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
}

export function Owners() {
  const [owners, setOwners] = useState(initialOwners);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(initialOwners[0]);
  const [showForm, setShowForm] = useState(false);
  const [ownerTab, setOwnerTab] = useState("ข้อมูลส่วนตัว");
  const [showDetail, setShowDetail] = useState(false);
  const [editingOwner, setEditingOwner] = useState<null | typeof initialOwners[0]>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { showSnackbar } = useSnackbar();

  const filtered = owners.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.phone.includes(search) ||
    o.idCard.includes(search)
  );

  const handleAddOwner = (data: { name: string; nickname: string; gender: "ชาย" | "หญิง" | ""; idCard: string; phone: string; email: string; lineId: string; address: string }) => {
    if (editingOwner) {
      // Edit mode — update existing owner
      const updated = {
        ...editingOwner,
        name: data.name,
        nickname: data.nickname || "-",
        gender: data.gender || editingOwner.gender,
        phone: data.phone,
        email: data.email || "-",
        lineId: data.lineId || "-",
        address: data.address || "-",
        idCard: data.idCard || "-",
      };
      setOwners(prev => prev.map(o => o.id === editingOwner.id ? updated : o));
      setSelected(updated);
      setEditingOwner(null);
      showSnackbar("update", "อัปเดตข้อมูลเจ้าของสัตว์สำเร็จ");
    } else {
      // Add mode
      const newOwner = {
        id: Date.now(),
        name: data.name,
        nickname: data.nickname || "-",
        gender: data.gender || "ชาย",
        phone: data.phone,
        email: data.email || "-",
        lineId: data.lineId || "-",
        address: data.address || "-",
        idCard: data.idCard || "-",
        pets: [] as string[],
        joinDate: todayThai(),
        totalVisits: 0,
        photo: "",
      };
      setOwners(prev => [newOwner, ...prev]);
      setSelected(newOwner);
      setOwnerTab("ข้อมูลส่วนตัว");
      setShowDetail(true);
      showSnackbar("success", "เพิ่มเจ้าของสัตว์สำเร็จแล้ว");
    }
  };

  const handleEditClick = () => {
    if (!selected) return;
    setEditingOwner(selected);
    setShowForm(true);
  };

  const handleDeleteClick = () => {
    if (!selected) return;
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (!selected) return;
    const remaining = owners.filter(o => o.id !== selected.id);
    setOwners(remaining);
    setSelected(remaining[0] || null as any);
    setShowDeleteConfirm(false);
    setShowDetail(false);
    showSnackbar("delete", `ลบข้อมูล "${selected.name}" เรียบร้อยแล้ว`);
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  };

  const panelVariants = {
    hidden: { opacity: 0, x: 24 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut", delay: 0.1 } },
  };

  return (
    <div className="flex h-full">
      {/* Left: Owner List */}
      <div className={`
        ${showDetail ? "hidden" : "flex"} md:flex
        flex-col w-full md:w-[320px] border-r border-gray-100 bg-white flex-shrink-0
      `}>
        <motion.div
          className="p-4 border-b border-gray-100"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-900" style={{ fontWeight: 600 }}>เจ้าของสัตว์</h2>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 text-white rounded-full flex-shrink-0 active:scale-95 transition-all text-[12px] pl-[14px] pr-[18px] h-[32px]"
              style={{ fontWeight: 600, background: "linear-gradient(135deg,#e8802a,#d06a1a)", boxShadow: "0 2px 12px rgba(232,128,42,0.3)" }}
            >
              <Plus className="w-3.5 h-3.5" />
              เพิ่มใหม่
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ, เบอร์โทร, บัตรประชาชน..."
              className="vet-search"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">พบ {filtered.length} รายการ</p>
        </motion.div>

        <motion.div
          className="flex-1 overflow-y-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filtered.map((owner) => (
            <motion.button
              key={owner.id}
              variants={itemVariants}
              onClick={() => { setSelected(owner); setShowDetail(true); }}
              className={`w-full flex items-center gap-3 p-4 text-left transition-all duration-200 vet-border-b-50 hover:bg-[#e8802a]/5 relative
                ${selected?.id === owner.id ? "bg-gradient-to-r from-[#e8802a]/10 via-[#e8802a]/5 to-transparent" : ""}
              `}
              style={selected?.id === owner.id ? { boxShadow: "inset 3px 0 0 #e8802a, 0 1px 8px rgba(232,128,42,0.08)" } : {}}
            >
              <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden bg-gray-100">
                <img
                  src={owner.photo || getGenderAvatar(owner.gender)}
                  alt={owner.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = getGenderAvatar(owner.gender); }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <div className="text-sm text-gray-800 truncate" style={{ fontWeight: 500 }}>{owner.name}</div>
                </div>
                <div className="text-xs text-gray-400">{owner.phone}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <PawPrint className="w-3 h-3 text-gray-300" />
                  <span className="text-xs text-gray-400">{owner.pets.join(", ")}</span>
                </div>
              </div>
              
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Right: Owner Detail */}
      <motion.div
        className={`
          ${showDetail ? "flex" : "hidden"} md:flex
          flex-col flex-1 overflow-y-auto bg-[#FEFBF8]
        `}
        variants={panelVariants}
        initial="hidden"
        animate="visible"
      >
        {selected ? (
          <>
            {/* Header — light purple banner + pill tabs */}
            <div className="overflow-hidden" style={{ background: "linear-gradient(168deg, #f3eefa 0%, #ede5f7 40%, #e8dff4 100%)", boxShadow: "0 4px 24px rgba(139,92,246,0.10), 0 1px 6px rgba(0,0,0,0.04)" }}>
              {/* ── Light Banner ── */}
              <div className="relative px-4 pt-4 pb-0">
                {/* Radial glow — top-left */}
                <div className="pointer-events-none absolute left-4 top-4 w-48 h-48 rounded-full opacity-[0.15]" style={{ background: "radial-gradient(circle, #c4b5fd 0%, rgba(196,181,253,0.5) 35%, transparent 70%)" }} />

                {/* Main row: Back + Avatar + Info + Buttons */}
                <div className="relative flex items-start gap-4 py-4">
                  {/* Back button — mobile only */}
                  <button
                    onClick={() => setShowDetail(false)}
                    className="md:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-purple-100 text-purple-400 hover:text-purple-600 transition-colors flex-shrink-0 mt-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  {/* Avatar with gradient ring */}
                  <div className="flex-shrink-0 rounded-full p-[2.5px]" style={{ background: "linear-gradient(135deg, #a78bfa 0%, #8B5CF6 50%, #7c3aed 100%)" }}>
                    <div className="w-[60px] h-[60px] rounded-full overflow-hidden bg-white p-[2px]">
                      <div className="w-full h-full rounded-full overflow-hidden bg-gray-200">
                        <img
                          src={selected.photo || getGenderAvatar(selected.gender)}
                          alt={selected.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = getGenderAvatar(selected.gender); }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    {/* Name + Gender badge */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h1 className="text-gray-900 text-2xl truncate" style={{ fontWeight: 700 }}>{selected.name}</h1>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${selected.gender === "หญิง" ? "border-pink-300/40 text-pink-600 bg-pink-50" : "border-sky-300/40 text-sky-600 bg-sky-50"}`} style={{ fontWeight: 600 }}>
                        {selected.gender === "หญิง" ? "♀ หญิง" : "♂ ชาย"}
                      </span>
                    </div>

                    {/* Dot-separated meta info */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap text-[10px]">
                      <span className="text-purple-600/70">"{selected.nickname}"</span>
                      <span className="text-purple-400 text-xs" style={{ fontWeight: 600 }}>·</span>
                      <span className="text-purple-600/70">สมาชิกตั้งแต่ {selected.joinDate}</span>
                      <span className="text-purple-400 text-xs" style={{ fontWeight: 600 }}>·</span>
                      <span className="text-purple-600/70">เข้ารักษา {selected.totalVisits} ครั้ง</span>
                      <span className="text-purple-400 text-xs" style={{ fontWeight: 600 }}>·</span>
                      <span className="text-purple-600/70">สัตว์เลี้ย {selected.pets.length} ตัว</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-1.5 flex-shrink-0 pt-1">
                    <button
                      onClick={handleEditClick}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/70 border border-white/50 rounded-full hover:bg-white/90 text-[#6a7282] transition-colors text-xs" style={{ fontWeight: 500 }}
                    >
                      <Edit2 className="w-3 h-3" />
                      <span className="hidden sm:inline">แก้ไข</span>
                    </button>
                    <button
                      onClick={handleDeleteClick}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/70 border border-white/50 rounded-full hover:bg-white/90 text-[#ff6467] transition-colors text-xs" style={{ fontWeight: 500 }}
                    >
                      <Trash2 className="w-3 h-3" />
                      <span className="hidden sm:inline">ลบ</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Pill Tab Bar ── */}
              <div className="px-4 pb-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-[0px_0px_4px_0px_rgba(0,0,0,0.15)] p-1 flex items-center overflow-x-auto">
                  {["ข้อมูลส่วนตัว", "ข้อมูลการติดต่อ", "สัตว์เลี้ยง"].map((tab) => {
                    const tabIcons: Record<string, typeof User> = {
                      "ข้อมูลส่วนตัว": User,
                      "ข้อมูลการติดต่อ": Phone,
                      "สัตว์เลี้ยง": PawPrint,
                    };
                    const Icon = tabIcons[tab];
                    return (
                    <button
                      key={tab}
                      onClick={() => setOwnerTab(tab)}
                      className={`flex items-center gap-1.5 px-4 py-2 text-xs rounded-full whitespace-nowrap transition-all ${
                        ownerTab === tab
                          ? "bg-[#7c3aed] text-white"
                          : "text-[#6a7282] hover:text-gray-900 hover:bg-gray-100"
                      }`}
                      style={{ fontWeight: ownerTab === tab ? 500 : 400 }}
                    >
                      {Icon && <Icon className="w-3.5 h-3.5" />}
                      {tab}
                    </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-4 md:p-6">
              {ownerTab === "ข้อมูลส่วนตัว" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "ชื่อ-นามสกุล", value: selected.name, icon: User, color: "text-white", bg: "bg-gradient-to-br from-[#20b899] to-[#0a4d3f]" },
                    { label: "ชื่อเล่น", value: selected.nickname, icon: User, color: "text-white", bg: "bg-gradient-to-br from-purple-400 to-purple-600" },
                    { label: "เพศ", value: selected.gender, icon: User, color: "text-white", bg: "bg-blue-50" },
                    { label: "วันที่เป็นสมาชิก", value: selected.joinDate, icon: Calendar, color: "text-white", bg: "bg-gradient-to-br from-indigo-400 to-indigo-600" },
                    { label: "จำนวนครั้งที่เข้ารักษา", value: `${selected.totalVisits} ครั้ง`, icon: Heart, color: "text-white", bg: "bg-gradient-to-br from-red-400 to-red-600" },
                    { label: "สัตว์เลี้ยงที่ลงทะเบียน", value: `${selected.pets.length} ตัว`, icon: PawPrint, color: "text-white", bg: "bg-gradient-to-br from-orange-400 to-orange-600" },
                    { label: "เลขบัตประชาชน", value: selected.idCard, icon: User, color: "text-white", bg: "bg-gradient-to-br from-gray-400 to-gray-600", span: 2 },
                  ].map((f) => {
                    const Icon = f.icon;
                    return (
                      <div key={f.label} className={`bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-start gap-3 ${"span" in f && f.span === 2 ? "sm:col-span-2" : ""}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          f.label === "เพศ"
                            ? selected.gender === "หญิง" ? "bg-gradient-to-br from-pink-400 to-pink-600" : "bg-gradient-to-br from-sky-400 to-sky-600"
                            : f.bg
                        }`}>
                          {f.label === "เพศ" ? (
                            <span className="text-base leading-none select-none text-white" style={{ fontWeight: 700 }}>
                              {selected.gender === "หญิง" ? "♀" : "♂"}
                            </span>
                          ) : (
                            <Icon className={`w-4 h-4 ${f.color}`} />
                          )}
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-0.5">{f.label}</div>
                          <div className={`text-sm text-gray-800 ${
                            f.label === "เพศ" ? (selected.gender === "หญิง" ? "text-pink-600" : "text-sky-600") : ""
                          }`} style={{ fontWeight: 500 }}>{f.value}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {ownerTab === "ข้อมูลการติดต่อ" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "เบอร์โทรศัพท์", value: selected.phone, icon: Phone, color: "text-white", bg: "bg-gradient-to-br from-[#20b899] to-[#0a4d3f]" },
                    { label: "อีเมล", value: selected.email, icon: Mail, color: "text-white", bg: "bg-gradient-to-br from-blue-400 to-blue-600" },
                    { label: "ไลน์ไอดี", value: selected.lineId, icon: User, color: "text-white", bg: "bg-gradient-to-br from-green-400 to-green-600" },
                    { label: "ที่อยู่", value: selected.address, icon: MapPin, color: "text-white", bg: "bg-gradient-to-br from-red-400 to-red-600", span: 2 },
                  ].map((f) => {
                    const Icon = f.icon;
                    return (
                      <div key={f.label} className={`bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-start gap-3 ${"span" in f && f.span === 2 ? "sm:col-span-2" : ""}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${f.bg}`}>
                          <Icon className={`w-4 h-4 ${f.color}`} />
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-0.5">{f.label}</div>
                          <div className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{f.value}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {ownerTab === "สัตว์เลี้ยง" && (
                <div className="">
                  <p className="text-xs text-gray-400 mb-4">ทั้งหมด {selected.pets.length} ตัว</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {selected.pets.map((pet, i) => {
                      const petPhotos: Record<string, string> = {
                        "บัดดี้": "https://images.unsplash.com/photo-1734966213753-1b361564bab4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
                        "ร็อคกี้": "https://images.unsplash.com/photo-1583676271414-526884f52529?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
                        "ลูน่า": "https://images.unsplash.com/photo-1608574592993-774ffa9a218e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
                        "แม็กซ์": "https://images.unsplash.com/photo-1689248762670-0bbbd4be1411?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
                        "เบลล่า": "https://images.unsplash.com/photo-1604242251651-546f5f05ccb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
                        "โมจิ": "https://images.unsplash.com/photo-1634546865062-ed3eb17643f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
                        "โคโค่": "https://images.unsplash.com/photo-1707014047917-d9633a49d39e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
                        "ชาร์ลี": "https://images.unsplash.com/photo-1665918577658-c7cddc5fd53c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
                        "เดซี่": "https://images.unsplash.com/photo-1685387714439-edef4bd70ef5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
                      };
                      const photo = petPhotos[pet];
                      return (
                      <div key={i} className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-[#19a589]/30 hover:bg-[#19a589]/5 cursor-pointer transition-all">
                        {photo ? (
                          <img src={photo} alt={pet} className="w-9 h-9 rounded-full object-cover flex-shrink-0 border-2 border-[#19a589]/20" />
                        ) : (
                          <img src={getSpeciesAvatar(petSpeciesMap[pet] ?? "สุนัข")} alt={pet} className="w-9 h-9 rounded-full object-cover flex-shrink-0 border-2 border-[#19a589]/20" />
                        )}
                        <div>
                          <div className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{pet}</div>
                          <div className="text-xs text-gray-400">ดูโปรไฟล์</div>
                        </div>
                      </div>
                      );
                    })}
                    <button className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-dashed border-gray-200 hover:border-[#19a589]/40 hover:bg-[#19a589]/5 transition-all text-gray-400 hover:text-[#19a589]">
                      <div className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div className="text-sm">เพิ่มสัตว์เลี้ยง</div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p>เลือกเจ้าของสัตว์เพื่อดูรายละเอียด</p>
          </div>
        )}
      </motion.div>

      {/* Add Owner Modal */}
      <AddOwnerModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditingOwner(null); }}
        onSave={handleAddOwner}
        initialData={editingOwner ? {
          name: editingOwner.name,
          nickname: editingOwner.nickname === "-" ? "" : editingOwner.nickname,
          gender: editingOwner.gender as "ชาย" | "หญิง" | "",
          idCard: editingOwner.idCard === "-" ? "" : editingOwner.idCard,
          phone: editingOwner.phone,
          email: editingOwner.email === "-" ? "" : editingOwner.email,
          lineId: editingOwner.lineId === "-" ? "" : editingOwner.lineId,
          address: editingOwner.address === "-" ? "" : editingOwner.address,
        } : null}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}
                className="w-full max-w-[400px] bg-white rounded-3xl shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="vet-modal-header rounded-t-3xl" style={{ background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)" }}>
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
                        <Trash2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-sm text-gray-900" style={{ fontWeight: 700 }}>ยืนยันการลบข้อมูล</h2>
                        <p className="text-[11px] text-gray-500 mt-0.5">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-2xl border border-red-100">
                    <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden bg-gray-100">
                      <img
                        src={selected.photo || getGenderAvatar(selected.gender)}
                        alt={selected.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = getGenderAvatar(selected.gender); }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate" style={{ fontWeight: 600 }}>{selected.name}</p>
                      <p className="text-xs text-gray-400">{selected.phone} · สัตว์เลี้ยง {selected.pets.length} ตัว</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    ข้อมูลเจ้าของสัตว์และประวัติทั้งหมดจะถูกลบออกจากระบบ
                  </p>
                </div>

                {/* Footer */}
                <div className="vet-modal-footer rounded-b-3xl">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="vet-btn vet-btn-secondary"
                    style={{ width: 110 }}
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="flex items-center justify-center gap-1.5 text-sm px-5 py-2 text-white rounded-full transition-all active:scale-[0.97]"
                    style={{ fontWeight: 600, background: "linear-gradient(135deg, #ef4444, #dc2626)", boxShadow: "0 4px 14px rgba(239,68,68,0.3)" }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    ลบข้อมูล
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}