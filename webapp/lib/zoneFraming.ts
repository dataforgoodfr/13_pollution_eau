import maplibregl from "maplibre-gl";

// Zoom maximal atteint en cadrant une zone sélectionnée
export const ZONE_MAX_ZOOM = 9;

/** Largeur (px) masquée par les panneaux et contrôles de chaque côté. */
export type MapInsets = { left: number; right: number };

/**
 * Parties de la carte masquées une fois le panneau de zone ouvert. Doit suivre
 * les largeurs des panneaux dans PollutionMap (classes md:w-[...] xl:w-[...])
 * et de la colonne de boutons (MapTopRightControls). Sur mobile, les panneaux
 * couvrent tout l'écran : on cadre pour la carte qu'on retrouvera en les
 * fermant.
 */
export function getMapInsets(rightPanelOpen: boolean): MapInsets {
  const width = window.innerWidth;
  const buttons = 64; // colonne de boutons (48px) + marge
  if (width < 768) {
    return { left: 0, right: buttons };
  }
  const isXl = width >= 1280;
  return {
    left: isXl ? 560 : 480,
    right: buttons + (rightPanelOpen ? (isXl ? 480 : 400) : 0),
  };
}

/**
 * Cadre la carte sur une zone sélectionnée, dans la partie laissée visible
 * par les panneaux, sans dépasser ZONE_MAX_ZOOM.
 *
 * - allowZoomOut = false (clic sur la carte) : on ne dézoome jamais, et une
 *   zone déjà entièrement visible ne fait pas bouger la carte (on peut passer
 *   d'une zone voisine à l'autre pour comparer).
 * - allowZoomOut = true (recherche) : la carte vient d'être placée sur
 *   l'adresse, on la cadre sur toute la zone.
 *
 * Si la zone ne tient pas à l'écran au zoom retenu, on centre sur `anchor`
 * (point cliqué ou adresse) plutôt que sur la zone, pour ne pas partir loin.
 */
export function frameZone(
  map: maplibregl.Map,
  displayMode: "communes" | "udis",
  code: string,
  {
    insets,
    anchor,
    allowZoomOut,
  }: {
    insets: MapInsets;
    anchor: maplibregl.LngLatLike;
    allowZoomOut: boolean;
  },
) {
  const bounds = getZoneBounds(map, displayMode, code);
  if (!bounds) {
    return;
  }

  const margin = 40;
  const padding = {
    top: margin,
    bottom: margin,
    left: insets.left + margin,
    right: insets.right + margin,
  };
  const currentZoom = map.getZoom();
  // Zoom auquel la zone remplit la partie visible
  const fitZoom = map.cameraForBounds(bounds, { padding })?.zoom ?? currentZoom;
  const targetZoom = Math.min(fitZoom, ZONE_MAX_ZOOM);
  const zoom = allowZoomOut ? targetZoom : Math.max(currentZoom, targetZoom);

  if (!allowZoomOut && zoom === currentZoom) {
    const container = map.getContainer();
    const sw = map.project(bounds.getSouthWest());
    const ne = map.project(bounds.getNorthEast());
    const fullyVisible =
      sw.x >= padding.left &&
      ne.x <= container.clientWidth - padding.right &&
      ne.y >= padding.top &&
      sw.y <= container.clientHeight - padding.bottom;
    if (fullyVisible) {
      return;
    }
  }

  map.flyTo({
    center: fitZoom >= zoom ? bounds.getCenter() : anchor,
    zoom,
    // Décale le centre vers le milieu de la partie visible.
    offset: [(insets.left - insets.right) / 2, 0],
    duration: 1000,
  });
}

/**
 * Étendue géographique d'une zone, à partir des morceaux de sa géométrie
 * présents dans les tuiles chargées (une zone à cheval sur plusieurs tuiles
 * est découpée). null si aucune tuile chargée ne la contient.
 */
function getZoneBounds(
  map: maplibregl.Map,
  displayMode: "communes" | "udis",
  code: string,
): maplibregl.LngLatBounds | null {
  const features = map.querySourceFeatures(
    displayMode === "communes" ? "communes" : "udis",
    {
      sourceLayer: displayMode === "communes" ? "data_communes" : "data_udi",
      filter: [
        "==",
        ["get", displayMode === "communes" ? "commune_code_insee" : "cdreseau"],
        code,
      ],
    },
  );
  const bounds = new maplibregl.LngLatBounds();
  let empty = true;
  for (const feature of features) {
    const geometry = feature.geometry;
    const polygons =
      geometry.type === "Polygon"
        ? [geometry.coordinates]
        : geometry.type === "MultiPolygon"
          ? geometry.coordinates
          : [];
    for (const polygon of polygons) {
      for (const ring of polygon) {
        for (const [lng, lat] of ring) {
          bounds.extend([lng, lat]);
          empty = false;
        }
      }
    }
  }
  return empty ? null : bounds;
}
