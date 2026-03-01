"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { registerUser } from "@/lib/actions/auth.actions";
import { FAMILY_MINISTRIES, SERVICE_MINISTRIES } from "@/lib/constants/ministries";

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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

    const result = await registerUser(form);
    if (!result.success) {
      setError(result.error || "Registration failed.");
      setLoading(false);
      return;
    }

    // Sign in after successful registration
    const signInResult = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
      callbackUrl: "/dashboard",
    });

    if (signInResult?.ok) {
      window.location.href = "/dashboard";
      return;
    }

    // Auto-login failed but account was created — send to login page
    setLoading(false);
    setError("Account created! Please sign in with your new credentials.");
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/register/complete" });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Section A */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Your Info</p>
      <Input name="full_name" label="Full Name" placeholder="Juan dela Cruz" required />
      <Input name="email" type="email" label="Email" placeholder="you@email.com" required />
      <Input name="password" type="password" label="Password" placeholder="At least 6 characters" required />

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

      {/* Section B */}
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
        Create Account
      </Button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <Button type="button" variant="outline" fullWidth loading={googleLoading} onClick={handleGoogle}>
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </Button>
    </form>
  );
}
