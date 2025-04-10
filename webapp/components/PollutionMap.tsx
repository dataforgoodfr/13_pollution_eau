"use client";

import { useState } from "react";
import PollutionMapBaseLayer from "@/components/PollutionMapBase";
import PollutionMapFilters from "@/components/PollutionMapFilters";
import PollutionMapDetailPanel from "@/components/PollutionMapDetailPanel";
import PollutionMapSearchBox, {
  CommuneFilterResult,
} from "./PollutionMapSearchBox";
import { MAPLIBRE_MAP } from "@/app/config";
import { MapProvider } from "react-map-gl/maplibre";
import MapZoneSelector from "./MapZoneSelector";
import PollutionMapLegend from "./PollutionMapLegend";
import { HamburgerButton } from "./ui/hamburger-button";

export default function PollutionMap() {
  const [period, setPeriod] = useState("dernier_prel");
  const [category, setCategory] = useState("pfas");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [displayMode, setDisplayMode] = useState<"communes" | "udis">("udis");
  const [mapState, setMapState] = useState<{
    longitude: number;
    latitude: number;
    zoom: number;
  }>(MAPLIBRE_MAP.initialViewState);
  const [communeInseeCode, setCommuneInseeCode] = useState<string | null>(null);
  const [dataPanel, setDataPanel] = useState<Record<
    string,
    string | number | null
  > | null>(null);

  const [showLegend, setShowLegend] = useState(true);

  const handleCommuneSelect = (result: CommuneFilterResult | null) => {
    if (result) {
      const { center, zoom, communeInseeCode } = result;
      setMapState({ longitude: center[0], latitude: center[1], zoom });
      setCommuneInseeCode(communeInseeCode);
    } else {
      setCommuneInseeCode(null);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      <MapProvider>
        <PollutionMapBaseLayer
          period={period}
          category={category}
          displayMode={displayMode}
          communeInseeCode={communeInseeCode}
          mapState={mapState}
          onMapStateChange={setMapState}
          setDataPanel={setDataPanel}
        />

        <div className="absolute top-4 left-4 right-4 z-10 bg-white p-3 rounded-lg shadow-lg flex justify-between">
          <PollutionMapSearchBox
            communeInseeCode={communeInseeCode}
            onCommuneFilter={handleCommuneSelect}
          />
          <PollutionMapFilters
            period={period}
            setPeriod={setPeriod}
            category={category}
            setCategory={setCategory}
            // displayMode={displayMode}
            // setDisplayMode={setDisplayMode}
          />
        </div>

        <div className="absolute top-24 right-12 z-10 p-3">
          <MapZoneSelector />
        </div>

        <HamburgerButton visible={!showLegend} onClick={() => setShowLegend(!showLegend)} />

        {showLegend && (
          <div className="absolute left-4 bottom-4">
            <PollutionMapLegend
              category={category}
              onClose={() => setShowLegend(false)}
            />
          </div>
        )}

        {dataPanel && (
          <PollutionMapDetailPanel
            data={dataPanel}
            onClose={() => setDataPanel(null)}
            className="absolute bottom-6 left-4 z-10 bg-white p-3 rounded-lg shadow-lg max-w-xs"
          />
        )}
      </MapProvider>
    </div>
  );
}
