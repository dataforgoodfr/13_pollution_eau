"use client";
import { useEffect, useState } from "react";
import { Maximize, Minimize } from "lucide-react";
import { Button } from "./ui/button";

export default function MapFullscreenControl() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Fullscreen tout le document (carte + panneaux), pas seulement le canvas
  // maplibre - le FullscreenControl natif de maplibre ne fullscreenait que la
  // carte, pas toute l'interface.
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.body.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="rounded-md bg-white border border-gray-500 overflow-hidden">
      <Button
        className="w-[48px] h-[40px] rounded-none border-none bg-white text-custom-drom hover:bg-custom-drom hover:text-white"
        title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
        onClick={toggleFullscreen}
      >
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </Button>
    </div>
  );
}
