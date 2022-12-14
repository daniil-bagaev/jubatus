'use strict';
const
    fs = require('node:fs'),
    path = require('node:path'),
    { config } = require(path.resolve('./config/app.config.json')),
    jubatus = {
        log: require(path.resolve(config.plugins.log.js)),
        git: require(path.resolve(config.plugins.git.js)),
        src: require(path.resolve(config.plugins.src)),
        dest: require(path.resolve(config.plugins.dest)),
        task: require(path.resolve(config.plugins.task))
    };
module.exports = jubatus;
