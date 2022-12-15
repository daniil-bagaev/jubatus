'use strict';
const 
    less = require('less'),
    { config } = require(path.resolve('./config/app.config.json')),
    log = require(path.resolve(config.plugins.log.js)),
    task = (content, opts) => {
        if(!opts) 
            opts = {
                compress : true
            }
        let result;
        less.render(content, opts, (err, output) => {
            if(err)
                log(err, {type: 'error', file: 'tasker.log', date: 'YYYY-MM-DD HH:mm:ss'});
            else 
            result = output.css;
        });
        return result;
    };
module.exports = task;
