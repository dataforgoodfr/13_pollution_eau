"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ParameterValues } from "@/app/lib/data";
import AnalysesModal, {
  type AnalysesFilters,
} from "@/components/AnalysesModal";
import DernieresAnalyses from "@/components/DernieresAnalyses";
import EvolutionTemporelle from "@/components/EvolutionTemporelle";
import { readNumber, readString, type ZoneDetail } from "@/lib/zoneDetail";

type PollutionZoneDetailPanelV2Props = {
  setPeriod: (period: string) => void;
  category: string;
  setCategory: (category: string) => void;
  displayMode: "communes" | "udis";
  selectedZoneCode: string | null;
  colorblindMode?: boolean;
  parameterValues: ParameterValues;
  onClose?: () => void;
};

/**
 * Onglet affiché dans le panel. C'est un état local : contrairement à
 * `period`, il ne pilote pas la carte. Seul l'onglet "dernier" la synchronise
 * (via setPeriod / setCategory) ; "evolution" la laisse strictement intacte.
 */
type PanelTab = "dernier" | "evolution";

export default function PollutionZoneDetailPanelV2({
  setPeriod,
  category,
  setCategory,
  displayMode,
  selectedZoneCode,
  colorblindMode = false,
  parameterValues,
  onClose,
}: PollutionZoneDetailPanelV2Props) {
  const [tab, setTab] = useState<PanelTab>("dernier");
  const [zoneData, setZoneData] = useState<ZoneDetail | null>(null);
  const [zoneDataError, setZoneDataError] = useState(false);
  const [showAnalysesModal, setShowAnalysesModal] = useState(false);
  const [analysesFilters, setAnalysesFilters] = useState<
    AnalysesFilters | undefined
  >(undefined);

  const openAnalyses = (filters?: AnalysesFilters) => {
    setAnalysesFilters(filters);
    setShowAnalysesModal(true);
  };

  useEffect(() => {
    if (!selectedZoneCode) {
      setZoneData(null);
      setZoneDataError(false);
      return;
    }

    let cancelled = false;
    setZoneData(null);
    setZoneDataError(false);
    setTab("dernier");

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
      className="absolute top-5 right-5 text-kaki bg-white border border-greydark rounded-full p-2 hover:bg-greylight transition duration-300 z-10"
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

  const isEvolution = tab === "evolution";
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

  return (
    <div className="h-full flex flex-col relative bg-kaki">
      {closeButton}

      <div className="text-white p-4 pr-16">
        <div className="text-xs font-thin">
          {displayMode === "communes" ? "COMMUNE" : "RÉSEAU DE DISTRIBUTION"}
        </div>
        <div className="text-2xl leading-tight">{title}</div>
        <div className="mt-1 text-sm text-white/80 space-y-0.5">
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
        {/* Onglets. Seul "Dernières analyses" resynchronise la carte : la
            section "Évolution temporelle" se lit sans rien y changer. */}
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1">
          <button
            onClick={() => {
              setTab("dernier");
              setPeriod("dernier_prel");
            }}
            className={cn(
              "rounded-lg px-2 py-1.5 text-sm transition-colors",
              !isEvolution
                ? "bg-white text-gray-900 font-medium shadow-sm"
                : "text-gray-600 hover:text-gray-900",
            )}
          >
            Dernières analyses
          </button>
          <button
            onClick={() => setTab("evolution")}
            className={cn(
              "rounded-lg px-2 py-1.5 text-sm transition-colors",
              isEvolution
                ? "bg-white text-gray-900 font-medium shadow-sm"
                : "text-gray-600 hover:text-gray-900",
            )}
          >
            Évolution temporelle
          </button>
        </div>

        {isEvolution ? (
          <EvolutionTemporelle
            data={zoneData}
            displayMode={displayMode}
            selectedZoneCode={selectedZoneCode}
            colorblindMode={colorblindMode}
            parameterValues={parameterValues}
            onOpenAnalyses={displayMode === "udis" ? openAnalyses : undefined}
          />
        ) : (
          <DernieresAnalyses
            data={zoneData}
            displayMode={displayMode}
            colorblindMode={colorblindMode}
            parameterValues={parameterValues}
            category={category}
            setCategory={setCategory}
            onOpenAnalyses={displayMode === "udis" ? openAnalyses : undefined}
          />
        )}

        {displayMode === "udis" && (
          <button
            onClick={() => openAnalyses()}
            className="w-full text-center rounded-xl border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Voir toutes les analyses de l&apos;UDI
          </button>
        )}

        <p className="text-xs text-gray-500 leading-relaxed">
          Ces résultats proviennent du contrôle sanitaire des eaux distribuées,
          réalisé par les Agences régionales de santé et publié en open data par
          le ministère de la Santé.
          {code &&
            ` Ils concernent ${displayMode === "communes" ? "la commune identifiée avec le code INSEE" : "le réseau de distribution identifié avec le code "} ${code}.`}
          {!isEvolution &&
            " Déplier un polluant l’affiche sur la carte, ce qui permet de comparer cette zone avec les zones voisines."}
        </p>
      </div>

      {displayMode === "udis" && (
        <AnalysesModal
          open={showAnalysesModal}
          onOpenChange={setShowAnalysesModal}
          cdreseau={selectedZoneCode}
          nomreseaux={title}
          initialFilters={analysesFilters}
        />
      )}
    </div>
  );
}
