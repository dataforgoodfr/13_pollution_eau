"use client";

import { useEffect, useMemo } from "react";
import ReactMapGl, {
  MapLayerMouseEvent,
  ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import { generateColorExpression } from "@/lib/colorMapping";

import { DEFAULT_MAP_STYLE, getDefaultLayers } from "@/app/config";

type PollutionMapBaseLayerProps = {
  period: string;
  category: string;
  displayMode: "communes" | "udis";
  communeInseeCode: string | null;
  mapState: { longitude: number; latitude: number; zoom: number };
  setDataPanel: (data: Record<string, string | number | null> | null) => void;
  onMapStateChange?: (coords: {
    longitude: number;
    latitude: number;
    zoom: number;
  }) => void;
};

export default function PollutionMapBaseLayer({
  period,
  category,
  displayMode,
  communeInseeCode,
  mapState,
  setDataPanel,
  onMapStateChange,
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
      console.log("Properties:", event.features[0].properties);
      setDataPanel(event.features[0].properties);
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
    const dynamicLayers: maplibregl.LayerSpecification[] = [
      {
        id: "communes-layer",
        type: "fill",
        source: "communes",
        "source-layer": "data_communes",
        paint: {
          "fill-color": generateColorExpression(category, period),
          "fill-opacity": 0.5,
        },
        layout: {
          visibility: displayMode === "communes" ? "visible" : "none",
        },
        ...(communeInseeCode
          ? {
              filter: ["==", ["get", "commune_code_insee"], communeInseeCode],
            }
          : {}),
      },
      {
        id: "udis-layer",
        type: "fill",
        source: "udis",
        "source-layer": "data_udi",
        paint: {
          "fill-color": generateColorExpression(category, period),
          "fill-opacity": 0.5,
        },
        layout: {
          visibility: displayMode === "udis" ? "visible" : "none",
        },
        // Filter for UDIs if applicable
        // ...(someUdiCode ? { filter: ["==", ["get", "udi_code"], someUdiCode] } : {}),
      },
    ];

    return {
      ...DEFAULT_MAP_STYLE,
      layers: [...getDefaultLayers(), ...dynamicLayers],
    } as maplibregl.StyleSpecification;
  }, [communeInseeCode, displayMode, category, period]);

  const interactiveLayerIds =
    displayMode === "communes" ? ["communes-layer"] : ["udis-layer"];

  return (
    <ReactMapGl
      id="map"
      style={{ width: "100%", height: "100%" }}
      mapStyle={mapStyle}
      {...mapState}
      mapLib={maplibregl}
      onClick={onClick}
      onMove={handleMapStateChange}
      interactiveLayerIds={interactiveLayerIds}
    />
  );
}
