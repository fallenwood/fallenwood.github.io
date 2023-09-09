title: Writing a Simple RPC Framework (0)
date: 2023-09-09 13:34:44
tags: [RPC, C#]
---

## Background

When I presented an internal sharing to teammates on how our service works as an RPC server, I wrote [a simple RPC framework](https://github.com/fallenwood/bragiRpc/ "") with C# and MessagePack to demonstrate. <!-- more --> Recently when working on MIT 6.824, I found it's intreseting that golang has a builtin RPC framework inside golang/net, which accepts a string method, and dynamic parameters as requests and responses.

It's definitely not a production-ready framework, but useful for prototyping because we do not need to write protobuf schemas, generate codes or set up an http2 server (yeah compared to gRPC).

As a missing(?) framework for C#, I made some changes to original BragiRpc to make it look like go RPC, and wrote a demo for MapReduce-WordCount.

## The outcome

To use the RPC framework, firstly we need to define the calls, MessagePack is adopeted as the serializar, as I don't want to use the built-in binary fomartter.

The schema and call looks like
```csharp
[MessagePackObject]
public record Args {
  [MessagePack.Key(0)]
  public int A {get;set;}
  [MessagePack.Key(1)]
  public int B {get;set;}
}

[MessagePackObject]
public record Quotient {
  [MessagePack.Key(0)]
  public int Quo {get;set;}
  [MessagePack.Key(1)]
  public int Rem {get;set;}
}

public class Arith {
  public void Divide(Args args, Quotient quo) {
    if (args.B == 0) {
      throw new Exception("divide by zero");
    }
    quo.Quo = args.A / args.B
    quo.Rem = args.A % args.B
  }
}
```

it's exactly the same as [golang's toturial](https://pkg.go.dev/net/rpc ""),

```go
type Args struct {
	A, B int
}

type Quotient struct {
	Quo, Rem int
}

type Arith int

func (t *Arith) Divide(args *Args, quo *Quotient) error {
	if args.B == 0 {
		return errors.New("divide by zero")
	}
	quo.Quo = args.A / args.B
	quo.Rem = args.A % args.B
	return nil
}
```

And to use it on server side, we can create a TCP server like
```csharp
service.Regiseter<Arith>();
var server = new TcpRpcServer(service, endPoint: IPEndPoint.Parse("127.0.0.1:9090"));
await server.StartAsync();
```

Unfortunately, I didn't implement an HTTP server like golang yet. It's OK to show the idea with TCP only.

And on client side, we can call the method with 

```csharp
var client = new TcpRpcClient();
await client.ConnectAsync(IPEndPoint.Parse("127.0.0.1:9090"));

var args = new Args { A = 1, B = 2, };
var reply = new Quotient();

await client.CallAsync("Arith.Divide", args, reply);
```

Not so bad, right?

## Implementation (Server Side)

Firstly let's look at how to implememnt a server.

The general idea is simple:
1. Setup a tcp socket, waiting for clients to connect
2. When client connects, read the packets, run the method, send the response

To parse the incoming requests, we need a protocol to define how it forms. The protocol is simple

1. It has a a fixed header, with 4 int32 in order: payload size, method size, sequence number, and checksum;
2. Then follows a method, it's the string we saw in CallAsync. The size is sent in header before.
3. Then follows the payload, it's serialized by messagepack, can be either request or response

So after parsing the request, we have the RPC method with `ServiceName.MethodName`, we can get the method definition with reflection, and also get the type of request. Then everything ready, we can deserialize the payload to requests, call the method, and send the reply. That's all for servier's side.

## Implementation (Client Side)

Most parts are similar to server's side, the difference is, client needs to take care of the order of responses, if there are multiple requests in one connection.

If there is only one request/response pair, the client can wait for server until the response is sent, everything is fine.

If there are multiple requests, there is no guarantee that responses come with the same order as requests. That's what the sequence number for. When sending a request, we register a callback for the sequence number, and then the response comes for this sequence number, the callback is invoked.

```csharp
var seq = Interlocked.Add(ref this.seq, 1);

var rpcContext = new AsyncRpcContext {
  Callback = buffer => {
    this.ProcessResponse(reply, buffer);
    return ValueTask.CompletedTask;
  },
};

this.rpcContexts.TryAdd(seq, rpcContext);

var methodBody = Encoding.UTF8.GetBytes(method);
var requestBody = MessagePackSerializer.Serialize(args);

await using (var guard = new SemaphoreSlimGuard(this.writeSemaphoreSlim)) {
  await guard.WaitAsync(cancellationToken);

  this.writer.WriteHeaders(requestBody.Length, methodBody.Length, seq, 0);
  this.writer.Write(methodBody);
  this.writer.Write(requestBody);
}

await rpcContext.SemaphoreSlim.WaitAsync(cancellationToken);
```

## MapReduce

As the motivition is the go rpc usage in 6.824, we can implement a word count as the closing. There are no magic in go rather than C#, even though coroutines and channels :)

The WordCount is simple to implement
```csharp
public class WordCount : IMapReduce {
  private static readonly Regex Pattern = new Regex(@"\W+", RegexOptions.Compiled | RegexOptions.IgnoreCase);
  public KeyValuePair<string, string>[] Map(string filename, string contents) {
    var words = Pattern.Split(contents);

    var kvs = words
      .Select(word => new KeyValuePair<string, string>(word, "1"))
      .ToArray();

    return kvs;
  }

  public string Reduce(string key, string[] values) {
    return values.Length.ToString();
  }
}
```

It looks good, at least from console outputs

![MapReduce](https://ever17.blob.core.windows.net/blog/csharp_mr.png "")

More code can be found in the repos under example projects.