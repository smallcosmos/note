# node端覆盖率统计

### server端覆盖率统计原理

如果对前端覆盖率统计还没有概念，需要先去看看[前端覆盖率统计总结]（此处没有链接，没有上传）  
node端覆盖率统计的最基本原理就是在node代码入口，对require做hook，返回istanbul插完桩的代码，即动态插桩；

先来剖析一下istanbul-middleware提供的hookloader是如何做的；
这里省略了一些无关的代码和扩展的功能代码

```
var istanbul = require('istanbul')；
var Instrumenter = istanbul.Instrumenter;
var hook = istanbul.hook;

function hookLoader(matcherOrRoot, opts) {
    var matcherFn,
        transformer,

    if (typeof matcherOrRoot === 'function') {
        matcherFn = matcherOrRoot;
    } else if (typeof matcherOrRoot === 'string') {
        matcherFn = getRootMatcher(matcherOrRoot);
    } else {
        throw new Error('Argument was not a function or string');
    }

    instrumenter = new Instrumenter(opts);
    transformer = instrumenter.instrumentSync.bind(instrumenter);

    hook.hookRequire(matcherFn, transformer, {
        verbose: opts.verbose
    });
}
```

hookloader接收两个参数，一个是match，一个是options;  

match函数用来匹配require的目标是否是需要插桩的目标；因为我们一旦对入口的require做了hook之后，是不希望所有文件都插桩的，一方面我们有我们的覆盖率统计目标，另一方面如果对大量的第三方代码做插桩容易引起性能问题；

这个match参数传入的如果是个函数，将通过执行函数，获取true和false来决定是否执行代码插桩；
如果传入的是字符串，hookRequire将会把require的目标和该字符串做匹配，只有匹配上的目标才会被插桩，同时istanbul-middleware默认排除了node_modules相关的目标；
这个getRootMatcher函数如下（我们完全可以自定义改写）：

```
function getRootMatcher(root) {
    return function (file) {
        if (file.indexOf(root) !== 0) { return false; }
        file = file.substring(root.length);
        if (file.indexOf('node_modules') >= 0) { return false; }
        return true;
    };
}
```

有了匹配函数以后剩下的就是插桩了，istanbul-middleware调用的是istanbul暴露的的hookRequire方法，该方法接受了上述的match匹配规则和transformer插桩函数在内部调用，先执行match,一旦符合规则，就调用transformer;

而istanbul-middleware提供的tranformer还是istanbul暴露的instrumentSync方法，即instrument的同步方法，为什么采用同步方法其实原因很清晰，因为commonjs模块加载require是同步操作，hookRequire不会也不允许返回一个异步结果，异步转换在内部将会报错（见下面hookRequire代码片段里的注释）

到这里其实原理很清晰了  

![](https://haitao.nos.netease.com/f79631cb-5cab-469d-9790-a96f68f20509_695_401.jpg)

### 实践中遇到的问题

1. 基于egg框架定制的上层框架kapp的入口require在哪里？
2. istanbul的instrumentSync无法对ES6代码进行兼容插桩

##### 问题一： 基于egg框架定制的上层框架的入口require在哪里？

我们的目标是对配置文件，中间件，插件，controller, service, extend扩展等目标进行插桩，但是仔细一想，这些文件都是在egg-core的Agent类的实例化过程中分阶段加载的；这些地方我们不太方便执行hookloader；

再整理一下egg启动流程: egg-script => app.framework.startCulter => egg-cluster => egg-core

会发现我们可以在app指定startCluster为egg-cluster时，执行我们的hookloader, 这里也是我们的app最先执行的语句；这个节点会有比较基础但是却有难以解决的问题，比如这个节点无法拿到env， 进而无法根据env启用hookloader

如果觉得这个节点太早了话，egg Agent类其实还提供了几个生命周期钩子可以考虑（找准时序节点很重要），详见egg官网开发文档

##### 问题二： istanbul的instrumentSync无法对ES6代码进行兼容插桩

要解决这个问题思路很简单，先将es6代码经过babel.transform转换后，再传递通过hookloader；但是这样会丢失行信息，也就是说，原来的第N行ES6代码，经过babel.transform后，可能变成了第N+M行，再经过hookloader统计出来的数据后，会变成N+M行被覆盖，而非原ES6代码的行数；

要进一步解决这个问题，其实思路来源于浏览器端代码统计的解决方案，即babel-plugin-istanbul; 简单的说，就是在进行babel.transform的同时，将babel-plugin-istanbul作为插件传递给babel, 这个插件会将行的映射关系维护起来；

所以我们要做的hookloader还是不变, 只不过换一个transformer

原transformer: istanbul.instrumentSync(sourceCode, filename, sourceMap)  

兼容ES6插桩的transformer: 

```
const babelPluginIstanbul = require('babel-plugin-istanbul');
const getTransformer = () => {
	return (sourceCode, filename, sourceMap) => {
	    return babel.transform(sourceCode, {
	        filename,
	        plugins: [
	            [babelPluginIstanbul.default, {
	                inputSourceMap: sourceMap
	            }]
	        ]
	    }).code
	}
}
const transformer = getTransformer();
```

其实仔细一想，插桩的实现在浏览器端和node端原理是一样的，babel-loader底层掉哟过的也就是这些方法，只不过node端是换成了node端的写法；

### 思考问题

Q: istanbul的hookRequire是如何做到对require做改造的

A: 要做到这一点，首先要对CommonJs的require有一定的了解，抛开require的其他实现机制，单单讲一下require的加载原理就能很好的理解这个问题；

要知道CommonJs的模块加载原理实际上都是通过闭包实现的; 当我们require加载一个模块的时候实际上是执行了这个闭包，然后才能得到这个模块的module.exports；

```
(function(exports,require,Module,__filename,__dirname){
  module.exports = exports = this = {}
  //文件中的所有代码
  return module.exports
})
```

除此之外，Module上还维护了一个加载策略Module._extensions;它的作用就是用来处理加载不同类型模块的时候做对应的处理；

比如说：  
1. 加载.js的javascript脚本，则读入内存然后执行  
2. 加载.json的JSON文件，则通过fs模块读入内存，转化成JSON对象  
3. 加载.node文件可以直接使用等等  

这个加载策略维护如下： 

```
Module._extensions = {
  '.js': function(module){
    //每个文件的加载逻辑不一样
  },
  '.json': function(module){
  },
  '.node': 'xxx',
}
```

讲到这里其实很清楚了，istanbul的hookRequire就是改写了Module._extensions的.js后缀的加载策略

```
function hookRequire(matcher, transformer, options) {
	var fn = transformFn(matcher, transformer, options.verbose),
	Module._extensions['.js'] = function (module, filename) {
		//此处如果transformFn采用异步的话，ret将会是Promise, 在调用module._compile时将会报错
	    var ret = fn(fs.readFileSync(filename, 'utf8'), filename);
	    if (ret.changed) {
	        module._compile(ret.code, filename);
	    } else {
	        originalLoaders[ext](module, filename);
	    }
	};
}
```
