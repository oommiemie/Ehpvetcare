/**
 * ไคลเอนต์เรียก LLM จริง (vLLM OpenAI-compatible) ของ BMS Cloud
 * - CORS เปิด (*) และไม่ต้องใช้ API key → เรียกจาก frontend ได้โดยตรง
 * - รองรับ streaming ผ่าน SSE (/v1/chat/completions, stream:true)
 */
const env = import.meta.env;
export const AI_BASE = env.VITE_AI_BASE ?? "https://vllm-qwen.bmscloud.in.th";
export const AI_BASE_BACKUP = env.VITE_AI_BASE_BACKUP ?? "https://vllm-gemma.bmscloud.in.th";  // โมเดลสำรองเมื่อตัวหลักล่ม
export const AI_MODEL = env.VITE_AI_MODEL ?? "qwen3.6";

export interface ChatTurn { role: "system" | "user" | "assistant"; content: string; }

/* ─── ประเภทสำหรับ tool-calling (agent loop) ─── */
export interface ToolCall { id: string; type: "function"; function: { name: string; arguments: string }; }
export interface AgentMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}
export interface ToolDef {
  type: "function";
  function: { name: string; description: string; parameters: Record<string, unknown> };
}
export type ToolExecutor = (name: string, args: Record<string, unknown>) => string | Promise<string>;

const safeParse = (s: string): Record<string, unknown> => {
  try { return s ? JSON.parse(s) : {}; } catch { return {}; }
};

/**
 * ส่ง chat completion แบบ streaming
 * @param messages ประวัติบทสนทนา (รวม system prompt)
 * @param onDelta callback เมื่อได้ token ใหม่ (ต่อท้าย)
 * @param signal AbortSignal สำหรับยกเลิก
 * @returns ข้อความเต็มเมื่อจบ
 */
export async function streamChat(
  messages: ChatTurn[],
  onDelta: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch(`${AI_BASE}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({
      model: AI_MODEL,
      messages,
      stream: true,
      temperature: 0.3,
      max_tokens: 700,
    }),
  });
  if (!res.ok || !res.body) throw new Error(`AI request failed: ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";       // เก็บบรรทัดที่ยังไม่จบไว้รอบหน้า
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith("data:")) continue;
      const data = t.slice(5).trim();
      if (data === "[DONE]") return full;
      try {
        const json = JSON.parse(data);
        const delta: string = json.choices?.[0]?.delta?.content ?? "";
        if (delta) { full += delta; onDelta(delta); }
      } catch { /* บรรทัด keep-alive/ว่าง ข้ามได้ */ }
    }
  }
  return full;
}

/**
 * Agent loop แบบ streaming + tool-calling
 * - เรียก /v1/chat/completions พร้อม tools (stream:true)
 * - ถ้าโมเดลขอเรียก tool → รัน execute() แล้ววนต่อ; ถ้าตอบเป็นข้อความ → stream ออกมาเลย
 */
export async function streamAgent(
  messages: AgentMessage[],
  tools: ToolDef[],
  execute: ToolExecutor,
  opts: {
    onDelta: (chunk: string) => void;
    onTool?: (name: string, args: Record<string, unknown>) => void;
    signal?: AbortSignal;
    maxRounds?: number;
    base?: string;
  },
): Promise<string> {
  const convo: AgentMessage[] = [...messages];
  const maxRounds = opts.maxRounds ?? 6;
  const base = opts.base ?? AI_BASE;

  for (let round = 0; round < maxRounds; round++) {
    const body: Record<string, unknown> = {
      model: AI_MODEL,
      messages: convo,
      stream: true,
      temperature: 0.3,
      max_tokens: 800,
    };
    if (tools.length) { body.tools = tools; body.tool_choice = "auto"; }

    const res = await fetch(`${base}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: opts.signal,
      body: JSON.stringify(body),
    });
    if (!res.ok || !res.body) throw new Error(`AI request failed: ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let content = "";
    let buffer = "";
    const toolAcc: Record<number, { id: string; name: string; args: string }> = {};

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith("data:")) continue;
        const data = t.slice(5).trim();
        if (data === "[DONE]") break;
        try {
          const json = JSON.parse(data);
          const delta = json.choices?.[0]?.delta;
          if (!delta) continue;
          if (delta.content) { content += delta.content; opts.onDelta(delta.content); }
          if (Array.isArray(delta.tool_calls)) {
            for (const tc of delta.tool_calls) {
              const idx = tc.index ?? 0;
              const acc = (toolAcc[idx] ??= { id: "", name: "", args: "" });
              if (tc.id) acc.id = tc.id;
              if (tc.function?.name) acc.name += tc.function.name;
              if (tc.function?.arguments) acc.args += tc.function.arguments;
            }
          }
        } catch { /* ข้ามบรรทัดที่ parse ไม่ได้ */ }
      }
    }

    const calls = Object.values(toolAcc).filter(c => c.name);
    if (calls.length === 0) return content;   // ตอบเป็นข้อความแล้ว (stream ไปแล้ว)

    // บันทึกคำสั่งเรียก tool ของ assistant
    convo.push({
      role: "assistant",
      content: content || null,
      tool_calls: calls.map(c => ({ id: c.id, type: "function", function: { name: c.name, arguments: c.args } })),
    });
    // รัน tool ทีละตัว แล้วแนบผลกลับ
    for (const c of calls) {
      const args = safeParse(c.args);
      opts.onTool?.(c.name, args);
      let result: string;
      try { result = await execute(c.name, args); }
      catch (e) { result = `เกิดข้อผิดพลาดขณะเรียกใช้ ${c.name}: ${(e as Error).message}`; }
      convo.push({ role: "tool", tool_call_id: c.id, content: result });
    }
    // วนต่อ → รอบถัดไปโมเดลจะสรุปคำตอบหรือเรียก tool เพิ่ม
  }
  return "ขออภัยค่ะ ประมวลผลหลายขั้นตอนเกินกำหนด กรุณาลองถามใหม่อีกครั้งค่ะ";
}
