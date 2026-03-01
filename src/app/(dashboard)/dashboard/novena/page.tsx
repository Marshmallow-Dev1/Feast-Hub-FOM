import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Novena to God's Love" };

const LINES = [
  "Today, I receive all of Gods love for me.",
  "Today, I open myself to the unbounded, limitless, overflowing abundance of God's universe.",
  "Today, I open myself to God's blessings, healing and miracles.",
  "Today, I open myself to God's Word so that I become more like Jesus every day.",
  "Today I proclaim that I am God's Beloved, I am God's Servant, I am God's Powerful Champion,",
  "And because I am blessed, I am blessing the world In Jesus' Name!",
  "Amen!",
];

export default async function NovenaPage() {
  const session = await auth();
  if (!session) redirect("/");
  if (session.user.account_type === "FIRST_TIMER") redirect("/dashboard");

  return (
    <div className="max-w-lg mx-auto space-y-5 pb-20 md:pb-6">
      <div>
        <h1 className="text-xl font-black text-gray-900">Novena to God's Love</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
        {LINES.map((line, i) => (
          <p key={i} className={`text-sm leading-relaxed ${i === LINES.length - 1 ? "font-bold text-gray-900" : "text-gray-700"}`}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
