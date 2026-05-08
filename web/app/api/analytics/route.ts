import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ ok: true });
    }

    const { event, session_id, metadata } = await req.json();

    if (!event) {
      return NextResponse.json({ error: "event required" }, { status: 400 });
    }

    const supabase = getSupabase();
    await supabase.from("analytics_events").insert({
      event,
      session_id: session_id || null,
      metadata: metadata || {},
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
