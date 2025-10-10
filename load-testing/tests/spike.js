import { THRESHOLDS } from '../utils/config.js';
import { completeUserJourney } from '../scenarios/user-journey.js';

/**
 * Spike Test
 * Purpose: Test system behavior under sudden TV broadcast spikes
 * Duration: 10 minutes with sudden increase/decrease
 * Users: Sudden spike from 100 to 2000 users (live TV mention)
 */
export const options = {
  stages: [
    { duration: '1m', target: 100 },   // Baseline load
    { duration: '30s', target: 2000 }, // Sudden TV spike!
    { duration: '4m', target: 2000 },  // Sustained spike
    { duration: '30s', target: 500 },  // Drop after TV mention
    { duration: '3m', target: 500 },   // Stabilized traffic
    { duration: '1m', target: 0 },     // Ramp down
  ],
  thresholds: THRESHOLDS.spike,
};

export default function () {
  completeUserJourney();
}
