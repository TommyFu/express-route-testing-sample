'use strict';

const test = require('ava');
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');

const routes = require('../src/routers.js');
const restClient = require('../src/restClient.js');

let app, stubGET, stubPOST;
test.cb.before('prepare express and sinon stub', t => {
  app = express();
  routes(app);

  stubGET = sinon.stub(restClient, 'GET');
  stubPOST = sinon.stub(restClient, 'POST');
  stubGET.callsFake((req, res, path) => {
    return new Promise((resolve, reject) => {
      if(path === '/G1'){
        resolve('Fake GET G1');
      }else if(path === '/G2'){
        resolve('Fake GET G2');
      }else{
        resolve('');
      }
    });
  });
  stubPOST.callsFake((req, res, path) => {
    return new Promise((resolve, reject) => {
      if(path === '/P1'){
        resolve('Fake POST P1');
      }else if(path === '/P2'){
        resolve('Fake POST P2');
      }else{
        resolve('');
      }
    });
  });

  t.end();
});

test.cb.after('restore sinon stub', t => {
  restClient.GET.restore();
  restClient.POST.restore();
  t.end();
});

test.cb('test router /getG1ThenPostP1', t => {
  request(app)
  .post('/getG1ThenPostP1')
  .end(function(err, res) {
    if(err) throw err;
    
    t.is(res.body.length, 2);
    const resStr = res.body.join(',');
    t.true(resStr.indexOf('Fake GET G1') !== -1);
    t.true(resStr.indexOf('Fake POST P1') !== -1);
    t.end();
  });
});

test.cb('test router /getG1AndG2', t => {
  request(app)
  .get('/getG1AndG2')
  .end(function(err, res) {
    if(err) throw err;
    
    t.is(res.body.length, 2);
    const resStr = res.body.join(',');
    t.true(resStr.indexOf('Fake GET G1') !== -1);
    t.true(resStr.indexOf('Fake GET G2') !== -1);
    t.end();
  });
});

