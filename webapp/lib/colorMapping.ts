import { getCategoryById } from "./polluants";
import { getPropertyName } from "./property";

import type {
  DataDrivenPropertyValueSpecification,
  ColorSpecification,
} from "maplibre-gl";

/**
 * Generates a color expression for MapLibre GL based on data from pmtiles.
 *
 * Creates a case-based expression that maps different pollution values to specific colors
 * for rendering on the map. Handles both "dernier_prelevement" and "bilan_annuel" data periods.
 *
 * Returns a MapLibre GL expression for the fill-color property
 *
 * MapLibre expressions documentation : https://maplibre.org/maplibre-style-spec/expressions/
 */
export function generateColorExpression(
  category: string,
  period: string,
): DataDrivenPropertyValueSpecification<ColorSpecification> {
  const cases = [];

  const defaultColor = "#9B9B9B"; // Default color for unmatched cases
  const categoryDetails = getCategoryById(category);

  if (!categoryDetails) {
    return defaultColor;
  }

  // Check if we have no data for this zone (when either cdreseau or commune_code_insee exists but is empty)
  // If yes, set the color to transparent to hide these zones on the map
  cases.push([
    "any",
    ["all", ["has", "cdreseau"], ["==", ["get", "cdreseau"], ""]],
    [
      "all",
      ["has", "commune_code_insee"],
      ["==", ["get", "commune_code_insee"], ""],
    ],
  ]);
  cases.push("transparent"); // Transparent for no data

  // dernier prélèvement specific logic
  if (period.startsWith("dernier_prel")) {
    const resultatProp = getPropertyName(period, category, "resultat");
    Object.entries(categoryDetails.resultats).forEach(([value, detail]) => {
      // the value "non_recherche" is actually an empty string so we set a special case for it
      if (value === "non_recherche") {
        cases.push(["==", ["get", resultatProp], ""]);
      } else {
        cases.push(["==", ["get", resultatProp], value]);
      }

      // Check if the color is valid
      const color = detail.couleur || detail.couleurFond;
      const isValidColor = color && color.startsWith("#");

      cases.push(isValidColor ? color : defaultColor);
    });
  }
  // bilan annuel specific logic
  else if (period.startsWith("bilan_annuel")) {
    if (!categoryDetails.resultatsAnnuels) {
      return defaultColor;
    }

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

    // Check if nb_prelevements is 0 or empty (no research), or ratio is empty
    cases.push([
      "any",
      ["==", ["get", nbPrelevementsProp], ""],
      ["==", ["get", nbPrelevementsProp], 0],
      ["==", ["get", ratioProp], ""],
    ]);
    cases.push(categoryDetails.resultatsAnnuels.nonRechercheCouleur);

    // Check if nb_sup_valeur_sanitaire is > 0 and not empty
    if (
      categoryDetails.resultatsAnnuels.valeurSanitaire &&
      categoryDetails.resultatsAnnuels.valeurSanitaireCouleur
    ) {
      cases.push([
        "all",
        ["!=", ["get", nbSupValeurSanitaireProp], ""],
        ["==", ["typeof", ["get", nbSupValeurSanitaireProp]], "number"],
        [">", ["get", nbSupValeurSanitaireProp], 0],
      ]);
      cases.push(categoryDetails.resultatsAnnuels.valeurSanitaireCouleur);
    }

    // Color scale for ratio values using ratioLimites
    categoryDetails.resultatsAnnuels.ratioLimites.forEach((l) => {
      cases.push(["<=", ["get", ratioProp], l.limite]);
      cases.push(l.couleur);
    });
  }

  if (cases.length > 0) {
    const expression = ["case", ...cases, "#333333"]; // black for unmatched cases
    console.log("Expression:", expression);
    return expression as DataDrivenPropertyValueSpecification<ColorSpecification>;
  } else {
    // If no cases were added, return a default color
    return defaultColor; // Default color for unmatched cases
  }
}
