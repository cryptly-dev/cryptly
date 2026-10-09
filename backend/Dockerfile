# Build context is the repo root: backend is a member of the root pnpm workspace.
FROM node:22-alpine AS build
ARG POSTHOG_CLI_API_KEY
ARG POSTHOG_CLI_HOST
ARG POSTHOG_CLI_PROJECT_ID
ARG GITHUB_ACTIONS
ARG GITHUB_SHA
ARG GITHUB_REF_NAME
ARG GITHUB_REPOSITORY
ARG GITHUB_SERVER_URL
ENV POSTHOG_CLI_API_KEY=$POSTHOG_CLI_API_KEY
ENV POSTHOG_CLI_HOST=$POSTHOG_CLI_HOST
ENV POSTHOG_CLI_PROJECT_ID=$POSTHOG_CLI_PROJECT_ID
ENV GITHUB_ACTIONS=$GITHUB_ACTIONS
ENV GITHUB_SHA=$GITHUB_SHA
ENV GITHUB_REF_NAME=$GITHUB_REF_NAME
ENV GITHUB_REPOSITORY=$GITHUB_REPOSITORY
ENV GITHUB_SERVER_URL=$GITHUB_SERVER_URL

# Block optional packages like redis-memory-server
ENV npm_config_optional=false

RUN corepack enable

WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
RUN pnpm install --frozen-lockfile --ignore-scripts --filter backend
COPY backend ./backend
RUN pnpm --filter backend run build:release
RUN pnpm --filter backend deploy --legacy --prod --ignore-scripts /prod/backend

FROM node:22-alpine AS production
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=build /prod/backend/node_modules ./node_modules
COPY --from=build /usr/src/app/backend/dist ./dist
CMD ["node", "dist/main.js"]
