"use client";

import { useState } from "react";
import { callAppsScriptClient as callAppsScript, type SheetUser } from "@/lib/sheets/client";
import { getRoleTags, ROLE_DISPLAY_LABELS, formatBirthday } from "@/lib/constants/roles";

// Family ministry member tags — user can only have ONE of these at a time.
// Adding one also updates the family_ministry column; removing clears it.
const FAMILY_MEMBER_TAG_TO_SLUG: Record<string, string> = {
  YOUTH_MEMBER: "youth",
  SINGLES_MEMBER: "singles",
  COUPLES_MEMBER: "couples",
  GRANDLANE_MEMBER: "grandlane",
  ARMOURS_MEMBER: "armours_of_god",
  AWESOME_KIDS_MEMBER: "awesome_kids",
};
const FAMILY_MEMBER_TAGS = Object.keys(FAMILY_MEMBER_TAG_TO_SLUG);

// All available role tags grouped for the "add tag" dropdown
const ALL_ROLE_TAG_GROUPS = [
  {
    label: "Base",
    tags: [{ value: "ATTENDEE", label: "Attendee" }],
  },
  {
    label: "Family Ministry",
    tags: [
      { value: "YOUTH_MEMBER", label: "Youth Ministry" },
      { value: "SINGLES_MEMBER", label: "Singles Ministry" },
      { value: "COUPLES_MEMBER", label: "Couples Ministry" },
      { value: "GRANDLANE_MEMBER", label: "Grandlane Ministry" },
      { value: "ARMOURS_MEMBER", label: "Armours of God" },
      { value: "AWESOME_KIDS_MEMBER", label: "Awesome Kids Ministry" },
    ],
  },
  {
    label: "Admin (assigned only)",
    tags: [
      { value: "CONNECT_HEAD", label: "Connect Servant" },
      { value: "FINANCE_MINISTRY", label: "Finance Ministry" },
      { value: "FEAST_TECH", label: "Feast Tech" },
    ],
  },
  {
    label: "Service Servants",
    tags: [
      { value: "WORSHIP_SERVANT", label: "Worship Ministry" },
      { value: "DANCE_SERVANT", label: "Dance Ministry" },
      { value: "AWESOME_KIDS_SERVICE_SERVANT", label: "Awesome Kids Service Ministry" },
      { value: "LITURGICAL_SERVANT", label: "Liturgical Ministry" },
      { value: "PRODUCTION_SERVANT", label: "Production Ministry" },
      { value: "CREATIVES_SERVANT", label: "Creatives Ministry" },
      { value: "SECURITY_SERVANT", label: "Security & Logistics Ministry" },
      { value: "FOOD_SERVANT", label: "Food Ministry" },
      { value: "INTERCESSORY_SERVANT", label: "Intercessory Ministry" },
      { value: "PASTORAL_CARE_SERVANT", label: "Pastoral Care Ministry" },
      { value: "ENGAGERS_SERVANT", label: "Engagers Ministry" },
    ],
  },
  {
    label: "Family Ministry Heads",
    tags: [
      { value: "YOUTH_HEAD", label: "Youth Ministry Head" },
      { value: "SINGLES_HEAD", label: "Singles Ministry Head" },
      { value: "COUPLES_HEAD", label: "Couples Ministry Head" },
      { value: "GRANDLANE_HEAD", label: "Grandlane Ministry Head" },
      { value: "ARMOURS_HEAD", label: "Armours of God Head" },
      { value: "AWESOME_KIDS_HEAD", label: "Awesome Kids Ministry Head" },
    ],
  },
  {
    label: "Service Ministry Heads",
    tags: [
      { value: "WORSHIP_HEAD", label: "Worship Ministry Head" },
      { value: "DANCE_HEAD", label: "Dance Ministry Head" },
      { value: "AWESOME_KIDS_SERVICE_HEAD", label: "Awesome Kids Service Head" },
      { value: "LITURGICAL_HEAD", label: "Liturgical Ministry Head" },
      { value: "PRODUCTION_HEAD", label: "Production Ministry Head" },
      { value: "CREATIVES_HEAD", label: "Creatives Ministry Head" },
      { value: "SECURITY_HEAD", label: "Security & Logistics Head" },
      { value: "FOOD_HEAD", label: "Food Ministry Head" },
      { value: "INTERCESSORY_HEAD", label: "Intercessory Ministry Head" },
      { value: "PASTORAL_CARE_HEAD", label: "Pastoral Care Ministry Head" },
      { value: "ENGAGERS_HEAD", label: "Engagers Ministry Head" },
    ],
  },
  {
    label: "Super Admin",
    tags: [
      { value: "FEAST_BUILDER", label: "Feast Builder" },
      { value: "SUPER_ADMIN", label: "Super Admin" },
    ],
  },
];

// Tag color by category
function getTagColor(tag: string): string {
  if (tag === "SUPER_ADMIN" || tag === "FEAST_BUILDER") return "bg-purple-100 text-purple-700 border-purple-200";
  if (tag === "CONNECT_HEAD" || tag === "FINANCE_MINISTRY" || tag === "FEAST_TECH") return "bg-blue-100 text-blue-700 border-blue-200";
  if (FAMILY_MEMBER_TAGS.includes(tag)) return "bg-pink-100 text-pink-700 border-pink-200";
  if (tag.endsWith("_HEAD")) return "bg-orange-100 text-orange-700 border-orange-200";
  if (tag.endsWith("_SERVANT")) return "bg-green-100 text-green-700 border-green-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}

function getTagLabel(tag: string): string {
  return ROLE_DISPLAY_LABELS[tag] ?? tag.replace(/_/g, " ");
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE_MEMBER: "bg-green-100 text-green-700",
  FTD_PENDING_APPROVAL: "bg-yellow-100 text-yellow-700",
  FTD_NOT_ATTENDED: "bg-gray-100 text-gray-500",
  FTD_NOT_APPROVED: "bg-red-100 text-red-600",
};

export default function UsersTable({ users, canEditRoles = false }: { users: SheetUser[]; canEditRoles?: boolean }) {
  const [data, setData] = useState(users);
  const [savingEmail, setSavingEmail] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function saveUserFields(email: string, fields: Record<string, string>) {
    setSavingEmail(email);
    setError("");
    const res = await callAppsScript("updateUser", { email, ...fields });
    setSavingEmail(null);
    if (!res.success) {
      setError(res.error || "Update failed.");
      return false;
    }
    setData((prev) => prev.map((u) => u.email === email ? { ...u, ...fields } : u));
    return true;
  }

  async function addTag(email: string, currentRole: string, tag: string) {
    if (!tag) return;
    let tags = getRoleTags(currentRole);
    if (tags.includes(tag)) return;

    const fields: Record<string, string> = {};

    if (FAMILY_MEMBER_TAGS.includes(tag)) {
      // Remove any existing family member tag (only one allowed)
      tags = tags.filter((t) => !FAMILY_MEMBER_TAGS.includes(t));
      // Also sync the family_ministry column
      fields.family_ministry = FAMILY_MEMBER_TAG_TO_SLUG[tag];
    }

    tags.push(tag);
    fields.role = tags.join(",");
    await saveUserFields(email, fields);
  }

  async function removeTag(email: string, currentRole: string, tag: string) {
    const tags = getRoleTags(currentRole).filter((t) => t !== tag);
    const fields: Record<string, string> = { role: tags.join(",") || "ATTENDEE" };

    if (FAMILY_MEMBER_TAGS.includes(tag)) {
      // Clear the family_ministry column when the membership tag is removed
      fields.family_ministry = "";
    }

    await saveUserFields(email, fields);
  }

  const filtered = data.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

      <input
        type="search"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff474f] focus:border-transparent"
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr className="text-left">
                <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">User</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Sex</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Birthday</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Contact</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">LG Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Servant</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider min-w-[200px] whitespace-nowrap">Roles</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => {
                const tags = getRoleTags(u.role || "ATTENDEE");
                const isSaving = savingEmail === u.email;
                return (
                  <tr key={u.email} className={`hover:bg-gray-50 transition-colors ${isSaving ? "opacity-60" : ""}`}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-medium text-gray-900">{u.full_name || "N/A"}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                      <p className="text-[10px] text-gray-300 capitalize">{u.auth_provider} · {u.account_type?.replace(/_/g, " ")}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 capitalize whitespace-nowrap">{u.sex || "-"}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{formatBirthday(u.birthday)}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{u.contact || "-"}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{u.lg_name || "-"}</td>
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
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_BADGE[u.account_status] || "bg-gray-100 text-gray-500"}`}>
                        {u.account_status?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 items-center">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getTagColor(tag)}`}
                          >
                            {getTagLabel(tag)}
                            {canEditRoles && (
                              <button
                                onClick={() => removeTag(u.email, u.role, tag)}
                                disabled={isSaving}
                                className="ml-0.5 opacity-60 hover:opacity-100 leading-none"
                                title={`Remove ${getTagLabel(tag)}`}
                              >
                                x
                              </button>
                            )}
                          </span>
                        ))}
                        {canEditRoles && (
                          <select
                            value=""
                            onChange={(e) => addTag(u.email, u.role, e.target.value)}
                            disabled={isSaving}
                            className="text-[10px] rounded-lg border border-dashed border-gray-300 px-1.5 py-0.5 text-gray-400 bg-transparent cursor-pointer focus:outline-none focus:border-[#ff474f] disabled:opacity-50"
                          >
                            <option value="">+ Add role</option>
                            {ALL_ROLE_TAG_GROUPS.map((group) => (
                              <optgroup key={group.label} label={group.label}>
                                {group.tags
                                  .filter((t) => !tags.includes(t.value))
                                  .map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                  ))}
                              </optgroup>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-400">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
