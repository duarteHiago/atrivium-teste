# Usar Node.js como base
FROM node:20-alpine

# Diretório de trabalho no container
WORKDIR /app

# Copiar manifests primeiro (para cache de dependências)
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar o restante do código
COPY . .

# Expor a porta do Vite
EXPOSE 5173

# Rodar em modo dev (Vite com host aberto)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]