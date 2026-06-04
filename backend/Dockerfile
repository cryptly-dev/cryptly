FROM node:22-alpine AS development

# Block optional packages like redis-memory-server
ENV npm_config_optional=false

RUN corepack enable

WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .

FROM node:22-alpine AS build
ARG POSTHOG_CLI_API_KEY
ARG POSTHOG_CLI_HOST
ARG POSTHOG_CLI_PROJECT_ID
ENV POSTHOG_CLI_API_KEY=$POSTHOG_CLI_API_KEY
ENV POSTHOG_CLI_HOST=$POSTHOG_CLI_HOST
ENV POSTHOG_CLI_PROJECT_ID=$POSTHOG_CLI_PROJECT_ID
RUN corepack enable
WORKDIR /usr/src/app
COPY --from=development /usr/src/app ./
RUN pnpm run build
RUN pnpm prune --prod

FROM node:22-alpine AS production
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
CMD ["node", "dist/main.js"]
