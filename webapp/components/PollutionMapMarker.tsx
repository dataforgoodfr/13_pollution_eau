"use client";

import { useEffect, useRef } from "react";
import { useMap, Marker } from "react-map-gl/maplibre";
import { MapPin } from "lucide-react";
import { frameZone, getMapInsets } from "@/lib/zoneFraming";

type PollutionMapMarkerProps = {
  displayMode: "communes" | "udis";
  marker: {
    longitude: number;
    latitude: number;
  } | null;
  setSelectedZoneCode: (code: string | null) => void;
  rightPanelOpen: boolean;
};

export default function PollutionMapMarker({
  displayMode,
  marker,
  setSelectedZoneCode,
  rightPanelOpen,
}: PollutionMapMarkerProps) {
  const { map } = useMap();

  // Lu via une ref : ouvrir/fermer les réglages ne doit pas relancer la
  // recherche de zone ci-dessous (qui rouvrirait le panneau de zone).
  const rightPanelOpenRef = useRef(rightPanelOpen);
  useEffect(() => {
    rightPanelOpenRef.current = rightPanelOpen;
  }, [rightPanelOpen]);

  useEffect(() => {
    if (!map || !marker) {
      setSelectedZoneCode(null);
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

      const code =
        features?.[0]?.properties[
          displayMode === "communes" ? "commune_code_insee" : "cdreseau"
        ];
      if (code !== undefined && code !== null) {
        // Zone trouvée sous l'adresse : on la sélectionne et on cadre la carte
        // dessus.
        setSelectedZoneCode(String(code));
        frameZone(map.getMap(), displayMode, String(code), {
          insets: getMapInsets(rightPanelOpenRef.current),
          anchor: [marker.longitude, marker.latitude],
          allowZoomOut: true,
        });
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
