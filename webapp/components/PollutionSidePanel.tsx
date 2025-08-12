"use client";
import { Info } from "lucide-react";
import { getCategoryById } from "@/lib/polluants";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { X } from "lucide-react";

function Tag({ content }: { content: string }) {
  return (
    <div className="bg-yellow-300 py-1 px-3 rounded-2xl w-fit mb-4">
      {content}
    </div>
  );
}

function ExplicationCard({
  bgColor,
  quesion,
  answer,
}: {
  bgColor: string;
  quesion: string;
  answer: string;
}) {
  return (
    <Card className={`${bgColor} shadow-none rounded-lg`}>
      <CardHeader className="p-4 pb-0">
        <CardDescription className={`rounded-3xl flex items-center gap-1`}>
          <Info />
          {quesion}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">{answer}</CardContent>
    </Card>
  );
}

export default function PollutionSidePanel({
  category,
  onClose,
}: {
  category: string;
  onClose?: () => void;
}) {
  const categoryDetails = getCategoryById(category);

  return (
    <div className="h-full flex flex-col relative">
      <button
        className="absolute top-5 right-5 text-black bg-white rounded-full p-2 shadow-md hover:text-gray-800 hover:bg-gray-100 transition duration-300"
        onClick={() => onClose?.()}
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {categoryDetails === undefined ? (
        <div className="flex items-center justify-center h-full">
          <span className="text-gray-500">Aucune donnée disponible</span>
        </div>
      ) : (
        <>
          <div className="text-black p-4">
            <div className="text-xs font-thin">FICHE EXPLICATIVE</div>
            <div className="text-2xl">
              {(categoryDetails.nomAffichage || "UNKOWN").toUpperCase()}
            </div>
            {/* <div className="text-xs font-thin">
              {(categoryDetails.longName || "").toUpperCase()}
            </div> */}
          </div>
          <div className="bg-white p-4 flex flex-col gap-4 rounded-t-lg flex-1 overflow-y-auto">
            <div className="text-black  pt-4">
              {categoryDetails.description || ""}
            </div>
            <div>
              <Tag content="Exposition" />
              <p>{categoryDetails.sourcesExposition || "..."}</p>
            </div>
            <div>
              <Tag content="Risques sanitaires" />
              <p>{categoryDetails.risquesSante || "..."}</p>
            </div>
            <div>
              <Tag content="Réglementation en France" />
              <p>{categoryDetails.regulation || "..."}</p>
            </div>

            <ExplicationCard
              bgColor="bg-blue-100"
              quesion={"C'est quoi UDI ?"}
              answer={
                "Une Unité de Distribution d'eau (UDI) est un système de distribution d'eau potable qui dessert une zone géographique donnée. Chaque UDI fait l'objet de contrôles sanitaires réguliers."
              }
            />
          </div>
        </>
      )}
    </div>
  );
}
