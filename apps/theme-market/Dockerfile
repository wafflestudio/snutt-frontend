# Builder
FROM node:20-alpine AS builder
ARG APP_ENV
# ENV NODE_ENV production
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .

RUN yarn
RUN yarn build

# Runner
FROM node:20-alpine AS runner

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

ENV NODE_ENV production
WORKDIR /app

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

RUN chown -R nextjs:nodejs /app/.next
RUN echo "YARN VERSION IN RUNNER: " && yarn --version

USER nextjs

EXPOSE 3000

ENV NEXT_TELEMETRY_DISABLED 1

CMD ["yarn", "start"]
