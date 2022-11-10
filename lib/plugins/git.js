const 
    path = require('node:path'),
    fs = require('node:fs'),
    execSync = require('child_process').execSync,
    { config } = require(path.resolve('./config/app.config.json')),
    package = require(path.resolve(config.package)),
    git = require(path.resolve(config.plugins.git.config)),
    log = require(path.resolve(config.plugins.log.js)),
    gitter = {
        opts: git.opts,
        version: package.version,
        bump (ver, type) {
            let
                types = ver.split(/[.-]/),
                str,
                version = {};                
            if (types[0])
                version.major = Number(types[0]);
            if (types[1])
                version.minor = Number(types[1]);
            if (types[2])
                version.patch = Number(types[2]);
            if (types[3])
                version.prerelease = types[3];
            switch(type) {
                case 'major':
                    version.major = version.major + 1;
                    version.minor = 0;
                    version.patch = 0;
                    version.prerelease = '';
                    break;
                case 'minor':
                    version.minor = version.minor + 1;
                    version.patch = 0;
                    version.prerelease = '';
                    break;
                case 'patch':
                    version.patch = version.patch + 1;
                    version.prerelease = '';
                    break;
                case 'prerelease':
                    if (!version.prerelease || version.prerelease === undefined)
                        version.prerelease = String.fromCharCode(97);
                    else if (version.prerelease)
                        version.prerelease = String.fromCharCode(version.prerelease.charCodeAt(version.prerelease.length - 1) + 1);
                    break;
            }     
            if (version.prerelease) 
                str = '-' + version.prerelease;
            str = '.' + version.patch + (str || '');
            str = '.' + version.minor + (str || '');
            str = version.major + (str || '');
            return str;
        },
        exec (cmd) {
            return execSync(cmd).toString();
        },
        git (opts) {
            if (!opts)
                opts = {};
            opts = (!Object.keys(opts).length) ? gitter.opts : {
                title: (opts.title || gitter.opts.title),
                message: (opts.message || gitter.opts.message),
                type: (opts.type || gitter.opts.type),
                status: (opts.status || gitter.opts.status),
                add: (opts.add || gitter.opts.add),
                commit: (opts.commit || gitter.opts.commit),
                push: (opts.push || gitter.opts.push)
            };
            let 
                ver = gitter.bump(gitter.version, opts.type);
            package.version = ver;
            let 
                writePackage = JSON.stringify(package, null, '\t');
            fs.writeFileSync(path.resolve(config.package), writePackage);
            if(!opts.title)
                opts.title = 'v.'+package.version;
            let 
                status = gitter.exec(opts.status).toString(),
                add = gitter.exec(opts.add).toString(),
                commit =  gitter.exec(opts.commit + '"' + opts.title + '"' + ' -m '+ '"' + opts.message + '"').toString(),
                push = gitter.exec(opts.push).toString();
            log(status, {filename: 'gitter.log'});
            log(add, {filename: 'gitter.log'});
            log(commit, {filename: 'gitter.log'});
            log(push, {filename: 'gitter.log'});
        }
    };
module.exports = gitter.git;
