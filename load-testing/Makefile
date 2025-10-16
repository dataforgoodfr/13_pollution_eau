.PHONY: help smoke load stress spike main up down clean results

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

smoke: ## Run smoke test (100 users, 3 min)
	docker compose run --rm k6 run tests/smoke.js

load: ## Run load test (500 users, 15 min)
	docker compose run --rm k6 run tests/load.js

stress: ## Run stress test (1000 users, 20 min)
	docker compose run --rm k6 run tests/stress.js

spike: ## Run spike test (2000 users peak, 10 min)
	docker compose run --rm k6 run tests/spike.js

main: ## Run main mixed test (600 users, 15 min)
	docker compose run --rm k6 run tests/main.js

up: ## Start InfluxDB and Grafana services
	docker compose up -d influxdb grafana

down: ## Stop all services
	docker compose down

clean: ## Stop services and remove volumes
	docker compose down -v

results: ## Run load test with InfluxDB output
	docker compose run --rm -e K6_OUT=influxdb=http://influxdb:8086 k6 run tests/load.js

shell: ## Open shell in k6 container
	docker compose run --rm k6 sh
