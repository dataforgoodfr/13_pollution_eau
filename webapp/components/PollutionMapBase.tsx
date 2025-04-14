"use client";

import { useEffect, useMemo, JSX } from "react";
import ReactMapGl, {
  MapLayerMouseEvent,
  Marker,
  Popup,
  ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import { generateColorExpression } from "@/lib/colorMapping";
import { MapPin } from "lucide-react";
import PollutionMapDetailPanel from "@/components/PollutionMapDetailPanel";

import { DEFAULT_MAP_STYLE, getDefaultLayers } from "@/app/config";

type PollutionMapBaseLayerProps = {
  period: string;
  category: string;
  displayMode: "communes" | "udis";
  selectedZoneCode: string | null;
  setSelectedZoneCode: (code: string | null) => void;
  mapState: { longitude: number; latitude: number; zoom: number };
  setSelectedZoneData: (
    data: Record<string, string | number | null> | null,
  ) => void;
  onMapStateChange?: (coords: {
    longitude: number;
    latitude: number;
    zoom: number;
  }) => void;
  marker: {
    longitude: number;
    latitude: number;
    content: JSX.Element;
  } | null;
  setMarker: (
    marker: {
      longitude: number;
      latitude: number;
      content: JSX.Element;
    } | null,
  ) => void;
  selectedZoneData: Record<string, string | number | null> | null;
};

export default function PollutionMapBaseLayer({
  period,
  category,
  displayMode,
  selectedZoneCode,
  setSelectedZoneCode,
  mapState,
  setSelectedZoneData,
  onMapStateChange,
  marker,
  setMarker,
  selectedZoneData,
}: PollutionMapBaseLayerProps) {
  useEffect(() => {
    // adds the support for PMTiles
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  function onClick(event: MapLayerMouseEvent) {
    if (event.features && event.features.length > 0) {
      console.log("zoom level:", mapState.zoom);
      console.log("Properties:", event.features[0].properties);
      setSelectedZoneData(event.features[0].properties);
      setSelectedZoneCode(
        displayMode === "communes"
          ? event.features[0].properties["commune_code_insee"]
          : event.features[0].properties["cdreseau"],
      );

      // Update marker position to clicked coordinates
      const title =
        displayMode === "communes"
          ? event.features[0].properties["commune_nom"]
          : event.features[0].properties["nomreseaux"];

      setMarker({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
        content: <>{title || "Sélection"}</>,
      });
    }
  }

  function handleMapStateChange(e: ViewStateChangeEvent) {
    if (e.viewState && onMapStateChange) {
      onMapStateChange({
        longitude: e.viewState.longitude,
        latitude: e.viewState.latitude,
        zoom: e.viewState.zoom,
      });
    }
  }

  const mapStyle = useMemo(() => {
    const source = displayMode === "communes" ? "communes" : "udis";
    const sourceLayer =
      displayMode === "communes" ? "data_communes" : "data_udi";
    const idProperty =
      displayMode === "communes" ? "commune_code_insee" : "cdreseau";

    const dynamicLayers: maplibregl.LayerSpecification[] = [
      {
        id: "color-layer",
        type: "fill",
        source: source,
        "source-layer": sourceLayer,
        paint: {
          "fill-color": generateColorExpression(category, period),
          "fill-opacity": [
            "case",
            ["==", ["get", idProperty], selectedZoneCode || ""],
            1,
            0.8,
          ],
        },
      },
      {
        id: "border-layer",
        type: "line",
        source: source,
        "source-layer": sourceLayer,
        paint: {
          "line-color": "#7F7F7F",
          "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            0.0, // At zoom level 0, line width is 0px
            6,
            0.0, // At zoom level 6, line width is 0px
            20,
            2.0, // At zoom level 20, line width is 2.0px
          ],
        },
      },
    ];

    return {
      ...DEFAULT_MAP_STYLE,
      layers: [...getDefaultLayers(), ...dynamicLayers],
    } as maplibregl.StyleSpecification;
  }, [selectedZoneCode, displayMode, category, period]);

  return (
    <ReactMapGl
      id="map"
      style={{ width: "100%", height: "100%" }}
      mapStyle={mapStyle}
      {...mapState}
      mapLib={maplibregl}
      onClick={onClick}
      onMove={handleMapStateChange}
      interactiveLayerIds={["color-layer"]}
    >
      {marker ? (
        <>
          <Marker longitude={marker.longitude} latitude={marker.latitude}>
            <MapPin
              size={32}
              className="text-primary-foreground"
              strokeWidth={1}
              stroke="black"
              fill="white"
              color="white"
            />
          </Marker>
          <Popup
            longitude={marker.longitude}
            latitude={marker.latitude}
            anchor="bottom"
            className="-mt-5"
            closeButton={false}
            closeOnClick={false}
          >
            <span className="font-bold ">{marker.content}</span>
            <br />
            <span className="opacity-35">
              Cette adresse est désservie par une unité de distribution.
            </span>
            {selectedZoneData && (
              <PollutionMapDetailPanel selectedZoneData={selectedZoneData} />
            )}
          </Popup>
        </>
      ) : null}
    </ReactMapGl>
  );
}
