FROM node:20
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./ 2>/dev/null || true
COPY package.json ./
RUN npm i --quiet
COPY next.config.mjs ./
COPY app ./app
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "run", "start"]
