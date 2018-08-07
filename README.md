## 星光直播前后端分离 - 活动脚手架

---

#### Prepare

1. 全局安装yeoman

   ```bash
   npm i -g yo
   ```

2. clone本项目

   ```bash
   git clone [github-https-url]
   ```

3. 安装依赖

   ```bash
   npm i
   ```

4. generator-activity下配置自己的输出路径

   ```javascript
   module.exports = {
       /* Base Path */
       outputHtmlDir: 'Your html Path', // ejs 相关输出路径
       outputStaticDir: 'Your static_guojiang_tv Path', // 静态文件 相关输出路径(js/less/imgs)
   };
   
   // Relative Path除非星光项目目录结构发生变化，其他情况不需要改变
   ```

5. 链接

   ```bash
   npm link
   ```

#### 如果你希望在项目中本地化安装使用

```js
npm install -D yo

// package.json 中添加
// . 表示genarator项目目录
"scripts": {
    "new": "node node_modules/yo/lib/cli.js ."
}
```

#### Usage

global

```bash
yo activity

# ? 请输入项目名称  - forTest(对应的所有文件名均为forTest)
# ? 请输入项目名称  - queen/forTest(二级目录项目) (支持多级目录)

# ? 请选择模板 (PC Mobile PC&Mobile)
```

devDep

```bash
npm run new

# ? 请输入项目名称 (支持多级目录)
# ? 请选择模板 (PC Mobile PC&Mobile)
```

#### Q&A

**当生成列表报告文件已存在时?**

> 需要手动确认文件名(项目名)是否重复

**需要更改生成的模板文件时?**

```javascript
// templates(基于ejs语法)
// -> generators-activity/generators/app/templates

// 模板参数
// -> index.js
```

![模板参数](C:\Users\Administrator\Desktop\note\imgs\yo.png)



#### Extendsion 扩展

**index.js - 脚手架入口文件**

```javascript
module.exports = class extends Generators {
    constructor (args, opts) {
        super(args, opts);

        this.props = {};
    }
    
    // 生命周期钩子函数
 	/* 生命周期如下 */
    // 1. initializing
    // 2. prompting    // * 创建perl交互
    // 3. configuring
    // 4. default
    // 5. writing      // * 输入目录文件操作
    // 6. conflicts
    // 7. install
    // 8. end   
}
```

>this.prompt // 创建用户交互 依赖 inquirer.js
>
>this.fs // 文件操作 依赖 mem-fs-editor



##### Reference 参考

[yeoman](http://yeoman.io/generator/)

[inquirer.js](https://github.com/SBoudrias/Inquirer.js)

[mem-fs-editor](https://npm.taobao.org/package/mem-fs-editor)