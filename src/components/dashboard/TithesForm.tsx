"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { callAppsScriptClient as callAppsScript } from "@/lib/sheets/client";

const OFFERING_TYPES = [
  { value: "tithe", label: "Tithe" },
  { value: "love_offering", label: "Love Offering" },
  { value: "special_offering", label: "Special Offering" },
];

const PAYMENT_METHODS = [
  { value: "gcash", label: "GCash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "instapay", label: "InstaPay" },
  { value: "maya", label: "Maya" },
  { value: "cash", label: "Cash" },
];

export default function TithesForm({ userId, userEmail, userName }: { userId: string; userEmail: string; userName: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await callAppsScript("submitTithe", {
      user_id: userId,
      user_email: userEmail,
      full_name: userName,
      amount: (form.get("amount") as string).replace(/,/g, ""),
      offering_type: form.get("offering_type"),
      payment_method: form.get("payment_method"),
      reference_number: form.get("reference_number"),
      prayer_intentions: form.get("prayer_intentions"),
      thanksgiving: form.get("thanksgiving"),
    });
    setLoading(false);
    if (!res.success) {
      setError(res.error || "Submission failed.");
    } else {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-3">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <p className="font-bold text-gray-900">Offering recorded!</p>
        <p className="text-sm text-gray-500">A receipt has been sent to your email. Thank you for your generosity.</p>
        <Button variant="outline" onClick={() => setSuccess(false)}>Submit another</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* InstaPay QR */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">InstaPay / GCash</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/InstaPay_QR.jpg" alt="InstaPay QR Code" className="w-48 h-48 object-contain mx-auto rounded-xl" />
        <p className="text-xs text-gray-500 mt-3">Scan the QR code to send your offering, then fill the form below.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

        <Select name="offering_type" label="Offering Type" required>
          {OFFERING_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </Select>

        <Input name="amount" label="Amount (PHP)" placeholder="500" required />

        <Select name="payment_method" label="Payment Method">
          <option value="">Select...</option>
          {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </Select>

        <Input name="reference_number" label="Reference Number" placeholder="GCash / bank ref (optional)" />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-800">Prayer Intentions <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea name="prayer_intentions" rows={3} placeholder="Share your prayer intentions..." className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff474f] focus:border-transparent resize-none" />
          <p className="text-xs text-gray-400">This is forwarded and prayed by our Intercessory Ministry (no financial details shared).</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-800">Thanksgiving <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea name="thanksgiving" rows={2} placeholder="Something you are thankful for..." className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff474f] focus:border-transparent resize-none" />
        </div>

        <Button type="submit" fullWidth loading={loading}>Submit Offering</Button>
      </form>
    </div>
  );
}
