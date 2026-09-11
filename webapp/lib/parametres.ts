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

export type PesticideGroup = {
  key: string;
  titre: string;
  params: Array<{ code: string; value: number }>;
};

// Ordre d'affichage imposé du détail pesticides sous la phrase de synthèse.
const PESTICIDE_GROUP_DEFS: Array<{ key: string; titre: string }> = [
  { key: "sub_active", titre: "Substances actives" },
  { key: "metabolite_p", titre: "Métabolites pertinents" },
  {
    key: "total_reg",
    titre: "Somme des substances actives et métabolites pertinents",
  },
  { key: "metabolite_np", titre: "Métabolites non pertinents" },
  { key: "total_ts", titre: "Somme de tous les pesticides" },
];

/**
 * Classe les substances quantifiées d'une catégorie "pesticide" (dernier
 * prélèvement) en sous-groupes, dans l'ordre attendu pour le détail affiché
 * sous la phrase de synthèse. `TOTALPESTICIDE` / `TOTALPESTICIDEALL` sont les
 * deux sommes recalculées par `int__resultats_pesticide_udi_dernier.sql`.
 */
export function groupPesticideParametres(
  parametres: Array<{ code: string; value: number }>,
  parameterValues: ParameterValues,
): PesticideGroup[] {
  const buckets: Record<string, Array<{ code: string; value: number }>> = {
    sub_active: [],
    metabolite_p: [],
    total_reg: [],
    metabolite_np: [],
    total_ts: [],
    autres: [],
  };

  parametres.forEach(({ code, value }) => {
    if (code === "TOTALPESTICIDE") {
      buckets.total_reg.push({ code, value });
      return;
    }
    if (code === "TOTALPESTICIDEALL") {
      buckets.total_ts.push({ code, value });
      return;
    }
    const param = parameterValues[code];
    if (param?.categorie_2 === "sub_active") {
      buckets.sub_active.push({ code, value });
    } else if (param?.categorie_2 === "metabolite") {
      if (
        param.categorie_3 === "pertinent" ||
        param.categorie_3 === "pertinent_par_defaut"
      ) {
        buckets.metabolite_p.push({ code, value });
      } else if (param.categorie_3 === "non_pertinent") {
        buckets.metabolite_np.push({ code, value });
      } else {
        buckets.autres.push({ code, value });
      }
    } else {
      buckets.autres.push({ code, value });
    }
  });

  return [
    ...PESTICIDE_GROUP_DEFS.map((def) => ({
      ...def,
      params: buckets[def.key],
    })),
    { key: "autres", titre: "Autres", params: buckets.autres },
  ].filter((group) => group.params.length > 0);
}
