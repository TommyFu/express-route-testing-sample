'use strict';

const restClient = require('./restClient');

module.exports = function(app) {

  app.post('/getG1ThenPostP1', function(req, res, next) {
    let ret = [];
    restClient.GET(req, res, '/G1').then((resolve) => {
      ret.push(resolve);
      restClient.POST(req, res, '/P1').then((resolve) => {
        ret.push(resolve);
        res.send(ret);
      });
    });
  });
  
  app.get('/getG1AndG2', function(req, res, next) {
    Promise.all([
      restClient.GET(req, res, '/G1'),
      restClient.GET(req, res, '/G2')
    ]).then((resolves) => {
      res.send(resolves);
    });
  });
}