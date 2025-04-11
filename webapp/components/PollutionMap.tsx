"use client";

import { useState, JSX } from "react";
import PollutionMapBaseLayer from "@/components/PollutionMapBase";
import PollutionMapFilters from "@/components/PollutionMapFilters";
import PollutionMapDetailPanel from "@/components/PollutionMapDetailPanel";
import PollutionSidePanel from "@/components/PollutionSidePanel";
import PollutionMapSearchBox, { FilterResult } from "./PollutionMapSearchBox";
import { MAPLIBRE_MAP } from "@/app/config";
import { MapProvider } from "react-map-gl/maplibre";
import MapZoneSelector from "./MapZoneSelector";
import PollutionMapLegend from "./PollutionMapLegend";
import { HamburgerButton } from "./ui/hamburger-button";
import { clsx } from "clsx";

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
  const [dataPanel, setDataPanel] = useState<Record<
    string,
    string | number | null
  > | null>(null);
  const [marker, setMarker] = useState<{
    longitude: number;
    latitude: number;
    content: JSX.Element;
  } | null>(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(true);

  const [showLegend, setShowLegend] = useState(true);

  const handleAddressSelect = (result: FilterResult | null) => {
    if (result) {
      const { center, zoom, communeInseeCode, address } = result;
      setMapState({ longitude: center[0], latitude: center[1], zoom });
      setSelectedZoneCode(communeInseeCode);
      //LookupUDI(center);
      setMarker({
        longitude: center[0],
        latitude: center[1],
        content: <>{address}</>,
      });
    } else {
      setSelectedZoneCode(null);
      setMarker(null);
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
          mapState={mapState}
          onMapStateChange={setMapState}
          setDataPanel={setDataPanel}
          marker={marker}
          setMarker={setMarker}
        />

        <div className="absolute top-4 left-4 z-10 flex overflow-x-auto scrollbar-hide">
          <PollutionMapFilters
            period={period}
            setPeriod={setPeriod}
            category={category}
            setCategory={setCategory}
            // displayMode={displayMode}
            // setDisplayMode={setDisplayMode}
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
              category={category}
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
            <div className="bg-white text-gray-600 shadow-md rounded-l-md flex items-center justify-center h-16 w-6">
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

        {/* <div className="absolute bottom-6 right-4 z-10 bg-white p-3 rounded-lg shadow-lg">
        <PollutionMapLegend category={category} />
      </div> */}

        {dataPanel && (
          <PollutionMapDetailPanel
            data={dataPanel}
            onClose={() => setDataPanel(null)}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white p-4 rounded-lg shadow-lg max-w-md"
          />
        )}
      </MapProvider>
    </div>
  );
}

/*async function LookupUDI(center: [number, number]) {
  try {
    const fecthUrl =
      "/api/UDILookup?Lon=" + center[0] + "&Lat=" + center[1] + "";
    console.log("Lookup UDI", fecthUrl);
    const response = await fetch(fecthUrl);
    const UDIInfo = await response.json();

    alert("UDI "+UDIInfo.nomUDI)
  } catch (ex) {}
}*/
