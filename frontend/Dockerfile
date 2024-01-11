# Use the official Node.js image as the base image
FROM node:18 as build

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the app files to the container
COPY . .

# Build the app
RUN npm run build

RUN ls dist

FROM nginx:1.19.6-alpine as prod
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /dist/ /usr/share/nginx/html
EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]