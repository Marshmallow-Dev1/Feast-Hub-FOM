"use client";

import { useState } from "react";
import { callAppsScriptClient as callAppsScript, type TitheRecord } from "@/lib/sheets/client";

function offeringLabel(type: string) {
  const map: Record<string, string> = {
    tithe: "Tithe",
    love_offering: "Love Offering",
    special_offering: "Special Offering",
  };
  return map[type] ?? type;
}

function paymentLabel(method: string) {
  const map: Record<string, string> = {
    gcash: "GCash",
    bank_transfer: "Bank Transfer",
    instapay: "InstaPay",
    maya: "Maya",
    cash: "Cash",
  };
  return map[method] ?? method;
}

export default function FinanceTable({ records: initial, verifierEmail }: { records: TitheRecord[]; verifierEmail: string }) {
  const [records, setRecords] = useState(initial);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [error, setError] = useState("");

  const total = records.reduce((sum, r) => sum + parseFloat(r.amount || "0"), 0);
  const verifiedTotal = records
    .filter((r) => r.status === "VERIFIED")
    .reduce((sum, r) => sum + parseFloat(r.amount || "0"), 0);
  const pendingCount = records.filter((r) => !r.status || r.status === "PENDING").length;

  async function handleVerify(id: string) {
    setVerifying(id);
    setError("");
    const res = await callAppsScript("verifyTithe", { id, verified_by: verifierEmail });
    setVerifying(null);
    if (!res.success) {
      setError(res.error || "Verification failed.");
      return;
    }
    setRecords((prev) =>
      prev.map((r) => r.id === id ? { ...r, status: "VERIFIED", verified_by: verifierEmail } : r)
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Total Submitted</p>
          <p className="text-2xl font-black text-gray-900">
            {total.toLocaleString("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400 mt-1">{records.length} record{records.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Verified</p>
          <p className="text-2xl font-black text-green-700">
            {verifiedTotal.toLocaleString("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400 mt-1">{records.length - pendingCount} verified</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Pending Review</p>
          <p className="text-2xl font-black text-yellow-600">{pendingCount}</p>
          <p className="text-xs text-gray-400 mt-1">awaiting verification</p>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-sm text-gray-500">No records yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100">
                <tr className="text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Name</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Type</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Amount</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Method</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Ref #</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.map((r) => {
                  const isPending = !r.status || r.status === "PENDING";
                  const isVerifying = verifying === r.id;
                  return (
                    <tr key={r.id} className={`hover:bg-gray-50 transition-colors ${isVerifying ? "opacity-60" : ""}`}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-medium text-gray-900">{r.full_name}</p>
                        <p className="text-xs text-gray-400">{r.user_email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{offeringLabel(r.offering_type)}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                        {parseFloat(r.amount || "0").toLocaleString("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{paymentLabel(r.payment_method)}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs whitespace-nowrap">{r.reference_number || "N/A"}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {r.timestamp ? new Date(r.timestamp).toLocaleDateString("en-PH") : "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isPending ? (
                          <button
                            onClick={() => handleVerify(r.id)}
                            disabled={isVerifying}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 text-[10px] font-semibold hover:bg-yellow-100 transition-colors disabled:opacity-50"
                          >
                            {isVerifying ? "..." : "Verify"}
                          </button>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">
                            Verified
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
