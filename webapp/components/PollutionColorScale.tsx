import { getColorScale } from "@/lib/colorMapping";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type PollutionColorScaleProps = {
  category: string;
  period: string;
  colorblindMode: boolean;
  /** Clé du segment courant (cf. getColorScale) ; null = rien de surligné. */
  activeKey: string | null;
  /**
   * "sm" : miniature des lignes de l'accordéon. "lg" : pleine largeur, pour
   * le bloc résumé.
   */
  size?: "sm" | "lg";
  /**
   * Repère affiché au-dessus du niveau courant (ex. "Cette eau"), "lg"
   * uniquement. Le conteneur réserve la hauteur nécessaire au-dessus.
   */
  marker?: string;
  className?: string;
};

/**
 * Échelle de couleurs miniature d'une catégorie : la pastille grise "non
 * recherché" à part, puis les niveaux dans l'ordre croissant de gravité. Le
 * niveau courant est mis en avant par un anneau, les autres sont atténués,
 * ce qui situe la couleur d'un résultat sur son échelle. Le libellé de chaque
 * niveau est accessible en tooltip.
 */
export default function PollutionColorScale({
  category,
  period,
  colorblindMode,
  activeKey,
  size = "sm",
  marker,
  className,
}: PollutionColorScaleProps) {
  const scale = getColorScale(category, period, colorblindMode);
  if (!scale) {
    return null;
  }

  const { gray, segments } = scale;
  const all = gray ? [gray, ...segments] : segments;
  const active = all.find((s) => s.key === activeKey) ?? null;
  const hasActive = active !== null;
  const isLarge = size === "lg";
  const showMarker = isLarge && !!marker && hasActive;

  const segmentClass = (key: string) =>
    cn(
      "transition-all",
      isLarge ? "h-[18px]" : "h-3",
      hasActive && key === activeKey
        ? cn(
            "ring-2 ring-gray-900 relative z-10",
            isLarge ? "ring-offset-2" : "ring-offset-1 rounded-sm",
          )
        : hasActive && (isLarge ? "opacity-45" : "opacity-40"),
    );

  const markerElement = (key: string) =>
    showMarker && key === activeKey ? (
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 flex -translate-x-1/2 flex-col items-center gap-[3px] text-gray-900"
      >
        <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wide">
          {marker}
        </span>
        <svg width="11" height="6" viewBox="0 0 11 6" fill="none">
          <path d="M5.5 6 0 0h11z" fill="currentColor" />
        </svg>
      </span>
    ) : null;

  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex items-center",
          isLarge ? "w-full gap-1.5" : "w-16 flex-shrink-0 gap-1",
          showMarker && "pt-6",
          className,
        )}
        role="img"
        aria-label={active ? active.label : undefined}
      >
        {gray && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "flex-shrink-0",
                  isLarge ? "w-3.5 rounded-[3px]" : "w-3",
                  segmentClass(gray.key),
                )}
                style={{ backgroundColor: gray.color }}
              >
                {markerElement(gray.key)}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-56">
              <p>{gray.label}</p>
            </TooltipContent>
          </Tooltip>
        )}
        <div className={cn("flex flex-1", isLarge ? "gap-0.5" : "gap-px")}>
          {segments.map((segment, index) => (
            <Tooltip key={segment.key}>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "flex-1",
                    isLarge && "rounded-sm",
                    index === 0 &&
                      (isLarge ? "rounded-l-full" : "rounded-l-sm"),
                    index === segments.length - 1 &&
                      (isLarge ? "rounded-r-full" : "rounded-r-sm"),
                    segmentClass(segment.key),
                  )}
                  style={{ backgroundColor: segment.color }}
                >
                  {markerElement(segment.key)}
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-56">
                <p>{segment.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
