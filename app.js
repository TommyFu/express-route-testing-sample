'use strict';

const express = require('express');
const http = require('http');
const routers = require('./src/routers');

let app = express();
routers(app);
http.createServer(app).listen(3000, function() {
  console.log('Server listening on port 3000');
});