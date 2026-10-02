import type { ParameterValues } from "@/app/lib/data";

/**
 * Helpers portant sur un paramètre mesuré (`cdparametresiseeaux`) et sa valeur,
 * indépendamment de la zone ou de la période d'où ils viennent. Les seuils
 * lus ici proviennent de `int__valeurs_de_reference`, exposé côté client par
 * `fetchParameterValues` (app/lib/data.ts).
 */

export function formatValue(value: number): string {
  return value.toLocaleString("fr-FR", { maximumFractionDigits: 4 });
}

export function getParameterName(
  paramCode: string,
  parameterValues: ParameterValues,
): string {
  return parameterValues[paramCode]?.web_label || paramCode;
}

type ParameterThresholds = {
  categorie_3: string | null;
  limite_qualite: number | null;
  limite_indicative: number | null;
  valeur_sanitaire_1: number | null;
};

/**
 * Couleur d'une valeur mesurée selon le seuil le plus grave dépassé, `null` si
 * aucun seuil n'est dépassé. Les seuils sont passés explicitement pour pouvoir
 * colorer une analyse avec ceux en vigueur à sa date (cf. AnalysesModal).
 */
export function getThresholdColor(
  value: number,
  thresholds: ParameterThresholds,
  category: string,
): string | null {
  // Les métabolites non pertinents n'ont pas à être colorés sur leur limite
  // indicative quand ils sont affichés dans la catégorie "pesticide".
  if (category === "pesticide" && thresholds.categorie_3 === "non_pertinent") {
    return null;
  }

  if (
    thresholds.valeur_sanitaire_1 !== null &&
    value > thresholds.valeur_sanitaire_1
  ) {
    return "#f03b20";
  }
  if (thresholds.limite_qualite !== null && value > thresholds.limite_qualite) {
    return "#fe9929";
  }
  if (
    thresholds.limite_indicative !== null &&
    value > thresholds.limite_indicative
  ) {
    return "#FDC70C";
  }

  return null;
}

export function getParameterColor(
  paramCode: string,
  value: number,
  parameterValues: ParameterValues,
  category: string,
): string | null {
  const paramRef = parameterValues[paramCode];
  if (!paramRef) return null;
  return getThresholdColor(value, paramRef, category);
}
