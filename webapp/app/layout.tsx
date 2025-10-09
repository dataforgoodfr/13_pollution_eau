import type { Metadata, Viewport } from "next";
import "./globals.css";
import Script from "next/script";

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
      <body>
        {/* Hard fix to prevent iframe scrolling: When the PollutionMapSearchBox Popover appears, it causes unwanted scrolling in the parent window containing the iframe. Despite attempts to find a more elegant solution, this override is the only reliable way to prevent this behavior when the app is embedded in an iframe. */}
        <Script id="prevent-iframe-scroll" strategy="beforeInteractive">
          {`
            if (window.self !== window.top) {
              // We're in an iframe
              const originalScrollTo = window.scrollTo;
              const originalScrollBy = window.scrollBy;
              const originalScroll = window.scroll;

              // Override scroll functions to do nothing
              window.scrollTo = function() {};
              window.scrollBy = function() {};
              window.scroll = function() {};

              // Prevent Element.scrollIntoView
              if (Element.prototype.scrollIntoView) {
                Element.prototype.scrollIntoView = function() {};
              }
            }
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
