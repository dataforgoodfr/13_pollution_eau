/**
 * Outils de génération, côté navigateur, des visuels de partage sur les
 * réseaux sociaux (cf. `ShareZoneModal`). Le visuel est un `<svg>` React :
 * affiché tel quel (réduit) comme aperçu, puis sérialisé et dessiné dans un
 * `<canvas>` pour obtenir le PNG. On évite volontairement les librairies de
 * capture du DOM (html-to-image…), qui passent par `<foreignObject>` et
 * rendent mal sous Safari iOS.
 */

import type { UdiShape } from "@/app/api/udi-shape/route";

export const SHARE_FONT_FAMILY = "Raleway";

/** Graisses de Raleway utilisées par le visuel (cf. public/fonts). */
const FONT_FILES: Record<number, string> = {
  400: "/fonts/raleway-v37-latin-regular.woff2",
  600: "/fonts/raleway-v37-latin-600.woff2",
  700: "/fonts/raleway-v37-latin-700.woff2",
};

// ---------------------------------------------------------------------------
// Polices

let fontFaceCssPromise: Promise<string> | null = null;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Règles `@font-face` avec les polices embarquées en base64. Un SVG dessiné
 * via `<img>` n'a accès à aucune ressource externe : sans elles, le PNG
 * retomberait sur une police système.
 */
export function getEmbeddedFontFaceCss(): Promise<string> {
  if (!fontFaceCssPromise) {
    fontFaceCssPromise = Promise.all(
      Object.entries(FONT_FILES).map(async ([weight, url]) => {
        const blob = await fetch(url).then((res) => res.blob());
        const dataUrl = await blobToDataUrl(blob);
        return `@font-face{font-family:"${SHARE_FONT_FAMILY}";font-weight:${weight};src:url(${dataUrl}) format("woff2");}`;
      }),
    )
      .then((rules) => rules.join(""))
      .catch((error) => {
        fontFaceCssPromise = null;
        throw error;
      });
  }
  return fontFaceCssPromise;
}

/**
 * Attend que Raleway soit disponible dans la page : la mesure du texte (et
 * donc la coupure des lignes) en dépend.
 */
export async function loadShareFonts(): Promise<void> {
  await Promise.all(
    Object.keys(FONT_FILES).map((weight) =>
      document.fonts.load(`${weight} 32px ${SHARE_FONT_FAMILY}`),
    ),
  );
}

// ---------------------------------------------------------------------------
// Texte

let measureContext: CanvasRenderingContext2D | null = null;

export function measureText(
  text: string,
  fontSize: number,
  fontWeight: number,
): number {
  if (!measureContext) {
    measureContext = document.createElement("canvas").getContext("2d");
  }
  if (!measureContext) return text.length * fontSize * 0.55;
  measureContext.font = `${fontWeight} ${fontSize}px ${SHARE_FONT_FAMILY}`;
  return measureContext.measureText(text).width;
}

/**
 * Découpe un texte en lignes tenant dans `maxWidth` (le SVG ne sait pas
 * revenir à la ligne tout seul). Au-delà de `maxLines`, la dernière ligne est
 * tronquée avec une ellipse.
 */
export function wrapText(
  text: string,
  maxWidth: number,
  fontSize: number,
  fontWeight: number,
  maxLines = Infinity,
): string[] {
  // Pas de \s : les espaces insécables doivent rester insécables.
  const words = text.split(/[ \t\n]+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && measureText(candidate, fontSize, fontWeight) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  if (lines.length <= maxLines) return lines;

  const kept = lines.slice(0, maxLines);
  let last = kept[maxLines - 1];
  while (
    last.length > 1 &&
    measureText(`${last}…`, fontSize, fontWeight) > maxWidth
  ) {
    last = last.slice(0, -1).trimEnd();
  }
  kept[maxLines - 1] = `${last}…`;
  return kept;
}

/** Texte noir ou blanc selon la luminance du fond. */
export function readableTextColor(background: string): string {
  const hex = background.replace("#", "");
  if (hex.length !== 6) return "#0f172a";
  const [r, g, b] = [0, 2, 4].map(
    (i) => parseInt(hex.slice(i, i + 2), 16) / 255,
  );
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.55 ? "#0f172a" : "#ffffff";
}

// ---------------------------------------------------------------------------
// Tracé de l'UDI

type Box = { x: number; y: number; width: number; height: number };

/**
 * Convertit le polygone (lon/lat) en attribut `d` d'un `<path>`, centré dans
 * `box` en conservant les proportions. Projection équirectangulaire corrigée
 * par cos(latitude) : suffisante à l'échelle d'un réseau de distribution.
 */
export function shapeToSvgPath(shape: UdiShape, box: Box): string {
  const polygons = (
    shape.geometry.type === "Polygon"
      ? [shape.geometry.coordinates]
      : shape.geometry.coordinates
  ) as number[][][][];

  const points = polygons.flat(2);
  if (points.length === 0) return "";

  const lats = points.map((p) => p[1]);
  const lat0 = ((Math.min(...lats) + Math.max(...lats)) / 2) * (Math.PI / 180);
  const kx = Math.cos(lat0);

  const xs = points.map((p) => p[0] * kx);
  const ys = points.map((p) => -p[1]);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const spanX = Math.max(...xs) - minX || 1e-9;
  const spanY = Math.max(...ys) - minY || 1e-9;

  const scale = Math.min(box.width / spanX, box.height / spanY);
  const offsetX = box.x + (box.width - spanX * scale) / 2;
  const offsetY = box.y + (box.height - spanY * scale) / 2;

  const project = ([lon, lat]: number[]) =>
    `${(offsetX + (lon * kx - minX) * scale).toFixed(1)} ${(offsetY + (-lat - minY) * scale).toFixed(1)}`;

  return polygons
    .flatMap((rings) => rings.map((ring) => `M${ring.map(project).join("L")}Z`))
    .join("");
}

// ---------------------------------------------------------------------------
// Export PNG

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Impossible de charger le SVG"));
    img.src = url;
  });
}

/**
 * Rend le `<svg>` affiché en aperçu en PNG, à sa taille réelle (viewBox).
 */
export async function svgElementToPngBlob(svg: SVGSVGElement): Promise<Blob> {
  const { width, height } = svg.viewBox.baseVal;
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  clone.removeAttribute("class");
  clone.removeAttribute("style");

  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  style.textContent = await getEmbeddedFontFaceCss();
  clone.insertBefore(style, clone.firstChild);

  const markup = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(
    new Blob([markup], { type: "image/svg+xml;charset=utf-8" }),
  );

  try {
    const img = await loadImage(url);
    // Safari peut dessiner l'image avant d'avoir appliqué les polices
    // embarquées : on attend le décodage, puis on redessine une seconde fois.
    await img.decode().catch(() => undefined);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas indisponible");

    context.drawImage(img, 0, 0, width, height);
    await new Promise((resolve) => setTimeout(resolve, 80));
    context.clearRect(0, 0, width, height);
    context.drawImage(img, 0, 0, width, height);

    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("Export PNG impossible")),
        "image/png",
      ),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
