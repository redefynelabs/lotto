import type { Metadata } from "next";
import "./globals.css";
import { coolvetica, foundersGrotesk } from "@/fonts";
import LayoutWrapper from "@/components/Navigation/LayoutWrapper";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: "32 Win — Play & Win the 2D Lotto Game",
  description:
    "Join 32 Win, the thrilling 2D lotto game where you pick numbers between 0 and 32, place your bids, and win real prizes. Simple, fun, and rewarding.",
  keywords: [
    "2D lotto",
    "lottery game",
    "lotto India",
    "online lottery",
    "number bidding",
    "lotto win",
    "32 Win game",
  ],
  authors: [{ name: "32 Win Team" }],
  metadataBase: new URL("https://32win.app"), // change this to your real domain later
  openGraph: {
    title: "32 Win — Play & Win the 2D Lotto Game",
    description:
      "Select numbers from 0 to 32 and place your bids for a chance to win prizes instantly.",
    url: "https://32win.app",
    siteName: "32 Win",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "/og-image.jpg", // add an image at /public/og-image.jpg
        width: 1200,
        height: 630,
        alt: "32 Win — 2D Lotto Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "32 Win — Play & Win the 2D Lotto Game",
    description:
      "A simple and exciting 2D lotto game where you pick numbers between 0 and 32 to win big.",
    creator: "@32win",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${foundersGrotesk.variable} ${coolvetica.variable} antialiased`}
      >
      <LayoutWrapper>{children}</LayoutWrapper>
      <ToastContainer position="top-center" autoClose={3000} />
      </body>
    </html>
  );
}
