# Usar Node.js como base
FROM node:20-alpine

# Diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar o resto do código
COPY . .

# Expor porta do Vite
EXPOSE 5173

# Comando para rodar em modo dev
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
