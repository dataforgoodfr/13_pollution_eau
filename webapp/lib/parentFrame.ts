/**
 * Communication avec le site parent (https://dansmoneau.fr) quand la carte
 * est intégrée en iframe.
 *
 * - Ouverture d'une zone : l'URL de l'iframe peut porter `?udi=<cdreseau>` ou
 *   `?commune=<code INSEE>` (le parent la construit à partir de son propre
 *   hash, ex. https://dansmoneau.fr/#udi=001000003).
 * - Zone affichée : à chaque ouverture/fermeture du panneau de zone, on envoie
 *   `{ type: "zoneSelected", zone: { type: "udi" | "commune", code } | null }`
 *   au parent, qui met à jour son hash pour rendre la zone partageable.
 */

export type DisplayMode = "communes" | "udis";

export type ZoneRef = { displayMode: DisplayMode; code: string };

/** Lit la zone à ouvrir dans les paramètres d'URL (`?udi=` ou `?commune=`). */
export function getZoneFromUrl(search: string): ZoneRef | null {
  const params = new URLSearchParams(search);
  const udi = params.get("udi");
  if (udi) {
    return { displayMode: "udis", code: udi };
  }
  const commune = params.get("commune");
  if (commune) {
    return { displayMode: "communes", code: commune };
  }
  return null;
}

/** Signale au parent la zone ouverte dans le panneau (null : panneau fermé). */
export function notifyParentZone(zone: ZoneRef | null) {
  if (window.self === window.top) {
    return;
  }
  window.parent.postMessage(
    {
      type: "zoneSelected",
      zone: zone && {
        type: zone.displayMode === "udis" ? "udi" : "commune",
        code: zone.code,
      },
    },
    // Donnée publique, et l'intégration est déjà restreinte aux domaines
    // dansmoneau.fr par la CSP frame-ancestors (next.config.ts) : "*" évite
    // de lister chaque sous-domaine (préprod...).
    "*",
  );
}
