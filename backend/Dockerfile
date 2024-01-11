# Use the official Node.js image as the base image
FROM node:18 as build

# Copy the package.json and package-lock.json files to the container
COPY . .
# Install the dependencies
RUN npm install

EXPOSE 3000

CMD [ "npm", "start"]