'use strict';
const 
    path = require('node:path'),
    fg = require('fast-glob');
let 
    src = (src) => {
        let files = 
            fg.sync(glob, {onlyFiles: true})
                .map(element => {
                    return {
                        srcDir: path.parse(element).dir,
                        srcFileName: path.parse(element).name,
                        srcExt: path.parse(element).ext,
                        src: element
                    };
            });
        return files;
    };
module.exports = src;
