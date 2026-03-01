import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { callAppsScript, type ServantApplication, type SheetUser } from "@/lib/sheets/client";
import BecomeServantForm from "@/components/dashboard/BecomeServantForm";

export default async function BecomeServantPage() {
  const session = await auth();
  if (!session) redirect("/");

  // Resolve stale JWT — fetch fresh status from DB if JWT shows non-ACTIVE_MEMBER
  let accountStatus = session.user.account_status;
  if (accountStatus !== "ACTIVE_MEMBER" && session.user.email) {
    const fresh = await callAppsScript<SheetUser>("getUserByEmail", { email: session.user.email });
    if (fresh.success && fresh.data) accountStatus = fresh.data.account_status;
  }
  if (accountStatus !== "ACTIVE_MEMBER") redirect("/dashboard");

  // Fetch user's existing servant applications for per-ministry status checks
  const appsRes = await callAppsScript<ServantApplication[]>("getUserServantApplications", {
    user_email: session.user.email,
  });
  const userApplications = (appsRes.success ? (appsRes.data ?? []) : []).map((a) => ({
    ministry: a.ministry,
    status: a.status,
  }));

  return (
    <div className="max-w-lg mx-auto space-y-5 pb-20 md:pb-6">
      <div>
        <h1 className="text-xl font-black text-gray-900">Become a Servant</h1>
        <p className="text-sm text-gray-500 mt-1">Join a service ministry and make a difference in The Feast community.</p>
      </div>

      {/* What to Expect */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">What to Expect</p>
        {[
          "Choose a service ministry you are interested in.",
          "Don't worry if you're not an expert yet. The existing servants are excited to teach, guide, and journey alongside you!",
          "For Worship Ministry, upload a short audition video (singing or playing an instrument). 2 worship songs (1 fast song and 1 slow song).",
          "The Service Ministry Head will review your application and get in touch with you.",
        ].map((step, i) => (
          <div key={i} className="flex gap-3 items-start">
            <span className="w-5 h-5 rounded-full bg-[#ff474f] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
            <p className="text-sm text-gray-600 leading-relaxed">{step}</p>
          </div>
        ))}
      </div>

      <BecomeServantForm
        userId={session.user.id}
        userEmail={session.user.email!}
        userName={session.user.name || ""}
        userApplications={userApplications}
      />
    </div>
  );
}
