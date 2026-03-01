"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const DISMISSED_KEY = "pwa-install-dismissed-at";
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

type Mode = "android" | "ios" | null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let deferredPrompt: any = null;

export default function PwaInstallPrompt() {
  const [mode, setMode] = useState<Mode>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already installed (running as standalone PWA)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true);

    if (isStandalone) return;

    // Respect dismiss cooldown
    const dismissedAt = localStorage.getItem(DISMISSED_KEY);
    if (dismissedAt && Date.now() - Number(dismissedAt) < DISMISS_TTL_MS) return;

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);

    if (isIos) {
      // iOS doesn't fire beforeinstallprompt — show manual instructions after a short delay
      const t = setTimeout(() => {
        setMode("ios");
        setVisible(true);
      }, 2500);
      return () => clearTimeout(t);
    }

    // Chrome / Android / Edge — wait for the browser's install event
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      setMode("android");
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setVisible(false);
  }

  async function install() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (outcome === "accepted") {
      setVisible(false);
    } else {
      dismiss();
    }
  }

  if (!visible) return null;

  return (
    <>
      {/* Backdrop for mobile tap-away */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* Prompt card */}
      <div
        role="dialog"
        aria-label="Install FOM Hub"
        className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        {/* Red accent bar */}
        <div className="h-1 bg-[#ff474f]" />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <Image
              src="/FSC-Logo.jpg"
              alt="FSC"
              width={44}
              height={44}
              className="rounded-xl"
            />
            <div>
              <p className="font-black text-gray-900 text-sm leading-tight">FOM Hub</p>
              <p className="text-xs text-gray-500">The Feast OLOPSC Marikina</p>
            </div>
            <button
              onClick={dismiss}
              className="ml-auto text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {mode === "android" ? (
            <>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                Install FOM Hub on your device for quick access without opening a browser.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={dismiss}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Not now
                </button>
                <button
                  onClick={install}
                  className="flex-1 py-2.5 rounded-xl bg-[#ff474f] text-white text-sm font-bold hover:bg-[#e03e45] transition-colors"
                >
                  Install
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                Add FOM Hub to your Home Screen for quick access.
              </p>
              <ol className="text-sm text-gray-600 space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-[#ff474f] font-bold mt-0.5">1.</span>
                  <span>
                    Tap the{" "}
                    <span className="inline-flex items-center gap-1 font-medium text-gray-800">
                      Share
                      <svg className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </span>{" "}
                    button in Safari
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#ff474f] font-bold mt-0.5">2.</span>
                  <span>Select <span className="font-medium text-gray-800">Add to Home Screen</span></span>
                </li>
              </ol>
              <button
                onClick={dismiss}
                className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Got it
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
