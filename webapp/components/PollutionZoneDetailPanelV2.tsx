"use client";

import { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { availableCategories, getCategoryById } from "@/lib/polluants";
import type { ICategory } from "@/lib/polluants";
import type { ParameterValues } from "@/app/lib/data";
import {
  findTopLevelCategory,
  formatValue,
  getAnnualResult,
  getLastPrelResult,
  getParameterColor,
  getParameterName,
  readNumber,
  readString,
  type Severity,
  type ZoneDetail,
} from "@/lib/panelUtils";

type PollutionZoneDetailPanelV2Props = {
  period: string;
  setPeriod: (period: string) => void;
  category: string;
  setCategory: (category: string) => void;
  displayMode: "communes" | "udis";
  selectedZoneCode: string | null;
  colorblindMode?: boolean;
  parameterValues: ParameterValues;
  onClose?: () => void;
};

// Ordre d'affichage de l'accordéon : celui de availableCategories, "tous" étant
// traité à part dans le bloc résumé.
const PANEL_CATEGORIES = availableCategories.filter(
  (item) => !item.disable && item.id !== "tous",
);

const BILAN_YEARS = ["2026", "2025", "2024", "2023", "2022", "2021", "2020"];
const DEFAULT_BILAN_PERIOD = `bilan_annuel_${BILAN_YEARS[0]}`;

const SEVERITY_INTRO: Record<Severity, string | null> = {
  deconseille:
    "Eau devant être déconseillée à la consommation pour tout ou partie de la population en raison de :",
  non_conforme: "Eau non conforme aux limites réglementaires pour :",
  vigilance: "Concentrations élevées, sans non conformité, pour :",
  quantifie: "Quantifié sous les limites de qualité :",
  non_quantifie: null,
  non_recherche: null,
};

const SEVERITY_ORDER: Severity[] = [
  "deconseille",
  "non_conforme",
  "vigilance",
  "quantifie",
];

function Dot({ color, large = false }: { color: string; large?: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full flex-shrink-0 border border-black/10",
        large ? "w-4 h-4" : "w-3 h-3",
      )}
      style={{ backgroundColor: color }}
    />
  );
}

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
              className="flex justify-between items-start gap-2 text-xs"
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

/** Historique des bilans annuels d'une catégorie, une ligne par année. */
function AnnualHistory({
  data,
  categoryId,
  period,
  setPeriod,
  colorblindMode,
}: {
  data: ZoneDetail;
  categoryId: string;
  period: string;
  setPeriod: (period: string) => void;
  colorblindMode: boolean;
}) {
  return (
    <div className="mt-2">
      <ul className="space-y-1">
        {BILAN_YEARS.map((year) => {
          const yearPeriod = `bilan_annuel_${year}`;
          const result = getAnnualResult(
            data,
            yearPeriod,
            categoryId,
            colorblindMode,
          );
          const isActive = period === yearPeriod;

          return (
            <li key={year}>
              <button
                onClick={() => setPeriod(yearPeriod)}
                className={cn(
                  "w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors",
                  isActive ? "bg-gray-100" : "hover:bg-gray-50",
                )}
              >
                <span className="font-numbers w-9 flex-shrink-0 text-gray-500">
                  {year}
                </span>
                <Dot color={result.color} />
                <span className="flex-1">
                  {result.hasData ? result.label : "Aucune recherche"}
                </span>
                {result.hasData && (
                  <span className="text-gray-400 whitespace-nowrap">
                    {result.nbPrelevements}{" "}
                    {Number(result.nbPrelevements) > 1 ? "analyses" : "analyse"}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-1.5 text-[11px] text-gray-400">
        Cliquez sur une année pour l’afficher sur la carte.
      </p>
    </div>
  );
}

/** Contenu déplié d'une catégorie : dernières analyses ou bilans annuels. */
function CategoryContent({
  categoryDetails,
  data,
  period,
  setPeriod,
  colorblindMode,
  parameterValues,
}: {
  categoryDetails: ICategory;
  data: ZoneDetail;
  period: string;
  setPeriod: (period: string) => void;
  colorblindMode: boolean;
  parameterValues: ParameterValues;
}) {
  if (period !== "dernier_prel") {
    const current = getAnnualResult(
      data,
      period,
      categoryDetails.id,
      colorblindMode,
    );
    return (
      <>
        {current.hasData && !!current.nbSupValeurSanitaire && (
          <p className="text-xs text-gray-600">
            {current.nbSupValeurSanitaire}
            {current.nbSupValeurSanitaire > 1
              ? " analyses dépassent "
              : " analyse dépasse "}
            {categoryDetails.resultatsAnnuels?.valeurSanitaireLabel ||
              "la limite sanitaire"}{" "}
            en {period.split("_")[2]}.
          </p>
        )}
        <AnnualHistory
          data={data}
          categoryId={categoryDetails.id}
          period={period}
          setPeriod={setPeriod}
          colorblindMode={colorblindMode}
        />
      </>
    );
  }

  const result = getLastPrelResult(data, categoryDetails.id, colorblindMode);

  return (
    <>
      {result.date && (
        <p className="text-xs text-gray-500">
          Analyse du {new Date(result.date).toLocaleDateString("fr-FR")}
          {result.nbParametres
            ? ` — ${result.nbParametres} ${result.nbParametres > 1 ? "paramètres recherchés" : "paramètre recherché"}`
            : ""}
        </p>
      )}
      <SubstanceList
        parametres={result.parametres}
        categoryId={categoryDetails.id}
        unite={categoryDetails.unite}
        parameterValues={parameterValues}
        title="Substances quantifiées"
      />
    </>
  );
}

/**
 * Une ligne de l'accordéon. `level` 0 pour une catégorie de premier niveau,
 * 1 pour une sous-catégorie (pesticides).
 */
function CategoryRow({
  categoryId,
  label,
  level,
  data,
  period,
  setPeriod,
  isOpen,
  onToggle,
  colorblindMode,
  parameterValues,
  children,
}: {
  categoryId: string;
  label?: string;
  level: 0 | 1;
  data: ZoneDetail;
  period: string;
  setPeriod: (period: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  colorblindMode: boolean;
  parameterValues: ParameterValues;
  children?: React.ReactNode;
}) {
  const categoryDetails = getCategoryById(categoryId);
  if (!categoryDetails) return null;

  const isBilan = period !== "dernier_prel";
  const result = isBilan
    ? getAnnualResult(data, period, categoryId, colorblindMode)
    : getLastPrelResult(data, categoryId, colorblindMode);
  const year = period.split("_")[2];
  const summaryLabel = !isBilan
    ? result.label
    : "hasData" in result && !result.hasData
      ? `Aucune recherche en ${year}`
      : `${result.label} en ${year}`;

  return (
    <div
      className={cn(
        "rounded-xl border bg-white overflow-hidden",
        isOpen ? "border-custom-drom" : "border-gray-200",
        level === 1 && "bg-gray-50/60",
      )}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className={cn(
          "w-full flex items-center gap-3 px-3 text-left transition-colors hover:bg-gray-50",
          level === 0 ? "py-3" : "py-2",
        )}
      >
        <Dot color={result.color} large={level === 0} />
        <span className="flex-1 min-w-0">
          <span
            className={cn(
              "block",
              level === 0 ? "font-medium" : "text-xs font-medium",
            )}
          >
            {label || categoryDetails.nomAffichage}
          </span>
          <span
            className={cn(
              "block text-gray-500 leading-snug",
              level === 0 ? "text-xs" : "text-[11px]",
            )}
          >
            {summaryLabel}
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
          <CategoryContent
            categoryDetails={categoryDetails}
            data={data}
            period={period}
            setPeriod={setPeriod}
            colorblindMode={colorblindMode}
            parameterValues={parameterValues}
          />
          {children}
        </div>
      )}
    </div>
  );
}

export default function PollutionZoneDetailPanelV2({
  period,
  setPeriod,
  category,
  setCategory,
  displayMode,
  selectedZoneCode,
  colorblindMode = false,
  parameterValues,
  onClose,
}: PollutionZoneDetailPanelV2Props) {
  const [zoneData, setZoneData] = useState<ZoneDetail | null>(null);
  const [zoneDataError, setZoneDataError] = useState(false);

  useEffect(() => {
    if (!selectedZoneCode) {
      setZoneData(null);
      setZoneDataError(false);
      return;
    }

    let cancelled = false;
    setZoneData(null);
    setZoneDataError(false);

    fetch(
      `/api/zone-detail?type=${displayMode}&code=${encodeURIComponent(selectedZoneCode)}`,
    )
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => {
        if (!cancelled) {
          setZoneData(data);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch zone detail:", error);
        if (!cancelled) {
          setZoneDataError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedZoneCode, displayMode]);

  if (!selectedZoneCode) {
    return null;
  }

  const closeButton = (
    <button
      className="absolute top-5 right-5 text-black bg-white rounded-full p-2 shadow-md hover:text-gray-800 hover:bg-gray-100 transition duration-300 z-10"
      onClick={() => onClose?.()}
      aria-label="Fermer"
    >
      <X className="w-6 h-6" />
    </button>
  );

  if (zoneDataError || !zoneData) {
    return (
      <div className="h-full flex flex-col relative">
        {closeButton}
        <div className="bg-white p-4 flex-1 rounded-t-lg flex items-center justify-center text-gray-500 text-sm text-center">
          {zoneDataError
            ? "Impossible de charger les données pour cette zone."
            : "Chargement..."}
        </div>
      </div>
    );
  }

  const isBilan = period !== "dernier_prel";
  const title =
    displayMode === "communes"
      ? readString(zoneData, "commune_nom")
      : readString(zoneData, "nomreseaux");
  const code =
    displayMode === "communes"
      ? readString(zoneData, "commune_code_insee")
      : readString(zoneData, "cdreseau");
  const population = readNumber(zoneData, "population");
  const communesDesservies = Array.isArray(zoneData["communes_desservies"])
    ? (zoneData["communes_desservies"] as string[])
    : [];

  // La catégorie sélectionnée sur la carte pilote l'accordéon (et inversement) :
  // "tous" = tout replié, le bloc résumé est alors mis en avant.
  const openTopLevel =
    category === "tous"
      ? undefined
      : findTopLevelCategory(category, availableCategories);
  const openSubCategory =
    openTopLevel && openTopLevel.id !== category ? category : null;

  const toggleTopLevel = (categoryId: string) => {
    setCategory(openTopLevel?.id === categoryId ? "tous" : categoryId);
  };
  const toggleSubCategory = (subId: string, parentId: string) => {
    setCategory(openSubCategory === subId ? parentId : subId);
  };

  // Bloc résumé : regroupe les catégories de premier niveau par gravité.
  const summaryBuckets = new Map<Severity, ICategory[]>();
  if (!isBilan) {
    PANEL_CATEGORIES.forEach((item) => {
      const { severity } = getLastPrelResult(zoneData, item.id, colorblindMode);
      if (!SEVERITY_INTRO[severity]) return;
      const bucket = summaryBuckets.get(severity) || [];
      bucket.push(item);
      summaryBuckets.set(severity, bucket);
    });
  }

  const globalResult = isBilan
    ? getAnnualResult(zoneData, period, "tous", colorblindMode)
    : getLastPrelResult(zoneData, "tous", colorblindMode);

  return (
    <div className="h-full flex flex-col relative">
      {closeButton}

      <div className="text-black p-4 pr-16">
        <div className="text-xs font-thin">
          {displayMode === "communes" ? "COMMUNE" : "RÉSEAU DE DISTRIBUTION"}
        </div>
        <div className="text-2xl leading-tight">{title}</div>
        <div className="mt-1 text-xs text-gray-600 space-y-0.5">
          {code && (
            <div>
              {displayMode === "communes" ? "Code INSEE" : "Code UDI"} : {code}
            </div>
          )}
          {displayMode === "udis" && population !== null && (
            <div>
              Ce réseau alimente {population.toLocaleString("fr-FR")} personnes.
            </div>
          )}
          {communesDesservies.length > 0 && (
            <div>
              Communes desservies : {communesDesservies.slice(0, 6).join(", ")}
              {communesDesservies.length > 6 &&
                ` et ${communesDesservies.length - 6} autres`}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-t-lg flex-1 text-sm space-y-4">
        {/* Temporalité : pilote aussi la carte */}
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1">
          <button
            onClick={() => setPeriod("dernier_prel")}
            className={cn(
              "rounded-lg px-2 py-1.5 text-xs transition-colors",
              !isBilan
                ? "bg-white text-gray-900 font-medium shadow-sm"
                : "text-gray-600 hover:text-gray-900",
            )}
          >
            Dernières analyses
          </button>
          <button
            onClick={() => setPeriod(DEFAULT_BILAN_PERIOD)}
            className={cn(
              "rounded-lg px-2 py-1.5 text-xs transition-colors",
              isBilan
                ? "bg-white text-gray-900 font-medium shadow-sm"
                : "text-gray-600 hover:text-gray-900",
            )}
          >
            Bilans annuels
          </button>
        </div>

        {/* Résumé toutes catégories */}
        <button
          onClick={() => setCategory("tous")}
          className={cn(
            "w-full text-left rounded-xl border p-3 transition-colors",
            category === "tous"
              ? "border-custom-drom bg-gray-50"
              : "border-gray-200 hover:bg-gray-50",
          )}
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5">
              <Dot color={globalResult.color} large />
            </span>
            <span className="flex-1">
              <span className="block text-xs uppercase tracking-wide text-gray-400 mb-0.5">
                Tous polluants
                {isBilan ? ` — ${period.split("_")[2]}` : ""}
              </span>
              <span className="block leading-snug">{globalResult.label}</span>
            </span>
          </div>

          {summaryBuckets.size > 0 && (
            <div className="mt-3 space-y-2 text-xs">
              {SEVERITY_ORDER.map((severity) => {
                const bucket = summaryBuckets.get(severity);
                if (!bucket || bucket.length === 0) return null;
                return (
                  <div key={severity}>
                    <p className="font-medium">{SEVERITY_INTRO[severity]}</p>
                    <p className="text-gray-600">
                      {bucket.map((item) => item.nomAffichage).join(", ")}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </button>

        {/* Accordéon par catégorie */}
        <div className="space-y-2">
          {PANEL_CATEGORIES.map((item) => (
            <CategoryRow
              key={item.id}
              categoryId={item.id}
              level={0}
              data={zoneData}
              period={period}
              setPeriod={setPeriod}
              isOpen={openTopLevel?.id === item.id}
              onToggle={() => toggleTopLevel(item.id)}
              colorblindMode={colorblindMode}
              parameterValues={parameterValues}
            >
              {item.groupes && (
                <div className="mt-4 space-y-4">
                  {item.groupes.map((groupe) => (
                    <div key={groupe.titre}>
                      <p className="text-[11px] font-medium text-gray-600 mb-1.5">
                        {groupe.titre}
                      </p>
                      <div className="space-y-1.5">
                        {groupe.options
                          .filter((option) => option.id !== item.id)
                          .map((option) => (
                            <CategoryRow
                              key={option.id}
                              categoryId={option.id}
                              label={option.label}
                              level={1}
                              data={zoneData}
                              period={period}
                              setPeriod={setPeriod}
                              isOpen={openSubCategory === option.id}
                              onToggle={() =>
                                toggleSubCategory(option.id, item.id)
                              }
                              colorblindMode={colorblindMode}
                              parameterValues={parameterValues}
                            />
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CategoryRow>
          ))}
        </div>

        <p className="text-[11px] text-gray-500 leading-relaxed">
          Ces résultats proviennent du contrôle sanitaire des eaux distribuées,
          réalisé par les Agences régionales de santé et publié en open data par
          le ministère de la Santé. Déplier un polluant l’affiche sur la carte,
          ce qui permet de comparer cette zone avec les zones voisines.
        </p>
      </div>
    </div>
  );
}
