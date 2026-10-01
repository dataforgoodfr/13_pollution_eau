"use client";

import { useEffect, useMemo, JSX } from "react";
import ReactMapGl, {
  MapLayerMouseEvent,
  ViewStateChangeEvent,
  AttributionControl,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import { generateColorExpression } from "@/lib/colorMapping";
import PollutionMapMarker from "@/components/PollutionMapMarker";

import { DEFAULT_MAP_STYLE, getDefaultLayers } from "@/app/config";
import { frenchLocale } from "@/lib/mapLocale";

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
  colorblindMode?: boolean;
  isMobile?: boolean;
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
  colorblindMode = false,
  isMobile = false,
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
          "fill-color": generateColorExpression(
            category,
            period,
            colorblindMode,
          ),
          "fill-opacity": [
            "case",
            ["==", ["get", idProperty], selectedZoneCode || ""],
            1,
            0.8,
          ],
        },
      },
      // Limites entre zones : liseré blanc discret, qui sépare les zones sans
      // concurrencer leurs couleurs.
      {
        id: "border-layer",
        type: "line",
        source: source,
        "source-layer": sourceLayer,
        paint: {
          "line-color": "#ffffff",
          "line-opacity": 0.7,
          "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            6,
            0,
            8,
            0.4,
            11,
            0.8,
            14,
            1.2,
            18,
            2,
          ],
        },
      },
      // Zone sélectionnée : calque à part pour être dessinée au-dessus des
      // limites voisines et rester visible à tous les niveaux de zoom.
      {
        id: "selected-border-layer",
        type: "line",
        source: source,
        "source-layer": sourceLayer,
        filter: ["==", ["get", idProperty], selectedZoneCode || ""],
        paint: {
          "line-color": "#1f2937",
          "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            5,
            1.5,
            10,
            2.5,
            16,
            3.5,
          ],
        },
      },
    ];

    return {
      ...DEFAULT_MAP_STYLE,
      layers: [...getDefaultLayers(), ...dynamicLayers],
    } as maplibregl.StyleSpecification;
  }, [selectedZoneCode, displayMode, category, period, colorblindMode]);

  const isInIframe =
    typeof window !== "undefined" && window.self !== window.top;

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
      attributionControl={false}
      cooperativeGestures={isMobile || isInIframe}
      locale={frenchLocale}
    >
      {marker ? (
        <PollutionMapMarker
          displayMode={displayMode}
          marker={marker}
          setSelectedZoneCode={setSelectedZoneCode}
        />
      ) : null}
      <AttributionControl compact={true} />
    </ReactMapGl>
  );
}
