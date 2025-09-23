FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci && npm cache clean --force

COPY . .

# Set environment variables for Docker
ENV DB_HOST=host.docker.internal

EXPOSE 5000

CMD ["npm", "run", "dev"]
