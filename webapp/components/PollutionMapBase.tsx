"use client";

import { useEffect, useMemo, useRef } from "react";
import ReactMapGl, {
  MapLayerMouseEvent,
  ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import maplibregl, { MapGeoJSONFeature } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";

import {
  MAPLIBRE_MAP,
  DEFAULT_MAP_STYLE,
  getDefaultLayers,
} from "@/app/config";

type PollutionMapBaseLayerProps = {
  year: string;
  categoryType: string;
  communeInseeCode: string | null;
  center?: [number, number];
  zoom?: number;
  onFeatureClick: (feature: MapGeoJSONFeature) => void;
  onViewportChange?: (center: [number, number], zoom: number) => void;
};

export default function PollutionMapBaseLayer({
  year,
  categoryType,
  communeInseeCode,
  center = MAPLIBRE_MAP.initialViewState.longitude
    ? ([
        MAPLIBRE_MAP.initialViewState.longitude,
        MAPLIBRE_MAP.initialViewState.latitude,
      ] as [number, number])
    : [2.213749, 46.227638],
  zoom = MAPLIBRE_MAP.initialViewState.zoom || 5,
  onFeatureClick,
  onViewportChange,
}: PollutionMapBaseLayerProps) {
  const mapRef = useRef(null);

  useEffect(() => {
    // adds the support for PMTiles
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  const propertyId = `resultat_${categoryType}_${year}`;

  function onClick(event: MapLayerMouseEvent) {
    if (event.features && event.features.length > 0) {
      console.log("Properties:", event.features[0].properties);
      onFeatureClick(event.features[0]);
    }
  }

  function handleViewStateChange(e: ViewStateChangeEvent) {
    if (e.viewState && onViewportChange) {
      const newCenter: [number, number] = [
        e.viewState.longitude,
        e.viewState.latitude,
      ];
      const newZoom = e.viewState.zoom;
      onViewportChange(newCenter, newZoom);
    }
  }

  const mapStyle = useMemo(() => {
    const dynamicLayers: maplibregl.LayerSpecification[] = [
      {
        id: "polluants",
        type: "fill",
        source: "polluants",
        "source-layer": "datacommunes",
        paint: {
          "fill-color": [
            "case",
            ["==", ["get", propertyId], "conforme"],
            "#00ff00", // Green for "conforme"
            ["==", ["get", propertyId], "non analysé"],
            "#808080", // Grey for "non analysé"
            ["==", ["get", propertyId], "non conforme"],
            "#ff0000", // Red for "non conforme"
            "#808080", // Default color (grey) for any other value
          ],
          "fill-opacity": 0.5,
        },
        // Ajout d'un filtre pour mettre en évidence la commune sélectionnée si présente
        ...(communeInseeCode
          ? {
              filter: ["==", ["get", "commune_code_insee"], communeInseeCode],
            }
          : {}),
      },
    ];

    return {
      ...DEFAULT_MAP_STYLE,
      layers: [...getDefaultLayers(), ...dynamicLayers],
    } as maplibregl.StyleSpecification;
  }, [propertyId, communeInseeCode]);

  return (
    <ReactMapGl
      style={{ width: "100%", height: "100%" }}
      mapStyle={mapStyle}
      longitude={center[0]}
      latitude={center[1]}
      zoom={zoom}
      mapLib={maplibregl}
      onClick={onClick}
      onMove={handleViewStateChange}
      interactiveLayerIds={["polluants"]}
      ref={mapRef}
    />
  );
}
