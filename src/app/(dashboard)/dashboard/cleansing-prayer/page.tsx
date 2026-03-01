import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cleansing Prayer" };

const PARAGRAPHS = [
  "Heavenly Father, in the Name of Jesus Christ, our Lord and Savior, by the power of the Holy Spirit, we pray that the cleansing power of the precious blood of Your Son come upon us right now.",
  "Purify us and wash us clean with the blood of Jesus, from the top of our heads down to the very soles of our feet. Let this blood penetrate the very marrow of our bones to cleanse us from any entanglement from whatever spirit we have come in contact with during the course of our intercession.",
  "Anoint us with the gifts of the Holy Spirit and refresh our body, soul, and spirit. And may the sign of Your Holy Cross drive away all evil spirits from us.",
  "In the Name of the Father and of the Son and of the Holy Spirit. Amen.",
];

export default async function CleansingPrayerPage() {
  const session = await auth();
  if (!session) redirect("/");
  if (session.user.account_type === "FIRST_TIMER") redirect("/dashboard");

  return (
    <div className="max-w-lg mx-auto space-y-5 pb-20 md:pb-6">
      <div>
        <h1 className="text-xl font-black text-gray-900">Cleansing Prayer</h1>
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
