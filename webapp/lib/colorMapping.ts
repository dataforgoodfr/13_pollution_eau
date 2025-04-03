import { resultatsDetails } from "./resultats";
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

  const defaultColor = "#cccccc"; // Default color for unmatched cases

  // dernier prélèvement specific logic
  if (period.startsWith("dernier_prel")) {
    const propertyId = getPropertyName(period, category, "resultat");
    Object.entries(resultatsDetails).forEach(([value, detail]) => {
      cases.push(["==", ["get", propertyId], value]);
      cases.push(detail.color);
    });
  }
  // bilan annuel specific logic
  else if (period.startsWith("bilan_annuel")) {
    const propertyId = getPropertyName(period, category, "ratio");
    cases.push(["==", ["get", propertyId], ""]);
    cases.push(defaultColor);
    cases.push(["==", ["get", propertyId], 0]);
    cases.push("#75D3B4");
    cases.push(["<=", ["get", propertyId], 0.8]);
    cases.push("#FBBD6C");
    cases.push(["<=", ["get", propertyId], 1]);
    cases.push("#FB726C");
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
