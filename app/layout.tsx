import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Viewport configuration separated from metadata
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fafafa",
};

export const metadata: Metadata = {
  title: "Smart Bookmark Manager | Organize Your Web",
  description:
    "A real-time, secure bookmark manager to organize your links seamlessly with auto-scraped titles and Google Auth.",
  keywords: [
    "Next.js",
    "Supabase",
    "Bookmark Manager",
    "Real-time App",
    "Tailwind CSS",
  ],
  authors: [{ name: "Vignesh" }], //
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#fafafa] text-slate-900`}
      >
        {children}

        {/* Global Toast Notifications */}
        <Toaster
          position="top-center"
          richColors
          expand={false}
          closeButton
          toastOptions={{
            classNames: {
              closeButton: "!top-1/2 !right-4 !left-auto size-4",
            },
          }}
        />
      </body>
    </html>
  );
}
