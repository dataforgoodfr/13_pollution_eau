import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Menu } from "lucide-react";

interface HamburgerButtonProps {
  onClick: () => void;
  visible: boolean;
}

export const HamburgerButton = ({ onClick, visible }: HamburgerButtonProps) => {
  if (!visible) {
    return null;
  }

  return (
    <TooltipProvider key="hamburger-button">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className="bg-white shadow-lg p-3 rounded-2xl focus:outline-none"
            aria-label="Toggle legend"
          >
            <Menu />
          </button>
        </TooltipTrigger>
        <TooltipContent className="bg-white text-custom-drom" side="right">
          Afficher la légende
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
