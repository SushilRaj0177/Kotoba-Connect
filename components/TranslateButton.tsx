"use client";

import { useTranslate } from "@/lib/use-translate";
import TranslateToggle from "@/components/TranslateToggle";

// Self-contained on-demand translation for the common case: the text and
// its toggle button sit right next to each other with nothing structural
// in between. Shows the translation in place of the original (not
// appended below it) once fetched, toggled by the same button — for a
// case where the original text has to render somewhere this component
// can't reach (e.g. inside a <Link>, which can't contain a <button>), use
// useTranslate + TranslateToggle directly instead.
export default function TranslateButton({
  text,
  textClassName = "text-sm text-ink-text",
  className = "",
}: {
  text: string;
  textClassName?: string;
  className?: string;
}) {
  const state = useTranslate(text);

  return (
    <div className={className}>
      <p className={`mb-1 ${textClassName}`}>{state.display}</p>
      <TranslateToggle state={state} />
    </div>
  );
}
