"use client";

import { useState } from "react";
import PollutionMapBaseLayer from "@/components/PollutionMapBase";
import PollutionMapFilters from "@/components/PollutionMapFilters";
import PollutionMapDetailPanel from "@/components/PollutionMapDetailPanel";
import PollutionMapSearchBox, {
  CommuneFilterResult,
} from "./PollutionMapSearchBox";
import { MapGeoJSONFeature } from "maplibre-gl";
import { MAPLIBRE_MAP } from "@/app/config";
import { MapProvider } from "react-map-gl/maplibre";
import MapZoneSelector from "./MapZoneSelector";

export default function PollutionMap() {
  const [year, setYear] = useState("2024");
  const [categoryType, setCategoryType] = useState("cvm");
  const [mapState, setMapState] = useState<{
    longitude: number;
    latitude: number;
    zoom: number;
  }>(MAPLIBRE_MAP.initialViewState);
  const [communeInseeCode, setCommuneInseeCode] = useState<string | null>(null);
  const [featureDetails, setFeatureDetails] =
    useState<MapGeoJSONFeature | null>(null);

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
          year={year}
          categoryType={categoryType}
          communeInseeCode={communeInseeCode}
          mapState={mapState}
          onMapStateChange={setMapState}
          onFeatureClick={setFeatureDetails}
        />

        <div className="absolute top-4 right-4 left-4 z-10 px-2 flex justify-between overflow-x-auto scrollbar-hide">
          <PollutionMapFilters
            year={year}
            setYear={setYear}
            categoryType={categoryType}
            setCategoryType={setCategoryType}
          />
          <PollutionMapSearchBox
            communeInseeCode={communeInseeCode}
            onCommuneFilter={handleCommuneSelect}
          />
        </div>

        <div className="absolute top-24 right-12 z-10  p-3 ">
          <MapZoneSelector />
        </div>

        {/* <div className="absolute bottom-6 right-4 z-10 bg-white p-3 rounded-lg shadow-lg">
        <PollutionMapLegend categoryType={categoryType} />
      </div> */}

        {featureDetails && (
          <PollutionMapDetailPanel
            feature={featureDetails}
            onClose={() => setFeatureDetails(null)}
            className="absolute bottom-6 left-4 z-10 bg-white p-3 rounded-lg shadow-lg max-w-xs"
          />
        )}
      </MapProvider>
    </div>
  );
}
