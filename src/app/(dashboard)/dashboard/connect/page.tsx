import type { Metadata } from "next";

export const metadata: Metadata = { title: "Connect with us" };

// ─── Brand Icons ──────────────────────────────────────────────────────────────
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const FeastAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <text x="4" y="18" fontSize="16" fontWeight="bold" fontFamily="Arial, sans-serif">F</text>
  </svg>
);

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const SpotifyIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────
const FOM_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/FeastMarikinaOfficial",
    description: "facebook.com/FeastStaLucia",
    icon: <FacebookIcon />,
    bg: "bg-blue-600",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/thelightfam",
    description: "@feaststalucia",
    icon: <InstagramIcon />,
    bg: "bg-gradient-to-br from-pink-500 via-red-500 to-yellow-400",
  },
  {
    label: "Email us",
    href: "mailto:marshnandez.business@gmail.com",
    description: "marshnandez.business@gmail.com",
    icon: <MailIcon />,
    bg: "bg-gray-600",
  },
];

const FEAST_LINKS = [
  {
    label: "Feast App",
    href: "https://app.feast.ph/",
    description: "app.feast.ph",
    icon: <FeastAppIcon />,
    bg: "bg-[#ff474f]",
  },
  {
    label: "Official Website",
    href: "https://feast.ph/",
    description: "feast.ph",
    icon: <GlobeIcon />,
    bg: "bg-[#ff474f]",
  },
  {
    label: "Feast TV",
    href: "https://www.youtube.com/feasttvofficial",
    description: "Watch on YouTube",
    icon: <YouTubeIcon />,
    bg: "bg-red-600",
  },
  {
    label: "Feast Radio",
    href: "https://open.spotify.com/show/1tLAns793ScO56yaJrLslC?si=69be9b12644c4563",
    description: "Listen on Spotify",
    icon: <SpotifyIcon />,
    bg: "bg-green-500",
  },
  {
    label: "Feast Worship",
    href: "https://open.spotify.com/artist/36ODlPmkJ7PQJqhKC7ICIF?si=HPYOSK3jQeWS11omll4EfA",
    description: "Worship music on Spotify",
    icon: <SpotifyIcon />,
    bg: "bg-green-500",
  },
];

// ─── Card ─────────────────────────────────────────────────────────────────────
function LinkCard({ label, href, description, icon, bg }: { label: string; href: string; description: string; icon: React.ReactNode; bg: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5 hover:border-[#ff474f] transition-colors group"
    >
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0 text-white`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900">{label}</p>
        <p className="text-xs text-gray-400 truncate">{description}</p>
      </div>
      <svg className="w-4 h-4 text-gray-300 group-hover:text-[#ff474f] transition-colors flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    </a>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ConnectPage() {
  return (
    <div className="max-w-lg mx-auto space-y-6 pb-20 md:pb-6">
      <div>
        <h1 className="text-xl font-black text-gray-900">Connect with us</h1>
        <p className="text-sm text-gray-500 mt-1">Stay connected with The Feast OLOPSC Marikina.</p>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">FOM Social Media</p>
        {FOM_LINKS.map((link) => <LinkCard key={link.href} {...link} />)}
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Official Feast Links</p>
        {FEAST_LINKS.map((link) => <LinkCard key={link.href} {...link} />)}
      </div>
    </div>
  );
}
