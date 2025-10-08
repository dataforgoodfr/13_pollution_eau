import http from 'k6/http';
import { BASE_URL } from '../utils/config.js';
import { checkResponse, thinkTime, generateTileRanges } from '../utils/helpers.js';

/**
 * Scenario: Map Pan & Zoom
 * Simulates user interacting with the map by requesting tiles
 */
export function mapPanAndZoom() {
  const tileFiles = ['udi_data.pmtiles', 'commune_data.pmtiles'];

  // Simulate loading multiple tiles as user pans/zooms
  const tileRanges = generateTileRanges(5); // Request 5 tiles

  tileFiles.forEach((tileFile) => {
    tileRanges.forEach((range) => {
      const res = http.get(`${BASE_URL}/pmtiles/${tileFile}`, {
        headers: {
          'Range': `bytes=${range.start}-${range.end}`,
          'Accept': '*/*',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      });

      checkResponse(res, 206, 'tile partial content loaded');
    });

    thinkTime(0.5, 1);
  });

  thinkTime(2, 4);
}

/**
 * Scenario: Heavy Map Exploration
 * Simulates intensive map usage with many tile requests
 */
export function heavyMapExploration() {
  const tileFiles = ['udi_data.pmtiles', 'commune_data.pmtiles'];
  const tileRanges = generateTileRanges(20); // Heavy usage: 20 tiles

  tileFiles.forEach((tileFile) => {
    // Batch request multiple tiles
    const requests = tileRanges.map((range) => ({
      method: 'GET',
      url: `${BASE_URL}/pmtiles/${tileFile}`,
      params: {
        headers: {
          'Range': `bytes=${range.start}-${range.end}`,
          'Accept': '*/*',
        },
      },
    }));

    const responses = http.batch(requests);

    responses.forEach((res) => {
      checkResponse(res, 206, 'tile batch loaded');
    });

    thinkTime(1, 2);
  });
}
