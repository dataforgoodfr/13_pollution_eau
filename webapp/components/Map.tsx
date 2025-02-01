"use client";

import { useEffect, useRef } from "react";
import maplibregl, { LngLat, Map, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Communes,{CommuneType} from "./Communes";

export default function MainMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const Dlist:CommuneType[]=[]
  const MapDefaultCenter= new LngLat(2.213749, 46.227638)
     
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/positron",
      center: MapDefaultCenter,
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
      let MinLon=180
      let MaxLon=-180
      let MinLat=90
      let MaxLat=-90
       CList.map((c:CommuneType)=>{
        if (!c.Marker && c.Centroid)
        {
          c.Marker=new Marker().setLngLat([c.Centroid.Lon, c.Centroid.Lat])

        }
        if (c.Marker)
        {
          c.Marker.addTo((map.current as Map))
          Dlist.push(c)
          MinLon=Math.min(MinLon,c.Centroid.Lon-1)
          MaxLon=Math.max(MaxLon,c.Centroid.Lon+1)
          MinLat=Math.min(MinLat,c.Centroid.Lat-1)
          MaxLat=Math.max(MaxLat,c.Centroid.Lat+1)
        }
      })
      map.current?.fitBounds([[MinLon,MinLat],[MaxLon,MaxLat]])
    }   
    else
    {
      map.current?.zoomTo(5).setCenter(MapDefaultCenter)
    } 
  }

  return <div>
          <Communes DisplayedCommunesListChanged={UpdateDisplatedCommunes}/>
          <div ref={mapContainer} className="w-full h-[calc(100vh-8rem)]" />
        </div>;
}
