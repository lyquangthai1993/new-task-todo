export interface AiVocabularyResult {
  phonetic: string;
  meaning: string;
  example: string;
}

export async function fetchVocabularyWithAi(word: string): Promise<AiVocabularyResult> {
  const apiKey =
    (import.meta.env.OPENAI_API_KEY as string | undefined) ||
    (import.meta.env.VITE_OPENAI_API_KEY as string | undefined);

  if (!apiKey) {
    throw new Error("Không tìm thấy OPENAI_API_KEY trong file .env!");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            'You are a professional English-Vietnamese dictionary assistant. Return ONLY valid JSON format with three string keys: "phonetic" (IPA pronunciation like /rɪˈzɪl.jənt/), "meaning" (concise Vietnamese meaning), "example" (natural English example sentence).',
        },
        {
          role: "user",
          content: `Extract vocabulary information for the word: "${word}"`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const msg = errorData?.error?.message || response.statusText;
    throw new Error(`Lỗi OpenAI API (${response.status}): ${msg}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Không nhận được phản hồi từ OpenAI API.");
  }

  const parsed = JSON.parse(content);
  return {
    phonetic: parsed.phonetic || "",
    meaning: parsed.meaning || "",
    example: parsed.example || "",
  };
}
