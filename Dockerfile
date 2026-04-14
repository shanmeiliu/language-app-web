FROM node:24-alpine AS builder

WORKDIR /app

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

# install envsubst
RUN apk add --no-cache gettext

# copy template instead of final config
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

COPY --from=builder /app/dist /usr/share/nginx/html

# expose dynamic port
EXPOSE 80

CMD ["sh", "-c", "envsubst '$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]