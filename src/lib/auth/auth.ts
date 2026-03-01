import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { callAppsScript, type SheetUser } from "@/lib/sheets/client";

class GoogleAccountError extends CredentialsSignin {
  code = "use_google";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: { prompt: "select_account" },
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const res = await callAppsScript<SheetUser>("getUserByEmail", {
          email: credentials.email as string,
        });
        if (!res.success || !res.data) return null;
        const user = res.data;
        if (user.auth_provider !== "credentials") {
          // Signal to the client that this account uses Google Sign-In
          throw new GoogleAccountError();
        }
        const valid = await bcrypt.compare(credentials.password as string, user.password_hash);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.full_name,
          role: user.role,
          account_type: user.account_type,
          account_status: user.account_status,
          servant_status: user.servant_status,
        };
      },
    }),
  ],
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Google OAuth: fetch or create user, then attach data to the user object
      // so the jwt callback can read it without a second Apps Script call.
      if (account?.provider === "google" && user.email) {
        try {
          const existing = await callAppsScript<SheetUser>("getUserByEmail", { email: user.email });
          if (existing.success && existing.data) {
            // Existing user — attach their sheet data to the user object
            const u = existing.data;
            (user as any).id = u.id;
            (user as any).role = u.role;
            (user as any).account_type = u.account_type;
            (user as any).account_status = u.account_status;
            (user as any).servant_status = u.servant_status;
          } else {
            // New Google user — create placeholder account; user must complete profile
            const isSuperAdmin = user.email === process.env.SUPER_ADMIN_EMAIL;
            const created = await callAppsScript<{ id: string }>("createUser", {
              email: user.email,
              full_name: user.name || "",
              auth_provider: "google",
              role: isSuperAdmin ? "SUPER_ADMIN" : "MEMBER",
              account_type: "FEAST_ATTENDEE",
              account_status: isSuperAdmin ? "ACTIVE_MEMBER" : "PENDING_SETUP",
              servant_status: "NONE",
            });
            (user as any).role = isSuperAdmin ? "SUPER_ADMIN" : "MEMBER";
            (user as any).account_type = "FEAST_ATTENDEE";
            (user as any).account_status = isSuperAdmin ? "ACTIVE_MEMBER" : "PENDING_SETUP";
            (user as any).servant_status = "NONE";
            if (created.data?.id) (user as any).id = created.data.id;
          }
        } catch (err) {
          // Don't block sign-in if Apps Script is unreachable — user still gets in
          console.error("[auth] signIn callback error:", err);
          (user as any).role = "MEMBER";
          (user as any).account_type = "FEAST_ATTENDEE";
          (user as any).account_status = "PENDING_SETUP";
          (user as any).servant_status = "NONE";
        }
      }
      return true;
    },

    async jwt({ token, user, trigger }) {
      // On initial sign-in, attach fields from the user object.
      // For Google users this includes data fetched in the signIn callback above
      // (no second Apps Script call needed).
      if (user) {
        token.id = (user as any).id || token.sub;
        token.role = (user as any).role;
        token.account_type = (user as any).account_type;
        token.account_status = (user as any).account_status;
        token.servant_status = (user as any).servant_status;
      }

      // On update trigger (session refresh), re-fetch user data from the sheet
      if (trigger === "update" && token.email) {
        const res = await callAppsScript<SheetUser>("getUserByEmail", { email: token.email as string });
        if (res.success && res.data) {
          token.role = res.data.role;
          token.account_type = res.data.account_type;
          token.account_status = res.data.account_status;
          token.servant_status = res.data.servant_status;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.account_type = token.account_type as string;
        session.user.account_status = token.account_status as string;
        session.user.servant_status = token.servant_status as string;
      }
      return session;
    },
  },
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      account_type: string;
      account_status: string;
      servant_status: string;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    account_type?: string;
    account_status?: string;
    servant_status?: string;
  }
}
