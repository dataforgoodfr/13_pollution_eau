import { getCategoryById, type Severity } from "@/lib/polluants";
import type {
  ParametresDetectes,
  ZoneDetail,
} from "@/app/api/zone-detail/route";

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

function sortParametres(
  parametres: ParametresDetectes | undefined,
): Array<{ code: string; value: number }> {
  return Object.entries(parametres ?? {})
    .map(([code, value]) => ({ code, value }))
    .sort((a, b) => b.value - a.value);
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
  const entry = data.dernierPrel[categoryId];
  const resultKey = entry?.resultat ?? "non_recherche";
  const detail = details?.derniereAnalyse.resultats[resultKey];

  return {
    resultKey,
    severity: detail?.severite ?? "non_recherche",
    color: detail?.[colorblindMode ? "couleurAlt" : "couleur"] || ERROR_COLOR,
    label: detail?.label || ERROR_LABEL,
    explication: detail?.explication || null,
    date: entry?.date ?? null,
    nbParametres: entry?.nbParametres ?? null,
    parametres: sortParametres(entry?.parametresDetectes),
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
  year: string,
  categoryId: string,
  colorblindMode: boolean,
): AnnualResult {
  const details = getCategoryById(categoryId);
  const annuels = details?.bilanAnnuel;
  const entry = data.bilans[categoryId]?.[year];

  if (!entry) {
    return {
      hasData: false,
      color:
        annuels?.[
          colorblindMode ? "nonRechercheCouleurAlt" : "nonRechercheCouleur"
        ] || ERROR_COLOR,
      label: annuels?.nonRechercheLabel || ERROR_LABEL,
      ratio: null,
      limite: null,
      nbPrelevements: null,
      nbSupValeurSanitaire: null,
      parametres: [],
    };
  }

  const { ratio } = entry;
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
    nbPrelevements: entry.nbPrelevements,
    nbSupValeurSanitaire: entry.nbSupValeurSanitaire,
    parametres: sortParametres(entry.parametresDetectes),
  };
}
