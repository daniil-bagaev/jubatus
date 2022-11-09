const 
    path = require('node:path'),
    fs = require('node:fs'),
    { config } = require(path.resolve('./config/app.config.json'));
    package = require(path.resolve(config.package));
    git = require(path.resolve(config.plugins.git.config)),
    gitter = {
        opts: git.opts,
        get version() {
            fs.readFileSync
        },
        bump (ver, opts) {
            if(!opts)
                opts = {};
            Object.assign(gitter.opts, opts);
        },
        git () {
            console.log('U run git plugin with opts: '+ gitter.opts.title);
        }
    };
gitter.bump('0.0.0');
//module.exports = gitter.git;
