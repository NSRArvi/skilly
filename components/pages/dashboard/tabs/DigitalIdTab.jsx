"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import {
  QrCode,
  Download,
  Copy,
  Check,
  Palette,
  Layout,
  Eye,
  BadgeCheck,
  Phone,
  MapPin,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { generateQrDataUrl } from "@/lib/qr";

// Pre-built color themes / gradients
const COLOR_THEMES = [
  {
    id: "emerald",
    name: "Emerald Modern",
    bgClass: "bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900",
    textClass: "text-white",
    accentColor: "#10b981",
    badgeBg: "bg-emerald-400/20 text-emerald-200 border-emerald-400/30",
    qrBg: "bg-white/95",
    qrFill: "#064e3b",
  },
  {
    id: "midnight",
    name: "Dark Executive",
    bgClass: "bg-gradient-to-br from-slate-900 via-slate-800 to-black",
    textClass: "text-white",
    accentColor: "#38bdf8",
    badgeBg: "bg-sky-400/20 text-sky-200 border-sky-400/30",
    qrBg: "bg-white",
    qrFill: "#0f172a",
  },
  {
    id: "indigo",
    name: "Indigo Violet",
    bgClass: "bg-gradient-to-br from-indigo-700 via-purple-700 to-slate-900",
    textClass: "text-white",
    accentColor: "#a855f7",
    badgeBg: "bg-purple-400/20 text-purple-200 border-purple-400/30",
    qrBg: "bg-white/95",
    qrFill: "#3b0764",
  },
  {
    id: "sunset",
    name: "Sunset Ember",
    bgClass: "bg-gradient-to-br from-rose-600 via-amber-600 to-slate-900",
    textClass: "text-white",
    accentColor: "#fbbf24",
    badgeBg: "bg-amber-400/20 text-amber-200 border-amber-400/30",
    qrBg: "bg-white/95",
    qrFill: "#881337",
  },
  {
    id: "light",
    name: "Clean Minimal",
    bgClass: "bg-gradient-to-br from-slate-50 via-white to-slate-100 border border-slate-200 shadow-xl",
    textClass: "text-slate-900",
    accentColor: "#059669",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    qrBg: "bg-slate-100",
    qrFill: "#0f172a",
  },
];

// Layout styles
const LAYOUT_TEMPLATES = [
  {
    id: "horizontal",
    name: "Standard Badge (Horizontal)",
    description: "Landscape ID card with side-by-side profile and QR Code",
  },
  {
    id: "vertical",
    name: "Pass / Lanyard (Vertical)",
    description: "Portrait style layout ideal for mobile passes & badges",
  },
  {
    id: "minimal",
    name: "Compact Minimalist",
    description: "Focused typography and high-density scan QR",
  },
];

export default function DigitalIdTab({ profile = {} }) {
  const [selectedTheme, setSelectedTheme] = useState(COLOR_THEMES[0].id);
  const [selectedLayout, setSelectedLayout] = useState(LAYOUT_TEMPLATES[0].id);
  const [showPhone, setShowPhone] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef(null);

  const theme = useMemo(
    () => COLOR_THEMES.find((t) => t.id === selectedTheme) || COLOR_THEMES[0],
    [selectedTheme]
  );

  // Determine public profile URL
  const publicId = profile.profileId || profile.id || "";
  const publicUrl = useMemo(() => {
    if (typeof window !== "undefined" && publicId) {
      return `${window.location.origin}/professionals/${publicId}`;
    }
    return `https://skilly.vercel.app/professionals/${publicId || "me"}`;
  }, [publicId]);

  // Formatted phone number with fixed BD prefix
  const formattedPhone = useMemo(() => {
    const rawNumber = profile.phoneNumber || "";
    if (!rawNumber) return null;
    const cleanNumber = rawNumber.replace(/\D/g, "");
    if (cleanNumber.startsWith("880")) {
      return `+${cleanNumber}`;
    }
    return `+880 ${cleanNumber}`;
  }, [profile.phoneNumber]);

  // Generate high-contrast, camera-scannable QR Data URL (ISO compliant)
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    let isMounted = true;
    if (!publicUrl) return;

    generateQrDataUrl(publicUrl, {
      size: 320,
      color: "#000000",
      bgColor: "#ffffff",
      margin: 2,
    }).then((url) => {
      if (isMounted) {
        setQrDataUrl(url);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [publicUrl]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Profile URL copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handlePrint = () => {
    if (!cardRef.current) {
      window.print();
      return;
    }

    const cardHtml = cardRef.current.outerHTML;
    // Extract existing styles and fonts
    const headHtml = document.head.innerHTML;

    // Create a hidden print iframe to exclusively print the card
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "none";
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            ${headHtml}
            <style>
              @page {
                size: auto;
                margin: 20mm;
              }
              body {
                margin: 0;
                padding: 0;
                background: transparent !important;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .digital-card-print {
                width: 100% !important;
                max-width: 480px !important;
                box-shadow: none !important;
                break-inside: avoid !important;
                page-break-inside: avoid !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            </style>
          </head>
          <body>
            <div class="digital-card-print">
              ${cardHtml}
            </div>
          </body>
        </html>
      `);
      frameDoc.close();

      setTimeout(() => {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1000);
      }, 350);
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border/70 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <QrCode className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-foreground">
              Smart Digital Professional ID
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            A verified digital card containing your public credentials and a direct QR code for clients to view your services.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="rounded-xl border-border/80 gap-2 text-xs font-semibold h-9"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? "Copied" : "Copy Profile Link"}
          </Button>

          <Button
            onClick={handlePrint}
            size="sm"
            className="rounded-xl gap-2 text-xs font-semibold h-9 shadow-sm"
          >
            <Download className="w-4 h-4" />
            Print / Save Card
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Card Preview */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-4">
          <div className="w-full flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-primary" /> Live Card Preview
            </span>
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
            >
              Open public profile <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Actual ID Card */}
          <div
            ref={cardRef}
            className={`w-full max-w-lg transition-all duration-300 relative overflow-hidden rounded-3xl p-6 md:p-8 ${theme.bgClass} ${theme.textClass} shadow-2xl print:shadow-none print:border-none`}
            style={{ minHeight: selectedLayout === "vertical" ? "480px" : "280px" }}
          >
            {/* Subtle background glow effect */}
            <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-56 h-56 rounded-full bg-white/5 blur-3xl pointer-events-none" />

            {/* Layout 1: Horizontal Badge */}
            {selectedLayout === "horizontal" && (
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 h-full">
                {/* Left side: Avatar + User Info */}
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="relative w-20 h-20 md:w-22 md:h-22 rounded-2xl overflow-hidden ring-4 ring-white/20 shadow-md bg-white/10 flex-shrink-0">
                      {profile.avatarUrl ? (
                        <Image
                          src={profile.avatarUrl}
                          alt={profile.name || "User Avatar"}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-2xl">
                          {profile.name?.charAt(0) || "U"}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-center md:justify-start gap-1.5">
                        <h3 className="text-xl font-extrabold tracking-tight">
                          {profile.name || "Professional"}
                        </h3>
                        {profile.status && (
                          <BadgeCheck className="w-5 h-5 text-amber-300 fill-amber-300/20" />
                        )}
                      </div>
                      <p className="text-sm font-medium opacity-90">
                        {profile.profession || "Skilled Specialist"}
                      </p>
                      <span
                        className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${theme.badgeBg}`}
                      >
                        Verified Member
                      </span>
                    </div>
                  </div>

                  {/* Metadata: Phone & Location */}
                  <div className="space-y-1.5 pt-2 border-t border-white/15 text-xs opacity-90 font-medium">
                    {showPhone && formattedPhone && (
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <Phone className="w-3.5 h-3.5 opacity-75" />
                        <span>{formattedPhone}</span>
                      </div>
                    )}
                    {showLocation && profile.location && (
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <MapPin className="w-3.5 h-3.5 opacity-75" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side: QR Code Box */}
                <div className="flex flex-col items-center justify-center flex-shrink-0">
                  <div className="p-2.5 rounded-2xl shadow-xl bg-white ring-2 ring-black/5 flex items-center justify-center">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="Profile QR Code"
                        width={128}
                        height={128}
                        className="w-32 h-32 block object-contain rounded-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 flex items-center justify-center bg-gray-50 text-gray-400 text-xs">
                        Generating QR...
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] uppercase font-bold tracking-wider mt-2 opacity-80 text-center">
                    Scan for Profile
                  </p>
                </div>
              </div>
            )}

            {/* Layout 2: Vertical Pass / Badge */}
            {selectedLayout === "vertical" && (
              <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                {/* Brand / Logo header */}
                <div className="w-full flex items-center justify-between pb-4 border-b border-white/15">
                  <span className="text-xs font-black tracking-widest uppercase opacity-80">
                    SKILLY PASS
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${theme.badgeBg}`}
                  >
                    MEMBER ID
                  </span>
                </div>

                {/* Avatar */}
                <div className="relative w-28 h-28 rounded-full overflow-hidden ring-4 ring-white/30 shadow-xl bg-white/10">
                  {profile.avatarUrl ? (
                    <Image
                      src={profile.avatarUrl}
                      alt={profile.name || "User"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-3xl">
                      {profile.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>

                {/* Name & Title */}
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5">
                    <h3 className="text-2xl font-black tracking-tight">
                      {profile.name || "Professional"}
                    </h3>
                    {profile.status && (
                      <BadgeCheck className="w-6 h-6 text-amber-300" />
                    )}
                  </div>
                  <p className="text-sm font-semibold opacity-90">
                    {profile.profession || "Skilled Specialist"}
                  </p>
                </div>

                {/* Phone & Location */}
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs opacity-90 font-medium">
                  {showPhone && formattedPhone && (
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{formattedPhone}</span>
                    </div>
                  )}
                  {showLocation && profile.location && (
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </div>

                {/* Big Center QR */}
                <div className="pt-2 flex flex-col items-center">
                  <div className="p-3 rounded-2xl shadow-xl bg-white ring-2 ring-black/5 flex items-center justify-center">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="Profile QR Code"
                        width={144}
                        height={144}
                        className="w-36 h-36 block object-contain rounded-lg"
                      />
                    ) : (
                      <div className="w-36 h-36 flex items-center justify-center bg-gray-50 text-gray-400 text-xs">
                        Generating QR...
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] font-bold tracking-widest uppercase mt-2.5 opacity-75">
                    Scan to Contact & Book
                  </p>
                </div>
              </div>
            )}

            {/* Layout 3: Minimal Compact */}
            {selectedLayout === "minimal" && (
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                <div className="p-2.5 rounded-2xl shadow-md bg-white ring-2 ring-black/5 flex-shrink-0 flex items-center justify-center">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Profile QR Code"
                      width={128}
                      height={128}
                      className="w-32 h-32 block object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 flex items-center justify-center bg-gray-50 text-gray-400 text-xs">
                      Generating QR...
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2 text-center md:text-left">
                  <span
                    className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${theme.badgeBg}`}
                  >
                    OFFICIAL ID
                  </span>
                  <h3 className="text-xl font-extrabold">{profile.name || "User"}</h3>
                  <p className="text-sm font-medium opacity-90">
                    {profile.profession || "Professional"}
                  </p>
                  {showPhone && formattedPhone && (
                    <p className="text-xs font-mono opacity-80 flex items-center justify-center md:justify-start gap-1.5 pt-1">
                      <Phone className="w-3 h-3" /> {formattedPhone}
                    </p>
                  )}
                  {showLocation && profile.location && (
                    <p className="text-xs opacity-80 flex items-center justify-center md:justify-start gap-1.5">
                      <MapPin className="w-3 h-3" /> {profile.location}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground text-center max-w-sm">
            Cards can be printed onto standard ID badge size or saved to mobile wallet. QR codes link directly to your public portfolio.
          </p>
        </div>

        {/* Right Column: Customization Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Layout Template */}
          <Card className="p-5 rounded-2xl border-border/70 space-y-3.5">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Layout className="w-4 h-4 text-primary" />
              <span>Choose Layout Template</span>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {LAYOUT_TEMPLATES.map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => setSelectedLayout(layout.id)}
                  className={`text-left p-3 rounded-xl border text-xs transition-all flex flex-col gap-1 ${
                    selectedLayout === layout.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20 text-foreground font-semibold"
                      : "border-border/70 bg-card hover:bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <span className="font-bold text-foreground">{layout.name}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {layout.description}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Color Palettes */}
          <Card className="p-5 rounded-2xl border-border/70 space-y-3.5">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Palette className="w-4 h-4 text-primary" />
              <span>Color & Theme Gradient</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {COLOR_THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTheme(t.id)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs transition-all ${
                    selectedTheme === t.id
                      ? "border-primary ring-2 ring-primary/30 font-bold bg-muted/60"
                      : "border-border/70 hover:bg-muted/40"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg ${t.bgClass} flex-shrink-0 shadow-sm`}
                  />
                  <span className="truncate">{t.name}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Visibility Controls */}
          <Card className="p-5 rounded-2xl border-border/70 space-y-3.5">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Card Elements Visibility</span>
            </div>
            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 rounded-lg border border-border/60 hover:bg-muted/30 cursor-pointer">
                <span className="text-foreground font-medium">Show Phone Number</span>
                <input
                  type="checkbox"
                  checked={showPhone}
                  onChange={(e) => setShowPhone(e.target.checked)}
                  className="rounded text-primary focus:ring-primary w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg border border-border/60 hover:bg-muted/30 cursor-pointer">
                <span className="text-foreground font-medium">Show Location</span>
                <input
                  type="checkbox"
                  checked={showLocation}
                  onChange={(e) => setShowLocation(e.target.checked)}
                  className="rounded text-primary focus:ring-primary w-4 h-4"
                />
              </label>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
