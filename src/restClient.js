'use strict';

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
