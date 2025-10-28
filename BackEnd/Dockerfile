# Imagem base do Node.js
FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar todas as dependências (incluindo devDependencies para nodemon)
RUN npm ci

# Copiar o código da aplicação
COPY . .

# Expor a porta que o servidor usa
EXPOSE 3001

# Comando para iniciar o servidor com nodemon (hot-reload)
CMD ["npm", "run", "dev"]
