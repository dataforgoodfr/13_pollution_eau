import { formatValue } from "@/lib/parametres";

export type ConcentrationPoint = {
  referenceprel: string;
  date: string | null;
  valeur: number | null;
};

type ConcentrationChartProps = {
  points: ConcentrationPoint[];
  unite?: string;
  limiteQualite: number | null;
  valeurSanitaire: number | null;
  /** Nom lisible de la substance mesurée, ex. "Somme des 20 PFAS". */
  label: string;
};

// Repère du SVG. Le graphique est dessiné à taille fixe puis mis à l'échelle
// par le conteneur (w-full), ce qui le rend lisible du panel desktop (560px)
// au plein écran mobile (~400px).
const WIDTH = 400;
const HEIGHT = 150;
const PAD_LEFT = 38;
const PAD_RIGHT = 8;
const PAD_TOP = 10;
const PAD_BOTTOM = 22;
const PLOT_WIDTH = WIDTH - PAD_LEFT - PAD_RIGHT;
const PLOT_HEIGHT = HEIGHT - PAD_TOP - PAD_BOTTOM;

// Au-delà, les marqueurs se chevauchent : on ne garde que la ligne.
const MAX_MARKERS = 40;

const COLOR_LINE = "#22394e";
const COLOR_NON_CONFORME = "#fe9929";
const COLOR_DECONSEILLE = "#f03b20";

function formatDate(date: string | null): string {
  // DuckDB rend "2024-02-02 09:21:00" : l'espace n'est pas un séparateur ISO,
  // et tous les moteurs JS ne l'acceptent pas.
  return date
    ? new Date(date.replace(" ", "T")).toLocaleDateString("fr-FR")
    : "date inconnue";
}

function pointColor(
  valeur: number,
  limiteQualite: number | null,
  valeurSanitaire: number | null,
): string {
  if (valeurSanitaire !== null && valeur > valeurSanitaire)
    return COLOR_DECONSEILLE;
  if (limiteQualite !== null && valeur > limiteQualite)
    return COLOR_NON_CONFORME;
  return COLOR_LINE;
}

/**
 * Évolution des concentrations mesurées, un point par prélèvement. L'axe X est
 * à pas constant (un cran par prélèvement, dans l'ordre chronologique) et non
 * proportionnel au temps : les prélèvements sont très inégalement répartis, et
 * plusieurs peuvent tomber le même jour sur un même réseau.
 */
export default function ConcentrationChart({
  points,
  unite,
  limiteQualite,
  valeurSanitaire,
  label,
}: ConcentrationChartProps) {
  const values = points
    .map((point) => point.valeur)
    .filter((valeur): valeur is number => valeur !== null);

  if (values.length === 0) {
    return (
      <p className="text-sm text-gray-600">
        Aucune mesure disponible pour {label.toLowerCase()} sur cette zone.
      </p>
    );
  }

  if (values.length === 1) {
    const only = points.find((point) => point.valeur !== null)!;
    return (
      <p className="text-sm text-gray-600 leading-relaxed">
        Une seule analyse, le {formatDate(only.date)} :{" "}
        <span className="font-numbers">{formatValue(only.valeur!)}</span>{" "}
        {unite || ""}
        {limiteQualite !== null && (
          <>
            {" "}
            (limite de qualité :{" "}
            <span className="font-numbers">
              {formatValue(limiteQualite)}
            </span>{" "}
            {unite || ""})
          </>
        )}
        . Une seule mesure ne permet pas de tracer une évolution.
      </p>
    );
  }

  const maxValue = Math.max(...values);
  // On garde la limite de qualité dans le cadre même quand aucune mesure ne
  // s'en approche : sans elle, une série entièrement conforme paraîtrait
  // alarmante, l'échelle étant collée aux valeurs mesurées.
  const yMax =
    limiteQualite !== null
      ? Math.max(maxValue, limiteQualite * 1.3)
      : maxValue * 1.1 || 1;

  const x = (index: number) =>
    PAD_LEFT + (index * PLOT_WIDTH) / (values.length - 1);
  const y = (valeur: number) =>
    PAD_TOP + PLOT_HEIGHT - (valeur / yMax) * PLOT_HEIGHT;

  const plotted = points
    .filter((point) => point.valeur !== null)
    .map((point, index) => ({ ...point, valeur: point.valeur!, index }));

  const polyline = plotted
    .map((point) => `${x(point.index)},${y(point.valeur)}`)
    .join(" ");

  // Une graduation d'année au premier prélèvement de chaque année.
  const yearTicks: Array<{ year: string; index: number }> = [];
  plotted.forEach((point) => {
    const year = point.date ? point.date.slice(0, 4) : null;
    if (year && yearTicks[yearTicks.length - 1]?.year !== year) {
      yearTicks.push({ year, index: point.index });
    }
  });

  const nbDepassements =
    limiteQualite !== null
      ? values.filter((valeur) => valeur > limiteQualite).length
      : 0;

  const thresholds = [
    {
      value: limiteQualite,
      color: COLOR_NON_CONFORME,
      label: `limite de qualité (${formatValue(limiteQualite ?? 0)} ${unite || ""})`,
    },
    {
      value: valeurSanitaire,
      color: COLOR_DECONSEILLE,
      label: `limite sanitaire (${formatValue(valeurSanitaire ?? 0)} ${unite || ""})`,
    },
  ].filter(
    (threshold): threshold is { value: number; color: string; label: string } =>
      threshold.value !== null && threshold.value <= yMax,
  );

  // La graduation du haut est masquée quand un seuil se pose au même endroit :
  // à 8px de haut, deux libellés à moins de 9px l'un de l'autre se chevauchent.
  const showMaxTick = thresholds.every(
    (threshold) => y(threshold.value) - PAD_TOP > 9,
  );

  const ariaLabel = `${label} : ${values.length} analyses du ${formatDate(
    plotted[0].date,
  )} au ${formatDate(plotted[plotted.length - 1].date)}, de ${formatValue(
    Math.min(...values),
  )} à ${formatValue(maxValue)} ${unite || ""}${
    limiteQualite !== null
      ? `, dont ${nbDepassements} au-dessus de la limite de qualité de ${formatValue(limiteQualite)} ${unite || ""}`
      : ""
  }.`;

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto"
        role="img"
        aria-label={ariaLabel}
      >
        {/* Axes */}
        <line
          x1={PAD_LEFT}
          y1={PAD_TOP + PLOT_HEIGHT}
          x2={WIDTH - PAD_RIGHT}
          y2={PAD_TOP + PLOT_HEIGHT}
          stroke="#e5e7eb"
        />
        <text
          x={PAD_LEFT - 5}
          y={PAD_TOP + PLOT_HEIGHT + 3}
          textAnchor="end"
          fontSize="8"
          fill="#9ca3af"
        >
          0
        </text>
        {showMaxTick && (
          <text
            x={PAD_LEFT - 5}
            y={PAD_TOP + 3}
            textAnchor="end"
            fontSize="8"
            fill="#9ca3af"
          >
            {formatValue(yMax)}
          </text>
        )}

        {/* Seuils de référence. Le libellé est porté par l'axe Y et non posé
            sur le tracé : une ligne à hauteur de seuil croise forcément la
            courbe là où ça compte, c'est-à-dire aux dépassements. */}
        {thresholds.map((threshold) => (
          <g key={threshold.label}>
            <line
              x1={PAD_LEFT}
              y1={y(threshold.value)}
              x2={WIDTH - PAD_RIGHT}
              y2={y(threshold.value)}
              stroke={threshold.color}
              strokeWidth="1"
              strokeDasharray="4 3"
            />
            <text
              x={PAD_LEFT - 5}
              y={y(threshold.value) + 3}
              textAnchor="end"
              fontSize="8"
              fill={threshold.color}
            >
              {formatValue(threshold.value)}
            </text>
          </g>
        ))}

        {/* Série */}
        <polyline
          points={polyline}
          fill="none"
          stroke={COLOR_LINE}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {plotted.length <= MAX_MARKERS &&
          plotted.map((point) => (
            <circle
              key={point.referenceprel}
              cx={x(point.index)}
              cy={y(point.valeur)}
              r="2"
              fill={pointColor(point.valeur, limiteQualite, valeurSanitaire)}
            >
              <title>
                {formatDate(point.date)} : {formatValue(point.valeur)}{" "}
                {unite || ""}
              </title>
            </circle>
          ))}

        {/* Graduations d'années */}
        {yearTicks.map((tick) => (
          <text
            key={tick.year}
            x={x(tick.index)}
            y={HEIGHT - 8}
            textAnchor={tick.index === 0 ? "start" : "middle"}
            fontSize="8"
            fill="#9ca3af"
          >
            {tick.year}
          </text>
        ))}
      </svg>

      {thresholds.length > 0 && (
        <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
          {thresholds.map((threshold) => (
            <li
              key={threshold.label}
              className="flex items-center gap-1.5"
              style={{ color: threshold.color }}
            >
              <svg width="14" height="2" aria-hidden="true">
                <line
                  x1="0"
                  y1="1"
                  x2="14"
                  y2="1"
                  stroke={threshold.color}
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
              </svg>
              {threshold.label}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-1 text-[11px] text-gray-400 leading-relaxed">
        {values.length} analyses, une par prélèvement, dans l’ordre
        chronologique. Une valeur à <span className="font-numbers">0</span>{" "}
        signifie que la substance n’a pas été quantifiée, c’est-à-dire qu’elle
        est restée sous le seuil de détection du laboratoire.
      </p>
    </div>
  );
}
