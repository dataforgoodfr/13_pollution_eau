import { getCategoryById } from "./polluants";
import { getPropertyName } from "./property";

import type {
  DataDrivenPropertyValueSpecification,
  ColorSpecification,
} from "maplibre-gl";

/**
 * Generate the map color expression for MapLibre GL
 * This creates a "case" expression for use in map style
 * @returns A MapLibre GL expression for the fill-color property
 */
export function generateColorExpression(
  category: string,
  period: string,
): DataDrivenPropertyValueSpecification<ColorSpecification> {
  const cases = [];

  const defaultColor = "#9B9B9B"; // Default color for unmatched cases
  const categoryDetails = getCategoryById(category);

  if (!categoryDetails || !categoryDetails.resultats) {
    return defaultColor;
  }

  // dernier prélèvement specific logic
  if (period.startsWith("dernier_prel")) {
    const propertyId = getPropertyName(period, category, "resultat");
    Object.entries(categoryDetails.resultats).forEach(([value, detail]) => {
      cases.push(["==", ["get", propertyId], value]);

      // Check if the color is valid
      const color = detail.couleur || detail.couleurFond;
      const isValidColor = color && color.startsWith("#");

      cases.push(isValidColor ? color : defaultColor);
    });
  }
  // bilan annuel specific logic
  else if (period.startsWith("bilan_annuel")) {
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

    // Check if nb_prelevements is 0 or empty
    cases.push([
      "any",
      ["==", ["get", nbPrelevementsProp], ""],
      ["==", ["get", nbPrelevementsProp], 0],
    ]);
    cases.push(defaultColor); // Grey for no data/prelevements

    // Check if nb_sup_valeur_sanitaire is > 0 and not empty
    cases.push([
      "all",
      ["!=", ["get", nbSupValeurSanitaireProp], ""],
      ["==", ["typeof", ["get", nbSupValeurSanitaireProp]], "number"],
      [">", ["get", nbSupValeurSanitaireProp], 0],
    ]);
    cases.push("#E93E3A"); // Red for cases with sup_valeur_sanitaire

    // Color scale for ratio values between 0 and 1
    cases.push(["==", ["get", ratioProp], 0]);
    cases.push("#75D3B4"); // Green for ratio = 0

    cases.push(["<=", ["get", ratioProp], 0.5]);
    cases.push("#AECF00"); // Light green for ratio <= 0.5

    cases.push(["<=", ["get", ratioProp], 0.8]);
    cases.push("#FBBD6C"); // Orange for ratio <= 0.8

    cases.push(["<=", ["get", ratioProp], 1]);
    cases.push("#FB726C"); // Red for ratio <= 1
  }

  if (cases.length > 0) {
    const expression = ["case", ...cases, defaultColor];
    console.log("Expression:", expression);
    return expression as DataDrivenPropertyValueSpecification<ColorSpecification>;
  } else {
    // If no cases were added, return a default color
    return defaultColor; // Default color for unmatched cases
  }
}
