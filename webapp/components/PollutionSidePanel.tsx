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
    <div className="bg-yellow-300 font-[600] text-m py-1 px-4 rounded-2xl w-fit mb-2.5 font-mono tracking-wide">
      {content}
    </div>
  );
}

function ResultCard({
  des,
  result,
  bgColor,
  color,
}: {
  des: string;
  result: string;
  bgColor: string;
  color: string;
}) {
  return (
    <Card className="shadow-none rounded-lg my-1">
      <CardHeader className="p-2">
        <CardDescription
          className={`px-2 py-1 rounded-xl text-xs`}
          style={{ color, backgroundColor: bgColor + "33" }}
        >
          {des}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 pb-2">
        <span className="font-bold text-lg">{result + "%"}</span>
      </CardContent>
    </Card>
  );
}

function ResultCardGroup({ category, resultats }) {
  const resultKeys = Object.keys(resultats);
  if (!resultKeys.length) return;
  return resultKeys.map((key) => {
    const result = resultats[key];
    return (
      <ResultCard
        des={result?.label || ""}
        result="2"
        bgColor={result?.couleur}
        color={result?.couleurFond}
        key={key}
      />
    );
  });
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
  console.log("catego", categoryDetails);
  return (
    <div className="h-full flex flex-col relative">
      <button
        className="absolute text-black  top-3 right-3 bg-white rounded-full p-2 shadow-md hover:text-gray-800 hover:bg-gray-100 transition duration-300"
        onClick={() => onClose?.()}
        aria-label="Close"
      >
        <X size={12} />
      </button>

      {categoryDetails === undefined ? (
        <div className="flex items-center justify-center h-full">
          <span className="text-gray-500">Aucune donnée disponible</span>
        </div>
      ) : (
        <>
          <div className="text-black p-6 pb-4">
            <div className="text-xs font-thin font-spline_sans_mono">
              FICHE EXPLICATIVE
            </div>
            <div className="text-3xl py-2 font-spline_sans">
              {(categoryDetails.nomAffichage || "UNKOWN").toUpperCase()}
            </div>
            {categoryDetails.pathNomAffichage && (
              <div className="text-xs font-thin font-spline_sans_mono pb-2">
                {categoryDetails.pathNomAffichage.toUpperCase()}
              </div>
            )}
          </div>
          <div className="font-inter bg-white p-4 flex flex-col gap-4 rounded-t-lg flex-1 overflow-y-auto">
            <div className="text-black font-[600]">
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

            <div className="flex flex-col gap-2">
              <Tag content="Derniers prélèvement" />

              {/* <ResultCard
                des="UDI avait au moins 1 PFAS > valeur sanitaire"
                result="2"
                bgColor="bg-chart-1"
              /> */}
              <ResultCardGroup
                category={category}
                resultats={categoryDetails?.resultats || {}}
              />
              {/* <ExplicationCard
                bgColor="bg-blue-100"
                quesion={"C'est quoi UDI"}
                answer={"blablabal"}
              /> */}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
