# Estagio 1 - Ser� responsavel em construir nossa aplica��o
FROM node:10.9.0-slim as builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build -- --prod
# Estagio 2 - Ser� responsavel por expor a aplica��o
FROM nginx:1.13
COPY --from=builder /app/dist/ /usr/share/nginx/html
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf