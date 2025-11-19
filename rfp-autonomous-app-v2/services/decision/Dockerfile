FROM node:20
WORKDIR /app
COPY package.json ./
RUN npm i --quiet
COPY src ./src
CMD ["node", "src/index.js"]
