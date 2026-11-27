"use client";

import { forwardRef, type ReactNode } from "react";
import type { UdiShape } from "@/app/api/udi-shape/route";
import { getColorScale } from "@/lib/colorMapping";
import { LOGO_DANS_MON_EAU } from "@/lib/logoDansMonEau";
import { LOGO_GENERATIONS_FUTURES } from "@/lib/logoGenerationsFutures";
import {
  measureText,
  readableTextColor,
  SHARE_FONT_FAMILY,
  shapeToSvgPath,
  wrapText,
} from "@/lib/shareImage";

/**
 * Visuel de partage sur les réseaux sociaux, en SVG pur (pas de
 * `<foreignObject>`) pour pouvoir être converti en PNG de façon fiable sur
 * tous les navigateurs (cf. lib/shareImage). Le SVG ne sait pas mettre en page
 * du texte : chaque bloc est placé à la main, le curseur `y` descendant au fil
 * des blocs.
 */

export type ShareFormat = "story" | "post";
export type ShareMode = "verdict" | "chiffre";
export type ShareTheme = "vert" | "pale" | "blanc" | "degrade";

export type ShareCategoryRow = {
  nom: string;
  label: string;
  color: string;
};

export type ShareChiffre = {
  /** "14", "32", "?"… */
  big: string;
  unit?: string;
  caption: string;
  sub?: string;
  label: string;
  color: string;
};

export type ShareCardData = {
  title: string;
  subtitle: string;
  date: string | null;
  shape: UdiShape | null;
  /** Couleur du tracé : résultat global (verdict) ou de la catégorie (chiffre). */
  shapeColor: string;
  verdict: { label: string; resultKey: string };
  rows: ShareCategoryRow[];
  chiffre: ShareChiffre | null;
};

const FORMATS: Record<
  ShareFormat,
  { height: number; safeTop: number; safeBottom: number }
> = {
  // Instagram recouvre le haut (barre de progression, profil) et le bas
  // (champ de réponse) des stories : rien d'important dans ces zones.
  story: { height: 1920, safeTop: 220, safeBottom: 280 },
  post: { height: 1350, safeTop: 72, safeBottom: 72 },
};

const WIDTH = 1080;
const PAD = 80;
const CONTENT_WIDTH = WIDTH - 2 * PAD;
const CARD_PAD = 48;
const CARD_INNER = CONTENT_WIDTH - 2 * CARD_PAD;

// Charte dansmoneau.fr
const KAKI = "#0b534b";
const ACCENT = "#8dbe5a";
const PALE = "#d6e2f5";
const INK = "#0f172a";
const MUTED = "#475569";

/**
 * Couleurs de tout ce qui est hors de la carte blanche, selon le fond choisi.
 * La carte, elle, ne change pas (seul un contour est ajouté sur fond blanc).
 */
type SharePalette = {
  /** Nom affiché dans le sélecteur de la modale. */
  label: string;
  /** Pastille du sélecteur (valeur CSS `background`). */
  swatch: string;
  /** Fond uni, ou dégradé (cf. `<defs>` du SVG). */
  background: string;
  gradient?: { stops: string[]; glow: string };
  /** Ondulation décorative en bas du visuel (absente sur fond blanc). */
  wave?: { color: string; opacity: number };
  kicker: string;
  title: string;
  subtitle: { color: string; opacity: number };
  logo: string;
  shapeStroke: string;
  cardStroke?: string;
  cta: { fill: string; text: string };
};

export const SHARE_THEMES: Record<ShareTheme, SharePalette> = {
  vert: {
    label: "Vert",
    swatch: KAKI,
    background: KAKI,
    wave: { color: "#ffffff", opacity: 0.05 },
    kicker: ACCENT,
    title: "#ffffff",
    subtitle: { color: "#ffffff", opacity: 0.8 },
    logo: "#ffffff",
    shapeStroke: "#ffffff",
    cta: { fill: ACCENT, text: KAKI },
  },
  pale: {
    label: "Bleu pâle",
    swatch: PALE,
    background: PALE,
    wave: { color: "#ffffff", opacity: 0.45 },
    kicker: "#4a7f24",
    title: KAKI,
    subtitle: { color: INK, opacity: 0.7 },
    logo: KAKI,
    shapeStroke: "#ffffff",
    cta: { fill: KAKI, text: "#ffffff" },
  },
  blanc: {
    label: "Blanc",
    swatch: "#ffffff",
    background: "#ffffff",
    kicker: "#4a7f24",
    title: KAKI,
    subtitle: { color: INK, opacity: 0.7 },
    logo: KAKI,
    shapeStroke: KAKI,
    cardStroke: PALE,
    cta: { fill: KAKI, text: "#ffffff" },
  },
  // De la forêt (charte) vers un bleu d'eau, avec un halo vert en haut.
  degrade: {
    label: "Dégradé",
    swatch: `linear-gradient(160deg, ${KAKI}, #12706a 50%, #1f5f9a)`,
    background: "url(#share-bg-gradient)",
    gradient: { stops: [KAKI, "#12706a", "#1f5f9a"], glow: ACCENT },
    wave: { color: "#ffffff", opacity: 0.07 },
    kicker: ACCENT,
    title: "#ffffff",
    subtitle: { color: "#ffffff", opacity: 0.85 },
    logo: "#ffffff",
    shapeStroke: "#ffffff",
    cta: { fill: ACCENT, text: KAKI },
  },
};

type TextBlockProps = {
  lines: string[];
  x: number;
  y: number;
  size: number;
  weight: number;
  fill: string;
  lineHeight?: number;
  anchor?: "start" | "middle" | "end";
  opacity?: number;
  letterSpacing?: number;
};

/** `y` = haut du bloc ; renvoie aussi sa hauteur via `textBlockHeight`. */
function TextBlock({
  lines,
  x,
  y,
  size,
  weight,
  fill,
  lineHeight = 1.2,
  anchor = "start",
  opacity,
  letterSpacing,
}: TextBlockProps) {
  return (
    <text
      x={x}
      fontSize={size}
      fontWeight={weight}
      fill={fill}
      textAnchor={anchor}
      opacity={opacity}
      letterSpacing={letterSpacing}
    >
      {lines.map((line, i) => (
        <tspan key={i} x={x} y={y + size * 0.8 + i * size * lineHeight}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

function textBlockHeight(lines: string[], size: number, lineHeight = 1.2) {
  return lines.length === 0 ? 0 : size + (lines.length - 1) * size * lineHeight;
}

type ShareCardProps = {
  data: ShareCardData;
  format: ShareFormat;
  mode: ShareMode;
  theme: ShareTheme;
  colorblindMode: boolean;
  className?: string;
};

const ShareCard = forwardRef<SVGSVGElement, ShareCardProps>(function ShareCard(
  { data, format, mode, theme, colorblindMode, className },
  ref,
) {
  const { height, safeTop, safeBottom } = FORMATS[format];
  const palette = SHARE_THEMES[theme];
  const isStory = format === "story";
  const elements: ReactNode[] = [];
  let y = 0;

  // --- En-tête : sur le post, le tracé se place à droite du titre ---------
  const shapeBeside = !isStory && data.shape !== null;
  const besideSize = 250;
  const headerWidth = shapeBeside
    ? CONTENT_WIDTH - besideSize - 40
    : CONTENT_WIDTH;

  // Logos Dans Mon Eau et Générations Futures, séparés d'un filet.
  const logoHeight = isStory ? 46 : 38;
  const dmeScale = logoHeight / LOGO_DANS_MON_EAU.height;
  const dmeWidth = LOGO_DANS_MON_EAU.width * dmeScale;
  // Le logo Générations Futures, plus compact, est un peu agrandi pour que
  // les deux aient le même poids visuel.
  const gfHeight = logoHeight * 1.25;
  const gfScale = gfHeight / LOGO_GENERATIONS_FUTURES.height;
  const logoGap = isStory ? 32 : 26;
  const gfX = PAD + dmeWidth + 2 * logoGap;
  const logoRowHeight = gfHeight;
  elements.push(
    <g
      key="logo-dme"
      fill={palette.logo}
      transform={`translate(${PAD} ${(logoRowHeight - logoHeight) / 2}) scale(${dmeScale})`}
    >
      {LOGO_DANS_MON_EAU.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </g>,
    <line
      key="logo-sep"
      x1={PAD + dmeWidth + logoGap}
      x2={PAD + dmeWidth + logoGap}
      y1={0}
      y2={logoRowHeight}
      stroke={palette.logo}
      strokeOpacity={0.4}
      strokeWidth={2}
    />,
    <g
      key="logo-gf"
      fill={palette.logo}
      transform={`translate(${gfX} 0) scale(${gfScale})`}
    >
      {LOGO_GENERATIONS_FUTURES.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </g>,
  );
  y += logoRowHeight + (isStory ? 44 : 32);
  // Le tracé du post (à droite du titre) commence sous la ligne des logos.
  const belowLogo = y;

  const kicker = "L'EAU DE MON ROBINET";
  const kickerSize = isStory ? 34 : 30;
  elements.push(
    <TextBlock
      key="kicker"
      lines={[kicker]}
      x={PAD}
      y={y}
      size={kickerSize}
      weight={700}
      fill={palette.kicker}
      letterSpacing={3}
    />,
  );
  y += kickerSize + 18;

  const titleSize = isStory ? 84 : 64;
  const titleLines = wrapText(data.title, headerWidth, titleSize, 700, 2);
  elements.push(
    <TextBlock
      key="title"
      lines={titleLines}
      x={PAD}
      y={y}
      size={titleSize}
      weight={700}
      fill={palette.title}
      lineHeight={1.08}
    />,
  );
  y += textBlockHeight(titleLines, titleSize, 1.08) + 18;

  const subtitleSize = isStory ? 32 : 28;
  const subtitleLines = wrapText(
    data.subtitle,
    headerWidth,
    subtitleSize,
    400,
    2,
  );
  elements.push(
    <TextBlock
      key="subtitle"
      lines={subtitleLines}
      x={PAD}
      y={y}
      size={subtitleSize}
      weight={400}
      fill={palette.subtitle.color}
      opacity={palette.subtitle.opacity}
    />,
  );
  y += textBlockHeight(subtitleLines, subtitleSize);

  if (shapeBeside && data.shape) {
    const headerHeight = y;
    const box = {
      x: WIDTH - PAD - besideSize,
      y: Math.max(belowLogo, (headerHeight - besideSize) / 2),
      width: besideSize,
      height: besideSize,
    };
    elements.push(
      <path
        key="shape"
        d={shapeToSvgPath(data.shape, box)}
        fill={data.shapeColor}
        fillRule="evenodd"
        stroke={palette.shapeStroke}
        strokeWidth={5}
        strokeLinejoin="round"
      />,
    );
    y = Math.max(y, box.y + besideSize);
  }
  const headerHeight = y;

  // --- Carte blanche (coordonnées locales, placée plus bas) -----------------
  const card: ReactNode[] = [];
  let cy = CARD_PAD;
  const cx = PAD + CARD_PAD;

  if (mode === "verdict") {
    const verdictSize = isStory ? 54 : 46;
    const verdictLines = wrapText(
      data.verdict.label,
      CARD_INNER,
      verdictSize,
      700,
      3,
    );
    card.push(
      <TextBlock
        key="verdict"
        lines={verdictLines}
        x={cx}
        y={cy}
        size={verdictSize}
        weight={700}
        fill={INK}
        lineHeight={1.15}
      />,
    );
    cy += textBlockHeight(verdictLines, verdictSize, 1.15) + 36;

    // Échelle de gravité "tous polluants", niveau courant mis en avant.
    const scale = getColorScale("tous", "dernier_prel", colorblindMode);
    const segments = scale?.segments ?? [];
    if (segments.length > 0) {
      const gap = 8;
      const segmentWidth =
        (CARD_INNER - gap * (segments.length - 1)) / segments.length;
      const barHeight = 22;
      const hasActive = segments.some((s) => s.key === data.verdict.resultKey);
      segments.forEach((segment, i) => {
        const isActive = segment.key === data.verdict.resultKey;
        const x = cx + i * (segmentWidth + gap);
        card.push(
          <rect
            key={`seg-${segment.key}`}
            x={x}
            y={isActive ? cy - 6 : cy}
            width={segmentWidth}
            height={isActive ? barHeight + 12 : barHeight}
            rx={6}
            fill={segment.color}
            opacity={hasActive && !isActive ? 0.45 : 1}
            stroke={isActive ? INK : "none"}
            strokeWidth={isActive ? 4 : 0}
          />,
        );
      });
      cy += barHeight + 18;
      const legendSize = isStory ? 24 : 22;
      card.push(
        <TextBlock
          key="scale-left"
          lines={["Aucun polluant"]}
          x={cx}
          y={cy}
          size={legendSize}
          weight={400}
          fill={MUTED}
        />,
        <TextBlock
          key="scale-right"
          lines={["Eau déconseillée"]}
          x={cx + CARD_INNER}
          y={cy}
          size={legendSize}
          weight={400}
          fill={MUTED}
          anchor="end"
        />,
      );
      cy += legendSize + 36;
    }

    // Une ligne par famille de polluants.
    card.push(
      <line
        key="sep"
        x1={cx}
        x2={cx + CARD_INNER}
        y1={cy}
        y2={cy}
        stroke="#e2e8f0"
        strokeWidth={2}
      />,
    );
    cy += isStory ? 36 : 28;

    const nameSize = isStory ? 34 : 30;
    const labelSize = isStory ? 28 : 25;
    const dotRadius = isStory ? 15 : 13;
    const nameColumn =
      Math.max(...data.rows.map((row) => measureText(row.nom, nameSize, 700))) +
      dotRadius * 2 +
      44;
    data.rows.forEach((row, i) => {
      const labelLines = wrapText(
        row.label,
        CARD_INNER - nameColumn,
        labelSize,
        400,
        2,
      );
      const rowHeight = Math.max(
        nameSize,
        textBlockHeight(labelLines, labelSize, 1.15),
      );
      card.push(
        <circle
          key={`dot-${i}`}
          cx={cx + dotRadius}
          cy={cy + nameSize / 2 + 2}
          r={dotRadius}
          fill={row.color}
          stroke="rgba(15,23,42,0.25)"
          strokeWidth={2}
        />,
        <TextBlock
          key={`name-${i}`}
          lines={[row.nom]}
          x={cx + dotRadius * 2 + 20}
          y={cy}
          size={nameSize}
          weight={700}
          fill={INK}
        />,
        <TextBlock
          key={`label-${i}`}
          lines={labelLines}
          x={cx + nameColumn}
          y={cy + (nameSize - labelSize) / 2}
          size={labelSize}
          weight={400}
          fill={MUTED}
          lineHeight={1.15}
        />,
      );
      cy += rowHeight + (isStory ? 30 : 22);
    });
    cy -= isStory ? 30 : 22;
  } else if (data.chiffre) {
    const { chiffre } = data;
    const bigSize = isStory ? 230 : 180;
    const unitSize = isStory ? 64 : 52;
    const bigWidth = measureText(chiffre.big, bigSize, 700);
    card.push(
      <text
        key="big"
        x={cx}
        y={cy + bigSize * 0.78}
        fontSize={bigSize}
        fontWeight={700}
        fill={INK}
      >
        {chiffre.big}
      </text>,
    );
    if (chiffre.unit) {
      card.push(
        <text
          key="unit"
          x={cx + bigWidth + 20}
          y={cy + bigSize * 0.78}
          fontSize={unitSize}
          fontWeight={600}
          fill={INK}
        >
          {chiffre.unit}
        </text>,
      );
    }
    cy += bigSize * 0.82 + 28;

    const captionSize = isStory ? 50 : 42;
    const captionLines = wrapText(
      chiffre.caption,
      CARD_INNER,
      captionSize,
      600,
      4,
    );
    card.push(
      <TextBlock
        key="caption"
        lines={captionLines}
        x={cx}
        y={cy}
        size={captionSize}
        weight={600}
        fill={INK}
        lineHeight={1.15}
      />,
    );
    cy += textBlockHeight(captionLines, captionSize, 1.15);

    if (chiffre.sub) {
      const subSize = isStory ? 30 : 27;
      const subLines = wrapText(chiffre.sub, CARD_INNER, subSize, 400, 2);
      cy += 20;
      card.push(
        <TextBlock
          key="sub"
          lines={subLines}
          x={cx}
          y={cy}
          size={subSize}
          weight={400}
          fill={MUTED}
        />,
      );
      cy += textBlockHeight(subLines, subSize);
    }
    cy += 40;

    // Résultat de la catégorie, sur un bandeau de sa couleur.
    const pillSize = isStory ? 32 : 28;
    const pillPadX = 28;
    const pillPadY = 20;
    const pillLines = wrapText(
      chiffre.label,
      CARD_INNER - 2 * pillPadX,
      pillSize,
      600,
      3,
    );
    const pillHeight = textBlockHeight(pillLines, pillSize, 1.2) + 2 * pillPadY;
    card.push(
      <rect
        key="pill"
        x={cx}
        y={cy}
        width={CARD_INNER}
        height={pillHeight}
        rx={20}
        fill={chiffre.color}
        stroke="rgba(15,23,42,0.15)"
        strokeWidth={2}
      />,
      <TextBlock
        key="pill-text"
        lines={pillLines}
        x={cx + pillPadX}
        y={cy + pillPadY}
        size={pillSize}
        weight={600}
        fill={readableTextColor(chiffre.color)}
      />,
    );
    cy += pillHeight;
  }

  const cardHeight = cy + CARD_PAD;

  // --- Pied : date, source et appel à l'action (coordonnées locales) --------
  y = 0;
  const sourceSize = isStory ? 26 : 23;
  const source = [
    data.date ? `Dernière analyse : ${data.date}` : null,
    "Contrôle sanitaire des ARS",
  ]
    .filter(Boolean)
    .join(" · ");
  const sourceLines = wrapText(source, CONTENT_WIDTH, sourceSize, 400, 2);
  const footer: ReactNode[] = [
    <TextBlock
      key="source"
      lines={sourceLines}
      x={PAD}
      y={y}
      size={sourceSize}
      weight={400}
      fill={palette.subtitle.color}
      opacity={palette.subtitle.opacity * 0.92}
    />,
  ];
  y += textBlockHeight(sourceLines, sourceSize) + 28;

  const ctaText = "Vérifiez votre eau sur DansMonEau.fr";
  const ctaPadX = 36;
  // Réduit la taille si le texte ne tient pas sur la largeur utile.
  let ctaSize = isStory ? 38 : 34;
  while (
    ctaSize > 24 &&
    measureText(ctaText, ctaSize, 700) + 2 * ctaPadX > CONTENT_WIDTH
  ) {
    ctaSize -= 1;
  }
  const ctaWidth = measureText(ctaText, ctaSize, 700) + 2 * ctaPadX;
  const ctaHeight = ctaSize + 44;
  footer.push(
    <rect
      key="cta"
      x={PAD}
      y={y}
      width={ctaWidth}
      height={ctaHeight}
      rx={ctaHeight / 2}
      fill={palette.cta.fill}
    />,
    <TextBlock
      key="cta-text"
      lines={[ctaText]}
      x={PAD + ctaPadX}
      y={y + 22}
      size={ctaSize}
      weight={700}
      fill={palette.cta.text}
    />,
  );
  const footerHeight = y + ctaHeight;

  // --- Assemblage -----------------------------------------------------------
  // Le tracé de l'UDI n'apparaît que sur le post (à droite du titre).
  const gap = isStory ? 48 : 40;
  const footerGap = isStory ? 44 : 36;
  const available = height - safeTop - safeBottom;
  const cardTop = headerHeight + gap;
  const footerTop = cardTop + cardHeight + footerGap;
  const totalHeight = footerTop + footerHeight;

  // Centre verticalement l'ensemble dans la zone visible du format.
  const offset = safeTop + Math.max(0, (available - totalHeight) / 2);

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${WIDTH} ${height}`}
      className={className}
      fontFamily={`${SHARE_FONT_FAMILY}, sans-serif`}
    >
      {palette.gradient && (
        <defs>
          <linearGradient id="share-bg-gradient" x1="0" y1="0" x2="0.35" y2="1">
            {palette.gradient.stops.map((color, i, stops) => (
              <stop key={i} offset={i / (stops.length - 1)} stopColor={color} />
            ))}
          </linearGradient>
          <radialGradient
            id="share-bg-glow"
            cx="0.9"
            cy="0.05"
            r="0.6"
            gradientTransform={`translate(0.9 0.05) scale(1 ${WIDTH / height}) translate(-0.9 -0.05)`}
          >
            <stop
              offset="0"
              stopColor={palette.gradient.glow}
              stopOpacity={0.4}
            />
            <stop
              offset="1"
              stopColor={palette.gradient.glow}
              stopOpacity={0}
            />
          </radialGradient>
        </defs>
      )}
      <rect width={WIDTH} height={height} fill={palette.background} />
      {palette.gradient && (
        <rect width={WIDTH} height={height} fill="url(#share-bg-glow)" />
      )}
      {/* Ondulation discrète en fond, rappel de l'eau. */}
      {palette.wave && (
        <path
          d={`M0 ${height * 0.82} C ${WIDTH * 0.3} ${height * 0.76}, ${WIDTH * 0.6} ${height * 0.9}, ${WIDTH} ${height * 0.83} L ${WIDTH} ${height} L 0 ${height} Z`}
          fill={palette.wave.color}
          opacity={palette.wave.opacity}
        />
      )}
      {/* Raleway a des chiffres elzéviriens par défaut : on force les chiffres
          alignés, plus lisibles pour le grand chiffre. */}
      <g
        transform={`translate(0 ${offset})`}
        style={{ fontVariantNumeric: "lining-nums" }}
      >
        {elements}
        <g transform={`translate(0 ${cardTop})`}>
          <rect
            x={PAD}
            y={0}
            width={CONTENT_WIDTH}
            height={cardHeight}
            rx={36}
            fill="#ffffff"
            stroke={palette.cardStroke ?? "none"}
            strokeWidth={palette.cardStroke ? 4 : 0}
          />
          {card}
        </g>
        <g transform={`translate(0 ${footerTop})`}>{footer}</g>
      </g>
    </svg>
  );
});

export default ShareCard;
