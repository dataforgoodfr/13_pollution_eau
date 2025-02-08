"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { GeoJSONSourceSpecification, LngLat, Map, MapMouseEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Communes,{CommuneType} from "./Communes";
import { Protocol } from 'pmtiles';



const MAP_SOURCES_COMMUNES_GEOJSON = "CommuneData"
const MAP_SOURCES_COMMUNES_PMTILES ="CommunesPMTiles"
const MAP_LAYER_COMMUNES_DOTS = 'CommunesDotsLayer'
const MAP_LAYER_COMMUNES_POLYGONS = 'CommunesPolygonsLayer'

const GeoJsonSpecs:GeoJSONSourceSpecification={
  type: 'geojson',
  data: {type:'FeatureCollection',features:[]},
  cluster: false,    
} 

export default function MainMap() {

  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const MapDefaultCenter= useMemo(()=>{ return new LngLat(2.213749, 46.227638)},[])
  const [CommunesBaseData,SetCommunesBaseData]=useState(null)
  const [FilterString,SetFilterString]=useState("")
  const [PopupObject,SetPopupObject]=useState(null)
  const [RollIndex,SetRollIndex]=useState(0)
  const [Animate]=useState(false)

  useEffect(() => {
    console.log("Adding protocol")
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles",protocol.tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
    }
  }, []);

  useEffect(() => 
  {
    if (map.current || !mapContainer.current) return;

    console.log("Adding Map")
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          "protomaps": {
            type: 'vector',
            //tiles: ['http://10.35.0.15:3000/api/Map/{z}/{x}/{y}.mvt'] // Protomaps tile URL
            "url": "pmtiles://http:/api/Map",
          },
          'raster-tiles': {
            'type': 'raster',
            'tiles': [
                // NOTE: Layers from Stadia Maps do not require an API key for localhost development or most production
                // web deployments. See https://docs.stadiamaps.com/authentication/ for details.
                //'https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg'
                'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            'tileSize': 256,
            'attribution':
                'Map tiles by OpenstreetMap" target="_blank">Stadia Maps</a>. Data &copy; <a href="https://www.openstreetmap.org/about" target="_blank">OpenStreetMap</a> contributors'
        }
        },
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: {
              'background-color': '#ffffff' // Background color
            }
          },
          {
            'id': 'simple-tiles',
            'type': 'raster',
            'source': 'raster-tiles',
            'minzoom': 0,
            'maxzoom': 22
          },
          {
            id: MAP_LAYER_COMMUNES_POLYGONS,
            type: 'line',
            source: 'protomaps',
            'source-layer': 'Communes',
            paint: {
              'line-width':2,
              'line-color': '#9090e0' // Water color
            }
          },
          
          
          // Add more layers as needed
        ]
      },
      center: MapDefaultCenter,
      zoom: 5,
    });

    InitZoneButtons(map.current)

    map.current.on('load', ()=>{ InitCommunesLayer(map.current as Map,SetPopupObject)})
    //map.current.on('sourcedata', (x)=>{console.log("SourceDataEvt",x)})
    return () => {
      map.current?.remove();
    };
  }
  , [map, MapDefaultCenter]);

useEffect(()=>{
     if (CommunesBaseData)
      {
        return
      }
    
    const fetchData = async () => {
     
      const response = await fetch('/api/CommunesServer')
      const jsonData = await response.json()
      SetCommunesBaseData(jsonData)
      SetRollIndex(0)
      const Features = GetCommunesFeatures(jsonData,FilterString,0)

      GeoJsonSpecs.data.features=Features
      setTimeout(() => {
        SetRollIndex(1)
      },100);  
    };

    fetchData();
  },[FilterString, CommunesBaseData,RollIndex])

  useEffect(()=>{
      if (!CommunesBaseData)
      {
        return
      }
      const Features = GetCommunesFeatures(CommunesBaseData,FilterString,RollIndex)
      GeoJsonSpecs.data.features=Features   
      const Src = map.current.getSource(MAP_SOURCES_COMMUNES_GEOJSON)
      if (Src)
      {
        Src.setData(GeoJsonSpecs.data)
      }
      else
      {
        map.current?.addSource(MAP_SOURCES_COMMUNES_GEOJSON,GeoJsonSpecs)
      }
      if (Animate)
      {
        setTimeout(() => {
          SetRollIndex(RollIndex+1)
        },2000); 
      }
    
  },[FilterString, CommunesBaseData,RollIndex,Animate])

  function UpdateDisplatedCommunes(CList:CommuneType[], FString:string)
  {
    SetFilterString(FString)
  }
//
  return <div>
          <Communes CommunesData={CommunesBaseData} DisplayedCommunesListChanged={UpdateDisplatedCommunes}/>
          
          <div ref={mapContainer} className="w-full h-[calc(100vh-9rem)]" />
        </div>;
  
  }

function InitCommunesLayer(_map: maplibregl.Map, SetPopupObjectFn) 
{

  console.log("Initing Map", _map)
  
  const src = _map.getSource(MAP_SOURCES_COMMUNES_GEOJSON)

  if (!src)
  {
    _map.addSource(MAP_SOURCES_COMMUNES_GEOJSON,GeoJsonSpecs)
  }
  //_map.addSource(MAP_SOURCES_COMMUNES_PMTILES,"pmtiles:/api/Map")
  _map.addLayer({
    id: MAP_LAYER_COMMUNES_DOTS,
    type: 'circle',
    source: MAP_SOURCES_COMMUNES_GEOJSON,
    //filter: ['!', ['has', 'point_count']],
    paint: {
        'circle-color': ['get','color'],
        'circle-radius': ['get','radius'],
        'circle-stroke-width': 0.5,
        'circle-stroke-color': '#fff'
    }
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
    closeOnClick: false
  });
  //SetPopupObjectFn(popup)

  _map.on('mouseenter', MAP_LAYER_COMMUNES_POLYGONS, (e:MapMouseEvent) => {
    // Change the cursor style as a UI indicator.
    _map.getCanvas().style.cursor = 'pointer';

    const coordinates = e.lngLat //.features[0].geometry.coordinates.slice()
    const description = e.features[0].properties.nom //+ ' ' + e.features[0].properties.color

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

  _map.on('mouseleave', MAP_LAYER_COMMUNES_DOTS, () => {
    _map.getCanvas().style.cursor = '';
    popup.remove();
  });
  
}
function GetCommunesFeatures(jsonData: CommuneType[],FilterString:string,RollIndex:number) 
{
  return jsonData.map((x,index)=>{return CommuneType2GeoJSON(x,index*RollIndex,FilterString)})
}

function CommuneType2GeoJSON(C:CommuneType, Index:number, FilterString:string)
{
  const Coords=C.G.split(",").map(parseFloat)
  //Index=2*Coords[0]+256*Index
  const Col='#'+((Math.ceil(Index) % 0xFFFFFF).toString(16)).padStart(6,0)
  const RetValue= {
    type:'symbol',
    properties:{
      id:C.I,
      nom:C.n,
      selected:FilterString!==""&& C.n.includes(FilterString?.toUpperCase()),
      radius:3,
      color:Col
    },
    geometry:{
      type:'Point',
      coordinates: [Coords[1],Coords[0]]
    }
  }
  RetValue.properties.radius=RetValue.properties.selected?8:3
  return RetValue

}

function InitZoneButtons(map: maplibregl.Map) 
{
// Custom control to pan to specific zones
class CustomControl {
  map: maplibregl.Map;
  container: HTMLDivElement;
  onAdd(map:maplibregl.Map) {
      this.map = map;
      this.container = document.createElement('div');
      this.container.className = 'custom-control';

      // Create buttons for different zones
      const zones = [
          { name: 'Metropole', coords: [46, 2] },
          { name: 'Guadeloupe', coords: [-61, 16] },
          { name: 'Zone 3', coords: [30, 30] }
      ];

      zones.forEach(zone => {
          const button = document.createElement('button');
          button.textContent = zone.name;
          button.onclick = () => {
              this.map.flyTo({
                  center: zone.coords,
                  essential: true // This animation is considered essential with respect to prefers-reduced-motion
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
map.addControl(new CustomControl(), 'top-left'); 
}

