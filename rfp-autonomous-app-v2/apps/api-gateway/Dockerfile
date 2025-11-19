FROM node:20

WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./ 2>/dev/null || true
COPY package.json ./
RUN npm i --quiet

COPY tsconfig.json ./
COPY src ./src

CMD ["npx", "ts-node", "src/index.ts"]
