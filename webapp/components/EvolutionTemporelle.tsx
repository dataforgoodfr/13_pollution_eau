"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ParameterValues } from "@/app/lib/data";
import {
  getForms,
  TOP_LEVEL_CATEGORIES,
  type ICategory,
} from "@/lib/polluants";
import { getParameterName } from "@/lib/parametres";
import type { ZoneDetail } from "@/app/api/zone-detail/route";
import {
  getAnalysesCategorie,
  type AnalysesFilters,
} from "@/components/AnalysesModal";
import AnnualRatioHistogram from "@/components/AnnualRatioHistogram";
import SubstancesQuantifieesChart from "@/components/SubstancesQuantifieesChart";
import ConcentrationChart, {
  type ConcentrationPoint,
  type SeuilNom,
} from "@/components/ConcentrationChart";

/**
 * Seuil de non-conformité de la courbe, aligné sur celui du bilan annuel de
 * la catégorie (modèles dbt `int__resultats_<categorie>_udi_annuel`) : la
 * limite de qualité par défaut, la valeur sanitaire pour les nitrates et les
 * perchlorates, qui n'ont pas de limite de qualité dans le référentiel.
 */
type SeuilConfig = {
  champ: "limite_qualite" | "valeur_sanitaire_1";
  nom: SeuilNom;
};

/**
 * Catégories pour lesquelles une courbe de concentration a du sens, le
 * paramètre qui la porte, le seuil du bilan annuel s'il diffère de la limite
 * de qualité, et une note facultative affichée sous la courbe.
 * Une catégorie absente d'ici n'a pas de section « concentrations ».
 *
 * Tout paramètre ajouté ici doit l'être aussi dans ALLOWED_PARAMETRES
 * (app/api/zone-concentrations/route.ts).
 */
const CONCENTRATION_PARAM_BY_CATEGORY: Record<
  string,
  { parametre: string; seuil?: SeuilConfig; note?: string }
> = {
  // PESTOT est le total publié par le contrôle sanitaire, avec les règles de
  // calcul de chaque époque. L'onglet « Dernières analyses » le recalcule
  // (TOTALPESTICIDE), d'où de possibles écarts sur le dernier point.
  pesticide: {
    parametre: "PESTOT",
    note: "Ce total est repris tel quel du contrôle sanitaire (paramètre PESTOT) : il n'est pas recalculé ici.",
  },
  pfas: { parametre: "SPFAS" },
  // 50 mg/L : limite de qualité réglementaire, rangée en valeur sanitaire
  // dans le référentiel.
  nitrate: {
    parametre: "NO3",
    seuil: {
      champ: "valeur_sanitaire_1",
      nom: { label: "limite de qualité", article: "une" },
    },
  },
  cvm: { parametre: "CLVYL" },
  // 4 µg/L : seuil d'alerte (nourrissons), pas une limite réglementaire.
  sub_indus_perchlorate: {
    parametre: "PCLAT",
    seuil: {
      champ: "valeur_sanitaire_1",
      nom: { label: "seuil d’alerte", article: "un" },
    },
  },
};

/**
 * Zones où la courbe de chlordécone (paramètre KEPONE) est affichée sous les
 * pesticides : Guadeloupe et Martinique, seuls départements où elle est
 * quantifiée. Les codes UDI comme les codes INSEE y commencent par le code
 * département.
 */
const CHLORDECONE_ZONE_PREFIXES = ["971", "972"];

/**
 * Catégories à plusieurs substances dont les bilans annuels listent les
 * substances quantifiées : seules à avoir l'évolution de leur nombre.
 */
const CATEGORIES_SUBSTANCES_QUANTIFIEES = new Set(["pfas", "pesticide"]);

type EvolutionTemporelleProps = {
  data: ZoneDetail;
  displayMode: "communes" | "udis";
  selectedZoneCode: string;
  colorblindMode: boolean;
  parameterValues: ParameterValues;
  onOpenAnalyses?: (filters?: AnalysesFilters) => void;
};

/** Une section du contenu déplié : petit titre gris, puis son contenu. */
function Section({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="py-3 first:pt-0 last:pb-0">
      {title && (
        <p className="mb-2 text-xs font-medium text-gray-500">{title}</p>
      )}
      {children}
    </section>
  );
}

/**
 * Courbe de concentration d'une catégorie. Chargée seulement quand la ligne
 * de l'accordéon est dépliée : une requête par catégorie consultée, plutôt
 * que toutes à l'ouverture de l'onglet.
 */
function ConcentrationSection({
  categoryDetails,
  parametre,
  title = "Évolution des concentrations",
  categorieNom = getForms(categoryDetails).article,
  seuil,
  note,
  displayMode,
  selectedZoneCode,
  parameterValues,
}: {
  categoryDetails: ICategory;
  parametre: string;
  title?: string;
  /** Pour la phrase « une seule analyse », par défaut celui de la catégorie. */
  categorieNom?: string;
  seuil?: SeuilConfig;
  note?: string;
  displayMode: "communes" | "udis";
  selectedZoneCode: string;
  parameterValues: ParameterValues;
}) {
  const [serie, setSerie] = useState<{
    points: ConcentrationPoint[];
    tronque: boolean;
  } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSerie(null);
    setError(false);

    fetch(
      `/api/zone-concentrations?type=${displayMode}&code=${encodeURIComponent(
        selectedZoneCode,
      )}&parametre=${parametre}`,
    )
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((payload) => {
        if (!cancelled) {
          setSerie({
            points: payload.points as ConcentrationPoint[],
            tronque: Boolean(payload.tronque),
          });
        }
      })
      .catch((err) => {
        console.error("Failed to fetch zone concentrations:", err);
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [displayMode, selectedZoneCode, parametre]);

  const paramRef = parameterValues[parametre];
  const seuilChamp = seuil?.champ ?? "limite_qualite";
  // Quand le seuil du bilan est la valeur sanitaire, elle n'est pas tracée
  // une seconde fois comme « limite sanitaire ».
  const valeurSanitaire =
    seuilChamp === "limite_qualite"
      ? (paramRef?.valeur_sanitaire_1 ?? null)
      : null;
  const paramName = getParameterName(parametre, parameterValues);

  return (
    <Section title={title}>
      <p className="mb-2 text-sm text-greydark leading-snug">
        {paramName}
        {categoryDetails.unite ? ` (en ${categoryDetails.unite})` : ""}
      </p>
      {error ? (
        <p className="text-sm text-gray-500">
          Impossible de charger les concentrations pour cette zone.
        </p>
      ) : !serie ? (
        <p className="text-sm text-gray-500">Chargement...</p>
      ) : (
        <>
          <ConcentrationChart
            points={serie.points}
            tronque={serie.tronque}
            unite={categoryDetails.unite}
            seuil={paramRef?.[seuilChamp] ?? null}
            seuilNom={seuil?.nom}
            valeurSanitaire={valeurSanitaire}
            label={paramName}
            categorieNom={categorieNom}
          />
          {note && (
            <p className="mt-1 text-[11px] text-gray-400 leading-relaxed">
              {note}
            </p>
          )}
        </>
      )}
    </Section>
  );
}

/** Contenu déplié d'une catégorie : ses graphiques d'évolution. */
function CategoryEvolutionContent({
  categoryDetails,
  data,
  displayMode,
  selectedZoneCode,
  colorblindMode,
  parameterValues,
  onOpenAnalyses,
}: {
  categoryDetails: ICategory;
  data: ZoneDetail;
  displayMode: "communes" | "udis";
  selectedZoneCode: string;
  colorblindMode: boolean;
  parameterValues: ParameterValues;
  onOpenAnalyses?: () => void;
}) {
  const concentration = CONCENTRATION_PARAM_BY_CATEGORY[categoryDetails.id];
  const showChlordecone =
    categoryDetails.id === "pesticide" &&
    CHLORDECONE_ZONE_PREFIXES.some((prefix) =>
      selectedZoneCode.startsWith(prefix),
    );

  return (
    <div className="divide-y divide-gray-100">
      {categoryDetails.bilanAnnuel && (
        <Section title="Évolution des taux de non-conformité">
          <AnnualRatioHistogram
            data={data}
            categoryDetails={categoryDetails}
            colorblindMode={colorblindMode}
          />
        </Section>
      )}

      {concentration && (
        <ConcentrationSection
          categoryDetails={categoryDetails}
          parametre={concentration.parametre}
          seuil={concentration.seuil}
          note={concentration.note}
          displayMode={displayMode}
          selectedZoneCode={selectedZoneCode}
          parameterValues={parameterValues}
        />
      )}

      {showChlordecone && (
        <ConcentrationSection
          categoryDetails={categoryDetails}
          parametre="KEPONE"
          title="Évolution de la chlordécone"
          categorieNom="la chlordécone"
          displayMode={displayMode}
          selectedZoneCode={selectedZoneCode}
          parameterValues={parameterValues}
        />
      )}

      {CATEGORIES_SUBSTANCES_QUANTIFIEES.has(categoryDetails.id) && (
        <Section title="Évolution du nombre de substances quantifiées">
          <SubstancesQuantifieesChart
            data={data}
            categoryId={categoryDetails.id}
            categorieNom={getForms(categoryDetails).article}
            colorblindMode={colorblindMode}
          />
        </Section>
      )}

      {onOpenAnalyses && (
        <Section>
          <button
            onClick={onOpenAnalyses}
            className="text-sm text-kaki hover:underline text-left"
          >
            Voir toutes les analyses de ce réseau pour{" "}
            {getForms(categoryDetails).article}.
          </button>
        </Section>
      )}
    </div>
  );
}

/**
 * Onglet « Évolution temporelle » : un accordéon par catégorie de premier
 * niveau. Contrairement à [DernieresAnalyses], il ne pilote pas la carte :
 * déplier une catégorie ne change rien à son affichage.
 */
export default function EvolutionTemporelle({
  data,
  displayMode,
  selectedZoneCode,
  colorblindMode,
  parameterValues,
  onOpenAnalyses,
}: EvolutionTemporelleProps) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  useEffect(() => {
    setOpenCategory(null);
  }, [displayMode, selectedZoneCode]);

  return (
    <div className="space-y-2">
      {TOP_LEVEL_CATEGORIES.map((item) => {
        const isOpen = openCategory === item.id;
        const analysesCategorie = getAnalysesCategorie(item.id);
        return (
          <div
            key={item.id}
            className={cn(
              "rounded-xl border bg-white overflow-hidden",
              isOpen ? "border-custom-drom" : "border-gray-200",
            )}
          >
            <button
              onClick={() => setOpenCategory(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-custom-drom"
            >
              <span className="flex-1 min-w-0 font-medium">
                {item.nomAffichage}
              </span>
              <ChevronDown
                size={18}
                className={cn(
                  "text-gray-400 flex-shrink-0 transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </button>

            {isOpen && (
              <div className="border-t border-gray-100 bg-white px-3 py-3 text-sm">
                <CategoryEvolutionContent
                  categoryDetails={item}
                  data={data}
                  displayMode={displayMode}
                  selectedZoneCode={selectedZoneCode}
                  colorblindMode={colorblindMode}
                  parameterValues={parameterValues}
                  onOpenAnalyses={
                    onOpenAnalyses && analysesCategorie
                      ? () => onOpenAnalyses({ categorie: analysesCategorie })
                      : undefined
                  }
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
