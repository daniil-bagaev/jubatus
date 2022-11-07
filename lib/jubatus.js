'use strict';
const
    fs = require('node:fs'),
    path = require('node:path'),
    config = require(path.resolve('./config/app.config.json')).config,
    jubatus = {
        log: require(path.resolve(config.plugins.log.js)),
        git: require(path.resolve(config.plugins.git.js))
    };
module.exports = jubatus;

