'use strict';
const 
    pug = require('pug'),
    task = (content, opts) => {
        if(!opts)
            opts = {};
        return pug.render(content, opts);
    };
module.exports = task;
