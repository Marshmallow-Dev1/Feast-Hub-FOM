"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { type AppSettings } from "@/lib/sheets/client";
import { updateSettings } from "@/app/(dashboard)/dashboard/admin/settings/actions";

export default function SettingsForm({ initialSettings }: { initialSettings: AppSettings | null | undefined }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    const form = new FormData(e.currentTarget);

    const res = await updateSettings({
      ftd_date: form.get("ftd_date") as string,
      ftd_time: form.get("ftd_time") as string,
      ftd_venue: form.get("ftd_venue") as string,
      ftd_description: form.get("ftd_description") as string,
      feast_venue: form.get("feast_venue") as string,
      feast_time: form.get("feast_time") as string,
    });

    setLoading(false);
    if (!res.success) {
      setError(res.error || "Save failed.");
    } else {
      setSuccess(true);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">Settings saved!</div>}

      {/* FTD Schedule */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">FTD Schedule</p>

        <Input
          name="ftd_date"
          label="FTD Date"
          type="date"
          defaultValue={initialSettings?.ftd_date || ""}
        />
        <Input
          name="ftd_time"
          label="FTD Time"
          placeholder="e.g. 9:00 AM"
          defaultValue={initialSettings?.ftd_time || ""}
        />
        <Input
          name="ftd_venue"
          label="FTD Venue"
          placeholder="e.g. DS Hall, OLOPSC, Marikina"
          defaultValue={initialSettings?.ftd_venue || ""}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-800">FTD Description</label>
          <textarea
            name="ftd_description"
            rows={3}
            placeholder="Brief description shown to first timers..."
            defaultValue={initialSettings?.ftd_description || ""}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff474f] focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Feast Schedule */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Feast Schedule</p>

        <Input
          name="feast_venue"
          label="Feast Venue"
          placeholder="e.g. DS Hall, OLOPSC, Marikina"
          defaultValue={initialSettings?.feast_venue || ""}
        />
        <Input
          name="feast_time"
          label="Feast Time"
          placeholder="e.g. Every Sunday, 10:00 AM"
          defaultValue={initialSettings?.feast_time || ""}
        />
      </div>

      <Button type="submit" fullWidth loading={loading}>Save Settings</Button>
    </form>
  );
}
