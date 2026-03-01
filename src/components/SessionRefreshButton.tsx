"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function SessionRefreshButton() {
  const { update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Auto-check on mount — if the admin has already approved, this will
  // update the JWT and router.refresh() causes the server to redirect to /dashboard.
  useEffect(() => {
    update().then(() => {
      router.refresh();
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleRefresh() {
    setLoading(true);
    await update();
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={loading}
      className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
    >
      {loading ? "Checking status..." : "Check approval status"}
    </button>
  );
}
