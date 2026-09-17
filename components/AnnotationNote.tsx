"use client";

import type { TokenAnnotation } from "@/types/database";
import UserHandle from "@/components/UserHandle";
import ReportButton from "@/components/ReportButton";
import TranslateToggle from "@/components/TranslateToggle";
import { useTranslate } from "@/lib/use-translate";

// Split out from EntryDetail's annotation list so useTranslate (a hook)
// can be called once per annotation — a list rendered via .map() can't
// call hooks directly inside the callback, each item needs its own
// component instance instead.
export default function AnnotationNote({
  annotation,
  userId,
}: {
  annotation: TokenAnnotation;
  userId: string | null;
}) {
  const combinedText = annotation.cultural_context
    ? `${annotation.nuance_note}\n${annotation.cultural_context}`
    : annotation.nuance_note;
  const translate = useTranslate(combinedText);

  return (
    <li className="rounded-2xl bg-ink-bg-input p-3">
      <UserHandle
        username={annotation.profiles?.username ?? "unknown"}
        displayName={annotation.profiles?.display_name}
        avatarUrl={annotation.profiles?.avatar_url}
        href={`/u/${annotation.profiles?.username ?? ""}`}
        size="sm"
      />
      {translate.showingTranslation && translate.translation ? (
        <p className="mt-2 whitespace-pre-wrap text-sm text-ink-text">{translate.translation}</p>
      ) : (
        <>
          <p className="mt-2 text-sm text-ink-text">{annotation.nuance_note}</p>
          {annotation.cultural_context && (
            <p className="mt-1 text-xs text-ink-text-muted">{annotation.cultural_context}</p>
          )}
        </>
      )}
      <TranslateToggle state={translate} className="mt-1" />
      <div className="mt-1.5">
        <ReportButton targetType="annotation" targetId={annotation.id} userId={userId} />
      </div>
    </li>
  );
}
