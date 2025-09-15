"use client";

import { useState, JSX } from "react";
import PollutionMapBaseLayer from "@/components/PollutionMapBase";
import PollutionMapFilters from "@/components/PollutionMapFilters";
import PollutionSidePanel from "@/components/PollutionSidePanel";
import PollutionMapSearchBox, { FilterResult } from "./PollutionMapSearchBox";
import { MAPLIBRE_MAP } from "@/app/config";
import { MapProvider } from "react-map-gl/maplibre";
import MapZoneSelector from "./MapZoneSelector";
import PollutionMapLegend from "./PollutionMapLegend";
import { HamburgerButton } from "./ui/hamburger-button";
import { clsx } from "clsx";
import type { PollutionStats } from "@/app/lib/data";

export default function PollutionMap({
  pollutionStats,
}: {
  pollutionStats: PollutionStats;
}) {
  const [period, setPeriod] = useState("dernier_prel");
  const [category, setCategory] = useState("tous");
  const [displayMode, setDisplayMode] = useState<"communes" | "udis">("udis");
  const [mapState, setMapState] = useState<{
    longitude: number;
    latitude: number;
    zoom: number;
  }>(MAPLIBRE_MAP.initialViewState);
  const [selectedZoneCode, setSelectedZoneCode] = useState<string | null>(null);
  const [marker, setMarker] = useState<{
    longitude: number;
    latitude: number;
    content?: JSX.Element;
  } | null>(null);

  const [isMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false; // Default to false for SSR
  });

  const [sidePanelOpen, setSidePanelOpen] = useState(() => !isMobile);
  const [showLegend, setShowLegend] = useState(() => !isMobile);
  const [colorblindMode, setColorblindMode] = useState(false);

  const handleAddressSelect = async (result: FilterResult | null) => {
    if (result) {
      const { center, zoom, address } = result;
      setMapState({ longitude: center[0], latitude: center[1], zoom });
      setMarker({
        longitude: center[0],
        latitude: center[1],
        content: <>{address}</>,
      });
    } else {
      setMarker(null);
      setSelectedZoneCode(null);
    }
  };

  return (
    <div className="relative w-full h-full flex">
      <MapProvider>
        {/* Map container - takes remaining space */}
        <div
          className={clsx(
            "relative flex-1 transition-all duration-300",
            // On mobile, hide map when panel is open (overlay)
            isMobile && sidePanelOpen && "hidden",
          )}
        >
          <PollutionMapBaseLayer
            period={period}
            category={category}
            displayMode={displayMode}
            selectedZoneCode={selectedZoneCode}
            setSelectedZoneCode={setSelectedZoneCode}
            mapState={mapState}
            onMapStateChange={setMapState}
            marker={marker}
            setMarker={setMarker}
            colorblindMode={colorblindMode}
            isMobile={isMobile}
          />

          {/* Mobile layout: better positioned overlays */}
          <div
            className={clsx(
              "md:hidden absolute top-4 left-4 right-4 z-20 flex flex-col gap-2",
              // Hide controls when panel is open on mobile to avoid conflicts
              isMobile && sidePanelOpen && "hidden",
            )}
          >
            <div className="flex justify-between items-start gap-2">
              <PollutionMapFilters
                period={period}
                setPeriod={setPeriod}
                category={category}
                setCategory={setCategory}
                displayMode={displayMode}
                setDisplayMode={setDisplayMode}
              />
              {!sidePanelOpen && (
                <button
                  onClick={() => setSidePanelOpen(true)}
                  className="bg-custom-drom text-white p-2 rounded-md shadow-md flex items-center justify-center"
                  aria-label="Ouvrir le panneau"
                >
                  <div className="text-lg">☰</div>
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <PollutionMapSearchBox
                  communeInseeCode={selectedZoneCode}
                  onAddressFilter={handleAddressSelect}
                />
              </div>
              <MapZoneSelector />
            </div>
          </div>

          {/* Desktop layout: absolute positioning */}
          <div className="hidden md:block absolute top-4 left-4 z-10 overflow-x-auto scrollbar-hide">
            <PollutionMapFilters
              period={period}
              setPeriod={setPeriod}
              category={category}
              setCategory={setCategory}
              displayMode={displayMode}
              setDisplayMode={setDisplayMode}
            />
          </div>

          <div className="hidden md:block absolute top-4 right-20 z-9">
            <PollutionMapSearchBox
              communeInseeCode={selectedZoneCode}
              onAddressFilter={handleAddressSelect}
            />
          </div>

          <div className="hidden md:block absolute top-4 right-4 z-8">
            <MapZoneSelector />
          </div>

          <div className="absolute left-4 bottom-4">
            <HamburgerButton
              visible={!showLegend}
              onClick={() => setShowLegend(!showLegend)}
            />
          </div>

          {showLegend && (
            <div className="absolute left-4 bottom-4">
              <PollutionMapLegend
                period={period}
                category={category}
                pollutionStats={pollutionStats}
                colorblindMode={colorblindMode}
                setColorblindMode={setColorblindMode}
                onClose={() => setShowLegend(false)}
              />
            </div>
          )}
        </div>

        {/* Right side panel with handle */}
        <div
          className={clsx(
            "relative flex h-full",
            // On mobile, panel takes full width when open (overlay)
            isMobile && sidePanelOpen && "absolute inset-0 z-40",
          )}
        >
          {/* Panel handle - always visible on desktop, hidden on mobile when panel is closed */}
          <div
            className={clsx(
              "absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 cursor-pointer z-20",
              "md:block", // Always visible on desktop
              isMobile && !sidePanelOpen && "hidden", // Hidden on mobile when panel is closed
            )}
            onClick={() => setSidePanelOpen(!sidePanelOpen)}
          >
            <div className="bg-custom-drom text-white shadow-md rounded-l-md flex items-center justify-center h-16 w-6">
              <div className="text-lg">{sidePanelOpen ? "›" : "‹"}</div>
            </div>
          </div>

          {/* Panel content */}
          <div
            className={clsx(
              "bg-[#E2E8F0] transition-all duration-300 h-full overflow-y-auto",
              {
                // When panel is open
                "w-full md:w-80 opacity-100": sidePanelOpen,
                // When panel is closed
                "w-0 opacity-0": !sidePanelOpen,
              },
            )}
          >
            {sidePanelOpen && (
              <PollutionSidePanel
                category={category}
                onClose={() => setSidePanelOpen(false)}
              />
            )}
          </div>
        </div>
      </MapProvider>
    </div>
  );
}
