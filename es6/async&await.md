### async & await

##### 一、AsyncFunction

作用：用来创建新的 异步函数 对象，JavaScript 中每个异步函数都是  AsyncFunction 的对象

获取：非全局对象，需要通过以下方式获取：

```
Object.getPrototypeOf(async function(){}).constructor
```

语法： new AsyncFunction([arg1[, arg2[, ...argN]],] functionBody)

functionBody   
一段字符串形式的 JavaScript 语句，这些语句组成了新函数的定义。

创建异步函数方式：  
1、 直接使用AsyncFunction构造函数创建异步函数对象  
2、 用 异步函数表达式【async】 定义一个异步函数，然后再调用其来创建 异步函数 对象  
性能：后者比前者更高效，因为第二种方式中异步函数是与其他代码一起被解释器解析的，而第一种方式的函数体是单独解析的。

通过 AsyncFunction 构造器创建一个异步函数

```
function resolveAfter2Seconds(x) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(x);
    }, 2000);
  });
}

var AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
var a = new AsyncFunction('a', 'b', 'return await resolveAfter2Seconds(a) + await resolveAfter2Seconds(b);');

// 同以下async定义
var a = async function() {
    return await resolveAfter2Seconds(a) + await resolveAfter2Seconds(b);
}

a(10, 20).then(v => {
  console.log(v); // 4 秒后打印 30
});
```

async 用来定义一个返回AsyncFunction对象的异步函数
```
const a = async () => {};
const b = Object.getPrototypeOf(async function(){}).constructor;
a instanceof b; 
// true [b = ƒ AsyncFunction() { [native code] }]
```

##### 二、参考

[AsyncFunction](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction)

##### await

await操作符用于等待一个Promise 对象。它只能在异步函数 async function 中使用.

await 表达式会暂停当前 async function 的执行，等待 Promise 处理完成。若 Promise 正常处理(fulfilled)，其回调的resolve函数参数作为 await 表达式的值，继续执行 async function。

若 Promise 处理异常(rejected)，await 表达式会把 Promise 的异常原因抛出。

另外，如果 await 操作符后的表达式的值不是一个 Promise，则返回该值本身。

##### 为什么说async/await是generator的语法糖

将 async/await 使用 generator 进行改写的关键是要使用 promise 来实现一个 generator 自执行器。在babel中，大体的原理也是类似的。

```
let test = function () {
  // ret 为一个Promise对象，因为ES6语法规定 async 函数的返回值必须是一个 promise 对象
  let ret = _asyncToGenerator(function* () {
      return yield sleep(1000);
    }
  });
  return ret;
}();

// generator 自执行器，类似co，参考generator.md【co实现自动迭代】
function _asyncToGenerator(fn) {
    // ...
}
```

### async优点

1、内置执行器

Generator 函数的执行必须靠执行器，所以才有了 co 函数库，而 async 函数自带执行器

2、更好的语义

比起星号和yield，async/await语义更清晰；async表示函数里有异步操作，而await表示后面的表达式需要等待结果

3、更广的适用性

 co 函数库约定，yield 命令后面只能是 Thunk 函数或 Promise 对象，而 await 命令后面，可以跟 Promise 对象和原始类型的值（数值、字符串和布尔值，但这时等同于同步操作