"use client";

import { useEffect, JSX } from "react";
import { useMap, Marker } from "react-map-gl/maplibre";
import { MapPin } from "lucide-react";

type PollutionMapMarkerProps = {
  displayMode: "communes" | "udis";
  marker: {
    longitude: number;
    latitude: number;
    content?: JSX.Element;
  } | null;
  setSelectedZoneCode: (code: string | null) => void;
  onZoneDataChange: (
    data: Record<string, string | number | null> | null,
  ) => void;
};

export default function PollutionMapMarker({
  displayMode,
  marker,
  setSelectedZoneCode,
  onZoneDataChange,
}: PollutionMapMarkerProps) {
  const { map } = useMap();

  // Center the map on the marker
  useEffect(() => {
    if (marker && map) {
      map.flyTo({
        center: [marker.longitude, marker.latitude],
        zoom: Math.max(map.getZoom(), 8), // Ensure minimum zoom level
        duration: 1000,
      });
    }
  }, [marker, map]);

  useEffect(() => {
    if (!map || !marker) {
      onZoneDataChange(null);
      return;
    }

    const sourceName = displayMode === "communes" ? "communes" : "udis";
    const source = map.getSource(sourceName);

    if (!source) {
      console.log(`Source "${sourceName}" not found`);
      return;
    }

    // Function to query features at marker position
    const queryMarkerFeatures = () => {
      const point = map.project([marker.longitude, marker.latitude]);
      const features = map.queryRenderedFeatures(point, {
        layers: ["color-layer"],
      });

      if (features && features.length > 0) {
        onZoneDataChange(features[0].properties);
        setSelectedZoneCode(
          displayMode === "communes"
            ? features[0].properties["commune_code_insee"]
            : features[0].properties["cdreseau"],
        );
      } else {
        console.log("No features found at marker");
      }
    };

    // Check if source is already loaded
    if (map.isSourceLoaded(sourceName)) {
      queryMarkerFeatures();
    } else {
      // If not loaded, wait for it to load
      const sourceLoadHandler = () => {
        if (map.isSourceLoaded(sourceName)) {
          queryMarkerFeatures();
          // Remove the listener after successful query
          map.off("sourcedata", sourceLoadHandler);
        }
      };

      map.on("sourcedata", sourceLoadHandler);

      // Cleanup: remove listener if component unmounts before source loads
      return () => {
        map.off("sourcedata", sourceLoadHandler);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayMode, map, marker, setSelectedZoneCode]);

  if (!marker) {
    return null;
  }

  return (
    <Marker
      longitude={marker.longitude}
      latitude={marker.latitude}
      anchor="bottom"
    >
      <MapPin
        size={32}
        className="text-primary-foreground"
        strokeWidth={1}
        stroke="black"
        fill="white"
        color="white"
      />
    </Marker>
  );
}
