import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpendWise — AI Spend Audit for Startups",
  description:
    "Find out in 2 minutes if you're overpaying for AI tools. Free audit of Cursor, GitHub Copilot, Claude, ChatGPT, and more.",
  openGraph: {
    title: "SpendWise — AI Spend Audit for Startups",
    description:
      "Find out in 2 minutes if you're overpaying for AI tools. Free audit of Cursor, GitHub Copilot, Claude, ChatGPT, and more.",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "SpendWise",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpendWise — AI Spend Audit for Startups",
    description:
      "Find out in 2 minutes if you're overpaying for AI tools. Free, instant, no login.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
