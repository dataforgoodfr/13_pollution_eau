import { getCategoryById } from "./polluants";
import { getPropertyName } from "./property";

import type {
  DataDrivenPropertyValueSpecification,
  ColorSpecification,
} from "maplibre-gl";

export interface ScaleSegment {
  /** Clé de résultat (dernier_prel) ou `ratio_${limite}` (bilan annuel). */
  key: string;
  label: string;
  color: string;
}

export interface ColorScale {
  /** Pastille "non recherché", affichée à part de l'échelle colorée. */
  gray: ScaleSegment | null;
  /** Segments colorés dans l'ordre croissant de gravité. */
  segments: ScaleSegment[];
}

/**
 * Construit l'échelle de couleurs d'une sélection (catégorie × période), telle
 * qu'affichée dans la légende compacte et dans le panel de zone.
 */
export function getColorScale(
  category: string,
  period: string,
  colorblindMode: boolean = false,
): ColorScale | null {
  const categoryDetails = getCategoryById(category);
  if (!categoryDetails) {
    return null;
  }

  if (period.startsWith("bilan_annuel")) {
    const annuels = categoryDetails.bilanAnnuel;
    if (!annuels) {
      return null;
    }
    return {
      gray: {
        key: "non_recherche",
        label: annuels.nonRechercheLabel,
        color: colorblindMode
          ? annuels.nonRechercheCouleurAlt
          : annuels.nonRechercheCouleur,
      },
      segments: annuels.ratioLimites.map((l) => ({
        key: `ratio_${l.limite}`,
        label: `${l.label} des ${annuels.ratioLabelPlural}`,
        color: colorblindMode ? l.couleurAlt : l.couleur,
      })),
    };
  }

  let gray: ScaleSegment | null = null;
  const segments: ScaleSegment[] = [];
  Object.entries(categoryDetails.derniereAnalyse.resultats).forEach(
    ([key, detail]) => {
      const segment = {
        key,
        label: detail.label,
        color: colorblindMode ? detail.couleurAlt : detail.couleur,
      };
      if (key === "non_recherche") {
        gray = segment;
      } else {
        segments.push(segment);
      }
    },
  );
  return { gray, segments };
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
    Object.entries(categoryDetails.derniereAnalyse.resultats).forEach(
      ([value, detail]) => {
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
      },
    );
  }
  // bilan annuel specific logic
  else if (period.startsWith("bilan_annuel")) {
    if (!categoryDetails.bilanAnnuel) {
      return errorColor;
    }

    const ratioProp = getPropertyName(period, category, "ratio");

    // ratio is missing from the pmtiles when there was no prelevement (no research)
    cases.push(["!", ["has", ratioProp]]);
    cases.push(
      colorblindMode
        ? categoryDetails.bilanAnnuel.nonRechercheCouleurAlt
        : categoryDetails.bilanAnnuel.nonRechercheCouleur,
    );

    // Color scale for ratio values using ratioLimites
    categoryDetails.bilanAnnuel.ratioLimites.forEach((l) => {
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
