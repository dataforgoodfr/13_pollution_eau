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

  const segmentClass = (key: string) =>
    cn(
      "h-3 transition-all",
      hasActive && key === activeKey
        ? "ring-2 ring-gray-900 ring-offset-1 relative z-10 rounded-sm"
        : hasActive && "opacity-40",
    );

  return (
    <TooltipProvider>
      <div
        className={cn("flex w-16 flex-shrink-0 items-center gap-1", className)}
        role="img"
        aria-label={active ? active.label : undefined}
      >
        {gray && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn("w-3 flex-shrink-0", segmentClass(gray.key))}
                style={{ backgroundColor: gray.color }}
              />
            </TooltipTrigger>
            <TooltipContent className="max-w-56">
              <p>{gray.label}</p>
            </TooltipContent>
          </Tooltip>
        )}
        <div className="flex flex-1 gap-px">
          {segments.map((segment, index) => (
            <Tooltip key={segment.key}>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "flex-1",
                    index === 0 && "rounded-l-sm",
                    index === segments.length - 1 && "rounded-r-sm",
                    segmentClass(segment.key),
                  )}
                  style={{ backgroundColor: segment.color }}
                />
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
