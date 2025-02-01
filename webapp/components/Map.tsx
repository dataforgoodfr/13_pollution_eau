"use client";

import { useEffect, useRef } from "react";
import maplibregl, { Map, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Communes,{CommuneType} from "./Communes";

export default function MainMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const Dlist:CommuneType[]=[]
     
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/positron",
      center: [2.213749, 46.227638],
      zoom: 5,
    });

    return () => {
      map.current?.remove();
    };
  }, [map]);

  function UpdateDisplatedCommunes(CList:CommuneType[])
  {
    if (Dlist)
    {
      Dlist.map((c:CommuneType)=>{
        if (c.Marker)
        {
          c.Marker.remove()          
        }
      })
    }
    if (CList && CList.length < 51)
    {
       CList.map((c:CommuneType)=>{
        if (!c.Marker && c.Centroid)
        {
          c.Marker=new Marker().setLngLat([c.Centroid.Lon, c.Centroid.Lat])
        }
        if (c.Marker)
        {
          c.Marker.addTo((map.current as Map))
          Dlist.push(c)
        }
      })
      
    }    
  }

  return <div>
          <Communes DisplayedCommunesListChanged={UpdateDisplatedCommunes}/>
          <div ref={mapContainer} className="w-full h-[calc(100vh-8rem)]" />
        </div>;
}
