import { THRESHOLDS } from '../utils/config.js';
import { completeUserJourney } from '../scenarios/user-journey.js';

/**
 * Load Test
 * Purpose: Test system performance under expected TV broadcast load
 * Duration: 15 minutes with ramp-up/down
 * Users: Gradually increases to 500 concurrent users
 */
export const options = {
  stages: [
    { duration: '3m', target: 100 }, // Ramp up to 100 users
    { duration: '3m', target: 300 }, // Ramp up to 300 users
    { duration: '2m', target: 500 }, // Ramp up to 500 users
    { duration: '5m', target: 500 }, // Stay at 500 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: THRESHOLDS.load,
};

export default function () {
  completeUserJourney();
}
