FROM oven/bun:1.0 as dependencies

# Install build-essential for packages that need to compile C code
RUN apt-get update && apt-get install -y build-essential

WORKDIR /app

COPY package.json bun.lockb* turbo.json ./
COPY packages ./packages
COPY apps ./apps
COPY contracts ./contracts
RUN bun install

FROM oven/bun:1.0-slim

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package.json ./
COPY --from=dependencies /app/bun.lockb ./
COPY --from=dependencies /app/turbo.json ./
COPY --from=dependencies /app/packages ./packages
COPY --from=dependencies /app/apps/marketplace-adapter-rest-api ./apps/marketplace-adapter-rest-api

RUN mkdir -p ~/.config/solana
RUN cp /app/apps/marketplace-adapter-rest-api/keypairs/canibeton-cannes.json ~/.config/solana/canibeton-cannes.json
RUN cp /app/apps/marketplace-adapter-rest-api/keypairs/canibeton.json ~/.config/solana/canibeton.json

WORKDIR /app

EXPOSE 3000

CMD ["bun", "apps/marketplace-adapter-rest-api/index.ts"] 