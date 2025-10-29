# ...existing code...
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "start"]
# ...existing code...# TEMP: this file was created by an assistant and is safe to remove.
# It is an artifact; the project uses Dockerfiles in `BackEnd/` and `FrontEnd/`.
# You can delete this file when ready.
# ...existing code...