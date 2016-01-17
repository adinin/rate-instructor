FROM node 

RUN mkdir -p /usr/src/app

## run npm install
WORKDIR /usr/src/app
COPY ./package.json /usr/src/app
RUN npm install

## copy the app
ADD . /usr/src/app

## expose the port - internal port for the CONTAINER - what server.js is listening to app.listen(8000);
EXPOSE 8000

## run the API
CMD ["/usr/local/bin/node", "/usr/src/app/server.js"]