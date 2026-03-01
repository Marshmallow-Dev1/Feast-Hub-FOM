"use server";

import { revalidatePath } from "next/cache";
import { callAppsScript } from "@/lib/sheets/client";

export async function updateSettings(data: {
  ftd_date: string;
  ftd_time: string;
  ftd_venue: string;
  ftd_description: string;
  feast_venue: string;
  feast_time: string;
}) {
  const res = await callAppsScript("updateSettings", data);
  if (res.success) {
    revalidatePath("/dashboard");
  }
  return { success: res.success, error: res.success ? undefined : (res.error || "Save failed.") };
}
