import { pageLoadColdCache } from './page-load.js';
import { mapPanAndZoom } from './map-interaction.js';
import { locationSearch } from './search.js';
import { thinkTime } from '../utils/helpers.js';

/**
 * Complete User Journey
 * Simulates a realistic user session: load page -> search -> explore map
 */
export function completeUserJourney() {
  // 1. User loads the page
  pageLoadColdCache();

  thinkTime(2, 4);

  // 2. User searches for a location
  // locationSearch();

  thinkTime(1, 3);

  // 3. User explores the map
  mapPanAndZoom();

  thinkTime(2, 4);

  // 4. User continues exploring
  mapPanAndZoom();

  thinkTime(1, 2);
}
