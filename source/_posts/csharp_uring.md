title: C#调用io_uring的一次尝试
date: 2023-04-07 12:32:18
tags: [c#,io_uring]
---

"异步"这个词大概是15年前后日常出现在耳边的, 当时nodejs如日中天, 吹的就是一个异步与高并发. 虽然在之前已经有各种各样的异步lib了, 但感谢nodejs, 把`async`在中国带火

![trends](https://ever17.blob.core.windows.net/blog/async_china.jpg "")

<!--more-->

先背一遍概念, nodejs使用的libuv封装了eventloop, 异步相关的操作放在loop中进行. eventloop底层实现根据平台调用不同的api, linux的epoll, windows的iocp, 以及bsd的kqueue.

一个典型的event loop实现大概是
```c++
while (true) {
  get_events();

  handle_events();
}
```
你说这个太简单了? 我们来看看[真实的例子](https://github.com/libuv/libuv/blob/244df24bf411a396ceaf69f8a80a98e5629ee584/src/unix/core.c#L384 "")
```c
int uv_run(uv_loop_t* loop, uv_run_mode mode) {
  ...

  while (r != 0 && loop->stop_flag == 0) {
    ...

    uv__run_pending(loop);
    uv__run_idle(loop);
    uv__run_prepare(loop);
    
    ...

    uv__io_poll(loop, timeout);

    for (r = 0; r < 8 && !QUEUE_EMPTY(&loop->pending_queue); r++)
      uv__run_pending(loop);
      
    ...
  }

  ...
}
```
再看看[uv__io_poll](https://github.com/libuv/libuv/blob/244df24bf411a396ceaf69f8a80a98e5629ee584/src/unix/posix-poll.c#L134 "")
```c
void uv__io_poll(uv_loop_t* loop, int timeout) {
  ...

  for (;;) {
    nfds = poll(loop->poll_fds, (nfds_t)loop->poll_fds_used, timeout);
    ...

    for (i = 0; i < loop->poll_fds_used; i++) {
      ...
      pe->revents &= w->pevents | POLLERR | POLLHUP;

      if (pe->revents != 0) {
        if (w == &loop->signal_io_watcher) {
          have_signals = 1;
        } else {
          uv__metrics_update_idle_time(loop);
          w->cb(loop, w, pe->revents);
        }

        nevents++;
      }
    }
    ...
  }
}
```
可以看到, 抛开各种细节不谈, 整体的框架符合上面的模型,

再看看chenshuo的[教学框架](https://github.com/chenshuo/muduo/blob/master/muduo/net/EventLoop.cc#L103 "")
```c++
void EventLoop::loop()
{
  ...
  while (!quit_)
  {
    activeChannels_.clear();
    pollReturnTime_ = poller_->poll(kPollTimeMs, &activeChannels_);
    ++iteration_;
    if (Logger::logLevel() <= Logger::TRACE)
    {
      printActiveChannels();
    }
    // TODO sort channel by priority
    eventHandling_ = true;
    for (Channel* channel : activeChannels_)
    {
      currentActiveChannel_ = channel;
      currentActiveChannel_->handleEvent(pollReturnTime_);
    }
    currentActiveChannel_ = NULL;
    eventHandling_ = false;
    doPendingFunctors();
  }

  LOG_TRACE << "EventLoop " << this << " stop looping";
  looping_ = false;
}
```
不愧是教科书, 与我们模型如出一辙 ~~因为我就是看这本书学的~~

看到这里你可能想问, 那么, 这异步到底异在哪里, 不管`get_events`还是`handle_events`不都是同步的函数吗

确实如此, 通常我们实现异步, 理所应当的会想到Queue: 当要执行某个操作的时候, 不是直接执行, 而是塞到队列里, 在另一个处从队列里取出再执行. 实际上epoll也是这么做的, 只不过Queue存在于[内核](https://github.com/torvalds/linux/blob/f2afccfefe7be1f7346564fe619277110d341f9b/fs/eventpoll.c#L177 "")中, 而我们的`get_events`便是将内核队列里的events取出.

这时候你可能又会问, 我知道epoll怎么用了, 那么这和你文章tag里的c# io_uring有什么关系呢.

好吧, 废话完了, 我们进入正题.

众所周知, [C#](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-version-history#c-version-50 "")是最早引入`async/await`来实现异步调用的语言之一. 注意到我没有说`async/await关键字`, 因为这俩加入的太晚了, 如果作为关键字会造成大量legecy代码broken, 毕竟不能让变量名和关键字重名是大部分编程语言的共识. 在现在版本的C#中你仍然可以自定义一个叫`async`的变量. 同时, 在CLR中, 也没有`async/await`的指令, 编译器会将其[编译成StateMachine](https://devblogs.microsoft.com/premier-developer/dissecting-the-async-methods-in-c/ "")来执行. 同时你还可以自己实现[TaskScheduler](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.taskscheduler?view=net-8.0 "")来自定义对`Task`的调度.

背完了概念, 那么, 他的底层实现也是event loop吗. [是的, 没错](https://github.com/dotnet/runtime/blob/d34a2a29e93e2606ff5b4ff2b4f4ba22d81cb57d/src/libraries/System.Net.Sockets/src/System/Net/Sockets/SocketAsyncEngine.Unix.cs#L176 "")
```C#
private void EventLoop()
{
    try
    {
        SocketEventHandler handler = new SocketEventHandler(this);
        while (true)
        {
            int numEvents = EventBufferCount;
            Interop.Error err = Interop.Sys.WaitForSocketEvents(_port, handler.Buffer, &numEvents);
            ...

            if (handler.HandleSocketEvents(numEvents))
            {
                ScheduleToProcessEvents();
            }
        }
    }
    catch (Exception e)
    {
        Environment.FailFast("Exception thrown from SocketAsyncEngine event loop: " + e.ToString(), e);
    }
}
```
注释也提到底层的实现是`epoll/kqueue`: 

> // The responsibility of SocketAsyncEngine is to get notifications from epoll|kqueue
> ...

好, 这下C#的实现我们可以假装搞明白了, 同时我们知道linux 5.1以后提供了io_uring, 那么io_uring也符合最上面给出的模型吗?

首先由于io_uring的用法过于复杂, 作者亲自开发了[一个库](https://github.com/axboe/liburing "")来简化, 虽然还是很复杂.

为了方便演示, 我们来用C#调用liburing, 写一个简单的tcp echo server.

先把liburing头文件里inline的函数导出一下

```c
#define IOURINGINLINE const
#include <liburing.h>
#ifdef __cplusplus
extern "C" {
#endif

#include <setup.c>
#include <queue.c>
#include <register.c>
#include <syscall.c>
#include <version.c>

#ifdef __cplusplus
}
#endif
```

然后引入[Tmds.Libc](https://github.com/tmds/Tmds.LibC "")来调用system api, 再自己导入几个liburing的, e.g.
```C#
[DllImport(LibUringReExportSo, SetLastError = true)]
public static unsafe extern int io_uring_queue_init(uint entries, io_uring* ring, uint flags);

[DllImport(LibUringReExportSo, SetLastError = true)]
public static unsafe extern int io_uring_wait_cqe(io_uring* ring, io_uring_cqe** cqe_ptr);
```

然后就可以愉快的写C#了, 基本原理是从[这里](https://unixism.net/loti/tutorial/webserver_liburing.html "")抄过来的
```C#
public unsafe void ServerLoop(int serverSocket, io_uring* ring)
{
    ...
    AddAcceptRequest(serverSocket, &clientAddr, &len, ring);
    while (true)
    {
        var ret = io_uring_wait_cqe(ring, &cqe);
        var req = (Request*)cqe->user_data;
        switch (req->event_type)
        {
            case EventType.EVENT_TYPE_ACCEPT:
            ...
            case EventType.EVENT_TYPE_READ:
            ...
            case EventType.EVENT_TYPE_WRITE:
            ...
        }
        io_uring_cqe_seen(ring, cqe);
    }
}
```
可以发现, 仍然是上面这一套框架, 甚至这一套自定义event看起来比epoll更加清晰.

那么, 既然epoll和uring在用法上大同小异, 肯定有人想在成熟的框架上加上io_uring的支持, [libuv有](https://github.com/libuv/libuv/issues/1947 ""), [dotnet也有](https://github.com/dotnet/runtime/issues/12650 ""). 如果本文的用法能对集成liburing进入dotnet有所启发就再好不过了~~做梦.jpg~~

以上, 完整demo在[这里](https://github.com/fallenwood/csharp_uring_demo ""), 但是写得非常难看, 而且各种泄露都没修, 能跑就行.