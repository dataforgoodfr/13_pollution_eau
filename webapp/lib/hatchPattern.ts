import type { CSSProperties } from "react";
import type { Map as MaplibreMap } from "maplibre-gl";

/**
 * Hachures superposées à la couleur d'un résultat (cf. `hachures` dans
 * polluants.ts), pour distinguer deux situations de même couleur. Dessinées à
 * l'identique sur la carte (image MapLibre `fill-pattern`) et dans les
 * légendes (CSS).
 */
export const HATCH_IMAGE_ID = "hachures";

// Zoom à partir duquel les hachures s'affichent sur la carte (vue initiale
// France entière : 5,2).
export const HATCH_MIN_ZOOM = 6;

// Hachures diagonales « / » sombres et semi-transparentes : elles foncent la
// couleur de fond au lieu de l'éclaircir, et restent lisibles en mode
// daltonien.
const HATCH_RGBA: [number, number, number, number] = [0, 0, 0, 0.4];
// Tuile de 16 px dessinée en pixelRatio 2 (8 px CSS), une ligne de 3 px
// device par période.
const TILE_SIZE = 16;
const LINE_WIDTH = 3;
const PIXEL_RATIO = 2;

/** Image de la tuile de hachures, répétée par MapLibre (`fill-pattern`). */
function createHatchImage() {
  const data = new Uint8ClampedArray(TILE_SIZE * TILE_SIZE * 4);
  const [r, g, b, a] = HATCH_RGBA;
  for (let y = 0; y < TILE_SIZE; y++) {
    for (let x = 0; x < TILE_SIZE; x++) {
      // x + y constant = diagonale « / » ; le modulo rend la tuile raccordable.
      if ((x + y) % TILE_SIZE < LINE_WIDTH) {
        const i = (y * TILE_SIZE + x) * 4;
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
        data[i + 3] = Math.round(a * 255);
      }
    }
  }
  return { width: TILE_SIZE, height: TILE_SIZE, data };
}

/**
 * Enregistre l'image de hachures sur la carte. À rappeler sur l'événement
 * `styleimagemissing` : un changement de style peut faire perdre les images
 * ajoutées.
 */
export function addHatchImage(map: MaplibreMap) {
  if (!map.hasImage(HATCH_IMAGE_ID)) {
    map.addImage(HATCH_IMAGE_ID, createHatchImage(), {
      pixelRatio: PIXEL_RATIO,
    });
  }
}

// Mêmes hachures en CSS. Les lignes x + y = constante de la tuile sont
// espacées de 16 / √2 px device, soit ≈ 5,66 px CSS, pour ≈ 1,06 px
// d'épaisseur.
const HATCH_CSS = (() => {
  const [r, g, b, a] = HATCH_RGBA;
  const color = `rgba(${r}, ${g}, ${b}, ${a})`;
  const period = TILE_SIZE / Math.SQRT2 / PIXEL_RATIO;
  const line = LINE_WIDTH / Math.SQRT2 / PIXEL_RATIO;
  return `repeating-linear-gradient(135deg, ${color} 0 ${line}px, transparent ${line}px ${period}px)`;
})();

/** Style d'une pastille de légende : couleur de fond + hachures éventuelles. */
export function swatchStyle(
  color: string | undefined,
  hachures?: boolean,
): CSSProperties {
  return {
    backgroundColor: color || undefined,
    backgroundImage: hachures ? HATCH_CSS : undefined,
  };
}
