"use client";

import { clsx } from "clsx";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import MapZoneSelector from "./MapZoneSelector";
import MapZoomControl from "./MapZoomControl";
import MapFullscreenControl from "./MapFullscreenControl";

type MapTopRightControlsProps = {
  // `null` means "no explicit user choice yet" - see PollutionMap.tsx for why.
  rightPanelOverride: boolean | null;
  onToggleRightPanel: () => void;
  setDisplayMode: (mode: "communes" | "udis") => void;
};

export default function MapTopRightControls({
  rightPanelOverride,
  onToggleRightPanel,
  setDisplayMode,
}: MapTopRightControlsProps) {
  return (
    <div
      className={clsx(
        "absolute top-4 z-20 flex flex-col items-end gap-2 transition-[right] duration-300 ease-in-out",
        rightPanelOverride === null
          ? "right-4 md:right-[calc(400px_+_1rem)]"
          : rightPanelOverride
            ? "hidden md:flex md:right-[calc(400px_+_1rem)]"
            : "right-4",
      )}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onToggleRightPanel}
              aria-label="Paramètres de la carte"
              className={clsx(
                "h-[48px] w-[48px] rounded border p-0",
                rightPanelOverride === null
                  ? "bg-white text-custom-drom border-gray-500 md:bg-custom-drom md:text-white md:border-custom-drom"
                  : rightPanelOverride
                    ? "bg-custom-drom text-white border-custom-drom"
                    : "bg-white text-custom-drom border-gray-500",
                "hover:bg-custom-drom hover:text-white",
              )}
            >
              <SlidersHorizontal size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-white text-custom-drom">
            Paramètres : filtres et légende
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <MapZoneSelector setDisplayMode={setDisplayMode} />
      <MapZoomControl />
      <MapFullscreenControl />
    </div>
  );
}
