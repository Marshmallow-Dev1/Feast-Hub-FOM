import type { Metadata, Viewport } from "next";
import "./globals.css";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import Providers from "@/components/Providers";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://fom-connect-hub.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "The Feast OLOPSC Marikina",
    template: "%s | The Feast FOM",
  },
  description:
    "Join The Feast every Sunday at DS Hall, OLOPSC, Concepcion, Marikina City. Register as a first-time attendee, join a Light Group, serve in a ministry, or give your tithes and offerings.",
  keywords: ["The Feast", "OLOPSC Marikina", "Catholic", "charismatic", "community", "FOM", "Bo Sanchez", "Cainta", "Rizal"],
  authors: [{ name: "The Feast OLOPSC Marikina" }],
  applicationName: "The Feast FOM",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "The Feast FOM",
  },
  openGraph: {
    title: "The Feast OLOPSC Marikina",
    description:
      "Join The Feast every Sunday at DS Hall, OLOPSC, Concepcion, Marikina City. Everyone is welcome.",
    type: "website",
    url: BASE_URL,
    siteName: "The Feast OLOPSC Marikina",
    locale: "en_PH",
    images: [
      {
        url: "/FSC-Logo.jpg",
        width: 512,
        height: 512,
        alt: "The Feast OLOPSC Marikina",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "The Feast OLOPSC Marikina",
    description:
      "Join The Feast every Sunday at DS Hall, OLOPSC, Concepcion, Marikina City.",
    images: ["/FSC-Logo.jpg"],
  },
  icons: {
    icon: "/FSC-Logo.jpg",
    apple: "/FSC-Logo.jpg",
    shortcut: "/FSC-Logo.jpg",
  },
};

export const viewport: Viewport = {
  themeColor: "#ff474f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="The Feast FOM" />
      </head>
      <body>
        <Providers>
          {children}
          <PwaInstallPrompt />
        </Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){var _swRefreshing=false;window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').then(function(reg){reg.addEventListener('updatefound',function(){var nw=reg.installing;nw.addEventListener('statechange',function(){if(nw.state==='activated'&&!_swRefreshing){_swRefreshing=true;window.location.reload()}})});}).catch(function(e){console.log('SW failed:',e)});navigator.serviceWorker.addEventListener('controllerchange',function(){if(!_swRefreshing){_swRefreshing=true;window.location.reload()}})})}`
          }}
        />
      </body>
    </html>
  );
}
