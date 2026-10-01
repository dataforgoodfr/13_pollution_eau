"use client";

import { useEffect, useRef } from "react";
import { useMap, Marker } from "react-map-gl/maplibre";
import { MapPin } from "lucide-react";
import { frameZone, getMapInsets, ZONE_MAX_ZOOM } from "@/lib/zoneFraming";

type PollutionMapMarkerProps = {
  displayMode: "communes" | "udis";
  marker: {
    longitude: number;
    latitude: number;
  };
  setSelectedZoneCode: (code: string | null) => void;
  rightPanelOpen: boolean;
};

export default function PollutionMapMarker({
  displayMode,
  marker,
  setSelectedZoneCode,
  rightPanelOpen,
}: PollutionMapMarkerProps) {
  const { map } = useMap();

  // Lu via une ref : ouvrir/fermer les réglages ne doit pas relancer la
  // recherche de zone ci-dessous (qui rouvrirait le panneau de zone).
  const rightPanelOpenRef = useRef(rightPanelOpen);
  useEffect(() => {
    rightPanelOpenRef.current = rightPanelOpen;
  }, [rightPanelOpen]);

  // Place la carte sur l'adresse, en interrompant l'éventuel mouvement en
  // cours (inertie d'un geste, animation). Effet séparé de la recherche de
  // zone ci-dessous : changer de mode d'affichage ne redéplace pas la carte.
  useEffect(() => {
    map?.jumpTo({
      center: [marker.longitude, marker.latitude],
      zoom: ZONE_MAX_ZOOM,
    });
  }, [map, marker]);

  useEffect(() => {
    if (!map) {
      return;
    }

    const idProperty =
      displayMode === "communes" ? "commune_code_insee" : "cdreseau";
    let zoneCode: string | null = null;

    // Cadre la carte sur la zone une fois ses tuiles chargées (sinon son
    // étendue serait incomplète).
    const frame = () => {
      if (zoneCode === null) {
        return;
      }
      frameZone(map.getMap(), displayMode, zoneCode, {
        insets: getMapInsets(rightPanelOpenRef.current),
        anchor: [marker.longitude, marker.latitude],
        allowZoomOut: true,
      });
    };

    // Zone sous l'adresse, dès qu'elle est dessinée : sur réseau lent, le
    // panneau s'ouvre sans attendre que toute la carte soit chargée.
    const findZone = () => {
      const point = map.project([marker.longitude, marker.latitude]);
      const code = map.queryRenderedFeatures(point, {
        layers: ["color-layer"],
      })?.[0]?.properties[idProperty];
      if (code === undefined || code === null) {
        return;
      }
      zoneCode = String(code);
      map.off("render", findZone);
      map.off("idle", onIdle);
      setSelectedZoneCode(zoneCode);
      map.once("idle", frame);
    };

    // Carte entièrement chargée et toujours aucune zone : dernier essai.
    const onIdle = () => {
      findZone();
      if (zoneCode === null) {
        map.off("render", findZone);
        console.log("No features found at marker");
      }
    };

    map.on("render", findZone);
    map.once("idle", onIdle);
    map.triggerRepaint();

    return () => {
      map.off("render", findZone);
      map.off("idle", onIdle);
      map.off("idle", frame);
    };
  }, [displayMode, map, marker, setSelectedZoneCode]);

  return (
    <Marker
      longitude={marker.longitude}
      latitude={marker.latitude}
      anchor="bottom"
    >
      <MapPin
        size={32}
        className="text-primary-foreground"
        strokeWidth={1}
        stroke="black"
        fill="white"
        color="white"
      />
    </Marker>
  );
}
