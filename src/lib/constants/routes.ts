export const PUBLIC_ROUTES = {
  HOME: "/",
  FTA: "/fta",
  FTA_SUCCESS: "/fta/success",
  LG: "/lg",
  LG_SUCCESS: "/lg/success",
  SERVE: "/serve",
  SERVE_SUCCESS: "/serve/success",
  GIVE: "/give",
  GIVE_SUCCESS: "/give/success",
  ABOUT: "/about",
} as const;

export const AUTH_ROUTES = {
  LOGIN: "/login",
  SETUP: "/setup",
  ERROR: "/login?error=AccessDenied",
} as const;

export const DASHBOARD_ROUTES = {
  HOME: "/dashboard",
  FTA: "/dashboard/fta",
  MEMBERS: "/dashboard/members",
  LIGHT_GROUPS: "/dashboard/light-groups",
  LG_REQUESTS: "/dashboard/light-groups/requests",
  SERVANTS: "/dashboard/servants",
  FINANCE: "/dashboard/finance",
  ANNOUNCEMENTS: "/dashboard/announcements",
  QR_CODES: "/dashboard/qr-codes",
  SETTINGS: "/dashboard/settings",
  USERS: "/dashboard/settings/users",
} as const;
