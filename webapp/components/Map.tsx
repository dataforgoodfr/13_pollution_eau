"use client";

import { useEffect, useRef } from "react";

import ReactMapGl from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useControls } from "leva";

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  // controls for demo only
  const { theme } = useControls({
    theme: {
      // Ref: https://geoservices.ign.fr/documentation/services/api-et-services-ogc/tuiles-vectorielles-tmswmts/styles
      options: [
        "standard",
        "attenue",
        "gris",
        "sans_toponymes",
        "typonymes",
        "accentue",
        "classique",
        "epure",
      ],
      value: "standard",
    },
  });

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://data.geopf.fr/annexes/ressources/vectorTiles/styles/PLAN.IGN/${theme}.json`, //Fond de carte
      center: [2.213749, 46.227638],
      zoom: 5,
    });

    return () => {
      map.current?.remove();
    };
  }, [theme]);

  return (
    <ReactMapGl
      style={{ width: "100%", height: "90vh" }}
      mapStyle={`https://data.geopf.fr/annexes/ressources/vectorTiles/styles/PLAN.IGN/${theme}.json`}
      mapLib={maplibregl}
    />
  );
}
