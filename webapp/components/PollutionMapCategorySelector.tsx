"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  availableCategories,
  findTopLevelCategory,
  getCategoryById,
} from "@/lib/polluants";
import { BILAN_YEARS, LATEST_BILAN_YEAR } from "@/lib/zoneDetail";
import { ChevronDown } from "lucide-react";

type PollutionMapCategorySelectorProps = {
  period: string;
  setPeriod: (period: string) => void;
  category: string;
  setCategory: (category: string) => void;
  lastUpdateDate?: string | null;
};

// Ici la plus récente vient en premier : c'est celle vers laquelle on veut
// envoyer l'utilisateur, pas une frise chronologique.
const bilanYears = [...BILAN_YEARS].reverse();
const defaultBilanPeriod = `bilan_annuel_${LATEST_BILAN_YEAR}`;

function SectionTitle({ step, children }: { step: number; children: string }) {
  return (
    <h3 className="flex items-center gap-2 mb-2">
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-kaki text-white text-xs font-semibold flex-shrink-0">
        {step}
      </span>
      <span className="text-sm font-semibold text-greydark uppercase tracking-wide">
        {children}
      </span>
    </h3>
  );
}

function Chip({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition-colors text-left",
        active
          ? "bg-kaki text-white border-kaki"
          : "bg-white text-gray-700 border-gray-300 hover:border-gray-400",
        disabled && "opacity-40 cursor-not-allowed",
      )}
    >
      {children}
    </button>
  );
}

export default function PollutionMapCategorySelector({
  period,
  setPeriod,
  category,
  setCategory,
  lastUpdateDate,
}: PollutionMapCategorySelectorProps) {
  const selectedTopLevel = findTopLevelCategory(category, availableCategories);
  const isBilan = period.startsWith("bilan_annuel");
  // Sans bilan annuel (ex. "tous"), seule la dernière analyse est proposée :
  // pas de choix de temporalité.
  const hasBilan = !!getCategoryById(category)?.bilanAnnuel;

  // Accordéon de l'étape 3 : un seul groupe ouvert à la fois, par défaut celui
  // qui contient la catégorie sélectionnée.
  const activeGroupTitle =
    selectedTopLevel?.groupes?.find((groupe) =>
      groupe.options.some((option) => option.id === category),
    )?.titre ?? null;
  const [openGroup, setOpenGroup] = useState<string | null>(activeGroupTitle);
  useEffect(() => {
    if (activeGroupTitle) setOpenGroup(activeGroupTitle);
  }, [activeGroupTitle]);

  return (
    <div className="space-y-6">
      {/* 1. Choix du polluant */}
      <section>
        <SectionTitle step={1}>Polluant</SectionTitle>
        <div className="grid grid-cols-3 gap-2">
          {availableCategories.map((item) => {
            const isActive = selectedTopLevel?.id === item.id;
            return (
              <button
                key={item.id}
                disabled={item.disable}
                onClick={() => setCategory(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl border p-2 text-center transition-colors",
                  isActive
                    ? "bg-kaki text-white border-kaki"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400",
                  item.disable && "opacity-40 cursor-not-allowed",
                )}
              >
                <span className="text-xs leading-tight">
                  {item.nomAffichage}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Choix de la temporalité */}
      <section>
        <SectionTitle step={2}>Temporalité</SectionTitle>
        {hasBilan && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPeriod("dernier_prel")}
              className={cn(
                "rounded-xl border p-2 text-xs transition-colors",
                !isBilan
                  ? "bg-kaki text-white border-kaki"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400",
              )}
            >
              Dernières analyses
            </button>
            <button
              onClick={() => setPeriod(defaultBilanPeriod)}
              className={cn(
                "rounded-xl border p-2 text-xs transition-colors",
                isBilan
                  ? "bg-kaki text-white border-kaki"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400",
              )}
            >
              Bilans annuels
            </button>
          </div>
        )}
        {!isBilan && lastUpdateDate && (
          <p className={cn("text-sm", hasBilan && "mt-2")}>
            Dernière analyse disponible :{" "}
            <span className="font-semibold">{lastUpdateDate}</span>
          </p>
        )}
        {isBilan && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {bilanYears.map((year) => (
              <Chip
                key={year}
                active={period === `bilan_annuel_${year}`}
                onClick={() => setPeriod(`bilan_annuel_${year}`)}
              >
                {year}
              </Chip>
            ))}
          </div>
        )}
      </section>

      {/* 3. Affinage par sous-catégorie (pesticides) */}
      {selectedTopLevel?.groupes && (
        <section>
          <SectionTitle step={3}>Que souhaitez-vous savoir ?</SectionTitle>
          <div className="divide-y divide-gray-200 rounded-xl bg-gray-50">
            {selectedTopLevel.groupes.map((groupe) => {
              const isOpen = openGroup === groupe.titre;
              const hasActiveOption = groupe.options.some(
                (option) => option.id === category,
              );
              return (
                <div key={groupe.titre}>
                  <button
                    onClick={() => setOpenGroup(isOpen ? null : groupe.titre)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-2 p-3 text-left text-xs font-medium text-gray-600 hover:text-gray-900"
                  >
                    <span className={cn(hasActiveOption && "text-kaki")}>
                      {groupe.titre}
                    </span>
                    <ChevronDown
                      size={16}
                      className={cn(
                        "flex-shrink-0 transition-transform",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="flex flex-wrap gap-1.5 px-3 pb-3">
                      {groupe.options.map((option) => (
                        <Chip
                          key={option.id}
                          active={category === option.id}
                          onClick={() => setCategory(option.id)}
                        >
                          {option.label}
                        </Chip>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Fallback pour une catégorie avec enfants mais sans groupes définis */}
      {selectedTopLevel?.enfants &&
        selectedTopLevel.enfants.length > 0 &&
        !selectedTopLevel.groupes && (
          <section>
            <SectionTitle step={3}>Sous-catégorie</SectionTitle>
            <div className="flex flex-wrap gap-1.5">
              {selectedTopLevel.enfants.map((child) => (
                <Chip
                  key={child.id}
                  active={category === child.id}
                  disabled={child.disable}
                  onClick={() => setCategory(child.id)}
                >
                  {child.nomAffichage}
                </Chip>
              ))}
            </div>
          </section>
        )}
    </div>
  );
}
