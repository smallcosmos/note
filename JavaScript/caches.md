### window.caches

- 为Request/Response对象提供存储机制  
- 一个域可以有多个命名Cache对象
- 在Service worker标准中被定义，但是它可以单独使用
- 在Service worker标准中，CacheStorage是多个Cache的集合，每个Cache可以存储多个Response


**浏览器支持**

```
if('caches' in window) {
  // Has support!
}
```

**打开缓存对象**

通过caches.open可以异步得到一个Cache对象的引用，open返回Promise

```
window.caches.open('test').then(function(cache) {
    // 缓存创建完成，可以对cache进行操作了
});
```

**添加缓存**

使用cache.add | cache.addAll | cache.push

```
window.caches.open('test').then(function(cache) {
    cache.add('/page/1');  // '/page/1' 地址将被请求，响应数据将被缓存
    cache.add(new Request('/page/2', {/* 请求参数 */})); // 自定义Request
});
```

```
fetch('/page/1').then(function(response) {
    return caches.open('test').then(function(cache) {
        return cache.put('/page/1', response);
    });
});
```

**访问缓存Request数据**

使用cache.keys

```
caches.open('test').then(function(cache) { 
    cache.keys().then(function(cachedRequests) { 
        console.log(cachedRequests); // [Request, Request]
    });
});

/* 
Request {
	bodyUsed: false
	cache: "default"
	credentials: "omit"
	destination: ""
	headers: Headers {}
	integrity: ""
	isHistoryNavigation: false
	keepalive: false
	method: "GET"
	mode: "no-cors"
	redirect: "follow"
	referrer: ""
	referrerPolicy: "unsafe-url"
	signal: AbortSignal {
		aborted: false,
		onabort: null
	}
	url: "http://localhost:8033/page"
}
*/
```

**访问缓存Response数据**

```
caches.open('test').then(function(cache) {
    cache.match('/page/1').then(function(matchedResponse) {
        console.log(matchedResponse);
    });
});

/*
Response {
	body: (...)
	bodyUsed: false
	headers: Headers {}
	ok: true
	redirected: false
	status: 200
	statusText: "OK"
	type: "basic"
	url: "http://localhost:8033/page"
}
*/
```

**删除缓存中数据**

使用cache.delete

```
caches.open('test').then(function(cache) {
    cache.delete('/page/1');
});
```

**获取现有缓存对象**

使用caches.keys

```
caches.keys().then(function(cacheKeys) {
    console.log(cacheKeys); // ['test']
})
```

**删除缓存对象**

使用caches.delete

```
caches.delete('test').then(function() {
    console.log('Cache test successfully deleted!');
})
```