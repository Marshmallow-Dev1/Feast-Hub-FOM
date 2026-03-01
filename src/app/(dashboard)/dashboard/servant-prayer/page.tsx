import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { isServiceHead, isFamilyHead, isSuper } from "@/lib/constants/roles";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "A Servant's Prayer" };

const PARAGRAPHS = [
  "Loving Father, You sent Your only Son in order to serve. You sent Jesus to give His life for me.",
  "Send Your Most Holy Spirit to awaken the spirit of service in me. May I not focus on position and benefit. Instead, teach me to put others before me.",
  "Make me meek and humble so that like Jesus, I may also offer my life willingly that I may be obedient, and that I may be faithful even if this is difficult to do.",
  "I pray this for the love and in the name of Jesus. Amen.",
];

export default async function ServantPrayerPage() {
  const session = await auth();
  if (!session) redirect("/");

  const { role, servant_status } = session.user;
  const hasAccess =
    servant_status === "ACTIVE_SERVANT" ||
    isServiceHead(role) ||
    isFamilyHead(role) ||
    isSuper(role);

  if (!hasAccess) redirect("/dashboard");

  return (
    <div className="max-w-lg mx-auto space-y-5 pb-20 md:pb-6">
      <div>
        <h1 className="text-xl font-black text-gray-900">A Servant's Prayer</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        {PARAGRAPHS.map((p, i) => (
          <p key={i} className={`text-sm text-gray-700 leading-relaxed ${i === PARAGRAPHS.length - 1 ? "font-semibold text-gray-900" : ""}`}>
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
