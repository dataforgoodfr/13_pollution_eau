"use client";
import { MouseEventHandler, useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";

import tailwindConfig from "@/tailwind.config";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Tooltip } from "@radix-ui/react-tooltip";

export const ZONE_NOZONE = 0;
export const ZONE_METROPOLE = 1;
export const ZONE_GUADELOUPE = 2;
export const ZONE_MARTINIQUE = 3;
export const ZONE_MAYOTTE = 4;
export const ZONE_LAREUNION = 5;
export const ZONE_GUYANE = 6;

export default function MapZoneSelector(props: {
  selectedZone: number;
  zoneChangeCallback: (zone: number) => void;
}) {
  function handleClick(h: MouseEventHandler<HTMLButtonElement>): void {
    if (props.zoneChangeCallback) {
      const numZone: number = parseInt(h.currentTarget.getAttribute("value"));
      props.zoneChangeCallback(numZone);
    }
  }

  const DROMS = [
    { id: ZONE_METROPOLE, tooltip: "Métropole" },
    { id: ZONE_GUADELOUPE, tooltip: "Guadeloupe" },
    { id: ZONE_MARTINIQUE, tooltip: "Martinique" },
    { id: ZONE_GUYANE, tooltip: "Guyane" },
    { id: ZONE_MAYOTTE, tooltip: "Mayotte" },
    { id: ZONE_LAREUNION, tooltip: "La réunion" },
  ];

  return (
    <>
      <div className="grid gap-2">
        <div className="row w-3 grid-cols-1 gap-2 space-y-2">
          {DROMS.map((zone: { id: number; tooltip: string }) => {
            return (
              <DROMButton
                key={"DROM_" + zone.id}
                zone={zone.id}
                tooltip={zone.tooltip}
                selected={props.selectedZone == zone.id}
                onClick={handleClick}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}

function DROMButton(props: {
  zone: number;
  tooltip: string;
  selected: boolean;
  onclick: (e: MouseEventHandler<HTMLButtonElement>) => void;
}) {
  const svgRef = useRef(null);
  const [selected, setSelected] = useState<boolean>(false);
  const [svgSource, setSvgSource] = useState<string>("");

  const [svgContent, setSvgContent] = useState("");

  useEffect(() => {
    switch (props.zone) {
      case ZONE_GUADELOUPE:
        setSvgSource("drom-guadeloupe.svg");
        break;
      case ZONE_GUYANE:
        setSvgSource("drom-guyane.svg");
        break;
      case ZONE_LAREUNION:
        setSvgSource("drom-reunion.svg");
        break;
      case ZONE_MARTINIQUE:
        setSvgSource("drom-martinique.svg");
        break;
      case ZONE_MAYOTTE:
        setSvgSource("drom-mayotte.svg");
        break;
      case ZONE_METROPOLE:
        setSvgSource("drom-metropole.svg");
        break;
      default:
        setSvgSource("");
    }
  }, [props.zone]);
  useEffect(() => {
    if (svgSource !== "") {
      const fetchSvg = async () => {
        const response = await fetch(svgSource);
        const text = await response.text();
        setSvgContent(text);
      };
      fetchSvg();
    }
  }, [svgSource]);

  if (selected !== props.selected) {
    setSelected(props.selected);
  }
  useEffect(() => {
    if (svgContent) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, "image/svg+xml");
      const svgElement = doc.documentElement;
      let nonSelectedColor =
        tailwindConfig?.default?.theme?.extend?.colors["custom-drom"] ||
        "black";

      // Find all elements that need to have their fill color changed
      const elementsToChange = svgElement.querySelectorAll("[fill]");
      elementsToChange.forEach((element) => {
        element.setAttribute("fill", selected ? "white" : nonSelectedColor);
      });

      // Update the SVG content in the state
      setSvgContent(new XMLSerializer().serializeToString(svgElement));

      setButtonClasses(
        [
          "px-4",
          "py-2",
          "rounded",
          selected ? "bg-custom-drom" : "bg-white",
        ].join(" "),
      );
    }
  }, [svgContent, selected]);

  const [buttonClasses, setButtonClasses] = useState<string>(
    [
      "px-4",
      "py-2",
      "rounded",
      props.selected ? "bg-custom-drom" : "bg-white",
    ].join(" "),
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={buttonClasses}
            onClick={props.onClick}
            value={props.zone}
          >
            <div
              className="w-3 h-3"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="bg-white text-custom-drom">
          {props.tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
