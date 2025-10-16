"use client";

import { ExternalLink, InfoIcon } from "lucide-react";

export default function EmbedBanner() {
  return (
    <div
      className="text-white p-4 z-50 shadow-lg"
      style={{ background: "#0b534b" }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 max-w-full">
        <div className="flex items-center gap-2 flex-1">
          <InfoIcon className="text-white flex-shrink-0" size={24} />
          <div>
            <div className="font-bold text-base md:text-lg">
              Générations Futures et Data For Good ont créé Dans Mon Eau.
            </div>
            <div className="text-sm md:text-base opacity-90 mt-1">
              Un outil pour connaître la qualité de votre eau du robinet.
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center md:justify-end">
          <a
            href="https://dansmoneau.fr"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 md:gap-2 bg-green-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm md:text-base font-bold hover:bg-green-700 transition-all shadow-md border-2 border-green-600 pulse-animation whitespace-nowrap"
          >
            <ExternalLink size={14} className="md:w-4 md:h-4" />
            <span>Découvrir dansmoneau.fr</span>
          </a>
        </div>
      </div>
      <style jsx>{`
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
          }
        }
      `}</style>
    </div>
  );
}
