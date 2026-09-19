import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushToUser, pushEnabled } from "@/lib/push";

// Lets a signed-in user push themselves a one-off test notification, so
// "did I actually turn this on correctly" has an immediate, verifiable
// answer instead of waiting for a real upvote/comment to land.
export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  if (!pushEnabled()) {
    return NextResponse.json({ error: "Push notifications aren't configured on this deployment yet." }, { status: 503 });
  }

  const result = await sendPushToUser(user.id, {
    title: "言葉 Kotoba Engine",
    body: "Push notifications are working — you'll hear from us when something happens on your posts.",
    url: "/",
  });

  return NextResponse.json(result);
}
