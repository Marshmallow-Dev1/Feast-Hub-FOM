"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import { type SheetUser } from "@/lib/sheets/client";
import { updateUserProfile } from "@/lib/actions/auth.actions";
import { FAMILY_MINISTRIES, SERVICE_MINISTRIES } from "@/lib/constants/ministries";

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

export default function ProfileForm({ user }: { user: SheetUser }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [birthday, setBirthday] = useState(user.birthday || "");
  const [selectedServices, setSelectedServices] = useState<string[]>(
    user.service_ministries ? user.service_ministries.split(",").filter(Boolean) : []
  );
  const [discipleship, setDiscipleship] = useState<string[]>(
    user.discipleship_status ? user.discipleship_status.split(",").filter(Boolean) : []
  );

  const age = calculateAge(birthday);

  function toggleService(value: string) {
    setSelectedServices((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function toggleDiscipleship(value: string) {
    setDiscipleship((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    const form = new FormData(e.currentTarget);
    form.set("birthday", birthday);
    form.set("service_ministries", selectedServices.join(","));
    form.set("discipleship_status", discipleship.join(","));

    const res = await updateUserProfile(form);

    setLoading(false);
    if (!res.success) {
      setError(res.error || "Update failed.");
    } else {
      setSuccess(true);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">Profile updated!</div>}

      <div className="space-y-1">
        <p className="text-xs text-gray-400">Email</p>
        <p className="text-sm font-medium text-gray-900">{user.email}</p>
      </div>

      {/* Birthday + Age */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-800">Birthday</label>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff474f] focus:border-transparent"
          />
          {age !== null && (
            <span className="text-sm text-gray-500 whitespace-nowrap">{age} years old</span>
          )}
        </div>
      </div>

      <Select name="family_ministry" label="Family Ministry" defaultValue={user.family_ministry}>
        <option value="">Select ministry...</option>
        {FAMILY_MINISTRIES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
      </Select>

      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-gray-800">Service Ministry</p>
        <div className="grid grid-cols-2 gap-1.5">
          {SERVICE_MINISTRIES.map((m) => (
            <label key={m.value} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
              selectedServices.includes(m.value) ? "border-[#ff474f] bg-[#fff8f8] text-[#ff474f]" : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}>
              <input type="checkbox" className="accent-[#ff474f]" checked={selectedServices.includes(m.value)} onChange={() => toggleService(m.value)} />
              {m.label}
            </label>
          ))}
        </div>
      </div>

      <Input name="lg_name" label="LG Name" defaultValue={user.lg_name} placeholder="Your Light Group (optional)" />

      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-gray-800">Discipleship Status</p>
        <p className="text-xs text-gray-400">Check all that apply</p>
        <div className="flex flex-col gap-2">
          {[
            { value: "LST", label: "Love Someone Today (LST)" },
            { value: "JE", label: "Jesus Encounter (JE)" },
          ].map((d) => (
            <label key={d.value} className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-sm transition-all ${
              discipleship.includes(d.value)
                ? "border-[#ff474f] bg-[#fff8f8] text-[#ff474f]"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}>
              <input
                type="checkbox"
                className="accent-[#ff474f]"
                checked={discipleship.includes(d.value)}
                onChange={() => toggleDiscipleship(d.value)}
              />
              {d.label}
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" fullWidth loading={loading}>Save Changes</Button>
    </form>
  );
}
