"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ShareCard, {
  type ShareCardData,
  type ShareChiffre,
  type ShareFormat,
  type ShareMode,
} from "@/components/ShareCard";
import { getZoneSummarySentence } from "@/components/DernieresAnalyses";
import type { ZoneDetail } from "@/app/api/zone-detail/route";
import type { UdiShape } from "@/app/api/udi-shape/route";
import { getCategoryById, TOP_LEVEL_CATEGORIES } from "@/lib/polluants";
import type { Severity } from "@/lib/polluants";
import { formatValue } from "@/lib/parametres";
import { getLastPrelResult } from "@/lib/zoneDetail";
import { loadShareFonts, svgElementToPngBlob } from "@/lib/shareImage";

const SITE_URL = "https://dansmoneau.fr";

/** Formulations propres au visuel « un chiffre », par catégorie de premier niveau. */
const CHIFFRE_TEXTES: Record<
  string,
  {
    /** Substance unique : on affiche la valeur mesurée plutôt qu'un décompte. */
    deX?: string;
    quantifies: (n: number) => string;
    recherches?: (n: number) => string;
    nonRecherche: string;
  }
> = {
  pfas: {
    quantifies: (n) => (n > 1 ? "PFAS quantifiés" : "PFAS quantifié"),
    recherches: (n) => `sur ${n} PFAS recherché${n > 1 ? "s" : ""}`,
    nonRecherche: "Les PFAS n'ont pas été recherchés",
  },
  pesticide: {
    quantifies: (n) =>
      n > 1
        ? "substances pesticides quantifiées"
        : "substance pesticide quantifiée",
    recherches: (n) =>
      `sur ${n} substance${n > 1 ? "s" : ""} recherchée${n > 1 ? "s" : ""}`,
    nonRecherche: "Les pesticides n'ont pas été recherchés",
  },
  nitrate: {
    deX: "de nitrates",
    quantifies: () => "nitrate quantifié",
    nonRecherche: "Les nitrates n'ont pas été recherchés",
  },
  cvm: {
    deX: "de CVM",
    quantifies: () => "CVM quantifié",
    nonRecherche: "Le CVM n'a pas été recherché",
  },
  sub_indus_perchlorate: {
    deX: "de perchlorate",
    quantifies: () => "perchlorate quantifié",
    nonRecherche: "Le perchlorate n'a pas été recherché",
  },
};

/** Sommes recalculées par les modèles dbt : à exclure du décompte de substances. */
const CODES_SOMMES = new Set([
  "TOTALPESTICIDE",
  "TOTALPESTICIDEALL",
  "SPFAS",
  "SUM_4_PFAS",
]);

const SEVERITY_RANK: Severity[] = [
  "non_recherche",
  "non_quantifie",
  "quantifie",
  "vigilance",
  "non_conforme",
  "deconseille_sensibles",
  "deconseille_population",
];

const CHIFFRE_CATEGORIES = TOP_LEVEL_CATEGORIES.filter(
  (item) => CHIFFRE_TEXTES[item.id],
);

function formatDate(date: string | null): string | null {
  return date ? new Date(date).toLocaleDateString("fr-FR") : null;
}

function buildChiffre(
  data: ZoneDetail,
  categoryId: string,
  colorblindMode: boolean,
): ShareChiffre {
  const result = getLastPrelResult(data, categoryId, colorblindMode);
  const textes = CHIFFRE_TEXTES[categoryId];
  const base = { label: result.label, color: result.color };
  const date = formatDate(result.date);

  if (!date) {
    return {
      ...base,
      big: "?",
      caption: `${textes.nonRecherche} dans l'eau de mon robinet depuis 12 mois`,
    };
  }

  if (textes.deX) {
    const mesure = result.parametres[0];
    if (mesure) {
      return {
        ...base,
        big: formatValue(mesure.value),
        unit: getCategoryById(categoryId)?.unite,
        caption: `${textes.deX} dans l'eau de mon robinet`,
        sub: `Analyse du ${date}`,
      };
    }
    return {
      ...base,
      big: "0",
      caption: `${textes.quantifies(0)} dans l'eau de mon robinet`,
      sub: `Analyse du ${date}`,
    };
  }

  const nb = result.parametres.filter((p) => !CODES_SOMMES.has(p.code)).length;
  const nbRecherches = result.nbParametres ?? 0;
  return {
    ...base,
    big: String(nb),
    caption: `${textes.quantifies(nb)} dans l'eau de mon robinet`,
    sub:
      nbRecherches > 0 && textes.recherches
        ? `${textes.recherches(nbRecherches)} lors de l'analyse du ${date}`
        : `Analyse du ${date}`,
  };
}

/**
 * Catégorie proposée par défaut pour le visuel « un chiffre » : la plus grave,
 * ou les pesticides si rien n'a été quantifié.
 */
function defaultChiffreCategory(data: ZoneDetail): string {
  let best = "pesticide";
  let bestRank = SEVERITY_RANK.indexOf("non_quantifie");
  CHIFFRE_CATEGORIES.forEach((item) => {
    const rank = SEVERITY_RANK.indexOf(
      getLastPrelResult(data, item.id, false).severity,
    );
    if (rank > bestRank) {
      best = item.id;
      bestRank = rank;
    }
  });
  return best;
}

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type ShareZoneModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ZoneDetail;
  colorblindMode: boolean;
};

/**
 * Modale de partage du résultat d'une UDI sur les réseaux sociaux : visuel
 * story (9:16) ou post (4:5), généré dans le navigateur.
 */
export default function ShareZoneModal({
  open,
  onOpenChange,
  data,
  colorblindMode,
}: ShareZoneModalProps) {
  const { code, nom, population } = data.zone;
  const communes = useMemo(
    () => data.zone.communesDesservies ?? [],
    [data.zone.communesDesservies],
  );
  const nomReseau = nom || code;

  const [format, setFormat] = useState<ShareFormat>("story");
  const [mode, setMode] = useState<ShareMode>("verdict");
  const [chiffreCategory, setChiffreCategory] = useState(() =>
    defaultChiffreCategory(data),
  );
  // Le nom du réseau est souvent peu parlant : on propose d'afficher plutôt
  // la commune de l'utilisateur.
  const [title, setTitle] = useState(() =>
    communes.length === 1 ? communes[0] : nomReseau,
  );
  const [fontsReady, setFontsReady] = useState(false);
  // undefined = en cours de chargement, null = pas de tracé pour cette UDI.
  const [shape, setShape] = useState<UdiShape | null | undefined>(undefined);
  const [png, setPng] = useState<Blob | null>(null);
  const [pngError, setPngError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Réinitialise les choix quand on change d'UDI.
  useEffect(() => {
    setChiffreCategory(defaultChiffreCategory(data));
    setTitle(communes.length === 1 ? communes[0] : nomReseau);
  }, [data, communes, nomReseau]);

  useEffect(() => {
    if (!open) return;
    loadShareFonts()
      .catch((error) => console.error("Failed to load fonts:", error))
      .finally(() => setFontsReady(true));
    try {
      setCanShareFiles(
        typeof navigator.canShare === "function" &&
          navigator.canShare({
            files: [new File([""], "test.png", { type: "image/png" })],
          }),
      );
    } catch {
      setCanShareFiles(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setShape(undefined);
    fetch(`/api/udi-shape?code=${encodeURIComponent(code)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json: UdiShape | null) => {
        if (!cancelled) setShape(json);
      })
      .catch(() => {
        if (!cancelled) setShape(null);
      });
    return () => {
      cancelled = true;
    };
  }, [open, code]);

  const globalResult = getLastPrelResult(data, "tous", colorblindMode);
  const chiffre =
    mode === "chiffre"
      ? buildChiffre(data, chiffreCategory, colorblindMode)
      : null;

  const subtitle = [
    title !== nomReseau ? `Réseau ${nomReseau}` : "Réseau de distribution",
    population != null
      ? `${population.toLocaleString("fr-FR")} habitants`
      : null,
    communes.length > 1 ? `${communes.length} communes` : null,
  ]
    .filter(Boolean)
    // Espaces insécables : on ne coupe la ligne qu'entre deux éléments.
    .map((part) => part!.replace(/ /g, "\u00a0"))
    .join(" · ");

  const cardData: ShareCardData = {
    title,
    subtitle,
    date: formatDate(
      mode === "chiffre"
        ? getLastPrelResult(data, chiffreCategory, colorblindMode).date
        : globalResult.date,
    ),
    shape: shape ?? null,
    shapeColor: chiffre ? chiffre.color : globalResult.color,
    verdict: { label: globalResult.label, resultKey: globalResult.resultKey },
    rows: TOP_LEVEL_CATEGORIES.map((item) => {
      const result = getLastPrelResult(data, item.id, colorblindMode);
      return {
        nom: item.nomAffichage,
        label: result.label,
        color: result.color,
      };
    }),
    chiffre,
  };

  const caption = (() => {
    const lieu = title === nomReseau ? `du réseau ${title}` : `à ${title}`;
    if (chiffre) {
      const valeur =
        chiffre.big === "?"
          ? `${chiffre.caption} (${title}).`
          : `${chiffre.big}${chiffre.unit ? ` ${chiffre.unit}` : ""} ${chiffre.caption} (${title}). Résultat : ${chiffre.label.toLowerCase()}.`;
      return `💧 ${valeur}\n\nEt chez vous ? Vérifiez la qualité de votre eau du robinet sur ${SITE_URL}`;
    }
    const summary = getZoneSummarySentence(data);
    return `💧 L'eau du robinet ${lieu} : ${globalResult.label.toLowerCase()}.${summary ? ` ${summary}` : ""}\n\nEt chez vous ? Vérifiez la qualité de votre eau du robinet sur ${SITE_URL}`;
  })();

  const filename = `dansmoneau-${slugify(title)}-${format}.png`;
  const ready = fontsReady && shape !== undefined;
  const renderKey = `${format}|${mode}|${chiffreCategory}|${title}|${colorblindMode}|${ready}`;

  // Le PNG est généré dès que le visuel change, et non au clic : Safari
  // n'autorise `navigator.share` que dans la foulée immédiate d'un clic.
  useEffect(() => {
    if (!open || !ready) return;
    let cancelled = false;
    setPng(null);
    setPngError(false);
    const timer = setTimeout(() => {
      if (!svgRef.current) return;
      svgElementToPngBlob(svgRef.current)
        .then((blob) => {
          if (!cancelled) setPng(blob);
        })
        .catch((error) => {
          console.error("Failed to render share image:", error);
          if (!cancelled) setPngError(true);
        });
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, ready, renderKey]);

  const download = () => {
    if (!png) return;
    const url = URL.createObjectURL(png);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  const share = async () => {
    if (!png) return;
    const file = new File([png], filename, { type: "image/png" });
    try {
      await navigator.share({ files: [file], text: caption });
    } catch (error) {
      if ((error as DOMException)?.name !== "AbortError") {
        console.error("Share failed:", error);
        download();
      }
    }
  };

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const segmented = <T extends string>(
    value: T,
    onChange: (value: T) => void,
    options: Array<{ value: T; label: string }>,
  ) => (
    <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-lg px-2 py-1.5 text-sm transition-colors",
            value === option.value
              ? "bg-white text-gray-900 font-medium shadow-sm"
              : "text-gray-600 hover:text-gray-900",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto z-[70] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Partager ce résultat</DialogTitle>
          <DialogDescription>
            Créez une image à publier en story ou en post sur les réseaux
            sociaux.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 md:grid-cols-[1fr_280px]">
          <div className="flex items-center justify-center rounded-xl bg-gray-100 p-3">
            {ready ? (
              <ShareCard
                ref={svgRef}
                data={cardData}
                format={format}
                mode={mode}
                colorblindMode={colorblindMode}
                className={cn(
                  "w-auto max-w-full rounded-lg shadow-md",
                  format === "story"
                    ? "h-[46vh] md:h-[66vh] aspect-[9/16]"
                    : "h-[40vh] md:h-[52vh] aspect-[4/5]",
                )}
              />
            ) : (
              <div className="h-[46vh] flex items-center text-sm text-gray-500">
                Préparation de l&apos;image…
              </div>
            )}
          </div>

          <div className="space-y-4 text-sm">
            <div className="space-y-1.5">
              <p className="font-medium">Format</p>
              {segmented(format, setFormat, [
                { value: "story", label: "Story" },
                { value: "post", label: "Post" },
              ])}
            </div>

            <div className="space-y-1.5">
              <p className="font-medium">Contenu</p>
              {segmented(mode, setMode, [
                { value: "verdict", label: "Bilan" },
                { value: "chiffre", label: "Un chiffre" },
              ])}
              {mode === "chiffre" && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {CHIFFRE_CATEGORIES.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setChiffreCategory(item.id)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs transition-colors",
                        chiffreCategory === item.id
                          ? "border-kaki bg-kaki text-white"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50",
                      )}
                    >
                      {item.nomAffichage}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {communes.length > 0 && (
              <div className="space-y-1.5">
                <label htmlFor="share-title" className="font-medium block">
                  Nom affiché
                </label>
                <select
                  id="share-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm"
                >
                  <option value={nomReseau}>Réseau : {nomReseau}</option>
                  {communes
                    .filter((commune) => commune !== nomReseau)
                    .map((commune) => (
                      <option key={commune} value={commune}>
                        {commune}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="space-y-2 pt-1">
              {canShareFiles && (
                <button
                  onClick={share}
                  disabled={!png}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-kaki px-4 py-2.5 font-medium text-white transition-colors hover:bg-kaki/90 disabled:opacity-50"
                >
                  <Send size={16} />
                  Partager
                </button>
              )}
              <button
                onClick={download}
                disabled={!png}
                className={cn(
                  "w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 font-medium transition-colors disabled:opacity-50",
                  canShareFiles
                    ? "border border-gray-200 text-gray-700 hover:bg-gray-50"
                    : "bg-kaki text-white hover:bg-kaki/90",
                )}
              >
                <Download size={16} />
                Télécharger l&apos;image
              </button>
              {pngError && (
                <p className="text-xs text-red-600">
                  L&apos;image n&apos;a pas pu être générée.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="font-medium">Texte à publier</p>
                <button
                  onClick={copyCaption}
                  className="inline-flex items-center gap-1 text-xs text-kaki hover:underline"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copié" : "Copier"}
                </button>
              </div>
              <p className="whitespace-pre-line rounded-lg bg-gray-50 border border-gray-100 p-2 text-xs text-gray-600 leading-relaxed">
                {caption}
              </p>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              L&apos;image indique le nom et le contour de votre réseau
              d&apos;eau : elle donne une idée de l&apos;endroit où vous
              habitez.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
