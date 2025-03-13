"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  ZONE_GUADELOUPE,
  ZONE_GUYANE,
  ZONE_LAREUNION,
  ZONE_MARTINIQUE,
  ZONE_MAYOTTE,
  ZONE_METROPOLE,
  ZONE_NOZONE,
} from "./MapZoneSelector";

type PollutionMapBaseLayerProps = {
  year: string;
  categoryType: string;
  selectedCommune: any | null;
  onFeatureClick: (feature: any) => void;
  centerOnZone: number | null;
  resetZone: () => void;
};

export default function PollutionMapBaseLayer({
  year,
  categoryType,
  selectedCommune,
  onFeatureClick,
  centerOnZone,
  resetZone,
}: PollutionMapBaseLayerProps) {
  const [zone, setZone] = useState<number | null>(null);
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

  useEffect(() => {
    if (mapRef && centerOnZone !== ZONE_NOZONE) {
      setZone(centerOnZone);

      let newMapCenter: number[];
      let newZoomFactor: number;

      switch (centerOnZone) {
        case ZONE_GUADELOUPE:
          newMapCenter = [-61.5, 16.2];
          newZoomFactor = 9;
          break;
        case ZONE_LAREUNION:
          newMapCenter = [55.5, -21.2];
          newZoomFactor = 8;
          break;
        case ZONE_MARTINIQUE:
          newMapCenter = [-61, 14.7];
          newZoomFactor = 9;
          break;
        case ZONE_MAYOTTE:
          newMapCenter = [45, -12.75];
          newZoomFactor = 9;
          break;
        case ZONE_GUYANE:
          newMapCenter = [-52.7, 4.3];
          newZoomFactor = 6;
          break;
        case ZONE_METROPOLE:
        default:
          newMapCenter = [2.5, 46.2];
          newZoomFactor = 5;
          break;
      }

      if (mapRef.current && zone !== ZONE_NOZONE) {
        mapRef.current.flyTo({ center: newMapCenter, zoom: newZoomFactor });
      }
    }
  }, [mapRef, centerOnZone, zone]);

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

  function onMoveEnd(e: ViewStateChangeEvent): void {
    if (e.originalEvent) {
      setZone(ZONE_NOZONE);
      resetZone();
    }
  }

  return (
    <ReactMapGl
      style={{ width: "100%", height: "100%" }}
      mapStyle={mapStyle}
      initialViewState={MAPLIBRE_MAP.initialViewState}
      mapLib={maplibregl}
      onClick={onClick}
      onMoveEnd={onMoveEnd}
      interactiveLayerIds={["polluants"]}
      ref={mapRef}
    />
  );
}
