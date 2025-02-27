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
