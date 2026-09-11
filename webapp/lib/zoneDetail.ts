import { getCategoryById, type Severity } from "@/lib/polluants";
import { getPropertyName } from "@/lib/property";

/**
 * Années pour lesquelles les modèles `bilan_annuel_YYYY` existent, dans
 * l'ordre chronologique. Les consommateurs qui affichent la plus récente en
 * premier prennent la liste à l'envers.
 */
export const BILAN_YEARS = [
  "2020",
  "2021",
  "2022",
  "2023",
  "2024",
  "2025",
  "2026",
];

/** L'année de bilan la plus récente, celle proposée par défaut. */
export const LATEST_BILAN_YEAR = BILAN_YEARS[BILAN_YEARS.length - 1];

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

function parseParametresDetectes(
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

const ERROR_COLOR = "#333333";
const ERROR_LABEL = "Résultat manquant";

export type LastPrelResult = {
  resultKey: string;
  severity: Severity;
  color: string;
  label: string;
  explication: string | null;
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
    explication: detail?.explication || null,
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
  /** Borne `limite` du palier atteint dans `ratioLimites`, null sans donnée. */
  limite: number | null;
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
      limite: null,
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
    limite: limite?.limite ?? null,
    nbPrelevements,
    nbSupValeurSanitaire,
    parametres,
  };
}
