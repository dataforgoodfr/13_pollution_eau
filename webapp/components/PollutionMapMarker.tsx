"use client";

import { useEffect, useState, JSX } from "react";
import { getPropertyName } from "@/lib/property";
import { getCategoryById } from "@/lib/polluants";
import { useMap, Marker, Popup } from "react-map-gl/maplibre";
import { MapPin, X } from "lucide-react";

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
  const [showPopup, setShowPopup] = useState<boolean>(true);

  // Show popup when marker changes
  useEffect(() => {
    if (marker) {
      setShowPopup(true);
    }
  }, [marker]);

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

  console.log("Selected zone id:", code);

  const renderContent = () => {
    if (period === "dernier_prel") {
      // Rendering for "dernier_prel"

      const resultProperty = getPropertyName(period, category, "resultat");
      const resultValue =
        resultProperty in selectedZoneData
          ? selectedZoneData[resultProperty]
          : undefined;

      if (resultValue === undefined || !code) {
        return (
          <p className="text-sm text-gray-500">
            Aucune donnée disponible pour cette zone.
          </p>
        );
      }

      const categoryDetails = getCategoryById(category);
      const resultColor =
        categoryDetails?.resultats[resultValue as string]?.couleur ||
        categoryDetails?.resultats["non_recherche"]?.couleur ||
        "#333333";
      const resultLabel =
        categoryDetails?.resultats[resultValue as string]?.label ||
        categoryDetails?.resultats["non_recherche"]?.label ||
        "Résultat manquant";

      const values =
        selectedZoneData[
          getPropertyName(period, category, "parametres_detectes")
        ];
      const date =
        selectedZoneData[
          getPropertyName(period, category, "date_dernier_prel")
        ] || null;

      // Parse JSON values if they exist
      let parsedValues: Record<string, number> | null = null;
      if (values && typeof values === "string") {
        try {
          parsedValues = JSON.parse(values);
        } catch (error) {
          console.error("Error parsing parametres_detectes:", error);
        }
      }

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
          {date && (
            <p className="mb-2">
              Dernier prélèvement le{" "}
              {new Date(date.toString()).toLocaleDateString("fr-FR")}
            </p>
          )}
          {parsedValues && Object.keys(parsedValues).length > 0 && (
            <div className="space-y-1">
              <p className="font-medium">Paramètres détectés:</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {Object.entries(parsedValues).map(([param, value]) => (
                  <div key={param} className="flex justify-between">
                    <span className="font-medium">{param}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      );
    } else {
      // Rendering for "bilan_annuel"

      const ratioProp = getPropertyName(period, category, "ratio");
      const nbPrelevementsProp = getPropertyName(
        period,
        category,
        "nb_prelevements",
      );
      const nbSupValeurSanitaireProp = getPropertyName(
        period,
        category,
        "nb_sup_valeur_sanitaire",
      );

      const categoryDetails = getCategoryById(category);

      let resultColor = "#333333";
      let resultLabel = "Résultat manquant";
      if (
        selectedZoneData[nbPrelevementsProp] === 0 ||
        selectedZoneData[nbPrelevementsProp] === ""
      ) {
        resultColor =
          categoryDetails?.resultatsAnnuels?.nonRechercheCouleur || "#333333";
        resultLabel =
          categoryDetails?.resultatsAnnuels?.nonRechercheLabel ||
          "Résultat manquant";
      } else if (
        selectedZoneData[nbSupValeurSanitaireProp] !== null &&
        selectedZoneData[nbSupValeurSanitaireProp] !== undefined &&
        Number(selectedZoneData[nbSupValeurSanitaireProp]) > 0
      ) {
        resultColor =
          categoryDetails?.resultatsAnnuels?.valeurSanitaireCouleur ||
          "#333333";
        resultLabel =
          categoryDetails?.resultatsAnnuels?.valeurSanitaireLabel ||
          "Résultat manquant";
      } else if (
        selectedZoneData[ratioProp] !== null &&
        selectedZoneData[ratioProp] !== undefined
      ) {
        const ratioValue = selectedZoneData[ratioProp];
        if (ratioValue !== undefined && ratioValue !== null) {
          const ratioLimits =
            categoryDetails?.resultatsAnnuels?.ratioLimites || [];
          for (const limit of ratioLimits) {
            if (Number(ratioValue) <= limit.limite) {
              resultColor = limit.couleur;
              resultLabel = `${categoryDetails?.resultatsAnnuels?.ratioLabel}: ${(Number(ratioValue) * 100).toFixed(0)}%`;
              break;
            }
          }
        }
      }

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

          {selectedZoneData[nbPrelevementsProp] &&
            Number(selectedZoneData[nbPrelevementsProp]) > 0 && (
              <>
                <p className="">
                  {Number(selectedZoneData[nbPrelevementsProp]) === 1
                    ? "1 prélèvement dans l'année"
                    : `${selectedZoneData[nbPrelevementsProp]} prélèvements dans l'année`}
                </p>

                {categoryDetails?.resultatsAnnuels &&
                  "valeurSanitaireLabel" in categoryDetails.resultatsAnnuels &&
                  selectedZoneData[nbSupValeurSanitaireProp] !== null &&
                  selectedZoneData[nbSupValeurSanitaireProp] !== undefined && (
                    <p className="">
                      {Number(selectedZoneData[nbSupValeurSanitaireProp]) > 0
                        ? `${selectedZoneData[nbSupValeurSanitaireProp]} prélèvements avec des valeurs supérieures à la valeur sanitaire`
                        : "Aucun prélèvement avec des valeurs supérieures à la valeur sanitaire"}
                    </p>
                  )}
              </>
            )}
        </>
      );
    }
  };

  return (
    <>
      <Marker
        longitude={marker.longitude}
        latitude={marker.latitude}
        anchor="bottom"
        onClick={() => setShowPopup(true)}
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
      {showPopup && (
        <Popup
          longitude={marker.longitude}
          latitude={marker.latitude}
          anchor="bottom"
          className="-mt-5"
          closeButton={false}
          closeOnClick={false}
        >
          <div className="relative">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              aria-label="Close popup"
            >
              <X size={18} />
            </button>
            {marker.content && (
              <div className="mb-3 pb-3 border-b border-gray-200 pr-6">
                <span className="">{marker.content}</span>
                <br />
                <span className="opacity-35">
                  Cette adresse est désservie par une unité de distribution.
                </span>
              </div>
            )}

            <div className="space-y-2 pr-6">{renderContent()}</div>
          </div>
        </Popup>
      )}
    </>
  );
}
