import { createParser } from "eventsource-parser";
import { flushSync } from "react-dom";

type ImagePayload = { type?: string; b64_json?: string; error?: { message?: string } };

export async function streamImage(
  endpoint: string,
  input: Record<string, unknown>,
  onFrame: (dataUrl: string, isFinal: boolean) => void,
  headers?: HeadersInit,
): Promise<void> {
  const send = (stream: boolean) => fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ ...input, stream }),
  });

  const response = await send(true);
  if (!response.ok || !response.body) {
    throw new Error((await response.text().catch(() => "")) || `تعذر إنشاء الصورة (${response.status})`);
  }

  let sawCompleted = false;
  let sawAnyEvent = false;
  let streamError: string | undefined;
  const parser = createParser({
    onEvent(event) {
      let payload: ImagePayload | undefined;
      try {
        payload = JSON.parse(event.data) as ImagePayload;
      } catch {
        return;
      }
      if (event.event === "error" || payload.type === "error") {
        sawAnyEvent = true;
        streamError = payload.error?.message || "تعذر إنشاء الصورة";
        return;
      }
      const type = event.event || payload.type;
      if (type !== "image_generation.partial_image" && type !== "image_generation.completed") return;
      sawAnyEvent = true;
      if (!payload.b64_json) {
        streamError = "وصلت صورة غير مكتملة";
        return;
      }
      const isFinal = type === "image_generation.completed";
      flushSync(() => onFrame(`data:image/png;base64,${payload.b64_json}`, isFinal));
      if (isFinal) sawCompleted = true;
    },
  });

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  try {
    while (true) {
      let chunk: ReadableStreamReadResult<string>;
      try {
        chunk = await reader.read();
      } catch (error) {
        if (sawAnyEvent) throw error;
        break;
      }
      if (chunk.done) break;
      parser.feed(chunk.value);
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }

  if (streamError) throw new Error(streamError);
  if (!sawAnyEvent) {
    const replay = await send(false);
    if (!replay.ok) throw new Error((await replay.text().catch(() => "")) || `تعذر إنشاء الصورة (${replay.status})`);
    const json = await replay.json() as { data?: { b64_json?: string }[] };
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) throw new Error("لم تصل صورة من الخدمة");
    onFrame(`data:image/png;base64,${b64}`, true);
    return;
  }
  if (!sawCompleted) throw new Error("توقف إنشاء الصورة قبل اكتمالها");
}