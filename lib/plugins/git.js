const 
    path = require('node:path'),
    git = require(path.resolve(require(path.resolve('./config/app.config.json')).config.plugins.git.config)),
    gitter = {
        opts: git.opts,
        bump (ver, opts) {
            
        },
        git () {
            console.log('U run git plugin with opts: '+ this.opts.title);
        }
    };
module.exports = gitter.git;
