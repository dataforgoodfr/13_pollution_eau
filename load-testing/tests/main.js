import { THRESHOLDS } from '../utils/config.js';
import { pageLoadColdCache, pageLoadWarmCache } from '../scenarios/page-load.js';
import { mapPanAndZoom, heavyMapExploration } from '../scenarios/map-interaction.js';
import { locationSearch, multipleSearches } from '../scenarios/search.js';
import { completeUserJourney } from '../scenarios/user-journey.js';

/**
 * Main Test Suite
 * Purpose: Run mixed scenarios simulating realistic TV broadcast traffic
 * Duration: 15 minutes
 * Users: Up to 600 concurrent users with different behaviors
 */
export const options = {
  scenarios: {
    // 40% users: Complete journey (new visitors)
    complete_journey: {
      executor: 'ramping-vus',
      exec: 'completeUserJourney',
      startVUs: 0,
      stages: [
        { duration: '3m', target: 100 },
        { duration: '2m', target: 240 },
        { duration: '7m', target: 240 },
        { duration: '3m', target: 0 },
      ],
    },

    // 30% users: Just browsing the map
    map_browsers: {
      executor: 'ramping-vus',
      exec: 'mapPanAndZoom',
      startVUs: 0,
      stages: [
        { duration: '3m', target: 80 },
        { duration: '2m', target: 180 },
        { duration: '7m', target: 180 },
        { duration: '3m', target: 0 },
      ],
    },

    // 20% users: Heavy map users
    power_users: {
      executor: 'ramping-vus',
      exec: 'heavyMapExploration',
      startVUs: 0,
      stages: [
        { duration: '4m', target: 60 },
        { duration: '2m', target: 120 },
        { duration: '6m', target: 120 },
        { duration: '3m', target: 0 },
      ],
    },

    // 10% users: Searchers
    searchers: {
      executor: 'ramping-vus',
      exec: 'multipleSearches',
      startVUs: 0,
      stages: [
        { duration: '4m', target: 30 },
        { duration: '2m', target: 60 },
        { duration: '6m', target: 60 },
        { duration: '3m', target: 0 },
      ],
    },
  },
  thresholds: THRESHOLDS.load,
};

export { completeUserJourney, mapPanAndZoom, heavyMapExploration, multipleSearches };
