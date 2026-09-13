export default function AiNuanceCallout({
  summary,
  formalitySuggestion,
}: {
  summary: string | null;
  formalitySuggestion: string | null;
}) {
  if (!summary) return null;

  return (
    <div className="mb-3 rounded-lg border-l-4 border-accent bg-blue-50 px-3 py-2">
      <p className="text-xs font-semibold text-accent">✦ AI pragmatic read{formalitySuggestion ? ` · suggests ${formalitySuggestion}` : ""}</p>
      <p className="mt-0.5 text-sm text-ink">{summary}</p>
    </div>
  );
}
