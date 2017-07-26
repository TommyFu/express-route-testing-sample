# express-router-testing-sample
A sample project to demo how to test express routers.

## Quick Start
1. Install latest node.js then run `npm install`
2. `npm run test` to run all testing cases, `npm run debugTest` to debug the target test case.
3. `npm run start` to start the server.


## Detail Explanation
### I. Create a simple server

#### app.js
Create a express server and set routers.
```javascript
const express = require('express');
const http = require('http');
const routes = require('./src/routers');

let app = express();
routes(app);
http.createServer(app).listen(3000, function() {
  console.log('Server listening on port 3000');
});
```

#### routers.js
Add two routers, `/getG1ThenPostP1` and `/getG1AndG2`
```javascript
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
```

#### restClient.js
The entrance of the rest requests, add two test api.
```javascript
const get = function(req, res, path, params){
  return new Promise((resolve, reject) => {
    if(path === '/G1'){
      resolve('GET G1 successfully');
    }else if(path === '/G2'){
      resolve('GET G1 successfully');
    }
    resolve('');
  });
}

const post = function(req, res, path, params){
  return new Promise((resolve, reject) => {
    if(path === '/P1'){
      resolve('POST P1 successfully');
    }else if(path === '/P2'){
      resolve('POST P2 successfully');
    }
    resolve('');
  });
}

module.exports = {
  GET: get,
  POST: post
};
```

A simple server is ready, call `http://localhost:3000/getG1ThenPostP1`, it will return an array.
```
[
    "GET G1 successfully",
    "POST P1 successfully"
]
```


### II. Synchronous testing
The main goal is testing the express router.

Using ava as testing framework, using supertest to call the express router, using sinon to stub and mock up the request.

`supertest` using the callback style, so we need to use ava `cb`.

Sinon cannot stub a function more than one time, if you want to change the stub, it should call `restore()` then stub again.

A brute force approch is running the cases synchronously, the disadvantage is the synchronous testing wasting the ava aync feature.

#### routersTest_sync.js
```javascript
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
```

### III. Asynchronous testing (recommended)
Asynchronous approch mocking up all the requests in ava `before` section.

Using sinon `callsFake` to call the fake function, distinguish different requests with their api paths.

#### routersTest_async.js
```javascript
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
```
