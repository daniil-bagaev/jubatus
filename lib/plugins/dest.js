'use strict';
const 
    path = require('node:path'),
    { config } = require(path.resolve('./config/app.config.json')),
    dest = (glob, file, opts) => {
        let 
            srcArr = file.srcDir.split('/'),
            destArr = glob.split('/'),
            outFileArr = 
                srcArr.map((element, i) => {
                    return (element === destArr[i]) ? element : (!destArr[i]) ? element : destArr[i];
                });
        file.destDir = outFileArr.join('/');
        file.destFileName = (opts && opts.fileName) ? opts.fileName : file.srcFileName;
        file.destExt = (opts && opts.ext) ? opts.ext : (config.ext[file.srcExt]) ? config.ext[file.srcExt] : file.srcExt;
        outFileArr.push(file.destFileName+file.destExt);
        file.dest =  outFileArr.join('/');
        return file;
    };
module.exports = dest;
