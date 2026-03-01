import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import PrayerRequestForm from "@/components/dashboard/PrayerRequestForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ask For Prayer" };

export default async function PrayPage() {
  const session = await auth();
  if (!session) redirect("/");
  if (session.user.account_type === "FIRST_TIMER") redirect("/dashboard");

  return (
    <div className="max-w-lg mx-auto space-y-5 pb-20 md:pb-6">
      <div>
        <h1 className="text-xl font-black text-gray-900">Ask For Prayer</h1>
      </div>

      <div className="bg-[#fff8f8] border border-[#ffd6d7] rounded-2xl p-5 space-y-2">
        <p className="text-sm text-gray-700 italic leading-relaxed">
          "This is the confidence we have in approaching God: that if we ask anything according to his will, he hears us."
        </p>
        <p className="text-xs font-semibold text-[#cc2a2f] text-right">1 John 5:14</p>
      </div>

      <PrayerRequestForm
        defaultName={session.user.name ?? ""}
        defaultEmail={session.user.email ?? ""}
      />
    </div>
  );
}
