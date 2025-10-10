import { THRESHOLDS } from '../utils/config.js';
import { pageLoadColdCache } from '../scenarios/page-load.js';

/**
 * Smoke Test
 * Purpose: Verify the system works under baseline TV traffic load
 * Duration: 3 minutes
 * Users: 100 concurrent users
 */
export const options = {
  vus: 2000,
  duration: '3m',
  thresholds: THRESHOLDS.smoke,
};

export default function () {
  pageLoadColdCache();
}
