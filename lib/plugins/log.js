'use strict';
const
    fs = require('node:fs'),
    os = require('node:os'),
    path = require('node:path'),
    env = process.env,
    { config } = require(path.resolve('./config/app.config.json')),
    log = require(path.resolve(config.plugins.log.config)),
    logger = {
        env: {
            teamcity: (env.TEAMCITY_VERSION || false),
            term: {
                name: (env.TERM || false),
                color: (env.COLORTERM || false),
                programm: {
                    name: (env.TERM_PROGRAM || false),
                    ver: parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10),
                }
            },
            ci: {
                e: (env.CI || false),
                name: (env.CI_NAME || false),                
                variant: ['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI'].some(el => { return el in env }),
            },
            platform: process.platform,
            osRelease: os.release().split('.').map(el => {return parseInt(el)}),
            node: process.versions.node.split('.').map(el => {return parseInt(el)}),
            stdout: process.stdout,
            stderr: process.stderr,
            get color () { 
                let 
                    flags = 
                        process.argv
                            .map(el => {
                                if(el.startsWith('-'))
                                    if(el.startsWith('--'))
                                        return el.slice(2).split('=');
                                    else
                                        return el.slice(1).split('=')
                            })
                            .filter(Boolean);
                let color = undefined;
                flags.forEach(el => {
                    color = (el.length > 1) ? el[1] : false;
                });
                return color;
            },
            get forceColor() {
                return (this.color === undefined) ? undefined : 
                            (!this.color) ? false : 
                                ((env.FORCE_COLOR && env.FORCE_COLOR.length === 0) || parseInt(env.FORCE_COLOR, 10) !== 0);               
            },
            get level() {
                let level;
                if(this.forceColor === false)
                    return 0;
                if((this.stdout && !this.stdout.isTTY && this.forceColor !== true) || (this.stderr && !this.stderr.isTTY && this.forceColor !== true))
                    return 0;    
                let min = this.forceColor ? 1 : 0;
                if(this.platform === 'win32') {
                    if(this.node[0] >= 8 && this.osRelease[0] >= 10 && this.osRelease[2] >= 10586)
                        level = (this.osRelease[2] >= 14931) ? 3 : 2;
                    level = 1;
                }
                if(this.ci.e) {
                    if(this.ci.variant || this.ci.name === 'codeship')
                        level = 1;
                    level = min;
                }
                if(this.teamcity)
                    level = /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(this.teamcity) ? 1 : 0;
                if(this.term.color === 'truecolor')
                    level = 3
                else 
                    if(this.term.color)
                        level = 1;
                switch(this.term.programm.name) {
                    case 'iTerm.app':
                        level = (this.term.programm.ver >= 3) ? 3 : 2;
                    case 'Hyper':
                        level = 3;
                    case 'Apple_Terminal':
                        level = 2;
                }    
                if(/-256(color)?$/i.test(this.term.name))
                    level = 2;
                if(/^screen|^xterm|^vt100|^rxvt|color|ansi|cygwin|linux/i.test(this.term.name))
                    level = 1;
                if(this.term.name === 'dumb')
                    level = min;    
                if(this.color === '256' && level >= 2)
                    level = 2;
                if((this.color === '16m' || this.color === 'full' || this.color === 'truecolor') && level >=3)
                    level = 3;
                return level;
            }
        },
        types: log.types,
        modes: log.modes,
        opts: log.opts,
        hex2rgb(hex) {
            let 
                result;
            hex = hex.replace(/^#?([A-Fa-f\d])([A-Fa-f\d])([A-Fa-f\d])$/i, (m, r, g, b) => {
                return r + r + g + g + b + b;
            });
            result = /^#?([A-Fa-f\d]{2})([A-Fa-f\d]{2})([A-Fa-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },
        rgb2obj(str) {
            str = str.substr(4, str.length-5).split(',');
            return {
                r: str[0],
                g: str[1],
                b: str[2]
            };
        },
        rgb2ansiCode(rgb, cbg) {
            let str = [];
            for (let [key, val] of Object.entries(rgb))
                str.push(val);
            str = str.join(';');
            switch (cbg) {
                case 'color':
                    return {
                        'open': '\u001b[38;2;'+str+'m',
                        'close': '\u001b[39m'
                    }
                case 'bg':
                    return {
                        'open': '\u001b[48;2;'+str+'m',
                        'close': '\u001b[49m'
                    }
            }                
        },
        bgCodes (color) {
            return {
                open: log.bg[color],
                close: '\u001b[49m'
            }
        },
        colorCodes (color) {
            return {
                open: log.color[color],
                close: '\u001b[39m'
            }
        },
        styleCodes (style) {
            return log.style[style]
        },
        dateFormat(format) {
            let
                months = ['M', 'MM', 'MMM', 'MMMM'],
                days = ['D', 'DD'],
                years = ['YY', 'YYYY'],
                hours = ['H', 'HH'],
                minutes = ['m', 'mm'],
                seconds = ['s', 'ss'],
                miliseconds = ['S', 'SS', 'SSS'],
                monthsNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                date = format
                    .match(/([A-Za-z]{1,4})|([\s\:\-\/\.]{0,})/gi) 
                    .filter(Boolean)
                    .map(el => {
                        let z;
                        if(/[A-Za-z{1,4}]/gi.test(el)){
                            if(years.includes(el)) {
                                switch(el) {
                                    case 'YYYY':
                                        return new Date().getFullYear()+'';
                                    case 'YY':
                                        return (new Date().getFullYear()+'').slice(2);
                                }
                            }
                            if(months.includes(el)) {
                                switch(el) {
                                    case 'MMMM':
                                        return monthsNames[new Date().getMonth()];
                                    case 'MMM':
                                        return monthsNames[new Date().getMonth()].slice(0, 3);
                                    case 'MM':
                                        return ((new Date().getUTCMonth()+'').length === 1) ? '0'+new Date().getUTCMonth() : new Date().getUTCMonth()+'';
                                    case 'M':
                                        return new Date().getUTCMonth()+'';
                                }    
                            }
                            if(days.includes(el)) {
                                switch(el) {
                                    case 'DD':
                                        return ((new Date().getDate()+'').length === 1) ? '0'+new Date().getDate() : new Date().getDate()+'';
                                    case 'D':
                                        return new Date().getDate()+'';
                                }                            
                            }
                            if(hours.includes(el)) {
                                switch(el) {
                                    case 'HH':
                                        return ((new Date().getHours()+'').length === 1) ? '0'+new Date().getHours() : new Date().getHours()+'';
                                    case 'H':
                                        return new Date().getHours()+'';
                                }                            
                            }
                            if(minutes.includes(el)) {
                                switch(el) {
                                    case 'mm':
                                        return ((new Date().getMinutes()+'').length === 1) ? '0'+new Date().getMinutes() : new Date().getMinutes()+'';
                                    case 'm':
                                        return new Date().getMinutes()+'';
                                }                            
                            }                    
                            if(seconds.includes(el)) {
                                switch(el) {
                                    case 'ss':
                                        return ((new Date().getSeconds()+'').length === 1) ? '0'+new Date().getSeconds() : new Date().getSeconds()+'';
                                    case 's':
                                        return new Date().getSeconds()+'';
                                }                            
                            }
                            if(miliseconds.includes(el)) {
                                switch(el) {
                                    case 'S':
                                        return (((new Date().getMilliseconds()+'').length === 1) ? '00'+ (new Date().getMilliseconds()+'') : ((new Date().getMilliseconds()+'').length === 2) ? '0'+ (new Date().getMilliseconds()+'') : (new Date().getMilliseconds()+'')).slice(0,1);
                                    case 'SS':
                                        return (((new Date().getMilliseconds()+'').length === 1) ? '00'+ (new Date().getMilliseconds()+'') : ((new Date().getMilliseconds()+'').length === 2) ? '0'+ (new Date().getMilliseconds()+'') : (new Date().getMilliseconds()+'')).slice(0,2);
                                    case 'SSS':
                                        return (((new Date().getMilliseconds()+'').length === 1) ? '00'+ (new Date().getMilliseconds()+'') : ((new Date().getMilliseconds()+'').length === 2) ? '0'+ (new Date().getMilliseconds()+'') : (new Date().getMilliseconds()+''));
                                }                            
                            }
                        } else 
                            return el;
                    })
                    .join('^^')
                    .replaceAll('^^','');
            return '[' + date + ']';
        },
        log (msg, opts) {
            if (!opts)
                opts = {};
            if (!Object.keys(opts).length)
                opts = logger.opts;
            else if (opts.type && logger.types.hasOwnProperty(opts.type))
                Object.keys(logger.opts).forEach(key => {
                    let 
                        types = logger.types[opts.type];
                    opts[key] = (logger.opts[key] !== types[key] && types[key]) ? types[key] : logger.opts[key];
                });
            else 
                opts = 
                    {
                        type: 'custom',
                        logdir: path.resolve((opts.logdir || logger.opts.logdir)),
                        filename: (opts.filename || logger.opts.filename),
                        mode: (opts.mode || logger.opts.mode),
                        mode: (opts.mode || logger.opts.mode),
                        header: (opts.header || logger.opts.header),
                        prefix: (opts.prefix || logger.opts.prefix),
                        suffix: (opts.suffix || logger.opts.suffix),
                        date: (opts.date || logger.opts.date),
                        color: (opts.color || logger.opts.color),
                        bg: (opts.bg || logger.opts.bg),
                        style: (opts.style || logger.opts.style),
                        level: ((logger.env.level < opts.level) ? logger.env.level : (opts.level || logger.env.level))
                    };
            Object.keys(opts).forEach(key => {
                let types;
                if (opts.type)
                    types = logger.types[opts.type];
                opts[key] = (types) ? (opts[key] !== types[key] && types[key]) ? types[key] : opts[key] : opts[key];
            });
           if (opts.filename) {
                fs.mkdirSync(opts.logdir, {recursive: true}, err => {
                    if (err) console.log('No log dir: '+ opts.logdir);
                });
                if (!logger.modes.includes(opts.mode))
                    opts.mode = 'a';
                    if(opts.mode === 'a')
                        fs.appendFileSync(path.join(opts.logdir, opts.filename), msg + '\n');
                    if(opts.mode === 'w')
                        fs.writeFileSync(path.join(opts.logdir, opts.filename), msg + '\n');
            }
            if (opts.color) {
                let 
                    transColor = opts.color.replace(' ', '');
                if (log.color.hasOwnProperty(transColor) && opts.level >= 1)
                    opts.colorCodes = logger.colorCodes(transColor)
                else if (/^#[A-Fa-f0-9]{6}|#[A-Fa-f0-9]{3}$/i.test(transColor)  && opts.level >= 1)  {
                    if (/^#[A-Fa-f0-9]{3}$/i.test(transColor))
                        transColor = '#' + transColor.replace('#','').split('').map((hex) => {return hex + hex;}).join('');
                    transColor = logger.hex2rgb(transColor);
                    opts.colorCodes = logger.rgb2ansiCode(transColor, 'color');
                }
                else if (/^rgb\([0-9]{1,3}\,[0-9]{1,3}\,[0-9]{1,3}\)$/i.test(transColor) && opts.level >= 1) {
                    transColor = logger.rgb2obj(transColor);
                    opts.colorCodes = logger.rgb2ansiCode(transColor, 'color');
                }
            }
            if (opts.bg) {
                let 
                    transBg = opts.bg.replace(' ', '');
                if (log.bg.hasOwnProperty(transBg)) 
                    opts.bgCodes = logger.bgCodes(transBg);
                else if (/^#[A-Fa-f0-9]{6}|#[A-Fa-f0-9]{3}$/i.test(transBg)  && opts.level >= 1)  {
                    if (/^#[A-Fa-f0-9]{3}$/i.test(transBg))
                        transBg = '#' + transBg.replace('#','').split('').map((hex) => {return hex + hex;}).join('');
                    transBg = logger.hex2rgb(transBg);
                    opts.bgCodes = logger.rgb2ansiCode(transBg, 'bg');
                }
                else if (/^rgb\([0-9]{1,3}\,[0-9]{1,3}\,[0-9]{1,3}\)$/i.test(transBg) && opts.level >= 1) {
                    transBg = logger.rgb2obj(transBg);
                    opts.bgCodes = logger.rgb2ansiCode(transBg, 'bg');
                }
            }
            if (opts.style) 
                if (log.style.hasOwnProperty(opts.style))
                    opts.styleCodes = logger.styleCodes(opts.style);          
            msg = (opts.prefix && opts.prefix.length) ? opts.prefix + ' ' + msg : msg;
            msg = (opts.date && opts.date.length) ? logger.dateFormat(opts.date) + ' ' + msg : msg;      
            msg = (opts.header && opts.header.length) ? opts.header + '\n' + msg : msg;
            msg = (opts.suffix && opts.suffix.length) ? msg + ' ' + opts.suffix : msg;
            msg = opts.bgCodes.open + msg + opts.bgCodes.close;
            msg = opts.colorCodes.open + msg + opts.colorCodes.close;
            msg = opts.styleCodes.open + msg + opts.styleCodes.close;
            console.log(msg);
            return msg;
        }
    };
module.exports = logger.log;
