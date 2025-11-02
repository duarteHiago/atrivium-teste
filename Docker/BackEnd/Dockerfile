# Imagem base do Node.js (Debian slim para compatibilidade com sharp)
FROM node:20-bullseye-slim

# Diretório de trabalho dentro do container
WORKDIR /app

# Copiar manifests primeiro para aproveitar cache de camadas
COPY package*.json ./

# Instalar dependências (inclui opcionais necessárias para sharp)
RUN npm ci --include=optional

# Copiar o restante do código da aplicação
COPY . .

# Expor a porta usada pelo backend
EXPOSE 3001

# Comando padrão (modo dev, com hot-reload via nodemon)
CMD ["npm", "run", "dev"]