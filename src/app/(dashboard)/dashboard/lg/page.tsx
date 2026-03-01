import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { callAppsScript, type SheetUser } from "@/lib/sheets/client";
import LgForm from "@/components/dashboard/LgForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Join a Light Group" };

export default async function LgPage() {
  const session = await auth();
  if (!session) redirect("/");
  if (session.user.account_type !== "FEAST_ATTENDEE") redirect("/dashboard");

  const res = await callAppsScript<SheetUser>("getUserByEmail", { email: session.user.email });
  const user = res.data;

  return (
    <div className="max-w-lg mx-auto space-y-5 pb-20 md:pb-6">
      <div>
        <h1 className="text-xl font-black text-gray-900">Join a Light Group</h1>
        <p className="text-sm text-gray-500 mt-1">Connect with others in your family ministry.</p>
      </div>

      {/* What is a Light Group */}
      <div className="bg-[#fff8f8] border border-[#ffd6d7] rounded-2xl p-5 space-y-2">
        <p className="text-sm font-bold text-[#cc2a2f]">What is a Light Group?</p>
        <p className="text-sm text-gray-700 leading-relaxed">
          Light Groups are small groups of people who meet each week or month to pray and journey life together.
        </p>
      </div>

      {user && <LgForm user={user} />}
    </div>
  );
}
