// ─── Family ministry member role tag → ministry slug ──────────────────────────
// Assigned by admin to indicate which family ministry an account belongs to.
// A user can only belong to one family ministry at a time.
export const FAMILY_MINISTRY_MEMBERS: Record<string, string> = {
  YOUTH_MEMBER: "youth",
  SINGLES_MEMBER: "singles",
  COUPLES_MEMBER: "couples",
  GRANDLANE_MEMBER: "grandlane",
  ARMOURS_MEMBER: "armours_of_god",
  AWESOME_KIDS_MEMBER: "awesome_kids",
};

// ─── Family ministry head role tag → ministry slug ────────────────────────────
export const FAMILY_MINISTRY_HEADS: Record<string, string> = {
  YOUTH_HEAD: "youth",
  SINGLES_HEAD: "singles",
  COUPLES_HEAD: "couples",
  GRANDLANE_HEAD: "grandlane",
  ARMOURS_HEAD: "armours_of_god",
  AWESOME_KIDS_HEAD: "awesome_kids",
};

// ─── Service ministry head role tag → ministry slug ───────────────────────────
export const SERVICE_MINISTRY_HEADS: Record<string, string> = {
  WORSHIP_HEAD: "worship",
  DANCE_HEAD: "dance",
  AWESOME_KIDS_SERVICE_HEAD: "awesome_kids_service",
  LITURGICAL_HEAD: "liturgical",
  PRODUCTION_HEAD: "production",
  CREATIVES_HEAD: "creatives",
  SECURITY_HEAD: "security_logistics",
  FOOD_HEAD: "food",
  INTERCESSORY_HEAD: "intercessory",
  PASTORAL_CARE_HEAD: "pastoral_care",
  ENGAGERS_HEAD: "engagers",
};

// ─── Service servant role tag → ministry slug (added on servant approval) ─────
export const SERVICE_SERVANT_ROLES: Record<string, string> = {
  WORSHIP_SERVANT: "worship",
  DANCE_SERVANT: "dance",
  AWESOME_KIDS_SERVICE_SERVANT: "awesome_kids_service",
  LITURGICAL_SERVANT: "liturgical",
  PRODUCTION_SERVANT: "production",
  CREATIVES_SERVANT: "creatives",
  SECURITY_SERVANT: "security_logistics",
  FOOD_SERVANT: "food",
  INTERCESSORY_SERVANT: "intercessory",
  PASTORAL_CARE_SERVANT: "pastoral_care",
  ENGAGERS_SERVANT: "engagers",
};

// ─── Ministry slug → servant role tag (for approval flow) ────────────────────
export const MINISTRY_TO_SERVANT_ROLE: Record<string, string> = Object.fromEntries(
  Object.entries(SERVICE_SERVANT_ROLES).map(([tag, slug]) => [slug, tag])
);

// ─── Human-readable labels ────────────────────────────────────────────────────
export const ROLE_DISPLAY_LABELS: Record<string, string> = {
  ATTENDEE: "Attendee",
  MEMBER: "Attendee", // backward compat
  // Family ministry members
  YOUTH_MEMBER: "Youth Ministry",
  SINGLES_MEMBER: "Singles Ministry",
  COUPLES_MEMBER: "Couples Ministry",
  GRANDLANE_MEMBER: "Grandlane Ministry",
  ARMOURS_MEMBER: "Armours of God",
  AWESOME_KIDS_MEMBER: "Awesome Kids Ministry",
  CONNECT_HEAD: "Connect Servant",
  FINANCE_MINISTRY: "Finance Ministry",
  FEAST_TECH: "Feast Tech",
  FEAST_BUILDER: "Feast Builder",
  SUPER_ADMIN: "Super Admin",
  // Family heads
  YOUTH_HEAD: "Youth Ministry Head",
  SINGLES_HEAD: "Singles Ministry Head",
  COUPLES_HEAD: "Couples Ministry Head",
  GRANDLANE_HEAD: "Grandlane Ministry Head",
  ARMOURS_HEAD: "Armours of God Head",
  AWESOME_KIDS_HEAD: "Awesome Kids Ministry Head",
  // Service heads
  WORSHIP_HEAD: "Worship Ministry Head",
  DANCE_HEAD: "Dance Ministry Head",
  AWESOME_KIDS_SERVICE_HEAD: "Awesome Kids Service Head",
  LITURGICAL_HEAD: "Liturgical Ministry Head",
  PRODUCTION_HEAD: "Production Ministry Head",
  CREATIVES_HEAD: "Creatives Ministry Head",
  SECURITY_HEAD: "Security & Logistics Head",
  FOOD_HEAD: "Food Ministry Head",
  INTERCESSORY_HEAD: "Intercessory Ministry Head",
  PASTORAL_CARE_HEAD: "Pastoral Care Ministry Head",
  ENGAGERS_HEAD: "Engagers Ministry Head",
  // Service servants
  WORSHIP_SERVANT: "Worship Ministry",
  DANCE_SERVANT: "Dance Ministry",
  AWESOME_KIDS_SERVICE_SERVANT: "Awesome Kids Service Ministry",
  LITURGICAL_SERVANT: "Liturgical Ministry",
  PRODUCTION_SERVANT: "Production Ministry",
  CREATIVES_SERVANT: "Creatives Ministry",
  SECURITY_SERVANT: "Security & Logistics Ministry",
  FOOD_SERVANT: "Food Ministry",
  INTERCESSORY_SERVANT: "Intercessory Ministry",
  PASTORAL_CARE_SERVANT: "Pastoral Care Ministry",
  ENGAGERS_SERVANT: "Engagers Ministry",
};

// ─── Parse helpers ────────────────────────────────────────────────────────────

/** Split comma-separated role string into individual tag array. */
export function getRoleTags(role: string): string[] {
  if (!role) return [];
  return role.split(",").map((r) => r.trim()).filter(Boolean);
}

export function hasRoleTag(role: string, tag: string): boolean {
  return getRoleTags(role).includes(tag);
}

// ─── Access helpers ───────────────────────────────────────────────────────────

export function isSuper(role: string): boolean {
  const tags = getRoleTags(role);
  return tags.includes("SUPER_ADMIN") || tags.includes("FEAST_BUILDER");
}

export function isFamilyHead(role: string): boolean {
  return getRoleTags(role).some((t) => t in FAMILY_MINISTRY_HEADS);
}

export function isServiceHead(role: string): boolean {
  return getRoleTags(role).some((t) => t in SERVICE_MINISTRY_HEADS);
}

export function isFinanceMinistry(role: string): boolean {
  return hasRoleTag(role, "FINANCE_MINISTRY");
}

/** Connect Servant + all family heads + super */
export function isConnectHeadOrAbove(role: string): boolean {
  return hasRoleTag(role, "CONNECT_HEAD") || isFamilyHead(role) || isSuper(role);
}

/** ATTENDEE or legacy MEMBER role */
export function isAttendeeRole(role: string): boolean {
  return getRoleTags(role).some((t) => t === "ATTENDEE" || t === "MEMBER");
}

/** True for any role that belongs to a FEAST_ATTENDEE (non-first-timer) */
export function hasAttendeeFeatures(accountType: string): boolean {
  return accountType === "FEAST_ATTENDEE";
}

// ─── Ministry derivation (single — backward compat) ──────────────────────────

export function getFamilyMinistryFromRole(role: string): string | null {
  for (const tag of getRoleTags(role)) {
    if (tag in FAMILY_MINISTRY_HEADS) return FAMILY_MINISTRY_HEADS[tag];
  }
  return null;
}

export function getServiceMinistryFromRole(role: string): string | null {
  for (const tag of getRoleTags(role)) {
    if (tag in SERVICE_MINISTRY_HEADS) return SERVICE_MINISTRY_HEADS[tag];
  }
  return null;
}

// ─── Ministry derivation (plural — multi-head support) ───────────────────────

export function getFamilyMinistriesFromRole(role: string): string[] {
  return getRoleTags(role)
    .filter((t) => t in FAMILY_MINISTRY_HEADS)
    .map((t) => FAMILY_MINISTRY_HEADS[t]);
}

export function getServiceMinistriesFromRole(role: string): string[] {
  return getRoleTags(role)
    .filter((t) => t in SERVICE_MINISTRY_HEADS)
    .map((t) => SERVICE_MINISTRY_HEADS[t]);
}

// ─── Display label ────────────────────────────────────────────────────────────

/**
 * Returns the most meaningful single label for the navbar/sidebar.
 * Priority: First Timer → Super/Builder → Ministry Heads → Family Ministry → Attendee
 */
export function getNavbarRoleLabel(role: string, accountType: string): string {
  if (accountType === "FIRST_TIMER") return "First Timer";
  const tags = getRoleTags(role);
  if (tags.includes("SUPER_ADMIN")) return ROLE_DISPLAY_LABELS.SUPER_ADMIN;
  if (tags.includes("FEAST_BUILDER")) return ROLE_DISPLAY_LABELS.FEAST_BUILDER;
  for (const tag of tags) {
    if (tag in SERVICE_MINISTRY_HEADS) return ROLE_DISPLAY_LABELS[tag] ?? tag.replace(/_/g, " ");
  }
  for (const tag of tags) {
    if (tag in FAMILY_MINISTRY_HEADS) return ROLE_DISPLAY_LABELS[tag] ?? tag.replace(/_/g, " ");
  }
  for (const tag of tags) {
    if (tag in FAMILY_MINISTRY_MEMBERS) return ROLE_DISPLAY_LABELS[tag] ?? tag.replace(/_/g, " ");
  }
  return "Attendee";
}

/**
 * Format a birthday string (YYYY-MM-DD, ISO, or similar) into a short readable
 * date like "Jan 15, 1990". Treats the date as UTC to avoid off-by-one issues.
 */
export function formatBirthday(raw: string | undefined | null): string {
  if (!raw) return "-";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/** For single-tag roles returns the direct label.
 *  For multi-tag roles returns the label of the highest-priority tag. */
export function getRoleDisplayLabel(role: string): string {
  if (!role.includes(",")) {
    return ROLE_DISPLAY_LABELS[role] ?? role.replace(/_/g, " ");
  }
  const tags = getRoleTags(role);
  const priority = [
    "SUPER_ADMIN", "FEAST_BUILDER",
    "FINANCE_MINISTRY", "FEAST_TECH", "CONNECT_HEAD",
    ...Object.keys(SERVICE_MINISTRY_HEADS),
    ...Object.keys(FAMILY_MINISTRY_HEADS),
    ...Object.keys(SERVICE_SERVANT_ROLES),
    "ATTENDEE", "MEMBER",
  ];
  for (const p of priority) {
    if (tags.includes(p)) return ROLE_DISPLAY_LABELS[p] ?? p.replace(/_/g, " ");
  }
  return ROLE_DISPLAY_LABELS[tags[0]] ?? tags[0]?.replace(/_/g, " ") ?? "Member";
}
