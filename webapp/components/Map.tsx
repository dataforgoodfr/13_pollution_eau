"use client";

import { useEffect } from "react";

import ReactMapGl from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import layers from "protomaps-themes-base";
import { MAPLIBRE_MAP } from "@/app/config";

const SOURCE = "protomaps";

export default function Map() {
  useEffect(() => {
    // adds the support for PMTiles
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

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
        },
        layers: [
          ...layers(
            SOURCE,
            MAPLIBRE_MAP.protomaps.theme,
            MAPLIBRE_MAP.protomaps.language,
          ).filter((layer) => !["boundaries_country"].includes(layer.id)),
          {
            id: "boundaries_country",
            type: "line",
            source: SOURCE,
            "source-layer": "boundaries",
            filter: ["<=", "kind_detail", 2],
            paint: {
              "line-color": MAPLIBRE_MAP.countryBorderColor,
              "line-width": MAPLIBRE_MAP.countryBorderWidth,
            },
          } satisfies maplibregl.LayerSpecification,
        ],
      }}
      initialViewState={MAPLIBRE_MAP.initialViewState}
      mapLib={maplibregl}
    />
  );
}
