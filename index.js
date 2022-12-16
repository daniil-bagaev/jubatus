'use strict';
const 
    { config } = require('./config/app.config.json'),
    jubatus = require(config.jubatus);
module.exports = jubatus;
