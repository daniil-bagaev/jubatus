'use strict';
const
    fs = require('node:fs'),
    path = require('node:path'),
    { config } = require(path.resolve('./config/app.config.json')),
    destination = require(path.resolve(config.plugins.dest)),
    source = require(path.resolve(config.plugins.src)),
    log = require(path.resolve(config.plugins.log.js)),
    run = (files, task, opts) => {
        let 
            startTime, 
            endTime,
            tasks = [],
            taskFiles = fs.readdirSync(config.plugins.tasks.dir, (err, list) => {
                if (err)
                    return err;   
                return list;
            });
            taskFiles.forEach(file => {
                tasks.push(path.parse(file).name);
            });        
        opts = (!opts) ? { debug: false } : opts;
        switch(typeof task) {
            case 'object':
                if(task.isArray()) {
                    log('Run miltiple tasks' , {color: 'cyan', date: 'YYYY-MM-DD HH:mm:ss'});
                    task.forEach(mTask => {
                        if(typeof mTask === 'string')
                            run(files, mTask, opts);
                        else {
                            log('No task in task list', {type: 'error', filename: 'tasker.log', date: 'YYYY-MM-DD HH:mm:ss'});
                            return;
                        }
                    });
                } else {
                    log('No array of multiple tasks', {type: 'error', filename: 'tasker.log', date: 'YYYY-MM-DD HH:mm:ss'});
                    return;
                }
                break;
            case 'string':
                startTime = new Date().getTime();
                if(!tasks.includes(task)) {
                    log('No task in tasks directory: ' + config.plugins.tasks.dir, {type: 'error', filename: 'tasker.log', date: 'YYYY-MM-DD HH:mm:ss'});
                    return;
                } //Ошибка не нужна если будет соло-файл (jub.js)
                files.forEach(file => {
                    if(opts.debug) log('src: ' + file.src, {color: 'cyan', date: 'YYYY-MM-DD HH:mm:ss'});
                    let content = fs.readFileSync(file.src).toString();
                    //TODO: добавить работу с соло-файлом (jub.js)
                    //TODO: добавить работу с файлами плагинов (./lib/tasks/jub.js)
                    //let result = task(content, opts);
                    fs.mkdirSync(path.parse(file.dest).dir, {recursive: true}, err => {
                        if (err)
                            log('Can`t create dir' + path.parse(file.dest).dir, {type: 'error', file: 'tasker.log', date: 'YYYY-MM-DD HH:mm:ss'});
                    });
                    fs.writeFileSync(file.dest, result, err => {
                        if (err) 
                            log ('Write file error' + file.dest, {type: 'error', file: 'tasker.log', date: 'YYYY-MM-DD HH:mm:ss'})
                    });
                    if(opts.debug) log('dest: '+ file.dest, {color: 'cyan', date: 'YYYY-MM-DD HH:mm:ss'});
                });
                endTime = new Date().getTime();
                log('Completed in ' + `${endTime - startTime}` +'ms' , {color: 'cyan', date: 'YYYY-MM-DD HH:mm:ss'});
                break;
            case 'function':
                startTime = new Date().getTime();
                files.forEach(file => {
                    //TODO: добавить работу с файлами (??? pipe ???)
                    //task();
                });
                endTime = new Date().getTime();
                log('Completed in ' + `${endTime - startTime}` +'ms' , {color: 'cyan', date: 'YYYY-MM-DD HH:mm:ss'});
                break;
            default:
                log('No callback function or another error', {type: 'error', filename: 'tasker.log', date: 'YYYY-MM-DD HH:mm:ss'});
        }
    },
    task = (task, src, dest, opts, cb) => {
        if(!src) {
            log('No source glob', {type: 'error', filename: 'tasker.log', date: 'YYYY-MM-DD HH:mm:ss'});
            return;
        }
        if(!dest) {
            log('No destination glob', {type: 'error', filename: 'tasker.log', date: 'YYYY-MM-DD HH:mm:ss'});
            return;
        }
        if(!task) {
            log('No task', {type: 'error', filename: 'tasker.log', date: 'YYYY-MM-DD HH:mm:ss'});
            return;
        }
        if(!opts) 
            opts = {};
        if(typeof opts === 'function' || typeof opts === 'string') {
            cb = opts;
            opts = {};
        }
        if(!cb)
            cb = task;
        let 
            files = 
                source(src)
                    .map(element => {return destination(dest, element, opts)})
                        .map(element => {return {src: element.src, dest: element.dest}});
        log('You run ' + task + ' task', {color: 'yellow', filename: 'tasker.log', date: 'YYYY-MM-DD HH:mm:ss'});
        run(files, cb, opts);
    };
module.exports = task;
