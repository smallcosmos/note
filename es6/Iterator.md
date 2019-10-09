### 迭代器Iterator

一种遍历集合的机制，集合是指Array、Object、Map、Set等；  
它是一种接口，为各种不同的数据结构提供统一的访问机制

**作用：** 

1、 提供统一的、简便的访问接口；  
2、 使数据结构成员按某种次序排列；  
3、 供ES6 for...of消费

**遍历过程**

1、 创建指针对象，指向数据结构起始位置  
2、 调用next方法，将指针移向下一个成员  
3、 不断调用next方法，直到它指向的数据结构的结束位置  

**实现细节**

提供next方法，总是返回包含value和done两个属性的对象，value为当前成员的值，done为boolean false，直到结束返回true；  

**什么数据结构可Iterable**

只要部署了Iterator接口，这种数据结构就是“可遍历的”（Iterable），比如Array、String、Map、Set、TypedArray、函数的arguments对象、NodeList对象, 即原生部署了Iterator, for...of 天然可访问

**Symbol.iterator**

默认的Iterator接口部署在Symbol.iterator属性上，一个数据结构只要有Symbol.iterator属性，就是可Iterable；  
Symbol.iterator本身是一个函数，执行该函数将返回一个遍历器对象, 即{next: fn}，如下：

```
var a = [1,2,3];
var iterator = a[Symbol.iterator]();
iterator.next() // console {value: 1, done: false}
iterator.next() // console {value: 2, done: false}
iterator.next() // console {value: 3, done: false}
iterator.next() // console {value: undefined, done: true}
```

**for...of原理**

循环内部调用Symbol.iterator方法

**遍历器对象的return和throw**

遍历器对象必须具备next方法，return和throw可选。  
return调用时机为for...of提前退出（出错或break语句）  
throw一般用不到，主要是配合Generator函数使用

**自己实现一个遍历器**

```
function makeIterator(array){
    var nextIndex = 0;
    
    return {
        next: function(){
            return nextIndex < array.length ?
               {value: array[nextIndex++], done: false} :
               {done: true};
        }
    }
}

var it = makeIterator(['yo', 'ya']);
console.log(it.next().value); // 'yo'
console.log(it.next().value); // 'ya'
console.log(it.next().done);  // true
```

**在对象上部署Iterator**


```
// 简单例1， 无限迭代
const obj = {
    [Symbol.iterator] : function () {
        return {
            next: function () {
                return {
                    value: 1,
                    done: false
                };
            }
        };
    }
};
```

```
// 简单例2， 有限迭代
let obj = {
    data: ['hello', 'world', '!'],
    [Symbol.iterator]() {
        const self = this;
        let index = 0;
        return {
            next() {
                if (index < self.data.length) {
                    return {
                        value: self.data[index++],
                        done: false
                    };
                } else {
                    return { value: undefined, done: true };
                }
            },
            return() {
                console.log('returned');
                return {
                    value: undefined,
                    done: true
                };
            }
        };
    }
};
```