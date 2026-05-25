import React, { useState, useRef } from "react";
import {
  Image as ImageIcon, Upload, X, Trash2, ZoomIn, Plus,
  MapPin, ChevronDown, ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/* ─── Body Map Images from Figma ─── */
import catRightImg from "figma:asset/40402e1fc23bdb0509811e58a7d43ffef14b150d.png";
import catLeftImg from "figma:asset/0b0dc1ccca6907aa85de38d05366238b95f7b9b0.png";
import catFrontImg from "figma:asset/1fb22cc072c2ef657817b7da5fa5d9b570213158.png";
import dogRightImg from "figma:asset/7420aafa4c528eb73e01eb48ed938f7bc9c6a5b6.png";
import dogLeftImg from "figma:asset/dabc1dde7ee39c828a8bc0af4d57252f6be31025.png";
import dogFrontImg from "figma:asset/685b071d7b37b3001e6a3724026392aacc03e658.png";

/* ─── Types ─── */
interface AttachedImage {
  id: string;
  url: string;
  name: string;
  size: string;
}

interface PinMarker {
  id: string;
  x: number;
  y: number;
  name: string;
  detail: string;
  color: string;
}

/* ─── View Tabs ─── */
type BodyView = "right" | "left" | "front";
const BODY_VIEWS: { key: BodyView; label: string }[] = [
  { key: "right", label: "ด้านขวา" },
  { key: "left", label: "ด้านซ้าย" },
  { key: "front", label: "ด้านหน้า" },
];

/* ─── Get body illustration for species + view ─── */
function getBodySvg(species: string | undefined, view: BodyView): string {
  const isCat = species === "แมว";
  if (view === "front") return isCat ? catFrontImg : dogFrontImg;
  if (view === "left") return isCat ? catLeftImg : dogLeftImg;
  return isCat ? catRightImg : dogRightImg;
}

const PIN_COLORS = ["#ef4444", "#f97316", "#3b82f6", "#22c55e", "#8b5cf6"];

/* ─── Body Map with Pins ─── */
function BodyMapPanel({ species }: { species?: string }) {
  const [activeView, setActiveView] = useState<BodyView>("right");
  const [pinColor, setPinColor] = useState(PIN_COLORS[0]);
  const [pins, setPins] = useState<PinMarker[]>([]);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formDetail, setFormDetail] = useState("");
  const [showPinList, setShowPinList] = useState(true);
  const [mapBase, setMapBase] = useState<"template" | "photo">("template");
  const [uploadedPhoto, setUploadedPhoto] = useState<string | undefined>();
  const photoRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const bodyImgSrc = getBodySvg(species, activeView);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-pin]")) return;
    const rect = mapRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const newPin: PinMarker = {
      id: `pin-${Date.now()}`,
      x, y,
      name: `จุดที่ ${pins.length + 1}`,
      detail: "",
      color: pinColor,
    };
    setPins(prev => [...prev, newPin]);
    setSelectedPinId(newPin.id);
    setFormName(newPin.name);
    setFormDetail("");
  };

  const selectPin = (pin: PinMarker) => {
    setSelectedPinId(pin.id);
    setFormName(pin.name);
    setFormDetail(pin.detail);
  };

  const savePin = () => {
    if (!selectedPinId) return;
    setPins(prev => prev.map(p => p.id === selectedPinId ? { ...p, name: formName, detail: formDetail } : p));
    setSelectedPinId(null);
  };

  const deletePin = (id: string) => {
    setPins(prev => prev.filter(p => p.id !== id));
    if (selectedPinId === id) setSelectedPinId(null);
  };

  const handlePhoto = (files: FileList | null) => {
    if (!files?.[0]) return;
    const reader = new FileReader();
    reader.onload = e => setUploadedPhoto(e.target?.result as string);
    reader.readAsDataURL(files[0]);
  };

  return (
    <div className="space-y-3">
      {/* Header: Title left, Color picker right */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-vet-teal" />
          <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>แผนผังร่างกาย</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">สีเครื่องหมาย:</span>
          <div className="flex items-center gap-1.5">
            {PIN_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setPinColor(c)}
                className={`w-[28px] h-[28px] rounded-full transition-transform hover:scale-110 ${pinColor === c ? "scale-110 ring-[1.9px] ring-white" : ""}`}
                style={{
                  background: c,
                  boxShadow: pinColor === c ? `0 0 0 1.9px white, 0 0 0 0 ${c}` : undefined,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Body: Map left + Pin list right */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-start">
        {/* Map area */}
        <div className="flex flex-col gap-1.5 min-w-0 lg:flex-1" style={{ height: "clamp(250px, 40vw, 350px)" }}>
          <div className="relative flex-1 rounded-[14px] border border-gray-200 bg-gray-50 overflow-visible">
            {/* View tabs - top right */}
            {mapBase === "template" && (
              <div className="absolute top-2.5 right-2.5 z-10 flex items-center bg-white border border-gray-200 rounded-full p-0.5 shadow-sm">
                {BODY_VIEWS.map(v => (
                  <button
                    key={v.key}
                    onClick={() => setActiveView(v.key)}
                    className={`px-3 py-1.5 text-[11px] rounded-full transition-all ${
                      activeView === v.key
                        ? "bg-vet-teal text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                    style={{ fontWeight: activeView === v.key ? 600 : 400 }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            )}

            {mapBase === "photo" && (
              <div className="absolute top-2.5 right-2.5 z-10">
                <button onClick={() => photoRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 text-xs bg-white border border-gray-200 rounded-full hover:border-vet-teal/40 text-gray-500 transition-all">
                  <Upload className="w-3 h-3" />
                  {uploadedPhoto ? "เปลี่ยนรูปภาพ" : "เลือกรูปภาพ"}
                </button>
              </div>
            )}
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={e => handlePhoto(e.target.files)} />

            {/* Clickable map */}
            <div
              ref={mapRef}
              onClick={handleMapClick}
              className="absolute inset-0 cursor-crosshair select-none rounded-[14px]"
            >
              {mapBase === "template" && (
                <img src={bodyImgSrc} alt="body map" className="absolute inset-0 w-full h-full object-contain pointer-events-none rounded-[14px] opacity-90 p-2" />
              )}
              {mapBase === "photo" && uploadedPhoto && (
                <img src={uploadedPhoto} alt="base" className="absolute inset-0 w-full h-full object-contain pointer-events-none rounded-[14px]" />
              )}
              {mapBase === "photo" && !uploadedPhoto && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-300">
                  <Upload className="w-6 h-6" />
                  <span className="text-xs">เลือกรูปภาพ</span>
                </div>
              )}

              {/* Pins */}
              {pins.map((pin, idx) => {
                const isSelected = selectedPinId === pin.id;
                const tipRight = pin.x > 55;
                const tipUp = pin.y > 55;
                return (
                  <div key={pin.id} className="absolute" style={{ left: `${pin.x}%`, top: `${pin.y}%`, zIndex: isSelected ? 30 : 5 }}>
                    <div
                      data-pin="true"
                      onClick={e => { e.stopPropagation(); selectPin(pin); }}
                      className={`flex items-center justify-center rounded-full text-white shadow-md cursor-pointer transition-all hover:scale-110 ${isSelected ? "ring-2 ring-offset-1 ring-white scale-110" : ""}`}
                      style={{
                        width: 26, height: 26,
                        background: pin.color,
                        fontSize: 11, fontWeight: 700,
                        transform: "translate(-50%, -50%)",
                        boxShadow: `0 2px 8px ${pin.color}99`,
                      }}
                    >
                      {idx + 1}
                    </div>

                    {/* Tooltip */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.15 }}
                          onClick={e => e.stopPropagation()}
                          className="absolute bg-white rounded-2xl shadow-xl border border-gray-100 p-3 space-y-2.5"
                          style={{
                            width: 210,
                            ...(tipRight ? { right: 18 } : { left: 18 }),
                            ...(tipUp ? { bottom: 18 } : { top: 18 }),
                            transformOrigin: `${tipRight ? "right" : "left"} ${tipUp ? "bottom" : "top"}`,
                          }}
                        >
                          <div className="absolute w-2.5 h-2.5 bg-white border-gray-100 rotate-45"
                            style={{
                              ...(tipRight
                                ? { right: -6, borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 1, borderBottomWidth: 1, borderStyle: "solid" }
                                : { left: -6, borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 0, borderBottomWidth: 0, borderStyle: "solid" }),
                              ...(tipUp ? { bottom: 10 } : { top: 10 }),
                            }}
                          />
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-white" style={{ background: pin.color, fontSize: 9, fontWeight: 700 }}>{idx + 1}</div>
                            <span className="text-xs text-gray-700 flex-1" style={{ fontWeight: 600 }}>เครื่องหมาย #{idx + 1}</span>
                            <button onClick={() => setSelectedPinId(null)} className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-300 hover:text-gray-500 transition-all">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">ชื่อจุด</label>
                            <input value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-vet-teal/20 focus:border-vet-teal transition-all" placeholder="เช่น บาดแผลหลังซ้าย" autoFocus />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">รายละเอียด</label>
                            <textarea rows={3} value={formDetail} onChange={e => setFormDetail(e.target.value)} className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-vet-teal/20 focus:border-vet-teal transition-all" placeholder="ลักษณะ, ขนาด, สี, ความรุนแรง..." />
                          </div>
                          <div className="flex gap-1.5">
                            <button onClick={savePin} className="vet-btn vet-btn-primary vet-btn-sm btn-green flex-1">บันทึก</button>
                            <button onClick={() => deletePin(pin.id)} className="px-3 py-1.5 text-xs text-red-400 bg-white border border-red-100 rounded-full hover:bg-red-50 transition-all">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-[10px] text-gray-300 text-center">คลิกบนแผนที่เพื่อเพิ่มจุด • คลิกที่จุดเพื่อแก้ไข</p>
        </div>

        {/* Pin list - right panel */}
        <div className="w-full lg:w-[280px] xl:flex-1 min-w-0 rounded-[14px] border border-gray-100 overflow-hidden flex-shrink-0">
          <button
            onClick={() => setShowPinList(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-all"
          >
            <span className="text-xs text-gray-600" style={{ fontWeight: 600 }}>รายการจุดที่ทำเครื่องหมาย ({pins.length})</span>
            {showPinList ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
          </button>
          <AnimatePresence>
            {showPinList && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                {pins.length === 0 ? (
                  <div className="px-3 py-8 text-center text-xs text-gray-300">ยังไม่มีจุดที่ทำเครื่องหมาย</div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {pins.map((pin, idx) => (
                      <div key={pin.id} onClick={() => selectPin(pin)} className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-all hover:bg-gray-50 ${selectedPinId === pin.id ? "bg-vet-teal/5" : ""}`}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ background: pin.color, fontSize: 10, fontWeight: 700 }}>{idx + 1}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-700 truncate" style={{ fontWeight: 500 }}>{pin.name || `จุดที่ ${idx + 1}`}</p>
                          {pin.detail
                            ? <p className="text-[10px] text-gray-400 truncate">{pin.detail}</p>
                            : <p className="text-[10px] text-gray-300">ตำแหน่ง: ({Math.round(pin.x)}, {Math.round(pin.y)})</p>
                          }
                        </div>
                        <button onClick={e => { e.stopPropagation(); deletePin(pin.id); }} className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export function ExamMediaPanel() {
  return (
    <div className="space-y-4">
      <ExamPhotosPanel />
      <div className="pt-4 border-t border-gray-100">
        <ExamBodyMapPanel />
      </div>
    </div>
  );
}

/* ─── Photos Panel ─── */
export function ExamPhotosPanel() {
  const [images, setImages] = useState<AttachedImage[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setImages(prev => [...prev, {
          id: `${Date.now()}-${Math.random()}`,
          url,
          name: file.name,
          size: file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${(file.size / 1024).toFixed(0)} KB`,
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => setImages(prev => prev.filter(img => img.id !== id));

  return (
    <div>
      <h3 className="text-gray-800 mb-3 text-sm flex items-center gap-1.5" style={{ fontWeight: 600 }}>
        <ImageIcon className="w-4 h-4 text-vet-teal" />รูปภาพ ({images.length})
      </h3>
      <div className="space-y-3">
        <input ref={fileInputRef} type="file" accept="image/*,.pdf" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative group rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-square shadow-sm hover:shadow-md transition-all"
            >
              <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-200" />
              <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <button
                  onClick={() => setLightbox(img.url)}
                  className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white shadow-sm transition-all"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-gray-700" />
                </button>
                <button
                  onClick={() => removeImage(img.id)}
                  className="w-7 h-7 rounded-full bg-red-500/90 backdrop-blur-sm flex items-center justify-center hover:bg-red-600 shadow-sm transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <p className="text-[10px] text-white truncate" style={{ fontWeight: 500 }}>{img.name}</p>
                <p className="text-[9px] text-white/60">{img.size}</p>
              </div>
            </div>
          ))}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1.5 hover:border-vet-teal/40 hover:bg-vet-teal/5 transition-all"
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          >
            <Plus className="w-5 h-5 text-gray-300" />
            <span className="text-[10px] text-gray-300" style={{ fontWeight: 500 }}>เพิ่ม</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6" onClick={() => setLightbox(null)}>
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} src={lightbox} alt="preview" className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl" onClick={e => e.stopPropagation()} />
            <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all"><X className="w-5 h-5" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Body Map Panel ─── */
export function ExamBodyMapPanel({ species }: { species?: string }) {
  return (
    <BodyMapPanel species={species} />
  );
}