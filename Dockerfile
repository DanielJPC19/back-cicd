# ===============================
# ETAPA 1 - Build
# ===============================
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código
COPY . .

# Compilar proyecto
RUN npm run build


# ===============================
# ETAPA 2 - Producción
# ===============================
FROM node:22-alpine

WORKDIR /app

# Variables entorno
ENV NODE_ENV=production
ENV PORT=3500

# Copiar package files
COPY package*.json ./

# Instalar solo producción
RUN npm ci --omit=dev

# Copiar compilado
COPY --from=builder /app/dist ./dist

# Puerto NestJS
EXPOSE 3500

# Ejecutar app
CMD ["node", "dist/main"]