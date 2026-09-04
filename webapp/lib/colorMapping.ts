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
 * qu'affichée dans la légende compacte et dans le panel de zone. Les couples
 * libellé/couleur sont les mêmes que ceux produits par getZoneResult, ce qui
 * permet de retrouver un segment par égalité.
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
    const detail = categoryDetails.derniereAnalyse.resultats[key];
    if (!detail) {
      return null;
    }
    return {
      label: detail.label,
      color: colorblindMode ? detail.couleurAlt : detail.couleur,
    };
  }

  if (period.startsWith("bilan_annuel")) {
    const annuels = categoryDetails.bilanAnnuel;
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
