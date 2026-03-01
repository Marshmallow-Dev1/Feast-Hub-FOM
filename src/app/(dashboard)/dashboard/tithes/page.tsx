import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import TithesForm from "@/components/dashboard/TithesForm";

export default async function TithesPage() {
  const session = await auth();
  if (!session) redirect("/");
  if (session.user.account_status !== "ACTIVE_MEMBER") redirect("/dashboard");

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-900">Send Tithes & Offerings</h1>
        <p className="text-sm text-gray-500 mt-1">Support The Feast through your generosity.</p>
      </div>
      <TithesForm userId={session.user.id} userEmail={session.user.email!} userName={session.user.name || ""} />
    </div>
  );
}
