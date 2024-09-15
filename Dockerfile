FROM node:latest

RUN mkdir -p /home/app

COPY . /home/app/

WORKDIR /home/app/