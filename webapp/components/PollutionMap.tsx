"use client";

import { useState, JSX } from "react";
import PollutionMapBaseLayer from "@/components/PollutionMapBase";
import PollutionMapFilters from "@/components/PollutionMapFilters";
import PollutionMapDetailPanel from "@/components/PollutionMapDetailPanel";
import PollutionExpPanel from "@/components/PollutionExpPanel";

import PollutionMapSearchBox, {
  CommuneFilterResult,
  FilterResult,
} from "./PollutionMapSearchBox";
import { MapGeoJSONFeature } from "maplibre-gl";
// import PollutionMapSearchBox, { FilterResult } from "./PollutionMapSearchBox";
import { MAPLIBRE_MAP } from "@/app/config";
import { MapProvider } from "react-map-gl/maplibre";

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
  const [featureDetails, setFeatureDetails] =
    useState<MapGeoJSONFeature | null>(null);
  // const handleCommuneSelect = (result: CommuneFilterResult | null) => {
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
    <div className="relative w-full h-full flex">
      <MapProvider>
        <div className="relative mapzone w-full h-full ">
          {/* <PollutionMapBaseLayer
            year={year}
            categoryType={categoryType}
            communeInseeCode={communeInseeCode}
            mapState={mapState}
            onMapStateChange={setMapState}
            onFeatureClick={setFeatureDetails} */}
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

          <div className="absolute top-4 right-4 left-4 z-10 px-2 flex justify-between overflow-x-auto scrollbar-hide">
            <PollutionMapFilters
              period={period}
              setPeriod={setPeriod}
              category={category}
              setCategory={setCategory}
              // displayMode={displayMode}
              // setDisplayMode={setDisplayMode}
            />
            <PollutionMapSearchBox
              communeInseeCode={selectedZoneCode}
              onAddressFilter={handleAddressSelect}
            />
          </div>
          {/* <div className="absolute top-24 right-12 z-10 p-3">
          <MapZoneSelector />
        </div> */}
          {/* <div className="absolute bottom-6 right-4 z-10 bg-white p-3 rounded-lg shadow-lg">
        <PollutionMapLegend category={category} />
      </div> */}
          <div
            className="relative right-0 h-full  flex justify-center"
            id="side_panel"
          >
            <PollutionExpPanel categorieId={category} />
          </div>

          {/* {featureDetails && ( */}

          {dataPanel && (
            <PollutionMapDetailPanel
              data={dataPanel}
              onClose={() => setDataPanel(null)}
              className="absolute bottom-6 left-4 z-10 bg-white p-3 rounded-lg shadow-lg max-w-xs"
            />
          )}
        </div>
      </MapProvider>
    </div>
  );
}

// async function LookupUDI(center: [number, number]) {
/*try {
    const fecthUrl =
      "/api/UDILookup?Lon=" + center[0] + "&Lat=" + center[1] + "";
    console.log("Lookup UDI", fecthUrl);
    const response = await fetch(fecthUrl);
    const UDIInfo = await response.json();

    alert("UDI "+UDIInfo.nomUDI)
  } catch (ex) {}*/
// }
