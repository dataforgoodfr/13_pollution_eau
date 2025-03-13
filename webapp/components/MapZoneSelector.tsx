import { Fragment, MouseEventHandler } from "react";
import { Button } from "./ui/button";

export const ZONE_NOZONE = 0
export const ZONE_METROPOLE = 1;
export const ZONE_GUADELOUPE = 2;
export const ZONE_MARTINIQUE = 3;
export const ZONE_MAYOTTE = 4;
export const ZONE_LAREUNION = 5;
export const ZONE_GUYANE = 6;

export default function MapZoneSelector(props: {
  zoneChangeCallback: (zone: number) => void | null;
}) {
  function handleClick(h: MouseEventHandler<HTMLButtonElement>): void {
    if (props.zoneChangeCallback) {
      const numZone: number = parseInt( h.currentTarget.getAttribute("value"));
      props.zoneChangeCallback(numZone);
    }
  }
  return (
    <>
      <div className="grid gap-2">
        <div className="row grid-cols-3 gap-2 space-x-2">
          <Button
            className="bg-green-500 text-black hover:bg-green-900 hover:text-green-300"
            onClick={handleClick}
            value={ZONE_METROPOLE}
          >
            Metropole
          </Button>
          <Button
            className="bg-green-500 text-black hover:bg-green-900 hover:text-green-300"
            onClick={handleClick}
            value={ZONE_GUADELOUPE}
          >
            Guadeloupe
          </Button>
          <Button
            className="bg-green-500 text-black hover:bg-green-900 hover:text-green-300"
            onClick={handleClick}
            value={ZONE_MARTINIQUE}
          >
            Martinique
          </Button>
        </div>
        <div className="row grid-cols-3 space-x-2 ">
          <Button
            className="bg-green-500 text-black hover:bg-green-900 hover:text-green-300"
            onClick={handleClick}
            value={ZONE_MAYOTTE}
          >
            Mayotte
          </Button>
          <Button
            className="bg-green-500 text-black hover:bg-green-900 hover:text-green-300"
            onClick={handleClick}
            value={ZONE_LAREUNION}
          >
            La Réunion
          </Button>
          <Button
            className="bg-green-500 text-black hover:bg-green-900 hover:text-green-300"
            onClick={handleClick}
            value={ZONE_GUYANE}
          >
            Guyane
          </Button>
        </div>
      </div>
    </>
  );
}
