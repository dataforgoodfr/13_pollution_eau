import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

type DataTableColumnHeaderProps = {
  title: string;
  sorted: false | "asc" | "desc";
  onSort?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  align?: "left" | "right";
};

export function DataTableColumnHeader({
  title,
  sorted,
  onSort,
  className,
  align = "left",
}: DataTableColumnHeaderProps) {
  const Icon =
    sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ChevronsUpDown;

  return (
    <button
      type="button"
      onClick={onSort}
      className={cn(
        "inline-flex items-center gap-1 -ml-2 px-2 py-1 rounded hover:bg-gray-100 transition-colors",
        align === "right" && "flex-row-reverse -mr-2 ml-0",
        className,
      )}
    >
      <span>{title}</span>
      <Icon
        className={cn(
          "h-3.5 w-3.5",
          sorted ? "text-gray-700" : "text-gray-400",
        )}
      />
    </button>
  );
}
