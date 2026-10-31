FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV STORAGE_MODE=memory
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
EXPOSE 5000
CMD ["npm", "start"]