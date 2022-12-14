'use strict';
const
    path = require('node:path'),
    { config } = require(path.resolve('./config/app.config.json')),
    destF = require(path.resolve(config.plugins.dest)),
    srcF = require(path.resolve(config.plugins.src)),
    log = require(path.resolve(config.plugins.log.js)),
    task = (src, dest, task, opts) => {
        if(!src) {
            log('No source glob', {type: 'error', filename: 'tasker.log'});
            return;
        }
        if(!dest) {
            log('No destination glob', {type: 'error', filename: 'tasker.log'});
            return;
        }
        if(!task) {
            log('No task', {type: 'error', filename: 'tasker.log'});
            return;
        }
        let 
            files = srcF(src)
                        .map(element => {return destF(dest, element, opts)})
                            .map(element => {return {src: element.src, dest: element.dest}});
    };
module.exports = task;
