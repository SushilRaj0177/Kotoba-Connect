import { Fragment } from "react";

// The bot's replies come back as plain markdown-ish text from the model
// (it naturally reaches for **bold** to emphasize a word), but nothing was
// ever parsing it — the literal asterisks rendered as-is. This is a small
// hand-rolled renderer (not a full markdown library, which would be
// overkill for chat bubbles) covering what the bot actually produces:
// **bold**, `inline code`, and line breaks.
export default function ChatMessageText({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {renderInline(line)}
        </Fragment>
      ))}
    </>
  );
}

function renderInline(line: string): React.ReactNode[] {
  const tokens = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return tokens.map((token, i) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={i}>{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-ink-bg-hover px-1 py-0.5 font-mono text-[0.85em]">
          {token.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={i}>{token}</Fragment>;
  });
}
