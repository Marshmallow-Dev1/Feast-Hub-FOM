import Image from "next/image";
import AuthTabs from "@/components/auth/AuthTabs";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero */}
      <div className="bg-[#ff474f] text-white py-8 px-4 text-center">
        <div className="flex justify-center mb-3">
          <Image
            src="/FOM-Logo.jpg"
            alt="FOM Logo"
            width={72}
            height={72}
            className="rounded-full border-2 border-white/30 object-cover"
            priority
          />
        </div>
        <h1 className="text-xl font-black tracking-tight">The Feast OLOPSC Marikina</h1>
        <p className="text-sm text-white/80 mt-1">Every 2nd & 4th Sunday 8:30 AM - DS Hall, OLOPSC</p>
      </div>

      {/* Auth Card */}
      <div className="flex-1 flex items-start justify-center px-4 py-6">
        <div className="w-full max-w-md">
          <AuthTabs />
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-200">
        &copy; 2026 The Feast OLOPSC Marikina. All rights reserved.
      </footer>
    </div>
  );
}
