import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { callAppsScript, type SheetUser } from "@/lib/sheets/client";
import { getServiceMinistriesFromRole, isSuper, formatBirthday } from "@/lib/constants/roles";
import { SERVICE_MINISTRIES } from "@/lib/constants/ministries";

export default async function ServiceMinistryPage({ params }: { params: Promise<{ ministry: string }> }) {
  const { ministry } = await params;
  const session = await auth();
  if (!session) redirect("/");

  const { role } = session.user;
  const allowedMinistries = getServiceMinistriesFromRole(role);

  if (!isSuper(role) && !allowedMinistries.includes(ministry)) redirect("/dashboard");

  const ministryData = SERVICE_MINISTRIES.find((m) => m.value === ministry);
  if (!ministryData) redirect("/dashboard");

  const res = await callAppsScript<SheetUser[]>("listUsers");
  const allUsers = res.data ?? [];
  // Show members who have this service ministry in their service_ministries list
  const members = allUsers.filter((u) =>
    u.service_ministries?.split(",").map((s) => s.trim()).includes(ministry)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-20 md:pb-6">
      <div>
        <h1 className="text-xl font-black text-gray-900">{ministryData.label}</h1>
        <p className="text-sm text-gray-500 mt-1">{ministryData.description}</p>
        <p className="text-sm text-gray-400 mt-1">{members.length} member{members.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Sex</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Birthday</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Family Ministry</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">LG Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Discipleship</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Servant Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members.map((u) => (
                <tr key={u.email} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-medium text-gray-900">{u.full_name || "N/A"}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 capitalize whitespace-nowrap">{u.sex || "-"}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{formatBirthday(u.birthday)}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{u.contact || "-"}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 capitalize whitespace-nowrap">{u.family_ministry?.replace(/_/g, " ") || "-"}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{u.lg_name || "-"}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{u.discipleship_status || "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      u.servant_status === "ACTIVE_SERVANT" ? "bg-green-100 text-green-700" :
                      u.servant_status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                      u.servant_status === "DENIED" ? "bg-red-100 text-red-600" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {u.servant_status || "NONE"}
                    </span>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">No members found in this ministry.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
