# Load Testing Suite for data.dansmoneau.fr

A comprehensive load testing suite for the Dans Mon Eau application using [Grafana k6](https://k6.io/), designed to handle **TV broadcast traffic spikes**.

## Overview

This suite tests the performance and scalability of the water quality data visualization platform under various load conditions, with a focus on handling high-traffic scenarios like live TV mentions. Tests cover page loads, map interactions, location searches, and complete user journeys at TV broadcast scale.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- (Optional) [Make](https://www.gnu.org/software/make/) for convenient command shortcuts

## Quick Start

### Using Make (Recommended)

```bash
# Show all available commands
make help

# Run smoke test (100 users baseline)
make smoke

# Run load test (500 users TV traffic)
make load

# Run stress test (1000 users peak)
make stress

# Run spike test (2000 users TV mention)
make spike

# Run main mixed test (600 users)
make main

# Start monitoring stack (InfluxDB + Grafana)
make up

# Run test with results stored in InfluxDB
make results
```

### Using Docker Compose

```bash
# Run smoke test
docker compose run --rm k6 run tests/smoke.js

# Run load test
docker compose run --rm k6 run tests/load.js

# Run with custom parameters
docker compose run --rm k6 run tests/smoke.js --vus 50 --duration 5m

# Start monitoring stack
docker compose up -d influxdb grafana

# Access Grafana at http://localhost:3000
```

## Project Structure

```
load-testing/
├── tests/                    # Test files
│   ├── main.js              # Main test with mixed scenarios (600 users)
│   ├── smoke.js             # Smoke test (100 users)
│   ├── load.js              # Load test (500 users)
│   ├── stress.js            # Stress test (1000 users)
│   └── spike.js             # Spike test (2000 users peak)
├── scenarios/               # Reusable test scenarios
│   ├── page-load.js         # Page loading scenarios
│   ├── map-interaction.js   # Map pan/zoom scenarios
│   ├── search.js            # Location search scenarios
│   └── user-journey.js      # Complete user flows
├── utils/                   # Shared utilities
│   ├── config.js            # Configuration and thresholds
│   └── helpers.js           # Helper functions
├── docker-compose.yml       # Docker services configuration
├── Dockerfile               # Custom k6 image (optional)
├── Makefile                 # Convenient command shortcuts
├── data.dansmoneau.fr.2.har # Original HAR file
└── package.json             # npm scripts (alternative)
```

## Available Tests

All tests are calibrated for **TV broadcast traffic levels**.

### 1. Smoke Test

- **Purpose:** Verify the system works under baseline TV traffic load
- **Duration:** 3 minutes
- **Users:** 100 concurrent users
- **Use case:** Quick validation before broadcast

```bash
make smoke
# or
docker compose run --rm k6 run tests/smoke.js
```

### 2. Load Test

- **Purpose:** Test system under expected TV broadcast load
- **Duration:** 15 minutes
- **Users:** Ramps up to 500 concurrent users
- **Use case:** Validate performance during typical TV mention

```bash
make load
# or
docker compose run --rm k6 run tests/load.js
```

### 3. Stress Test

- **Purpose:** Find the breaking point for TV broadcast traffic
- **Duration:** 20 minutes
- **Users:** Ramps up to 1000 concurrent users
- **Use case:** Determine maximum capacity during extended TV coverage

```bash
make stress
# or
docker compose run --rm k6 run tests/stress.js
```

### 4. Spike Test

- **Purpose:** Test system under sudden TV broadcast spikes
- **Duration:** 10 minutes
- **Users:** Sudden spike from 100 to **2000 users** (live TV mention)
- **Use case:** Validate resilience during prime-time TV mention

```bash
make spike
# or
docker compose run --rm k6 run tests/spike.js
```

### 5. Main Test (Mixed Scenarios)

- **Purpose:** Mixed scenarios simulating realistic TV broadcast traffic
- **Duration:** 15 minutes
- **Users:** Up to 600 concurrent users with different behaviors:
  - 40% complete user journeys (240 users)
  - 30% map browsers (180 users)
  - 20% power users (120 users)
  - 10% searchers (60 users)
- **Use case:** Comprehensive TV traffic simulation

```bash
make main
# or
docker compose run --rm k6 run tests/main.js
```

## Test Scenarios

### Page Load
- **Cold Cache:** First-time visitor loading the page
- **Warm Cache:** Returning visitor with cached assets

### Map Interaction
- **Pan & Zoom:** Normal map navigation (5 tiles per action)
- **Heavy Exploration:** Intensive map usage (20 tiles per action)

### Location Search
- **Single Search:** Autocomplete search for a French city
- **Multiple Searches:** User searching for multiple locations

### Complete User Journey
1. Load the page
2. Search for a location
3. Explore the map (multiple interactions)

## Performance Thresholds

Calibrated for high-traffic TV broadcast scenarios:

### Smoke Test (100 users)
- 95th percentile response time < 3000ms
- 99th percentile response time < 5000ms
- Error rate < 2%

### Load Test (500 users)
- 95th percentile response time < 4000ms
- 99th percentile response time < 6000ms
- Error rate < 5%

### Stress Test (1000 users)
- 95th percentile response time < 5000ms
- 99th percentile response time < 8000ms
- Error rate < 10%

### Spike Test (2000 users)
- 95th percentile response time < 6000ms
- 99th percentile response time < 10000ms
- Error rate < 15%

## Monitoring with Grafana

The suite includes optional InfluxDB and Grafana services for real-time monitoring.

### Start Monitoring Stack

```bash
make up
# or
docker compose up -d influxdb grafana
```

### Access Grafana

1. Open http://localhost:3000 in your browser
2. Login with default credentials (anonymous auth enabled)
3. Add InfluxDB as a data source:
   - URL: `http://influxdb:8086`
   - Organization: `k6`
   - Token: `k6-token`
   - Bucket: `k6`

### Run Tests with InfluxDB Output

```bash
make results
# or
docker compose run --rm -e K6_OUT=influxdb=http://influxdb:8086 k6 run tests/load.js
```

## Advanced Usage

### Custom Test Parameters

```bash
# Run with custom VU count and duration
docker compose run --rm k6 run tests/smoke.js --vus 200 --duration 5m

# Run with different target URL
docker compose run --rm k6 run tests/load.js -e BASE_URL=https://staging.dansmoneau.fr
```

### Output Formats

```bash
# JSON output
docker compose run --rm k6 run tests/load.js --out json=results.json

# CSV output
docker compose run --rm k6 run tests/load.js --out csv=results.csv

# Multiple outputs
docker compose run --rm k6 run tests/load.js --out json=results.json --out influxdb=http://influxdb:8086
```

### Interactive Shell

```bash
make shell
# or
docker compose run --rm k6 sh
```

## Interpreting Results

k6 outputs comprehensive metrics:

- **http_req_duration:** Request latency (p95, p99, median)
- **http_req_failed:** Percentage of failed requests
- **http_reqs:** Total HTTP requests per second
- **vus:** Number of active virtual users
- **iterations:** Number of scenario completions

Example output:
```
     ✓ page load successful
     ✓ tile partial content loaded

     checks.........................: 100.00% ✓ 12340     ✗ 0
     data_received..................: 450 MB  7.5 MB/s
     data_sent......................: 1.2 MB  20 kB/s
     http_req_duration..............: avg=1234ms min=120ms med=980ms max=5890ms p(95)=3450ms p(99)=4650ms
     http_reqs......................: 12340   205.6/s
     iteration_duration.............: avg=5.2s  min=4.1s  med=5.1s  max=8.8s  p(95)=6.2s  p(99)=7.5s
     iterations.....................: 2340    39/s
     vus............................: 500     min=0       max=500
     vus_max........................: 500     min=500     max=500
```

## Tips for TV Broadcast Scenarios

1. **Pre-broadcast testing:** Run `make smoke` and `make load` before going live
2. **Monitor resources:** Watch server CPU, memory, network, and database during tests
3. **Establish baselines:** Run tests regularly to understand normal behavior
4. **Test progressively:** Start with smoke, then load, then stress, then spike
5. **External dependencies:** The geocoding API (`data.geopf.fr`) may have rate limits
6. **Scaling strategy:** Use test results to configure auto-scaling rules
7. **CDN caching:** Ensure static assets are properly cached
8. **Database connections:** Monitor connection pool usage under high load

## Troubleshooting

### Docker Issues

```bash
# Restart services
docker compose restart

# Clean up and rebuild
docker compose down -v
docker compose pull
```

### High Error Rates

- Check server logs for errors
- Verify the application is running
- Check if external APIs (geocoding) are responding
- Monitor network connectivity
- Check rate limiting on external services

### Performance Issues

- Monitor server resources (CPU, memory, disk I/O)
- Review database query performance
- Check CDN cache hit rates
- Analyze slow queries in application logs
- Monitor network latency

### Out of Memory

For high-concurrency tests (2000+ users), you may need to increase Docker's memory limits:

```bash
# Increase Docker memory in Docker Desktop settings
# Or use --scale flag to distribute load
```

## Cleanup

```bash
# Stop all services
make down

# Stop services and remove volumes
make clean

# Or with docker compose
docker compose down -v
```

## References

- [k6 Documentation](https://k6.io/docs/)
- [k6 with Docker](https://k6.io/docs/getting-started/running-k6/#docker)
- [Test Types Guide](https://k6.io/docs/test-types/introduction/)
- [k6 Metrics](https://k6.io/docs/using-k6/metrics/)
- [Thresholds](https://k6.io/docs/using-k6/thresholds/)
- [k6 + InfluxDB + Grafana](https://k6.io/docs/results-output/real-time/influxdb/)
