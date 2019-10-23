### vue 2.0双向绑定原理：

1、 Observe递归建立响应式数据，劫持get，当被求值且Dep静态属性target非空时收集依赖（见下面watcher）  
2、 Observe劫持set，数据改变时，通知dep，dep分发到所有订阅的观察者（分发见下面Dep）  
3、 Dep初始化观察者subs为空，并通过addSub（添加时机见下面watcher）添加观察者，notify（遍历subs，并执行各观察者提供的方法）分发消息到观察者  
4、 Watcher初始化时给Dep静态属性target赋值自己（巧妙，只有被Dep静态属性target非空时，Observe get才会收集依赖），并对表达式进行求值，触发get，并被作为依赖收集，收集完毕置空Dep.target，避免依赖重复收集  
5、 Compile解析指令，绑定Watcher，每个指令会初始化一个Watcher

总结： 

Observe具备了数据监听能力；Compile具备了模板指令解析能力；Watcher作为桥梁链接两者，并通过Dep实现发布订阅，使依赖能被收集，使变化能更新到视图；

```
// 递归建立响应式
function observe(data) {
    // 这里是简化逻辑
    if (!data || typeof data !== 'object') {
        return;
    }
    Object.keys(data).forEach(function(key) {
        defineReactive(data, key, data[key]);
    });
};

function defineReactive(data, key, val) {
    observe(val); // 递归遍历所有子属性
    var dep = new Dep(); 
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get: function() {
            if (Dep.target) {.  // 判断是否需要添加订阅者
                //只有compile指定了Dep静态属性target时，get才会收集依赖
                dep.addSub(Dep.target); // 在这里添加一个订阅者
            }
            return val;
        },
        set: function(newVal) {
            if (val === newVal) {
                return;
            }
            val = newVal;
            dep.notify(); // 如果数据变化，通知所有订阅者
        }
    });
}
Dep.target = null;

class Dep {
    constructor() {
        this.subs = [];
    }

    addSub(sub) {
        this.subs.push(sub);
    }

    notify() {
        this.subs.forEach(sub => {
            sub.update();
        })
    }
}
Dep.target = null;

class Watcher() {
    constructor(vm, exp, cb) {
        this.cb = cb;
        this.vm = vm;
        this.exp = exp;
        this.value = this.get();  // 将自己添加到订阅器的操作
    }

    update() {
        this.run();
    }

    run() {
        var value = this.vm.data[this.exp];
        var oldVal = this.value;
        if (value !== oldVal) {
            this.value = value;
            this.cb.call(this.vm, value, oldVal);
        }
    }

    get() {
        Dep.target = this;  // 缓存自己
        var value = this.vm.data[this.exp]  // 强制执行监听器里的get函数
        Dep.target = null;  // 释放自己
        return value;
    }
}

function SelfVue (data, el, exp) {
    this.data = data;
    observe(data);
    el.innerHTML = this.data[exp];  // 初始化模板数据的值
    new Watcher(this, exp, function (value) {
        el.innerHTML = value;
    });
    return this;
}
```