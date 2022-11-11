title: Issue on HttpContext Reuse in SignalR
date: 2022-09-02 22:03:01
tags: [signalr,c#]
---

## Background

I come with a confusing issue when using SignalR SSE ( [ServerSentEvents](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events "") ) : the HttpContext in SignalR Hub is always the same instance, regardless the Get Request to send data to Client, or the Post Request to receive data from Client, which leads to issue when retrieving from Context. <!-- more -->

## Down the rabbit hole

To understand what happened, let's take a look at the source code.

First let's look at ServerSentEventsServerTransport, found HttpContext is passed as parameter,
```CSharp
...
public async Task ProcessRequestAsync(HttpContext context, CancellationToken cancellationToken)
    {
...
```
Then we need to know where the Transport is called, found the only reference in HttpConnectionDispatcher,
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
It would check if Content-Type is `text/event-stream`, which correspond with what we know about SSE, indicating this is where Get long-connection is handled.
The sse object is passed to DoPersistentConnection, let's continue,
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
The second parameter is passed to method of connection, then
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
Got it. The HttpContext is passed from ExecuteAsync to ServerSentEventsServerTransport, so it'd always be the Context from Get Request...

Is it true?

Nope, we only prove the HttpContext from GetRequest would be consumed by Transport, but not say the HttpContext from Post Request would not. Let's go back to HttpConnectionDispatcher to take a look at ExecuteAsync again,

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
Hmm, it's confusing to use overload somethings: the ExecuteAsync metioned above accepts 4 parameters, which is called in the ExecuteAsync accepting 3 parameters, when the Request is Get or Connect, which matches the theory.

And for Post Request, it's handled in ProcessSend of Dispatch,
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
Here is a simplified version, the HttpContext is used here only, except sending error code when something goes wrong, to copy the data fro Post Body.

The other parts acts with the SignalR long connection, so the HttpContext must be the one from Get Request.

## Misc

So, why not Websockets? Because it's not supported by the Reserved Proxy. It would be better if we adopt WS, right? In Websockets, for a SignalR Connection, there is only one HttpContext, which would not be confusing like this.

How about Long Polling? Same to SSE, the Contexts of Post Request are dropped, and we should get difference HttpContext from Get Requests, which is even more terrible.
