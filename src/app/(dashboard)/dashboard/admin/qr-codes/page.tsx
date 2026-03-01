import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { isSuper } from "@/lib/constants/roles";
import QrCodesClient from "@/components/dashboard/admin/QrCodesClient";

export default async function QrCodesPage() {
  const session = await auth();
  if (!session) redirect("/");
  if (!isSuper(session.user.role)) redirect("/dashboard");

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-900">QR Codes</h1>
        <p className="text-sm text-gray-500 mt-1">Generate QR codes that link to the registration page.</p>
      </div>
      <QrCodesClient />
    </div>
  );
}
