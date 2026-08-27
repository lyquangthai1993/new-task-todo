import { GoogleGenAI } from "@google/genai";

export interface AiVocabularyResult {
  phonetic: string;
  partOfSpeech: string;
  meaning: string;
  example: string;
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

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `You are a professional English-Vietnamese dictionary assistant. Extract vocabulary details for the English word "${word}". Return ONLY a raw JSON object with keys: "phonetic" (IPA pronunciation like /rɪˈzɪl.jənt/), "partOfSpeech" (short form like "adj.", "v.", "n.", "adv.", "phrase"), "meaning" (concise Vietnamese meaning), "example" (natural English example sentence).`,
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
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Lỗi Gemini API: ${msg}`);
  }
}
