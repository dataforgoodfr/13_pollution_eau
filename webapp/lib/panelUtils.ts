import type { ParameterValues } from "@/app/lib/data";
import {
  getCategoryById,
  type ICategory,
  type Severity,
} from "@/lib/polluants";
import { getPropertyName } from "@/lib/property";

/**
 * Données d'une zone renvoyées par /api/zone-detail : un sac plat de clés
 * `${periode}_${categorie}_${champ}` plus quelques champs d'identité.
 */
export type ZoneDetail = Record<string, unknown>;

export function readString(data: ZoneDetail, key: string): string | null {
  const value = data[key];
  return typeof value === "string" && value !== "" ? value : null;
}

export function readNumber(data: ZoneDetail, key: string): number | null {
  const value = data[key];
  return typeof value === "number" && !Number.isNaN(value) ? value : null;
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

export function parseParametresDetectes(
  raw: string | null,
): Array<{ code: string; value: number }> {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Record<string, number>;
    return Object.entries(parsed)
      .map(([code, value]) => ({ code, value: Number(value) }))
      .sort((a, b) => b.value - a.value);
  } catch (error) {
    console.error("Error parsing parametres_detectes:", error);
    return [];
  }
}

export function formatValue(value: number): string {
  return value.toLocaleString("fr-FR", { maximumFractionDigits: 4 });
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

const ERROR_COLOR = "#333333";
const ERROR_LABEL = "Résultat manquant";

export type LastPrelResult = {
  resultKey: string;
  severity: Severity;
  color: string;
  label: string;
  date: string | null;
  nbParametres: number | null;
  parametres: Array<{ code: string; value: number }>;
};

export function getLastPrelResult(
  data: ZoneDetail,
  categoryId: string,
  colorblindMode: boolean,
): LastPrelResult {
  const details = getCategoryById(categoryId);
  const resultKey =
    readString(data, getPropertyName("dernier_prel", categoryId, "resultat")) ??
    "non_recherche";
  const detail = details?.derniereAnalyse.resultats[resultKey];

  return {
    resultKey,
    severity: detail?.severite ?? "non_recherche",
    color: detail?.[colorblindMode ? "couleurAlt" : "couleur"] || ERROR_COLOR,
    label: detail?.label || ERROR_LABEL,
    date: readString(
      data,
      getPropertyName("dernier_prel", categoryId, "date_dernier_prel"),
    ),
    nbParametres: readNumber(
      data,
      getPropertyName("dernier_prel", categoryId, "nb_parametres"),
    ),
    parametres: parseParametresDetectes(
      readString(
        data,
        getPropertyName("dernier_prel", categoryId, "parametres_detectes"),
      ),
    ),
  };
}

export type AnnualResult = {
  hasData: boolean;
  color: string;
  label: string;
  ratio: number | null;
  nbPrelevements: number | null;
  nbSupValeurSanitaire: number | null;
  parametres: Array<{ code: string; value: number }>;
};

export function getAnnualResult(
  data: ZoneDetail,
  period: string,
  categoryId: string,
  colorblindMode: boolean,
): AnnualResult {
  const details = getCategoryById(categoryId);
  const annuels = details?.bilanAnnuel;
  const ratio = readNumber(data, getPropertyName(period, categoryId, "ratio"));
  const nbPrelevements = readNumber(
    data,
    getPropertyName(period, categoryId, "nb_prelevements"),
  );
  const parametres = parseParametresDetectes(
    readString(
      data,
      getPropertyName(period, categoryId, "parametres_detectes"),
    ),
  );
  const nbSupValeurSanitaire = readNumber(
    data,
    getPropertyName(period, categoryId, "nb_sup_valeur_sanitaire"),
  );

  if (!nbPrelevements || ratio === null) {
    return {
      hasData: false,
      color:
        annuels?.[
          colorblindMode ? "nonRechercheCouleurAlt" : "nonRechercheCouleur"
        ] || ERROR_COLOR,
      label: annuels?.nonRechercheLabel || ERROR_LABEL,
      ratio: null,
      nbPrelevements,
      nbSupValeurSanitaire,
      parametres,
    };
  }

  const limite = (annuels?.ratioLimites || []).find(
    (item) => ratio <= item.limite,
  );

  return {
    hasData: true,
    color: limite
      ? limite[colorblindMode ? "couleurAlt" : "couleur"]
      : ERROR_COLOR,
    label: `${Math.round(ratio * 100)}% des ${annuels?.ratioLabelPlural || "analyses non conformes"}`,
    ratio,
    nbPrelevements,
    nbSupValeurSanitaire,
    parametres,
  };
}

/**
 * Remonte à la catégorie de premier niveau (celle affichée dans l'accordéon)
 * à partir d'un identifiant qui peut être une sous-catégorie.
 */
export function findTopLevelCategory(
  selectedId: string,
  categories: ICategory[],
): ICategory | undefined {
  return categories.find(
    (item) =>
      item.id === selectedId ||
      item.enfants?.some((child) => child.id === selectedId),
  );
}
