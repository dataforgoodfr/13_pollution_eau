"use client";

import { ChevronDown, ExternalLink, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  findTopLevelCategory,
  getCategoryById,
  getForms,
  TOP_LEVEL_CATEGORIES,
} from "@/lib/polluants";
import type { ICategory, Severity } from "@/lib/polluants";
import type { ParameterValues } from "@/app/lib/data";
import {
  formatValue,
  getParameterColor,
  getParameterName,
} from "@/lib/parametres";
import { CODES_SOMMES, getLastPrelResult } from "@/lib/zoneDetail";
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

type CategorySeverity = {
  item: ICategory;
  severity: Severity;
  nonConforme: boolean;
  deconseilleA: string | null;
};

function joinList(noms: string[]): string {
  if (noms.length <= 1) return noms.join("");
  return `${noms.slice(0, -1).join(", ")} et ${noms[noms.length - 1]}`;
}

function capitalize(text: string): string {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

/** « en PFAS et en pesticides » */
function joinEn(entries: CategorySeverity[]): string {
  return joinList(entries.map(({ item }) => `en ${getForms(item).nom}`));
}

/**
 * Phrases expliquant la couleur « tous polluants », de la plus grave à la
 * moins grave. La non-conformité est lue sur chaque résultat (`nonConforme`),
 * indépendamment de la gravité : une catégorie déconseillée peut donc aussi
 * être citée comme non conforme. Sans catégorie à citer (rien de quantifié,
 * ou rien de recherché), pas de phrase : le titre du bloc résumé suffit.
 */
function buildSummarySentences(entries: CategorySeverity[]): string[] {
  const bySeverity = (severity: Severity) =>
    entries.filter((entry) => entry.severity === severity);

  const sentences: string[] = [];

  const population = bySeverity("deconseille_population");
  if (population.length) {
    sentences.push(
      `L'eau devrait être interdite à la consommation pour toute la population, en raison d'une teneur trop élevée ${joinEn(population)}.`,
    );
  }

  // Une phrase par public concerné (« aux nourrissons de moins de 6 mois »…),
  // dans l'ordre des catégories.
  const sensiblesParPublic = new Map<string, CategorySeverity[]>();
  bySeverity("deconseille_sensibles").forEach((entry) => {
    const publics = entry.deconseilleA ?? "aux personnes sensibles";
    sensiblesParPublic.set(publics, [
      ...(sensiblesParPublic.get(publics) ?? []),
      entry,
    ]);
  });
  sensiblesParPublic.forEach((group, publics) => {
    sentences.push(
      `L'eau devrait être déconseillée ${publics} en raison d'une teneur trop élevée ${joinEn(group)}.`,
    );
  });

  const nonConformes = entries.filter((entry) => entry.nonConforme);
  if (nonConformes.length) {
    sentences.push(
      `L'eau est non conforme à la réglementation pour ${joinList(nonConformes.map(({ item }) => getForms(item).article))}.`,
    );
  }

  const vigilance = bySeverity("vigilance");
  if (vigilance.length) {
    sentences.push(
      `Les concentrations ${joinEn(vigilance)} sont conformes à la réglementation mais dépassent un seuil d'alerte.`,
    );
  }

  const quantifies = bySeverity("quantifie");
  const quantifiesSansPhrase = quantifies.filter(
    ({ item }) => !item.phraseQuantifie,
  );
  if (quantifiesSansPhrase.length) {
    const pluriel =
      quantifiesSansPhrase.length > 1 ||
      getForms(quantifiesSansPhrase[0].item).pluriel;
    const sujet = joinList(
      quantifiesSansPhrase.map(({ item }) => getForms(item).partitif),
    );
    sentences.push(
      `${capitalize(sujet)} ${pluriel ? "ont été quantifiés" : "a été quantifié"}, sans dépasser les limites réglementaires.`,
    );
  }
  quantifies.forEach(({ item }) => {
    if (item.phraseQuantifie) sentences.push(item.phraseQuantifie);
  });

  return sentences;
}

/**
 * Phrases de synthèse du dernier prélèvement, toutes catégories de premier
 * niveau confondues : une phrase par stade de gravité, de la plus grave à la
 * moins grave. Affichées une par ligne dans le bloc résumé.
 */
export function getZoneSummarySentences(data: ZoneDetail): string[] {
  const entries = TOP_LEVEL_CATEGORIES.map((item) => {
    // La gravité ne dépend pas du mode daltonien, seulement la couleur.
    const { severity, nonConforme, deconseilleA } = getLastPrelResult(
      data,
      item.id,
      false,
    );
    return { item, severity, nonConforme, deconseilleA };
  });
  return buildSummarySentences(entries);
}

/** Les mêmes phrases en un seul paragraphe, pour le texte de partage. */
export function getZoneSummarySentence(data: ZoneDetail): string | null {
  const sentences = getZoneSummarySentences(data);
  return sentences.length ? sentences.join(" ") : null;
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

/**
 * Phrase d'interprétation si au moins un métabolite non pertinent dépasse sa
 * limite indicative (0,9 µg/L) au dernier prélèvement, `null` sinon. Même
 * règle (strictement supérieur) que `int__resultats_metabolite_np_*`.
 */
function getMetabolitesNonPertinentsSentence(
  parametres: Array<{ code: string; value: number }>,
  parameterValues: ParameterValues,
): string | null {
  const depassement = parametres.some(({ code, value }) => {
    const param = parameterValues[code];
    return (
      param?.categorie_3 === "non_pertinent" &&
      param.limite_indicative != null &&
      value > param.limite_indicative
    );
  });
  return depassement
    ? "De plus, au moins un métabolite non pertinent dépasse la limite indicative de 0,9 µg/L. Les métabolites non pertinents ne sont pas soumis aux limites de qualité réglementaires, mais ce dépassement indique une dégradation de la qualité de l’eau."
    : null;
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
      <p className="mb-1.5 text-xs font-medium text-gray-500">{title}</p>
      <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100">
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
              className="flex items-baseline justify-between gap-3 px-2.5 py-1.5"
            >
              <span className="flex-1 min-w-0 text-gray-700">
                {getParameterName(code, parameterValues)}
              </span>
              <span
                className="flex items-baseline gap-1.5 whitespace-nowrap font-numbers tabular-nums"
                style={color ? { color } : undefined}
              >
                {color && (
                  <span
                    aria-hidden
                    title="Dépasse un seuil"
                    className="inline-block h-2 w-2 self-center rounded-full"
                    style={{ backgroundColor: color }}
                  />
                )}
                <span className={cn(color && "font-medium")}>
                  {formatValue(value)}
                </span>
                {unite && (
                  <span className={cn("text-xs", !color && "text-gray-400")}>
                    {unite}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Encart TFA affiché sous les PFAS. Le TFA a sa propre catégorie (carte
 * « tfa »), avec un dernier prélèvement qui peut dater d'un autre jour que
 * celui des 20 PFAS : on le lit donc dans `dernierPrel.tfa`.
 */
function TfaEncart({
  data,
  parameterValues,
}: {
  data: ZoneDetail;
  parameterValues: ParameterValues;
}) {
  const entry = data.dernierPrel.tfa;
  const valeur = entry?.parametresDetectes.TFA;
  const dateLabel = entry?.date
    ? new Date(entry.date).toLocaleDateString("fr-FR")
    : null;
  const nom = getParameterName("TFA", parameterValues);

  return (
    <div className="mt-3 rounded-lg border border-gray-200 px-3 py-2.5">
      <p className="mb-1 text-xs font-medium text-gray-500">{nom}</p>
      {!dateLabel ? (
        <p className="leading-relaxed text-gray-700">
          Le TFA n&apos;a pas été recherché au cours des 12 derniers mois dans
          le cadre du contrôle sanitaire. Son suivi deviendra obligatoire à
          partir du 1er janvier 2027.
        </p>
      ) : valeur ? (
        <>
          <p>Dernière analyse disponible le {dateLabel}</p>
          <p>
            {nom} :{" "}
            <span className="font-numbers">{formatValue(valeur)} µg/L</span>
          </p>
        </>
      ) : (
        <p>
          Lors de la dernière analyse disponible du {dateLabel}, le TFA n&apos;a
          pas été quantifié.
        </p>
      )}
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
  const isPfas = categoryDetails.id === "pfas";
  const quantifies = result.parametres;
  const tfaEncart = isPfas ? (
    <TfaEncart data={data} parameterValues={parameterValues} />
  ) : null;

  // Interprétation du résultat (facultative), toujours en fin de bloc. Pour
  // les pesticides, la phrase sur les métabolites non pertinents n'est
  // ajoutée que s'il y en a de quantifiés.
  const interpretationText = [
    result.interpretation,
    categoryDetails.id === "pesticide"
      ? getMetabolitesNonPertinentsSentence(quantifies, parameterValues)
      : null,
  ]
    .filter(Boolean)
    .join("\n");
  const interpretation = interpretationText ? (
    <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2.5">
      <p className="mb-1 text-xs font-medium text-gray-500">
        Interprétation des résultats
      </p>
      <p className="whitespace-pre-line leading-relaxed text-gray-700">
        {interpretationText}
        {categoryDetails.lienExterne && (
          <>
            <br />
            <a
              href={categoryDetails.lienExterne}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-kaki hover:underline"
            >
              En savoir plus <ExternalLink size={12} />
            </a>
          </>
        )}
      </p>
    </div>
  ) : null;

  if (!result.date) {
    return (
      <>
        <p>Pas d&apos;analyse effectuée dans les 12 derniers mois.</p>
        {tfaEncart}
        {interpretation}
      </>
    );
  }

  const dateLabel = new Date(result.date).toLocaleDateString("fr-FR");
  const isSingleSubstance = SINGLE_SUBSTANCE_CATEGORIES.has(categoryDetails.id);
  const isPesticide = categoryDetails.id === "pesticide";

  const detailLink = onOpenAnalyses ? (
    <button
      onClick={() => onOpenAnalyses(result.date!.slice(0, 10))}
      className="text-kaki hover:underline whitespace-nowrap"
    >
      Voir les résultats détaillés.
    </button>
  ) : null;

  if (isSingleSubstance) {
    const substance = quantifies[0];
    const { article, pluriel } = getForms(categoryDetails);
    return (
      <>
        {substance ? (
          <>
            <p>Dernière analyse disponible le {dateLabel}</p>
            <p>
              {getParameterName(substance.code, parameterValues)} :{" "}
              <span className="font-numbers">
                {formatValue(substance.value)} {categoryDetails.unite || ""}
              </span>
            </p>
          </>
        ) : (
          <p>
            Lors de la dernière analyse disponible du {dateLabel}, {article}{" "}
            {pluriel ? "n'ont pas été quantifiés" : "n'a pas été quantifié"}.
          </p>
        )}
        {detailLink && <p className="mt-3">{detailLink}</p>}
        {interpretation}
      </>
    );
  }

  const nbParametres = result.nbParametres ?? 0;
  const nbQuantifiees = quantifies.filter(
    ({ code }) => !CODES_SOMMES.has(code),
  ).length;

  // Catégories à plusieurs substances : le détail des quantifiées est
  // toujours affiché en listes verticales sous la phrase (comme pour les
  // pesticides), jamais énuméré inline dans la phrase elle-même.
  const substanceGroups = isPesticide
    ? groupPesticideParametres(quantifies, parameterValues)
    : isPfas
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
        Lors de la dernière analyse disponible du {dateLabel},{" "}
        {nbParametres > 1
          ? `${nbParametres} substances ont été recherchées`
          : nbParametres === 1
            ? "1 substance a été recherchée"
            : "aucune substance n'a été recherchée"}{" "}
        et{" "}
        {nbQuantifiees > 1
          ? `${nbQuantifiees} substances ont été quantifiées`
          : nbQuantifiees === 1
            ? "1 substance a été quantifiée"
            : "aucune substance n'a été quantifiée"}
        .
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
      {tfaEncart}
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

  const globalResult = getLastPrelResult(data, "tous", colorblindMode);
  const summarySentences = getZoneSummarySentences(data);
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
            <span className="text-right">Eau interdite</span>
          </div>
        </div>

        {summarySentences.length > 0 && (
          <div className="mt-4 space-y-1.5 pt-2 text-sm">
            {summarySentences.map((sentence) => (
              <p key={sentence}>{sentence}</p>
            ))}
          </div>
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
