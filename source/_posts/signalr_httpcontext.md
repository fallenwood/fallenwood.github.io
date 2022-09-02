title: SignalR中HttpContext复用的问题
date: 2022-09-02 22:03:01
tags: [signalr,c#]
---

## 背景

使用 SignalR SSE ( [ServerSentEvents](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events "") ) 时候遇到一个奇怪的现象, 我们对接 SignalR Hub 的代码, 不管是向 Client 发送数据的 Get Request, 还是从 Client 接收数据的 Post Request, 拿到的 HttpContext 都是同一个, 导致从 Context 读取到的东西有问题. <!-- more -->

## 看源码

为了理解 SignalR 背后到底发生了什么, 我们来看看源码.

首先找到 ServerSentEventsServerTransport (直接找名字包含 ServerSentEvents 的文件, 凭直觉就是它), 发现 HttpContext 是从外面传入的,
```CSharp
...
public async Task ProcessRequestAsync(HttpContext context, CancellationToken cancellationToken)
    {
...
```
于是看一下哪里使用到了这个 Transport, 发现仅在 HttpConnectionDispatcher 中有引用,
```CSharp
    private async Task ExecuteAsync(HttpContext context, ConnectionDelegate connectionDelegate, HttpConnectionDispatcherOptions options, ConnectionLogScope logScope)
    {
        ...
        // Server sent events transport
        // GET /{path}
        // Accept: text/event-stream
        if (headers.Accept?.Contains(new Net.Http.Headers.MediaTypeHeaderValue("text/event-stream")) == true)
        {
            ...

            // We only need to provide the Input channel since writing to the application is handled through /send.
            var sse = new ServerSentEventsServerTransport(connection.Application.Input, connection.ConnectionId, connection, _loggerFactory);

            await DoPersistentConnection(connectionDelegate, sse, context, connection);
            ...            
```
检查 Content-Type 是否为 `text/event-stream`, 和我们印象中的 SSE 一致, 说明这里就是处理 Get 长连接的地方.
创建出来的 sse 被传入 DoPersistentConnection 中, 接着看代码,
```CSharp
    private async Task DoPersistentConnection(ConnectionDelegate connectionDelegate,
                                              IHttpTransport transport,
                                              HttpContext context,
                                              HttpConnectionContext connection)
    {
        if (connection.TryActivatePersistentConnection(connectionDelegate, transport, context, _logger))
        {
            // Wait for any of them to end
            await Task.WhenAny(connection.ApplicationTask!, connection.TransportTask!);

            await _manager.DisposeAndRemoveAsync(connection, closeGracefully: true);
        }
    }
```
第二个参数又被传入了 connection 的 method 里, 继续,
```CSharp
    internal bool TryActivatePersistentConnection(
        ConnectionDelegate connectionDelegate,
        IHttpTransport transport,
        HttpContext context,
        ILogger dispatcherLogger)
    {
                ...
                // Start the transport
                TransportTask = transport.ProcessRequestAsync(context, context.RequestAborted);
                ...
```
有了, 这个 HttpContext 从 ExecuteAsync 一路传进了 ServerSentEventsServerTransport 里面, 所以 Transport 中使用的 HttpContext 全部都是 Get Request 的 Context...

吗?

不行, 我们只能说 Get Request 的 HttpContext 最终会被 Transport 使用, 而不能说明 Post Request 的就不会, 于是往回找到 HttpConnectionDispatcher, 再来看看 ExecuteAsync 被用到的地方,
```CSharp
    public async Task ExecuteAsync(HttpContext context, HttpConnectionDispatcherOptions options, ConnectionDelegate connectionDelegate)
    {
            ...
            if (HttpMethods.IsPost(context.Request.Method))
            {
                // POST /{path}
                await ProcessSend(context);
            }
            else if (HttpMethods.IsGet(context.Request.Method) || HttpMethods.IsConnect(context.Request.Method))
            {
                // GET /{path}
                await ExecuteAsync(context, connectionDelegate, options, logScope);
            }
            ...
        }
    }
```
Hmm, 重载有时候确实很 confusing, 我们上文提及的 ExecuteAsync 接受 4 个参数, 在当前接受 3 个参数的 ExecuteAsync 中被调用, 正好是在 Get 和 Connect Request 的情况下, 与我们的猜想一致.
而 Post Request, 被 Dispatch 到了 ProcessSend 函数里面,
```CSharp
    private async Task ProcessSend(HttpContext context)
    {
            ...
            try
            {
                try
                {
                    await context.Request.Body.CopyToAsync(connection.ApplicationStream, bufferSize);
                }
            ...
    }
```
精简了一下, 除了出错时候写个错误码回去, HttpContext 只在这里被使用了, 而且也只是复制了 Post Body 的内容, 其他所有部分都没有被用到.

而我们的其他代码都是和 SignalR 的长连接中执行的, 获得的 HttpContext 自然也都是 SSE Get Request 的 Context (真的吗, 我并没有仔细看过这部分代码, 而且这部分是内部代码不好写出来), 所以就(假装)破案了.

## 其他

为什么不用 Websockets? 我也想用, 但是公司的 Reserved Proxy 并不支持 Websockets. 如果有 WS 用情况将会, 好很多, 吗? 在 Websockets 中, 对于一个 SignalR connection, 应该只会存在一个 HttpContext, 也就是理论上讲并不会出现本文中出现的问题.

那么 Long Polling 呢, 和 SSE 一样, 也会出现 Post Request 的 Context 获取不到的问题, 但是我们并不会每次都获取到相同的 HttpContext, 而是每次都不一样, 想想更抓狂了. 

Websockets 大法好.