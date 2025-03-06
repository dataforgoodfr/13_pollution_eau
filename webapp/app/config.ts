import layers from "protomaps-themes-base";

export const MAPLIBRE_MAP = {
  protomaps: {
    // https://protomaps.com/api
    api_key: process.env.NEXT_PUBLIC_PROTOMAPS_API_KEY || "",
    maxzoom: 15,
    theme: "white",
    language: "fr",
  },
  initialViewState: {
    longitude: 2.213749,
    latitude: 46.227638,
    zoom: 5,
  },
  countryBorderWidth: 2,
  countryBorderColor: "#bdb8b8",
};

// Default map style without layers (will be added dynamically)
export const DEFAULT_MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  glyphs:
    "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
  sprite: "https://protomaps.github.io/basemaps-assets/sprites/v4/light",
  sources: {
    protomaps: {
      type: "vector",
      maxzoom: MAPLIBRE_MAP.protomaps.maxzoom,
      url: `https://api.protomaps.com/tiles/v4.json?key=${MAPLIBRE_MAP.protomaps.api_key}`,
      attribution: '<a href="https://osm.org/copyright">© OpenStreetMap</a>',
    },
    polluants: {
      type: "vector",
      url: "pmtiles://s3/upload/datacommunes.pmtiles",
    },
  },
  layers: [], // layers will be added dynamically in the Map component
} satisfies maplibregl.StyleSpecification;

// Helper function to get the default base layers
export const getDefaultLayers = () => {
  return [
    ...layers(
      "protomaps",
      MAPLIBRE_MAP.protomaps.theme,
      MAPLIBRE_MAP.protomaps.language,
    ).filter((layer) => !["boundaries_country"].includes(layer.id)),
    {
      id: "boundaries_country",
      type: "line",
      source: "protomaps",
      "source-layer": "boundaries",
      filter: ["<=", "kind_detail", 2],
      paint: {
        "line-color": MAPLIBRE_MAP.countryBorderColor,
        "line-width": MAPLIBRE_MAP.countryBorderWidth,
      },
    },
  ];
};
