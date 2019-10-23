# performance

[浏览器渲染](https://srtian96.gitee.io/blog/2018/06/01/浏览器渲染原理/)  
[优化重排](https://juejin.im/post/5c15f797f265da61141c7f86)  

### 浏览器渲染

过程主要包括以下五步：  
1. 将获取的HTML文档解析为DOM树[非常快]  
2. 将获取的CSS构成层叠样式表模型CSSOM[非常快]  
3. 将DOM和CSSOM合并为渲染树（Render tree）[非常快]  
4. 布局（Layout）,渲染树的每个元素包含的内容都是计算过的，浏览器一次绘制就可以布局所有元素[耗时]  
5. 绘制（painting）,将渲染树的各个节点绘制到屏幕上[耗时]  


### DOM tree和Render tree

两者不完全对应  
display:none 的元素、注释以及script标签会在DOM树中  
而这些不在Render tree中

### 渲染树（Render tree）

渲染树布局(layout of the render tree)  
布局阶段会从渲染树的根节点开始遍历，由于渲染树的每个节点都是一个Render Object对象，包含宽高，位置，背景色等样式信息。所以浏览器就可以通过这些样式信息来确定每个节点对象在页面上的确切大小和位置，布局阶段的输出就是我们常说的盒子模型，它会精确地捕获每个元素在屏幕内的确切位置与大小。需要注意的是：  
float元素，absoulte元素，fixed元素会发生位置偏移。  
我们常说的脱离文档流，其实就是脱离Render Tree。

### 回流【或重排】和重绘（refolw and repaint）

reflow（回流）：当浏览器某个部分发生了变化从而影响了布局，这个时候就需要倒回去重新渲染。
常见的reflow是一些会影响页面布局的操作，诸如Tab，隐藏等。reflow 会从 html 这个 root frame 开始递归往下，依次计算所有的结点几何尺寸和位置，以确认是渲染树的一部分发生变化还是整个渲染树。reflow几乎是无法避免的，因为只要用户进行交互操作，就势必会发生页面的一部分的重新渲染，且通常我们也无法预估浏览器到底会reflow哪一部分的代码，因为他们会相互影响。  
repaint（重绘）： 某个元素的背景色、文字颜色、边框颜色等等不影响它周围或内部布局的属性时，屏幕的一部分要重画，但是元素的几何尺寸和位置没有发生改变。

display:none 会触发 reflow，而visibility:hidden 只会触发 repaint  
"repaint"不一定会出现"refolw"，"refolw"必然会出现"repaint"  

### 阻塞渲染

CSS被默认视为阻塞渲染的资源，因为浏览器在CSSOM构建完毕前不会渲染任何已处理的内容，因此建议将CSS放在head中引入  
JavaScript 不仅可以读取和修改 DOM 属性，还可以读取和修改 CSSOM 属性，因此CSS解析与script的执行互斥，同时script**标签下载和执行均会阻塞页面渲染**，因此建议将script放在body末尾引入；  
JavaScript 应尽量少的去影响 DOM 的构建

### chrome performance面板

不同的颜色表示不同的事件，哪种色块多代表性能耗费大。  

蓝色：网络通信和HTML解析  
黄色：JavaScript执行  
紫色：样式计算和布局，即重排  
绿色：重绘  

### 性能优化点
 
1. 减少网络请求时间  
 - 减少网络请求次数  
    js打包  
    CSS Spirite  
 - 减少文件体积  
    code split按需加载  
    压缩混淆  
    tree shaking  
 - 使用CDN加速  
2. HTTP缓存  
 - 强制缓存  
 - 协商缓存  
3. 减少浏览器reflow和painting  
 - css在head引入  
 - javascript脚本中减少dom操作和样式更改  
 - 局部布局的形式组织html结构，尽可能小的影响重排的范围  
 - js中样式改变尽量只触发一次重排  
    分离读写操作，避免一行代码一个重排【见下文重排举例说明】  
    样式集中改变【不排除其他浏览器没有做到渲染队列优化，通过修改类名或其中修改样式的方式可以确保一次重排】  
    缓存布局信息【见下文重排举例说明】  
    尽量通过修改类名去修改样式  
4. 提高UED  
 - script在body末尾引入


### 分离读写操作，避免一行代码一个重排

浏览器的渲染队列机制会保证多次改变元素的几何属性而只触发一次重排，前提是多次改变元素属性为连续js代码，并且中间不穿插对样式的各种求值操作，比如以下两组代码分别会触发一次重排和四次重排；  

```
// 一次重排
div.style.left = '10px';
div.style.top = '10px';
div.style.width = '20px';
div.style.height = '20px';

// 四次重排
div.style.left = '10px';
console.log(div.offsetLeft);
div.style.top = '10px';
console.log(div.offsetTop);
div.style.width = '20px';
console.log(div.offsetWidth);
div.style.height = '20px';
console.log(div.offsetHeight);
```

### 缓存布局信息

```
// bad 强制刷新 触发两次重排
div.style.left = div.offsetLeft + 1 + 'px';
div.style.top = div.offsetTop + 1 + 'px';

// good 缓存布局信息 相当于读写分离
var curLeft = div.offsetLeft;
var curTop = div.offsetTop;
div.style.left = curLeft + 1 + 'px';
div.style.top = curTop + 1 + 'px';
```

### 附雅虎军规35条  

1. 尽量减少 HTTP 请求个数——须权衡  
2. 使用 CDN（内容分发网络）  
3. 为文件头指定 Expires 或 Cache-Control ，使内容具有缓存性。  
4. 避免空的 src 和 href  
5. 使用 gzip 压缩内容  
6. 把 CSS 放到顶部  
7. 把 JS 放到底部  
8. 避免使用 CSS 表达式  
9. 将 CSS 和 JS 放到外部文件中  
10. 减少 DNS 查找次数  
11. 精简 CSS 和 JS  
12. 避免跳转  
13. 剔除重复的 JS 和 CSS  
14. 配置 ETags  
15. 使 AJAX 可缓存  
16. 尽早刷新输出缓冲  
17. 使用 GET 来完成 AJAX 请求  
18. 延迟加载  
19. 预加载  
20. 减少 DOM 元素个数  
21. 根据域名划分页面内容  
22. 尽量减少 iframe 的个数  
23. 避免 404  
24. 减少 Cookie 的大小  
25. 使用无 cookie 的域  
26. 减少 DOM 访问  
27. 开发智能事件处理程序  
28. 用  代替 @import  
29. 避免使用滤镜  
30. 优化图像  
31. 优化 CSS Spirite  
32. 不要在 HTML 中缩放图像——须权衡  
33. favicon.ico要小而且可缓存  
34. 保持单个内容小于25K  
35. 打包组件成复合文本  