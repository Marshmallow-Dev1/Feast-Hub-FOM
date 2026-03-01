/**
 * Google Apps Script Web App API Client
 * All data operations go through the deployed Apps Script Web App.
 */
import { unstable_cache } from "next/cache";

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL!;
const APPS_SCRIPT_SECRET = process.env.APPS_SCRIPT_SECRET!;

export type AppsScriptAction =
  // Users
  | "createUser"
  | "getUserByEmail"
  | "updateUser"
  | "listUsers"
  // FTD
  | "saveFtdPhoto"
  | "submitFtdAttendance"
  | "listFtdPending"
  | "reviewFtdSubmission"
  // Tithes
  | "submitTithe"
  | "listTithes"
  | "verifyTithe"
  // Servants
  | "submitServantApplication"
  | "listServantApplications"
  | "getUserServantApplications"
  | "reviewServantApplication"
  // LG Requests
  | "submitLgRequest"
  // Prayer Requests
  | "submitPrayerRequest"
  // Settings & Stats
  | "getSettings"
  | "updateSettings"
  | "getStats";

export interface AppsScriptResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function callAppsScript<T = unknown>(
  action: AppsScriptAction,
  data?: Record<string, unknown>
): Promise<AppsScriptResponse<T>> {
  if (!APPS_SCRIPT_URL) {
    return { success: false, error: "APPS_SCRIPT_URL not configured" };
  }
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, secret: APPS_SCRIPT_SECRET || "", data: data || {} }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return (await res.json()) as AppsScriptResponse<T>;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[AppsScript] ${action} failed:`, message);
    return { success: false, error: message };
  }
}

/**
 * Client-safe proxy — calls /api/apps-script (Next.js route handler).
 * Use this in "use client" components instead of callAppsScript.
 * Keeps APPS_SCRIPT_URL and APPS_SCRIPT_SECRET on the server only.
 */
export async function callAppsScriptClient<T = unknown>(
  action: AppsScriptAction,
  data?: Record<string, unknown>
): Promise<AppsScriptResponse<T>> {
  try {
    const res = await fetch("/api/apps-script", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, data: data || {} }),
    });
    const result = await res.json();
    return result as AppsScriptResponse<T>;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[AppsScript Client] ${action} failed:`, message);
    return { success: false, error: message };
  }
}

// Typed user shape returned from USERS sheet
export interface SheetUser {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  birthday: string;
  contact: string;
  auth_provider: string;
  role: string;
  account_type: string;
  account_status: string;
  servant_status: string;
  family_ministry: string;
  service_ministries: string;
  lg_name: string;
  discipleship_status: string;
  created_at: string;
  sex: string;
  how_heard: string;
  invited_by: string;
}

export interface FtdSubmission {
  id: string;
  user_id: string;
  user_email: string;
  photo_url: string;
  submitted_at: string;
  status: string;
  reviewed_by: string;
  reviewed_at: string;
  notes: string;
  _rowIndex?: number;
}

export interface TitheRecord {
  id: string;
  user_id: string;
  user_email: string;
  full_name: string;
  amount: string;
  offering_type: string;
  payment_method: string;
  reference_number: string;
  prayer_intentions: string;
  thanksgiving: string;
  timestamp: string;
  status: string;        // "PENDING" | "VERIFIED"
  verified_by: string;
  verified_at: string;
}

export interface ServantApplication {
  id: string;
  user_id: string;
  user_email: string;
  full_name: string;
  ministry: string;
  audition_url: string;
  status: string;
  reviewed_by: string;
  reviewed_at: string;
  notes: string;
  why_serve: string;
  serve_roles: string;
  serve_notes: string;
  _rowIndex?: number;
}

export interface AppSettings {
  ftd_date: string;
  ftd_time: string;
  ftd_venue: string;
  ftd_description: string;
  feast_venue: string;
  feast_time: string;
}

/**
 * Cached settings fetch — revalidates every 5 minutes.
 * Use this in server components that display FTD schedule / settings.
 */
export const getCachedSettings = unstable_cache(
  async () => {
    const res = await callAppsScript<AppSettings>("getSettings");
    return res.success ? res.data ?? null : null;
  },
  ["app-settings"],
  { revalidate: 300 }
);

/**
 * Cached stats fetch — revalidates every 60 seconds.
 * Use this in admin dashboard home to show member/submission counts.
 */
export const getCachedStats = unstable_cache(
  async () => {
    const res = await callAppsScript<Record<string, number>>("getStats");
    return res.success ? res.data ?? {} : {};
  },
  ["app-stats"],
  { revalidate: 60 }
);
