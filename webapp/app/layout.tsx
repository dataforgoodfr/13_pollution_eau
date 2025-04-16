import type { Metadata } from "next";
// import "@fontsource/inter";
import { Inter, Spline_Sans, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pollution de l'Eau Potable en France",
  description: "",
  robots: {
    index: false,
    follow: false,
  },
};

// Initialize the font
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter", // CSS variable name
});

const spline_sans = Spline_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-spline-sans", // CSS variable name
});

const spline_sans_mono = Spline_Sans_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-spline-sans-mono", // CSS variable name
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spline_sans.variable} ${spline_sans_mono}`}
    >
      <body>{children}</body>
    </html>
  );
}
