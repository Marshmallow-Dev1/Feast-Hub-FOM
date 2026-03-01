import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { callAppsScript, type FtdSubmission } from "@/lib/sheets/client";
import { isConnectHeadOrAbove } from "@/lib/constants/roles";
import FtdApprovalList from "@/components/dashboard/admin/FtdApprovalList";

export default async function FtdApprovalsPage() {
  const session = await auth();
  if (!session) redirect("/");
  const role = session.user.role;
  if (!isConnectHeadOrAbove(role)) redirect("/dashboard");

  const res = await callAppsScript<FtdSubmission[]>("listFtdPending", {});
  const submissions = res.success ? (res.data ?? []) : [];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-900">FTD Attendance Approvals</h1>
        <p className="text-sm text-gray-500 mt-1">Review and approve first-timer attendance photos.</p>
      </div>
      <FtdApprovalList initialSubmissions={submissions} reviewerEmail={session.user.email!} />
    </div>
  );
}
