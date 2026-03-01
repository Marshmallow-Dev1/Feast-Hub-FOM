import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import CompleteProfileForm from "@/components/auth/CompleteProfileForm";

export default async function CompleteProfilePage() {
  const session = await auth();
  if (!session) redirect("/");
  if (session.user.account_status !== "PENDING_SETUP") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-[#ff474f] text-white py-8 px-4 text-center">
        <div className="flex justify-center mb-3">
          <Image
            src="/FSC-Logo.jpg"
            alt="FSC Logo"
            width={72}
            height={72}
            className="rounded-full border-2 border-white/30 object-cover"
            priority
          />
        </div>
        <h1 className="text-xl font-black tracking-tight">Almost there!</h1>
        <p className="text-sm text-white/80 mt-1">Complete your profile to finish creating your account.</p>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-6">
        <div className="w-full max-w-md">
          <CompleteProfileForm
            name={session.user.name || ""}
            email={session.user.email || ""}
          />
        </div>
      </div>

      <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-200">
        &copy; 2026 The Feast OLOPSC Marikina. All rights reserved.
      </footer>
    </div>
  );
}
