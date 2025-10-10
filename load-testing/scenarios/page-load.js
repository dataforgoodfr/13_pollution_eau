import http from 'k6/http';
import { BASE_URL } from '../utils/config.js';
import { checkResponse, thinkTime } from '../utils/helpers.js';

/**
 * Scenario 1: Initial Page Load - Cold Cache
 * Simulates a new user visiting the site for the first time
 */
export function pageLoadColdCache() {
  // Load main embed page
  const res = http.get(`${BASE_URL}/embed`, {
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
  });

  checkResponse(res, 200, 'page load successful');

  thinkTime(2, 4);
}

/**
 * Scenario 2: Page Load - Warm Cache
 * Simulates a returning user with cached static assets
 */
export function pageLoadWarmCache() {
  const res = http.get(`${BASE_URL}/embed`, {
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Cache-Control': 'max-age=0',
      'If-None-Match': '"cached-etag"',
    },
  });

  checkResponse(res, [200, 304], 'page load or cache hit');

  thinkTime(1, 2);
}
