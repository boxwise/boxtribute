# Node version should match that of your production environment.
FROM node:20.9.0 AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY shared-components shared-components

# Copy the service package.json
ARG SERVICE_DIR
COPY ./${SERVICE_DIR}/package.json ${SERVICE_DIR}/

# This docker image is only used for dev, so we don't try to optimise
# with multi-stage builds by only including production dependencies right now
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Change to the specific service directory.
WORKDIR /app/${SERVICE_DIR}

# Set environment variable to avoid creating source maps for production builds.
ENV GENERATE_SOURCEMAP=false

# Start command for each service.
CMD ["pnpm", "dev"]
