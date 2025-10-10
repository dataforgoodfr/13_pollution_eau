"use client";

import { useEffect, useState, JSX } from "react";
import { getPropertyName } from "@/lib/property";
import { getCategoryById } from "@/lib/polluants";
import { useMap, Marker, Popup } from "react-map-gl/maplibre";
import { MapPin, X, ChevronDown, ChevronUp } from "lucide-react";
import type { ParameterValues } from "@/app/lib/data";

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
  parameterValues: ParameterValues;
};

const getParameterName = (
  paramCode: string,
  parameterValues: ParameterValues,
): string => {
  return parameterValues[paramCode]?.web_label || paramCode;
};

const getParameterColor = (
  paramCode: string,
  value: number,
  parameterValues: ParameterValues,
  category: string,
): string | null => {
  const paramRef = parameterValues[paramCode];
  if (!paramRef) return null;

  // Special case for non-pertinent pesticides to by pass limite_indicative in "pesticide" category
  if (category === "pesticide" && paramRef.categorie_3 === "non_pertinent") {
    return null;
  }

  // Check in order of severity (most severe first)
  if (
    paramRef.valeur_sanitaire_1 !== null &&
    value > paramRef.valeur_sanitaire_1
  ) {
    return "#f03b20"; // Red
  }
  if (paramRef.limite_qualite !== null && value > paramRef.limite_qualite) {
    return "#fe9929"; // Orange
  }
  if (
    paramRef.limite_indicative !== null &&
    value > paramRef.limite_indicative
  ) {
    return "#FDC70C"; // Yellow
  }

  return null; // No color if below all limits
};

// Group parameters by category for pesticides
const groupParametersByCategory = (
  parsedValues: Record<string, number>,
  parameterValues: ParameterValues,
): Record<
  string,
  { label: string; params: Array<{ code: string; value: number }> }
> => {
  const groups: Record<
    string,
    { label: string; params: Array<{ code: string; value: number }> }
  > = {
    other: { label: "Totaux", params: [] },
    sub_active: { label: "Substances actives", params: [] },
    metabolite_pertinent: { label: "Métabolites pertinents", params: [] },
    metabolite_non_pertinent: {
      label: "Métabolites non pertinents",
      params: [],
    },
  };

  Object.entries(parsedValues).forEach(([code, value]) => {
    const param = parameterValues[code];
    if (!param) {
      groups.other.params.push({ code, value });
      return;
    }

    if (param.categorie_2 === "sub_active") {
      groups.sub_active.params.push({ code, value });
    } else if (param.categorie_2 === "metabolite") {
      if (
        param.categorie_3 === "pertinent" ||
        param.categorie_3 === "pertinent_par_defaut"
      ) {
        groups.metabolite_pertinent.params.push({ code, value });
      } else if (param.categorie_3 === "non_pertinent") {
        groups.metabolite_non_pertinent.params.push({ code, value });
      } else {
        groups.other.params.push({ code, value });
      }
    } else {
      groups.other.params.push({ code, value });
    }
  });

  // Sort params within each group by value (descending)
  Object.values(groups).forEach((group) => {
    group.params.sort((a, b) => b.value - a.value);
  });

  return groups;
};

const getGlobalLastPrelevementResults = (
  selectedZoneData: Record<string, string | number | null>,
) => {
  // Categories to display in details
  const displayCategories = [
    "pfas",
    "pesticide",
    "nitrate",
    "cvm",
    "sub_indus_perchlorate",
    // "sub_indus_14dioxane",
    // "metaux_lourds_as",
    // "metaux_lourds_pb",
  ];

  const nonConforme: string[] = [];
  const deconseille: string[] = [];
  const quantifie: string[] = [];

  displayCategories.forEach((catId) => {
    const resultProperty = getPropertyName("dernier_prel", catId, "resultat");
    const dateProperty = getPropertyName(
      "dernier_prel",
      catId,
      "date_dernier_prel",
    );

    const resultValue = selectedZoneData[resultProperty];
    const dateValue = selectedZoneData[dateProperty];

    if (
      !resultValue ||
      resultValue === "non_recherche" ||
      resultValue === "non_quantifie"
    ) {
      return;
    }

    const categoryDetails = getCategoryById(catId);
    if (!categoryDetails) return;

    const categoryName = categoryDetails.nomAffichage;
    const dateStr = dateValue
      ? new Date(dateValue.toString()).toLocaleDateString("fr-FR")
      : "";
    const displayText = dateStr
      ? `${categoryName} (le ${dateStr})`
      : categoryName;

    // Add to nonConforme list if applicable
    if (
      resultValue === "sup_limite_qualite" ||
      resultValue === "somme_20pfas_sup_0_1" ||
      (catId === "nitrate" && resultValue === "sup_valeur_sanitaire") ||
      resultValue === "cvm_sup_0_5"
    ) {
      nonConforme.push(displayText);
    }

    // Add to deconseille list if applicable
    if (
      resultValue === "sup_valeur_sanitaire" ||
      resultValue === "sup_valeur_sanitaire_2" ||
      resultValue === "cvm_sup_0_5"
    ) {
      deconseille.push(displayText);
    }

    // Add to quantifie list if applicable
    if (
      resultValue === "inf_valeur_sanitaire" ||
      resultValue === "inf_limite_qualite" ||
      resultValue === "inf_limites" ||
      resultValue === "somme_20pfas_inf_0_1_et_4pfas_sup_0_02" ||
      resultValue === "somme_20pfas_inf_0_1_et_4pfas_inf_0_02" ||
      resultValue === "sup_limite_qualite_2036" ||
      resultValue === "no3_inf_25" ||
      resultValue === "no3_inf_40"
    ) {
      quantifie.push(displayText);
    }
  });

  return { nonConforme, deconseille, quantifie };
};

const getGlobalAnnualResults = (
  selectedZoneData: Record<string, string | number | null>,
  period: string,
) => {
  // Categories to display in details
  const displayCategories = [
    "pfas",
    "pesticide",
    "nitrate",
    "cvm",
    "sub_indus_perchlorate",
    // "sub_indus_14dioxane",
    // "metaux_lourds_as",
    // "metaux_lourds_pb",
  ];

  const nonConformeDetails: string[] = [];

  displayCategories.forEach((catId) => {
    const nbPrelevementsProp = getPropertyName(
      period,
      catId,
      "nb_prelevements",
    );
    const ratioProp = getPropertyName(period, catId, "ratio");
    const nbPrelevements = selectedZoneData[nbPrelevementsProp];
    const ratio = selectedZoneData[ratioProp];

    const categoryDetails = getCategoryById(catId);
    if (!categoryDetails) return;

    const categoryName = categoryDetails.nomAffichage;

    if (!nbPrelevements || Number(nbPrelevements) === 0) {
      nonConformeDetails.push(`${categoryName}: aucune recherche`);
      return;
    }
    const label =
      categoryDetails.resultatsAnnuels?.ratioLabelPlural
        .replace("analyses ", "")
        .replace("*", "") || "non conformes";

    if (ratio !== null && ratio !== undefined) {
      const percentageNonConforme = Math.round(Number(ratio) * 100);
      nonConformeDetails.push(
        `${categoryName}: ${percentageNonConforme}% ${label}`,
      );
    }
  });

  return { nonConformeDetails };
};

export default function PollutionMapMarker({
  period,
  category,
  displayMode,
  marker,
  setSelectedZoneCode,
  colorblindMode = false,
  parameterValues,
}: PollutionMapMarkerProps) {
  const { map } = useMap();
  const [selectedZoneData, setSelectedZoneData] = useState<Record<
    string,
    string | number | null
  > | null>(null);
  const [showPopup, setShowPopup] = useState<boolean>(true);
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});

  // Show popup when marker changes and center map on marker
  useEffect(() => {
    if (marker && map) {
      setShowPopup(true);
      // Center the map on the marker with vertical offset
      const mapContainer = map.getContainer();
      const mapHeight = mapContainer.offsetHeight;
      const offsetY = mapHeight * 0.1; // 60% from top -> 10% offset from center

      map.flyTo({
        center: [marker.longitude, marker.latitude],
        zoom: Math.max(map.getZoom(), 8), // Ensure minimum zoom level
        duration: 1000,
        offset: [0, offsetY],
      });
    }
  }, [marker, map]);

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
        <p className="text-gray-500">
          Aucune donnée disponible pour cette zone.
        </p>
      );
    }

    if (period === "dernier_prel") {
      // Rendering for "dernier_prel"

      if (category === "tous") {
        // Special rendering for "tous" category - show global status and detailed breakdown

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

        // Get detailed breakdown
        const { nonConforme, deconseille, quantifie } =
          getGlobalLastPrelevementResults(selectedZoneData);

        return (
          <>
            <p className=" font-bold">{title}</p>

            {/* Global status */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: globalResultColor }}
              ></div>
              <span className="">{globalResultLabel}</span>
            </div>

            {/* Detailed breakdown */}
            {(nonConforme.length > 0 ||
              deconseille.length > 0 ||
              quantifie.length > 0) && (
              <div className="mt-3 space-y-3 text-xs">
                {/* Déconseillé section */}
                {deconseille.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">
                      Eau déconseillée à la consommation pour toute ou partie de
                      la population en raison de la présence de:
                    </p>
                    <ul className="space-y-1 pl-2">
                      {deconseille.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">-</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Non conforme section */}
                {nonConforme.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">
                      Eau non conforme aux limites réglementaires pour:
                    </p>
                    <ul className="space-y-1 pl-2">
                      {nonConforme.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">-</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Quantifié section */}
                {quantifie.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">
                      Substances quantifiés sans dépassement des limites:
                    </p>
                    <ul className="space-y-1 pl-2">
                      {quantifie.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">-</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
          <p className="font-bold">{title}</p>
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: resultColor }}
            ></div>
            <span className="">{resultLabel}</span>
          </div>
          {date && (
            <p className="mb-2 text-xs">
              Dernière analyse le{" "}
              {new Date(date.toString()).toLocaleDateString("fr-FR")}
            </p>
          )}
          {parsedValues && Object.keys(parsedValues).length > 0 && (
            <div className="mt-3 text-xs">
              <p className="font-medium mb-2">Substances quantifiées:</p>
              {category === "pesticide" || category == "metabolite" ? (
                // Grouped display for pesticides
                <div className="space-y-3 max-h-60 overflow-y-scroll">
                  {Object.entries(
                    groupParametersByCategory(parsedValues, parameterValues),
                  ).map(([groupKey, group]) => {
                    if (group.params.length === 0) return null;

                    const isCollapsed = collapsedSections[groupKey] !== false;
                    const toggleCollapse = () => {
                      setCollapsedSections((prev) => ({
                        ...prev,
                        [groupKey]: prev[groupKey] === false ? true : false,
                      }));
                    };

                    // Find the worst (most severe) color among substances in this group
                    let worstColor: string | null = null;
                    const colorPriority = {
                      "#f03b20": 3, // Red - highest priority
                      "#fe9929": 2, // Orange
                      "#FDC70C": 1, // Yellow
                    };

                    group.params.forEach(({ code, value }) => {
                      const color = getParameterColor(
                        code,
                        value,
                        parameterValues,
                        category,
                      );
                      if (color) {
                        const currentPriority =
                          colorPriority[color as keyof typeof colorPriority] ||
                          0;
                        const worstPriority = worstColor
                          ? colorPriority[
                              worstColor as keyof typeof colorPriority
                            ] || 0
                          : 0;
                        if (currentPriority > worstPriority) {
                          worstColor = color;
                        }
                      }
                    });

                    return (
                      <div
                        key={groupKey}
                        className="border-l-2 border-gray-200 pl-2"
                      >
                        <button
                          onClick={toggleCollapse}
                          className="flex items-center justify-between w-full mb-2 text-left hover:bg-gray-50 -ml-2 pl-2 py-1 rounded"
                        >
                          <span
                            className="text-[10px] uppercase tracking-wide font-semibold"
                            style={{ color: worstColor || "#6b7280" }}
                          >
                            {group.label} ({group.params.length})
                          </span>
                          {isCollapsed ? (
                            <ChevronDown size={14} className="text-gray-400" />
                          ) : (
                            <ChevronUp size={14} className="text-gray-400" />
                          )}
                        </button>
                        {!isCollapsed && (
                          <ul className="space-y-2 mt-1">
                            {group.params.map(({ code, value }) => {
                              const color = getParameterColor(
                                code,
                                value,
                                parameterValues,
                                category,
                              );
                              const baseName =
                                parameterValues[code]?.web_label || code;
                              return (
                                <li
                                  key={code}
                                  className="flex justify-between items-start gap-2"
                                >
                                  <span
                                    className="font-light text-xs flex-1"
                                    style={color ? { color } : undefined}
                                  >
                                    {baseName}:
                                  </span>
                                  <span
                                    className="font-light whitespace-nowrap font-numbers text-xs"
                                    style={color ? { color } : undefined}
                                  >
                                    {value} {categoryDetails?.unite || ""}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Simple list for non-pesticide categories
                <ul className="space-y-1 max-h-60 overflow-y-scroll border-l-2 border-gray-200 pl-2">
                  {Object.entries(parsedValues)
                    .sort(
                      ([, valueA], [, valueB]) =>
                        Number(valueB) - Number(valueA),
                    )
                    .map(([param, value]) => {
                      const color = getParameterColor(
                        param,
                        Number(value),
                        parameterValues,
                        category,
                      );
                      return (
                        <li
                          key={param}
                          className="flex justify-between items-center gap-2"
                        >
                          <span
                            className="font-light"
                            style={color ? { color } : undefined}
                          >
                            {getParameterName(param, parameterValues)}:
                          </span>
                          <span
                            className="font-light whitespace-nowrap font-numbers"
                            style={color ? { color } : undefined}
                          >
                            {value} {categoryDetails?.unite || ""}
                          </span>
                        </li>
                      );
                    })}
                </ul>
              )}
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

      // Get parametres_detectes for annual data
      const parametresDetectesProp = getPropertyName(
        period,
        category,
        "parametres_detectes",
      );
      const parametresDetectesValue = selectedZoneData[parametresDetectesProp];

      // Parse JSON values if they exist
      let parsedMaxValues: Record<string, number> | null = null;
      if (
        parametresDetectesValue &&
        typeof parametresDetectesValue === "string"
      ) {
        try {
          parsedMaxValues = JSON.parse(parametresDetectesValue);
        } catch (error) {
          console.error(
            "Error parsing parametres_detectes for annual data:",
            error,
          );
        }
      }

      let resultColor = errorColor;
      let resultLabel = errorLabel;
      const ratioValue = selectedZoneData[ratioProp];
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
      } else if (ratioValue !== undefined && ratioValue !== null) {
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

      // Get detailed breakdown for annual data
      const { nonConformeDetails } = getGlobalAnnualResults(
        selectedZoneData,
        period,
      );

      return (
        <>
          <p className="font-bold">{title}</p>
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: resultColor }}
            ></div>
            <span className="">{resultLabel}</span>
          </div>

          {selectedZoneData[nbPrelevementsProp] &&
            Number(selectedZoneData[nbPrelevementsProp]) > 0 && (
              <p className="text-xs">
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
                      {categoryDetails.resultatsAnnuels.valeurSanitaireLabel}
                    </>
                  )}
              </p>
            )}

          {category != "tous" &&
            parsedMaxValues &&
            Object.keys(parsedMaxValues).length > 0 && (
              <div className="mt-3 text-xs">
                <p className="font-medium mb-2">
                  Concentration maximale retrouvée en {annee} :
                </p>
                <ul className="space-y-1 border-l-2 border-gray-200 pl-2">
                  {Object.entries(parsedMaxValues).map(([param, value]) => {
                    const color = getParameterColor(
                      param,
                      Number(value),
                      parameterValues,
                      category,
                    );
                    return (
                      <li
                        key={param}
                        className="flex justify-between items-center gap-2"
                      >
                        <span
                          className="font-light"
                          style={color ? { color } : undefined}
                        >
                          {getParameterName(param, parameterValues)}:
                        </span>
                        <span
                          className="font-light whitespace-nowrap font-numbers"
                          style={color ? { color } : undefined}
                        >
                          {value} {categoryDetails?.unite || ""}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

          {category === "tous" && nonConformeDetails.length > 0 && (
            <div className="mt-3 space-y-3 text-xs">
              <div>
                <p className="font-medium mb-2">Détail par catégorie :</p>
                <ul className="space-y-1 pl-2">
                  {nonConformeDetails.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">-</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
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
        onClick={() => {
          setShowPopup(true);
        }}
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
          className="-mt-5 !z-[15]"
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
                <span className="italic">{marker.content}</span>
                {/* <br />
                <span className="opacity-35">
                  Cette adresse est désservie par une unité de distribution.
                </span> */}
              </div>
            )}

            <div className="space-y-2 text-sm">{renderContent()}</div>
          </div>
        </Popup>
      )}
    </>
  );
}
