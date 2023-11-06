1、查看内存占用前十详情  
```ps aux | sort -k4,4nr | head -n 10```

2、查看端口占用【8080】  
```lsof -i :8080```

3、查看pid内存占用【26080】  
```top -p 26080```

4、查看内核日志， 比如排查linux内核oom killer日志。  
```dmesg```  

## 问题排查

#### Q：使用腾讯轻服务器2m内存会遇到内存不足关键进程被杀的case。  
A： [为什么我的next dev进程一直被kill](https://cloud.tencent.com/developer/article/1816470)  
