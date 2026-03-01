"use client";

import { useState, useEffect, useRef } from "react";
import Button from "@/components/ui/Button";

const APP_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://fom-feasthub.vercel.app";

const QR_LINKS = [
  { label: "First Timer Registration", url: `${APP_URL}/?tab=register&type=first_timer`, description: "For new attendees at The Feast" },
  { label: "Feast Attendee Registration", url: `${APP_URL}/?tab=register&type=feast_attendee`, description: "For existing community members" },
  { label: "General Login / Register", url: APP_URL, description: "Main app entry point" },
];

export default function QrCodesClient() {
  const [selected, setSelected] = useState(QR_LINKS[0]);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateQR(selected.url);
  }, [selected]);

  async function generateQR(url: string) {
    // Use a QR code API
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&color=ff474f&bgcolor=ffffff&margin=20`;
    setQrDataUrl(apiUrl);
  }

  function handleDownload() {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `fom-qr-${selected.label.toLowerCase().replace(/\s+/g, "-")}.png`;
    a.click();
  }

  return (
    <div className="space-y-4">
      {/* Link selector */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Select Link</p>
        {QR_LINKS.map((link) => (
          <label
            key={link.url}
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              selected.url === link.url ? "border-[#ff474f] bg-[#fff8f8]" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="qr_link"
              checked={selected.url === link.url}
              onChange={() => setSelected(link)}
              className="mt-0.5 accent-[#ff474f]"
            />
            <div>
              <p className={`text-sm font-medium ${selected.url === link.url ? "text-[#ff474f]" : "text-gray-800"}`}>{link.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{link.description}</p>
            </div>
          </label>
        ))}
      </div>

      {/* QR Code display */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{selected.label}</p>
        {qrDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 mx-auto rounded-xl" />
        )}
        <canvas ref={canvasRef} className="hidden" />
        <p className="text-xs text-gray-400 break-all">{selected.url}</p>
        <Button onClick={handleDownload} variant="outline" fullWidth>
          Download QR Code
        </Button>
      </div>
    </div>
  );
}
