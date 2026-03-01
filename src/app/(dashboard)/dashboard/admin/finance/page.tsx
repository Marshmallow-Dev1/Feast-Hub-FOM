import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { callAppsScript, type TitheRecord } from "@/lib/sheets/client";
import { isFinanceMinistry, isSuper } from "@/lib/constants/roles";
import FinanceTable from "@/components/dashboard/admin/FinanceTable";

export default async function FinancePage() {
  const session = await auth();
  if (!session) redirect("/");
  const role = session.user.role;
  if (!isFinanceMinistry(role) && !isSuper(role)) redirect("/dashboard");

  const res = await callAppsScript<TitheRecord[]>("listTithes", {});
  const records = res.success ? (res.data ?? []) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-20 md:pb-6">
      <div>
        <h1 className="text-xl font-black text-gray-900">Tithes & Offerings</h1>
        <p className="text-sm text-gray-500 mt-1">Verify submitted offering records against actual GCash receipts.</p>
      </div>
      <FinanceTable records={records} verifierEmail={session.user.email ?? ""} />
    </div>
  );
}
