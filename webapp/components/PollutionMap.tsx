"use client";

import { useState, JSX, useEffect } from "react";
import PollutionMapBaseLayer from "@/components/PollutionMapBase";
import PollutionMapFilters from "@/components/PollutionMapFilters";
import PollutionSidePanel from "@/components/PollutionSidePanel";
import PollutionMapSearchBox, { FilterResult } from "./PollutionMapSearchBox";
import CVMInfoModal from "./CVMInfoModal";
import { MAPLIBRE_MAP } from "@/app/config";
import { MapProvider } from "react-map-gl/maplibre";
import MapZoneSelector from "./MapZoneSelector";
import PollutionMapLegend from "./PollutionMapLegend";
import { clsx } from "clsx";
import type { PollutionStats, ParameterValues } from "@/app/lib/data";
import { scrollIframeToFullscreen } from "@/lib/iframe-scroll";
import EmbedBanner from "./EmbedBanner";

export default function PollutionMap({
  pollutionStats,
  parameterValues,
  showBanner = false,
}: {
  pollutionStats: PollutionStats;
  parameterValues: ParameterValues;
  showBanner?: boolean;
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
  const [colorblindMode, setColorblindMode] = useState(false);
  const [showCVMModal, setShowCVMModal] = useState(false);

  // Show CVM modal when category changes to "cvm"
  useEffect(() => {
    if (category === "cvm") {
      const cvmModalShown = sessionStorage.getItem("cvmModalShown");
      if (!cvmModalShown) {
        setShowCVMModal(true);
      }
    }
  }, [category]);

  useEffect(() => {
    scrollIframeToFullscreen();
  }, [category, period, selectedZoneCode]);

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
    <div className="w-full h-full flex flex-col overflow-hidden">
      {showBanner && <EmbedBanner />}
      <div className="flex flex-1 min-h-0">
        <MapProvider>
          <div className="relative flex-1 transition-all duration-300 flex flex-col">
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
              parameterValues={parameterValues}
            />

            <div className="absolute top-4 left-4 z-10 flex gap-1 md:gap-6 flex-col md:flex-row">
              <PollutionMapFilters
                period={period}
                setPeriod={setPeriod}
                category={category}
                setCategory={setCategory}
              />
              <div className="md:hidden">
                <PollutionMapSearchBox
                  communeInseeCode={selectedZoneCode}
                  onAddressFilter={handleAddressSelect}
                />
              </div>
            </div>

            <div className="absolute top-4 right-20 z-9 hidden md:block">
              <PollutionMapSearchBox
                communeInseeCode={selectedZoneCode}
                onAddressFilter={handleAddressSelect}
              />
            </div>

            <div className="absolute top-4 right-4 z-8">
              <MapZoneSelector setDisplayMode={setDisplayMode} />
            </div>

            <div className="absolute left-0 md:left-4 bottom-4 pl-4 pr-12 md:px-0 w-full md:w-auto">
              <PollutionMapLegend
                period={period}
                category={category}
                pollutionStats={pollutionStats}
                colorblindMode={colorblindMode}
                setColorblindMode={setColorblindMode}
                displayMode={displayMode}
                isMobile={isMobile}
              />
            </div>

            {/* Side Panel toggle button  */}
            <div
              className="absolute right-0 top-1/2 transform -translate-y-1/2 cursor-pointer z-[21]"
              onClick={() => setSidePanelOpen(!sidePanelOpen)}
            >
              <div className="bg-custom-drom text-white shadow-md rounded-l-md flex items-center justify-center h-16 w-6">
                <div className="text-lg">{sidePanelOpen ? "›" : "‹"}</div>
              </div>
            </div>
          </div>

          {/* Side panel - responsive: hidden on mobile, visible on desktop */}
          <div
            className={clsx(
              "bg-[#E2E8F0] transition-all duration-300 z-[60]",
              // Mobile: full screen overlay when open, hidden when closed
              "fixed inset-0 md:relative md:inset-auto",

              sidePanelOpen
                ? "block md:block md:w-[400px]"
                : "hidden md:block md:w-0",
            )}
          >
            {/* Panel content */}
            <div className="h-full overflow-y-auto p-1 md:p-0">
              <PollutionSidePanel
                category={category}
                period={period}
                onClose={() => setSidePanelOpen(false)}
              />
            </div>
          </div>

          <CVMInfoModal open={showCVMModal} onOpenChange={setShowCVMModal} />
        </MapProvider>
      </div>
    </div>
  );
}
