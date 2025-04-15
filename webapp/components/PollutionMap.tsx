"use client";

import { useState, JSX, useEffect } from "react";
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
import { Button } from "./ui/button";

export default function PollutionMap() {
  const [period, setPeriod] = useState("dernier_prel");
  const [category, setCategory] = useState("tous-polluants");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    setSidePanelOpen(!isMobile);
    setShowLegend(!isMobile);
  }, []);

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
	<MapProvider>
      <div name="map" className="relative w-full h-full">
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
        />

        <div name="pnlMain" className="absolute top-0 w-full h-full flex flex-col md:flex-row pointer-events-none">
          <div name="pnlCommandes" className="w-full h-full flex flex-col pointer-events-none">
            <div name="pnlInputs" className="w-full flex flex-col md:flex-row pointer-events-none">
              <div name="inputType" className="w-full flex flex-row pointer-events-auto">
                <PollutionMapFilters
                  period={period}
                  setPeriod={setPeriod}
                  category={category}
                  setCategory={setCategory}
                  // displayMode={displayMode}
                  // setDisplayMode={setDisplayMode}
                />
              </div>
              <div className="pointer-events-auto">
                <PollutionMapSearchBox
                  communeInseeCode={selectedZoneCode}
                  onAddressFilter={handleAddressSelect}
                />
              </div>
            </div>

            <div className="flex flex-row h-full pointer-events-none">
              <div name="pnlLegende" className="p-4 h-fit self-end pointer-events-auto">
                <HamburgerButton
                  visible={!showLegend}
                  onClick={() => setShowLegend(!showLegend)}
                />

				{showLegend && (
				    <PollutionMapLegend
				      category={category}
				      onClose={() => setShowLegend(false)}
				    />
				)}

              </div>

              <div name="pnlDomTom" className="p-4 justify-end w-full h-fit flex flex-row pointer-events-none">
                <div className="pointer-events-auto">
					<MapZoneSelector />
				</div>
              </div>
            </div>
          </div>

          <div name="pnlDetail" className="flex flex-col md:flex-row pointer-events-none">
            <div className="flex w-full h-fit md:w-fit md:h-full justify-center md:justify-none pointer-events-none">
              <div
                className="hidden md:flex bg-white text-gray-600 shadow-md rounded-t-md rounded-l-none h-6 w-16 md:rounded-t-none md:rounded-l-md md:h-16 md:w-6 self-center flex items-center justify-center cursor-pointer pointer-events-auto"
                onClick={() => setSidePanelOpen(!sidePanelOpen)}
              >
                <div className="text-lg">
                  {sidePanelOpen ? "›" : "‹"}
                </div>
              </div>
            </div>

            <div className="h-16 md:h-full pointer-events-auto">
              <div
                className={`bg-[#E2E8F0] transition-all duration-300 h-full overflow-y-auto ${
                  sidePanelOpen ? "w-full md:w-80 opacity-100" : "md:w-0 md:opacity-0"
                }`}
              >
                <PollutionSidePanel
                  category={category}
                  onClose={() => setSidePanelOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MapProvider>
  );
}
