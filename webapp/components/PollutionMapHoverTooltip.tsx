import { forwardRef } from "react";
import { getColorScale } from "@/lib/colorMapping";

export type HoveredZone = {
  /** Code INSEE (communes) ou cdreseau (UDI). */
  code: string;
  name: string | null;
  /** Clé du segment de getColorScale qui colore la zone. */
  scaleKey: string;
};

type PollutionMapHoverTooltipProps = {
  zone: HoveredZone | null;
  displayMode: "communes" | "udis";
  category: string;
  period: string;
  colorblindMode: boolean;
};

/**
 * Étiquette qui suit le curseur au survol d'une zone de la carte : nom de la
 * zone et résultat pour la sélection courante (pastille + libellé). Sa
 * position est mise à jour directement via la ref par le parent, sans
 * re-rendu à chaque mousemove.
 */
const PollutionMapHoverTooltip = forwardRef<
  HTMLDivElement,
  PollutionMapHoverTooltipProps
>(function PollutionMapHoverTooltip(
  { zone, displayMode, category, period, colorblindMode },
  ref,
) {
  const scale = zone ? getColorScale(category, period, colorblindMode) : null;
  const segment =
    scale && zone
      ? ([scale.gray, ...scale.segments].find(
          (s) => s?.key === zone.scaleKey,
        ) ?? null)
      : null;

  return (
    <div
      ref={ref}
      hidden={!zone}
      className="pointer-events-none absolute left-0 top-0 z-10 max-w-64 rounded-md border border-greylight bg-light px-2.5 py-1.5 text-xs shadow-sm"
    >
      {zone && (
        <>
          <p className="truncate font-semibold text-gray-900">
            {displayMode === "udis" && (
              <span className="font-normal text-gray-500">Réseau </span>
            )}
            {zone.name ?? zone.code}
          </p>
          {segment && (
            <p className="mt-0.5 flex items-start gap-1.5 leading-snug text-gray-700">
              <span
                className="mt-[3px] h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span>{segment.label}</span>
            </p>
          )}
        </>
      )}
    </div>
  );
});

export default PollutionMapHoverTooltip;
