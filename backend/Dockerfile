FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ../docker/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["npm", "start"]
