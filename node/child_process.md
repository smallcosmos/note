# child_process

### 衍生子进程

child_process提供衍生子进程的能力，此功能主要由child_process.spawn()函数提供。  
child_process提供了spawn和spawnSync的一些替代方法，这些方法都是基于spawn和spanwnSync实现的。  
包括exec、execSync、execFile、execFileSync、fork  

关键点在于，异步方法均不会阻塞node事件循环，同步方法均会阻塞node事件循环  
spawn衍生子进程执行，exec衍生shell执行，fork衍生nodejs子进程执行，execFile直接衍生命令  
其中，由于fork衍生的是nodejs子进程，并且调用了指定的模块，该模块建立了IPC通信通道，因此具备父进程和子进程通信的能力。  