FROM node:12.16.2-alpine

# set work directory
WORKDIR /usr/src/frontend

COPY ./package.json .

RUN npm install
# copy project
COPY . .
