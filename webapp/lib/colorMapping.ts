import { getCategoryById } from "./polluants";
import { getPropertyName } from "./property";

import type {
  DataDrivenPropertyValueSpecification,
  ColorSpecification,
} from "maplibre-gl";

export interface ZoneResult {
  label: string;
  color: string;
}

/**
 * Résout le résultat d'une zone survolée à partir des propriétés de sa feature
 * pmtiles : renvoie le libellé et la couleur correspondant à la sélection
 * courante. Miroir de la logique de generateColorExpression ci-dessous — les
 * deux doivent rester synchronisés.
 */
export function getZoneResult(
  category: string,
  period: string,
  properties: Record<string, unknown>,
  colorblindMode: boolean = false,
): ZoneResult | null {
  const categoryDetails = getCategoryById(category);
  if (!categoryDetails) {
    return null;
  }

  // Zones sans données (ni cdreseau ni commune) : transparentes sur la carte
  if (
    properties["cdreseau"] === undefined &&
    properties["commune_code_insee"] === undefined
  ) {
    return null;
  }

  if (period.startsWith("dernier_prel")) {
    const value = properties[getPropertyName(period, category, "resultat")];
    const key =
      value === undefined || value === null ? "non_recherche" : String(value);
    const detail = categoryDetails.resultats[key];
    if (!detail) {
      return null;
    }
    return {
      label: detail.label,
      color: colorblindMode ? detail.couleurAlt : detail.couleur,
    };
  }

  if (period.startsWith("bilan_annuel")) {
    const annuels = categoryDetails.resultatsAnnuels;
    if (!annuels) {
      return null;
    }
    const ratio = properties[getPropertyName(period, category, "ratio")];
    const nbPrelevements =
      properties[getPropertyName(period, category, "nb_prelevements")];
    if (
      ratio === undefined ||
      ratio === null ||
      nbPrelevements === undefined ||
      nbPrelevements === null ||
      Number(nbPrelevements) === 0
    ) {
      return {
        label: annuels.nonRechercheLabel,
        color: colorblindMode
          ? annuels.nonRechercheCouleurAlt
          : annuels.nonRechercheCouleur,
      };
    }
    const ratioValue = Number(ratio);
    const limite = annuels.ratioLimites.find((l) => ratioValue <= l.limite);
    if (!limite) {
      return null;
    }
    return {
      label: `${limite.label} des ${annuels.ratioLabelPlural}`,
      color: colorblindMode ? limite.couleurAlt : limite.couleur,
    };
  }

  return null;
}

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
  colorblindMode: boolean = false,
): DataDrivenPropertyValueSpecification<ColorSpecification> {
  const cases = [];

  const errorColor = "#333333"; // Black color for unmatched cases
  const categoryDetails = getCategoryById(category);

  if (!categoryDetails) {
    return errorColor;
  }

  // Check if we have no data for this zone (when neither cdreseau nor commune_code_insee exists)
  // If yes, set the color to transparent to hide these zones on the map
  cases.push([
    "all",
    ["!", ["has", "cdreseau"]],
    ["!", ["has", "commune_code_insee"]],
  ]);
  cases.push("transparent"); // Transparent for no data

  // dernier prélèvement specific logic
  if (period.startsWith("dernier_prel")) {
    const resultatProp = getPropertyName(period, category, "resultat");
    Object.entries(categoryDetails.resultats).forEach(([value, detail]) => {
      // the value "non_recherche" is actually null in data, and missing in the pmtiles
      if (value === "non_recherche") {
        cases.push(["!", ["has", resultatProp]]);
      } else {
        cases.push(["==", ["get", resultatProp], value]);
      }

      // Check if the color is valid and use colorblind alternative if needed
      const color = colorblindMode ? detail.couleurAlt : detail.couleur;
      const isValidColor = color && color.startsWith("#");

      cases.push(isValidColor ? color : errorColor);
    });
  }
  // bilan annuel specific logic
  else if (period.startsWith("bilan_annuel")) {
    if (!categoryDetails.resultatsAnnuels) {
      return errorColor;
    }

    const ratioProp = getPropertyName(period, category, "ratio");
    const nbPrelevementsProp = getPropertyName(
      period,
      category,
      "nb_prelevements",
    );

    // Check if nb_prelevements is 0 or empty (no research), or ratio is empty
    cases.push([
      "any",
      ["!", ["has", nbPrelevementsProp]],
      ["!", ["has", ratioProp]],
      ["==", ["get", nbPrelevementsProp], 0],
    ]);
    cases.push(
      colorblindMode
        ? categoryDetails.resultatsAnnuels.nonRechercheCouleurAlt
        : categoryDetails.resultatsAnnuels.nonRechercheCouleur,
    );

    // Color scale for ratio values using ratioLimites
    categoryDetails.resultatsAnnuels.ratioLimites.forEach((l) => {
      cases.push(["<=", ["get", ratioProp], l.limite]);
      cases.push(colorblindMode ? l.couleurAlt : l.couleur);
    });
  }

  if (cases.length > 0) {
    const expression = ["case", ...cases, errorColor];
    console.log("Expression:", expression);
    return expression as DataDrivenPropertyValueSpecification<ColorSpecification>;
  } else {
    // If no cases were added, return a default color
    return errorColor; // Default color for unmatched cases
  }
}
