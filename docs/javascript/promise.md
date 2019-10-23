### promises/A+

[原文](https://promisesaplus.com)  
[译文](https://www.ituring.com.cn/article/66566)

#### 一、专业术语

1.1 “promise”是一个带有then方法的对象或函数，遵从了以下标准  
1.2 “thenable”是定义了then方法的对象或函数  
1.3 “value”是任何合法的javascript值（包括undefined、thenable或promise）  
1.4 “exception”是一个通过throw语句抛出的值  
1.5 “reason”是一个表明promises为什么失败的值

#### 二、规定

##### 2.1 Promise 状态

promise 必须是以下三种状态之一， pending、fulfilled、rejected

2.1.1 当pending时  
 - 2.1.1.1 promise可能转变为fulfilled或rejected  

2.1.2 当fulfilled时  
 - 2.1.2.1 promise不能转变为其他任何状态  
 - 2.1.2.2 promise必须有一个value，且不能变化  

2.1.3 当rejected时  
 - 2.1.3.1 promise不能转变为其他任何状态  
 - 2.1.3.2 promise必须有一个reason，且不能变化  

##### 2.2 then方法

promise必须提供then方法去存取它当前或最终的value或reason  
then方法接收两个参数onFulfilled，onRejected

2.2.1 onFulfilled，onRejected均为可选参数  
 - 2.2.1.1 如果onFulfilled不是函数，则它将被忽略  
 - 2.2.1.2 如果onRejected不是函数，则它将被忽略  

2.2.2 如果onFulfilled是一个函数  
 - 2.2.2.1 它必须在promise状态转变为fulfilled时被调用，同时promise的value将作为它的第一个参数  
 - 2.2.2.2 它在promise状态转变为fulfilled之前肯定不能被调用  
 - 2.2.2.3 它只能被调用一次

2.2.3 如果onRejected是一个函数  
 - 2.2.3.1 它必须在promise状态转变为rejected时被调用，同时promise的reason将作为它的第一个参数  
 - 2.2.3.2 它在promise状态转变为rejected之前肯定不能被调用  
 - 2.2.3.3 它只能被调用一次

2.2.4 onFulfilled，onRejected只能在“execution context stack”只包含平台代码时被调用[3.1]

2.2.5 onFulfilled，onRejected只能被作为函数调用，没有this[3.2]

2.2.6 then方法可以在同一个promise上被多次调用  
 - 2.2.6.1 当promise状态为fulfilled时，所有onFulfilled回调将以最初then方法注册的顺序依次执行  
 - 2.2.6.2 当promise状态为rejected时，所有onRejected回调将以最初then方法注册的顺序依次执行  

2.2.7 then方法必须返回一个promise[3.3]  
promise2 = promise1.then(onFulfilled, onRejected);  
 - 2.2.7.1 如果onFulfilled或onRejected返回一个value x，则执行promise处理程序 [[Resolve]](promise2, x)  
 - 2.2.7.2 如果onFulfilled或onRejected抛出一个异常e，promise2将转变为rejuected，同时e将作为rejected的原因  
 - 2.2.7.3 如果onFulfilled不是一个函数，但是promise1状态转换为fulfilled；promise2也将转化为fulfilled，并且具备和promise1相同的value  
 - 2.2.7.4 如果onRejected不是一个函数，但是promise1状态转换为rejected；promise2也将转化为rejected，并且具备和promise1相同的reason  

##### 2.3 promise处理程序 [[Resolve]](promise, x)

promise处理程序是一个抽象的运算，它接收promise和一个value作为入参，表现为[[Resolve]](promise, x)；  
如果x是一个thenable，该程序将假设x行为类似于Promise，然后尝试让promise接收x的状态；  
如果x不是一个thenable，promise将转换为fulfilled，并且具备value x；  

2.3.1 如果promise和x指向同一个对象，reject promise，同时抛出TypeError作为reason  

2.3.2 如果x是一个promise，接收x的状态[3.4]  
 - 2.3.2.1 如果x的状态为pending，promise将保持pending，直到x转变为fulfilled或rejected  
 - 2.3.2.2 如果x的状态为fulfilled，promise将转变为fulfilled，同时拥有和x相同的value  
 - 2.3.2.3 如果x的状态为rejected，promise将转变为rejected，同时拥有和x相同的reason  

2.3.3 如果x是一个对象或函数  
 - 参见[promises/A+](https://promisesaplus.com)规范，过于复杂  

2.3.4 如果x不是一个对象或函数。fulfill promise with x。  

##### 三、笔记

3.1-3.5 参见[promises/A+](https://promisesaplus.com)


### promise简略实现

#### promise构造函数

```
function Promise (fn) {
  // promise 状态变量
  // 0 - pending
  // 1 - resolved
  // 2 - rejected
  this._state = 0;
  // promise 执行结果
  this._value = null;
 
  // then(..) 注册回调处理数组
  this._deferreds = [];

  // 立即执行 fn 函数
  try {
    fn(value => {
      resolve(this, value);
    },reason => {
      reject(this, reason);
    })
  } catch (err) {
    // 处理执行 fn 异常
    reject(this, err);
  }
}
```

#### then方法

```
Promise.prototype.then = function (onResolved, onRejected) {

  var res = new Promise(function () {});
  // 使用 onResolved，onRejected 实例化处理对象 Handler
  var deferred = new Handler(onResolved, onRejected, res);

  // 当前状态为 pendding，存储延迟处理对象
  if (this._state === 0) {
    this._deferreds.push(deferred);
    return res;
  }

  // 当前 promise 状态不为 pending
  // 调用 handleResolved 执行onResolved或onRejected回调
  handleResolved(this, deferred);
  
  // 返回新 promise 对象，维持链式调用
  return res;
};

function Handler (onResolved, onRejected, promise) {
  this.onResolved = typeof onResolved === 'function' ? onResolved : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.promise = promise;
}
```

#### resolve函数

```
function resolve (promise, value) {
  // 非 pending 状态不可变
  if (promise._state !== 0) return;
  
  // promise 和 value 指向同一对象
  // 对应 Promise A+ 规范 2.3.1
  if (value === promise) {
    return reject( promise, new TypeError('A promise cannot be resolved with itself.') );
  }
  
  // 如果 value 为 Promise，则使 promise 接受 value 的状态
  // 对应 Promise A+ 规范 2.3.2
  if (value && value instanceof Promise && value.then === promise.then) {
    var deferreds = promise._deferreds
    
    if (value._state === 0) {
      // value 为 pending 状态
      // 将 promise._deferreds 传递 value._deferreds
      // 对应 Promise A+ 规范 2.3.2.1
      value._deferreds.push(...deferreds)
    } else if (deferreds.length !== 0) {
      // value 为 非pending 状态
      // 使用 value 作为当前 promise，执行 then 注册回调处理
      // 对应 Promise A+ 规范 2.3.2.2、2.3.2.3
      for (var i = 0; i < deferreds.length; i++) {
        handleResolved(value, deferreds[i]);
      }
      // 清空 then 注册回调处理数组
      value._deferreds = [];
    }
    return;
  }

  // value 是对象或函数
  // 对应 Promise A+ 规范 2.3.3
  if (value && (typeof value === 'object' || typeof value === 'function')) {
    try {
      // 对应 Promise A+ 规范 2.3.3.1
      var then = obj.then;
    } catch (err) {
      // 对应 Promise A+ 规范 2.3.3.2
      return reject(promise, err);
    }

    // 如果 then 是函数，将 value 作为函数的作用域 this 调用之
    // 对应 Promise A+ 规范 2.3.3.3
    if (typeof then === 'function') {
      try {
        // 执行 then 函数
        then.call(value, function (value) {
          resolve(promise, value);
        }, function (reason) {
          reject(promise, reason);
        })
      } catch (err) {
        reject(promise, err);
      }
      return;
    }
  }
  
  // 改变 promise 内部状态为 `resolved`
  // 对应 Promise A+ 规范 2.3.3.4、2.3.4
  promise._state = 1;
  promise._value = value;

  // promise 存在 then 注册回调函数
  if (promise._deferreds.length !== 0) {
    for (var i = 0; i < promise._deferreds.length; i++) {
      handleResolved(promise, promise._deferreds[i]);
    }
    // 清空 then 注册回调处理数组
    promise._deferreds = [];
  }
}
```

#### reject函数

```
function reject (promise, reason) {
  // 非 pending 状态不可变
  if (promise._state !== 0) return;

  // 改变 promise 内部状态为 `rejected`
  promise._state = 2;
  promise._value = reason;

  // 判断是否存在 then(..) 注册回调处理
  if (promise._deferreds.length !== 0) {
    // 异步执行回调函数
    for (var i = 0; i < promise._deferreds.length; i++) {
      handleResolved(promise, promise._deferreds[i]);
    }
    promise._deferreds = [];
  }
}
```

#### handleResolve函数

```
function handleResolved (promise, deferred) {
  // 异步执行注册回调
  asyncFn(function () {
    var cb = promise._state === 1 ? 
            deferred.onResolved : deferred.onRejected;

    // 传递注册回调函数为空情况
    if (cb === null) {
      if (promise._state === 1) {
        resolve(deferred.promise, promise._value);
      } else {
        reject(deferred.promise, promise._value);
      }
      return;
    }

    // 执行注册回调操作
    try {
      var res = cb(promise._value);
    } catch (err) {
      reject(deferred.promise, err);
    }

    // 处理链式 then(..) 注册处理函数调用
    resolve(deferred.promise, res);
  });
}
```