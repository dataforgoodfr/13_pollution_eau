"use client";

import { useEffect, useState, JSX } from "react";
import { getPropertyName } from "@/lib/property";
import { getCategoryById } from "@/lib/polluants";
import { useMap, Marker, Popup } from "react-map-gl/maplibre";
import { MapPin } from "lucide-react";

type PollutionMapMarkerProps = {
  period: string;
  category: string;
  displayMode: "communes" | "udis";
  marker: {
    longitude: number;
    latitude: number;
    content?: JSX.Element;
  } | null;
  selectedZoneCode: string | null;
  setSelectedZoneCode: (code: string | null) => void;
};

export default function PollutionMapMarker({
  period,
  category,
  displayMode,
  marker,
  setSelectedZoneCode,
}: PollutionMapMarkerProps) {
  const { map } = useMap();
  const [selectedZoneData, setSelectedZoneData] = useState<Record<
    string,
    string | number | null
  > | null>(null);

  useEffect(() => {
    if (!map || !marker) return;

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
        console.log("Features at marker:", features[0].properties);
        setSelectedZoneData(features[0].properties);
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
  }, [displayMode, map, marker, setSelectedZoneCode]);

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
    categoryDetails?.resultats[value as string]?.couleur || "#9B9B9B";
  const resultLabel =
    categoryDetails?.resultats[value as string]?.label || "Aucune donnée";

  const renderContent = () => {
    if (period === "dernier_prel") {
      const realValue =
        selectedZoneData[
          getPropertyName(period, category, "dernier_prel_valeur")
        ];
      const date =
        selectedZoneData[
          getPropertyName(period, category, "dernier_prel_datetime")
        ] || null;

      return (
        <>
          <p className="text-sm font-bold">{title}</p>
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: resultColor }}
            ></div>
            <span className="">{resultLabel}</span>
          </div>
          {realValue && date ? (
            <p className="">
              Valeur: {realValue}
              <br />
              Date: {date}
            </p>
          ) : null}
        </>
      );
    } else {
      // bilan_annuel

      return (
        <>
          <p className="text-sm font-bold">{title}</p>
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: resultColor }}
            ></div>
            <span className="">{resultLabel}</span>
          </div>
          <p className="">
            {value && Number(value) ? (
              <>{Math.round(Number(value) * 100)}% des prélevements</>
            ) : null}
          </p>
        </>
      );
    }
  };

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
            <span className="">{marker.content}</span>
            <br />
            <span className="opacity-35">
              Cette adresse est désservie par une unité de distribution.
            </span>
          </div>
        )}

        <div className="space-y-2">
          {renderContent()}
          <p className="text-xs text-gray-600 pt-2">
            Code {displayMode === "communes" ? "Insee" : "réseau"}: {code}
          </p>
        </div>
      </Popup>
    </>
  );
}
