"use client";

import { useEffect } from "react";

import ReactMapGl, { MapLayerMouseEvent } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import layers from "protomaps-themes-base";
import { MAPLIBRE_MAP } from "@/app/config";

export default function Map() {
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
    }
  }

  return (
    <ReactMapGl
      style={{ width: "100%", height: "90vh" }}
      mapStyle={{
        version: 8,
        glyphs:
          "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
        sprite: "https://protomaps.github.io/basemaps-assets/sprites/v4/light",
        sources: {
          protomaps: {
            type: "vector",
            maxzoom: MAPLIBRE_MAP.protomaps.maxzoom,
            url: `https://api.protomaps.com/tiles/v4.json?key=${MAPLIBRE_MAP.protomaps.api_key}`,
            attribution:
              '<a href="https://osm.org/copyright">© OpenStreetMap</a>',
          },
          polluants: {
            type: "vector",
            url: "pmtiles://s3/upload/datacommunes.pmtiles",
          },
        },
        layers: [
          ...layers(
            "protomaps",
            MAPLIBRE_MAP.protomaps.theme,
            MAPLIBRE_MAP.protomaps.language,
          ).filter((layer) => !["boundaries_country"].includes(layer.id)),
          {
            id: "polluants",
            type: "fill",
            source: "polluants",
            "source-layer": "datacommunes",
            paint: {
              "fill-color": [
                "case",
                [">", ["to-number", ["get", "commune_code_insee"]], 30000],
                "#ff0000", // Red for commune_code_insee > 30000
                "#00ff00", // Green for commune_code_insee <= 30000
              ],
              "fill-opacity": 0.5,
            },
          },
        ],
      }}
      initialViewState={MAPLIBRE_MAP.initialViewState}
      mapLib={maplibregl}
      onClick={onClick}
      interactiveLayerIds={["polluants"]}
    />
  );
}
