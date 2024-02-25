FROM node:lts-alpine as development
WORKDIR /usr/src/app

COPY package.json ./

RUN yarn install

COPY . .
RUN yarn run build
ADD . /usr/src/app
EXPOSE 80
EXPOSE 443

HEALTHCHECK CMD curl -k --fail http://localhost:3000/api || exit 1
