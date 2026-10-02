"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { getCategoryById } from "@/lib/polluants";
import { getThresholdColor } from "@/lib/parametres";

export type AnalysesFilters = {
  categorie?: string | null;
  parametre?: string | null;
  /** Date exacte du prélèvement, au format YYYY-MM-DD. */
  date?: string | null;
};

type AnalysesModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cdreseau: string | null;
  nomreseaux?: string | null;
  initialFilters?: AnalysesFilters;
};

type AnalyseRow = {
  referenceprel: string;
  referenceanl: string | null;
  datetimeprel: string | null;
  de_partition: number;
  cdparametresiseeaux: string;
  web_label: string | null;
  categorie: string | null;
  categorie_2: string | null;
  categorie_3: string | null;
  valtraduite: number | null;
  limite_qualite: number | null;
  limite_indicative: number | null;
  valeur_sanitaire_1: number | null;
  valeur_sanitaire_2: number | null;
  valeur_sanitaire_1_commentaire: string | null;
};

/** Unité d'affichage d'une catégorie, telle que définie dans lib/polluants.ts. */
function uniteOf(categoryId: string): string {
  return getCategoryById(categoryId)?.unite ?? "";
}

// Catégories renvoyées par l'API (colonne `categorie` de int__resultats_udi).
const CATEGORIE_OPTIONS = [
  { value: "pesticide", label: "Pesticides", unite: uniteOf("pesticide") },
  { value: "nitrate", label: "Nitrates", unite: uniteOf("nitrate") },
  { value: "pfas", label: "PFAS", unite: uniteOf("pfas") },
  { value: "cvm", label: "CVM", unite: uniteOf("cvm") },
  // Ces deux catégories n'ont pas d'entrée active dans lib/polluants.ts (elles y
  // sont commentées) : unité reprise de int__valeurs_de_reference, où tous leurs
  // paramètres sont en µg/L.
  { value: "metaux_lourds", label: "Métaux lourds", unite: "µg/L" },
  {
    value: "substances_indus",
    label: "Substances industrielles",
    unite: "µg/L",
  },
];

const CATEGORIE_BY_VALUE = Object.fromEntries(
  CATEGORIE_OPTIONS.map((item) => [item.value, item]),
);

/**
 * Correspondance entre l'id de catégorie de lib/polluants.ts et la valeur
 * `categorie` attendue par /api/udi-analyses — le vocabulaire de
 * CATEGORIE_OPTIONS ci-dessus. Toutes les catégories n'ont pas d'équivalent :
 * `undefined` signifie qu'on ne sait pas pré-filtrer la modale pour elle.
 */
const CATEGORY_ID_TO_ANALYSES_CATEGORIE: Record<string, string> = {
  pfas: "pfas",
  pesticide: "pesticide",
  nitrate: "nitrate",
  cvm: "cvm",
  sub_indus_perchlorate: "substances_indus",
};

export function getAnalysesCategorie(categoryId: string): string | undefined {
  return CATEGORY_ID_TO_ANALYSES_CATEGORIE[categoryId];
}

const ALL_VALUE = "__all__";

const DEFAULT_SORTING: SortingState = [{ id: "datetimeprel", desc: true }];

function formatValue(value: number | null): string {
  if (value === null) return "—";
  return value.toLocaleString("fr-FR", { maximumFractionDigits: 4 });
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR");
}

// Séparateur ";" et virgule décimale : le format qu'Excel ouvre directement
// avec des paramètres régionaux français.
function csvField(value: string | number | null): string {
  if (value === null) return "";
  const text =
    typeof value === "number" ? String(value).replace(".", ",") : value;
  return /[;"\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const CSV_COLUMNS: Array<{
  header: string;
  value: (row: AnalyseRow) => string | number | null;
}> = [
  { header: "date_prelevement", value: (r) => r.datetimeprel },
  { header: "reference_prelevement", value: (r) => r.referenceprel },
  { header: "code_parametre", value: (r) => r.cdparametresiseeaux },
  { header: "substance", value: (r) => r.web_label },
  {
    header: "categorie",
    value: (r) => CATEGORIE_BY_VALUE[r.categorie ?? ""]?.label ?? r.categorie,
  },
  { header: "valeur", value: (r) => r.valtraduite },
  {
    header: "unite",
    value: (r) => CATEGORIE_BY_VALUE[r.categorie ?? ""]?.unite ?? null,
  },
  { header: "limite_qualite", value: (r) => r.limite_qualite },
  { header: "limite_indicative", value: (r) => r.limite_indicative },
  { header: "valeur_sanitaire", value: (r) => r.valeur_sanitaire_1 },
  {
    header: "commentaire_valeur_sanitaire",
    value: (r) => r.valeur_sanitaire_1_commentaire?.trim() ?? null,
  },
];

function buildCsv(rows: AnalyseRow[]): string {
  const lines = [
    CSV_COLUMNS.map((col) => col.header).join(";"),
    ...rows.map((row) =>
      CSV_COLUMNS.map((col) => csvField(col.value(row))).join(";"),
    ),
  ];
  // BOM : sans lui, Excel lit le fichier en Windows-1252 et casse les accents.
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}

function downloadFile(content: string, filename: string) {
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const columns: ColumnDef<AnalyseRow>[] = [
  {
    id: "datetimeprel",
    accessorKey: "datetimeprel",
    header: "Date",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-gray-600">
        {formatDate(row.original.datetimeprel)}
      </span>
    ),
  },
  {
    id: "web_label",
    accessorKey: "web_label",
    header: "Substance",
    cell: ({ row }) => (
      <span title={row.original.cdparametresiseeaux}>
        {row.original.web_label || row.original.cdparametresiseeaux}
      </span>
    ),
  },
  {
    id: "categorie",
    accessorKey: "categorie",
    header: "Catégorie",
    cell: ({ row }) => (
      <span className="text-gray-600">
        {CATEGORIE_BY_VALUE[row.original.categorie ?? ""]?.label ||
          row.original.categorie}
      </span>
    ),
  },
  {
    id: "valtraduite",
    accessorKey: "valtraduite",
    header: "Valeur",
    cell: ({ row }) => {
      // Mêmes couleurs que dans le panneau de zone (DernieresAnalyses), mais
      // avec les seuils portés par la ligne : ceux en vigueur à la date du
      // prélèvement (cf. int__resultats_udi).
      const { valtraduite, categorie } = row.original;
      const color =
        valtraduite !== null
          ? getThresholdColor(valtraduite, row.original, categorie ?? "")
          : null;
      return (
        <span className="font-numbers" style={color ? { color } : undefined}>
          {formatValue(valtraduite)}
        </span>
      );
    },
  },
  {
    // Colonne unique pour les 3 colonnes chiffrées : une analyse et ses seuils
    // sont toujours exprimés dans la même unité.
    id: "unite",
    header: "Unité",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-gray-500 whitespace-nowrap">
        {CATEGORIE_BY_VALUE[row.original.categorie ?? ""]?.unite || "—"}
      </span>
    ),
  },
  {
    id: "limite_qualite",
    accessorKey: "limite_qualite",
    header: "Limite qualité",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="font-numbers text-gray-500">
        {formatValue(row.original.limite_qualite)}
      </span>
    ),
  },
  {
    id: "valeur_sanitaire_1",
    accessorKey: "valeur_sanitaire_1",
    header: "Valeur sanitaire",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="font-numbers text-gray-500">
        {formatValue(row.original.valeur_sanitaire_1)}
      </span>
    ),
  },
  {
    id: "valeur_sanitaire_1_commentaire",
    accessorKey: "valeur_sanitaire_1_commentaire",
    header: "Commentaire valeur sanitaire",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="block min-w-[200px] text-xs text-gray-500">
        {row.original.valeur_sanitaire_1_commentaire || "—"}
      </span>
    ),
  },
];

const RIGHT_ALIGNED_COLUMNS = new Set([
  "valtraduite",
  "limite_qualite",
  "valeur_sanitaire_1",
]);

export default function AnalysesModal({
  open,
  onOpenChange,
  cdreseau,
  nomreseaux,
  initialFilters,
}: AnalysesModalProps) {
  const [categorie, setCategorie] = useState<string | null>(
    initialFilters?.categorie ?? null,
  );
  const [parametreInput, setParametreInput] = useState(
    initialFilters?.parametre ?? "",
  );
  const [parametre, setParametre] = useState(initialFilters?.parametre ?? "");
  const [date, setDate] = useState(initialFilters?.date ?? "");
  const [sorting, setSorting] = useState<SortingState>(DEFAULT_SORTING);

  const [rows, setRows] = useState<AnalyseRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const pageRef = useRef(1);
  const requestIdRef = useRef(0);

  // Réinitialise les filtres/tri à chaque ouverture pour une nouvelle zone.
  useEffect(() => {
    if (open) {
      setCategorie(initialFilters?.categorie ?? null);
      setParametreInput(initialFilters?.parametre ?? "");
      setParametre(initialFilters?.parametre ?? "");
      setDate(initialFilters?.date ?? "");
      setSorting(DEFAULT_SORTING);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cdreseau]);

  // Debounce de la recherche substance.
  useEffect(() => {
    const handle = setTimeout(() => setParametre(parametreInput), 300);
    return () => clearTimeout(handle);
  }, [parametreInput]);

  /** URL d'une page de résultats, avec les filtres et le tri courants. */
  const pageUrl = useCallback(
    (pageNum: number) => {
      const sort = sorting[0];
      const params = new URLSearchParams({
        cdreseau: cdreseau ?? "",
        page: String(pageNum),
      });
      if (categorie) params.set("categorie", categorie);
      if (parametre) params.set("parametre", parametre);
      if (date) params.set("date", date);
      if (sort) {
        params.set("sortBy", sort.id);
        params.set("sortDir", sort.desc ? "desc" : "asc");
      }
      return `/api/udi-analyses?${params.toString()}`;
    },
    [cdreseau, categorie, parametre, date, sorting],
  );

  const fetchPage = useCallback(
    (pageNum: number, append: boolean) => {
      if (!cdreseau) return;

      const requestId = ++requestIdRef.current;
      if (append) setLoadingMore(true);
      else setLoadingInitial(true);
      setError(false);

      fetch(pageUrl(pageNum))
        .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
        .then((data) => {
          if (requestId !== requestIdRef.current) return;
          setRows((prev) => (append ? [...prev, ...data.rows] : data.rows));
          setTotal(data.total);
          pageRef.current = pageNum;
        })
        .catch((err) => {
          console.error("Failed to fetch analyses:", err);
          if (requestId === requestIdRef.current) setError(true);
        })
        .finally(() => {
          if (requestId === requestIdRef.current) {
            setLoadingInitial(false);
            setLoadingMore(false);
          }
        });
    },
    [cdreseau, pageUrl],
  );

  // Recharge depuis la page 1 à chaque changement de zone/filtre/tri.
  useEffect(() => {
    if (!open || !cdreseau) {
      setRows([]);
      setTotal(0);
      return;
    }
    setRows([]);
    fetchPage(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cdreseau, categorie, parametre, date, sorting]);

  const hasMore = rows.length < total;

  // Export CSV : l'API est paginée, on récupère donc toutes les pages (avec
  // les filtres et le tri affichés) avant de générer le fichier côté client.
  // `exportProgress` vaut null hors export, sinon la part déjà récupérée (0-1).
  const [exportProgress, setExportProgress] = useState<number | null>(null);
  const [exportError, setExportError] = useState(false);
  const exportAbortRef = useRef<AbortController | null>(null);

  // Fermer la modale ou changer de zone annule un export en cours.
  useEffect(() => {
    return () => exportAbortRef.current?.abort();
  }, [open, cdreseau]);

  const exportCsv = async () => {
    if (!cdreseau || exportProgress !== null) return;

    const controller = new AbortController();
    exportAbortRef.current = controller;
    setExportError(false);
    setExportProgress(0);

    const getPage = async (
      pageNum: number,
    ): Promise<{ rows: AnalyseRow[]; total: number }> => {
      const res = await fetch(pageUrl(pageNum), { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    };

    try {
      // Pages chargées une à une jusqu'à atteindre le total annoncé par l'API.
      const allRows: AnalyseRow[] = [];
      let pageNum = 1;
      let exportTotal = Infinity;
      while (allRows.length < exportTotal) {
        const data = await getPage(pageNum);
        if (data.rows.length === 0) break;
        allRows.push(...data.rows);
        exportTotal = data.total;
        setExportProgress(allRows.length / exportTotal);
        pageNum += 1;
      }

      const today = new Date().toISOString().slice(0, 10);
      downloadFile(buildCsv(allRows), `analyses_${cdreseau}_${today}.csv`);
    } catch (err) {
      if (!controller.signal.aborted) {
        console.error("Failed to export analyses:", err);
        setExportError(true);
      }
    } finally {
      if (exportAbortRef.current === controller) {
        exportAbortRef.current = null;
        setExportProgress(null);
      }
    }
  };

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            hasMore &&
            !loadingMore &&
            !loadingInitial
          ) {
            fetchPage(pageRef.current + 1, true);
          }
        },
        { root: scrollContainerRef.current, rootMargin: "200px" },
      );
      observerRef.current.observe(node);
    },
    [hasMore, loadingMore, loadingInitial, fetchPage],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    manualSorting: true,
    enableMultiSort: false,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
  });

  const resultCountLabel = useMemo(() => {
    if (total === 0) return "0 résultat";
    return `${total.toLocaleString("fr-FR")} résultat${total > 1 ? "s" : ""}`;
  }, [total]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] max-h-[85vh] overflow-hidden flex flex-col z-[70]">
        <DialogHeader>
          <DialogTitle>
            Analyses{nomreseaux ? ` — ${nomreseaux}` : ""}
          </DialogTitle>
          <DialogDescription>
            Liste des résultats d&apos;analyse de ce réseau de distribution
            d&apos;eau potable.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2 pb-2 border-b">
          <Select
            value={categorie ?? ALL_VALUE}
            onValueChange={(value) =>
              setCategorie(value === ALL_VALUE ? null : value)
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent className="z-[80]">
              <SelectItem value={ALL_VALUE}>Toutes les catégories</SelectItem>
              {CATEGORIE_OPTIONS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            className="w-[220px]"
            placeholder="Rechercher une substance..."
            value={parametreInput}
            onChange={(e) => setParametreInput(e.target.value)}
          />

          <Input
            type="date"
            className="w-[160px]"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {date && (
            <button
              onClick={() => setDate("")}
              className="text-xs text-gray-500 hover:underline"
            >
              Effacer la date
            </button>
          )}

          <span className="text-xs text-gray-500 ml-auto whitespace-nowrap">
            {resultCountLabel}
          </span>

          <button
            onClick={exportCsv}
            disabled={exportProgress !== null || total === 0}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            {exportProgress !== null
              ? `Export… ${Math.round(exportProgress * 100)} %`
              : "Exporter en CSV"}
          </button>
          {exportError && (
            <span className="text-xs text-red-600">
              L&apos;export a échoué.
            </span>
          )}
        </div>

        {/*
          Ce conteneur doit être le seul élément scrollable : l'en-tête `sticky`
          du tableau se positionne par rapport au plus proche ancêtre scrollable.
          <Table> (shadcn) enveloppe le tableau dans un div `overflow-auto` — on
          le neutralise ici (`[&>div]:overflow-visible`) plutôt que de modifier
          le composant généré.
        */}
        <div
          ref={scrollContainerRef}
          className="flex-1 min-h-0 overflow-auto [&>div]:overflow-visible"
        >
          {error ? (
            <div className="p-4 text-sm text-gray-500 text-center">
              Impossible de charger les analyses.
            </div>
          ) : (
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const canSort = header.column.getCanSort();
                      const align = RIGHT_ALIGNED_COLUMNS.has(header.column.id)
                        ? "right"
                        : "left";
                      return (
                        <TableHead
                          key={header.id}
                          className={align === "right" ? "text-right" : ""}
                        >
                          {canSort ? (
                            <DataTableColumnHeader
                              title={header.column.columnDef.header as string}
                              sorted={
                                header.column.getIsSorted() as
                                  | false
                                  | "asc"
                                  | "desc"
                              }
                              align={align}
                              onSort={header.column.getToggleSortingHandler()}
                            />
                          ) : (
                            flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loadingInitial &&
                  Array.from({ length: 12 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      {columns.map((col) => (
                        <TableCell key={col.id}>
                          <div className="h-3.5 bg-gray-100 rounded animate-pulse" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}

                {!loadingInitial &&
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={
                            RIGHT_ALIGNED_COLUMNS.has(cell.column.id)
                              ? "text-right"
                              : ""
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}

                {!loadingInitial && rows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center text-gray-500 py-10"
                    >
                      Aucun résultat pour ces filtres.
                    </TableCell>
                  </TableRow>
                )}

                {!loadingInitial && hasMore && (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="p-0">
                      <div
                        ref={sentinelRef}
                        className="h-8 flex items-center justify-center"
                      >
                        {loadingMore && (
                          <span className="text-xs text-gray-400">
                            Chargement...
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
