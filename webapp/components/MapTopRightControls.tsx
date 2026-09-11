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
  rightPanelOpen: boolean;
  onToggleRightPanel: () => void;
  setDisplayMode: (mode: "communes" | "udis") => void;
  onZoneChange: () => void;
};

export default function MapTopRightControls({
  rightPanelOpen,
  onToggleRightPanel,
  setDisplayMode,
  onZoneChange,
}: MapTopRightControlsProps) {
  return (
    <div
      className={clsx(
        "absolute top-4 z-20 flex flex-col items-end gap-2 transition-[right] duration-300 ease-in-out",
        rightPanelOpen
          ? "hidden md:flex md:right-[calc(400px_+_1rem)] xl:right-[calc(480px_+_1rem)]"
          : "right-4",
      )}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onToggleRightPanel}
              aria-label="Réglages de la carte"
              className={clsx(
                "h-[48px] w-[48px] rounded border p-0",
                rightPanelOpen
                  ? "bg-kaki text-white border-kaki"
                  : "bg-white text-kaki border-greydark",
                "hover:bg-kaki hover:text-white",
              )}
            >
              <SlidersHorizontal size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-white text-kaki">
            Réglages de la carte
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <MapZoneSelector
        setDisplayMode={setDisplayMode}
        onZoneChange={onZoneChange}
      />
      <MapZoomControl />
      <MapFullscreenControl />
    </div>
  );
}
