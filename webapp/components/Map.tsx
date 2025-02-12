"use client";

import { useEffect } from "react";

import ReactMapGl from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import layers from "protomaps-themes-base";
import { Leva, useControls } from "leva";

const SOURCE = "protomaps";

export default function Map() {
  // controls from Leva is a library for adding a GUI to help us try out different styles.
  // we're going to discard it once designers make a decision on the map style
  const {
    theme,
    language,
    customizeCountryBorders,
    countryBorderWidth,
    countryBorderColor,
    customizeRegionBorders,
    regionBorderWidth,
    regionBorderColor,
    regionDashline,
  } = useControls({
    theme: {
      options: ["light", "dark", "white", "grayscale", "black"],
      value: "white",
    },
    language: {
      options: ["en", "fr"],
      value: "fr",
    },
    // country
    customizeCountryBorders: {
      value: true,
    },
    countryBorderWidth: {
      value: 3,
      min: 1,
      max: 10,
      step: 1,
      render: (get) => get("customizeCountryBorders"),
    },
    countryBorderColor: "#bdb8b8",
    // region
    customizeRegionBorders: {
      value: true,
    },
    regionBorderWidth: {
      value: 2,
      min: 1,
      max: 8,
      step: 1,
      render: (get) => get("customizeRegionBorders"),
    },
    regionBorderColor: "#d7d7d7",
    regionDashline: {
      value: true,
      render: (get) => get("customizeRegionBorders"),
    },
  });

  useEffect(() => {
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  console.log('layers(SOURCE, "white", "en")', layers(SOURCE, "white", "en"));

  return (
    <>
      <ReactMapGl
        style={{ width: "100%", height: "90vh" }}
        mapStyle={{
          version: 8,
          glyphs:
            "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
          sprite:
            "https://protomaps.github.io/basemaps-assets/sprites/v4/light",
          sources: {
            protomaps: {
              type: "vector",
              maxzoom: 15,
              url: "https://api.protomaps.com/tiles/v4.json?key=707d8bc70b393fc0",
              attribution:
                '<a href="https://osm.org/copyright">© OpenStreetMap</a>',
            },
          },
          layers: [
            ...layers(SOURCE, theme, language).filter(
              (layer) =>
                ![
                  customizeCountryBorders ? "boundaries_country" : undefined,
                  customizeRegionBorders ? "places_region" : undefined,
                ].includes(layer.id),
            ),
            ...(customizeCountryBorders
              ? [
                  {
                    id: "boundaries_country",
                    type: "line",
                    source: SOURCE,
                    "source-layer": "boundaries",
                    filter: ["<=", "kind_detail", 2],
                    paint: {
                      "line-color": countryBorderColor,
                      "line-width": countryBorderWidth,
                    },
                  } satisfies maplibregl.LayerSpecification,
                ]
              : []),
            ...(customizeRegionBorders
              ? [
                  {
                    id: "places_region",
                    type: "line",
                    source: SOURCE,
                    "source-layer": "boundaries",
                    filter: ["==", "kind", "region"],
                    paint: {
                      "line-color": regionBorderColor,
                      "line-width": regionBorderWidth,
                      ...(regionDashline && { "line-dasharray": [2, 3] }),
                    },
                  } satisfies maplibregl.LayerSpecification,
                ]
              : []),
          ],
        }}
        initialViewState={{
          longitude: 2.213749,
          latitude: 46.227638,
          zoom: 5,
        }}
        mapLib={maplibregl}
      />
      {/* TODO: remove this once the design decision is made */}
      <Leva oneLineLabels />
    </>
  );
}
