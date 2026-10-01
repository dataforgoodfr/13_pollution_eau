"use client";

import { useEffect, useMemo, useRef, useState, JSX } from "react";
import ReactMapGl, {
  MapLayerMouseEvent,
  ViewStateChangeEvent,
  AttributionControl,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import { generateColorExpression, getZoneScaleKey } from "@/lib/colorMapping";
import PollutionMapMarker from "@/components/PollutionMapMarker";
import PollutionMapHoverTooltip, {
  type HoveredZone,
} from "@/components/PollutionMapHoverTooltip";

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

  // Zone survolée : étiquette près du curseur + contour mis en évidence,
  // affichés seulement une fois la souris immobile depuis HOVER_DELAY_MS (pas
  // de clignotement quand on balaie la carte). Tout mouvement les masque et
  // relance le délai.
  const HOVER_DELAY_MS = 500;
  const [hoveredZone, setHoveredZone] = useState<HoveredZone | null>(null);
  // Curseur "main" immédiat au-dessus d'une zone, indépendamment du délai.
  const [overZone, setOverZone] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearHover() {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredZone(null);
  }

  // La sélection change : le résultat affiché ne correspond plus, on le
  // masque jusqu'au prochain arrêt de la souris.
  useEffect(() => {
    clearHover();
  }, [category, period, displayMode]);

  useEffect(() => () => clearHover(), []);

  function onMouseMove(event: MapLayerMouseEvent) {
    // Pas d'étiquette sur écran tactile : le tap ouvre directement le détail.
    if (window.matchMedia("(hover: none)").matches) return;

    clearHover();

    const feature = event.features?.[0];
    const scaleKey = feature
      ? getZoneScaleKey(category, period, feature.properties)
      : null;
    setOverZone(scaleKey !== null);
    if (!feature || scaleKey === null) {
      return;
    }

    const code = String(
      feature.properties[
        displayMode === "communes" ? "commune_code_insee" : "cdreseau"
      ],
    );
    const name =
      feature.properties[
        displayMode === "communes" ? "commune_nom" : "nomreseaux"
      ];
    const container = event.target.getContainer();
    const { x, y } = event.point;

    hoverTimeoutRef.current = setTimeout(() => {
      hoverTimeoutRef.current = null;
      // Décalée en bas à droite du curseur, ou basculée de l'autre côté près
      // des bords droit/bas de la carte.
      const tooltip = tooltipRef.current;
      if (tooltip) {
        const offset = 14;
        const flipX = x + offset + 260 > container.clientWidth;
        const flipY = y + offset + 80 > container.clientHeight;
        tooltip.style.transform = [
          `translate(${x + (flipX ? -offset : offset)}px, ${y + (flipY ? -offset : offset)}px)`,
          `translate(${flipX ? "-100%" : "0"}, ${flipY ? "-100%" : "0"})`,
        ].join(" ");
      }
      setHoveredZone({ code, name: name ? String(name) : null, scaleKey });
    }, HOVER_DELAY_MS);
  }

  function onMouseLeave() {
    clearHover();
    setOverZone(false);
  }

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
      // Zone survolée : contour sombre fin, sous celui de la zone sélectionnée.
      {
        id: "hovered-border-layer",
        type: "line",
        source: source,
        "source-layer": sourceLayer,
        filter: ["==", ["get", idProperty], hoveredZone?.code ?? ""],
        paint: {
          "line-color": "#1f2937",
          "line-width": 1.5,
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
  }, [
    selectedZoneCode,
    hoveredZone?.code,
    displayMode,
    category,
    period,
    colorblindMode,
  ]);

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
      cursor={overZone ? "pointer" : undefined}
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
      <PollutionMapHoverTooltip
        ref={tooltipRef}
        zone={hoveredZone}
        displayMode={displayMode}
        category={category}
        period={period}
        colorblindMode={colorblindMode}
      />
      <AttributionControl compact={true} />
    </ReactMapGl>
  );
}
