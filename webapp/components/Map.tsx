"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, {
  Feature,
  GeoJSONSourceSpecification,
  LngLat,
  Map,
  MapGeoJSONFeature,
  MapMouseEvent,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import { YearFilerInfo } from "./YearFilter";

const MAP_SOURCES_COMMUNES_GEOJSON = "CommuneData";
const MAP_SOURCES_COMMUNES_PMTILES = "PMTiles_Communes";
const MAP_SOURCES_CVM_PMTILES = "CVM_Communes";
const MAP_LAYER_COMMUNES_DOTS = "CommunesDotsLayer";
const MAP_LAYER_COMMUNES_POLYGONS_CVM_0 = "CommunesCVM_C0";
const MAP_LAYER_COMMUNES_POLYGONS_CVM_1 = "CommunesCVM_C1";
const MAP_LAYER_COMMUNES_POLYGONS = "CommunesPolygonsLayer";
const MAP_LAYER_COMMUNES_POLYGONS_SEARCH = "CommunesPolygonsLayer_SearchFilter";

const GeoJsonSpecs: GeoJSONSourceSpecification = {
  type: "geojson",
  data: { type: "FeatureCollection", features: [] },
  cluster: false,
};

interface mapParams {
  selectedCommune: Feature | null;
  selectedYear: YearFilerInfo;
  selectedPolluantGroup: number;
}

export default function MainMap(props: mapParams) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const MapDefaultCenter = useMemo(() => {
    return new LngLat(2.213749, 46.227638);
  }, []);

  const [selectedYear, setSelectedYear] = useState<YearFilerInfo>(
    props?.selectedYear
      ? props.selectedYear
      : { value: new Date().getFullYear(), label: new Date().getFullYear() },
  );
  const [selectedPolluantGroup] = useState<number>(
    props?.selectedPolluantGroup ? props.selectedPolluantGroup : 1,
  );
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [currentCommune, setCurrentCommune] = useState<Feature | null>(null);

  if (props?.selectedYear && selectedYear !== props.selectedYear) {
    setSelectedYear(props.selectedYear);
  }
  useEffect(() => {
    console.log("Adding protocol");
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  console.log("YearFilter is now", selectedYear, props.selectedCommune);

  if (
    props?.selectedCommune &&
    map?.current &&
    props.selectedCommune.properties.name !== currentCommune?.properties?.name
  ) {
    if (props.selectedCommune.geometry?.coordinates) {
      console.log("flying to ", props.selectedCommune.geometry?.coordinates);
      map.current.flyTo({
        center: props.selectedCommune.geometry?.coordinates,
        essential: true,
        zoom: 9,
      });
    }
    setCurrentCommune(props.selectedCommune);
  }

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const confProp = GetConformtyPropName(selectedPolluantGroup,selectedYear)
    console.log("Adding Map");
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          /*PMTiles_Communes: {
            type: "vector",
            //tiles: ['http://10.35.0.15:3000/api/Map/{z}/{x}/{y}.mvt'] // Protomaps tile URL
            url: "pmtiles://http:/api/Map/Contours",
          },*/
          /*PFAS_Communes: {
            type: "vector",
            //tiles: ['http://10.35.0.15:3000/api/Map/{z}/{x}/{y}.mvt'] // Protomaps tile URL
            url: "pmtiles://http:/api/Map/PFAS",
          },*/
          CVM_Communes: {
            type: "vector",
            //tiles: ['http://10.35.0.15:3000/api/Map/{z}/{x}/{y}.mvt'] // Protomaps tile URL
            url: "pmtiles://http:/api/Map/CVM",
          },
          "raster-tiles": {
            type: "raster",
            tiles: [
              // NOTE: Layers from Stadia Maps do not require an API key for localhost development or most production
              // web deployments. See https://docs.stadiamaps.com/authentication/ for details.
              //'https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg'
              "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution:
              'Map tiles by OpenstreetMap" target="_blank">Stadia Maps</a>. Data &copy; <a href="https://www.openstreetmap.org/about" target="_blank">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: "background",
            type: "background",
            paint: {
              "background-color": "#ffffff", // Background color
            },
          },
          {
            id: "simple-tiles",
            type: "raster",
            source: "raster-tiles",
            minzoom: 0,
            maxzoom: 18,
          },
          {
            id: MAP_LAYER_COMMUNES_POLYGONS,
            type: "line",
            source: MAP_SOURCES_CVM_PMTILES,
            "source-layer": "CVM",
            paint: {
              "line-width": 0.1,
              "line-color": "#9090e0", // Water color
              "line-opacity": 0.5,
            },
          },
          {
            id: MAP_LAYER_COMMUNES_POLYGONS_CVM_0,
            type: "fill",
            source: MAP_SOURCES_CVM_PMTILES,
            "source-layer": "CVM",
            filter:["==",['get',"confProp"],"conforme"],
            paint: {
              "fill-color": "#00FF00",
              "fill-opacity": 0.5,
            },
          },
          {
            id: MAP_LAYER_COMMUNES_POLYGONS_CVM_1,
            type: "fill",
            source: MAP_SOURCES_CVM_PMTILES,
            "source-layer": "CVM",
            filter: ["==", ["get", "confProp"], "non conforme"],
            // filter:['==',['get','resultat_cvm'],'{"2020":"conforme","2021":"conforme","2022":"conforme","2023":"conforme","2024":"non conforme"}'],
            paint: {
              "fill-color": "#FF0000",
              "fill-opacity": 0.5,
            },
          },
          /*{
            id: MAP_LAYER_COMMUNES_DOTS,
            type: "circle",
            source: MAP_SOURCES_PFAS_PMTILES,
            "source-layer": "PFAS",
            paint: {
              "circle-radius": ["get", "radius"],
              "circle-color": ["get", "color"], //'#9090e0' // Water color
            },
          },*/
          {
            id: MAP_LAYER_COMMUNES_POLYGONS_SEARCH,
            type: "fill",
            filter: ["in", ["get", "nom"], ["literal", []]],
            source: MAP_SOURCES_CVM_PMTILES,
            "source-layer": "CVM",
            paint: {
              "fill-color": "#ff0000",
              "fill-opacity": 0.2,
            },
          },

          // Add more layers as needed
        ],
      },
      center: MapDefaultCenter,
      zoom: 5,
    });

    //InitZoneButtons(map.current);

    map.current.on("load", () => {
      InitCommunesLayer(map.current as Map);
      setMapLoaded(true);
    });
    //map.current.on('sourcedata', (x)=>{console.log("SourceDataEvt",x)})
    return () => {
      map.current?.remove();
    };
  }, [map, MapDefaultCenter]);

  useEffect(() => {
    if (!mapLoaded) {
      return;
    }
    const Conforme = GetConformtyPropName(selectedPolluantGroup, selectedYear);

    console.log("updating map filters", Conforme);
    map.current?.setFilter(MAP_LAYER_COMMUNES_POLYGONS_CVM_0, [
      "==",
      ["get", Conforme],
      "conforme",
    ]);
    map.current?.setFilter(MAP_LAYER_COMMUNES_POLYGONS_CVM_1, [
      "==",
      ["get", Conforme],
      "non conforme",
    ]);
  }, [selectedYear, selectedPolluantGroup, mapLoaded]);

  /*  map?.current?.on("move", MAP_LAYER_COMMUNES_POLYGONS, () => {
    const QS_0 = map.current?.querySourceFeatures(MAP_SOURCES_CVM_PMTILES, {
      sourceLayer: "CVM",
      //filter: ["all"],
    });

    if (QS_0) {
      const Values = [];
      QS_0.map((x: MapGeoJSONFeature) => {
        if (x.properties?.resultat_cvm) {
          if (x.properties.commune_code_insee == 69029) {
            console.log("la", x);
          }
          Values[x.properties.resultat_cvm]
            ? 1
            : Values[x.properties.resultat_cvm] + 1;
        }
      });
      console.log("Values", Values);
      //console.log("QS",QS_0[0])
      //map.current?.setFilter(MAP_LAYER_COMMUNES_POLYGONS_CVM_0,["==",['get','resultat_cvm_2024_conforme'],1])
      //map.current?.setFilter(MAP_LAYER_COMMUNES_POLYGONS_CVM_1,["==",['get','resultat_cvm_2024_non conforme'],1])
    }
  }); */

  //
  return (
    <div>
      <div ref={mapContainer} className="w-full h-[calc(100vh-9rem)]" />
    </div>
  );
}

function GetConformtyPropName(selectedPolluantGroup: number, selectedYear: YearFilerInfo) {
  return "Res_Cat_" + selectedPolluantGroup + "_" + selectedYear.value;
}

function InitCommunesLayer(_map: maplibregl.Map) {
  return;
  console.log("Initing Map", _map);

  const src = _map.getSource(MAP_SOURCES_COMMUNES_GEOJSON);

  if (!src) {
    _map.addSource(MAP_SOURCES_COMMUNES_GEOJSON, GeoJsonSpecs);
  }
  //_map.addSource(MAP_SOURCES_COMMUNES_PMTILES,"pmtiles:/api/Map")
  _map.addLayer({
    id: MAP_LAYER_COMMUNES_DOTS,
    type: "circle",
    source: MAP_SOURCES_COMMUNES_GEOJSON,
    //filter: ['!', ['has', 'point_count']],
    paint: {
      "circle-color": ["get", "color"],
      "circle-radius": ["get", "radius"],
      "circle-stroke-width": 0.5,
      "circle-stroke-color": "#fff",
    },
  });

  /*  _map.addLayer({
    id: MAP_SOURCES_COMMUNES_PMTILES,
    type: 'line',
    source: 'protomaps',
    "source-layer":"*",
    //filter: ['!', ['has', 'point_count']],
      paint: {
        "line-color": "#999",
        "fill-color": "#777777"
      }
    });
  */

  // Create a popup, but don't add it to the map yet.
  const popup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
  });
  //SetPopupObjectFn(popup)

  _map.on("mouseenter", MAP_LAYER_COMMUNES_POLYGONS, (e: MapMouseEvent) => {
    // Change the cursor style as a UI indicator.
    _map.getCanvas().style.cursor = "pointer";

    let Lon = 0;
    let Lat = 0;
    const NbPts = e.features[0].geometry.coordinates[0].length;
    e.features[0]?.geometry?.coordinates[0]?.map((x: LngLat) => {
      Lon += x[0];
      Lat += x[1];
    });

    const coordinates: LngLat = new LngLat(Lon / NbPts, Lat / NbPts);

    const description = e.features[0].properties.nom; //+ ' ' + e.features[0].properties.color

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    // Populate the popup and set its coordinates
    // based on the feature found.
    popup.setLngLat(coordinates).setHTML(description).addTo(_map);
  });

  _map.on("mouseleave", MAP_LAYER_COMMUNES_DOTS, () => {
    _map.getCanvas().style.cursor = "";
    popup.remove();
  });
}
function GetCommunesFeatures(
  jsonData: CommuneType[],
  FilterString: string,
  RollIndex: number,
) {
  return jsonData.map((x, index) => {
    return CommuneType2GeoJSON(x, index * RollIndex, FilterString);
  });
}

function CommuneType2GeoJSON(
  C: CommuneType,
  Index: number,
  FilterString: string,
) {
  const Coords = C.G.split(",").map(parseFloat);
  //Index=2*Coords[0]+256*Index
  const Col = "#" + (Math.ceil(Index) % 0xffffff).toString(16).padStart(6, 0);
  const RetValue = {
    type: "symbol",
    properties: {
      id: C.I,
      nom: C.n,
      selected:
        FilterString !== "" && C.n.includes(FilterString?.toUpperCase()),
      radius: 3,
      color: Col,
    },
    geometry: {
      type: "Point",
      coordinates: [Coords[1], Coords[0]],
    },
  };
  RetValue.properties.radius = RetValue.properties.selected ? 8 : 3;
  return RetValue;
}

function InitZoneButtons(map: maplibregl.Map) {
  // Custom control to pan to specific zones
  class CustomControl {
    map: maplibregl.Map;
    container: HTMLDivElement;
    onAdd(map: maplibregl.Map) {
      this.map = map;
      this.container = document.createElement("div");
      this.container.className = "custom-control";

      // Create buttons for different zones
      const zones = [
        { name: "Metropole", coords: [46, 2] },
        { name: "Guadeloupe", coords: [-61, 16] },
        { name: "Zone 3", coords: [30, 30] },
      ];

      zones.forEach((zone) => {
        const button = document.createElement("button");
        button.textContent = zone.name;
        button.onclick = () => {
          this.map.flyTo({
            center: zone.coords,
            essential: true, // This animation is considered essential with respect to prefers-reduced-motion
          });
        };
        this.container.appendChild(button);
      });

      return this.container;
    }

    onRemove() {
      this.container.parentNode.removeChild(this.container);
      this.map = undefined;
    }
  }

  // Add the custom control to the map
  map.addControl(new CustomControl(), "top-left");
}
