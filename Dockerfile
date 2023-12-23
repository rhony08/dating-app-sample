FROM node:18-alpine3.18

ENV NODE_OPTIONS="--max-old-space-size=2048"

# Set timezone to Asia/Jakarta
RUN apk add --no-cache tzdata
ENV TZ=Asia/Jakarta

WORKDIR /app/

COPY . ./

RUN npm install
RUN npm run build

EXPOSE 3000

CMD [ "node", "dist/main.js" ]