'use strict';
const 
    { config } = require('./config/app.config.json'),
    jubatus = require(config.jubatus);

jubatus.log('rgb test', {
    color: 'red'

});
