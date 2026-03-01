"use client";

import { useState } from "react";
import { callAppsScriptClient } from "@/lib/sheets/client";

export default function PrayerRequestForm({ defaultName, defaultEmail }: { defaultName?: string; defaultEmail?: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);

    const res = await callAppsScriptClient("submitPrayerRequest", {
      full_name: form.get("full_name"),
      email: form.get("email"),
      contact: form.get("contact"),
      prayer_request: form.get("prayer_request"),
    });

    setLoading(false);
    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.error || "Submission failed. Please try again.");
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-3">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-bold text-gray-900">Prayer Request Submitted!</p>
        <p className="text-sm text-gray-500">Our Intercessory Ministry will be praying for you.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-800">
          Full Name <span className="text-[#ff474f]">*</span>
        </label>
        <input
          name="full_name"
          type="text"
          required
          defaultValue={defaultName}
          placeholder="Your full name"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff474f] focus:border-transparent"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-800">
          Email <span className="text-[#ff474f]">*</span>
        </label>
        <input
          name="email"
          type="email"
          required
          defaultValue={defaultEmail}
          placeholder="your@email.com"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff474f] focus:border-transparent"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-800">Contact Number</label>
        <input
          name="contact"
          type="text"
          placeholder="09XX XXX XXXX"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff474f] focus:border-transparent"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-800">
          Your Prayer Request <span className="text-[#ff474f]">*</span>
        </label>
        <textarea
          name="prayer_request"
          required
          rows={5}
          placeholder="Share what you would like us to pray for..."
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff474f] focus:border-transparent resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#ff474f] text-white rounded-xl py-3 font-bold text-sm hover:bg-[#e03d44] disabled:opacity-60 transition-colors"
      >
        {loading ? "Sending..." : "Send Prayer Request"}
      </button>
    </form>
  );
}
