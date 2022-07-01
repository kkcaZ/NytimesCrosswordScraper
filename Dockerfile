FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY ./src/package*.json ./
RUN npm install

## Bundle app resources
COPY ./src .

ENV MONGO_URL="mongodb://mongo:27017/"

# Please enter your cookie here.
# E.g. ENV COOKIE="NYT-S=1oa.1Anz9X85cR14fDAgT7hYzLdVdkw/2Pwui0ZI53fTnifqDjK4G2NtT2KXQt9Gb.jOoea6bgYnQ18748eEJw6wqwB9nfLnvCOLnRUMUpZZcwOatwg00^^^^CBISJQjJwvWVBhDBw_WVBhoSMS1-BS-djFcP1zSAUYdWeGnXIPnU7VcaQHS4OepnPUI_j04S7rKETWDvASuvJ5J0RIpEOb1lr4JenkmoPf7E9DbrDWgTwfNboREK65ZihIl_suX-NshYqwE="
ENV COOKIE=""

EXPOSE 3000
CMD [ "node", "index.js" ]