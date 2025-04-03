"use client";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import MapZoneSelector from "./MapZoneSelector";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { POLLUTANT_CATEGORIES } from "@/lib/polluantConfig";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

// import { styled, keyframes } from '@stitches/react';

// Animation for sliding in from the right
// const slideIn = keyframes({
//   '0%': { transform: 'translateX(100%)' },
//   '100%': { transform: 'translateX(0)' },
// });

// Styled component for the panel
// const DialogContent = styled(Dialog.Content, {
//   position: 'fixed',
//   top: 0,
//   right: 0,
//   bottom: 0,
//   width: '300px', // Adjust width as needed
//   backgroundColor: 'white',
//   boxShadow: '-10px 0 15px -5px rgba(0, 0, 0, 0.1)',
//   padding: '20px',
//   animation: `${slideIn} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
//   // Add other styling as needed
// });
interface PollutionExpPanelProps {
  categorieId: string;
}

function Tag({ content }) {
  return (
    <div className="bg-yellow-300 py-1 px-3 rounded-2xl w-fit mb-4">
      {content}
    </div>
  );
}

function PolluantDetailExplication({ polluant, tag }) {
  return (
    <div className="">
      <Tag content={tag} />
      <span>{polluant?.[tag] || ""}</span>
    </div>
  );
}

function ResultCard({ des, result, bgColor }) {
  return (
    <Card className="shadow-none rounded-lg">
      <CardHeader className="p-2 pt-3">
        <CardDescription className={`${bgColor} px-2 py-1 rounded-3xl text-xs`}>
          {des}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 pb-2">
        <span className="font-bold text-lg">{result + "%"}</span>
      </CardContent>
    </Card>
  );
}

function ExplicationCard({ bgColor, quesion, answer }) {
  return (
    <Card className={`${bgColor} shadow-none rounded-lg`}>
      <CardHeader className="p-4 pb-0">
        <CardDescription className={`rounded-3xl flex items-center gap-1`}>
          <InfoCircledIcon />
          {quesion}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">{answer}</CardContent>
    </Card>
  );
}

// Usage example
export default function PollutionExpPanel({
  categorieId = "cvm",
}: PollutionExpPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const main = document.getElementById("main");
    setContainer(main);
  }, []);

  const toggleOpen = () => {
    setIsOpen((o) => !o);
  };
  const handleClose = () => {
    setIsOpen(false);
  };
  const polluant = POLLUTANT_CATEGORIES.filter(
    (p) => p.id == categorieId.toLowerCase(),
  );
  console.log("cvm", polluant);

  return (
    <div>
      <div
        className={`absolute top-24 right-12 z-10  p-3 ${isOpen ? "right-[350px]" : "right-0"} border-r-0`}
      >
        <MapZoneSelector />
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <button
          onClick={toggleOpen}
          className={`absolute ${isOpen ? "right-[286px]" : "right-0"} top-1/2 -mt-10 h-12 bg-white flex justify-center items-center transition-all duration-200`}
        >
          {isOpen ? <ChevronRight /> : <ChevronLeft />}
        </button>
        <DialogPortal container={container}>
          {/* schadcn's dialog  DialogContent does not allowed more personalisation, we use DialogPrimitive.Content directly */}
          <DialogPrimitive.Content
            id="content"
            className="
          absolute top-2.5 right-2.5 bottom-1.5 z-50 w-[320px] border bg-accent
          duration-200 data-[state=open]:animate-in
          data-[state=closed]:animate-out data-[state=closed]:fade-out-0
          data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95
          data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-right-0
          data-[state=open]:slide-in-from-right-1/2
          overflow-y-auto
          "
          >
            <DialogClose
              onClick={handleClose}
              className="absolute top-0 right-0 m-2"
            >
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="0"
                />
                <path
                  d="M15 9L9 15M9 9L15 15"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              </svg>
            </DialogClose>

            <DialogTitle className={cn(" p-4 flex flex-col gap-2")}>
              <div className="text-xs font-thin">FICHE EXPLICATIVE</div>
              <div className="text-2xl">
                {(polluant[0]?.shortName || "UNKOWN").toUpperCase()}
              </div>
              <div className="text-xs font-thin">
                {(polluant[0]?.longName || "").toUpperCase()}
              </div>
            </DialogTitle>
            <DialogDescription
              className={cn(
                "border font-bold text-black  pt-4 px-4 bg-background rounded-t-lg border-b-0",
              )}
            >
              {polluant[0]?.description || ""}
            </DialogDescription>
            <div className="bg-white  p-4 flex flex-col gap-4">
              {Object.keys(polluant[0]).map((k) => {
                if (
                  ["exposureSources", "healthRisks", "regulation"].includes(k)
                ) {
                  return (
                    <PolluantDetailExplication
                      key={k}
                      tag={k}
                      polluant={polluant[0]}
                    />
                  );
                }
              })}
              <div className="flex flex-col gap-2">
                <Tag content="Derniers prélèvement" />
                <ResultCard
                  des="UDI avait au moins 1 PFAS > valeur sanitaire"
                  result="2"
                  bgColor="bg-chart-1"
                />
                <ExplicationCard
                  bgColor="bg-blue-100"
                  quesion={"C'est quoi UDI"}
                  answer={"blablabal"}
                />
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
