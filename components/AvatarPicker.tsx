"use client";

import { useState } from "react";
import { AVATAR_SETS, avatarPresetToken, parseAvatarPreset } from "@/lib/avatar-presets";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function AvatarPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (token: string) => void;
}) {
  const { t } = useLocale();
  const selected = parseAvatarPreset(value);
  const initialSet = value?.startsWith("preset:") ? Number(value.split(":")[1]) : 0;
  const [activeSet, setActiveSet] = useState(initialSet || 0);

  return (
    <div>
      <div className="mb-2 flex gap-1 rounded-full bg-ink-bg-input p-1 text-xs font-semibold">
        {AVATAR_SETS.map((set, i) => (
          <button
            key={set.name}
            type="button"
            onClick={() => setActiveSet(i)}
            className={`flex-1 rounded-full py-1.5 transition ${
              activeSet === i ? "bg-ink-accent text-white" : "text-ink-text-muted hover:text-ink-text"
            }`}
          >
            {t(`avatarPicker.set.${set.name}`)}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {AVATAR_SETS[activeSet].presets.map((preset, i) => {
          const token = avatarPresetToken(activeSet, i);
          const isSelected = selected?.emoji === preset.emoji && selected?.bg === preset.bg;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(token)}
              style={{ backgroundColor: preset.bg }}
              className={`flex aspect-square items-center justify-center rounded-full text-xl transition ${
                isSelected ? "ring-4 ring-ink-accent ring-offset-2 ring-offset-ink-bg-secondary" : "hover:scale-105"
              }`}
            >
              {preset.emoji}
            </button>
          );
        })}
      </div>
    </div>
  );
}
