import { defaultLocale } from "maplibre-gl/src/ui/default_locale";

// French locale for MapLibre, inheriting from default locale
// Only overriding the CooperativeGesturesHandler messages
export const frenchLocale = {
  ...defaultLocale,
  // French overrides for CooperativeGesturesHandler
  "CooperativeGesturesHandler.WindowsHelpText":
    "Utilisez Ctrl + molette pour zoomer sur la carte",
  "CooperativeGesturesHandler.MacHelpText":
    "Utilisez ⌘ + molette pour zoomer sur la carte",
  "CooperativeGesturesHandler.MobileHelpText":
    "Utilisez deux doigts pour déplacer la carte",
};
