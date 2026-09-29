import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";
import { AuthModalProvider } from "../components/providers/AuthModalProvider";
import { Toaster } from "sonner";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://skilly.com"
  ),
  title: {
    default: "Skilly | Hire & Connect with Top Professionals",
    template: "%s | Skilly",
  },
  description:
    "Create your professional profile, connect via in-app chat, and hire experts for your specific needs on demand.",
  keywords: [
    "hire professionals",
    "freelancers",
    "experts on demand",
    "professional network",
    "services",
  ],
  authors: [{ name: "Skilly" }],
  creator: "Skilly",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Skilly",
    title: "Skilly | Hire & Connect with Top Professionals",
    description:
      "Create your professional profile, connect via in-app chat, and hire experts for your specific needs on demand.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skilly | Hire & Connect with Top Professionals",
    description:
      "Create your professional profile, connect via in-app chat, and hire experts for your specific needs on demand.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className={`${jakartaSans.className} font-sans min-h-full flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthModalProvider>{children}</AuthModalProvider>
          <Toaster richColors position="top-center" closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
