"use client";

import { useState, JSX, useEffect } from "react";
import PollutionMapBaseLayer from "@/components/PollutionMapBase";
import PollutionZoneDetailPanel from "@/components/PollutionZoneDetailPanel";
import PollutionMapControlsPanel from "@/components/PollutionMapControlsPanel";
import PollutionMapSearchBox, { FilterResult } from "./PollutionMapSearchBox";
import CVMInfoModal from "./CVMInfoModal";
import { MAPLIBRE_MAP } from "@/app/config";
import { MapProvider } from "react-map-gl/maplibre";
import MapTopRightControls from "./MapTopRightControls";
import PollutionMapLegend from "./PollutionMapLegend";
import { clsx } from "clsx";
import type { PollutionStats, ParameterValues } from "@/app/lib/data";
import type { ZoneResult } from "@/lib/colorMapping";
import { scrollIframeToFullscreen } from "@/lib/iframe-scroll";
import EmbedBanner from "./EmbedBanner";

export default function PollutionMap({
  pollutionStats,
  parameterValues,
  showBanner = false,
  initialCategory,
}: {
  pollutionStats: PollutionStats;
  parameterValues: ParameterValues;
  showBanner?: boolean;
  initialCategory?: string;
}) {
  const [period, setPeriod] = useState("dernier_prel");
  const [category, setCategory] = useState(initialCategory || "tous");
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

  // isMobile is only used for non-layout-critical behavior (map gesture mode,
  // legend's default expanded state). It's read after mount, so it starts
  // false on both server and first client render — no hydration mismatch.
  const [isMobile, setIsMobile] = useState(false);
  // `null` means "no explicit user choice yet": the right panel's open/closed
  // state is then decided purely by the md: responsive classes below (open on
  // desktop, closed on mobile), which the browser resolves at first paint
  // without any JS — so there's no server/client mismatch and no flash of the
  // panel opening then immediately sliding closed on mobile. Once the user
  // clicks the toggle, this becomes an explicit true/false that applies at
  // every breakpoint.
  const [rightPanelOverride, setRightPanelOverride] = useState<boolean | null>(
    null,
  );
  const [colorblindMode, setColorblindMode] = useState(false);
  const [showCVMModal, setShowCVMModal] = useState(false);
  const [hoveredResult, setHoveredResult] = useState<ZoneResult | null>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const toggleRightPanel = () => {
    setRightPanelOverride((current) => {
      const currentlyOpen =
        current === null
          ? window.matchMedia("(min-width: 768px)").matches
          : current;
      return !currentlyOpen;
    });
  };

  const leftPanelOpen = selectedZoneCode !== null;

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
      const { center, zoom, address, postcode } = result;
      setMapState({ longitude: center[0], latitude: center[1], zoom });
      setMarker({
        longitude: center[0],
        latitude: center[1],
        content: <>{address}</>,
      });

      // Detect if we're in a DROM or Metropole based on postcode, and set display mode
      // DROM postcodes: 971 (Guadeloupe), 972 (Martinique), 973 (Guyane), 974 (Réunion), 976 (Mayotte)
      const isInDROM = postcode ? /^97[1234678]/.test(postcode) : false;
      setDisplayMode(isInDROM ? "communes" : "udis");
    } else {
      setMarker(null);
      setSelectedZoneCode(null);
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {showBanner && <EmbedBanner />}
      <div className="relative flex-1 min-h-0">
        <MapProvider>
          <div className="absolute inset-0">
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
              onHoverResultChange={setHoveredResult}
            />
          </div>

          {!leftPanelOpen && (
            <div className="absolute top-4 left-4 z-10">
              <PollutionMapSearchBox
                communeInseeCode={selectedZoneCode}
                onAddressFilter={handleAddressSelect}
              />
            </div>
          )}

          <MapTopRightControls
            rightPanelOverride={rightPanelOverride}
            onToggleRightPanel={toggleRightPanel}
            setDisplayMode={setDisplayMode}
            onZoneChange={() => {
              setMarker(null);
              setSelectedZoneCode(null);
            }}
          />

          <div
            className={clsx(
              "absolute bottom-4 z-10 transition-[right] duration-300 ease-in-out",
              rightPanelOverride === null
                ? "right-4 md:right-[calc(400px_+_1rem)]"
                : rightPanelOverride
                  ? "hidden md:block md:right-[calc(400px_+_1rem)]"
                  : "right-4",
            )}
          >
            <PollutionMapLegend
              period={period}
              category={category}
              pollutionStats={pollutionStats}
              colorblindMode={colorblindMode}
              setColorblindMode={setColorblindMode}
              hoveredResult={hoveredResult}
            />
          </div>

          {/* Left panel - zone detail, slides in from the left over the map */}
          <div
            className={clsx(
              "absolute inset-y-0 left-0 z-[60] w-full bg-[#E2E8F0] shadow-xl transition-transform duration-300 ease-in-out md:w-[400px]",
              leftPanelOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <div className="h-full overflow-y-auto">
              <PollutionZoneDetailPanel
                period={period}
                category={category}
                displayMode={displayMode}
                selectedZoneCode={selectedZoneCode}
                colorblindMode={colorblindMode}
                parameterValues={parameterValues}
                onClose={() => {
                  setMarker(null);
                  setSelectedZoneCode(null);
                }}
              />
            </div>
          </div>

          {/* Right panel - filters/legend/stats, slides in from the right over the map */}
          <div
            className={clsx(
              "absolute inset-y-0 right-0 z-[60] w-full bg-[#E2E8F0] shadow-xl transition-transform duration-300 ease-in-out md:w-[400px]",
              rightPanelOverride === null
                ? "translate-x-full md:translate-x-0"
                : rightPanelOverride
                  ? "translate-x-0"
                  : "translate-x-full",
            )}
          >
            <div className="h-full overflow-y-auto">
              <PollutionMapControlsPanel
                period={period}
                setPeriod={setPeriod}
                category={category}
                setCategory={setCategory}
                pollutionStats={pollutionStats}
                colorblindMode={colorblindMode}
                setColorblindMode={setColorblindMode}
                displayMode={displayMode}
                onClose={() => setRightPanelOverride(false)}
              />
            </div>
          </div>

          <CVMInfoModal open={showCVMModal} onOpenChange={setShowCVMModal} />
        </MapProvider>
      </div>
    </div>
  );
}
