"use client";

import { ChevronDown, Info } from "lucide-react";
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
} from "@/lib/parametres";
import { getLastPrelResult } from "@/lib/zoneDetail";
import type { ZoneDetail } from "@/app/api/zone-detail/route";
import {
  getAnalysesCategorie,
  type AnalysesFilters,
} from "@/components/AnalysesModal";
import PollutionColorScale from "@/components/PollutionColorScale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  deconseille_population: (noms) =>
    `l'eau devrait être déconseillée à la consommation pour toute la population, en raison des concentrations mesurées pour ${noms}`,
  deconseille_sensibles: (noms) =>
    `l'eau devrait être déconseillée aux personnes sensibles (nourrissons, femmes enceintes…), en raison des concentrations mesurées pour ${noms}`,
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
  "deconseille_population",
  "deconseille_sensibles",
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
 * quantifié, ou rien de recherché), pas de phrase : le titre du bloc résumé
 * suffit.
 */
function buildSummarySentence(
  buckets: Map<Severity, ICategory[]>,
): string | null {
  const clauses = SEVERITY_ORDER.flatMap((severity) => {
    const bucket = buckets.get(severity);
    const clause = SEVERITY_CLAUSE[severity];
    if (!bucket?.length || !clause) return [];
    return [clause(joinNames(bucket))];
  });

  if (clauses.length === 0) return null;

  const sentence = clauses.join(" ; ");
  return `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`;
}

type SubstanceGroup = {
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
function groupPesticideParametres(
  parametres: Array<{ code: string; value: number }>,
  parameterValues: ParameterValues,
): SubstanceGroup[] {
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

// Sommes calculées par `int__resultats_pfas_*_dernier.sql`, affichées après
// les substances (somme des 20 puis somme des 4).
const PFAS_SOMMES = ["SPFAS", "SUM_4_PFAS"];

/** Sépare les PFAS quantifiés (par concentration décroissante) des deux sommes. */
function groupPfasParametres(
  parametres: Array<{ code: string; value: number }>,
): SubstanceGroup[] {
  const substances = parametres.filter((p) => !PFAS_SOMMES.includes(p.code));
  const sommes = PFAS_SOMMES.flatMap((code) =>
    parametres.filter((p) => p.code === code),
  );
  return [
    { key: "quantifiees", titre: "Substances quantifiées", params: substances },
    { key: "sommes", titre: "Sommes", params: sommes },
  ].filter((group) => group.params.length > 0);
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
            <li key={code} className="flex justify-between items-start gap-2">
              <span className="flex-1" style={color ? { color } : undefined}>
                {getParameterName(code, parameterValues)}
              </span>
              <span
                className="whitespace-nowrap font-numbers"
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
    return <p>Pas d&apos;analyse effectuée dans les 12 derniers mois</p>;
  }

  const dateLabel = new Date(result.date).toLocaleDateString("fr-FR");
  const isSingleSubstance = SINGLE_SUBSTANCE_CATEGORIES.has(categoryDetails.id);
  const isPesticide = categoryDetails.id === "pesticide";
  const quantifies = result.parametres;

  const detailLink = onOpenAnalyses ? (
    <button
      onClick={() => onOpenAnalyses(result.date!.slice(0, 10))}
      className="text-kaki hover:underline whitespace-nowrap"
    >
      Voir les résultats détaillés.
    </button>
  ) : null;

  // Interprétation du résultat (facultative), toujours en fin de bloc.
  const interpretation = result.interpretation ? (
    <p className="mt-3 whitespace-pre-line">{result.interpretation}</p>
  ) : null;

  if (isSingleSubstance) {
    const substance = quantifies[0];
    return (
      <>
        <p>
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
        {detailLink && <p className="mt-3">{detailLink}</p>}
        {interpretation}
      </>
    );
  }

  const nbParametres = result.nbParametres ?? 0;

  // Catégories à plusieurs substances : le détail des quantifiées est
  // toujours affiché en listes verticales sous la phrase (comme pour les
  // pesticides), jamais énuméré inline dans la phrase elle-même.
  const substanceGroups = isPesticide
    ? groupPesticideParametres(quantifies, parameterValues)
    : categoryDetails.id === "pfas"
      ? groupPfasParametres(quantifies)
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
      <p>
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
      {detailLink && <p className="mt-3">{detailLink}</p>}
      {interpretation}
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
  const dateLabel = result.date
    ? new Date(result.date).toLocaleDateString("fr-FR")
    : null;

  return (
    <div
      className={cn(
        "rounded-xl border bg-white overflow-hidden",
        isOpen ? "border-custom-drom" : "border-gray-200",
      )}
    >
      {/* L'en-tête contient deux boutons (dépliage et "i") qui ne peuvent pas
          être imbriqués : le bouton de dépliage couvre toute la ligne via son
          pseudo-élément ::after, et le "i" passe au-dessus (relative z-10). */}
      <div className="relative flex items-center gap-3 px-3 py-3 transition-colors hover:bg-gray-50">
        {/* Au-dessus du bouton de dépliage (comme le "i") pour que les
            tooltips des segments soient survolables ; un clic déplie quand
            même la ligne. */}
        <span className="relative z-10 cursor-pointer" onClick={onToggle}>
          <PollutionColorScale
            category={categoryId}
            period="dernier_prel"
            colorblindMode={colorblindMode}
            activeKey={result.resultKey}
          />
        </span>
        <span className="flex-1 min-w-0">
          <span className="flex items-center gap-1">
            <button
              onClick={onToggle}
              aria-expanded={isOpen}
              className="font-medium text-left after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-custom-drom"
            >
              {categoryDetails.nomAffichage}
            </button>
            {categoryDetails.description && (
              <Popover>
                <PopoverTrigger
                  aria-label={`En savoir plus sur ${categoryDetails.nomAffichage}`}
                  className="relative z-10 inline-flex text-gray-400 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 rounded-full"
                >
                  <Info size={14} />
                </PopoverTrigger>
                <PopoverContent
                  side="bottom"
                  align="start"
                  collisionPadding={8}
                  className="z-[70] w-72 max-w-[calc(100vw-2rem)] p-3 text-sm leading-snug text-gray-700"
                >
                  {categoryDetails.description}
                </PopoverContent>
              </Popover>
            )}
            {dateLabel && (
              <span className="ml-auto pl-2 text-xs text-gray-400 font-numbers whitespace-nowrap">
                {dateLabel}
              </span>
            )}
          </span>
          <span
            className="block truncate text-greydark leading-snug text-sm"
            title={result.label}
          >
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
      </div>

      {isOpen && (
        <div className="border-t border-gray-100 bg-white px-3 py-3 text-sm">
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
  const summarySentence = buildSummarySentence(summaryBuckets);
  return (
    <div className="space-y-4">
      {/* Résumé toutes catégories. Bloc purement informatif : il ne pilote pas
          la carte, qui affiche déjà "tous" tant qu'aucun accordéon n'est
          ouvert. */}
      <section className="rounded-xl border border-gray-200 bg-gray-50 px-3.5 pt-4 pb-3.5">
        <p className="text-lg font-semibold leading-tight text-gray-900 text-pretty">
          {globalResult.label}
        </p>

        {/* Échelle de gravité "tous polluants" : situe le résultat de la zone
            entre le meilleur et le pire cas. */}
        <div className="mt-3">
          <PollutionColorScale
            category="tous"
            period="dernier_prel"
            colorblindMode={colorblindMode}
            activeKey={globalResult.resultKey}
            size="lg"
            showMarker
          />
          <div className="mt-2 flex justify-between gap-4 text-[10px] leading-tight text-gray-500">
            <span>Aucun polluant</span>
            <span className="text-right">Eau déconseillée</span>
          </div>
        </div>

        {summarySentence && (
          <p className="mt-4 pt-2 text-sm">
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
