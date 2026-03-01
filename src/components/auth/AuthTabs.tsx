"use client";

import { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked: "This Google account is linked to a different sign-in method. Please use email/password instead.",
  OAuthCallbackError: "Google sign-in failed. Please try again.",
  OAuthSignInError: "Could not start Google sign-in. Please try again.",
  OAuthSignin: "Could not start Google sign-in. Please try again.",
  OAuthCreateAccountError: "Could not create account with Google. Please try again.",
  CallbackRouteError: "An error occurred during sign-in. Please try again.",
  Callback: "An error occurred during sign-in. Please try again.",
  Configuration: "Server configuration error. Please contact support.",
  AccessDenied: "Access was denied. Please contact support.",
};

export default function AuthTabs() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [oauthError, setOauthError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err) {
      setOauthError(OAUTH_ERROR_MESSAGES[err] ?? `Sign-in failed (${err}). Please try again.`);
      // Clean the URL so the error doesn't persist on refresh
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Tab switcher */}
      <div className="grid grid-cols-2 border-b border-gray-100">
        <button
          onClick={() => setTab("login")}
          className={`py-3.5 text-sm font-semibold transition-colors ${
            tab === "login"
              ? "text-[#ff474f] border-b-2 border-[#ff474f] bg-[#fff8f8]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setTab("register")}
          className={`py-3.5 text-sm font-semibold transition-colors ${
            tab === "register"
              ? "text-[#ff474f] border-b-2 border-[#ff474f] bg-[#fff8f8]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Create Account
        </button>
      </div>

      <div className="p-5">
        {oauthError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {oauthError}
          </div>
        )}
        {tab === "login" ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}
