"use client";
import { Minus, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "./ui/button-group";
import { useMap } from "react-map-gl/maplibre";

export default function MapZoomControl() {
  const { map } = useMap();

  return (
    <div className="rounded-md bg-white border border-gray-500 overflow-hidden">
      <ButtonGroup orientation="vertical">
        <Button
          className="w-[48px] h-[40px] rounded-none border-none bg-white text-custom-drom hover:bg-custom-drom hover:text-white"
          title="Zoom avant"
          onClick={() => map?.zoomIn()}
        >
          <Plus size={20} />
        </Button>
        <ButtonGroupSeparator
          orientation="horizontal"
          className="bg-gray-300"
        />
        <Button
          className="w-[48px] h-[40px] rounded-none border-none bg-white text-custom-drom hover:bg-custom-drom hover:text-white"
          title="Zoom arrière"
          onClick={() => map?.zoomOut()}
        >
          <Minus size={20} />
        </Button>
      </ButtonGroup>
    </div>
  );
}
