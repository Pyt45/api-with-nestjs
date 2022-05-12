FROM alpine

WORKDIR app

RUN apk add nodejs npm

COPY . .

RUN npm i

EXPOSE 3000

CMD ["npm", "run", "start:dev"]