"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, {
  GeoJSONSourceSpecification,
  LngLat,
  Map,
  MapMouseEvent,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import CommuneFilter, { CommuneType } from "./CommuneFilter";

const MAP_SOURCES_COMMUNES_GEOJSON = "CommuneData";
const MAP_LAYER_COMMUNES_DOTS = "CommunesDotsLayer";

const GeoJsonSpecs: GeoJSONSourceSpecification = {
  type: "geojson",
  data: { type: "FeatureCollection", features: [] },
  cluster: false,
};

export default function MainMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const Dlist: CommuneType[] = [];
  const MapDefaultCenter = useMemo(() => {
    return new LngLat(2.213749, 46.227638);
  }, []);
  const [CommunesBaseData, SetCommunesBaseData] = useState(null);
  const [FilterString, SetFilterString] = useState("");
  const [PopupObject, SetPopupObject] = useState(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/positron",
      center: MapDefaultCenter,
      zoom: 5,
    });

    map.current.on("load", () => {
      InitCommunesLayer(map.current as Map, SetPopupObject);
    });
    //map.current.on('sourcedata', (x)=>{console.log("SourceDataEvt",x)})
    return () => {
      map.current?.remove();
    };
  }, [map, MapDefaultCenter]);

  useEffect(() => {
    if (CommunesBaseData) {
      return;
    }

    const fetchData = async () => {
      const response = await fetch("/api/CommunesServer");
      const jsonData = await response.json();
      SetCommunesBaseData(jsonData);
      const Features = GetCommunesFeatures(jsonData, FilterString);

      GeoJsonSpecs.data.features = Features;
    };

    fetchData();
  }, [FilterString, CommunesBaseData]);

  useEffect(() => {
    if (!CommunesBaseData) {
      return;
    }
    const Features = GetCommunesFeatures(CommunesBaseData, FilterString);
    GeoJsonSpecs.data.features = Features;
    const Src = map.current.getSource(MAP_SOURCES_COMMUNES_GEOJSON);
    if (Src) {
      Src.setData(GeoJsonSpecs.data);
    } else {
      map.current?.addSource(MAP_SOURCES_COMMUNES_GEOJSON, GeoJsonSpecs);
    }
  }, [FilterString, CommunesBaseData]);

  function UpdateDisplatedCommunes(CList: CommuneType[], FString: string) {
    SetFilterString(FString);
  }

  return (
    <div className="grid gap-2">
      <CommuneFilter className="grid grid-cols-4 sm:grid-cols-1 p-1" />
      <div
        ref={mapContainer}
        className="w-full h-[calc(100vh-8rem)] grid-cols-12"
      />
    </div>
  );
}

function InitCommunesLayer(_map: maplibregl.Map, SetPopupObjectFn) {
  console.log("Initing Map", _map);

  const src = _map.getSource(MAP_SOURCES_COMMUNES_GEOJSON);

  if (!src) {
    _map.addSource(MAP_SOURCES_COMMUNES_GEOJSON, GeoJsonSpecs);
  }
  _map.addLayer({
    id: MAP_LAYER_COMMUNES_DOTS,
    type: "circle",
    source: MAP_SOURCES_COMMUNES_GEOJSON,
    //filter: ['!', ['has', 'point_count']],
    paint: {
      "circle-color": "#11b4da",
      "circle-radius": ["get", "radius"],
      "circle-stroke-width": 0.5,
      "circle-stroke-color": "#fff",
    },
  });

  // Create a popup, but don't add it to the map yet.
  const popup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
  });
  //SetPopupObjectFn(popup)

  _map.on("mouseenter", MAP_LAYER_COMMUNES_DOTS, (e: MapMouseEvent) => {
    // Change the cursor style as a UI indicator.
    _map.getCanvas().style.cursor = "pointer";

    const coordinates = e.features[0].geometry.coordinates.slice();
    const description = e.features[0].properties.nom;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    // Populate the popup and set its coordinates
    // based on the feature found.
    popup.setLngLat(coordinates).setHTML(description).addTo(_map);
  });

  _map.on("mouseleave", MAP_LAYER_COMMUNES_DOTS, () => {
    _map.getCanvas().style.cursor = "";
    popup.remove();
  });
}
function GetCommunesFeatures(jsonData: CommuneType[], FilterString: string) {
  return jsonData.map((x) => {
    return CommuneType2GeoJSON(x, FilterString);
  });
}

function CommuneType2GeoJSON(C: CommuneType, FilterString: string) {
  const Coords = C._geopoint.split(",").map(parseFloat);
  const RetValue = {
    type: "symbol",
    properties: {
      id: C.INSEE,
      nom: C.nom,
      selected:
        FilterString !== "" && C.nom.includes(FilterString?.toUpperCase()),
      radius: 3,
    },
    geometry: {
      type: "Point",
      coordinates: [Coords[1], Coords[0]],
    },
  };
  RetValue.properties.radius = RetValue.properties.selected ? 8 : 3;
  return RetValue;
}
