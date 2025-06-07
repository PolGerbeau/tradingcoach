# 1. Imagen base
FROM node:20-alpine AS builder

# 2. Crea directorio de trabajo
WORKDIR /app

# 3. Copia los ficheros
COPY package*.json ./
COPY . .

# 4. Instala dependencias y construye la app
RUN npm install
RUN npm run build

# 5. Fase final con imagen ligera
FROM node:20-alpine AS runner

WORKDIR /app

# Copia solo el build necesario
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 6. Expone el puerto por defecto de Next.js
EXPOSE 3000

# 7. Comando por defecto
CMD ["npm", "start"]