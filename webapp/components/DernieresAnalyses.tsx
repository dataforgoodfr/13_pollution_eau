"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  findTopLevelCategory,
  getCategoryById,
  TOP_LEVEL_CATEGORIES,
} from "@/lib/polluants";
import type { ICategory, Severity } from "@/lib/polluants";
import type { ParameterValues } from "@/app/lib/data";
import {
  formatValue,
  getParameterColor,
  getParameterName,
  groupPesticideParametres,
} from "@/lib/parametres";
import { getLastPrelResult, type ZoneDetail } from "@/lib/zoneDetail";
import {
  getAnalysesCategorie,
  type AnalysesFilters,
} from "@/components/AnalysesModal";
import PollutionColorScale from "@/components/PollutionColorScale";

// Catégories de premier niveau n'ayant qu'une seule substance recherchée :
// pas de décompte "N substances recherchées", juste "la substance a été
// quantifiée / n'a pas été quantifiée".
const SINGLE_SUBSTANCE_CATEGORIES = new Set([
  "nitrate",
  "cvm",
  "sub_indus_perchlorate",
]);

/**
 * Morceau de phrase décrivant une gravité, complété par la liste des
 * catégories concernées. Les catégories sont toujours placées après « pour »
 * pour éviter tout problème d'accord (« le CVM », « les pesticides »…).
 * `null` = gravité qui n'apparaît pas dans la phrase de résumé.
 */
const SEVERITY_CLAUSE: Record<Severity, ((noms: string) => string) | null> = {
  deconseille: (noms) =>
    `l'eau devrait être déconseillée à la consommation pour tout ou partie de la population, en raison des concentrations mesurées pour ${noms}`,
  non_conforme: (noms) =>
    `les limites réglementaires sont dépassées pour ${noms}`,
  vigilance: (noms) =>
    `des concentrations élevées, sans non-conformité, ont été mesurées pour ${noms}`,
  quantifie: (noms) =>
    `des polluants ont été quantifiés pour ${noms}, sous les limites réglementaires`,
  non_quantifie: null,
  non_recherche: null,
};

const SEVERITY_ORDER: Severity[] = [
  "deconseille",
  "non_conforme",
  "vigilance",
  "quantifie",
];

/** Nom de la catégorie tel qu'il s'insère dans une phrase (avec son article). */
const CATEGORY_DANS_PHRASE: Record<string, string> = {
  pfas: "les PFAS",
  pesticide: "les pesticides",
  nitrate: "les nitrates",
  cvm: "le CVM",
  sub_indus: "les substances industrielles",
  sub_indus_perchlorate: "le perchlorate",
  "metaux-lourds": "les métaux lourds",
};

function joinNames(categories: ICategory[]): string {
  const noms = categories.map(
    (item) => CATEGORY_DANS_PHRASE[item.id] ?? `les ${item.nomAffichage}`,
  );
  if (noms.length <= 1) return noms.join("");
  return `${noms.slice(0, -1).join(", ")} et ${noms[noms.length - 1]}`;
}

/**
 * Phrase expliquant la couleur « tous polluants », construite à partir des
 * catégories regroupées par gravité. Sans catégorie à citer (rien de
 * quantifié, ou rien de recherché), on retombe sur l'explication générique de
 * la catégorie "tous".
 */
function buildSummarySentence(
  buckets: Map<Severity, ICategory[]>,
  fallback: string | null,
): string | null {
  const clauses = SEVERITY_ORDER.flatMap((severity) => {
    const bucket = buckets.get(severity);
    const clause = SEVERITY_CLAUSE[severity];
    if (!bucket?.length || !clause) return [];
    return [clause(joinNames(bucket))];
  });

  if (clauses.length === 0) return fallback;

  const sentence = clauses.join(" ; ");
  return `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`;
}

/** Liste verticale de substances quantifiées, groupée sous un titre (pesticides, PFAS…). */
function SubstanceList({
  parametres,
  categoryId,
  unite,
  parameterValues,
  title,
}: {
  parametres: Array<{ code: string; value: number }>;
  categoryId: string;
  unite?: string;
  parameterValues: ParameterValues;
  title: string;
}) {
  if (parametres.length === 0) return null;

  return (
    <div className="mt-3">
      <p className="font-medium mb-1.5 text-xs">{title}</p>
      <ul className="space-y-1 border-l-2 border-gray-200 pl-2">
        {parametres.map(({ code, value }) => {
          const color = getParameterColor(
            code,
            value,
            parameterValues,
            categoryId,
          );
          return (
            <li
              key={code}
              className="flex justify-between items-start gap-2 text-sm"
            >
              <span
                className="font-light flex-1"
                style={color ? { color } : undefined}
              >
                {getParameterName(code, parameterValues)}
              </span>
              <span
                className="font-light whitespace-nowrap font-numbers"
                style={color ? { color } : undefined}
              >
                {formatValue(value)} {unite || ""}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Contenu déplié d'une catégorie : le dernier prélèvement connu. */
function CategoryContent({
  categoryDetails,
  data,
  colorblindMode,
  parameterValues,
  onOpenAnalyses,
}: {
  categoryDetails: ICategory;
  data: ZoneDetail;
  colorblindMode: boolean;
  parameterValues: ParameterValues;
  onOpenAnalyses?: (date?: string) => void;
}) {
  const result = getLastPrelResult(data, categoryDetails.id, colorblindMode);

  if (!result.date) {
    return (
      <p className="text-sm text-gray-600">
        Pas d&apos;analyse effectuée dans les 12 derniers mois
      </p>
    );
  }

  const dateLabel = new Date(result.date).toLocaleDateString("fr-FR");
  const isSingleSubstance = SINGLE_SUBSTANCE_CATEGORIES.has(categoryDetails.id);
  const isPesticide = categoryDetails.id === "pesticide";
  const quantifies = result.parametres;

  const detailLink = onOpenAnalyses ? (
    <button
      onClick={() => onOpenAnalyses(result.date!.slice(0, 10))}
      className="text-custom-drom hover:underline whitespace-nowrap"
    >
      Voir les résultats détaillés.
    </button>
  ) : null;

  if (isSingleSubstance) {
    const substance = quantifies[0];
    return (
      <>
        <p className="text-sm text-gray-600 leading-relaxed">
          Lors de la dernière analyse en date du {dateLabel},{" "}
          {substance ? (
            <>
              la substance a été quantifiée (
              {getParameterName(substance.code, parameterValues)}{" "}
              {formatValue(substance.value)} {categoryDetails.unite || ""})
            </>
          ) : (
            "la substance n'a pas été quantifiée"
          )}
          .
        </p>
        {result.explication && (
          <p className="mt-3 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {result.explication}
          </p>
        )}
        {detailLink && <p className="mt-3 text-sm">{detailLink}</p>}
      </>
    );
  }

  const nbParametres = result.nbParametres ?? 0;

  // Catégories à plusieurs substances : le détail des quantifiées est
  // toujours affiché en listes verticales sous la phrase (comme pour les
  // pesticides), jamais énuméré inline dans la phrase elle-même.
  const substanceGroups = isPesticide
    ? groupPesticideParametres(quantifies, parameterValues)
    : quantifies.length > 0
      ? [
          {
            key: "quantifiees",
            titre: "Substances quantifiées",
            params: quantifies,
          },
        ]
      : [];

  return (
    <>
      <p className="text-sm text-gray-600 leading-relaxed">
        Lors de la dernière analyse en date du {dateLabel},{" "}
        {nbParametres > 1
          ? `${nbParametres} substances ont été recherchées`
          : nbParametres === 1
            ? "1 substance a été recherchée"
            : "aucune substance n'a été recherchée"}
        {quantifies.length > 0 ? (
          <>
            {" et "}
            {quantifies.length > 1
              ? `${quantifies.length} substances ont été quantifiées.`
              : "1 substance a été quantifiée."}
          </>
        ) : (
          " et aucune substance n'a été quantifiée"
        )}
      </p>
      {quantifies.length === 0 && detailLink && (
        <p className="mt-3 text-sm">{detailLink}</p>
      )}
      {result.explication && (
        <p className="mt-3 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
          {result.explication}
        </p>
      )}
      {substanceGroups.length > 0 && (
        <>
          {substanceGroups.map((group) => (
            <SubstanceList
              key={group.key}
              title={group.titre}
              parametres={group.params}
              categoryId={categoryDetails.id}
              unite={categoryDetails.unite}
              parameterValues={parameterValues}
            />
          ))}
          {detailLink && <p className="mt-3 text-sm">{detailLink}</p>}
        </>
      )}
    </>
  );
}

/** Une ligne de l'accordéon, une par catégorie de premier niveau. */
function CategoryRow({
  categoryId,
  data,
  isOpen,
  onToggle,
  colorblindMode,
  parameterValues,
  onOpenAnalyses,
}: {
  categoryId: string;
  data: ZoneDetail;
  isOpen: boolean;
  onToggle: () => void;
  colorblindMode: boolean;
  parameterValues: ParameterValues;
  onOpenAnalyses?: (date?: string) => void;
}) {
  const categoryDetails = getCategoryById(categoryId);
  if (!categoryDetails) return null;

  const result = getLastPrelResult(data, categoryId, colorblindMode);

  return (
    <div
      className={cn(
        "rounded-xl border bg-white overflow-hidden",
        isOpen ? "border-custom-drom" : "border-gray-200",
      )}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-gray-50"
      >
        <PollutionColorScale
          category={categoryId}
          period="dernier_prel"
          colorblindMode={colorblindMode}
          activeKey={result.resultKey}
        />
        <span className="flex-1 min-w-0">
          <span className="block font-medium">
            {categoryDetails.nomAffichage}
          </span>
          <span className="block text-gray-500 leading-snug text-sm">
            {result.label}
          </span>
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
        <div className="border-t border-gray-100 bg-white px-3 py-3">
          {categoryDetails.description && (
            <p className="mb-3 text-sm text-gray-600 leading-relaxed">
              {categoryDetails.description}
            </p>
          )}
          <CategoryContent
            categoryDetails={categoryDetails}
            data={data}
            colorblindMode={colorblindMode}
            parameterValues={parameterValues}
            onOpenAnalyses={onOpenAnalyses}
          />
        </div>
      )}
    </div>
  );
}

type DernieresAnalysesProps = {
  data: ZoneDetail;
  displayMode: "communes" | "udis";
  colorblindMode: boolean;
  parameterValues: ParameterValues;
  /** Catégorie affichée sur la carte : pilote l'accordéon, et inversement. */
  category: string;
  setCategory: (category: string) => void;
  onOpenAnalyses?: (filters?: AnalysesFilters) => void;
};

/**
 * Onglet "Dernières analyses" : le résumé toutes catégories puis l'accordéon,
 * sur le dernier prélèvement connu de la zone. Contrairement à
 * [EvolutionTemporelle], cette vue est synchronisée avec la carte — déplier
 * une catégorie l'y affiche.
 */
export default function DernieresAnalyses({
  data,
  displayMode,
  colorblindMode,
  parameterValues,
  category,
  setCategory,
  onOpenAnalyses,
}: DernieresAnalysesProps) {
  // "tous" = tout replié, et c'est ce que la carte affiche par défaut : replier
  // un accordéon y revient. Si la carte
  // affiche une sous-catégorie (ex. une molécule de pesticide précise), on
  // ouvre sa catégorie parente : il n'y a pas de ligne dédiée à la
  // sous-catégorie dans ce panel.
  const openTopLevel =
    category === "tous" ? undefined : findTopLevelCategory(category);

  const toggleTopLevel = (categoryId: string) => {
    setCategory(openTopLevel?.id === categoryId ? "tous" : categoryId);
  };

  // Bloc résumé : regroupe les catégories de premier niveau par gravité.
  const summaryBuckets = new Map<Severity, ICategory[]>();
  TOP_LEVEL_CATEGORIES.forEach((item) => {
    const { severity } = getLastPrelResult(data, item.id, colorblindMode);
    if (!SEVERITY_CLAUSE[severity]) return;
    const bucket = summaryBuckets.get(severity) || [];
    bucket.push(item);
    summaryBuckets.set(severity, bucket);
  });

  const globalResult = getLastPrelResult(data, "tous", colorblindMode);
  const summarySentence = buildSummarySentence(
    summaryBuckets,
    globalResult.explication,
  );
  const globalDate = globalResult.date
    ? new Date(globalResult.date).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-4">
      {/* Résumé toutes catégories. Bloc purement informatif : il ne pilote pas
          la carte, qui affiche déjà "tous" tant qu'aucun accordéon n'est
          ouvert. */}
      <section className="rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-4">
        <div className="flex items-start gap-4">
          {/* Le halo est un élément à part (et non un box-shadow) pour pouvoir
              l'animer sans faire bouger la pastille elle-même. */}
          <span className="relative flex-shrink-0 w-[62px] h-[62px] mx-1 mt-1">
            <span
              aria-hidden
              className="absolute -inset-[5px] rounded-full animate-halo-ping motion-reduce:hidden"
              style={{ backgroundColor: globalResult.color }}
            />
            <span
              className="relative block w-full h-full rounded-full border border-kaki/25"
              style={{ backgroundColor: globalResult.color }}
            />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-medium leading-tight text-gray-900 text-pretty">
              {globalResult.label}
            </p>
            {globalDate && (
              <p className="mt-1.5 text-xs leading-relaxed text-greydark">
                Dernière analyse le{" "}
                <span className="font-numbers">{globalDate}</span>
                {globalResult.nbParametres ? (
                  <>
                    {" · "}
                    <span className="font-numbers">
                      {globalResult.nbParametres}
                    </span>{" "}
                    substances recherchées
                  </>
                ) : null}
              </p>
            )}
          </div>
        </div>

        {summarySentence && (
          <p className="mt-3.5 pt-3 border-t border-gray-200 text-[13px] leading-relaxed text-gray-700">
            {summarySentence}
          </p>
        )}
      </section>

      {/* Accordéon par catégorie */}
      <div className="space-y-2">
        {TOP_LEVEL_CATEGORIES.map((item) => {
          const analysesCategorie = getAnalysesCategorie(item.id);
          return (
            <CategoryRow
              key={item.id}
              categoryId={item.id}
              data={data}
              isOpen={openTopLevel?.id === item.id}
              onToggle={() => toggleTopLevel(item.id)}
              colorblindMode={colorblindMode}
              parameterValues={parameterValues}
              onOpenAnalyses={
                displayMode === "udis" && analysesCategorie && onOpenAnalyses
                  ? (date?: string) =>
                      onOpenAnalyses({ categorie: analysesCategorie, date })
                  : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );
}
