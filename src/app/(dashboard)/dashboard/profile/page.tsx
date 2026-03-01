import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { callAppsScript, type SheetUser } from "@/lib/sheets/client";
import ProfileForm from "@/components/dashboard/ProfileForm";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/");

  // Fetch from DB first — also resolves stale JWT (e.g. PENDING_SETUP after profile completion)
  const res = await callAppsScript<SheetUser>("getUserByEmail", { email: session.user.email });
  const user = res.data;
  const accountStatus = user?.account_status ?? session.user.account_status;
  if (accountStatus !== "ACTIVE_MEMBER") redirect("/dashboard");

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
