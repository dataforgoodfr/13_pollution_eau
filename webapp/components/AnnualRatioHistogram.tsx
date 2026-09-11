import { cn } from "@/lib/utils";
import type { ICategory } from "@/lib/polluants";
import {
  BILAN_YEARS,
  getAnnualResult,
  LATEST_BILAN_YEAR,
  type ZoneDetail,
} from "@/lib/zoneDetail";

// Hauteur en px d'une barre à 100 %. Le calcul est fait en px plutôt qu'en %
// pour réserver au-dessus la ligne du pourcentage sans risque de débordement.
const BAR_MAX_PX = 72;
// Un ratio non nul mais minuscule doit rester visible.
const BAR_MIN_PX = 3;
// Bande réservée au-dessus des barres pour la ligne des pourcentages.
const LABEL_ROW_PX = 16;

function formatRatio(ratio: number): string {
  const rounded = Math.round(ratio * 100);
  return rounded === 0 ? "< 1 %" : `${rounded} %`;
}

/**
 * Historique des bilans annuels d'une catégorie, en histogramme : une barre par
 * année, hauteur = part des analyses non conformes, couleur = palier atteint
 * dans `ratioLimites`. L'échelle Y est fixe (0-100 %) et non ajustée au maximum
 * observé, pour que deux catégories ou deux zones restent comparables.
 */
export default function AnnualRatioHistogram({
  data,
  categoryDetails,
  colorblindMode,
  onOpenAnalyses,
}: {
  data: ZoneDetail;
  categoryDetails: ICategory;
  colorblindMode: boolean;
  onOpenAnalyses?: () => void;
}) {
  const years = BILAN_YEARS.map((year) => ({
    year,
    result: getAnnualResult(
      data,
      `bilan_annuel_${year}`,
      categoryDetails.id,
      colorblindMode,
    ),
  }));

  // Synthèse : la dernière année renseignée, pas forcément l'année en cours.
  const latest = [...years].reverse().find((item) => item.result.hasData);
  const summary = latest
    ? `${latest.result.label} en ${latest.year}`
    : "Aucune recherche depuis 2020";
  // Catégorie jamais recherchée sur cette zone : un histogramme intégralement
  // vide ne dit rien de plus que la phrase de synthèse.
  const hasAnyData = latest !== undefined;

  const supValeurSanitaire = years
    .filter((item) => item.result.hasData && !!item.result.nbSupValeurSanitaire)
    .map((item) => ({
      year: item.year,
      nb: item.result.nbSupValeurSanitaire!,
    }));

  const ariaLabel = `${categoryDetails.nomAffichage}, part des ${
    categoryDetails.bilanAnnuel?.ratioLabelPlural || "analyses non conformes"
  } par année : ${years
    .map(({ year, result }) =>
      result.hasData
        ? `${year} ${formatRatio(result.ratio ?? 0)} sur ${result.nbPrelevements} analyses`
        : `${year} aucune recherche`,
    )
    .join(", ")}`;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <p className="font-medium">{categoryDetails.nomAffichage}</p>
      <p className="text-sm text-gray-500 leading-snug">{summary}</p>

      {hasAnyData && (
        <div className="mt-3" role="img" aria-label={ariaLabel}>
          <div
            className="relative flex items-end gap-1.5"
            style={{ height: BAR_MAX_PX + LABEL_ROW_PX }}
          >
            {/* Repère du haut d'échelle. Sans lui, le vide au-dessus de barres
              toutes à 0 % ne se lit pas : c'est pourtant lui qui porte
              l'information, l'échelle étant fixe et non ajustée aux valeurs. */}
            <div
              className="pointer-events-none absolute inset-x-0 border-t border-dotted border-gray-200"
              style={{ top: LABEL_ROW_PX }}
            >
              <span className="absolute right-0 -top-3 text-[9px] text-gray-300">
                100 %
              </span>
            </div>
            {years.map(({ year, result }) => {
              const ratio = result.ratio ?? 0;
              return (
                <div
                  key={year}
                  className="flex flex-1 flex-col justify-end items-center gap-1"
                  title={
                    result.hasData
                      ? `${year} : ${formatRatio(ratio)} — ${result.nbPrelevements} analyse${Number(result.nbPrelevements) > 1 ? "s" : ""}`
                      : `${year} : aucune recherche`
                  }
                >
                  {result.hasData && ratio > 0 && (
                    <span className="font-numbers text-[10px] leading-none text-gray-700">
                      {formatRatio(ratio)}
                    </span>
                  )}
                  {result.hasData ? (
                    <span
                      className="w-full rounded-t-sm border border-black/10"
                      style={{
                        height: Math.max(ratio * BAR_MAX_PX, BAR_MIN_PX),
                        backgroundColor: result.color,
                      }}
                    />
                  ) : (
                    // Année non recherchée : un trait pointillé au ras de l'axe,
                    // et non une case pleine hauteur. Sur cet histogramme la
                    // hauteur se lit comme une gravité — une absence de donnée ne
                    // doit pas occuper la place d'un taux de 100 %. Le "—" de la
                    // ligne des effectifs lève l'ambiguïté avec un taux de 0 %.
                    <span
                      className="w-full border-t border-dashed border-gray-300"
                      style={{ height: BAR_MIN_PX }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="h-px bg-gray-200" />

          <div className="mt-1 flex gap-1.5">
            {years.map(({ year }) => (
              <span
                key={year}
                className={cn(
                  "font-numbers flex-1 text-center text-[10px]",
                  year === LATEST_BILAN_YEAR
                    ? "font-bold text-gray-700"
                    : "text-gray-400",
                )}
              >
                {year}
              </span>
            ))}
          </div>
          <div className="flex gap-1.5">
            {years.map(({ year, result }) => (
              <span
                key={year}
                className="font-numbers flex-1 text-center text-[10px] text-gray-400"
              >
                {result.hasData ? result.nbPrelevements : "—"}
              </span>
            ))}
          </div>
          <p className="mt-1 text-center text-[10px] text-gray-400">
            nombre d’analyses
          </p>
        </div>
      )}

      {supValeurSanitaire.length > 0 && (
        <p className="mt-2 text-xs text-gray-600 leading-relaxed">
          {supValeurSanitaire
            .map(
              ({ year, nb }) => `${nb} analyse${nb > 1 ? "s" : ""} en ${year}`,
            )
            .join(", ")}{" "}
          {supValeurSanitaire.length > 1 || supValeurSanitaire[0].nb > 1
            ? "dépassent "
            : "dépasse "}
          {categoryDetails.bilanAnnuel?.valeurSanitaireLabel ||
            "la limite sanitaire"}
          .
        </p>
      )}

      {/* Cette note explique l'astérisque de `ratioLabelPlural` : sans taux
          affiché, elle n'a plus rien à expliquer. */}
      {hasAnyData && categoryDetails.bilanAnnuel?.details && (
        <p className="mt-2 text-[11px] text-gray-400 leading-relaxed">
          {categoryDetails.bilanAnnuel.details}
        </p>
      )}

      {onOpenAnalyses && (
        <button
          onClick={onOpenAnalyses}
          className="mt-2 text-sm text-custom-drom hover:underline"
        >
          Voir les analyses
        </button>
      )}
    </div>
  );
}
