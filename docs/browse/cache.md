# 浏览器缓存

浏览器缓存分为强制缓存和协商缓存；  
强制缓存优先于协商缓存；

### 强制缓存

1. 不会向浏览器发送请求，直接从缓存中读取资源；  
2. chrome控制台显示200状态码以及from disk cache【硬盘缓存】或from memory cache【内存缓存】;  
3. 响应头设置 Expires 和 Cache-Control 实现；  
 - Expires为绝对时间，指明具体的过期时间，无效日期代表资源已过期；  
 - 如果设置了Cache-Control的max-age，则Expires被忽略；  
 - max-age为相对时间，相对于请求返回时间

![Cache-Control设置原则](https://haitao.nos.netease.com/5b9c52f0-91b2-4205-96ad-7fbb45a01bb0_752_676.png)

**Note:** Expires 是http1.0的产物，Cache-Control是http1.1的产物，所以Expires其实是过时的产物，现阶段它的存在只是一种兼容性的写法

### 协商缓存

如果协商缓存生效，返回304和Not Modified；如果协商缓存失效，返回200和请求结果

1. Last-Modified和If-Modified-Since

请求的响应头里如果设置了Last-Modified，浏览器会记录，并在下次发起请求时附带If-Modified-Since字段，值为记录的Last-Modified；服务器在接收到请求后会对比这个时间和本队文件的最后修改时间，从而决定缓存是否失效。

2. ETag和If-None-Match

请求的响应头里如果设置了Etag，浏览器会记录，并在下次发起请求是附带If-None-Match字段，值为记录的Etag;服务器在接收到请求后会对比这个Etag和本地文件的Etag，从而决定缓存是否失效。

**对比：**缓存控制精度上Etag要高于Last-Modified；在性能上，Last-Modified要优于Etag。

### 缓存均未设置

通常会取响应头中的 Date 减去 Last-Modified 值的 10% 作为缓存时间，且各个浏览器表现不一致