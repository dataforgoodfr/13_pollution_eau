import { cn } from "@/lib/utils";
import type { ICategory } from "@/lib/polluants";
import {
  BILAN_YEARS,
  getAnnualResult,
  LATEST_BILAN_YEAR,
} from "@/lib/zoneDetail";
import type { ZoneDetail } from "@/app/api/zone-detail/route";

// Hauteur en px d'une colonne (toujours pleine : barres empilées à 100 %).
const BAR_MAX_PX = 72;
// Un segment non conforme non nul mais minuscule doit rester visible.
const BAR_MIN_PX = 3;
// Bande réservée au-dessus des barres pour la ligne des pourcentages.
const LABEL_ROW_PX = 16;

// Couleurs « non conforme » et « non quantifié » de la carte (cf. palette en
// tête de lib/polluants.ts), `alt` en mode daltonien. Le vert est atténué : les
// analyses conformes restent lisibles sans voler la vedette aux non conformes.
const COLORS = {
  standard: { nonConforme: "#fe9929", conforme: "#74c476" },
  alt: { nonConforme: "#d95f0e", conforme: "#c7e9c0" },
};
const OPACITY_CONFORME = 0.4;

function formatRatio(ratio: number): string {
  const rounded = Math.round(ratio * 100);
  if (rounded === 0 && ratio > 0) return "< 1 %";
  if (rounded === 100 && ratio < 1) return "> 99 %";
  return `${rounded} %`;
}

function capitalize(text: string): string {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

/**
 * Historique des bilans annuels d'une catégorie, en barres empilées à 100 % :
 * une colonne par année, part des analyses non conformes en haut, conformes en
 * bas. Une année sans analyse est un cadre pointillé vide (pas de répartition
 * possible sur 0 analyse) et son effectif affiche « 0 ».
 */
export default function AnnualRatioHistogram({
  data,
  categoryDetails,
  colorblindMode,
}: {
  data: ZoneDetail;
  categoryDetails: ICategory;
  colorblindMode: boolean;
}) {
  const years = BILAN_YEARS.map((year) => ({
    year,
    result: getAnnualResult(data, year, categoryDetails.id, colorblindMode),
  }));

  const colors = colorblindMode ? COLORS.alt : COLORS.standard;
  const ratioLabel =
    categoryDetails.bilanAnnuel?.ratioLabelPlural || "analyses non conformes";
  const complementLabel =
    categoryDetails.bilanAnnuel?.ratioComplementLabelPlural ||
    "analyses conformes";

  if (!years.some((item) => item.result.hasData)) {
    return <p>Aucune recherche depuis 2020.</p>;
  }

  const supValeurSanitaire = years
    .filter((item) => item.result.hasData && !!item.result.nbSupValeurSanitaire)
    .map((item) => ({
      year: item.year,
      nb: item.result.nbSupValeurSanitaire!,
    }));

  const ariaLabel = `${categoryDetails.nomAffichage}, part des ${ratioLabel} par année : ${years
    .map(({ year, result }) =>
      result.hasData
        ? `${year} ${formatRatio(result.ratio ?? 0)} sur ${result.nbPrelevements} analyses`
        : `${year} aucune analyse`,
    )
    .join(", ")}`;

  return (
    <div>
      <div role="img" aria-label={ariaLabel}>
        <div
          className="flex items-end gap-1.5"
          style={{ height: BAR_MAX_PX + LABEL_ROW_PX }}
        >
          {years.map(({ year, result }) => {
            const ratio = result.ratio ?? 0;
            const nonConformePx =
              ratio > 0 ? Math.max(ratio * BAR_MAX_PX, BAR_MIN_PX) : 0;
            return (
              <div
                key={year}
                className="flex flex-1 flex-col justify-end items-center gap-1"
                title={
                  result.hasData
                    ? `${capitalize(ratioLabel)} : ${formatRatio(ratio)}\n${capitalize(complementLabel)} : ${formatRatio(1 - ratio)}`
                    : `${year} : aucune analyse`
                }
              >
                {/* Aussi à 0 % (en gris clair) : sans chiffre, une colonne
                    entièrement verte ne se lit pas comme « tout conforme ». */}
                {result.hasData && (
                  <span
                    className={cn(
                      "font-numbers text-[10px] leading-none",
                      ratio > 0 ? "text-gray-700" : "text-gray-400",
                    )}
                  >
                    {formatRatio(ratio)}
                  </span>
                )}
                {result.hasData ? (
                  <span
                    className="flex w-full flex-col overflow-hidden rounded-t-sm border border-black/10"
                    style={{ height: BAR_MAX_PX }}
                  >
                    {nonConformePx > 0 && (
                      <span
                        className="flex-shrink-0"
                        style={{
                          height: nonConformePx,
                          backgroundColor: colors.nonConforme,
                        }}
                      />
                    )}
                    <span
                      className="flex-1"
                      style={{
                        backgroundColor: colors.conforme,
                        opacity: OPACITY_CONFORME,
                      }}
                    />
                  </span>
                ) : (
                  <span
                    className="w-full rounded-t-sm border border-dashed border-gray-300"
                    style={{ height: BAR_MAX_PX }}
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
              {result.hasData ? result.nbPrelevements : 0}
            </span>
          ))}
        </div>
        <p className="mt-1 text-center text-[10px] text-gray-400">
          nombre d’analyses
        </p>
      </div>

      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-gray-500">
        <li className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-2.5 w-2.5 rounded-sm border border-black/10"
            style={{ backgroundColor: colors.nonConforme }}
          />
          {ratioLabel}
        </li>
        <li className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{
              backgroundColor: colors.conforme,
              opacity: OPACITY_CONFORME,
            }}
          />
          {complementLabel}
        </li>
      </ul>

      {supValeurSanitaire.length > 0 && (
        <p className="mt-2">
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
    </div>
  );
}
