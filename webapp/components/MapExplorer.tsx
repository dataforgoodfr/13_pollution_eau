import React from "react";
import Map from "./Map";

export function MapExplorer() {
  return (
    <div className="relative h-full flex flex-col">
      <div className="flex-1 relative">
        <Map />
      </div>
      <div className="absolute top-2.5 left-2.5 p-2.5 bg-gray-100 bg-opacity-80 border border-gray-300 rounded">
        <h1 className="m-0 mb-2.5">Map Explorer</h1>
        Add filters here
      </div>
    </div>
  );
}
