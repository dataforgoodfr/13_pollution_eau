# Builder stage for compiling the application
# Note: debian bookworm is supported until 2028-06-30
FROM debian:bookworm-slim AS builder

# Define build argument for API key
ARG NEXT_PUBLIC_PROTOMAPS_API_KEY

# Install UV
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy
ENV UV_PYTHON_INSTALL_DIR /python
ENV UV_PYTHON_PREFERENCE=only-managed
ENV UV_NO_CACHE=1
RUN uv python install 3.12

# Install Node.js and other required dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    nodejs \
    npm \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set up Node.js environment
WORKDIR /app/webapp
COPY webapp/package.json webapp/package-lock.json /app/webapp/
RUN npm ci

# Set up Python environment with UV and download the database
WORKDIR /app
COPY README.md pyproject.toml uv.lock /app/
COPY pipelines /app/pipelines
RUN uv sync
RUN uv run pipelines/run.py run download_database
RUN uv run pipelines/run.py run trim_database_for_website --output-file=database/data_for_website.duckdb

# Copy next.js app and build it
WORKDIR /app/webapp
COPY webapp /app/webapp
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_PUBLIC_PROTOMAPS_API_KEY=$NEXT_PUBLIC_PROTOMAPS_API_KEY
ENV DUCKDB_PATH="/app/database/data_for_website.duckdb"
RUN npm run build



# Runner stage - only contains the necessary runtime files
FROM debian:bookworm-slim AS runner

# Install Node.js (minimal dependencies for runtime)
RUN apt-get update && apt-get install -y --no-install-recommends \
    nodejs \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN addgroup --system --gid 1000 appgroup && \
    adduser --system --uid 1000 appuser

WORKDIR /app

# Create database directory
RUN mkdir -p /app/database
RUN chown appuser:appgroup /app/database

# Copy only the standalone build and database from the builder
COPY --from=builder --chown=appuser:appgroup /app/webapp/.next/standalone /app
COPY --from=builder --chown=appuser:appgroup /app/webapp/.next/static /app/.next/static
COPY --from=builder --chown=appuser:appgroup /app/webapp/public /app/public
COPY --from=builder --chown=appuser:appgroup /app/database/data_for_website.duckdb /app/database/data_for_website.duckdb

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"
ENV NEXT_PUBLIC_PROTOMAPS_API_KEY=$NEXT_PUBLIC_PROTOMAPS_API_KEY
ENV DUCKDB_PATH="/app/database/data_for_website.duckdb"

# Switch to non-root user
RUN chown -R appuser:appgroup /app
USER appuser

# Expose the new port
EXPOSE 8080

# Start the application
CMD ["node", "server.js"]
