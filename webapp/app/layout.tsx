import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pollution de l'Eau Potable en France",
  description: "",
  robots: {
    index: false,
    follow: false,
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
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
