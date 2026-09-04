"use client";
import { useEffect, useState } from "react";
import { Maximize, Minimize } from "lucide-react";
import { Button } from "./ui/button";

export default function MapFullscreenControl() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  // La Fullscreen API n'existe pas sur iPhone (Safari, Chrome iOS...), quel
  // que soit le navigateur : seul un <video> peut y passer en plein écran.
  // Détecté via document.fullscreenEnabled (pas de sniff d'UA) ; lu après le
  // montage, donc true au premier rendu serveur et client, pas de mismatch
  // d'hydratation.
  const [fullscreenSupported, setFullscreenSupported] = useState(true);

  useEffect(() => {
    setFullscreenSupported(document.fullscreenEnabled);

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

  if (!fullscreenSupported) {
    return null;
  }

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
