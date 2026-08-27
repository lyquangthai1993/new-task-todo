interface HighlightWordProps {
  text: string;
  word: string;
}

export default function HighlightWord({ text, word }: HighlightWordProps) {
  if (!text || !word) return <>{text}</>;

  const trimmedWord = word.trim();
  if (!trimmedWord) return <>{text}</>;

  const escapedWord = trimmedWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedWord})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === trimmedWord.toLowerCase() ? (
          <mark
            key={index}
            className="bg-amber-300/80 dark:bg-amber-400/35 text-amber-950 dark:text-amber-200 font-bold underline underline-offset-2 rounded px-1 py-0.5 mx-0.5"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}
