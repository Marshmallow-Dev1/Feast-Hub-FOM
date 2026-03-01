"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { callAppsScriptClient as callAppsScript, type FtdSubmission } from "@/lib/sheets/client";

/**
 * Convert a Google Drive URL to a thumbnail URL that loads as a plain <img>.
 * drive.google.com/uc?id=X redirects to an HTML page, not the raw image.
 * drive.google.com/thumbnail?id=X&sz=wN returns the actual image binary.
 */
function driveThumbUrl(url: string): string {
  if (!url) return "";
  const match = url.match(/[?&]id=([^&]+)/);
  if (match) return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
  return url;
}

export default function FtdApprovalList({
  initialSubmissions,
  reviewerEmail,
}: {
  initialSubmissions: FtdSubmission[];
  reviewerEmail: string;
}) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleReview(submission: FtdSubmission, action: "approve" | "deny", notes = "") {
    setLoadingId(submission.id);
    setError("");
    const res = await callAppsScript("reviewFtdSubmission", {
      submissionId: submission.id,
      userEmail: submission.user_email,
      decision: action,
      reviewerEmail,
      notes,
    });
    setLoadingId(null);
    if (!res.success) {
      setError(res.error || "Review failed.");
    } else {
      setSubmissions((prev) => prev.filter((s) => s.id !== submission.id));
    }
  }

  if (submissions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-semibold text-gray-700">All caught up!</p>
        <p className="text-sm text-gray-400 mt-1">No pending FTD submissions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {submissions.map((sub) => (
        <div key={sub.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div>
              <p className="font-semibold text-sm text-gray-900">{sub.user_email}</p>
              <p className="text-xs text-gray-400 mt-0.5">{new Date(sub.submitted_at).toLocaleString()}</p>
            </div>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === sub.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedId === sub.id && (
            <div className="px-5 pb-5 space-y-4 border-t border-gray-50">
              <div className="mt-4">
                {sub.photo_url ? (
                  <div className="w-full bg-gray-100 rounded-xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={driveThumbUrl(sub.photo_url)}
                      alt="FTD proof"
                      className="w-full max-h-80 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center">
                    <p className="text-xs text-gray-400">No photo</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  fullWidth
                  loading={loadingId === sub.id}
                  onClick={() => handleReview(sub, "deny")}
                >
                  Deny
                </Button>
                <Button
                  fullWidth
                  loading={loadingId === sub.id}
                  onClick={() => handleReview(sub, "approve")}
                >
                  Approve
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
