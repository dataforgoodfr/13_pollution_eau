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
    <div className="relative w-full h-full flex flex-col">
      <MapProvider>
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

        <div className="absolute top-4 left-4 z-10 flex space-x-0 md:space-x-6 space-y-3 md:space-y-0 flex-col md:flex-row">
          <PollutionMapFilters
            period={period}
            setPeriod={setPeriod}
            category={category}
            setCategory={setCategory}
            displayMode={displayMode}
            setDisplayMode={setDisplayMode}
          />
        </div>

        <div
          className={clsx(
            "absolute top-4 right-20 z-9 transition-all duration-300",
            sidePanelOpen && "mr-80",
          )}
        >
          <PollutionMapSearchBox
            communeInseeCode={selectedZoneCode}
            onAddressFilter={handleAddressSelect}
          />
        </div>

        <div
          className={clsx(
            "absolute top-4 right-4 z-8 transition-all duration-300",
            sidePanelOpen && "mr-80",
          )}
        >
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

        {/* Right side panel with handle */}
        <div className="absolute top-0 right-0 h-full z-10">
          {/* Panel handle - always visible */}
          <div
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 cursor-pointer z-20"
            onClick={() => setSidePanelOpen(!sidePanelOpen)}
          >
            <div className="bg-custom-drom text-white shadow-md rounded-l-md flex items-center justify-center h-16 w-6">
              <div className="text-lg">{sidePanelOpen ? "›" : "‹"}</div>
            </div>
          </div>

          {/* Panel content */}
          <div
            className={`bg-[#E2E8F0] transition-all duration-300 h-full overflow-y-auto ${
              sidePanelOpen ? "w-80 opacity-100" : "w-0 opacity-0"
            }`}
          >
            <PollutionSidePanel
              category={category}
              onClose={() => setSidePanelOpen(false)}
            />
          </div>
        </div>
      </MapProvider>
    </div>
  );
}
