import { GoogleGenAI } from "@google/genai";

export interface AiVocabularyResult {
  phonetic: string;
  partOfSpeech: string;
  meaning: string;
  example: string;
}

const CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-3.5-flash-lite",
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function formatApiError(err: unknown): string {
  const rawMsg = err instanceof Error ? err.message : String(err);
  try {
    const status = (err as { status?: number })?.status;
    if (status === 503) {
      return "Máy chủ Gemini AI hiện đang quá tải tạm thời (503). Vui lòng thử lại sau vài giây.";
    }
    if (status === 429) {
      return "Đã đạt giới hạn lượt gọi Gemini API (429). Vui lòng đợi 1 phút và thử lại.";
    }

    const jsonMatch = rawMsg.match(/\{[\s\S]*"error"[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const code = parsed?.error?.code;
      const st = parsed?.error?.status;
      const message = parsed?.error?.message || "";

      if (code === 503 || st === "UNAVAILABLE" || message.toLowerCase().includes("high demand")) {
        return "Máy chủ Gemini AI hiện đang quá tải tạm thời (503). Vui lòng thử lại sau vài giây.";
      }
      if (code === 429 || st === "RESOURCE_EXHAUSTED") {
        return "Đã đạt giới hạn lượt gọi Gemini API (429). Vui lòng đợi 1 phút và thử lại.";
      }
      if (message) {
        return message;
      }
    }
  } catch {
    // ignore JSON parse error
  }
  return rawMsg;
}

export async function fetchVocabularyWithAi(
  word: string,
): Promise<AiVocabularyResult> {
  const apiKey =
    (import.meta.env.GEMINI_API_KEY as string | undefined) ||
    (import.meta.env.VITE_GEMINI_API_KEY as string | undefined);

  if (!apiKey) {
    throw new Error("Không tìm thấy GEMINI_API_KEY trong file .env!");
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are a professional English-Vietnamese dictionary assistant. Extract vocabulary details for the English word "${word}". Return ONLY a raw JSON object with keys: "phonetic" (IPA pronunciation like /rɪˈzɪl.jənt/), "partOfSpeech" (short form like "adj.", "v.", "n.", "adv.", "phrase"), "meaning" (concise Vietnamese meaning), "example" (natural English example sentence).`;

  let lastError: unknown = null;

  // Thử tối đa 2 vòng qua danh sách model phòng khi Google gặp spike đột xuất
  for (let round = 1; round <= 2; round++) {
    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        const rawText = response.text;
        if (!rawText) {
          throw new Error("Không nhận được phản hồi từ Gemini API.");
        }

        const cleanedText = rawText
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        const parsed = JSON.parse(cleanedText);

        return {
          phonetic: parsed.phonetic || "",
          partOfSpeech: parsed.partOfSpeech || parsed.part_of_speech || "",
          meaning: parsed.meaning || "",
          example: parsed.example || "",
        };
      } catch (err) {
        lastError = err;
        const errMsg = err instanceof Error ? err.message : String(err);
        const errStatus = (err as { status?: number })?.status;
        const isOverloadedOrRateLimited =
          errStatus === 503 ||
          errStatus === 429 ||
          errMsg.includes("503") ||
          errMsg.includes("UNAVAILABLE") ||
          errMsg.includes("high demand") ||
          errMsg.includes("429") ||
          errMsg.includes("RESOURCE_EXHAUSTED");

        // Nếu gặp lỗi quá tải 503 / 429 trên model hiện tại, đợi một chút và thử model tiếp theo
        if (isOverloadedOrRateLimited) {
          console.warn(`[Gemini API] Model ${model} đang quá tải (503/429), chuyển model dự phòng...`);
          await sleep(500);
          continue;
        }

        // Nếu là lỗi cấu hình/xác thực khác thì ném ra ngay
        throw new Error(`Lỗi Gemini API: ${formatApiError(err)}`);
      }
    }

    if (round < 2) {
      await sleep(1000);
    }
  }

  throw new Error(`Lỗi Gemini API: ${formatApiError(lastError)}`);
}
