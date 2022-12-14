'use strict';
const 
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
        file.destExt = (opts && opts.ext) ? opts.ext : (taskOptions.default.ext[file.srcExt]) ? taskOptions.default.ext[file.srcExt] : file.srcExt;
        outFileArr.push(file.destFileName+file.destExt);
        file.dest =  outFileArr.join('/');
        return file;
    };
module.exports = dest;
