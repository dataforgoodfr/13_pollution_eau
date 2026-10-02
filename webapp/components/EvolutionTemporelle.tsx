"use client";

import { useEffect, useState } from "react";
import type { ParameterValues } from "@/app/lib/data";
import { getCategoryById, TOP_LEVEL_CATEGORIES } from "@/lib/polluants";
import { getParameterName } from "@/lib/parametres";
import type { ZoneDetail } from "@/app/api/zone-detail/route";
import {
  getAnalysesCategorie,
  type AnalysesFilters,
} from "@/components/AnalysesModal";
import AnnualRatioHistogram from "@/components/AnnualRatioHistogram";
import ConcentrationChart, {
  type ConcentrationPoint,
} from "@/components/ConcentrationChart";

/**
 * Catégories pour lesquelles une courbe de concentration a du sens, le
 * paramètre qui la porte et une note facultative affichée sous la courbe.
 * Une catégorie absente d'ici n'apparaît pas dans la sous-partie
 * « concentrations ».
 *
 * Tout paramètre ajouté ici doit l'être aussi dans ALLOWED_PARAMETRES
 * (app/api/zone-concentrations/route.ts).
 */
const CONCENTRATION_PARAM_BY_CATEGORY: Record<
  string,
  { parametre: string; note?: string }
> = {
  // PESTOT est le total publié par le contrôle sanitaire, avec les règles de
  // calcul de chaque époque. L'onglet « Dernières analyses » le recalcule
  // (TOTALPESTICIDE), d'où de possibles écarts sur le dernier point.
  pesticide: {
    parametre: "PESTOT",
    note: "Ce total est repris tel quel du contrôle sanitaire (paramètre PESTOT) : il n'est pas recalculé ici.",
  },
  pfas: { parametre: "SPFAS" },
};

type EvolutionTemporelleProps = {
  data: ZoneDetail;
  displayMode: "communes" | "udis";
  selectedZoneCode: string;
  colorblindMode: boolean;
  parameterValues: ParameterValues;
  onOpenAnalyses?: (filters?: AnalysesFilters) => void;
};

type SeriesState = Record<
  string,
  { points: ConcentrationPoint[]; tronque: boolean }
>;

export default function EvolutionTemporelle({
  data,
  displayMode,
  selectedZoneCode,
  colorblindMode,
  parameterValues,
  onOpenAnalyses,
}: EvolutionTemporelleProps) {
  const [series, setSeries] = useState<SeriesState | null>(null);
  const [seriesError, setSeriesError] = useState(false);

  // Les concentrations ne sont chargées qu'à l'ouverture de cet onglet : elles
  // demandent une requête par paramètre, inutile de la payer à chaque clic sur
  // une zone de la carte.
  useEffect(() => {
    let cancelled = false;
    setSeries(null);
    setSeriesError(false);

    Promise.all(
      Object.entries(CONCENTRATION_PARAM_BY_CATEGORY).map(
        ([categoryId, { parametre }]) =>
          fetch(
            `/api/zone-concentrations?type=${displayMode}&code=${encodeURIComponent(
              selectedZoneCode,
            )}&parametre=${parametre}`,
          )
            .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
            .then(
              (payload) =>
                [
                  categoryId,
                  {
                    points: payload.points as ConcentrationPoint[],
                    tronque: Boolean(payload.tronque),
                  },
                ] as const,
            ),
      ),
    )
      .then((entries) => {
        if (!cancelled) {
          setSeries(Object.fromEntries(entries));
        }
      })
      .catch((error) => {
        console.error("Failed to fetch zone concentrations:", error);
        if (!cancelled) {
          setSeriesError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [displayMode, selectedZoneCode]);

  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-medium">Évolution des taux de conformité</h3>
        <p className="mt-0.5 mb-3 text-sm text-gray-500 leading-relaxed">
          Part des analyses non conformes chaque année, depuis 2020.
        </p>
        <div className="space-y-2">
          {TOP_LEVEL_CATEGORIES.filter((item) => item.bilanAnnuel).map(
            (item) => {
              const analysesCategorie = getAnalysesCategorie(item.id);
              return (
                <AnnualRatioHistogram
                  key={item.id}
                  data={data}
                  categoryDetails={item}
                  colorblindMode={colorblindMode}
                  onOpenAnalyses={
                    onOpenAnalyses && analysesCategorie
                      ? () => onOpenAnalyses({ categorie: analysesCategorie })
                      : undefined
                  }
                />
              );
            },
          )}
        </div>
      </section>

      <section>
        <h3 className="font-medium">Évolution des concentrations</h3>
        <p className="mt-0.5 mb-3 text-sm text-gray-500 leading-relaxed">
          Concentration mesurée à chaque analyse.
        </p>

        {seriesError && (
          <p className="text-sm text-gray-500">
            Impossible de charger les concentrations pour cette zone.
          </p>
        )}
        {!seriesError && !series && (
          <p className="text-sm text-gray-500">Chargement...</p>
        )}
        {series && (
          <div className="space-y-2">
            {Object.entries(CONCENTRATION_PARAM_BY_CATEGORY).map(
              ([categoryId, { parametre, note }]) => {
                const categoryDetails = getCategoryById(categoryId);
                const paramRef = parameterValues[parametre];
                if (!categoryDetails) return null;

                return (
                  <div
                    key={categoryId}
                    className="rounded-xl border border-gray-200 bg-white p-3"
                  >
                    <p className="font-medium">
                      {categoryDetails.nomAffichage}
                    </p>
                    <p className="mb-2 text-sm text-greydark leading-snug">
                      {getParameterName(parametre, parameterValues)}
                      {categoryDetails.unite
                        ? ` (en ${categoryDetails.unite})`
                        : ""}
                    </p>
                    <ConcentrationChart
                      points={series[categoryId]?.points ?? []}
                      tronque={series[categoryId]?.tronque ?? false}
                      unite={categoryDetails.unite}
                      limiteQualite={paramRef?.limite_qualite ?? null}
                      valeurSanitaire={paramRef?.valeur_sanitaire_1 ?? null}
                      label={getParameterName(parametre, parameterValues)}
                    />
                    {note && (
                      <p className="mt-1 text-[11px] text-gray-400 leading-relaxed">
                        {note}
                      </p>
                    )}
                  </div>
                );
              },
            )}
          </div>
        )}
      </section>
    </div>
  );
}
