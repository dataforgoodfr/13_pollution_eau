"use client";

import { useEffect, useState } from "react";
import { getCategoryById } from "@/lib/polluants";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { getColorScale } from "@/lib/colorMapping";

interface PollutionMapLegendProps {
  period: string;
  category: string;
  colorblindMode: boolean;
  /** Ouvre le panneau des réglages, qui contient la légende détaillée. */
  onOpenDetails: () => void;
}

// Ancres textuelles des extrémités de l'échelle (mode "dernières analyses") :
// résument en deux mots le sens de la première et de la dernière couleur, les
// libellés complets s'affichant au survol des segments.
const COMPACT_ANCHORS: Record<string, { debut: string; fin: string }> = {
  tous: { debut: "Non quantifié", fin: "Eau déconseillée" },
  pfas: { debut: "Non quantifié", fin: "Limite sanitaire dépassée" },
  tfa: { debut: "Non quantifié", fin: "> 60 µg/L" },
  pesticide: { debut: "Non quantifié", fin: "Eau déconseillée" },
  sub_active: { debut: "Non quantifié", fin: "Eau déconseillée" },
  metabolite_p: { debut: "Non quantifié", fin: "Eau déconseillée" },
  metabolite_np: { debut: "Non quantifié", fin: "> 0,9 µg/L" },
  metabolite_esa_metolachlore: { debut: "Non quantifié", fin: "> 3 µg/L" },
  metabolite_chlorothalonil_r471811: {
    debut: "Non quantifié",
    fin: "> 3 µg/L",
  },
  metabolite_chloridazone_desphenyl: {
    debut: "Non quantifié",
    fin: "Eau déconseillée",
  },
  metabolite_chloridazone_methyl_desphenyl: {
    debut: "Non quantifié",
    fin: "Eau déconseillée",
  },
  metabolite_atrazine_desethyl: {
    debut: "Non quantifié",
    fin: "Eau déconseillée",
  },
  pes_total_reg: { debut: "≤ 0,5 µg/L", fin: "> 5 µg/L" },
  pes_total_ts: { debut: "≤ 0,5 µg/L", fin: "> 5 µg/L" },
  nitrate: { debut: "≤ 10 mg/L", fin: "> 50 mg/L" },
  cvm: { debut: "Non quantifié", fin: "> 0,5 µg/L" },
  sub_indus_perchlorate: { debut: "Non quantifié", fin: "> 15 µg/L" },
};

/**
 * Légende compacte posée sur la carte : une phrase décrit la sélection
 * courante et une échelle de couleurs segmentée la résume. Le survol (ou le
 * tap sur mobile) d'un segment affiche son libellé ; sinon un lien invite à
 * ouvrir le panneau des réglages pour la légende détaillée.
 */
export default function PollutionMapLegend({
  period,
  category,
  colorblindMode,
  onOpenDetails,
}: PollutionMapLegendProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // La sélection change : le segment actif n'existe plus forcément.
  useEffect(() => {
    setActiveKey(null);
  }, [category, period, colorblindMode]);

  const categoryDetails = getCategoryById(category);
  const scale = getColorScale(category, period, colorblindMode);
  if (!categoryDetails || !scale) {
    return null;
  }

  const isBilan = period.startsWith("bilan_annuel");
  const periodLabel = isBilan
    ? `bilan ${period.replace("bilan_annuel_", "")}`
    : "dernières analyses";

  const { gray, segments } = scale;
  const annuels = categoryDetails.bilanAnnuel;
  const anchors: { debut: string; fin: string } | null = isBilan
    ? { debut: "0 %", fin: "100 %" }
    : (COMPACT_ANCHORS[category] ?? null);
  const caption: string | null =
    isBilan && annuels ? `part des ${annuels.ratioLabelPlural}` : null;

  const active =
    [...(gray ? [gray] : []), ...segments].find((s) => s.key === activeKey) ??
    null;

  // Zone de survol plus haute que le segment visible (py-1), pour qu'il soit
  // facile à attraper malgré ses 12px de haut.
  const hoverProps = (key: string) => ({
    onMouseEnter: () => setActiveKey(key),
    onMouseLeave: () => setActiveKey(null),
    onClick: () => setActiveKey((current) => (current === key ? null : key)),
  });
  const segmentClass = (key: string) =>
    cn(
      "block h-3 transition-all",
      active &&
        (key === activeKey
          ? "ring-2 ring-gray-900 ring-offset-1 relative z-10 rounded-sm"
          : "opacity-30"),
    );

  return (
    <div className="w-72 bg-light rounded-md border border-greylight shadow-sm px-3 py-2 text-xs">
      {/* En-tête sur une ligne : polluant tronqué si besoin, période toujours
          visible à droite. */}
      <div className="flex items-baseline gap-2">
        <p
          className="flex-1 min-w-0 truncate font-semibold text-gray-900"
          title={categoryDetails.nomAffichage}
        >
          {categoryDetails.nomAffichage}
        </p>
        <span className="flex-shrink-0 text-[10px] font-medium uppercase tracking-wide text-gray-500">
          {periodLabel}
        </span>
      </div>

      <div className="mt-1 flex items-center gap-2">
        {gray && (
          <span
            className="w-4 py-1 flex-shrink-0 cursor-default"
            {...hoverProps(gray.key)}
          >
            <span
              className={cn("rounded-sm", segmentClass(gray.key))}
              style={{ backgroundColor: gray.color }}
            />
          </span>
        )}
        <div className="flex flex-1 gap-px">
          {segments.map((segment, index) => (
            <span
              key={segment.key}
              className="flex-1 py-1 cursor-default"
              {...hoverProps(segment.key)}
            >
              <span
                className={cn(
                  index === 0 && "rounded-l-sm",
                  index === segments.length - 1 && "rounded-r-sm",
                  segmentClass(segment.key),
                )}
                style={{ backgroundColor: segment.color }}
              />
            </span>
          ))}
        </div>
      </div>

      {anchors && (
        <div
          className={cn(
            "flex justify-between gap-2 text-[10px] text-gray-500 leading-tight",
            gray && "ml-6",
          )}
        >
          <span>{anchors.debut}</span>
          {caption && <span className="text-center">{caption}</span>}
          <span>{anchors.fin}</span>
        </div>
      )}

      <div className="mt-1.5 min-h-4 text-[11px] leading-snug">
        {active ? (
          <p className="truncate text-gray-900" title={active.label}>
            {active.label}
          </p>
        ) : (
          <button
            type="button"
            onClick={onOpenDetails}
            className="inline-flex items-center gap-0.5 text-kaki hover:underline"
          >
            Légende détaillée
            <ChevronRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
