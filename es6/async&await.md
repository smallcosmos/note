### async & await

一、AsyncFunction

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
性能：后者比前者更搞笑，因为第二种方式中异步函数是与其他代码一起被解释器解析的，而第一种方式的函数体是单独解析的。

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

二、参考

[AsyncFunction](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction)