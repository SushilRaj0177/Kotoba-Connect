import { signOut } from "@/app/auth/actions";

// Same visual shape as SettingsRow, but a form-submitting button instead
// of a Link (signing out is an action, not a navigation) — sign out
// already lives in the avatar dropdown menu, but that's an easy-to-miss
// primary location; most apps also surface it in Settings as the
// expected fallback place to look for it.
export default function SignOutRow({ label }: { label: string }) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition active:scale-[0.98] active:bg-ink-bg-hover hover:bg-ink-bg-hover"
      >
        <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-ink-red/10 text-ink-red">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
        </span>
        <span className="min-w-0 flex-1 text-sm font-semibold text-ink-red">{label}</span>
      </button>
    </form>
  );
}
