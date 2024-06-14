FROM node:20-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm install

ENV PORT=8000

EXPOSE ${PORT}

CMD [ "node", "index.js" ]