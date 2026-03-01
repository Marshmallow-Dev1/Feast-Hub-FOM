import { auth } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL!;
const APPS_SCRIPT_SECRET = process.env.APPS_SCRIPT_SECRET!;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { action, data } = await req.json();

  if (!APPS_SCRIPT_URL) {
    return NextResponse.json({ success: false, error: "APPS_SCRIPT_URL not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, secret: APPS_SCRIPT_SECRET || "", data: data || {} }),
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ success: false, error: `HTTP ${res.status}: ${res.statusText}` }, { status: 502 });
    }
    const result = await res.json();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
