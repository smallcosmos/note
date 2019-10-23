### 生成器对象Generator

生成器对象是由一个 generator function[function*]返回的,并且它符合[可迭代协议和迭代器协议](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Iteration_protocols#iterable),参见Iterator.md

generator function不同于promise，promise是利用现有javascript和promises/A+规范实现的一套异步方式，而generator function是一套新的底层机制，可以随心所欲的交出和恢复函数的执行权，其中yield交出执行权，next()恢复执行权。  
调用一个generator函数并不会立即执行它，而是返回一个generator对象；然后每一次的next调用都将会执行函数，直到遇到下一个yield，交出执行权并挂起；

##### 方法

1. Generator.prototype.next()

返回一个包含属性 done 和 value 的对象。该方法也可以通过接受一个参数用以向生成器传值[第一次调用传值将不会生效]

2. Generator.prototype.return()

返回给定的值并结束生成器

3. Generator.prototype.throw()

向生成器抛出异常，并恢复生成器的执行，返回带有 done 及 value 两个属性的对象

##### yield优先级

yield优先级仅高于展开运算符[...]和逗号运算符[,]

##### Demo

```
/** gen函数运行解析：
 * i=0 时传入参数(0)，并将参数0赋给上一句yield的返回赋值，由于没有上一句yield语句，这步被忽略
 * 执行var val =100，然后执行yield val，此时g.next(i)返回{ value: 100, done: false }
 * 然后console.log(i,g.next(i).value)，打印出0 100
 *
 * i=1 时传入参数(1)，并将参数1赋给上一句yield的返回赋值,即(val = 1)
 * 然后执行console.log(val)，打印出1。
 * 接着进入第二次while循环，调用yield val，此时g.next(i)返回{ value: 1, done: false }
 * 然后console.log(i,g.next(i).value)，打印出1 1
 *
 * i=2 ....(省略)
 */
function* gen() {
   var val =100;
   while(true) {
      val = yield val;
      console.log(val);
   }
}

var g = gen();
for(let i =0;i<5;i++){
   console.log(i,g.next(i).value);
}

// 返回：
//  0 100
//  1
//  1 1
//  2
//  2 2
//  3
//  3 3
//  4
//  4 4
```

### co实现自动迭代

```
function co(it) {
    return new Promise(function (resolve, reject) {
        function step(d) {
            let { value, done } = it.next(d);
            if (!done) {
                value.then(function (data) {
                    step(data)
                }, reject)
            } else {
                resolve(value);
            }
        }
        step();
    });
}

co(fn()).then(function (data) {
    console.log(data)
})
```