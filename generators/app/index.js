const Generators = require('yeoman-generator');
const _ = require('lodash');
const glob = require('glob');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const del = require('del');

const log = console.log;
const generatorName = 'activity';
const config = require('./config.yo');

module.exports = class extends Generators {
    constructor (args, opts) {
        super(args, opts);

        this.props = {};
    }

    /**
     * @desc 询问用户
     */
    prompting () {
        return this.prompt([{
            name: 'pName',
            type: 'input',
            message: '请输入项目名称',
            default: 'myProject'
        }, {
            name: 'pAssets',
            type: 'list',
            message: '请选择模板',
            choices: [{
                name: 'PC & Mobile',
                value: ['PC', 'Mobile'],
                checked: true
            }, {
                name: 'PC',
                value: ['PC']
            }, {
                name: 'Mobile',
                value: ['Mobile']
            }]
        }, {
            name: 'pIsBasedOnDir',
            type: 'list',
            message: '是否需要新建活动目录',
            choices: [{
                name: '需要',
                value: true,
                checked: true
            }, {
                name: '不需要',
                value: false
            }]
        }]).then((answers) => {
            this.log('Your Project Name (Dir & File name): ', answers.pName);
            this.log('Your Project Template Type: ', answers.pAssets);

            /* 打印输出目录 */
            this.log(chalk.green('Please Confirm Your Project Output Path: '));

            /* 1. 确认是否是二级目录项目 */
            let pathname, filename;
            if (answers.pName.indexOf('/') > -1) {
                let dir = answers.pName.split('/')[0];
                filename = answers.pName.split('/')[1];
                pathname = dir + '/';
                pathname += answers.pIsBasedOnDir ? (filename + '/' + filename) : filename;
            } else {
                filename = answers.pName;
                pathname = answers.pIsBasedOnDir ? (answers.pName + '/' + answers.pName) : answers.pName;
            }

            let files = {
                'ejs': pathname + '.ejs',
                'ejs_js': pathname + '.js',
                'less': pathname + '.less',
                'js': pathname + '.js',
            };

            this.props = answers;
            this.props.filename = filename;
            this.props.path = {};
            
            /* 获取路径列表 */
            answers.pAssets.forEach((type) => {
                this._getPaths(type, files);
            });

        }).then(() => {
            /* 确定这些文件的是否已经存在了 */
            this.props.pAssets.forEach((type) => {
                for (let key in this.props.path[type]) {
                    let path = this.props.path[type][key];
                    let existed = this.fs.exists(path);
                    
                    if (existed) {
                        this.log(chalk.red('File Existed : ', path));
                        this.log(chalk.red('Please Ensure The Project Can be Overwrited!'));
                        this.log(chalk.red('Exit...'));
                        process.exit(1);
                    }
                }
            });
            
            return this.prompt([{
                name: 'pathConfirm',
                type: 'confirm',
                message: 'The OutputPath above is Ok?',
                default: true
            }]);

        }).then((confirm) => {
            if (!confirm.pathConfirm) {
                this.log(chalk.red('You Change The Output Path in generator/generators/app/config.yo.js'));
                this.log(chalk.red('Exit...'));
                process.exit(1);
            }
        });
    }

    /**
     * @desc 创建配置文件
     */
    configuring () {
    }

    /**
     * @desc 拷贝文件，搭建脚手架
     */
    writing () {
        this.props.pAssets.forEach((type) => {
            this._writeByType(type, this.props.path[type]);
        });
    }

    end () {
        log(chalk.green('generator success'));
    }

    /**
     * 获取文件路径表
     * @param {*} type // PC / Mobile
     * @param {*} files // 文件表
     */
    _getPaths (type, files) {
        this.props.path[type] = {
            'ejs': path.resolve(config.outputHtmlDir, config['outputHtml'+ type +'Dir'], files['ejs']),
            'ejs_js': path.resolve(config.outputHtmlDir, config['outputHtml'+ type +'Dir'], files['ejs_js']),
            'imgs': path.resolve(config.outputStaticDir, config['outputStatic'+ type +'DirForImgs'], this.props.pName),
            'less': path.resolve(config.outputStaticDir, config['outputStatic'+ type +'DirForStyles'], files['less']),
            'js': path.resolve(config.outputStaticDir, config['outputStatic'+ type +'DirForJS'], files['js'])
        };

        this.log(chalk.green('**** '+ type +' ****'));

        this.log(chalk.green('---- ejs ----'));
        this.log(chalk.blue(this.props.path[type]['ejs']));
        this.log(chalk.blue(this.props.path[type]['ejs_js']));

        this.log(chalk.green('---- static imgs ----'));
        this.log(chalk.blue(this.props.path[type]['imgs'])); // imgs一定是单独目录的存在
        
        this.log(chalk.green('---- static less ----'));
        this.log(chalk.blue(this.props.path[type]['less']));

        this.log(chalk.green('---- static js ----'));
        this.log(chalk.blue(this.props.path[type]['js']));
    }

    /**
     * 根据PC/Mobile -> Path 写入对应的模板文件
     * @param {*} type // PC / Mobile
     * @param {*} paths // 路径表
     */
    _writeByType (type, paths) {
        // 创建模板文件 ejs
        this.fs.copyTpl(
            this.templatePath(path.resolve(this.sourceRoot(), './' + type.toLowerCase() + '/index.ejs' )),
            paths['ejs'],
            {
                imgPath: path.relative(path.dirname(paths['ejs']), paths['imgs']).replace(/\\/g, "/"),
                shareTitle: 'shareTitle',
                shareContent: 'shareContent'
            }
        );

        // 创建模板引擎文件 ejs_js
        let layoutPath;
        if (this.props.pIsBasedOnDir && this.props.pName.indexOf('/') > -1) {
            layoutPath = '../../../layouts/layout.js';
        } else if (this.props.pIsBasedOnDir || this.props.pName.indexOf('/') > -1) {
            layoutPath = '../../layouts/layout.js';
        } else {
            layoutPath = '../layouts/layout.js';
        }

        this.fs.copyTpl(
            this.templatePath(path.resolve(this.sourceRoot(), './' + type.toLowerCase() + '/index.js' )),
            paths['ejs_js'],
            {
                layoutPath: layoutPath,
                projectName: this.props.filename,
                pageTitle: 'pageTitle',
            }
        );

        // 创建活动存放图片的目录
        fs.mkdirSync(paths['imgs']);
        this.log(chalk.green('   create '), paths['imgs']);

        // 创建样式文件
        this.fs.copyTpl(
            this.templatePath(path.resolve(this.sourceRoot(), './' + type.toLowerCase() + '/styles/style.less' )),
            paths['less'],
            {
                projectName: this.props.pName,
                imgPath: path.relative(path.dirname(paths['less']), paths['imgs']).replace(/\\/g, "/")
            }
        );

        // 创建脚本文件
        this.fs.copyTpl(
            this.templatePath(path.resolve(this.sourceRoot(), './' + type.toLowerCase() + '/scripts/main.js' )),
            paths['js'],
            {
                stylePath: path.relative(path.dirname(paths['js']), paths['less']).replace(/\\/g, "/")
            }
        );
    }
};
