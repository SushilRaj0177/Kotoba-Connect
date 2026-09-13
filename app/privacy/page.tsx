import Navbar from "@/components/Navbar";

export const metadata = { title: "Privacy Policy — Kotoba Engine" };

export default function PrivacyPage() {
  return (
    <>
      <Navbar title="Privacy" />
      <main className="mx-auto max-w-2xl px-4 py-10 text-sm text-ink-text sm:px-6">
        <h1 className="mb-6 text-2xl font-bold text-ink-text-header">Privacy Policy</h1>
        <p className="mb-4 text-ink-text-muted">
          Last updated: {new Date().toISOString().slice(0, 10)}
        </p>

        <section className="mb-6 space-y-2">
          <h2 className="text-base font-semibold text-ink-text-header">What we collect</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>Account info: email address, chosen username, and password (hashed by Supabase Auth — we never see it in plain text).</li>
            <li>If you sign in with Google, your name and email from your Google account.</li>
            <li>Content you post: sentences, translations, tags, and annotations, along with which entries you&apos;ve upvoted.</li>
            <li>Basic technical data (IP address) used only for spam/rate-limit protection, not stored beyond that purpose.</li>
          </ul>
        </section>

        <section className="mb-6 space-y-2">
          <h2 className="text-base font-semibold text-ink-text-header">How it&apos;s used</h2>
          <p>
            To run the app: authenticate you, display your posts and votes to other users, enforce
            rate limits, and — if enabled — report crashes to our error monitoring tool so we can
            fix bugs. We don&apos;t sell your data or share it with advertisers.
          </p>
        </section>

        <section className="mb-6 space-y-2">
          <h2 className="text-base font-semibold text-ink-text-header">Where it lives</h2>
          <p>
            Data is stored in Supabase (PostgreSQL), hosted on Supabase&apos;s infrastructure. The
            app itself runs on Vercel. Both are standard third-party infrastructure providers, not
            data buyers.
          </p>
        </section>

        <section className="mb-6 space-y-2">
          <h2 className="text-base font-semibold text-ink-text-header">Your choices</h2>
          <p>
            You can delete your own posts and annotations at any time. To delete your account and
            associated data entirely, contact the project maintainer — deleting your Supabase auth
            user cascades to your profile, entries, and annotations.
          </p>
        </section>

        <p className="text-xs text-ink-text-muted">
          This is a starter policy for an early-stage community project, not legal advice — have
          it reviewed (especially for GDPR/CCPA if you expect users in the EU/California) before
          relying on it at scale.
        </p>
      </main>
    </>
  );
}
