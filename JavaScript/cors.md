### 简单请求和复杂请求

[CORS规范](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS#Preflighted_requests)

一、简单请求【不会触发CORS预检请求的请求】，需要满足以下所有条件，

1、 请求方式为GET、HEAD、POST  
2、 请求中仅允许CORS安全的首部字段集合： Accept、Accept-Language、Content-Language、Content-Type, 以及【DPR、Downlink、Save-Data、Viewport-Width、Width】  
3、 Content-Type仅限于以下三者之一：text/plain、multipart/form-data、application/x-www-form-urlencoded  
4、请求中的任意XMLHttpRequestUpload 对象均没有注册任何事件监听器；XMLHttpRequestUpload 对象可以使用 XMLHttpRequest.upload 属性访问  
5、 请求中没有使用 ReadableStream 对象 

二、跨域请求如何携带cookie

一般对于跨域请求，浏览器不会发送cookie；  
如果要发送cookie，需设置字段withCredentials为true；  
同时服务端需要设置Access-Control-Allow-Credentials为true；  
同时服务端不得设置Access-Control-Allow-Origin为‘*’, 而必须是具体的Origin；  
服务端条件若不满足，响应内容将不会返回给请求的发起者；  

三、服务端如何设置响应头

1、 Access-Control-Allow-Origin  
2、 Access-Control-Expose-Headers： 允许xhr对象拿到基本响应头外的其他响应头  
3、 Access-Control-Max-Age  
4、 Access-Control-Allow-Credentials  
5、 Access-Control-Allow-Methods： 用于预检请求你的响应，指明实际请求所允许的HTTP方法；和简单请求无关  
