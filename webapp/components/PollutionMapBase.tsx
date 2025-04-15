"use client";

import { useEffect, useMemo, JSX } from "react";
import ReactMapGl, {
  MapLayerMouseEvent,
  ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import { generateColorExpression } from "@/lib/colorMapping";
import PollutionMapMarker from "@/components/PollutionMapMarker";

import { DEFAULT_MAP_STYLE, getDefaultLayers } from "@/app/config";

type PollutionMapBaseLayerProps = {
  period: string;
  category: string;
  displayMode: "communes" | "udis";
  selectedZoneCode: string | null;
  setSelectedZoneCode: (code: string | null) => void;
  mapState: { longitude: number; latitude: number; zoom: number };
  onMapStateChange?: (coords: {
    longitude: number;
    latitude: number;
    zoom: number;
  }) => void;
  marker: {
    longitude: number;
    latitude: number;
    content?: JSX.Element;
  } | null;
  setMarker: (
    marker: {
      longitude: number;
      latitude: number;
      content?: JSX.Element;
    } | null,
  ) => void;
};

export default function PollutionMapBaseLayer({
  period,
  category,
  displayMode,
  selectedZoneCode,
  setSelectedZoneCode,
  mapState,
  onMapStateChange,
  marker,
  setMarker,
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
      // setSelectedZoneData(event.features[0].properties);
      // setSelectedZoneCode(
      //   displayMode === "communes"
      //     ? event.features[0].properties["commune_code_insee"]
      //     : event.features[0].properties["cdreseau"],
      // );

      setMarker({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
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
          "line-color": [
            "case",
            ["==", ["get", idProperty], selectedZoneCode || ""],
            "#000000",
            "#7F7F7F",
          ],
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
        <PollutionMapMarker
          period={period}
          category={category}
          displayMode={displayMode}
          marker={marker}
          selectedZoneCode={selectedZoneCode}
          setSelectedZoneCode={setSelectedZoneCode}
        />
      ) : null}
    </ReactMapGl>
  );
}
