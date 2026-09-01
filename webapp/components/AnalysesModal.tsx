"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
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

export type AnalysesFilters = {
  categorie?: string | null;
  severite?: string | null;
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
  severite: string;
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

const SEVERITE_OPTIONS: Array<{
  value: string;
  label: string;
  color: string;
}> = [
  {
    value: "deconseille",
    label: "Déconseillé (dépassement sanitaire)",
    color: "#f03b20",
  },
  {
    value: "non_conforme",
    label: "Non conforme (limite de qualité)",
    color: "#fe9929",
  },
  {
    value: "vigilance",
    label: "Vigilance (limite indicative)",
    color: "#FDC70C",
  },
  { value: "quantifie", label: "Quantifié (conforme)", color: "#2ca25f" },
  { value: "non_quantifie", label: "Non quantifié", color: "#999999" },
];

const SEVERITE_BY_VALUE = Object.fromEntries(
  SEVERITE_OPTIONS.map((item) => [item.value, item]),
);

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

function SeveriteBadge({ severite }: { severite: string }) {
  const details = SEVERITE_BY_VALUE[severite];
  if (!details)
    return <span className="text-xs text-gray-500">{severite}</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs whitespace-nowrap">
      <span
        className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-black/10"
        style={{ backgroundColor: details.color }}
      />
      {details.label}
    </span>
  );
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
    header: "Paramètre",
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
    cell: ({ row }) => (
      <span className="font-numbers">
        {formatValue(row.original.valtraduite)}
      </span>
    ),
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
    id: "severite",
    accessorKey: "severite",
    header: "Statut",
    cell: ({ row }) => <SeveriteBadge severite={row.original.severite} />,
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
  const [severite, setSeverite] = useState<string | null>(
    initialFilters?.severite ?? null,
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
      setSeverite(initialFilters?.severite ?? null);
      setParametreInput(initialFilters?.parametre ?? "");
      setParametre(initialFilters?.parametre ?? "");
      setDate(initialFilters?.date ?? "");
      setSorting(DEFAULT_SORTING);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cdreseau]);

  // Debounce de la recherche paramètre.
  useEffect(() => {
    const handle = setTimeout(() => setParametre(parametreInput), 300);
    return () => clearTimeout(handle);
  }, [parametreInput]);

  const fetchPage = useCallback(
    (pageNum: number, append: boolean) => {
      if (!cdreseau) return;

      const requestId = ++requestIdRef.current;
      if (append) setLoadingMore(true);
      else setLoadingInitial(true);
      setError(false);

      const sort = sorting[0];
      const params = new URLSearchParams({
        cdreseau,
        page: String(pageNum),
      });
      if (categorie) params.set("categorie", categorie);
      if (severite) params.set("severite", severite);
      if (parametre) params.set("parametre", parametre);
      if (date) params.set("date", date);
      if (sort) {
        params.set("sortBy", sort.id);
        params.set("sortDir", sort.desc ? "desc" : "asc");
      }

      fetch(`/api/udi-analyses?${params.toString()}`)
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
    [cdreseau, categorie, severite, parametre, date, sorting],
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
  }, [open, cdreseau, categorie, severite, parametre, date, sorting]);

  const hasMore = rows.length < total;

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

          <Select
            value={severite ?? ALL_VALUE}
            onValueChange={(value) =>
              setSeverite(value === ALL_VALUE ? null : value)
            }
          >
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Toutes les conformités" />
            </SelectTrigger>
            <SelectContent className="z-[80]">
              <SelectItem value={ALL_VALUE}>Toutes les conformités</SelectItem>
              {SEVERITE_OPTIONS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            className="w-[220px]"
            placeholder="Rechercher un paramètre..."
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
