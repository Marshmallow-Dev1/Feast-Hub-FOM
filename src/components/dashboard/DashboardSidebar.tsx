"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  isSuper, isFamilyHead, isServiceHead, isConnectHeadOrAbove, isFinanceMinistry,
  getFamilyMinistriesFromRole, getServiceMinistriesFromRole,
  getNavbarRoleLabel, hasAttendeeFeatures,
} from "@/lib/constants/roles";
import { FAMILY_MINISTRIES, SERVICE_MINISTRIES } from "@/lib/constants/ministries";

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
  account_type: string;
  account_status: string;
  servant_status: string;
}

interface NavItem { href: string; label: string; icon: React.ReactNode; }

// ─── Icons ────────────────────────────────────────────────────────────────────
const HomeIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const CalIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const UserIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const HeartIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
const ServeIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
const LgIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M3 21v-1a9 9 0 0118 0v1"/></svg>;
const QrIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const LinkIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>;
const CheckIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const BadgeIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>;
const DollarIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
const UsersIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
const GearIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
const FamilyIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>;
const SignOutIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const SendIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const CrossIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M10 3v7H3v4h7v7h4v-7h7v-4h-7V3z"/></svg>;

// ─── Nav builder ──────────────────────────────────────────────────────────────

function getNavItems(user: User): NavItem[] {
  const { role, account_type } = user;
  const isFirstTimer = account_type === "FIRST_TIMER";
  // Admins always get member features regardless of account_type in JWT
  const isAdmin = isConnectHeadOrAbove(role) || isFinanceMinistry(role) || isSuper(role);
  const isActive = hasAttendeeFeatures(account_type) || isAdmin;

  const items: NavItem[] = [{ href: "/dashboard", label: "Home", icon: <HomeIcon /> }];

  if (isFirstTimer) {
    items.push({ href: "/dashboard/ftd", label: "FTD Attendance", icon: <CalIcon /> });
    return items;
  }

  if (isActive) {
    items.push(
      { href: "/dashboard/profile", label: "My Profile", icon: <UserIcon /> },
      { href: "/dashboard/tithes", label: "Send Tithes & Offerings", icon: <HeartIcon /> },
      { href: "/dashboard/become-servant", label: "Become a Servant", icon: <ServeIcon /> },
      { href: "/dashboard/lg", label: "Join a Light Group", icon: <LgIcon /> },
      { href: "/dashboard/qr-codes", label: "QR Codes", icon: <QrIcon /> },
      { href: "/dashboard/connect", label: "Connect with us", icon: <LinkIcon /> },
      { href: "/dashboard/pray", label: "Ask For Prayer", icon: <SendIcon /> },
      { href: "/dashboard/cleansing-prayer", label: "Cleansing Prayer", icon: <CrossIcon /> },
      { href: "/dashboard/novena", label: "Novena to God's Love", icon: <CrossIcon /> },
    );
    if (
      user.servant_status === "ACTIVE_SERVANT" ||
      isServiceHead(role) ||
      isFamilyHead(role) ||
      isSuper(role)
    ) {
      items.push({ href: "/dashboard/servant-prayer", label: "A Servant's Prayer", icon: <CrossIcon /> });
    }
  }

  if (isConnectHeadOrAbove(role)) {
    items.push({ href: "/dashboard/admin/ftd", label: "FTD Approvals", icon: <CheckIcon /> });
    if (!isSuper(role)) {
      items.push({ href: "/dashboard/admin/settings", label: "FTD Schedule", icon: <CalIcon /> });
    }
  }

  const familyMinistries = getFamilyMinistriesFromRole(role);
  for (const fm of familyMinistries) {
    const label = FAMILY_MINISTRIES.find((m) => m.value === fm)?.label ?? fm;
    items.push({ href: `/dashboard/admin/family/${fm}`, label, icon: <FamilyIcon /> });
  }

  const serviceMinistries = getServiceMinistriesFromRole(role);
  for (const sm of serviceMinistries) {
    const label = SERVICE_MINISTRIES.find((m) => m.value === sm)?.label ?? sm;
    items.push({ href: `/dashboard/admin/service/${sm}`, label, icon: <BadgeIcon /> });
  }

  if (isServiceHead(role) && !isSuper(role)) {
    items.push({ href: "/dashboard/admin/servants", label: "Servant Applications", icon: <BadgeIcon /> });
  }

  if (isFinanceMinistry(role) || isSuper(role)) {
    items.push({ href: "/dashboard/admin/finance", label: "Tithes Records", icon: <DollarIcon /> });
  }

  if (isSuper(role)) {
    items.push(
      { href: "/dashboard/admin/servants", label: "Servant Applications", icon: <BadgeIcon /> },
      { href: "/dashboard/admin/users", label: "Users", icon: <UsersIcon /> },
      { href: "/dashboard/admin/qr-codes", label: "QR Generator", icon: <QrIcon /> },
      { href: "/dashboard/admin/settings", label: "Settings", icon: <GearIcon /> },
    );
  }

  return items;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardSidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const navItems = getNavItems(user);
  const { role } = user;

  return (
    <aside className="hidden md:flex w-60 flex-col bg-white border-r border-gray-100 min-h-screen">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
        <Image src="/FOM-Logo.jpg" alt="FOM" width={36} height={36} className="rounded-xl object-cover" />
        <div>
          <p className="text-xs font-black text-gray-900 leading-tight">The Feast</p>
          <p className="text-[10px] text-gray-400 leading-tight">OLOPSC Marikina</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? "bg-[#fff0f1] text-[#ff474f]" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className={active ? "text-[#ff474f]" : "text-gray-400"}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs font-semibold text-gray-900 truncate">{user.name || user.email}</p>
          <p className="text-[10px] text-gray-400 truncate">{getNavbarRoleLabel(role, user.account_type)}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 w-full transition-all"
        >
          <span className="text-gray-400"><SignOutIcon /></span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
