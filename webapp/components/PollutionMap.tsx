"use client";

import { useState } from "react";
import PollutionMapBaseLayer from "@/components/PollutionMapBase";
import PollutionMapFilters from "@/components/PollutionMapFilters";
// import PollutionMapSearchBox from "@/components/PollutionMapSearchBox";
// import PollutionMapLegend from "@/components/PollutionMapLegend";
import PollutionMapDetailPanel from "@/components/PollutionMapDetailPanel";
import PollutionMapSearchBox from "./PollutionMapSearchBox";

export default function PollutionMap() {
  // États partagés entre les composants
  const [year, setYear] = useState("2024");
  const [categoryType, setCategoryType] = useState("cvm");
  const [selectedCommune, setSelectedCommune] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);

  return (
    <div className="relative w-full h-full flex flex-col">
      <PollutionMapBaseLayer
        year={year}
        categoryType={categoryType}
        selectedCommune={selectedCommune}
        onFeatureClick={setSelectedFeature}
      />

      <div className="absolute top-4 left-4 right-4 z-10 bg-white p-3 rounded-lg shadow-lg flex justify-between">
        <PollutionMapSearchBox
          onSelect={setSelectedCommune}
          selectedCommune={selectedCommune}
        />
        <PollutionMapFilters
          year={year}
          setYear={setYear}
          categoryType={categoryType}
          setCategoryType={setCategoryType}
        />
      </div>

      {/* <div className="absolute bottom-6 right-4 z-10 bg-white p-3 rounded-lg shadow-lg">
        <PollutionMapLegend categoryType={categoryType} />
      </div> */}

      {selectedFeature && (
        <PollutionMapDetailPanel
          feature={selectedFeature}
          onClose={() => setSelectedFeature(null)}
          className="absolute bottom-6 left-4 z-10 bg-white p-3 rounded-lg shadow-lg max-w-xs"
        />
      )}
    </div>
  );
}
