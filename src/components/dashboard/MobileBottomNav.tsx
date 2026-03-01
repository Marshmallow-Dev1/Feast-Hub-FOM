"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  isSuper, isConnectHeadOrAbove, isFinanceMinistry,
  getFamilyMinistriesFromRole, getServiceMinistriesFromRole, hasAttendeeFeatures,
} from "@/lib/constants/roles";
import { FAMILY_MINISTRIES, SERVICE_MINISTRIES } from "@/lib/constants/ministries";

interface User {
  role: string;
  account_type: string;
  account_status: string;
  servant_status: string;
}

interface NavItem { href: string; label: string; icon: React.ReactNode; }

const HomeIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
const CalIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const UserIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const HeartIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>;
const LgIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><circle cx="12" cy="8" r="5" /><path d="M3 21v-1a9 9 0 0118 0v1" /></svg>;
const LinkIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>;
const CheckIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
const BadgeIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>;
const DollarIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>;

function getNavItems(user: User): NavItem[] {
  const { role, account_type } = user;
  const isFirstTimer = account_type === "FIRST_TIMER";
  const isActive = hasAttendeeFeatures(account_type);

  const items: NavItem[] = [{ href: "/dashboard", label: "Home", icon: <HomeIcon /> }];

  if (isFirstTimer) {
    items.push({ href: "/dashboard/ftd", label: "FTD", icon: <CalIcon /> });
    return items.slice(0, 5);
  }

  if (isActive) {
    items.push(
      { href: "/dashboard/profile", label: "Profile", icon: <UserIcon /> },
      { href: "/dashboard/tithes", label: "Tithes", icon: <HeartIcon /> },
      { href: "/dashboard/lg", label: "Light Group", icon: <LgIcon /> },
      { href: "/dashboard/connect", label: "Connect", icon: <LinkIcon /> },
    );
  }

  if (isConnectHeadOrAbove(role)) {
    items.push({ href: "/dashboard/admin/ftd", label: "FTD", icon: <CheckIcon /> });
  }

  const familyMinistries = getFamilyMinistriesFromRole(role);
  for (const fm of familyMinistries) {
    const label = FAMILY_MINISTRIES.find((m) => m.value === fm)?.label?.split(" ")[0] ?? "Ministry";
    items.push({ href: `/dashboard/admin/family/${fm}`, label, icon: <BadgeIcon /> });
  }

  const serviceMinistries = getServiceMinistriesFromRole(role);
  for (const sm of serviceMinistries) {
    const label = SERVICE_MINISTRIES.find((m) => m.value === sm)?.label?.split(" ")[0] ?? "Ministry";
    items.push({ href: `/dashboard/admin/service/${sm}`, label, icon: <BadgeIcon /> });
  }

  if (isFinanceMinistry(role) || isSuper(role)) {
    items.push({ href: "/dashboard/admin/finance", label: "Finance", icon: <DollarIcon /> });
  }

  return items.slice(0, 5);
}

export default function MobileBottomNav({ user }: { user: User }) {
  const pathname = usePathname();
  const navItems = getNavItems(user);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 safe-area-pb">
      <div className="flex items-stretch h-16">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
                active ? "text-[#ff474f]" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className={active ? "text-[#ff474f]" : "text-gray-400"}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
