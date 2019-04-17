### 底层重构

底层使用TypeScript重写，某些内部功能分解为单独的包，隔离复杂性，方便社区开发贡献

packages  
└── observer  
└── renderer-dom  
└── renderer-server  
└── scheduler  
└── vue  

### 基于Proxy监测机制

解决Vue2 基于defineProperty存在的局限，包括以下：

1、 属性的添加、删除动作的监测；  
2、 数组基于下标的修改，对于.length修改的监测；  
3、 对Map、Set、WeakMap和WeakSet的支持；  

### 公开的用于创建observable的API

提供轻量级、简单的跨组件状态管理解决方案 

###  惰性监测（Lazy Observation）

只有应用初始可见部分所用到的数据会被监测  

### 更精准的变动通知

2.x中Vue.set强制添加响应式数据时，所有依赖该对象的watch都会被执行；3.x中，只有依赖于这个具体属性的watch函数会被通知到

### 不可变监测对象

这种机制可以用来冻结传递到组件属性上的对象和处在mutation范围外的Vue状态树

### 更好的调试能力

通过新增的renderTracked和renderTriggered钩子，可以精确追踪到一个组件发生重渲染的触发时机和完成时机以及原因

### 编译器

tree-shaking输出优化: 模版中的可选特性在生成代码中通过ES模块语法导入，从而未使用到的可选特性会被“摇掉”

AOT优化、更良好的解析错误、支持source map

### IE 11 兼容

### 加入TypeScript以及PWA支持

### vue-cli 3.0

开箱即用，配置隐藏，目录结构精简

自定义配置（webpack-chain）
