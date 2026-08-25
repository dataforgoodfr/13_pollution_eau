"use client";

import { useEffect, useMemo, useRef, JSX } from "react";
import ReactMapGl, {
  MapLayerMouseEvent,
  ViewStateChangeEvent,
  NavigationControl,
  AttributionControl,
  FullscreenControl,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import {
  generateColorExpression,
  getZoneResult,
  type ZoneResult,
} from "@/lib/colorMapping";
import PollutionMapMarker from "@/components/PollutionMapMarker";

import { DEFAULT_MAP_STYLE, getDefaultLayers } from "@/app/config";
import { frenchLocale } from "@/lib/mapLocale";

type PollutionMapBaseLayerProps = {
  period: string;
  category: string;
  displayMode: "communes" | "udis";
  selectedZoneCode: string | null;
  setSelectedZoneCode: (code: string | null) => void;
  onZoneDataChange: (
    data: Record<string, string | number | null> | null,
  ) => void;
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
  onHoverResultChange?: (result: ZoneResult | null) => void;
};

export default function PollutionMapBaseLayer({
  period,
  category,
  displayMode,
  selectedZoneCode,
  setSelectedZoneCode,
  onZoneDataChange,
  mapState,
  onMapStateChange,
  marker,
  setMarker,
  colorblindMode = false,
  isMobile = false,
  onHoverResultChange,
}: PollutionMapBaseLayerProps) {
  // Clé du dernier résultat survolé, pour n'émettre vers le parent (et donc ne
  // re-rendre) que quand le libellé/la couleur changent, pas à chaque mousemove.
  const lastHoverKeyRef = useRef<string | null>(null);

  const emitHoverResult = (result: ZoneResult | null) => {
    const key = result ? result.label + result.color : null;
    if (key !== lastHoverKeyRef.current) {
      lastHoverKeyRef.current = key;
      onHoverResultChange?.(result);
    }
  };

  function onMouseMove(event: MapLayerMouseEvent) {
    if (!onHoverResultChange) return;
    const feature = event.features?.[0];
    emitHoverResult(
      feature
        ? getZoneResult(category, period, feature.properties, colorblindMode)
        : null,
    );
  }

  function onMouseLeave() {
    emitHoverResult(null);
  }

  useEffect(() => {
    // adds the support for PMTiles
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  // La sélection change : le résultat survolé affiché ne correspond plus à ce
  // que colore la carte, on le réinitialise jusqu'au prochain mousemove.
  useEffect(() => {
    lastHoverKeyRef.current = null;
    onHoverResultChange?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, period, colorblindMode]);

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
            7,
            0.0, // At zoom level 7, line width is 0px
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
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
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
          onZoneDataChange={onZoneDataChange}
        />
      ) : null}
      <AttributionControl compact={true} />
      <NavigationControl position="bottom-right" showCompass={false} />
      <FullscreenControl position="bottom-right" />
    </ReactMapGl>
  );
}
