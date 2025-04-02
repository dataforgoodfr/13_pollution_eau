"use client";

import { useEffect, useMemo } from "react";
import ReactMapGl, {
  MapLayerMouseEvent,
  ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";

import { DEFAULT_MAP_STYLE, getDefaultLayers } from "@/app/config";

type PollutionMapBaseLayerProps = {
  period: string;
  categoryType: string;
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
  categoryType,
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

  const propertyId = `${period}_${categoryType}_resultat`;

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
          "fill-color": [
            "case",
            ["==", ["get", propertyId], "aucun_parametre_quantifie"],
            "#75D3B4",
            [
              "==",
              ["get", propertyId],
              "somme_20pfas_inf_0_1_et_4pfas_inf_0_02",
            ],
            "#B4E681",
            [
              "==",
              ["get", propertyId],
              "somme_20pfas_inf_0_1_et_4pfas_sup_0_02",
            ],
            "#EFE765",
            ["==", ["get", propertyId], "somme_20pfas_sup_0_1"],
            "#FBBD6C",
            "#808080", // Default color (grey) for any other value
          ],
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
          "fill-color": [
            "case",
            ["==", ["get", propertyId], "aucun_parametre_quantifie"],
            "#75D3B4",
            [
              "==",
              ["get", propertyId],
              "somme_20pfas_inf_0_1_et_4pfas_inf_0_02",
            ],
            "#B4E681",
            [
              "==",
              ["get", propertyId],
              "somme_20pfas_inf_0_1_et_4pfas_sup_0_02",
            ],
            "#EFE765",
            ["==", ["get", propertyId], "somme_20pfas_sup_0_1"],
            "#FBBD6C",
            "#808080", // Default color (grey) for any other value
          ],
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
  }, [propertyId, communeInseeCode, displayMode]);

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
