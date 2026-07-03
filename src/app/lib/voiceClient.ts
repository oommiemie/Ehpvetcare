/**
 * เสียง: ASR (พูด→ข้อความ) และ TTS (ข้อความ→พูด) ของ BMS Cloud
 * CORS เปิด (*) ไม่ต้องใช้ key
 */
const env = import.meta.env;
export const ASR_BASE = env.VITE_ASR_BASE ?? "https://asr2.bmscloud.in.th";
export const TTS_BASE = env.VITE_TTS_BASE ?? "https://vox-cpm.bmscloud.in.th";
export const ASR_MODEL = env.VITE_ASR_MODEL ?? "Qwen/Qwen3-ASR-1.7B";
export const TTS_MODEL = env.VITE_TTS_MODEL ?? "voxcpm-thai";

/** ถอดเสียงเป็นข้อความ (Whisper-compatible /v1/audio/transcriptions) */
export async function transcribe(audio: Blob): Promise<string> {
  const fd = new FormData();
  fd.append("file", audio, "speech.webm");
  fd.append("model", ASR_MODEL);
  fd.append("language", "th");
  const res = await fetch(`${ASR_BASE}/v1/audio/transcriptions`, { method: "POST", body: fd });
  if (!res.ok) throw new Error(`ASR failed: ${res.status}`);
  const json = await res.json();
  return (json.text ?? "").trim();
}

/** สังเคราะห์เสียงพูดภาษาไทย (OpenAI-compatible /v1/audio/speech) → Blob เสียง */
export async function synthesize(text: string, voice = "female"): Promise<Blob> {
  const res = await fetch(`${TTS_BASE}/v1/audio/speech`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: text, model: TTS_MODEL, voice, response_format: "mp3", speed: 1.0 }),
  });
  if (!res.ok) throw new Error(`TTS failed: ${res.status}`);
  return res.blob();
}

/** อัดเสียงจากไมโครโฟน — คืน controller ไว้ stop() เพื่อได้ Blob */
export async function startRecording(): Promise<{ stop: () => Promise<Blob> }> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mr = new MediaRecorder(stream);
  const chunks: BlobPart[] = [];
  mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
  mr.start();
  return {
    stop: () => new Promise<Blob>((resolve) => {
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        resolve(new Blob(chunks, { type: mr.mimeType || "audio/webm" }));
      };
      mr.stop();
    }),
  };
}
