import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { callAppsScript, type ServantApplication } from "@/lib/sheets/client";
import { isServiceHead, isSuper, getServiceMinistriesFromRole } from "@/lib/constants/roles";
import ServantApprovalList from "@/components/dashboard/admin/ServantApprovalList";

export default async function ServantApprovalsPage() {
  const session = await auth();
  if (!session) redirect("/");
  const role = session.user.role;
  if (!isServiceHead(role) && !isSuper(role)) redirect("/dashboard");

  // Service heads see only their ministry's applications; if multiple head roles, show all theirs
  const ministries = isSuper(role) ? [] : getServiceMinistriesFromRole(role);
  const filterMinistry = ministries.length === 1 ? ministries[0] : undefined;

  const res = await callAppsScript<ServantApplication[]>("listServantApplications", {
    ministry: filterMinistry,
  });
  const applications = res.success ? (res.data ?? []) : [];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-900">Servant Applications</h1>
        <p className="text-sm text-gray-500 mt-1">Review ministry servant applications.</p>
      </div>
      <ServantApprovalList initialApplications={applications} reviewerEmail={session.user.email!} />
    </div>
  );
}
