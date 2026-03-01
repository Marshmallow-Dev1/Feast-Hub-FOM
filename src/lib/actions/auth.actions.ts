"use server";

import bcrypt from "bcryptjs";
import { signIn, auth } from "@/lib/auth/auth";
import { callAppsScript, type SheetUser } from "@/lib/sheets/client";
import { AuthError } from "next-auth";

export interface ActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

export async function registerUser(formData: FormData): Promise<ActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const birthday = formData.get("birthday") as string;
  const contact = formData.get("contact") as string;
  const sex = formData.get("sex") as string;
  const howHeard = formData.get("how_heard") as string;
  const invitedBy = formData.get("invited_by") as string;
  const accountType = (formData.get("account_type") as string) || "FIRST_TIMER";
  const familyMinistry = formData.get("family_ministry") as string;
  const serviceMinistries = formData.get("service_ministries") as string;
  const lgName = formData.get("lg_name") as string;
  const discipleshipStatus = formData.get("discipleship_status") as string;

  if (!email || !password || !fullName) {
    return { success: false, error: "Name, email, and password are required." };
  }
  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const isFeastAttendee = accountType === "FEAST_ATTENDEE";

  const res = await callAppsScript("createUser", {
    email,
    password_hash: passwordHash,
    full_name: fullName,
    birthday: birthday || "",
    contact: contact || "",
    sex: sex || "",
    how_heard: howHeard || "",
    invited_by: invitedBy || "",
    auth_provider: "credentials",
    role: "MEMBER",
    account_type: isFeastAttendee ? "FEAST_ATTENDEE" : "FIRST_TIMER",
    account_status: isFeastAttendee ? "ACTIVE_MEMBER" : "FTD_NOT_ATTENDED",
    servant_status: "NONE",
    family_ministry: familyMinistry || "",
    service_ministries: serviceMinistries || "",
    lg_name: lgName || "",
    discipleship_status: discipleshipStatus || "",
  });

  if (!res.success) {
    if (res.error === "User already exists") {
      return { success: false, error: "An account with this email already exists. Please log in." };
    }
    return { success: false, error: res.error || "Registration failed. Please try again." };
  }

  return { success: true, message: "Account created successfully." };
}

export async function completeGoogleProfile(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user.email) {
    return { success: false, error: "Not authenticated." };
  }
  if (session.user.account_status !== "PENDING_SETUP") {
    return { success: false, error: "Profile already complete." };
  }

  const accountType = (formData.get("account_type") as string) || "FIRST_TIMER";
  const isFeastAttendee = accountType === "FEAST_ATTENDEE";

  const profileData = {
    email: session.user.email,
    birthday: (formData.get("birthday") as string) || "",
    contact: (formData.get("contact") as string) || "",
    sex: (formData.get("sex") as string) || "",
    how_heard: (formData.get("how_heard") as string) || "",
    invited_by: (formData.get("invited_by") as string) || "",
    account_type: isFeastAttendee ? "FEAST_ATTENDEE" : "FIRST_TIMER",
    account_status: isFeastAttendee ? "ACTIVE_MEMBER" : "FTD_NOT_ATTENDED",
    family_ministry: isFeastAttendee ? ((formData.get("family_ministry") as string) || "") : "",
    service_ministries: isFeastAttendee ? ((formData.get("service_ministries") as string) || "") : "",
    lg_name: isFeastAttendee ? ((formData.get("lg_name") as string) || "") : "",
    discipleship_status: isFeastAttendee ? ((formData.get("discipleship_status") as string) || "") : "",
  };

  let res = await callAppsScript("updateUser", profileData);

  // If the user was never written to the sheet (Apps Script was unreachable during sign-in),
  // create them now with their full profile data.
  if (!res.success && res.error === "User not found") {
    res = await callAppsScript("createUser", {
      ...profileData,
      full_name: session.user.name || "",
      auth_provider: "google",
      role: "MEMBER",
      servant_status: "NONE",
    });
  }

  if (!res.success) {
    return { success: false, error: res.error || "Failed to save profile. Please try again." };
  }

  return { success: true, message: "Profile complete!" };
}

// Maps family_ministry column values to the corresponding role tag
const FAMILY_MINISTRY_TO_TAG: Record<string, string> = {
  youth: "YOUTH_MEMBER",
  singles: "SINGLES_MEMBER",
  couples: "COUPLES_MEMBER",
  grandlane: "GRANDLANE_MEMBER",
  armours_of_god: "ARMOURS_MEMBER",
  awesome_kids: "AWESOME_KIDS_MEMBER",
};
const FAMILY_MEMBER_TAGS = Object.values(FAMILY_MINISTRY_TO_TAG);

export async function updateUserProfile(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user.email) return { success: false, error: "Not authenticated." };

  const current = await callAppsScript<SheetUser>("getUserByEmail", { email: session.user.email });
  if (!current.success || !current.data) return { success: false, error: "Failed to load profile." };

  const familyMinistry = (formData.get("family_ministry") as string) || "";

  // Keep all non-family-member role tags; replace the family member tag to match the chosen ministry
  const existingTags = (current.data.role || "ATTENDEE").split(",").filter(Boolean);
  const filteredTags = existingTags.filter((t) => !FAMILY_MEMBER_TAGS.includes(t));
  if (familyMinistry && FAMILY_MINISTRY_TO_TAG[familyMinistry]) {
    filteredTags.push(FAMILY_MINISTRY_TO_TAG[familyMinistry]);
  }

  const res = await callAppsScript("updateUser", {
    email: session.user.email,
    birthday: (formData.get("birthday") as string) || "",
    family_ministry: familyMinistry,
    service_ministries: (formData.get("service_ministries") as string) || "",
    lg_name: (formData.get("lg_name") as string) || "",
    discipleship_status: (formData.get("discipleship_status") as string) || "",
    role: filteredTags.join(",") || "ATTENDEE",
  });

  if (!res.success) return { success: false, error: res.error || "Update failed." };
  return { success: true, message: "Profile updated." };
}

export async function loginUser(formData: FormData): Promise<ActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  try {
    await signIn("credentials", { email, password, redirect: false });
    return { success: true };
  } catch (err) {
    if (err instanceof AuthError) {
      return { success: false, error: "Invalid email or password." };
    }
    return { success: false, error: "Login failed. Please try again." };
  }
}
