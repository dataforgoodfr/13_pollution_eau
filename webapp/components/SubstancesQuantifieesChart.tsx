import { cn } from "@/lib/utils";
import {
  BILAN_YEARS,
  countSubstancesQuantifiees,
  LATEST_BILAN_YEAR,
} from "@/lib/zoneDetail";
import type { ZoneDetail } from "@/app/api/zone-detail/route";
import { getCategoryById } from "@/lib/polluants";

// Hauteur en px de la barre la plus haute.
const BAR_MAX_PX = 72;
// Une valeur non nulle doit rester visible.
const BAR_MIN_PX = 3;
// Bande réservée au-dessus des barres pour la ligne des valeurs.
const LABEL_ROW_PX = 16;

// Jaune « au moins 1 polluant quantifié » de la légende de la carte, repris
// de la définition de la catégorie « tous » pour rester synchronisé.
const quantifieResult =
  getCategoryById("tous")?.derniereAnalyse.resultats.quantifie;

/**
 * Nombre de substances différentes quantifiées au moins une fois dans
 * l'année, une barre par année. Lu dans les bilans annuels de la zone, dont
 * `parametresDetectes` liste ces substances (cf. modèles dbt
 * `int__resultats_<pfas|pesticide>_*_annuel`). L'échelle est ajustée au maximum observé : il
 * s'agit d'un décompte, sans borne naturelle comme les 100 % d'un taux.
 */
export default function SubstancesQuantifieesChart({
  data,
  categoryId,
  categorieNom,
  colorblindMode,
}: {
  data: ZoneDetail;
  categoryId: string;
  colorblindMode: boolean;
  /** « les PFAS », « les pesticides ». */
  categorieNom: string;
}) {
  const barColor =
    quantifieResult?.[colorblindMode ? "couleurAlt" : "couleur"] ?? "#fee391";

  const years = BILAN_YEARS.map((year) => {
    const bilan = data.bilans[categoryId]?.[year];
    return {
      year,
      entry: bilan && {
        nbPrelevements: bilan.nbPrelevements,
        nbQuantifiees: countSubstancesQuantifiees(bilan.parametresDetectes),
      },
    };
  });

  if (!years.some(({ entry }) => entry)) {
    return <p>Aucune recherche depuis 2020.</p>;
  }

  const max = Math.max(
    1,
    ...years.map(({ entry }) => entry?.nbQuantifiees ?? 0),
  );

  const ariaLabel = `Nombre de substances différentes quantifiées chaque année pour ${categorieNom} : ${years
    .map(({ year, entry }) =>
      entry ? `${year} ${entry.nbQuantifiees}` : `${year} aucune analyse`,
    )
    .join(", ")}`;

  return (
    <div>
      <div role="img" aria-label={ariaLabel}>
        <div
          className="flex items-end gap-1.5"
          style={{ height: BAR_MAX_PX + LABEL_ROW_PX }}
        >
          {years.map(({ year, entry }) => {
            const nb = entry?.nbQuantifiees ?? 0;
            return (
              <div
                key={year}
                className="flex flex-1 flex-col justify-end items-center gap-1"
                title={
                  entry
                    ? `${year} : ${nb} substance${nb > 1 ? "s" : ""} quantifiée${nb > 1 ? "s" : ""}`
                    : `${year} : aucune analyse`
                }
              >
                {entry && (
                  <span
                    className={cn(
                      "font-numbers text-[10px] leading-none",
                      nb > 0 ? "text-gray-700" : "text-gray-400",
                    )}
                  >
                    {nb}
                  </span>
                )}
                {entry ? (
                  nb > 0 && (
                    <span
                      // Contour : ce jaune pâle se détache mal du fond blanc.
                      className="w-full rounded-t-sm border border-black/10"
                      style={{
                        height: Math.max((nb / max) * BAR_MAX_PX, BAR_MIN_PX),
                        backgroundColor: barColor,
                      }}
                    />
                  )
                ) : (
                  // Année sans analyse : un trait pointillé au ras de l'axe,
                  // distinct d'un « 0 » qui, lui, porte un chiffre.
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
          {years.map(({ year, entry }) => (
            <span
              key={year}
              className="font-numbers flex-1 text-center text-[10px] text-gray-400"
            >
              {entry?.nbPrelevements ?? 0}
            </span>
          ))}
        </div>
        <p className="mt-1 text-center text-[10px] text-gray-400">
          nombre d’analyses
        </p>
      </div>

      <p className="mt-2 text-[11px] text-gray-400 leading-relaxed">
        Nombre de substances différentes quantifiées au moins une fois dans
        l’année.
      </p>
    </div>
  );
}
