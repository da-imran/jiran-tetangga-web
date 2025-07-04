###############################
# BUILD FOR LOCAL DEVELOPMENT #
###############################

# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=18.19.1

FROM node:${NODE_VERSION}-alpine

# Use development node environment by default.
ENV NODE_ENV development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

# Copy the rest of the source files into the image.
COPY . .

# Run the application as a non-root user.
USER root

# Expose the port that the application listens on.
EXPOSE 9002

# Run the application.
CMD ["npm", "run", "dev"]
