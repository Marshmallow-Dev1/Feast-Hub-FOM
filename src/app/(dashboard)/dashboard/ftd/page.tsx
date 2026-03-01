import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { getCachedSettings } from "@/lib/sheets/client";
import FtdUploadForm from "@/components/dashboard/FtdUploadForm";
import SessionRefreshButton from "@/components/SessionRefreshButton";

/** Format YYYY-MM-DD (or a full Date string from Sheets) to "March 1, 2026" */
function formatFtdDate(raw: string): string {
  if (!raw) return "";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  });
}

/** Keep user-typed time as-is; if Sheets stored a full Date object, extract just the time. */
function formatFtdTime(raw: string): string {
  if (!raw) return "";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila",
  });
}

export default async function FtdPage() {
  const session = await auth();
  if (!session) redirect("/");
  if (session.user.account_type !== "FIRST_TIMER") redirect("/dashboard");

  const settings = await getCachedSettings();

  const status = session.user.account_status;

  return (
    <div className="max-w-lg mx-auto space-y-5 pb-20 md:pb-6">
      <div>
        <h1 className="text-xl font-black text-gray-900">First Timers Day (FTD)</h1>
        <p className="text-sm text-gray-500 mt-1">Complete FTD to unlock full community features.</p>
      </div>

      {/* ── PENDING: verification progress card ───────────────────────────── */}
      {status === "FTD_PENDING_APPROVAL" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-yellow-50 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Submission Received</p>
              <p className="text-xs text-gray-500 mt-0.5">Your attendance photo is being verified</p>
            </div>
          </div>

          <div className="space-y-0">
            {/* Step 1 done */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-[#ff474f] flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="w-0.5 h-8 bg-gray-200 my-1" />
              </div>
              <div className="pb-3 pt-1">
                <p className="text-sm font-semibold text-gray-900">Photo submitted</p>
                <p className="text-xs text-gray-400 mt-0.5">Your FTD attendance photo was uploaded successfully.</p>
              </div>
            </div>

            {/* Step 2 active */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full border-2 border-yellow-400 bg-yellow-50 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                </div>
                <div className="w-0.5 h-8 bg-gray-200 my-1" />
              </div>
              <div className="pb-3 pt-1">
                <p className="text-sm font-semibold text-gray-800">Being reviewed by your Connect Head</p>
                <p className="text-xs text-gray-400 mt-0.5">This usually takes 1 to 2 business days. You will receive an email once done.</p>
              </div>
            </div>

            {/* Step 3 locked */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="pt-1">
                <p className="text-sm font-semibold text-gray-400">Full community access unlocked</p>
                <p className="text-xs text-gray-300 mt-0.5">Edit your profile, become a servant, and more.</p>
              </div>
            </div>
          </div>

          <SessionRefreshButton />
        </div>
      )}

      {/* ── NOT APPROVED ──────────────────────────────────────────────────── */}
      {status === "FTD_NOT_APPROVED" && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-sm font-semibold text-red-800">Photo not approved</p>
          <p className="text-xs text-red-700 mt-1">Please upload a clearer photo of your FTD attendance below.</p>
        </div>
      )}

      {/* ── FTD Schedule ─────────────────────────────────────────────────── */}
      {settings && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <h2 className="text-sm font-bold text-gray-900">Upcoming FTD Schedule</h2>
          {settings.ftd_date ? (
            <div className="space-y-1 text-sm text-gray-700">
              <p><span className="font-medium">Date:</span> {formatFtdDate(settings.ftd_date)}</p>
              <p><span className="font-medium">Time:</span> {formatFtdTime(settings.ftd_time)}</p>
              <p><span className="font-medium">Venue:</span> {settings.ftd_venue || settings.feast_venue}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Schedule to be announced. Check back soon.</p>
          )}
          {settings.ftd_description && (
            <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-3">{settings.ftd_description}</p>
          )}
        </div>
      )}

      {/* ── Upload form — hide while pending ─────────────────────────────── */}
      {status !== "FTD_PENDING_APPROVAL" && (
        <FtdUploadForm userId={session.user.id} userEmail={session.user.email!} />
      )}
    </div>
  );
}
