"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { completeGoogleProfile } from "@/lib/actions/auth.actions";
import { FAMILY_MINISTRIES, SERVICE_MINISTRIES } from "@/lib/constants/ministries";

interface Props {
  name: string;
  email: string;
}

export default function CompleteProfileForm({ name, email }: Props) {
  const { update } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accountType, setAccountType] = useState<"FIRST_TIMER" | "FEAST_ATTENDEE">("FIRST_TIMER");
  const [sex, setSex] = useState<"male" | "female" | "">("");
  const [howHeard, setHowHeard] = useState("");
  const [invitedBy, setInvitedBy] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [discipleship, setDiscipleship] = useState<string[]>([]);

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
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    form.set("account_type", accountType);
    form.set("sex", sex);
    form.set("how_heard", howHeard);
    form.set("invited_by", (howHeard === "friend" || howHeard === "family") ? invitedBy : "");
    form.set("service_ministries", selectedServices.join(","));
    form.set("discipleship_status", discipleship.join(","));

    const result = await completeGoogleProfile(form);
    if (!result.success) {
      setError(result.error || "Failed to save profile.");
      setLoading(false);
      return;
    }

    // Refresh the JWT so the dashboard sees the updated account_type/status
    await update();
    window.location.href = "/dashboard";
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Pre-filled Google data */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">From your Google account</p>
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <p className="text-sm font-semibold text-gray-800">{name}</p>
          <p className="text-sm text-gray-500">{email}</p>
        </div>

        {/* Additional Info */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">A few more details</p>

        <div className="grid grid-cols-2 gap-3">
          <Input name="birthday" type="date" label="Birthday" />
          <Input name="contact" type="tel" label="Contact Number" placeholder="09XXXXXXXXX" />
        </div>

        {/* Sex */}
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-gray-800">Sex</p>
          <div className="grid grid-cols-2 gap-2">
            {(["male", "female"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSex(s)}
                className={`py-2.5 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                  sex === s
                    ? "border-[#ff474f] bg-[#fff8f8] text-[#ff474f]"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {s === "male" ? "Male" : "Female"}
              </button>
            ))}
          </div>
        </div>

        {/* How did you hear about The Feast */}
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-gray-800">How did you get to know The Feast?</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { value: "walk_in", label: "Walk-in" },
              { value: "friend", label: "Friend" },
              { value: "family", label: "Family" },
              { value: "poster_tarpaulin", label: "Poster/Tarpaulin" },
              { value: "facebook", label: "Facebook" },
              { value: "instagram", label: "Instagram" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setHowHeard(opt.value); setInvitedBy(""); }}
                className={`py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  howHeard === opt.value
                    ? "border-[#ff474f] bg-[#fff8f8] text-[#ff474f]"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {(howHeard === "friend" || howHeard === "family") && (
            <input
              type="text"
              value={invitedBy}
              onChange={(e) => setInvitedBy(e.target.value)}
              placeholder={howHeard === "friend" ? "Name of friend who invited you" : "Name of family member who invited you"}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff474f] focus:border-transparent"
            />
          )}
        </div>

        {/* Account type */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">I am a...</p>
        <div className="grid grid-cols-2 gap-2">
          {(["FIRST_TIMER", "FEAST_ATTENDEE"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setAccountType(type)}
              className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold text-left transition-all ${
                accountType === type
                  ? "border-[#ff474f] bg-[#fff8f8] text-[#ff474f]"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              <div className="text-sm font-bold">
                {type === "FIRST_TIMER" ? "First Time Attendee" : "Feast Attendee"}
              </div>
              <div className="text-xs font-normal mt-0.5 opacity-70">
                {type === "FIRST_TIMER" ? "New to The Feast" : "Regular member"}
              </div>
            </button>
          ))}
        </div>

        {/* Extra fields for Feast Attendees */}
        {accountType === "FEAST_ATTENDEE" && (
          <div className="flex flex-col gap-4 pt-1">
            <Select name="family_ministry" label="Family Ministry" required>
              <option value="">Select ministry...</option>
              {FAMILY_MINISTRIES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </Select>

            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium text-gray-800">Service Ministry</p>
              <div className="grid grid-cols-2 gap-1.5">
                {SERVICE_MINISTRIES.map((m) => (
                  <label key={m.value} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                    selectedServices.includes(m.value)
                      ? "border-[#ff474f] bg-[#fff8f8] text-[#ff474f]"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}>
                    <input
                      type="checkbox"
                      className="accent-[#ff474f]"
                      checked={selectedServices.includes(m.value)}
                      onChange={() => toggleService(m.value)}
                    />
                    {m.label}
                  </label>
                ))}
              </div>
            </div>

            <Input name="lg_name" label="LG Name" placeholder="Your Light Group (optional)" />

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
          </div>
        )}

        <Button type="submit" fullWidth loading={loading} className="mt-1">
          Complete Registration
        </Button>
      </form>
    </div>
  );
}
