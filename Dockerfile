# syntax=docker/dockerfile:1

# -----------------------------------------------------------------------------
# Stage 1: Build
# -----------------------------------------------------------------------------
FROM node:24.4.1-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci --legacy-peer-deps

# Copiar código fuente
COPY . .

# Construir con environment.dev.ts (configuración test)
RUN npm run build:test

# -----------------------------------------------------------------------------
# Stage 2: Production (Nginx)
# -----------------------------------------------------------------------------
FROM nginx:alpine AS production

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos estáticos desde builder
COPY --from=builder /app/dist/app_oficinavirtualaportantes/browser/browser /usr/share/nginx/html

# Exponer puerto
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
