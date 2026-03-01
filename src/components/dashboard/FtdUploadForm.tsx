"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { callAppsScriptClient as callAppsScript } from "@/lib/sheets/client";

export default function FtdUploadForm({ userId, userEmail }: { userId: string; userEmail: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5MB.");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!preview) { setError("Please select a photo."); return; }
    setLoading(true);
    setError("");

    const file = fileRef.current?.files?.[0];
    if (!file) { setLoading(false); return; }

    // Extract base64 content (strip data URL prefix)
    const base64 = preview.split(",")[1];

    // Upload photo to Google Drive via Apps Script
    const uploadRes = await callAppsScript<{ url: string }>("saveFtdPhoto", {
      base64,
      filename: `ftd-${userEmail}-${Date.now()}.${file.name.split(".").pop()}`,
      mimeType: file.type,
    });

    if (!uploadRes.success || !uploadRes.data?.url) {
      setError("Photo upload failed. Please try again.");
      setLoading(false);
      return;
    }

    // Submit attendance record
    const submitRes = await callAppsScript("submitFtdAttendance", {
      user_id: userId,
      user_email: userEmail,
      photo_url: uploadRes.data.url,
    });

    setLoading(false);
    if (!submitRes.success) {
      setError(submitRes.error || "Submission failed. Please try again.");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <h2 className="text-sm font-bold text-gray-900">Upload Attendance Proof</h2>
      <p className="text-xs text-gray-500">Upload a photo taken at the FTD event as proof of attendance.</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      <div
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          preview ? "border-[#ff474f] bg-[#fff8f8]" : "border-gray-200 hover:border-gray-300 bg-gray-50"
        }`}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl object-contain" />
        ) : (
          <div className="space-y-2">
            <svg className="w-8 h-8 text-gray-300 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p className="text-sm text-gray-400">Tap to select a photo</p>
            <p className="text-xs text-gray-300">JPG, PNG - max 5MB</p>
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      <Button type="submit" fullWidth loading={loading} disabled={!preview}>
        Submit Attendance
      </Button>
    </form>
  );
}
