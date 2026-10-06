import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/app-provider";
import { ToastProvider } from "@/components/toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "opsz"],
});

export const metadata: Metadata = {
  title: {
    default: "CharityContent: a month of charity content in minutes",
    template: "%s · CharityContent",
  },
  description:
    "CharityContent helps small UK charities create social posts, campaign ideas and email content with AI, then plan it all in one simple calendar.",
};

export const viewport: Viewport = {
  themeColor: "#faf7f2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        <ToastProvider>
          <AppProvider>{children}</AppProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
