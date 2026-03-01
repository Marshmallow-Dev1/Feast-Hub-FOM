import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { callAppsScript, type SheetUser } from "@/lib/sheets/client";
import ProfileForm from "@/components/dashboard/ProfileForm";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/");
  if (session.user.account_status !== "ACTIVE_MEMBER") redirect("/dashboard");

  const res = await callAppsScript<SheetUser>("getUserByEmail", { email: session.user.email });
  const user = res.data;

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Update your ministry information.</p>
      </div>
      {user && <ProfileForm user={user} />}
    </div>
  );
}
