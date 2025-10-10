import http from 'k6/http';
import { GEOCODING_URL, FRENCH_CITIES } from '../utils/config.js';
import { checkResponse, thinkTime, randomItem } from '../utils/helpers.js';

/**
 * Scenario: Location Search
 * Simulates user searching for a location using autocomplete
 */
export function locationSearch() {
  const city = randomItem(FRENCH_CITIES);

  // Simulate typing - progressive search queries
  const queries = [];
  for (let i = 3; i <= city.length; i++) {
    queries.push(city.substring(0, i));
  }

  queries.forEach((query, index) => {
    const res = http.get(
      `${GEOCODING_URL}/geocodage/search?autocomplete=1&limit=20&q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      }
    );

    checkResponse(res, 200, 'search query successful');

    // Shorter delay between keystrokes, longer at the end
    if (index < queries.length - 1) {
      thinkTime(0.2, 0.5);
    } else {
      thinkTime(1, 2);
    }
  });
}

/**
 * Scenario: Multiple searches
 * Simulates user searching for multiple locations
 */
export function multipleSearches() {
  const searchCount = 3;

  for (let i = 0; i < searchCount; i++) {
    // locationSearch();
    thinkTime(2, 4);
  }
}
