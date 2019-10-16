# tapable

tapable是Webpack最核心的模块；  
webpack本质上是一种事件流的机制，它的工作流程就是把各个插件串联起来，其核心就是tapable；

### tapable暴露的主要模块

1. SyncHook  
2. SyncBailHook  
3. SyncWaterfallHook  
4. SyncLoopHook  
5. AsyncParallelHook  
6. AsyncParallelBailHook  
7. AsyncSeriesHook  
8. AsyncSeriesBailHook  
9. AsyncSeriesWaterfalllHook  

以上钩子分为同步[Sync]和异步[Async]，异步里分并行[Parallel]和串行[Series],同步中均为串行；  
以上暴露的模块分别为一个类，使用方式为实例化 => .tap注册事件 => .call触发事件；实例化时可通过参数传递数组，数组内存储事件处理函数调用时的参数。  

### SyncHook

串行同步执行，不关心事件处理函数的返回值

```
const { SyncHook } = require("tapable");
// 创建实例
let syncHook = new SyncHook(["name", "age"]);

// 注册事件
syncHook.tap("1", (name, age) => console.log("1", name, age));
syncHook.tap("2", (name, age) => console.log("2", name, age));

// 触发事件，让监听函数执行
syncHook.call("panda", 18);

// 1 panda 18
// 2 panda 18
```

一个简单的SyncHook类实现非常简单，可参照如下：

```
class SyncHook {
    constructor(args) {
        this.args = args;
        this.tasks = [];
    }
    tap(name, task) {
        this.tasks.push(task);
    }
    call(...args) {
        // 也可在参数不足时抛出异常
        if (args.length < this.args.length) throw new Error("参数不足");
        // 传入参数严格对应创建实例传入数组中的规定的参数，执行时多余的参数为 undefined
        args = args.slice(0, this.args.length);
        // 依次执行事件处理函数
        this.tasks.forEach(task => task(...args));
    }
}
```

### SyncBailHook

串行同步执行，事件处理函数有返回值则停止，即熔断保险

```
const { SyncBailHook } = require("tapable");

// 创建实例
let syncBailHook = new SyncBailHook(["name", "age"]);

// 注册事件
syncBailHook.tap("1", (name, age) => console.log("1", name, age));
syncBailHook.tap("2", (name, age) => {
    console.log("2", name, age);
    return "2";
});

syncBailHook.tap("3", (name, age) => console.log("3", name, age));

// 触发事件，让监听函数执行
syncBailHook.call("panda", 18);

// 1 panda 18
// 2 panda 18
```

一个简单的 SyncBailHook 类实现非常简单，可参照如下：

```
class SyncBailHook {
    constructor(args) {
        this.args = args;
        this.tasks = [];
    }
    tap(name, task) {
        this.tasks.push(task);
    }
    call(...args) {
        if (args.length < this.args.length) throw new Error("参数不足");
        args = args.slice(0, this.args.length);
        // 依次执行事件处理函数
        this.tasks.some(task => task(...args));
    }
}
```

### SyncWaterfallHook

串行同步执行，上一个事件处理函数的返回值作为参数传递给下一个事件处理函数  
.call返回值为最后一个事件处理程序的返回值  

```
const { SyncWaterfallHook } = require("tapable");

// 创建实例
let syncWaterfallHook = new SyncWaterfallHook(["name", "age"]);

// 注册事件
syncWaterfallHook.tap("1", (name, age) => {
    console.log("1", name, age);
    return "1";
});
syncWaterfallHook.tap("2", data => {
    console.log("2", data);
    return "2";
});

// 触发事件，让监听函数执行
let ret = syncWaterfallHook.call("panda", 18);
console.log("call", ret);

// 1 panda 18
// 2 1
// call 2
```

一个简单的 SyncWaterfallHook 类实现非常简单，可参照如下：

```
class SyncWaterfallHook {
    constructor(args) {
        this.args = args;
        this.tasks = [];
    }
    tap(name, task) {
        this.tasks.push(task);
    }
    call(...args) {
        if (args.length < this.args.length) throw new Error("参数不足");
        args = args.slice(0, this.args.length);

        let [first, ...others] = this.tasks;
        // 依次执行事件处理函数
        return others.reduce((result, task) => task(result), first(...args));
    }
}
```

### SyncLoopHook

串行同步执行，事件处理函数有返回值则继续循环当前事件处理函数

```
const { SyncLoopHook } = require("tapable");

// 创建实例
let syncLoopHook = new SyncLoopHook(["name", "age"]);

let total1 = 1;
let total2 = 1;
// 注册事件
syncLoopHook.tap("1", (name, age) => {
    console.log("1", name, age, total1);
    return total1++ < 2 ? true : undefined;
});
syncLoopHook.tap("2", (name, age) => {
    console.log("2", name, age, total2);
    return total2++ < 2 ? true : undefined;
});

// 触发事件，让监听函数执行
syncLoopHook.call("panda", 18);

// 1 panda 18 1
// 1 panda 18 2
// 2 panda 18 1
// 2 panda 18 2
```

一个简单的 SyncLoopHook 类实现非常简单，可参照如下：

```
class SyncLoopHook {
    constructor(args) {
        this.args = args;
        this.tasks = [];
    }
    tap(name, task) {
        this.tasks.push(task);
    }
    call(...args) {
        if (args.length < this.args.length) throw new Error("参数不足");
        args = args.slice(0, this.args.length);

        // 死循环保护
        let execCount = 0;
        let maxCount = 1000;
        // 依次执行事件处理函数
        this.tasks.forEach(task => {
            let result;
            do {
                result = task(...args);
                execCount++;
                if(execCount > maxCount) {
                    throw new Error("可能存在死循环");
                    result = undefined;
                }
            } while(result !== undefined)
        });
    }
}
```

### Async类钩子

Sync类钩子只能用.tap注册事件，而Async类事件则可以使用.tap, .tapAsync, .tapPromise注册事件，然后分别通过.call, .callAsync, .promise方法调用

### AsyncParallelHook

异步串形执行，如果多个异步函数的执行时间最长为3s，则总执行时间大约也在3s【并行】；

#####  tapAsync/callAsync

tapAsync可以注册异步事件，通过.callAsync触发事件，并在所有异步事件执行完毕后执行回调函数；  
通过.tapAsync注册的事件处理函数最后一个参数永远为done，每个事件处理函数在异步代码执行完后调用done函数，可以保证.callAsync可以在所有异步函数完成之后执行回调；

```
const { AsyncParallelHook } = require("tapable");

// 创建实例
let asyncParallelHook = new AsyncParallelHook(["name", "age"]);

// 注册事件
console.time("time");
asyncParallelHook.tapAsync("1", (name, age, done) => {
    settimeout(() => {
        console.log("1", name, age);
        done();
    }, 2000);
});

asyncParallelHook.tapAsync("2", (name, age, done) => {
    settimeout(() => {
        console.log("2", name, age);
        done();
        console.timeEnd('time');
    }, 3000);
});

// 触发事件，让监听函数执行
asyncParallelHook.callAsync("panda", 18, () => {
    console.log("complete");
});

// 1 panda 18
// 2 panda 18
// complete
// time: 3005.060ms
```

一个简单的AsyncParallelHook tapAsync/callAsync实现如下：

```
class AsyncParallelHook {
    constructor(args) {
        this.args = args;
        this.tasks = [];
    }
    tapAsync(name, task) {
        this.tasks.push(task);
    }
    callAsync(...args) {
        const callback = args.pop();
        if (args.length < this.args.length) throw new Error("参数不足");
        args = args.slice(0, this.args.length);

        let finished = 0;
        const done = () => {
            if(++finished == this.tasks.length) {
                callback();
            }
        }
        this.tasks.forEach(task => task(...arg, done));
    }
}
```

##### tapPromise/promise

tapPromise可以注册返回 Promise 实例的事件【必须】， 通过.promise触发事件，并在所有异步事件执行完毕后通过.then执行回调函数  

```
const { AsyncParallelHook } = require("tapable");

// 创建实例
let asyncParallelHook = new AsyncParallelHook(["name", "age"]);

// 注册事件
console.time("time");
asyncParallelHook.tapPromise("1", (name, age) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("1", name, age);
            resolve("1");
        }, 2000);
    });
});

asyncParallelHook.tapPromise("2", (name, age) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("2", name, age);
            resolve("2");
            console.timeEnd("time");
        }, 3000);
    });
});

// 触发事件，让监听函数执行
asyncParallelHook.promise("panda", 18).then(ret => {
    console.log(ret);
});

// 1 panda 18
// 2 panda 18
// time: 3006.542ms
// [ '1', '2' ]
```

一个简单的AsyncParallelHook tapPromise/promise实现如下：

```
class AsyncParallelHook {
    constructor(args) {
        this.args = args;
        this.tasks = [];
    }
    tapPromise(name, task) {
        this.tasks.push(task);
    }
    promise(...args) {
        if (args.length < this.args.length) throw new Error("参数不足");
        args = args.slice(0, this.args.length);

        // 将所有事件处理函数转换成 Promise 实例，并发执行所有的 Promise
        return Promise.all(this.tasks.map(task => task(...args)));
    }
}
```

### AsyncSeriesHook

异步串行，同样包括tapAsync/callAsync和tapPromise/promise，异步并行的区别在于，异步串形如果存在n个最大时间为3s的异步处理事件，则总处理时间可能会达到3*n秒，因为串行;  
通过.tapAsync注册的事件处理函数最后一个参数永远为next，每个事件处理函数在异步代码执行完后调用next函数，可以保证.callAsync可以在所有异步函数完成之后执行回调；

##### tapAsync/callAsync

```
const { AsyncSeriesHook } = require("tapable");

// 创建实例
let asyncSeriesHook = new AsyncSeriesHook(["name", "age"]);

// 注册事件
console.time("time");
asyncSeriesHook.tapAsync("1", (name, age, next) => {
    settimeout(() => {
        console.log("1", name, age);
        next();
    }, 2000);
});
asyncSeriesHook.tapAsync("2", (name, age, next) => {
    settimeout(() => {
        console.log("2", name, age);
        next();
    }, 3000);
});

// 触发事件，让监听函数执行
asyncSeriesHook.callAsync("panda", 18, () => {
    console.log("complete");
});

// 1 panda 18
// 2 panda 18
// complete
// time: 5008.790ms
```

关键实现如下： 

```
callAsync(...args) {
    const callback = args.pop();
    args = args.slice(0, this.args.length);
    
    let i = 0;
    let next = () => {
        let task = this.tasks[i++];
        task ? task(...args, next) : callback();
    };
    next();
    }
}
```

##### tapPromise/promise

同理，可以自行思考一下异步串形的tapPromise/promise，实现方式为通过reduce和promise.then把事件处理函数串起来；

### AsyncParallelBailHook | AsyncSeriesBailHook | AsyncSeriesWaterfalllHook  

异步并行熔断 | 异步串形熔断 | 异步串形瀑布 同样参考以上，自行思考一下区别以及实现