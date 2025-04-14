"use client";

import { useEffect, useState, JSX } from "react";
import { getPropertyName } from "@/lib/property";
import { getCategoryById } from "@/lib/polluants";
import { useMap, Marker, Popup } from "react-map-gl/maplibre";
import { MapPin } from "lucide-react";

type PollutionMapMarkerProps = {
  // selectedZoneData: Record<string, string | number | null> | null;
  period?: string;
  category?: string;
  displayMode?: "communes" | "udis";
  marker: {
    longitude: number;
    latitude: number;
    content?: JSX.Element;
  } | null;
};

export default function PollutionMapMarker({
  // selectedZoneData,
  period = "dernier_prel",
  category = "tous-polluants",
  displayMode = "udis",
  marker,
}: PollutionMapMarkerProps) {
  const { map } = useMap();
  const [selectedZoneData, setSelectedZoneData] = useState<Record<
    string,
    string | number | null
  > | null>(null);

  useEffect(() => {
    function queryFeaturesAtPoint(lng: number, lat: number) {
      if (map) {
        const features = map.queryRenderedFeatures(map.project([lng, lat]), {
          layers: ["color-layer"],
        });
        if (features && features.length > 0) {
          console.log("Features at marker position:", features[0].properties);
          return features[0].properties;
        }
      }
    }
    if (map && marker) {
      const properties = queryFeaturesAtPoint(
        marker.longitude,
        marker.latitude,
      );
      console.log("Queried properties:", properties);
      if (properties) setSelectedZoneData(properties);
    }
  }, [map, marker]);

  if (!marker || !selectedZoneData) {
    return null;
  }

  const title =
    displayMode === "communes"
      ? selectedZoneData["commune_nom"]
      : selectedZoneData["nomreseaux"];

  const code =
    displayMode === "communes"
      ? selectedZoneData["commune_code_insee"]
      : selectedZoneData["cdreseau"];

  const property = getPropertyName(
    period,
    category,
    period === "dernier_prel" ? "resultat" : "ratio",
  );

  const value = selectedZoneData[property] || null;

  const categoryDetails = getCategoryById(category);
  const resultColor =
    categoryDetails?.resultats[value as string]?.couleur || "#dddddd";
  const resultLabel =
    categoryDetails?.resultats[value as string]?.label || "Aucune donnée";

  return (
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
        {marker.content && (
          <div className="mb-3 pb-3 border-b border-gray-200">
            <span className="font-bold ">{marker.content}</span>
            <br />
            <span className="opacity-35">
              Cette adresse est désservie par une unité de distribution.
            </span>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: resultColor }}
            ></div>
            <span className="text-sm font-medium">{resultLabel}</span>
          </div>

          <p className="text-xs text-gray-600">
            <span className="font-medium">Code:</span> {code}
            {title && <span> - {title}</span>}
          </p>
        </div>
      </Popup>
    </>
  );
}
