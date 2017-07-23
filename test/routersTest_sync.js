'use strict';

const test = require('ava');
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');

const routes = require('../src/routers.js');
const restClient = require('../src/restClient.js');

let app, stubGET, stubPOST;
test.cb.serial.before('prepare express', t => {
  app = express();
  routes(app);
  t.end();
});

test.cb.serial('test router /getG1ThenPostP1', t => {
  stubGET = sinon.stub(restClient, 'GET');
  stubPOST = sinon.stub(restClient, 'POST');
  stubGET.resolves('Fake GET');
  stubPOST.resolves('Fake POST');

  request(app)
  .post('/getG1ThenPostP1')
  .end(function(err, res) {
    if(err) throw err;
    
    t.is(res.body.length, 2);
    const resStr = res.body.join(',');
    t.true(resStr.indexOf('Fake GET') !== -1);
    t.true(resStr.indexOf('Fake POST') !== -1);

    restClient.GET.restore();
    restClient.POST.restore();
    t.end();
  });
});
