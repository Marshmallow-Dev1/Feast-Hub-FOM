"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { callAppsScriptClient as callAppsScript } from "@/lib/sheets/client";
import { SERVICE_MINISTRIES } from "@/lib/constants/ministries";

// Sub-role options per ministry
const MINISTRY_SUB_ROLES: Record<string, string[]> = {
  worship: ["Vocals", "Drums", "Bass", "Keyboard", "Electric Guitar", "Acoustic Guitar", "Others"],
  production: ["Photographer", "Videographer", "Lights", "Visuals", "Teleprompter", "Live Streaming"],
  creatives: ["Marketing", "Social Media", "Design"],
  liturgical: ["Mass Lector", "Altar Servant", "Extraordinary Minister of Holy Communion (EMHC)"],
};

interface UserApplication {
  ministry: string;
  status: string;
}

export default function BecomeServantForm({
  userId,
  userEmail,
  userName,
  userApplications,
}: {
  userId: string;
  userEmail: string;
  userName: string;
  userApplications: UserApplication[];
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [selectedMinistry, setSelectedMinistry] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [othersSpecify, setOthersSpecify] = useState("");
  const [auditionFile, setAuditionFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const isWorship = selectedMinistry === "worship";
  const subRoles = MINISTRY_SUB_ROLES[selectedMinistry] || [];
  const selectedMinistryData = SERVICE_MINISTRIES.find((m) => m.value === selectedMinistry);

  // Per-ministry status checks
  const selectedApp = userApplications.find((a) => a.ministry === selectedMinistry);
  const isSelectedPending = selectedApp?.status === "PENDING";
  const isSelectedActive = selectedApp?.status === "ACTIVE_SERVANT";

  function toggleRole(role: string) {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }

  function handleMinistryChange(value: string) {
    setSelectedMinistry(value);
    setSelectedRoles([]);
    setOthersSpecify("");
    setAuditionFile(null);
    setSuccess(false);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const whyServe = form.get("why_serve") as string;
    const serveNotes = form.get("serve_notes") as string;

    // Build serve_roles string — include "Others: {specify}" if applicable
    let finalRoles = [...selectedRoles];
    if (selectedRoles.includes("Others") && othersSpecify.trim()) {
      finalRoles = finalRoles.filter((r) => r !== "Others");
      finalRoles.push("Others: " + othersSpecify.trim());
    }

    let auditionUrl = "";
    if (isWorship && auditionFile) {
      setUploading(true);
      try {
        const base64 = await fileToBase64(auditionFile);
        const uploadRes = await callAppsScript("saveFtdPhoto", {
          base64,
          filename: auditionFile.name,
          mimeType: auditionFile.type,
          folder: "auditions",
        });
        if (!uploadRes.success) {
          setError("Failed to upload audition video. Please try again.");
          setLoading(false);
          setUploading(false);
          return;
        }
        auditionUrl = (uploadRes.data as { url: string }).url;
      } catch {
        setError("Failed to upload file.");
        setLoading(false);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    const res = await callAppsScript("submitServantApplication", {
      user_id: userId,
      user_email: userEmail,
      full_name: userName,
      ministry: selectedMinistry,
      audition_url: auditionUrl,
      why_serve: whyServe,
      serve_roles: finalRoles.join(","),
      serve_notes: serveNotes || "",
    });

    setLoading(false);
    if (!res.success) {
      setError(res.error || "Submission failed.");
    } else {
      setSuccess(true);
    }
  }

  // Per-ministry success confirmation
  if (success && selectedMinistry) {
    const ministryLabel = selectedMinistryData?.label ?? selectedMinistry;
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-3">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <p className="font-bold text-gray-900">Application Submitted!</p>
          <p className="text-sm text-gray-500">
            Your application for <span className="font-semibold">{ministryLabel}</span> is under review. We will get in touch with you soon.
          </p>
        </div>
        <button
          onClick={() => { setSuccess(false); setSelectedMinistry(""); }}
          className="w-full text-sm text-[#ff474f] font-semibold py-2 hover:underline"
        >
          Apply for another ministry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

      {/* Ministry select */}
      <Select
        name="ministry"
        label="Select Ministry"
        required
        value={selectedMinistry}
        onChange={(e) => handleMinistryChange((e.target as HTMLSelectElement).value)}
      >
        <option value="">Choose a ministry...</option>
        {SERVICE_MINISTRIES.map((m) => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </Select>

      {/* Per-ministry status messages */}
      {selectedMinistry && isSelectedPending && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-yellow-700">
            Your application for <span className="font-semibold">{selectedMinistryData?.label ?? selectedMinistry}</span> is currently under review.
          </p>
        </div>
      )}

      {selectedMinistry && isSelectedActive && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm text-green-700">
            You are already an active servant in <span className="font-semibold">{selectedMinistryData?.label ?? selectedMinistry}</span>.
          </p>
        </div>
      )}

      {/* Only show the rest of the form if not pending/active for this ministry */}
      {!isSelectedPending && !isSelectedActive && (
        <>
          {/* Ministry description */}
          {selectedMinistryData && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600">
              {selectedMinistryData.description}
            </div>
          )}

          {/* Sub-role checkboxes */}
          {subRoles.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-gray-800">
                Which specific role/s are you interested in?
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {subRoles.map((role) => (
                  <label key={role} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                    selectedRoles.includes(role)
                      ? "border-[#ff474f] bg-[#fff8f8] text-[#ff474f]"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}>
                    <input
                      type="checkbox"
                      className="accent-[#ff474f]"
                      checked={selectedRoles.includes(role)}
                      onChange={() => toggleRole(role)}
                    />
                    {role}
                  </label>
                ))}
              </div>
              {/* "Others: please specify" text field (Worship only) */}
              {isWorship && selectedRoles.includes("Others") && (
                <input
                  type="text"
                  value={othersSpecify}
                  onChange={(e) => setOthersSpecify(e.target.value)}
                  placeholder="Please specify..."
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff474f] focus:border-transparent"
                />
              )}
            </div>
          )}

          {/* Audition video upload (Worship only) */}
          {isWorship && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-800">
                Audition Video <span className="text-[#ff474f] font-normal text-xs">(required for Worship)</span>
              </label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
                {auditionFile ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700 font-medium">{auditionFile.name}</p>
                    <p className="text-xs text-gray-400">{(auditionFile.size / 1024 / 1024).toFixed(1)} MB</p>
                    <button type="button" onClick={() => setAuditionFile(null)} className="text-xs text-red-500 hover:underline">Remove</button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                    </svg>
                    <p className="text-xs text-gray-500">Click to upload a short audition video</p>
                    <p className="text-xs text-gray-400 mt-1">MP4, MOV, AVI (max 50MB)</p>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => setAuditionFile(e.target.files?.[0] || null)}
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Why do you want to serve */}
          {selectedMinistry && (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="why_serve" className="text-sm font-medium text-gray-800">
                  Why do you want to serve? <span className="text-[#ff474f]">*</span>
                </label>
                <textarea
                  id="why_serve"
                  name="why_serve"
                  required
                  rows={3}
                  placeholder="Share your heart..."
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-[#ff474f] focus:border-transparent"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="serve_notes" className="text-sm font-medium text-gray-800">
                  Anything else you want us to know?{" "}
                  <span className="text-xs font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  id="serve_notes"
                  name="serve_notes"
                  rows={2}
                  placeholder="Skills, availability, questions, or anything you'd like to share..."
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-[#ff474f] focus:border-transparent"
                />
              </div>

              <Button type="submit" fullWidth loading={loading || uploading}>
                {uploading ? "Uploading video..." : "Ready to Serve"}
              </Button>
            </>
          )}
        </>
      )}
    </form>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
