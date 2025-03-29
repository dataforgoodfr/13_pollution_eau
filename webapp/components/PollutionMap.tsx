"use client";

import { useEffect, useState } from "react";
import PollutionMapBaseLayer from "@/components/PollutionMapBase";
import PollutionMapFilters from "@/components/PollutionMapFilters";
import PollutionMapDetailPanel from "@/components/PollutionMapDetailPanel";
import PollutionMapSearchBox, {
  CommuneFilterResult,
} from "./PollutionMapSearchBox";
import { MapGeoJSONFeature } from "maplibre-gl";
import { MAPLIBRE_MAP } from "@/app/config";
import MapZoneSelector, { ZONE_NOZONE } from "./MapZoneSelector";

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
  const [centerOnZone, setCenterOnZone] = useState<number>(ZONE_NOZONE);

  const handleCommuneSelect = (result: CommuneFilterResult | null) => {
    if (result) {
      const { center, zoom, communeInseeCode } = result;
      setMapState({ longitude: center[0], latitude: center[1], zoom });
      setCommuneInseeCode(communeInseeCode);
      LookupUDI(center);
    } else {
      setCommuneInseeCode(null);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      <PollutionMapBaseLayer
        year={year}
        categoryType={categoryType}
        communeInseeCode={communeInseeCode}
        mapState={mapState}
        onMapStateChange={setMapState}
        onFeatureClick={setFeatureDetails}
        centerOnZone={centerOnZone}
        resetZone={() => {
          setCenterOnZone(ZONE_NOZONE);
        }}
      />

      <div className="absolute top-4 left-4 right-4 z-10 bg-white p-3 rounded-lg shadow-lg flex justify-between">
        <div className="grow grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <PollutionMapSearchBox
              communeInseeCode={communeInseeCode}
              onCommuneFilter={handleCommuneSelect}
            />
          </div>
          <div>
            <PollutionMapFilters
              year={year}
              setYear={setYear}
              categoryType={categoryType}
              setCategoryType={setCategoryType}
            />
          </div>
        </div>
      </div>

      <div className="absolute top-24 right-12 z-10  p-3 ">
        <MapZoneSelector
          zoneChangeCallback={setCenterOnZone}
          selectedZone={centerOnZone}
        />
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
    </div>
  );
}

async function LookupUDI(center: [number, number]) {
  /*try {
    const fecthUrl =
      "/api/UDILookup?Lon=" + center[0] + "&Lat=" + center[1] + "";
    console.log("Lookup UDI", fecthUrl);
    const response = await fetch(fecthUrl);
    const UDIInfo = await response.json();

    alert("UDI "+UDIInfo.nomUDI)
  } catch (ex) {}*/
}
