import { THRESHOLDS } from '../utils/config.js';
import { completeUserJourney } from '../scenarios/user-journey.js';

/**
 * Stress Test
 * Purpose: Find the breaking point of the system for TV broadcast traffic
 * Duration: 20 minutes with aggressive ramp-up
 * Users: Gradually increases to 1000 concurrent users
 */
export const options = {
  stages: [
    { duration: '3m', target: 200 },  // Ramp up to 200 users
    { duration: '3m', target: 500 },  // Ramp up to 500 users
    { duration: '3m', target: 750 },  // Ramp up to 750 users
    { duration: '3m', target: 1000 }, // Ramp up to 1000 users
    { duration: '5m', target: 1000 }, // Stay at 1000 users
    { duration: '3m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: THRESHOLDS.stress,
};

export default function () {
  completeUserJourney();
}
