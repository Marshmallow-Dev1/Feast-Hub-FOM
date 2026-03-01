"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { getNavbarRoleLabel } from "@/lib/constants/roles";

interface TopBarUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
  account_type?: string;
  account_status?: string;
}

export default function DashboardTopBar({ user }: { user: TopBarUser }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 px-4 md:px-6 h-14 flex items-center justify-between sticky top-0 z-30">
      {/* Mobile: logo links home */}
      <Link href="/dashboard" className="md:hidden flex items-center gap-2">
        <Image
          src="/FOM-Logo.jpg"
          alt="FOM"
          width={28}
          height={28}
          className="rounded-lg object-cover flex-shrink-0"
        />
        <div>
          <p className="text-xs font-black text-gray-900 leading-none">Feast Hub</p>
          {user.role && (
            <p className="text-[9px] text-[#ff474f] leading-none mt-0.5">{getNavbarRoleLabel(user.role, user.account_type || "")}</p>
          )}
        </div>
      </Link>

      {/* Desktop: title */}
      <div className="hidden md:block">
        <p className="text-sm font-semibold text-gray-700">Feast Hub</p>
      </div>

      {/* User menu */}
      <div className="flex items-center gap-3">
        <div className="hidden md:block text-right">
          <p className="text-xs font-semibold text-gray-900 leading-none">{user.name}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{getNavbarRoleLabel(user.role ?? "", user.account_type || "")}</p>
        </div>

        {/* Avatar + click dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff474f] rounded-full"
            aria-label="User menu"
          >
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || "User"}
                width={32}
                height={32}
                className="rounded-full border-2 border-gray-200 hover:border-[#ff474f] transition-colors"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#ff474f] flex items-center justify-center hover:bg-[#e03d44] transition-colors">
                <span className="text-white text-xs font-bold select-none">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            )}
          </button>

          {open && (
            <>
              {/* Click-away backdrop */}
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-gray-100 shadow-xl p-1 z-50">
                <div className="px-3 py-2.5 border-b border-gray-50 mb-1">
                  <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                </div>

                {user.account_status === "ACTIVE_MEMBER" && (
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-xl transition-colors font-medium"
                  >
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Profile
                  </Link>
                )}

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
