"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

interface QrCodeItem {
  id: string;
  path: string;
  label: string;
  description: string;
  icon: string;
  color: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://fom-connect-hub.vercel.app";

function QrCard({ item }: { item: QrCodeItem }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const url = `${BASE_URL}${item.path}`;

  const downloadPng = () => {
    // Find the canvas inside the component
    const canvas = document.querySelector(`#qr-canvas-${item.id}`) as HTMLCanvasElement;
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = `fsc-qr-${item.id}.png`;
    link.click();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center gap-4">
      <div className="flex items-center gap-2.5 w-full">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: item.color }}
        >
          <span className="text-lg">{item.icon}</span>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">{item.label}</p>
          <p className="text-xs text-gray-400">{item.description}</p>
        </div>
      </div>

      {/* QR Code */}
      <div className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
        <QRCodeCanvas
          id={`qr-canvas-${item.id}`}
          value={url}
          size={200}
          level="H"
          includeMargin={false}
          fgColor={item.color}
          bgColor="#ffffff"
        />
      </div>

      <div className="w-full text-center">
        <p className="text-[10px] text-gray-400 break-all font-mono">{url}</p>
      </div>

      <button
        onClick={downloadPng}
        className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-800 transition-colors active:scale-[0.98]"
      >
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        Download PNG
      </button>
    </div>
  );
}

export default function QrCodesClient({ qrCodes }: { qrCodes: QrCodeItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {qrCodes.map((item) => (
        <QrCard key={item.id} item={item} />
      ))}
    </div>
  );
}
