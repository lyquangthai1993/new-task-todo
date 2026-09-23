/**
 * Utility phát âm tiếng Anh cho tính năng Từ vựng (Vocabulary).
 * Khắc phục hiện tượng nuốt từ/mất tiếng ở các từ đầu tiên trên Chrome / Windows / Tai nghe Bluetooth.
 */

let sharedAudioCtx: AudioContext | null = null;
let cachedVoice: SpeechSynthesisVoice | null = null;
let activeSpeakTimeout: ReturnType<typeof setTimeout> | null = null;

// Khởi tạo và nạp danh sách giọng đọc từ sớm
function initVoices(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const loadVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return;

    // Ưu tiên các giọng tự nhiên / tiếng Anh Mỹ chuẩn
    cachedVoice =
      voices.find(
        (v) =>
          v.lang === "en-US" &&
          (v.name.includes("Google") ||
            v.name.includes("Natural") ||
            v.name.includes("Online")),
      ) ||
      voices.find((v) => v.lang === "en-US") ||
      voices.find((v) => v.lang.startsWith("en")) ||
      null;
  };

  loadVoice();
  if ("onvoiceschanged" in window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = loadVoice;
  }
}

initVoices();

/**
 * Đánh thức Audio DAC / Bluetooth ngay lập tức khi người dùng click
 */
function wakeUpAudio(): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
      sharedAudioCtx = new AudioCtx();
    }

    if (sharedAudioCtx.state === "suspended") {
      void sharedAudioCtx.resume();
    }

    // Phát xung âm siêu nhỏ trong 100ms để kích hoạt driver âm thanh Windows ra khỏi chế độ tiết kiệm năng lượng
    const osc = sharedAudioCtx.createOscillator();
    const gain = sharedAudioCtx.createGain();
    gain.gain.value = 0.0001; // Gần như im lặng nhưng kích hoạt đường truyền âm thanh
    osc.connect(gain);
    gain.connect(sharedAudioCtx.destination);
    osc.start();
    osc.stop(sharedAudioCtx.currentTime + 0.1);
  } catch {
    // Không ảnh hưởng nếu trình duyệt hạn chế
  }
}

/**
 * Phát âm đoạn văn bản tiếng Anh với đệm chống nuốt từ đầu
 */
export function playEnglishSpeech(text: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const cleanText = text.trim();
  if (!cleanText) return;

  // 1. Kích hoạt phần cứng âm thanh ngay khi có user gesture
  wakeUpAudio();

  // 2. Hủy các tác vụ phát âm đang chạy dở
  if (activeSpeakTimeout) {
    clearTimeout(activeSpeakTimeout);
    activeSpeakTimeout = null;
  }
  window.speechSynthesis.cancel();

  // 3. Đệm thời gian 200ms để audio driver và Bluetooth chuyển sang trạng thái active,
  // kết hợp đệm dấu phẩy ở đầu để TTS engine tạo khoảng dừng tự nhiên trước khi phát từ đầu tiên.
  activeSpeakTimeout = setTimeout(() => {
    // Dấu phẩy ở đầu tạo ra khoảng dừng tự nhiên (~150-250ms) trong bộ tổng hợp giọng nói (TTS)
    // giúp từ đầu tiên (ví dụ "I am...") không bị rơi vào thời điểm loa đang mở âm lượng.
    const spokenText = cleanText.startsWith(",") ? cleanText : `, ${cleanText}`;
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = "en-US";
    utterance.rate = 0.85;

    // Gán voice tiếng Anh chuẩn nếu có
    if (!cachedVoice) {
      const voices = window.speechSynthesis.getVoices();
      cachedVoice =
        voices.find((v) => v.lang === "en-US") ||
        voices.find((v) => v.lang.startsWith("en")) ||
        null;
    }
    if (cachedVoice) {
      utterance.voice = cachedVoice;
    }

    window.speechSynthesis.speak(utterance);
    activeSpeakTimeout = null;
  }, 200);
}
