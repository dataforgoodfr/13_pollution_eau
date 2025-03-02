# Use Debian slim as base image for both Node.js and Python
FROM debian:bookworm-slim

# Install UV
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy
ENV UV_PYTHON_INSTALL_DIR /python
ENV UV_PYTHON_PREFERENCE=only-managed
ENV UV_NO_CACHE=1
RUN uv python install 3.12

# Install Node.js, and other required dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    nodejs \
    npm \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN addgroup --system --gid 1000 appgroup && \
    adduser --system --uid 1000 appuser

WORKDIR /app

# Set up Node.js environment
COPY --chown=appuser:appgroup webapp/package.json webapp/package-lock.json ./webapp/
WORKDIR /app/webapp
RUN npm ci --legacy-peer-deps
# The legacy-peer-deps flag is used to avoid an error with Next.js 15 and shadcn
# Reference: https://ui.shadcn.com/docs/react-19#upgrade-status
# TODO: Remove the flag when the issue is resolved

# # Copy Next.js files and build
# COPY webapp ./
# ENV NEXT_TELEMETRY_DISABLED=1
# RUN npm run build

# Set up Python environment with UV
WORKDIR /app
COPY --chown=appuser:appgroup README.md pyproject.toml uv.lock ./
RUN uv sync

# Copy application files
COPY --chown=appuser:appgroup pipelines /app/pipelines
COPY --chown=appuser:appgroup webapp /app/webapp

# Workaround for now, create a dummy database file so that Next.js build can run
# duckdb database/data.duckdb ".schema" > schema.sql
# duckdb data_empty.duckdb < schema.sql
COPY --chown=appuser:appgroup data_empty.duckdb /app/data_empty.duckdb
 
# create folder for the database
RUN mkdir -p /app/database
RUN chown appuser:appgroup /app/database


# Create startup script
RUN echo '#!/bin/bash\n\
set -e\n\
echo "PWD: $PWD"\n\
echo "Downloading database..."\n\
cd /app && uv run pipelines/run.py run download_database\n\
echo "Database downloaded, starting NextJS app..."\n\
exec node webapp/.next/standalone/server.js\n' > /app/start.sh
RUN chmod +x /app/start.sh
RUN chown appuser:appgroup /app/start.sh

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Build next.js app
WORKDIR /app/webapp
RUN npm run build

# Copy static assets to the correct location for standalone mode
RUN cp -R .next/static .next/standalone/.next/
RUN mkdir -p .next/standalone/public
RUN cp -R public/* .next/standalone/public/ || true

# Switch to non-root user
RUN chown -R appuser:appgroup /app
USER appuser

# Start the application
EXPOSE 3000
CMD ["/app/start.sh"]
