### new关键字

1、 创建新的空对象  
2、 以空对象的作用域执行构造函数  
3、 将空对象的__proto__属性指向构造函数的原型链prototype  
4、 如果构造函数返回了非引用类型，new操作将返回创建的新对象；否则new操作将返回构造函数返回的引用对象  

```
function Person(name) {
    this.name = name;
}
new Person('Bob'); // Person {name: "Bob"}
```

```
function Person(name) {
    this.name = name;
    return name;
}
new Person('Bob'); // Person {name: "Bob"}
```

```
function Person(name) {
    this.name = name;
    return {
        animal: 'cat'
    };
}
new Person('Bob'); // {animal: "cat"}
```

### JS模拟实现new

```
function objectFactory() {
    var obj = new Object(),
    Constructor = [].shift.call(arguments);
    obj.__proto__ = Constructor.prototype;
    var ret = Constructor.apply(obj, arguments);
    return typeof ret === 'object' ? ret : obj;
};
```