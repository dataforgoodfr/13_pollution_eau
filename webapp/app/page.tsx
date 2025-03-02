"use client";
import CommuneFilter from "@/components/CommuneFilter";
import MainMap from "@/components/Map";
import YearFilter, { YearFilerInfo } from "@/components/YearFilter";
import { Feature } from "maplibre-gl";
import { useState } from "react";

// Todo read from DB
const years: YearFilerInfo[] = [
  { value: 2024, label: "2024" },
  { value: 2023, label: "2023" },
  { value: 2022, label: "2022" },
  { value: 2021, label: "2021" },
  { value: 2020, label: "2020" },
];
export default function Home() {
  const [filteredYear, setFilteredYear] = useState<YearFilerInfo>(years[0]);
  const [selectedCommune, setSelectedCommune]=useState<Feature|null>(null)

  console.log("YearFilter is now", filteredYear);
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 bg-blue-700 text-white">
        <h1 className="text-2xl font-bold">
          Pollution de l&apos;Eau Potable en France en {filteredYear.label}
        </h1>
      </header>

      <main className="flex-1">
        <div className=" absolute grid grid-cols-1 z-10">
          <div className="row-auto">
            <CommuneFilter className="flex-1   grid grid-cols-3 gap-2 bg-white" onCommuneSelected={setSelectedCommune}/>
            <YearFilter
              className="flex-1 grid grid-cols-3 gap-2"
              value={filteredYear}
              onValueChange={setFilteredYear}
              availableYears={years}
            />
          </div>
        </div>
        <div className="z-0">
          <MainMap
            className="z-0 grid grid-cols-1 gap-2"
            selectedYear={filteredYear}
            selectedCommune={selectedCommune}
          />
        </div>
      </main>

      <footer className="p-4 bg-gray-100 text-center text-sm">
        <p>Données ouvertes sur la qualité de l&apos;eau en France</p>
      </footer>
    </div>
  );
}
