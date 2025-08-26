"use client";

import { useEffect, useState, JSX } from "react";
import { getPropertyName } from "@/lib/property";
import { getCategoryById, getAllEnabledCategories } from "@/lib/polluants";
import { getParameterName } from "@/lib/parameters";
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
  colorblindMode?: boolean;
};

export default function PollutionMapMarker({
  period,
  category,
  displayMode,
  marker,
  setSelectedZoneCode,
  colorblindMode = false,
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

  const errorColor = "#333333"; // Black color for unmatched cases
  const errorLabel = "Résultat manquant";

  const renderContent = () => {
    // Check if we have data for the selected zone
    if (
      (!("cdreseau" in selectedZoneData) &&
        !("commune_code_insee" in selectedZoneData)) ||
      code === undefined ||
      code === null
    ) {
      return (
        <p className="text-sm text-gray-500">
          Aucune donnée disponible pour cette zone.
        </p>
      );
    }

    if (period === "dernier_prel") {
      // Rendering for "dernier_prel"

      if (category === "tous") {
        // Special rendering for "tous" category - show global status and all categories

        // First show the global status for "tous"
        const globalResultProperty = getPropertyName(
          period,
          category,
          "resultat",
        );
        const globalResultValue =
          globalResultProperty in selectedZoneData
            ? selectedZoneData[globalResultProperty]
            : "non_recherche";

        const globalCategoryDetails = getCategoryById(category);
        const globalResultColor =
          globalCategoryDetails?.resultats[globalResultValue as string]?.[
            colorblindMode ? "couleurAlt" : "couleur"
          ] || errorColor;
        const globalResultLabel =
          globalCategoryDetails?.resultats[globalResultValue as string]
            ?.label || errorLabel;

        // Get all enabled categories
        const allCategories = getAllEnabledCategories();

        // Filter categories that should be displayed
        const categoriesToDisplay = allCategories.filter((cat) => {
          const resultProperty = getPropertyName(period, cat.id, "resultat");
          const resultValue =
            resultProperty in selectedZoneData
              ? selectedZoneData[resultProperty]
              : "non_recherche";

          // Only show if result is not "non_recherche" or "non_quantifie"
          // Also exclude nitrate when result is "inf_limite_qualite"
          return (
            resultValue !== "" &&
            resultValue !== "non_recherche" &&
            resultValue !== "non_quantifie" &&
            !(cat.id === "nitrate" && resultValue === "inf_limite_qualite")
          );
        });

        return (
          <>
            <p className="text-sm font-bold">{title}</p>

            {/* Global status */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: globalResultColor }}
              ></div>
              <span className="text-sm">{globalResultLabel}</span>
            </div>

            {/* All categories - only show if there are categories to display */}
            {categoriesToDisplay.length > 0 && (
              <div className="mt-3">
                <p className="font-medium mb-2 text-sm">Détail par polluant:</p>
                <div className="space-y-1 text-xs">
                  {categoriesToDisplay.map((cat) => {
                    const resultProperty = getPropertyName(
                      period,
                      cat.id,
                      "resultat",
                    );
                    const resultValue =
                      resultProperty in selectedZoneData
                        ? selectedZoneData[resultProperty]
                        : "non_recherche";

                    const resultColor =
                      cat?.resultats[resultValue as string]?.[
                        colorblindMode ? "couleurAlt" : "couleur"
                      ] || errorColor;
                    const resultLabel =
                      cat?.resultats[resultValue as string]?.label ||
                      errorLabel;

                    return (
                      <div key={cat.id} className="flex items-center gap-2">
                        <span className="font-medium">{cat.nomAffichage}:</span>
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: resultColor }}
                        ></div>
                        <span className="text-gray-600 leading-tight">
                          {resultLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        );
      }

      const resultProperty = getPropertyName(period, category, "resultat");
      const resultValue =
        resultProperty in selectedZoneData
          ? selectedZoneData[resultProperty]
          : "non_recherche";

      const categoryDetails = getCategoryById(category);
      const resultColor =
        categoryDetails?.resultats[resultValue as string]?.[
          colorblindMode ? "couleurAlt" : "couleur"
        ] || errorColor;
      const resultLabel =
        categoryDetails?.resultats[resultValue as string]?.label || errorLabel;

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
              Dernière analyse le{" "}
              {new Date(date.toString()).toLocaleDateString("fr-FR")}
            </p>
          )}
          {parsedValues && Object.keys(parsedValues).length > 0 && (
            <div className="mt-3">
              <p className="font-medium mb-2">Substances quantifiées:</p>
              <ul className="space-y-1">
                {Object.entries(parsedValues).map(([param, value]) => (
                  <li key={param} className="flex justify-between items-center">
                    <span className="font-light">
                      {getParameterName(param)}:
                    </span>
                    <span className="ml-2 font-light">
                      {value} {categoryDetails?.unite || ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      );
    } else {
      // Rendering for "bilan_annuel"

      const annee = period.split("_")[2];

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

      let resultColor = errorColor;
      let resultLabel = errorLabel;
      if (
        !(nbPrelevementsProp in selectedZoneData) ||
        selectedZoneData[nbPrelevementsProp] === 0
      ) {
        resultColor =
          categoryDetails?.resultatsAnnuels?.[
            colorblindMode ? "nonRechercheCouleurAlt" : "nonRechercheCouleur"
          ] || errorColor;
        resultLabel =
          categoryDetails?.resultatsAnnuels?.nonRechercheLabel || errorLabel;
      } else if (
        nbSupValeurSanitaireProp in selectedZoneData &&
        Number(selectedZoneData[nbSupValeurSanitaireProp]) > 0
      ) {
        resultColor =
          categoryDetails?.resultatsAnnuels?.[
            colorblindMode
              ? "valeurSanitaireCouleurAlt"
              : "valeurSanitaireCouleur"
          ] || errorColor;
        resultLabel =
          categoryDetails?.resultatsAnnuels?.valeurSanitaireLabel || errorLabel;
      } else if (ratioProp in selectedZoneData) {
        const ratioValue = selectedZoneData[ratioProp];
        if (ratioValue !== undefined && ratioValue !== null) {
          const ratioLimits =
            categoryDetails?.resultatsAnnuels?.ratioLimites || [];
          for (const limit of ratioLimits) {
            if (Number(ratioValue) <= limit.limite) {
              resultColor = colorblindMode ? limit.couleurAlt : limit.couleur;
              resultLabel = `${(Number(ratioValue) * 100).toFixed(0)}% des ${categoryDetails?.resultatsAnnuels?.ratioLabelPlural}`;
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
              <p>
                {Number(selectedZoneData[nbPrelevementsProp]) === 1
                  ? `1 analyse au total en ${annee}`
                  : `${selectedZoneData[nbPrelevementsProp]} analyses au total en ${annee}`}

                {selectedZoneData[ratioProp] !== null &&
                  selectedZoneData[ratioProp] !== undefined && (
                    <>
                      <br />
                      {Math.round(
                        Number(selectedZoneData[ratioProp]) *
                          Number(selectedZoneData[nbPrelevementsProp]),
                      )}{" "}
                      {Math.round(
                        Number(selectedZoneData[ratioProp]) *
                          Number(selectedZoneData[nbPrelevementsProp]),
                      ) > 1
                        ? categoryDetails?.resultatsAnnuels?.ratioLabelPlural
                        : categoryDetails?.resultatsAnnuels?.ratioLabelSingular}
                    </>
                  )}

                {categoryDetails?.resultatsAnnuels &&
                  "valeurSanitaireLabel" in categoryDetails.resultatsAnnuels &&
                  selectedZoneData[nbSupValeurSanitaireProp] !== null &&
                  selectedZoneData[nbSupValeurSanitaireProp] !== undefined && (
                    <>
                      <br />
                      {selectedZoneData[nbSupValeurSanitaireProp]}
                      {Number(selectedZoneData[nbSupValeurSanitaireProp]) > 1
                        ? " analyses dépassent "
                        : " analyse dépasse "}
                      la limite sanitaire
                    </>
                  )}
              </p>
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
