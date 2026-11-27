"use client";

import { useEffect, useState } from "react";
import { Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ParameterValues } from "@/app/lib/data";
import AnalysesModal, {
  type AnalysesFilters,
} from "@/components/AnalysesModal";
import DernieresAnalyses from "@/components/DernieresAnalyses";
import EvolutionTemporelle from "@/components/EvolutionTemporelle";
import ShareZoneModal from "@/components/ShareZoneModal";
import type { ReseauDesservi, ZoneDetail } from "@/app/api/zone-detail/route";

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
 * Il est conservé d'une zone à l'autre tant que le panel reste ouvert, avec la
 * catégorie dépliée de l'onglet "evolution".
 */
type PanelTab = "dernier" | "evolution";

const MAX_ELEMENTS_AFFICHES = 5;

/**
 * Liste courte affichée en en-tête du panel (communes d'une UDI, réseaux d'une
 * commune) : les premiers éléments en clair, le reste dans un popover.
 */
function ListeTronquee({
  label,
  items,
  popoverTitle,
}: {
  label: string;
  items: string[];
  popoverTitle: string;
}) {
  if (items.length === 0) return null;
  const nbMasques = Math.max(0, items.length - MAX_ELEMENTS_AFFICHES);
  return (
    <div>
      {label} : {items.slice(0, MAX_ELEMENTS_AFFICHES).join(", ")}
      {nbMasques > 0 && (
        <>
          {" et "}
          <Popover>
            <PopoverTrigger className="underline underline-offset-2 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded-sm">
              {nbMasques} {nbMasques > 1 ? "autres" : "autre"}
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="start"
              collisionPadding={8}
              className="z-[70] w-72 max-w-[calc(100vw-2rem)] p-3 text-sm leading-snug text-gray-700"
            >
              <div className="mb-1.5 text-xs font-medium text-gray-500">
                {popoverTitle}
              </div>
              <ul className="max-h-64 overflow-y-auto space-y-0.5">
                {/* Clé par index : deux réseaux peuvent porter le même nom. */}
                {items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
        </>
      )}
    </div>
  );
}

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
  const [evolutionOpenCategory, setEvolutionOpenCategory] = useState<
    string | null
  >(null);
  const [zoneData, setZoneData] = useState<ZoneDetail | null>(null);
  const [zoneDataError, setZoneDataError] = useState(false);
  const [showAnalysesModal, setShowAnalysesModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [analysesFilters, setAnalysesFilters] = useState<
    AnalysesFilters | undefined
  >(undefined);
  // Réseau affiché dans la modale d'analyses : la zone elle-même pour une UDI,
  // l'un des réseaux qui la desservent pour une commune.
  const [analysesReseau, setAnalysesReseau] = useState<ReseauDesservi | null>(
    null,
  );

  const openAnalyses = (reseau: ReseauDesservi, filters?: AnalysesFilters) => {
    setAnalysesReseau(reseau);
    setAnalysesFilters(filters);
    setShowAnalysesModal(true);
  };

  useEffect(() => {
    if (!selectedZoneCode) {
      setZoneData(null);
      setZoneDataError(false);
      setTab("dernier");
      setEvolutionOpenCategory(null);
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
  const { nom: title, code, population } = zoneData.zone;
  const communesDesservies = zoneData.zone.communesDesservies ?? [];
  const reseauxDesservis = zoneData.zone.reseauxDesservis ?? [];
  const zoneReseau: ReseauDesservi = { code, nom: title };
  const openZoneAnalyses =
    displayMode === "udis"
      ? (filters?: AnalysesFilters) => openAnalyses(zoneReseau, filters)
      : undefined;

  return (
    <div className="h-full flex flex-col relative bg-kaki overflow-hidden">
      {closeButton}

      <div className="flex-shrink-0 text-white p-4 pr-16">
        <div className="text-xs font-thin">
          {displayMode === "communes" ? "COMMUNE" : "RÉSEAU DE DISTRIBUTION"}
        </div>
        <div className="text-2xl leading-tight">{title}</div>
        <div className="mt-1 text-sm text-white/80 space-y-0.5">
          {displayMode === "udis" && population != null && (
            <div>
              Ce réseau alimente {population.toLocaleString("fr-FR")} personnes.
            </div>
          )}
          <ListeTronquee
            label="Communes desservies"
            items={communesDesservies}
            popoverTitle={`${communesDesservies.length} communes desservies`}
          />
          <ListeTronquee
            label={
              reseauxDesservis.length > 1
                ? "Réseaux de distribution"
                : "Réseau de distribution"
            }
            items={reseauxDesservis.map((r) => r.nom || r.code)}
            popoverTitle={`${reseauxDesservis.length} réseaux de distribution`}
          />
        </div>
      </div>

      {/* min-h-0 : sans lui, un enfant flex refuse de rétrécir sous sa taille
          de contenu et le débordement part sur le conteneur parent. */}
      <div className="bg-white p-4 rounded-t-lg flex-1 min-h-0 overflow-y-auto text-sm space-y-4">
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
            onOpenAnalyses={openZoneAnalyses}
            openCategory={evolutionOpenCategory}
            setOpenCategory={setEvolutionOpenCategory}
          />
        ) : (
          <DernieresAnalyses
            data={zoneData}
            displayMode={displayMode}
            colorblindMode={colorblindMode}
            parameterValues={parameterValues}
            category={category}
            setCategory={setCategory}
            onOpenAnalyses={openZoneAnalyses}
          />
        )}

        {/* Partage limité aux UDI (une commune peut être desservie par
            plusieurs réseaux, d'eaux différentes) et aux dernières analyses. */}
        {displayMode === "udis" && !isEvolution && (
          <div className="space-y-1.5">
            <button
              onClick={() => setShowShareModal(true)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-kaki py-2.5 text-sm font-medium text-white hover:bg-kaki/90 transition-colors"
            >
              <Send size={16} />
              Partagez des résultats
            </button>
            <p className="text-center text-xs text-gray-500">
              Une image prête à publier en story ou en post sur les réseaux
              sociaux
            </p>
          </div>
        )}

        <p className="text-xs text-gray-500 leading-relaxed">
          Ces résultats proviennent du contrôle sanitaire des eaux distribuées,
          réalisé par les Agences régionales de santé et publié en open data par
          le ministère de la Santé.
          {code &&
            ` Ils concernent ${displayMode === "communes" ? "la commune identifiée avec le code INSEE" : "le réseau de distribution identifié avec le code"} ${code}.`}
          {displayMode === "udis" && (
            <>
              {" "}
              <button
                onClick={() => openAnalyses(zoneReseau)}
                className="text-kaki hover:underline"
              >
                Voir toutes les analyses de ce réseau.
              </button>
            </>
          )}
          {displayMode === "communes" && reseauxDesservis.length > 0 && (
            <>
              <br />
              Le tracé des réseaux de distribution n’étant pas disponible, nous
              ne pouvons pas les afficher sur la carte : les résultats de cette
              commune agrègent ceux{" "}
              {reseauxDesservis.length > 1
                ? `des ${reseauxDesservis.length} réseaux qui la desservent`
                : "du réseau qui la dessert"}
              . Voir toutes les analyses de{" "}
              {reseauxDesservis.length > 1 ? "chaque réseau" : "ce réseau"} :{" "}
              {reseauxDesservis.map((reseau, i) => (
                <span key={reseau.code}>
                  {i > 0 && ", "}
                  <button
                    onClick={() => openAnalyses(reseau)}
                    title={reseau.nom ?? undefined}
                    className="text-kaki hover:underline"
                  >
                    {reseau.code}
                  </button>
                </span>
              ))}
              .
            </>
          )}
          {!isEvolution && (
            <>
              <br />
              Déplier un polluant l’affiche sur la carte, ce qui permet de
              comparer cette zone avec les zones voisines.
            </>
          )}
        </p>
      </div>

      <AnalysesModal
        open={showAnalysesModal}
        onOpenChange={setShowAnalysesModal}
        cdreseau={analysesReseau?.code ?? null}
        nomreseaux={analysesReseau?.nom}
        initialFilters={analysesFilters}
      />

      {displayMode === "udis" && (
        <ShareZoneModal
          open={showShareModal}
          onOpenChange={setShowShareModal}
          data={zoneData}
          colorblindMode={colorblindMode}
        />
      )}
    </div>
  );
}
