# 前端代码覆盖率总结

首先讲一下代码覆盖率统计最本质的原理，将js文件通过特殊手段进行插桩，浏览器访问的都是经过插桩后的代码，在执行插桩代码后，会记录覆盖率星系，包括行执行次数、函数执行次数、分支执行次数以及语句执行次数等信息。

特殊手段： 词法分析或语法分析等  
插桩： 在相应代码处植入代码，不影响代码逻辑，只统计执行次数

### 探究istanbul-middleware

istanbul-middleware是一个基于express的中间件，它提供了几大特性：  
 - server端（node）插桩以及代码覆盖率数据收集  
 - client端（browse）插桩以及代码覆盖率数据收集  
 - 提供了/coverage、/coverage/reset、/coverage/download、/coverage/client等http接口，方便代码覆盖率汇总和生成总结报告  

istanbul-middleware主要暴露了以下几个接口：  
 - im.hookLoader  
 - im.createHandler  
 - im.createClientHandler  
 - im.getInstrumenter  

在阐述istanbul-middleware之前需要先了解一下istanbul，因为想要达到更好的理解，必须要知道istanbul-middleware暴露出来的api的实现原理

istanbul是一种第三方库，它可以支持插桩文件生成，可以收集数据报告并提供了终端和页面覆盖率报告生成等功能

它包含的主要组件如下：
   
##### nyc： 支持把istanbul嵌入到单元测试中，支持插桩文件生成、覆盖率报告生成等
 - nyc npm run test
 - nyc --reporter=lcov --reporter=text-lcov npm run test

##### babel-plugin-istanbul: 提供对es6规范的插桩支持，在babel编译之前instrument你的ES6代码。

##### istanbul-lib-coverage: 提供包括合并、汇总及解析覆盖率数据在内功能的api
 - createCoverageMap: 接受覆盖率数据生成map，map具备合并以及汇总功能
 - createCoverageSummary
 
##### istanbul-lib-hook: 提供对 require, vm.createScript, vm.runInThisContext三个位置进行自动插桩的钩子方法。
 - 主要用于node端插桩
 - 暴露了hookRequire、unHookRequire等6个主要接口
 - vm为istanbul实例, vm中有两个接口可以跑外部代码，这部分代码同样需要插桩，实现原理很简单如下：

 ```
	var originalRunInThisContext = vm.runInThisContext;  
	vm.runInThisContext = function (code, options) { 
		var ret = transformFn(code, options);
		return originalRunInThisContext(ret.code, options);  
	};
 ```
 
##### istanbul-lib-instrument: 核心模块，负责进行插桩的库。

##### istanbul-lib-report: 覆盖率报告的核心函数库
 - 为报告生成提供核心函数，
 - 提供了三个标准形式报告，支持平面总结报告，呈现为一个根节点和平铺的所有文件
 - 支持嵌套总结报告，呈现为按目录分等级的形式
 - 支持包形式总结，呈现为一个根结点和平铺所有目录（包含子目录），覆盖率数据包含该目录下的直接子文件，不包含该目录下的子目录内的文件
 
##### istanbul-reports: 报告生成器。

将总结最终生成报告，图形界面或其他形式等
 
##### istanbul-lib-source-maps: 支持通过source map进行覆盖率信息映射。

##### test-exclude: nyc使用的include/exclude逻辑对应的实现库。

##### istanbul-api: istanbul高级别的的公共api。经过初步封装，主要用于给外部嵌入istanbul  
 - config
 - cover
 - reports
 - instrument
 - checkCoverage
 - createReporter
 - ... 
 
### 插桩方案：
**client端(browse)：** 因为要收集代码覆盖率数据，必须要让浏览器访问插桩后代码，所以浏览器端需要在运行前插桩，实现方式就是调用istanbul的instrument接口，这里分为自动和手动插桩两种方式。

*1. 自动插桩：*浏览器在发起请求时，server接受到请求被中间件拦截，插桩后返回插桩文件，这个中间件需要自己实现；istanbul-middware提供的则是createClientHandler接口   
*2. 手动插桩：*手动运行script命令进行插桩，一般用参数指定，比如--coverage true，则进行插桩；nyc则默认提供插桩，比如执行nyc npm run test

**server端（node）:** 由于istanbul为server端提供了require hook，所以server端可以在运行时插桩；istanbul-middleware提供的是hookLoader接口

### 统计代码覆盖率需要做到：
**client端(browse)：**  
1.发送插桩后代码给浏览器(im.createClientHandler)  
 - createClientHandler实现大致如下：

```
app.use(function (req, res, next) {
    if (isJSRequiringCoverage(req)) {
     	 //translate request to file name to be delivered
        var file = getFilePath(req);
        //use async for a real implementation
        var code = readTheCodeFromFile(file);
        var instrumenter = im.getInstrumenter();
        res.send(instrumenter.instrumentSync(code, file));
        //exception handling omitted for brevity
    } else {
        next();
    }
});
```
2.将收集到的代码覆盖率数据（window.__corvage__）通过/coverage/client(server端im.createHandler提供)发送给server端  
 
 - 可以通过setInterval方法，每隔2秒发送数据

 ```
 setInterval(function(){
    fetch('http://localhost:8888/coverage/client', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(window.__coverage__)
    }).then((response) => console.log(response.json()))
}, 2000);
 ``` 

3.汇总client和server端覆盖率数据，生成总结报告(由server端im.createHandler提供)  

**server端（node）:**  
1.hooking require(im.hookLoader)  
 - hookloader主要实现如下： 
 
 ```
 var transformer = (new Instrumenter()).instrumentSync.bind(instrumenter);
 hook.hookRequire(matcherFn, transformer, {
    verbose: opts.verbose,
    postLoadHook: function (file) {
        postLoadHookFn(file);
        saveBaseline(file);
    }
});
 ```
2.提供总结报告查看接口(im.createHandler)  
 - createHandler接口在内部起了一个express server，提供了/show、/reset、/download、/object、/client等接口  
3.提供总结报告重置接口，方便重新统计(im.createHandler)  
4.提供总结报告下载接口，方便用户下载(im.createHandler)  

### kapp vue工程实践尝试一

**Step1：** egg内置了egg-static提供静态资源服务，根据browse端插桩方案，我们应该在static服务前插入一个自定义istanbul中间件。如下： 

```
/*在egg-static middleware之前插入custom istanbul middleware*/
module.exports = app => {
    const index = app.config.coreMiddleware.indexOf('static');
    if(index === -1){
        app.config.coreMiddleware.unshift('istanbul');
    } else {
        app.config.coreMiddleware.splice(index, 0, 'istanbul');
    }
};
```

**Step2：** istanbul middleware收到请求后，需要先过滤出js，这里通过options提供一个matcher函数，作为过滤。如下： 

```
exports.istanbul = {
    matcher(path) {
        if(!path.startsWith('/public/')) {
            return false;
        }
        if(path.startsWith('/public/js/manifest.')) {
            return false;
        }
        if(path.startsWith('/public/js/vendor.')) {
            return false;
        }
        if (!/.js$/.test(path)) {
            return false;
        }
        return true;
    },
    root: path.resolve(process.cwd()),
    publicDir: path.resolve('/app/public')
};
```

**Step3：**非js文件直接next，交给static middleware，js则调用istanbul instrument返回插桩后代码。如下：

```
/*custom istanbul middleware*/
module.exports = options => {
    return async function createClientHandler(ctx, next) {
        /*if matcher*/
        /*if existsSync*/
        const file = await readFile();
        try {
            const instrumented = instrumenter.instrumentSync(file, fullPath);
            ctx.set('Content-Type', 'application/javascript');
            return ctx.body = instrumented;
        } catch (e) {
            console.warn('Error instrumenting file:' + fullPath);
            return next();
        }
    }
}
```

**Step4:**点击页面，收集到的数据将存在window.__coverage__下，需要将覆盖率数据发给另一个专门服务覆盖率数据呈现的server，这里采用每个2秒发送数据的方式。如下：

```
setInterval(() => {
    fetch('http://localhost:8888/coverage/client', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(window.__coverage__)
    }).then(response => console.log(response.json()));
}, 2000);
```

**Step5:**建立一个server，接受覆盖率数据，并提供数据呈现的接口。这里直接使用istanbul-middleware提供的createHandler接口。如下：

```
module.exports = {
    start: function (port, needCover) {
        var app = express();
        app.use('/coverage', coverage.createHandler({ verbose: true, resetOnGet: true }));
        ...
        app.listen(port);
    }
};
```

**Step6:**从工程应用发送数据到该Server可能会存在跨域问题，这里使用CORS方案去解决，改写istanbul-middleware createHandler接口，增加CORS跨域允许。如下：

```
app.all('*',function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
        res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
        if (req.method == 'OPTIONS') {
            res.send(200); /让options请求快速返回/
        } else {
            next();
        }
    });
```

**Note：**为了代码覆盖率的呈现效果，可以配置npm run build --coverage参数，进行打包特殊处理，比如：不进行压缩混淆，如下：

```
if(!process.env.npm_config_coverage) {
  webpackConfig.plugins.push(
    new UglifyJsPlugin(...),
  );
}
```

通过点击页面，呈现出来的覆盖率数据如下： 
![](https://haitao.nos.netease.com/a397eb70-4156-4673-8d2d-f422896c4137.jpg)
![](https://haitao.nos.netease.com/c40512f9-b644-4eb6-93a7-034b642ea53f.jpg)

**达到的效果：**  
通过点击页面可以收到代码执行情况，通过查看未执行到的代码，思考哪方面功能或模块缺少测试，进而从一定程度上提高代码质量。

**存在的问题：**。
1. 最直接的问题是，看到的是构建后代码，不够直观，个别情况下，从这些代码较难定位到源码。
2. 构建后存在大部分非源码的代码行，代码组织结构松散，查看起来存在困难

### kapp vue工程实践尝试二

**Q：** 构建后再执行插桩，覆盖率数据呈现不是特别友好，考虑能否对源码进行插桩？   
**A：** 思考了一下收集到的代码覆盖率到界面呈现的原理，方案是可行的    
**R：** 因为代码覆盖率数据只是记录了三部分数据和文件路径，而数据呈现只是将数据呈现在文件之上   
1. 记录了函数所在的行数，以及该函数执行的次数；  
2. 记录了语句所在的行数，以及该语句执行的次数；  
3. 记录了表达式所在的行数，以及表达式执行的次数；  
所以如果对源码进行插桩，收集到的覆盖率数据所在行数将是针对源码文件而言，同时数据呈现也是呈现源码文件。

**Step1:** 使用babel-plugin-istanbul插件，在babel解码js文件之前，就进行插桩操作。如下：

```
/*同样是通过npm run build --coverage参数控制是否进行插桩行为*/
const babelPluginIstanbul = process.env.npm_config_coverage ? { 
  plugins: ['istanbul'],
  presets: ['stage-2']
} : {};
...

{
    test: /\.js$/,
    loader: 'babel-loader',
    include: [...],
    options: babelPluginIstanbul
  },
```

**Note：** 由于vue-loader内置了一个babel-loader，所以仅仅在babel-loader上添加options是不够的，它将导致.vue代码中的js代码没有被插桩。这里可以直接在.babelrc文件中定义plugin，使插件运用到所有的babel上。如下： 

```
{
	"plugins": ["transform-runtime", istanbul]
}
```

**Step2:**每隔2秒发送覆盖率数据，同尝试一，后续步骤均同尝试一。

通过点击页面，呈现出来的覆盖率数据如下： 
![](https://haitao.nos.netease.com/15ebb89b-18f0-47be-9872-919522f2c73d.jpg)
![](https://haitao.nos.netease.com/5afeb2ec-69ce-429b-b61b-f8a082d91697.jpg)

**效果：**基本上达到了前端js代码覆盖率的自动收集和呈现，只是覆盖率数据如何只呈现分支差异是一个进一步更实用的功能，还需要后续通过git diff来做一些优化。

### 认为比较好的观点（他人评论） 
1. 最终覆盖率的服务形式不是单纯让测试人员看覆盖率报告，而是从覆盖率报告得到测试的推荐建议。
2. 没必要追求百分百的覆盖率，对于手工测试这种场景，覆盖率数据的价值是根据未覆盖内容结合对代码的解析，得出未覆盖的功能或流程，然后由团队根据实际需要补充相关的测试用例，避免遗漏。

### 参考文章 
[React Native 代码覆盖率获取探索 (一)](https://testerhome.com/topics/8230)  
[React Native 代码覆盖率获取探索 (二)](https://testerhome.com/topics/8919)

### 待进一步跟进的问题
1. 如何只统计分支差异
2. 总结报告不单单呈现代码覆盖率报告，能否给出测试建议或其他