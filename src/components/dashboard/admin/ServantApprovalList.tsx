"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { callAppsScriptClient as callAppsScript, type ServantApplication } from "@/lib/sheets/client";
import { SERVICE_MINISTRIES } from "@/lib/constants/ministries";

function ministryLabel(value: string) {
  return SERVICE_MINISTRIES.find((m) => m.value === value)?.label ?? value;
}

export default function ServantApprovalList({
  initialApplications,
  reviewerEmail,
}: {
  initialApplications: ServantApplication[];
  reviewerEmail: string;
}) {
  const [applications, setApplications] = useState(initialApplications);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleReview(app: ServantApplication, action: "approve" | "deny") {
    setLoadingId(app.id);
    setError("");
    const res = await callAppsScript("reviewServantApplication", {
      applicationId: app.id,
      userEmail: app.user_email,
      ministry: app.ministry,
      decision: action,
      reviewerEmail,
    });
    setLoadingId(null);
    if (!res.success) {
      setError(res.error || "Review failed.");
    } else {
      setApplications((prev) => prev.filter((a) => a.id !== app.id));
    }
  }

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-semibold text-gray-700">No pending applications.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {applications.map((app) => (
        <div key={app.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div>
              <p className="font-semibold text-sm text-gray-900">{app.full_name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{ministryLabel(app.ministry)}</p>
              <p className="text-xs text-gray-400 mt-0.5">{app.user_email}</p>
            </div>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === app.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedId === app.id && (
            <div className="px-5 pb-5 space-y-4 border-t border-gray-50">
              <div className="mt-3 space-y-2 text-sm text-gray-600">
                <p><span className="font-medium text-gray-800">Ministry:</span> {ministryLabel(app.ministry)}</p>
                {app.audition_url && (
                  <p>
                    <span className="font-medium text-gray-800">Audition Video:</span>{" "}
                    <a href={app.audition_url} target="_blank" rel="noopener noreferrer" className="text-[#ff474f] hover:underline">View video</a>
                  </p>
                )}
                <p><span className="font-medium text-gray-800">Submitted:</span> {new Date(app.status).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  fullWidth
                  loading={loadingId === app.id}
                  onClick={() => handleReview(app, "deny")}
                >
                  Deny
                </Button>
                <Button
                  fullWidth
                  loading={loadingId === app.id}
                  onClick={() => handleReview(app, "approve")}
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
