import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { getCachedSettings } from "@/lib/sheets/client";
import { isConnectHeadOrAbove } from "@/lib/constants/roles";
import SettingsForm from "@/components/dashboard/admin/SettingsForm";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/");
  if (!isConnectHeadOrAbove(session.user.role)) redirect("/dashboard");

  const settings = await getCachedSettings();

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-900">App Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage FTD schedule, venue details, and display settings.</p>
      </div>
      <SettingsForm initialSettings={settings} />
    </div>
  );
}
