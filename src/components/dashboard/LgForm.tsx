"use client";

import { useState } from "react";
import { callAppsScriptClient } from "@/lib/sheets/client";
import type { SheetUser } from "@/lib/sheets/client";
import { FAMILY_MINISTRIES } from "@/lib/constants/ministries";

function calculateAge(birthday: string): number | null {
  if (!birthday) return null;
  const bday = new Date(birthday);
  if (isNaN(bday.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - bday.getFullYear();
  const m = today.getMonth() - bday.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bday.getDate())) age--;
  return age >= 0 ? age : null;
}

function ReadOnlyField({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-800 mt-0.5 font-medium">{value || "Not set"}</p>
    </div>
  );
}

export default function LgForm({ user }: { user: SheetUser }) {
  const [messengerLink, setMessengerLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const age = calculateAge(user.birthday);
  const familyMinistryLabel =
    FAMILY_MINISTRIES.find((m) => m.value === user.family_ministry)?.label ||
    user.family_ministry ||
    "Not set";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await callAppsScriptClient("submitLgRequest", {
      user_id: user.id,
      user_email: user.email,
      full_name: user.full_name,
      contact: user.contact,
      age: age?.toString() ?? "",
      sex: user.sex,
      family_ministry: user.family_ministry,
      messenger_link: messengerLink,
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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center space-y-3">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-bold text-gray-900">Request Submitted!</p>
        <p className="text-sm text-gray-500">
          Our Light Group coordinators will reach out to you soon through Facebook Messenger.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Your Information</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <ReadOnlyField label="Full Name" value={user.full_name} wide />
          <ReadOnlyField label="Email" value={user.email} wide />
          <ReadOnlyField label="Contact" value={user.contact} />
          <ReadOnlyField label="Age" value={age ? `${age} yrs old` : ""} />
          <ReadOnlyField label="Sex" value={user.sex} />
          <ReadOnlyField label="Family Ministry" value={familyMinistryLabel} />
        </div>
        <p className="text-[10px] text-gray-400">
          To update your information, go to{" "}
          <a href="/dashboard/profile" className="text-[#ff474f] font-medium">
            My Profile
          </a>
          .
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2">
        <label className="block">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Facebook / Messenger Link <span className="text-[#ff474f]">*</span>
          </span>
          <p className="text-xs text-gray-500 mt-1 mb-2">
            Share your Facebook profile link so your LG Head can reach out to you.
          </p>
          <input
            type="text"
            value={messengerLink}
            onChange={(e) => setMessengerLink(e.target.value)}
            placeholder="https://www.facebook.com/yourprofile"
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff474f] focus:border-transparent"
          />
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#ff474f] text-white rounded-xl py-3 font-bold text-sm hover:bg-[#e03d44] disabled:opacity-60 transition-colors"
      >
        {loading ? "Submitting..." : "Start my journey"}
      </button>
    </form>
  );
}
