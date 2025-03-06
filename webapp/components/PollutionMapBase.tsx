"use client";

import { useEffect, useMemo } from "react";
import ReactMapGl, { MapLayerMouseEvent } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import layers from "protomaps-themes-base";
import {
  MAPLIBRE_MAP,
  DEFAULT_MAP_STYLE,
  getDefaultLayers,
} from "@/app/config";

type PollutionMapBaseLayerProps = {
  year: string;
  categoryType: string;
  selectedCommune: any | null;
  onFeatureClick: (feature: any) => void;
};

export default function PollutionMapBaseLayer({
  year,
  categoryType,
  selectedCommune,
  onFeatureClick,
}: PollutionMapBaseLayerProps) {
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

  useEffect(() => {
    if (selectedCommune) {
      console.log("Should zoom to:", selectedCommune);
    }
  }, [selectedCommune]);

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
        ...(selectedCommune
          ? {
              filter: ["==", ["get", "code_insee"], selectedCommune.code_insee],
            }
          : {}),
      },
    ];

    return {
      ...DEFAULT_MAP_STYLE,
      layers: [...getDefaultLayers(), ...dynamicLayers],
    } as maplibregl.StyleSpecification;
  }, [propertyId, selectedCommune]);

  return (
    <ReactMapGl
      style={{ width: "100%", height: "100%" }}
      mapStyle={mapStyle}
      initialViewState={MAPLIBRE_MAP.initialViewState}
      mapLib={maplibregl}
      onClick={onClick}
      interactiveLayerIds={["polluants"]}
    />
  );
}
