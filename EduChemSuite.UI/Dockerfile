FROM node:20-alpine AS build
WORKDIR /app

# Copy package files and local molecule-builder library
COPY EduChemSuite.UI/UI/package.json EduChemSuite.UI/UI/package-lock.json ./
COPY EduChemSuite.UI/UI/libs/ ./libs/

# Rewrite molecule-builder path for Docker context (it's in libs/ not ../../../)
RUN sed -i 's|file:../../../MoleculeBuilder/dist/molecule-builder|file:./libs/molecule-builder|' package.json

RUN npm ci

# Copy the rest of the UI source
COPY EduChemSuite.UI/UI/ .

# Build production (environment.ts has empty apiUrl, nginx proxies /api to backend)
RUN npx ng build --configuration production

FROM nginx:alpine
RUN apk update && apk upgrade --no-cache
COPY --from=build /app/dist/ui/browser /usr/share/nginx/html
COPY EduChemSuite.UI/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
