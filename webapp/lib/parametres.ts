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

export function getParameterColor(
  paramCode: string,
  value: number,
  parameterValues: ParameterValues,
  category: string,
): string | null {
  const paramRef = parameterValues[paramCode];
  if (!paramRef) return null;

  // Les métabolites non pertinents n'ont pas à être colorés sur leur limite
  // indicative quand ils sont affichés dans la catégorie "pesticide".
  if (category === "pesticide" && paramRef.categorie_3 === "non_pertinent") {
    return null;
  }

  if (
    paramRef.valeur_sanitaire_1 !== null &&
    value > paramRef.valeur_sanitaire_1
  ) {
    return "#f03b20";
  }
  if (paramRef.limite_qualite !== null && value > paramRef.limite_qualite) {
    return "#fe9929";
  }
  if (
    paramRef.limite_indicative !== null &&
    value > paramRef.limite_indicative
  ) {
    return "#FDC70C";
  }

  return null;
}
