import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export const errorRate = new Rate('errors');

/**
 * Check HTTP response and track errors
 */
export function checkResponse(res, expectedStatus = 200, checkName = 'status is 200') {
  const result = check(res, {
    [checkName]: (r) => r.status === expectedStatus,
  });

  errorRate.add(!result);

  return result;
}

/**
 * Simulate realistic think time between actions
 */
export function thinkTime(min = 1, max = 3) {
  sleep(Math.random() * (max - min) + min);
}

/**
 * Get random element from array
 */
export function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate PMTiles range header for tile requests
 * Simulates map tile loading with Range requests
 */
export function generateTileRanges(count = 10) {
  const ranges = [];
  let offset = 0;

  for (let i = 0; i < count; i++) {
    const size = 16384; // 16KB chunks typical for pmtiles
    ranges.push({
      start: offset,
      end: offset + size - 1,
    });
    offset += size;
  }

  return ranges;
}
