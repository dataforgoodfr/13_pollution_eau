import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pollution de l'Eau Potable en France",
  description: "",
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: "/dfg.png",
    shortcut: "/dfg.png",
    apple: "/dfg.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
