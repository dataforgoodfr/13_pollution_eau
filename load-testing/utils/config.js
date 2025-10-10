export const BASE_URL = 'https://data.dansmoneau.fr';
export const GEOCODING_URL = 'https://data.geopf.fr';

export const THRESHOLDS = {
  smoke: {
    http_req_duration: ['p(95)<3000', 'p(99)<5000'],
    http_req_failed: ['rate<0.02'],
  },
  load: {
    http_req_duration: ['p(95)<4000', 'p(99)<6000'],
    http_req_failed: ['rate<0.05'],
  },
  stress: {
    http_req_duration: ['p(95)<5000', 'p(99)<8000'],
    http_req_failed: ['rate<0.10'],
  },
  spike: {
    http_req_duration: ['p(95)<6000', 'p(99)<10000'],
    http_req_failed: ['rate<0.15'],
  },
};

export const FRENCH_CITIES = [
  'Paris',
  'Lyon',
  'Marseille',
  'Toulouse',
  'Nice',
  'Nantes',
  'Strasbourg',
  'Montpellier',
  'Bordeaux',
  'Lille',
  'Rennes',
  'Reims',
  'Saint-Étienne',
  'Toulon',
  'Le Havre',
  'Grenoble',
  'Dijon',
  'Angers',
  'Nîmes',
  'Villeurbanne',
];
