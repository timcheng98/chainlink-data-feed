const express = require('express');
const fs = require('fs');
const _ = require('lodash')
const path = require('path')

exports.getRouter = (ns) => {
  let router = new express.Router();
  var files = fs.readdirSync(__dirname);
  _.each(files, (file) => {
    let fileObj = path.parse(file);
    if (fileObj.ext === '.js' && fileObj.name !== 'index') {
      var controller = require('./' + fileObj.name);
      controller.initRouter(router);
    }
  });
  
  return router;
}