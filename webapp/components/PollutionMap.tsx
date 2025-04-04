"use client";

import { useState } from "react";
import PollutionMapBaseLayer from "@/components/PollutionMapBase";
import PollutionMapFilters from "@/components/PollutionMapFilters";
import PollutionMapDetailPanel from "@/components/PollutionMapDetailPanel";
import PollutionExpPanel from "@/components/PollutionExpPanel";
import PollutionMapSearchBox, {
  CommuneFilterResult,
} from "./PollutionMapSearchBox";
import { MapGeoJSONFeature } from "maplibre-gl";
import { MAPLIBRE_MAP } from "@/app/config";
import { MapProvider } from "react-map-gl/maplibre";

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
    <div className="relative w-full h-full flex">
      <MapProvider>
        <div className="relative mapzone w-full h-full ">
          <PollutionMapBaseLayer
            year={year}
            categoryType={categoryType}
            communeInseeCode={communeInseeCode}
            mapState={mapState}
            onMapStateChange={setMapState}
            onFeatureClick={setFeatureDetails}
          />

          <div className="filter_search_container w-3/4 relative p-3 rounded-lg flex justify-between z-60 pointer-events-auto">
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
        </div>
        {/* <div className="absolute bottom-6 right-4 z-10 bg-white p-3 rounded-lg shadow-lg">
        <PollutionMapLegend categoryType={categoryType} />
      </div> */}
        <div
          className="relative right-0 h-full  flex justify-center"
          id="side_panel"
        >
          <PollutionExpPanel categorieId={categoryType} />
        </div>
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
