import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import { callAppsScript, type SheetUser } from "@/lib/sheets/client";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/");

  if (session.user.account_status === "PENDING_SETUP") {
    // JWT might be stale — check DB directly before redirecting to setup
    const fresh = await callAppsScript<SheetUser>("getUserByEmail", { email: session.user.email! });
    if (!fresh.success || !fresh.data || fresh.data.account_status === "PENDING_SETUP") {
      redirect("/register/complete");
    }
    // DB is updated but JWT is stale — update the session fields so the rest of
    // the dashboard sees the correct values for this request
    session.user.account_status = fresh.data.account_status;
    session.user.account_type = fresh.data.account_type;
    session.user.role = fresh.data.role;
    session.user.servant_status = fresh.data.servant_status;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar — hidden on mobile, shown on md+ */}
      <DashboardSidebar user={session.user} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopBar user={session.user} />
        {/* pb-20 on mobile reserves space above the fixed bottom nav */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav user={session.user} />
    </div>
  );
}
