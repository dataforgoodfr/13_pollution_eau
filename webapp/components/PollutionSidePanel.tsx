"use client";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { POLLUTANT_CATEGORIES, IPollutantCategory } from "@/lib/polluantConfig";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { X } from "lucide-react";

type polluantDetailTag = keyof Pick<
  IPollutantCategory,
  "exposureSources" | "healthRisks" | "regulation"
>;

function Tag({ content }: { content: string }) {
  return (
    <div className="bg-yellow-300 py-1 px-3 rounded-2xl w-fit mb-4">
      {content}
    </div>
  );
}

function PolluantDetailExplication({
  polluant,
  tag,
}: {
  polluant: IPollutantCategory;
  tag: polluantDetailTag;
}) {
  return (
    <div className="">
      <Tag content={tag} />
      <span>{polluant?.[tag] || ""}</span>
    </div>
  );
}

function ResultCard({
  des,
  result,
  bgColor,
}: {
  des: string;
  result: string;
  bgColor: string;
}) {
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
          <InfoCircledIcon />
          {quesion}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">{answer}</CardContent>
    </Card>
  );
}

// Usage example
export default function PollutionSidePanel({
  categorieId = "cvm",
  onClose,
}: {
  categorieId: string;
  onClose?: () => void;
}) {
  const polluant = POLLUTANT_CATEGORIES.filter(
    (p) => p.id == categorieId.toLowerCase(),
  );

  return (
    <div className="h-full flex flex-col relative">
      <button
        className="absolute top-5 right-5 text-black bg-white rounded-full p-2 shadow-md hover:text-gray-800 hover:bg-gray-100 transition duration-300"
        onClick={() => onClose?.()}
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="text-black p-4">
        <div className="text-xs font-thin">FICHE EXPLICATIVE</div>
        <div className="text-2xl">
          {(polluant[0]?.shortName || "UNKOWN").toUpperCase()}
        </div>
        <div className="text-xs font-thin">
          {(polluant[0]?.longName || "").toUpperCase()}
        </div>
      </div>
      <div className="bg-white p-4 flex flex-col gap-4 rounded-t-lg flex-1 overflow-y-auto">
        <div className="text-black  pt-4">{polluant[0]?.description || ""}</div>
        {Object.keys(polluant[0]).map((k) => {
          if (["exposureSources", "healthRisks", "regulation"].includes(k)) {
            return (
              <PolluantDetailExplication
                key={k}
                tag={k as polluantDetailTag}
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
    </div>
  );
}
