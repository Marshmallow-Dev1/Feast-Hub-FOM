import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { getCachedSettings, getCachedStats, callAppsScript, type SheetUser } from "@/lib/sheets/client";
import {
  isSuper,
  isFamilyHead,
  isConnectHeadOrAbove,
  isServiceHead,
  isFinanceMinistry,
  getFamilyMinistriesFromRole,
  getServiceMinistriesFromRole,
} from "@/lib/constants/roles";
import { FAMILY_MINISTRIES, SERVICE_MINISTRIES } from "@/lib/constants/ministries";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

// ─── Icons ────────────────────────────────────────────────────────────────────
const UserIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const HeartIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
const ServeIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
const ClockIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const CheckCircleIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const ClipboardIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>;
const FamilyIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>;
const UsersIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
const DollarIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
const BadgeIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>;
const QrIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const GearIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
const SendIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const CrossIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M10 3v7H3v4h7v7h4v-7h7v-4h-7V3z"/></svg>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const today = new Date().toLocaleDateString("en-PH", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Manila",
});

type AdminLink = { href: string; icon: React.ReactNode; label: string; desc: string; stat?: string };

function LinkCard({ href, icon, label, desc, stat }: AdminLink) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5 hover:border-[#ff474f] transition-colors group"
    >
      <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 text-[#ff474f]">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      {stat && (
        <span className="text-xs font-semibold text-[#ff474f] bg-red-50 px-2 py-0.5 rounded-full flex-shrink-0">
          {stat}
        </span>
      )}
      <svg
        className="w-4 h-4 text-gray-300 group-hover:text-[#ff474f] transition-colors flex-shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </Link>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default async function DashboardHomePage() {
  const session = await auth();
  if (!session) redirect("/");

  let { role, account_type, account_status, servant_status, name } = session.user;

  // JWT may still carry PENDING_SETUP after Google OAuth profile completion —
  // the layout already verified the profile is done, so fetch fresh data here.
  if (account_status === "PENDING_SETUP" && session.user.email) {
    const fresh = await callAppsScript<SheetUser>("getUserByEmail", { email: session.user.email });
    if (fresh.success && fresh.data && fresh.data.account_status !== "PENDING_SETUP") {
      account_type = fresh.data.account_type;
      account_status = fresh.data.account_status;
      role = fresh.data.role;
      servant_status = fresh.data.servant_status;
    }
  }

  const settings = await getCachedSettings();

  let stats: Record<string, number> = {};
  const isAnyAdmin =
    isConnectHeadOrAbove(role) || isServiceHead(role) || isFinanceMinistry(role) || isSuper(role);
  if (isAnyAdmin) {
    stats = ((await getCachedStats()) as Record<string, number>) ?? {};
  }

  const firstName = name?.split(" ")[0] || "Friend";

  // ─── FIRST TIMER — not attended / not approved ──────────────────────────
  if (
    account_type === "FIRST_TIMER" &&
    (account_status === "FTD_NOT_ATTENDED" || account_status === "FTD_NOT_APPROVED")
  ) {
    return (
      <div className="max-w-lg mx-auto space-y-5 pb-20 md:pb-6">
        <div className="bg-[#ff474f] rounded-2xl p-5 text-white">
          <p className="text-xs text-white/70 font-medium">{today}</p>
          <h1 className="text-xl font-black mt-1">Welcome, {firstName}!</h1>
          <p className="text-sm text-white/80 mt-1">Complete your First Timer's Day to unlock all features.</p>
        </div>

        {account_status === "FTD_NOT_APPROVED" && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex gap-3">
            <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-orange-800">Submission Not Approved</p>
              <p className="text-xs text-orange-600 mt-0.5">
                Your photo was not approved. Please re-upload a clear photo from your First Timer's Day.
              </p>
            </div>
          </div>
        )}

        {settings && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Next First Timer's Day</p>
            <div className="space-y-2">
              {settings.ftd_date && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-[#ff474f] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {new Date(settings.ftd_date).toLocaleDateString("en-PH", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
              {settings.ftd_time && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-[#ff474f] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{settings.ftd_time}</span>
                </div>
              )}
              {settings.ftd_venue && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-[#ff474f] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{settings.ftd_venue}</span>
                </div>
              )}
              {settings.ftd_description && (
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{settings.ftd_description}</p>
              )}
            </div>
          </div>
        )}

        <Link
          href="/dashboard/ftd"
          className="flex items-center justify-between bg-[#ff474f] text-white rounded-2xl p-5 shadow-sm hover:bg-[#e03d44] transition-colors"
        >
          <div>
            <p className="font-bold">Upload Attendance Photo</p>
            <p className="text-xs text-white/80 mt-0.5">Submit proof of your FTD attendance</p>
          </div>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    );
  }

  // ─── FIRST TIMER — pending approval ─────────────────────────────────────
  if (account_type === "FIRST_TIMER" && account_status === "FTD_PENDING_APPROVAL") {
    return (
      <div className="max-w-lg mx-auto space-y-5 pb-20 md:pb-6">
        <div className="bg-[#ff474f] rounded-2xl p-5 text-white">
          <p className="text-xs text-white/70 font-medium">{today}</p>
          <h1 className="text-xl font-black mt-1">You're almost there, {firstName}!</h1>
          <p className="text-sm text-white/80 mt-1">Your FTD attendance is under review.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center space-y-3">
          <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="font-bold text-gray-900">Submission Under Review</p>
          <p className="text-sm text-gray-500">
            Our team is reviewing your FTD attendance photo. You'll be notified once it's approved.
          </p>
        </div>
      </div>
    );
  }

  // ─── ACTIVE MEMBER (all roles) ──────────────────────────────────────────
  // Build admin links based on role
  const adminLinks: AdminLink[] = [];

  if (isConnectHeadOrAbove(role)) {
    adminLinks.push({
      href: "/dashboard/admin/ftd",
      icon: <ClipboardIcon />,
      label: "FTD Approvals",
      desc: "Review first-timer attendance photos",
      stat: stats.pendingFtd != null ? `${stats.pendingFtd} pending` : undefined,
    });
  }

  for (const fm of getFamilyMinistriesFromRole(role)) {
    const label = FAMILY_MINISTRIES.find((m) => m.value === fm)?.label ?? fm;
    adminLinks.push({
      href: `/dashboard/admin/family/${fm}`,
      icon: <FamilyIcon />,
      label,
      desc: "View your family ministry members",
    });
  }

  for (const sm of getServiceMinistriesFromRole(role)) {
    const label = SERVICE_MINISTRIES.find((m) => m.value === sm)?.label ?? sm;
    adminLinks.push({
      href: `/dashboard/admin/service/${sm}`,
      icon: <UsersIcon />,
      label,
      desc: "View your service ministry servants",
    });
  }

  if (isServiceHead(role) && !isSuper(role)) {
    adminLinks.push({
      href: "/dashboard/admin/servants",
      icon: <BadgeIcon />,
      label: "Servant Applications",
      desc: "Review ministry servant applications",
      stat: stats.pendingServants != null ? `${stats.pendingServants} pending` : undefined,
    });
  }

  if (isFinanceMinistry(role) || isSuper(role)) {
    adminLinks.push({
      href: "/dashboard/admin/finance",
      icon: <DollarIcon />,
      label: "Tithes Records",
      desc: "View all offering records",
      stat: stats.totalTithes != null ? `${stats.totalTithes} records` : undefined,
    });
  }

  if (isSuper(role)) {
    adminLinks.push(
      {
        href: "/dashboard/admin/servants",
        icon: <BadgeIcon />,
        label: "Servant Applications",
        desc: "Review ministry servant applications",
        stat: stats.pendingServants != null ? `${stats.pendingServants} pending` : undefined,
      },
      {
        href: "/dashboard/admin/users",
        icon: <UsersIcon />,
        label: "User Management",
        desc: "Manage roles and accounts",
        stat: stats.totalUsers != null ? `${stats.totalUsers} users` : undefined,
      },
      {
        href: "/dashboard/admin/qr-codes",
        icon: <QrIcon />,
        label: "QR Codes",
        desc: "Generate registration QR codes",
      },
      {
        href: "/dashboard/admin/settings",
        icon: <GearIcon />,
        label: "App Settings",
        desc: "FTD schedule, venue, and more",
      }
    );
  }

  const servantLink: AdminLink =
    servant_status === "NONE" || servant_status === "DENIED"
      ? { href: "/dashboard/become-servant", icon: <ServeIcon />, label: "Become a Servant", desc: "Join a service ministry" }
      : servant_status === "PENDING"
      ? { href: "/dashboard/become-servant", icon: <ClockIcon />, label: "Servant Application", desc: "Your application is under review" }
      : { href: "/dashboard/become-servant", icon: <CheckCircleIcon />, label: "Active Servant", desc: "You are serving in a ministry" };

  const memberLinks: AdminLink[] = [
    { href: "/dashboard/profile", icon: <UserIcon />, label: "My Profile", desc: "Update your ministry and LG info" },
    { href: "/dashboard/tithes", icon: <HeartIcon />, label: "Send Tithes & Offerings", desc: "Support The Feast through your generosity" },
    servantLink,
  ];

  return (
    <div className="max-w-lg mx-auto space-y-5 pb-20 md:pb-6">
      <div className="bg-[#ff474f] rounded-2xl p-5 text-white">
        <p className="text-xs text-white/70 font-medium">{today}</p>
        <h1 className="text-xl font-black mt-1">Welcome back, {firstName}!</h1>
        <p className="text-sm text-white/80 mt-1">The Feast OLOPSC Marikina</p>
      </div>

      {settings?.feast_venue && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-3 items-center">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-[#ff474f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-400">Feast Venue</p>
            <p className="text-sm font-semibold text-gray-900">{settings.feast_venue}</p>
            {settings.feast_time && <p className="text-xs text-gray-500">{settings.feast_time}</p>}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {memberLinks.map((item) => (
          <LinkCard key={item.href as string} {...item} />
        ))}
      </div>

      {adminLinks.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">Administration</p>
          <div className="flex flex-col gap-2">
            {adminLinks.map((item) => (
              <LinkCard key={item.href as string} {...item} />
            ))}
          </div>
        </div>
      )}

      {/* Prayers */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">Prayers</p>
        <div className="flex flex-col gap-2">
          <LinkCard href="/dashboard/pray" icon={<SendIcon />} label="Ask For Prayer" desc="Submit your prayer request to our Intercessory Ministry" />
          <LinkCard href="/dashboard/cleansing-prayer" icon={<CrossIcon />} label="Cleansing Prayer" desc="A prayer of protection and cleansing" />
          <LinkCard href="/dashboard/novena" icon={<CrossIcon />} label="Novena to God's Love" desc="Open yourself to God's love and blessings" />
          {(servant_status === "ACTIVE_SERVANT" || isServiceHead(role) || isFamilyHead(role) || isSuper(role)) && (
            <LinkCard href="/dashboard/servant-prayer" icon={<CrossIcon />} label="A Servant's Prayer" desc="A prayer for those who serve" />
          )}
        </div>
      </div>
    </div>
  );
}
