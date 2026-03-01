import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import QrCodesClient from "@/components/dashboard/admin/QrCodesClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "QR Codes" };

export default async function QrCodesPage() {
  const session = await auth();
  if (!session) redirect("/");
  if (session.user.account_type !== "FEAST_ATTENDEE") redirect("/dashboard");

  return (
    <div className="max-w-lg mx-auto space-y-5 pb-20 md:pb-6">
      <div>
        <h1 className="text-xl font-black text-gray-900">QR Codes</h1>
        <p className="text-sm text-gray-500 mt-1">Share these QR codes to invite others to The Feast.</p>
      </div>
      <QrCodesClient />
    </div>
  );
}
