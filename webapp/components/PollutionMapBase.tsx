"use client";

import { useEffect, useMemo, JSX } from "react";
import ReactMapGl, {
  MapLayerMouseEvent,
  Marker,
  Popup,
  ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import { generateColorExpression } from "@/lib/colorMapping";
import { MapPin } from "lucide-react";

import { DEFAULT_MAP_STYLE, getDefaultLayers } from "@/app/config";

type PollutionMapBaseLayerProps = {
  period: string;
  category: string;
  displayMode: "communes" | "udis";
  selectedZoneCode: string | null;
  mapState: { longitude: number; latitude: number; zoom: number };
  setDataPanel: (data: Record<string, string | number | null> | null) => void;
  onMapStateChange?: (coords: {
    longitude: number;
    latitude: number;
    zoom: number;
  }) => void;
  marker: {
    longitude: number;
    latitude: number;
    content: JSX.Element;
  } | null;
  setMarker: (
    marker: {
      longitude: number;
      latitude: number;
      content: JSX.Element;
    } | null,
  ) => void;
};

export default function PollutionMapBaseLayer({
  period,
  category,
  displayMode,
  selectedZoneCode,
  mapState,
  setDataPanel,
  onMapStateChange,
  marker,
  //setMarker,
}: PollutionMapBaseLayerProps) {
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
      console.log("zoom level:", mapState.zoom);
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
          "fill-color": generateColorExpression(category, period),
          "fill-opacity": 0.5,
        },
        layout: {
          visibility: displayMode === "communes" ? "visible" : "none",
        },
        ...(selectedZoneCode
          ? {
              filter: ["==", ["get", "commune_code_insee"], selectedZoneCode],
            }
          : {}),
      },
      {
        id: "udis-layer",
        type: "fill",
        source: "udis",
        "source-layer": "data_udi",
        paint: {
          "fill-color": generateColorExpression(category, period),
          "fill-opacity": 0.5,
        },
        layout: {
          visibility: displayMode === "udis" ? "visible" : "none",
        },
        // Filter for UDIs if applicable
        // ...(someUdiCode ? { filter: ["==", ["get", "udi_code"], someUdiCode] } : {}),
      },
      {
        id: "udis-border-layer",
        type: "line",
        source: "udis",
        "source-layer": "data_udi",
        paint: {
          "line-color": "#7F7F7F",
          "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            0.0, // At zoom level 0, line width is 0px
            6,
            0.0, // At zoom level 6, line width is 0px
            20,
            2.0, // At zoom level 20, line width is 2.0px
          ],
        },
        layout: {
          visibility: displayMode === "udis" ? "visible" : "none",
        },
      },
    ];

    return {
      ...DEFAULT_MAP_STYLE,
      layers: [...getDefaultLayers(), ...dynamicLayers],
    } as maplibregl.StyleSpecification;
  }, [selectedZoneCode, displayMode, category, period]);

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
    >
      {marker ? (
        <>
          <Marker longitude={marker.longitude} latitude={marker.latitude}>
            <MapPin
              size={32}
              className="text-primary-foreground"
              strokeWidth={1}
              stroke="black"
              fill="white"
              color="white"
            />
          </Marker>
          <Popup
            longitude={marker.longitude}
            latitude={marker.latitude}
            anchor="bottom"
            className="-mt-5"
            closeButton={false}
            closeOnClick={false}
          >
            <span className="font-bold ">{marker.content}</span>
            <br />
            <span className="opacity-35">
              Cette adresse est désservie par une unité de distribution.
            </span>
          </Popup>
        </>
      ) : null}
    </ReactMapGl>
  );
}
