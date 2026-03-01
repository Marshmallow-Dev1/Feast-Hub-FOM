import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { callAppsScript, type SheetUser } from "@/lib/sheets/client";
import { isSuper } from "@/lib/constants/roles";
import UsersTable from "@/components/dashboard/admin/UsersTable";

export default async function UsersPage() {
  const session = await auth();
  if (!session) redirect("/");
  if (!isSuper(session.user.role)) redirect("/dashboard");

  const res = await callAppsScript<SheetUser[]>("listUsers", {});
  const users = res.success ? (res.data ?? []) : [];

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">{users.length} registered user{users.length !== 1 ? "s" : ""}.</p>
      </div>
      <UsersTable users={users} canEditRoles />
    </div>
  );
}
