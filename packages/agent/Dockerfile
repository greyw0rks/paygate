FROM node:20-alpine
WORKDIR /app

# Install root workspace deps
COPY package.json package-lock.json ./
COPY packages/agent/package.json ./packages/agent/

RUN npm ci --workspace=packages/agent --ignore-scripts

COPY packages/agent ./packages/agent

RUN npm run build --workspace=packages/agent

EXPOSE 3001
CMD ["node", "packages/agent/dist/index.js"]
