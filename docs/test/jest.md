# 前端单测

## 前言
在jest官网可以看到对jest特性的全面介绍  
[https://jestjs.io/docs/en/getting-started](https://jestjs.io/docs/en/getting-started)  
jest配置相关可直接查阅jest配置  
[https://jestjs.io/docs/en/configuration](https://jestjs.io/docs/en/configuration)  
jest中如何集成webpack类似的功能可直接查阅  
[https://jestjs.io/docs/en/webpack](https://jestjs.io/docs/en/webpack)  
jest测试vue文件如何配置可查阅  
[https://alexjover.com/blog/write-the-first-vue-js-component-unit-test-in-jest/](https://alexjover.com/blog/write-the-first-vue-js-component-unit-test-in-jest/)  
jest针对vue的组件测试通用库【@vue/test-utils】使用及API可查阅  
[https://vue-test-utils.vuejs.org](https://vue-test-utils.vuejs.org)  
#### 在以下仓库代码中可以找到Jest各种单测实践、测试的重心以及各种单测的写法；  
复合组件包【业务代码已省略】  

# 一、 三大组成：测试框架、断言库以及代码覆盖率工具
### 1、测试框架
清晰简明的语法来描述测试用例【TDD|BDD】
测试用例分组
组织异常信息链接

主流：Jest、Mocha

示例：

```javascript
// Jest
describe("Math", function() {
  var firstOperand;
  var secondOperand;

  beforeEach(function() {
    firstOperand = 2;
    secondOperand = 3;
  });

  it("should add two numbers", function() {
    var result = math.add(firstOperand, secondOperand);
    expect(result).toEqual(firstOperand + secondOperand);
  });
});

//Mocha
var assert = require('assert'); // nodejs 内建断言
describe("Math", function() {
  var firstOperand;
  var secondOperand;
  beforeEach(function() {
    firstOperand = 2;
    secondOperand = 3;
  });
  it("should add two numbers", function() {
    var result = math.add(firstOperand, secondOperand);
    assert.equal(result, firstOperand + secondOperand);
  });
});
```

### 2、断言库
语义化的方法判断值

主流：chai【TDD|BDD】、assert【TDD】、expect【BDD】、should【BDD】

示例
```javascript
//chai
foo.should.be("aa");
assert("mike" == user.name);
expect(foo).to.be("aa");

// assert
assert("mike" == user.name);

// expect
expect(foo).to.be("aa");

//should
foo.should.be("aa");

```
### 

### 3、代码覆盖率
源码插桩，运行单测收集数据信息，统计生成覆盖率报告

主流：ScriptCover、Istanbul

ScriptCover依赖chrome浏览器，使用方便但是功能受限；
Istanbul强大且灵活，非常方便地可以统计浏览器环境和node环境的覆盖率；

# 二、 TDD&BDD

### 定义
TDD（测试驱动开发）
BDD（行为驱动开发）

### 区别
两者的关注点不同，TDD更倾向于结果的测试，因为它属于测试驱动，用例编写在功能开发之前，开发者需要先写好测试用例，然后再去实现函数，来满足测试用例；而BDD更倾向于一个模块|功能行为的测试，考虑边界，进而排除TDD可能会存在的问题；在语法上，BDD对开发者而言读起来更流畅，像一条完整的语句，基于此语法， 开发者可能会写出更完整的测试用例

示例：
```javascript
// TDD
assert.equal(1, factorial(1));

// BDD
factorial(0).should.equal(1);
```

### 参考

[The Difference Between TDD and BDD](https://www.yuque.com/xueqiu-p2tei/wn6ate/bqc75w/edit)【[链接](https://joshldavis.com/2013/05/27/difference-between-tdd-and-bdd/)】


# 三、框架的选择

### 1、关键点对比

|  | Mocha | Jest |
| --- | --- | --- |
| 社区 | 非常成熟 | 不断成熟，不拖后腿 |
| 成本 | 需要较多配置，但是灵活 | 开箱即用配置少，API简单 |
| TDD|BDD | TDD|BDD | BDD |
| 断言库 | 可自由选择，一般搭配chai | 内置断言库 |
| 异步测试 | 支持 | 支持 |
| 异常提示 | 友好 | 友好 |
| 覆盖率工具 | 可自由选择 | 内置Istanbul |
| 快照测试 | 支持，需要额外配置 | 支持 |
| 测试用例分组 | 支持 | 支持 |
| 隔离测试 | 支持 | 支持 |


### 2、结论
两个主流框架并没有明显的优劣之分，只有合适之说，针对大部分的项目来说，两个框架均能应付单测，且表现不俗；鉴于Jest迅速推陈出新的特性，以及其发展势头，个人更倾向使用Jest。

Jest吸引人的几大原因：

- API更简单，样板代码更少。

- 灵活且容易配置。

- 测试文件彼此隔离执行。

- 高级监控模式。

- 快照支持，测试更容易上手。

- 代码覆盖率。

# 四、Jest基础介绍及特性

### 1、Jest全局变量

jest全局变量主要用到的有：
四个生命周期钩子beforeAll、afterAll、beforeEach、afterEach
一个分组声明describe
一个单测声明it或test
其他基本用不到

```javascript
declare var beforeAll: jest.Lifecycle;
declare var beforeEach: jest.Lifecycle;
declare var afterAll: jest.Lifecycle;
declare var afterEach: jest.Lifecycle;
declare var describe: jest.Describe;
declare var fdescribe: jest.Describe;
declare var xdescribe: jest.Describe;
declare var it: jest.It;
declare var fit: jest.It;
declare var xit: jest.It;
declare var test: jest.It;
declare var xtest: jest.It;
```

**Q：**it和test有什么区别？
**A：**test是Jest官方的API，而it只是test的别名，在使用上和功能上，没有实际差别

### 2、Jest断言

#### 普通匹配器

- toBe 【Object.is】
- toEqual 【递归比较对象，建议对象比较使用】
- not.toBe
- not.toEqual

#### 类型匹配器【严格类型匹配】

- toBeNull
- toBeUndefined
- toBeDefined
- toBeTruthy 【任何if语句为真】
- toBeFalsy 【任何if语句为假】

#### 数字

- toBeGreaterThan
- toBeGreaterThanOrEqual
- toBeLessThan
- toBeLessThanOrEqual
- toBeCloseTo 【浮点数比较】



#### 字符串

- toMatch



#### 数组&迭代器

- toContain



[]()[完整匹配器](https://jestjs.io/docs/zh-Hans/expect)列表

### 3、异步测试

#### 回调形式
当你的异步函数具备fetchData(callback)形式时，使用jest可以在callback中进行测试；但是如果直接在callback中进行断言，jest单测实际上会在fetchData语句执行完立即完成，并不会按预期的等待异步完成后再退出；所以jest提供了一个done回调，如果指定了done参数，jest会等待done执行完毕后退出；代码如下：

```javascript
test('test the response', done => {
  function callback(data) {
    expect(data).toBe('peanut butter');
    done();
  }

  fetchData(callback);
});
```

#### Promise形式
当你的异步函数fetchData返回一个promise时，jest处理promise形式的异步函数非常简单，直接通过fetchData().then | fetchData().catch | fetchData().resolves | fetchData().rejects进行断言；代码如下：

```javascript
test('test the response', () => {
  return fetchData().then(data => {
    expect(data).toBe('peanut butter');
  });
});

test('test the response', () => {
  return fetchData().catch(e => {
    expect(e).toBe('error');
  });
});

test('test the response', () => {
  return expect(fetchData()).resolves.toBe('peanut butter');
  });
});

test('test the response', () => {
  return expect(fetchData()).rejects.toBe('error');
  });
});
```

#### async&await
在jest单测中直接写async&await异步函数同样非常方便；代码如下：

```javascript
test('test the response', async () => {
  try {
    const {result} = await fetchData();
    // 思考一下此处如果多处进行断言，该测试用例结果会如何？
    // expect(result).toBe('peanut butter');
  } catch (e) {
    expect(e).toMatch('error');
  }
  
  // await expect(fetchData()).rejects.toThrow('error');
});
```

### 4、setup & teardown

前置和后置，解决多个测试用例前后的设置和准备工作；
分为一次性设置和多次重复设置；
jest提供了beforeAll、afterAll钩子用来一次性设置，同时也提供了beforeEach和afterEach钩子用来多次重复设置；
此外这些钩子都存在作用域，如果钩子定义在describe块外，则作用于整个文件，否则，作用于describe块内；

```javascript
beforeAll(() => console.log('1'));
afterAll(() => console.log('2'));
beforeEach(() => console.log('3'));
afterEach(() => console.log('4'));
test('', () => console.log('5'));
describe('Scoped / Nested block', () => {
  console.log(11);
  beforeAll(() => console.log('6'));
  afterAll(() => console.log('7'));
  beforeEach(() => console.log('8'));
  afterEach(() => console.log('9'));
  test('', () => console.log('10'));
  console.log(12);
});

// 11,12,1,3,5,4,6,8,10,9,7,2
```

**Q：**describe内直接写前后置代码和describe内写beforeAll有什么区别？
**A：**jest会在真正开始测试之前执行文件中所有的describe处理程序，把所有测试用例按出现顺序收集起来；
也就是说describe内直接写前后置代码并非是真正的describe块的前后置处理程序，而是会一开始就被统一全部执行；


### 5、快照测试

最重要的使用场景是当你希望每次测试执行UI都不会发生变化，或者产出复杂却不变的时候，但实际上可作用于任何场景，哪怕产出仅仅只是一个字符串；

- toMatchSnapshot
- toMatchInlineSnapshot

调用toMatchSnapshot会生成一份快照，jest内置了一系列序列化和beauty插件，可以使dom元素、对象|数组等产物以人们可读化的快照形式记录下来；jest会在测试文件位置生成__snapshots__文件夹，同时生成对应测试文件的.snap文件，快照内容如下：

![image.png](https://cdn.nlark.com/yuque/0/2019/png/347261/1567059681575-d0d99de3-3646-44f8-bb2b-c815046a55fa.png#align=left&display=inline&height=524&name=image.png&originHeight=524&originWidth=1658&search=&size=81087&status=done&width=1658)

![image.png](https://cdn.nlark.com/yuque/0/2019/png/347261/1567059707524-9656f292-ca73-450e-aaa3-1ca97cc24cb0.png#align=left&display=inline&height=970&name=image.png&originHeight=970&originWidth=1674&search=&size=156235&status=done&width=1674)

当测试再次被执行的时候，生成的快照会和最近一次的快照做对比，如果有差异，则单测不通过；此时可以选择更新快照，或修改被测代码

toMatchInlineSnapshot同toMatchSnapshot类似，只不过它不会生成额外的快照文件去存储快照，它直接把快照内联到测试文件中；

```javascript
expect(tree).toMatchInlineSnapshot()
// =>
expect(tree).toMatchInlineSnapshot(`
<a
  className="normal"
  href="https://prettier.io"
  onMouseEnter={[Function]}
  onMouseLeave={[Function]}
>
  Prettier
</a>
`);
```

### 6、Mock函数

Jest mock函数能做到：

- 擦除函数的实际实现；

```javascript
Date.prototype.getFullYear = jest.fn(() => 2020);
new Date().getFullYear()
// 2020
```

- 捕获对函数的调用 ( 以及在这些调用中传递的参数) ；

Jest mock函数维护了特殊的.mock属性，.mock属性上维护了calls、results、instances属性，分别记录了调用情况、返回值、实例等信息；
```javascript
const mockCallback = jest.fn(x => x + 1);

it('demo', () => {
    [3, 4].forEach(mockCallback);
    // 此 mock 函数被调用了两次
    expect(mockCallback.mock.calls.length).toBe(2);

    // 第一次调用函数时的第一个参数是 0
    expect(mockCallback.mock.calls[0][0]).toBe(3);
    // 第一次调用函数时的第二个参数是 ？
    expect(mockCallback.mock.calls[0][1]).toBe(?);

    // 第二次调用函数时的第一个参数是 1
    expect(mockCallback.mock.calls[1][0]).toBe(4);

    // 第一次函数调用的返回值是 42
    expect(mockCallback.mock.results[0].value).toBe(4);
});
```

- 在使用 `new` 实例化时捕获构造函数的实例；
- 允许测试时配置返回值；

```javascript
const myMock = jest.fn();
console.log(myMock());
// > undefined
myMock
  .mockReturnValueOnce(10)
  .mockReturnValueOnce('x')
  .mockReturnValue(true);
console.log(myMock(), myMock(), myMock(), myMock());
// > 10, 'x', true, true
```

### 7、vue集成

- [Testing Vue.js components with Jest](https://alexjoverm.github.io/series/Unit-Testing-Vue-js-Components-with-the-Official-Vue-Testing-Tools-and-Jest/) by Alex Jover Morales ([@alexjoverm](https://twitter.com/alexjoverm))
  - 比较有趣的shollow Rendering，可以每次忽略子组件的渲染，而只把测试重心放在单一的你想测的组件上，可以有效的避免因子组件内部的变化而导致测试用例不通过
- [Jest for all: Episode 1 — Vue.js](https://medium.com/@kentaromiura_the_js_guy/jest-for-all-episode-1-vue-js-d616bccbe186#.d573vrce2) by Cristian Carlesso ([@kentaromiura](https://twitter.com/kentaromiura))

# 五、如何写单测

#### 通用函数类

- 函数的产出验证
- 函数的边界验证
- 函数的中间态验证
- 函数的副作用验证

Q：函数如果无产出怎么办？
A：思考该函数的作用，评估该函数的影响点，验证函数的中间态，验证函数的副作用；
Q：函数产出如果是函数类型怎么办？
A：思考该函数产出的作用场景，直接将该函数作用到作用场景中，通过快照测试或其他方式直接做结果验证；举例：renderHeader
Q：函数产出如果是复杂对象怎么办？
A：评估产出，针对对象重点属性进行断言；或采用快照测试；举例：createBelongMonth
等等

#### 过滤器

- 验证输入的边界
- 验证输出
- 使用快照测试

#### 指令
待补充

#### 请求封装

- 验证请求头
- 验证请求参数
- 验证请求响应后拦截处理
- 验证请求后数据

#### 组件

- 最简单的方式：快照
  - 优点：任何对组件的二次维护都会引起测试用例的不通过，所以能快速发现对组件的全局影响，进而二次确认修改带来的影响，同样这也算它的缺点【任何改变都将引起单测不通过】
  - 缺点：无法建立细节测试，比如状态变化带来的作用，生命周期执行的情况等等
- 最复杂的方式：
  - 找到合适的方法去断言vdom
  - 找到合适的方法去断言dom
  - 找到合适的方法去断言state，以及state变化引起的vdom和dom变化
  - 找到合适的方法去断言生命周期的执行，以及生命周期执行带来的副作用和作用
  - 优点：非对组件原有功能破坏的改动不影响单测通过，单测可以针对很多细节执行
  - 缺点：单测编写困难，很考验开发对组件的理解，组件未来的扩展方向，以及在单测上的思考；单测编写耗时；

**总结：这是一个需要深入去思考和研究的一个方向，即【如何为一个组件写单测】【****见末尾总结：九、如何写组件单测****】**


# 六、覆盖率要求

随着单测用例的不断补充，以下覆盖率指标会逐渐往上加，最终以下所有函数类指标需要达到100，分支覆盖、行覆盖、语句覆盖达到90，甚至95，考虑到各种异常语句和分支，不要求100。
一旦用例完善了以后，但凡公共代码的新增都需要编写对应的测试用例，否则单测不会通过；但凡公共代码的改动都将经历单测的考验；但凡因为功能变动需要引起单测用例的补充或改动，需要找多人【2人以上】集体评估对工程的影响，才可以进行；

```javascript
coverageThreshold: {
    "./src/components/": {
        branches: 95,
        functions: 100,
        lines: 95,
        statements: 95
    },
    "./src/directives/": {
        branches: 95,
        functions: 100,
        lines: 95,
        statements: 95
    },
    "./src/filters/": {
        branches: 95,
        functions: 100,
        lines: 95,
        statements: 95
    },
    "./src/widget/": {
        branches: 95,
        functions: 100,
        lines: 95,
        statements: 95
    },
    "./src/compose.js": {
        branches: 95,
        functions: 100,
        lines: 95,
        statements: 95
    },
    "./src/main.js": {
        branches: 95,
        functions: 100,
        lines: 95,
        statements: 95
    }
},
```


# 七、Jest调试

- 执行单个测试文件

jest path/xxx.test.js

- 执行某个测试文件中单个组

describe.only('xxx', () => {})

- 执行某个组中单个测试用例

it.only

- vscode调试【详见jest文档】
```javascript
//.vscode/launch.json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Launch Program",
            "cwd": "${workspaceFolder}",
            "program": "${workspaceFolder}/node_modules/jest/bin/jest.js",
            "args": []
        }
    ]
}
```

# 八、Jest踩坑记录

### 1、SyntaxError: Unexpected token import

无法识别*.test.js文件中import关键字，首先解决这个问题需要搞清楚jest运行环境是什么，查看一下jest.config.js中的testEnvironment，该字段默认为jsdom，即浏览器环境，可选还有node；
正常情况下，node环境我们鼓励使用require|module.exports来书写单测，但即使使用import|export也无可厚非，jest也可以通过配置transform字段使js经过babel-jest，进而做babel转化；这里，要进一步确保babel.config.js中的@babel/preset-env配置到es5级别

```javascript
// jest.config.js
testEnvironment: "node",
transform: {
    "^.+\\.(js|jsx|ts)$": "babel-jest",
},
    
// babel.config.js
// 一定要配置到es5级别，如下targets配置到浏览器最近两个版本是不行的，
// 因为现在的浏览器直接支持import|export语法，babel一旦不转换import，jest就将报错
presets: 
    [
        "@babel/preset-env",
        {
            "targets": {
                "browsers": [
                    "> 5%",
                    "last 2 versions",
                    "not ie <= 8"
                ]
            },
            "modules": false,
            "exclude": [
                "transform-regenerator"
            ]
        }
    ],
]
```

### 2、jest别名（alias）配置

webpack中的配置其实都是不对jest生效的，因为jest不会使用webpack去编译代码，如果想延续别名方式的模块加载，就需要通过jest的配置解决，jest提供了moduleNameMapper来处理模块名称映射，该配置大部分场景下用来映射静态资源，但是也可以巧妙地提供别名的功能，只需按以下方式去配置

```javascript
// jest.config.js
moduleNameMapper: {
    "@/(.*)$": "<rootDir>/src/$1"
},
    
// *.test.js
import _ from '@/widget/util.js';
```
### 
### 3、jest.mock
jest会对jest.mock进行提升，使其作用在require[import]之前，所以尽量在describe外层执行jest.mock，当然如果你只希望mock用例内的动态加载，可以将其放在describe内，但这种情况是极少的

# 九、如何写组件单测

#### 以下两个链接的内容非常有用，涵盖了vue单测和组件单测的核心理念和方法，必读；

- Vue官方单元测试实用库
  - [https://vue-test-utils.vuejs.org](https://vue-test-utils.vuejs.org/)
- Vue组件测试系列课程
  - [https://github.com/alexjoverm/vue-testing-series/tree/lesson-1](https://github.com/alexjoverm/vue-testing-series/tree/lesson-1)



### 总结方法


### 1、测试组件的props和data初始值

#### 原因：组件初始的props和data值发生变化，极大概率会影响原有业务调用方的功能，必须保证组件的初始props和data值


#### 方法一：评估props和data对dom结构是否有影响，对dom有影响的props和data【占大部分】可以直接通过快照进行测试，对dom无影响的props和data【极小部分】可通过断言进行测试；
比如下例的extraData和flag，只在组件交互发请求时才有用，对dom无影响。


【注意点】：test-utils库的官方文档写到，mount默认render为同步渲染，所以按理来说mount后续的断言应该是渲染完成的结果，实际实践发现，断言语句执行时，子组件可能仍存在未渲染完成的情况，所以建议使用window.setTimeout进行一定延时后，再执行断言；同时，不要忘记jest的异步写法done


```javascript
import { mount } from '@vue/test-utils';
import ComponentA from '@/components/a';

describe('component-a default props & data', () => {
	it('component-a has correct default props & data', (done) => {
  	const wrapper = mount('ComponetA', {});
    window.setTimeout(() => {
      expect(wrapper.props('extraData')).toEqual({});
      expect(wrapper.vm.flag).toBe(1);
      expect(wrapper.element).toMatchSnapshot();
    	done();
    }, 10);
  });
});
```

#### 方法二【不推荐，无法保证props和data对dom结构的影响】：如果组件props和data比较简单，同时dom结构比较稳定【比如kl-select只是对el-select进行一层封装】，不需要关注props对dom结构的影响，可以直接对props和data进行断言，而不通过快照，如下：

```javascript
import { mount } from '@vue/test-utils';
import ComponentA from '@/components/a';

describe('component-a default props & data', () => {
	it('component-a has correct default props & data', (done) => {
  	const wrapper = mount('ComponetA', {});
    window.setTimeout(() => {
      expect(wrapper.props('title')).toBe('导入');
      expect(wrapper.vm.status).toBe('init');
    	done();
    }, 10);
  });
});
```

### 2、测试组件自定义props的快照输出

#### 原因：组件的props通常决定了组件的表现形式和交互方式，需要保证不同props下，组件的输出行为一致。此时不需要断言组件的props为开发者传入的props，因为此行为通常不太可能出问题，不是组件单测关注的点；

#### 方法：尽量把所有的props都进行自定义，然后挂载，断言快照。同时，针对能引起dom结构差异的某个别prop进行遍历式自定义，做快照测试

```javascript
import { mount } from '@vue/test-utils';
import ComponentA from '@/components/a';

describe('component-a customs props', () => {
	it('component-a has correct custom props behavior', (done) => {
  	const wrapper = mount('ComponetA', {
    	title: '报表导出',
      status: 'success'
    });
    window.setTimeout(() => {
      expect(wrapper.element).toMatchSnapshot();
    	done();
    }, 10);
  });
  it('component-a has correct custom prop[status="uploading"] behavior', (done) => {
  	const wrapper = mount('ComponetA', {
      status: 'uploading'
    });
    window.setTimeout(() => {
      expect(wrapper.element).toMatchSnapshot();
    	done();
    }, 10);
  });
  it('component-a has correct custom prop[status="fail"] behavior', (done) => {
  	const wrapper = mount('ComponetA', {
      status: 'fail'
    });
    window.setTimeout(() => {
      expect(wrapper.element).toMatchSnapshot();
    	done();
    }, 10);
  });
});
```

### 3、测试组件的所有方法

#### 原因：组件的方法是组件交互方式中最重要的一部分，组件的方法决定了数据的处理和交互的下一步流转

#### 方法：通过@vue/test-utils包装的wrapper对象，主动触发组件的按钮行为（click、mousedonw等等），主动进入组件的methods的方法，进而使用公共函数的单测方法去写单测；

```javascript
import { mount } from '@vue/test-utils';
import ComponentA from '@/components/a';

describe('component-a methods', () => {
	it('method[export] has correct behavior', (done) => {
    window.open = jest.fn();
  	const wrapper = mount('ComponetA', {});
    window.setTimeout(() => {
      wrapper.find('.export-button').trigger('click');
      expect(window.open).toBeCalledWith('url', '_self');
    	done();
    }, 10);
  });
});
```

如果组件的方法的触发入口隐藏的较深，难以通过模拟按钮或模拟真实触发场景被触发，可以简单地通过组件直接调用，测试函数的单元功能。但要保证直接调用时上下文模拟一致。

```javascript
import { mount } from '@vue/test-utils';
import ComponentA from '@/components/a';

describe('component-a methods', () => {
	it('method[export] has correct behavior', (done) => {
    window.open = jest.fn();
  	const wrapper = mount('ComponetA', {});
    window.setTimeout(() => {
      wrapper.vm.export('url);
      expect(window.open).toBeCalledWith('url', '_self');
    	done();
    }, 10);
  });
});
```

4、测试组件的css和style

暂时不要求

5、测试组件的生命周期

暂时不要求
