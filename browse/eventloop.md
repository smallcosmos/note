# Event Loops

[事件循环规范](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)  
[node.js Event Loop](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)

### chrome浏览器进程

1、Browse进程：浏览器的主进程，负责协调管理  
2、第三方插件进程  
3、GPU进程  
4、Render进程：拥有多个线程，GUI渲染线程、JavaScript引擎线程、事件触发线程、定时器线程、异步请求线程  

### 调用栈

存储有关正在运行的子程序的消息的栈；  
在调用任何子程序时，主程序都必须暂存子程序运行完毕后应该返回到的地址，因此需要调用栈来存储相关信息，遵循后进先出的原则。

### WebAPI

JavaScript引擎将代码从头执行到尾，不断的进行压栈和出栈操作。除了ECMAScript语法组成的代码之外，还有三种WebAPI：

异步请求  
定时器  
DOM事件  

在执行以上三种WebAPI时，JavaScript引擎是无法将其押入调用栈的，因为JavaScript引擎无法原地等待，因此必须另开线程来处理，它们分别是异步HTTP请求线程，定时器线程、事件触发线程；  

### 任务队列

以上WebAPI的线程处理完之后的回调仍需要JavaScript引擎来执行，它们之间通过任务队列（TaskQueue）来通信。任务队列遵从先进先出的原则。同时不同的任务有不同的优先级，分为宏任务(Macro task)和微任务(Micro task)，遵循一套事件循环的机制不断循环进行。  

任务的优先级取决于任务源，即任务从哪里来，不同任务源的任务会放入不同的任务队列中，浏览器根据任务源的优先级决定先取哪个队列的任务执行

**任务源：**任务源在标准中用于分离逻辑上不同类型的任务，任务队列用于合并给定事件循环中的任务源。  
例如，用户代理可以有一个用于鼠标和键事件的任务队列（与用户交互任务源关联）和另一个任务队列（与所有其他任务源关联）。然后，使用事件循环处理模型的初始步骤中授予的自由度，它可以在四分之三的时间内给予键盘和鼠标事件相对于其他任务的优先权，保持界面响应，但不会使其他任务队列感到饥饿。

### 事件循环

事件循环分为窗口【window】事件循环和工作【worker】事件循环，规范如下：  
A window event loop is the event loop used by similar-origin window agents. User agents may share an event loop across similar-origin window agents.  
A worklet event loop is the event loop used by worklet agents.  

事件循环有一个或多个任务队列，一个任务队列是一系列任务的集合。  
**注意点：**其中任务队列的是多个集合，而不是多个队列，因为事件循环处理模型的第一步是从选中的队列中抓取第一个可运行的任务，而不是将第一个任务从队列中拿出【不是先进先出的行为】。
**注意点：**微任务队列不属于任务队列

任务概括的算法为以下工作负责：  
1. Events: 一个专门指定的任务经常用来处理在特殊事件目标上派发事件  
2. Parsing: html解析器标记一个或多个字节，然后处理任何生成的标记，通常是一项任务  
3. Callbacks: 一个专门指定的任务经常用来处理唤起回调  
4. Using a resource: 当一个算法获取一个资源时，如果获取是以非阻塞的方式进行的，那么一旦部分或全部资源可用，资源的处理就由一个任务执行  
5. Reacting to DOM manipulation: 有些元素具有响应于dom操作而触发的任务，例如当该元素插入到文档中时

只要事件循环存在,它将连续运行以下步骤：  
1. 选择至少包含一个可运行的任务的任务队列，使其成为事件循环的任务队列之一；如果没有这样的任务队列，则跳到下面的microtasks步骤  
**注意：**微任务队列不是任务队列，因此在此步骤将不会选中它
2. 让任务队列中的第一个可运行任务成为oldesttask，并将其从任务队列中移除  
3. 通过以下步骤报告不再执行此循环的持续时间：  
 - 将此次事件循环开始时间记录为当前高解析度时间  
 - 如果设置了事件循环结束，则让顶级[top-level]浏览上下文成为与事件循环关联的所有文档对象的所有顶级浏览上下文的集合。报告长任务、传入事件循环结束、事件循环开始和顶级浏览上下文。  
4. 将事件循环当前正在运行的任务设置为oldesttask  
5. 执行oldesttask的步骤  
6. 将事件循环当前正在运行的任务充值为null  
7. 微任务：执行微任务检查点【见下文微任务检查点】  
8. 记录当前高解析度时间为now  
9. 报告任务持续时间  
10. 更新渲染，策略过于复杂，详见规范
11. 如果这是一个窗口【window】事件循环并且以下条件都成立，则对每个浏览上下文，执行start an idle period算法中的步骤，传递与该浏览上下文关联的窗口【请求空闲回调】   
 - 事件循环的任务队列中没有文档处于完全活动状态的任务  
 - 事件循环的微任务队列为空  
 - 所有的浏览上下文都没有渲染的机会  
12. 报告“更新渲染”步骤的持续时间  
13. 如果这是一个工作【worker】事件循环，则执行一列工作事件循环相关操作【详见规范】  
14. 记录此次事件循环结束事件为当前高解析度时间  

当事件循环要执行 微任务检查点 时：  
1. 如果事件循环正在执行微任务检查点为true，则返回  
2. 将执行微任务检查点的事件循环设置为true  
3. 当事件循环的微任务队列不为空时：  
 - 事件循环的微任务队列中出列的微任务成为oldestMicrotask  
 - 将事件循环当前正在运行的任务设置为oldestMicrotask  
 - 运行oldestMicrotask  
 - 将事件循环当前正在运行的任务设置回空  
4. 复杂的通知机制【详见规范】  
5. 清理索引数据库事务  
6. 将执行微任务检查点的事件循环设置为false  

**事件循环机制的简单总结**  
1. 选择一个宏任务执行  
2. 执行微任务检查，清空微任务队列  
3. 更新渲染  
4. 重复步骤1  

一般来说，js脚本执行完之后会立即清空一次微任务，有种说法认为js脚本也被认为是一个最初的宏任务【可以这么简单去理解】；也有说法认为当前执行栈执行完毕时会立刻先处理所有微任务队列中的事件【该说法更符合规范，因为规范中并没有提到js脚本会被放到任务队列中，反而js脚本一开始就是被放入执行栈中执行】

### Macrotask & Microtask

宏任务： setTimeout、setInterval、setImmediate、I/O、DOM事件回调  
微任务： Promise、MutatuibObserver、process.nextTick  


# Node Event Loop

1. timers: 执行定时器队列中的回调,如setTimeout() 和 setInterval()  
2. I/O callbacks: 这个阶段执行几乎所有的回调。但是不包括close事件，定时器和setImmediate()的回调  
3. idle, prepare: 只在内部使用  
4. poll: 等待新的I/O事件  
5. check: setImmediate()的回调会在这个阶段执行  
6. close callbacks: socket.on('close', ...)这种close事件的回调  

### poll阶段详解

如果poll队列不为空，Event Loop 将同步的执行poll queue里的callback，直到queue为空；  
在poll阶段的空闲状态，会检查setImmediate queue中是否有callback，有的话会进入check阶段并执行；  
在poll阶段的空闲状态，同时也会检查是否有到期的timer，如果有，就把这些到期的timer的callback按照调用顺序放到timer queue中，之后循环会进入timer阶段执行queue中的 callback；  
这两者的顺序是不固定的，收到代码运行的环境的影响，所以无法评估以下代码的执行顺序  

```
/*
 * 如果第一次loop准备前的耗时超过1ms, 即loop->time > 1, 则会先执行setTimeout, 再执行setImmediate
 * 如果第一次loop准备前的耗时小于1ms，即loop->time < 1, 则会先执行setImediate，然后在执行setTimeout
 */
setTimeout(() => {
    console.log('timeout');
}, 0);

setImmediate(() => {
    console.log('immediate');
});
```

如果将以上代码在I/O回调中执行，则顺序是固定的，总是先输出immediate，如下：  

```
// timeout_vs_immediate.js
const fs = require('fs');

fs.readFile(__filename, () => {
  setTimeout(() => {
    console.log('timeout');
  }, 0);
  setImmediate(() => {
    console.log('immediate');
  });
});
```

### I/O callbacks

大部分的回调在poll阶段执行的, I/O callbacks阶段一般执行的是系统操作的回调

### process.nextTick()

node中存在着一个特殊的队列，即nextTick queue;  
这个队列中的回调执行虽然没有被表示为一个阶段，当时这些事件却会在每一个阶段执行完毕准备进入下一个阶段时优先执行;  
当事件循环准备进入下一个阶段之前，会先检查nextTick queue中是否有任务，如果有，那么会先清空这个队列  

### setTimeout()

node会在timers阶段第一时间去执行执行定时器指定时间间隔后所设定的任务

### setImmediate()

在check阶段执行回调