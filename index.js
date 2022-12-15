'use strict';
const 
    { config } = require('./config/app.config.json'),
    jubatus = require(config.jubatus);

//jubatus.test();
//jubatus.log('test', {filename: 'index.log'});
//jubatus.task('pug', './src/**/*.pug', './build/');
jubatus.git();
