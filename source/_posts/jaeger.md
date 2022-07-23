title: 一个Jaeger Opentelemtry Logs没有生效的问题
date: 2022-07-23 20:10:28
tags: [jaeger,opentelemetry]
---

TL;DR:
[Jaeger 中只实现了 Opentelemetry Protocol 中的 traces , 并没有实现 metrics / logs](https://github.com/jaegertracing/jaeger/blob/ddca3c84c3731025163d5b5bc4b1b648bc904fbf/cmd/collector/app/handler/otlp_receiver.go#L45-L52 "")
```go
func StartOTLPReceiver(options *flags.CollectorOptions, logger *zap.Logger, spanProcessor processor.SpanProcessor, tm *tenancy.TenancyManager) (component.TracesReceiver, error) {
	otlpFactory := otlpreceiver.NewFactory()
	return startOTLPReceiver(
		options,
		logger,
		spanProcessor,
		tm,
		otlpFactory,
		consumer.NewTraces,
		otlpFactory.CreateTracesReceiver,
	)
}
```
<!--more-->

---

## 背景

最近 intern project 需要一个收集 logs 和 telemetry 的功能, 调研了一下把两年前被安利的 jaeger 捡了起来, 然后发现 jaeger 自己的 client 已经被 deprecate 掉了, 换成了叫 opentelemetry 的一听就很厉害的东西, 试了一下能跑起来, 就果断安利给 intern 了.

然后就遇到了问题, 虽然简单的 tracing 可以成功被 jaeger 收集到, 但是 log 毫无效果. 我们的第一反应肯定是 C# 的第三方库又出幺蛾子了, 毕竟 C# 生态堪忧, 出啥问题都正常. 但是为了不冤枉好人, 还是先来抓一下包, 看看到底发生了什么.

## 调查

因为 opentelemetry exporter 默认的 protocol 是 gRPC , 不是很方便抓包, 所以改成 HTTP , 顺便给 HttpClient 设置一下代理

```CSharp
HttpClient.DefaultProxy = new WebProxy("http://127.0.0.1:8888");
var client = new HttpClient();
...
builder.AddOpenTelemetry(options => {
    options
    ...
    .AddOtlpExporter(o => {
        o.HttpClientFactory = () => client,
        o.Protocol = OpenTelemetry.Exporter.OtlpExportProtocol.HttpProtobuf;
    });
});
```
其中`8888`是 fiddler 的端口,

然后发送一个 trace 和一个 log
```CSharp
// Trace
var MyActivitySource = new ActivitySource(serviceName);
using var activity = MyActivitySource.StartActivity("SayHello");
activity?.SetTag("foo", 1);

// Log
var logger = loggerFactory.CreateLogger<Program>();
logger.LogInformation("Hello from {name} {price}.", "tomato", 2.99);
```

到 fiddler 中一看, trace 很成功的发送了出去, jaeger 中也有相关的数据
```
// Request
POST http://localhost:4318/v1/traces HTTP/1.1
Host: localhost:4318
Transfer-Encoding: chunked
Content-Type: application/x-protobuf
...

// Response
HTTP/1.1 200 OK
Content-Type: application/x-protobuf
Date: Sat, 23 Jul 2022 07:17:16 GMT
Content-Length: 0
```
但是 log 炸了
```
// Request
POST http://localhost:4318/v1/logs HTTP/1.1
Host: localhost:4318
Transfer-Encoding: chunked
traceparent: 00-69cd7b094986ac88a25b5b9318cb84fb-bd85ac71e82230a2-01
Content-Type: application/x-protobuf
...

// Response
HTTP/1.1 404 Not Found
Content-Type: text/plain; charset=utf-8
X-Content-Type-Options: nosniff
Date: Sat, 23 Jul 2022 07:17:16 GMT
Content-Length: 19

404 page not found
```

404, 很惊喜, 很有可能`/v1/logs`里有个 typo, 所以我们打算到 jaeger 的源码里看看server是怎么处理这个 path 的. 然而, jaeger 的源码里并没有`/v1/logs`或者`/v1/traces`的字符串, 发生甚么事了.

既然字符串大法失效了, 那我们需要从头来考虑, opentelemetry 相关的东西可能并不是由 jaeger 实现的, 而是直接集成的, 那我们搜一下 opentelemetry 搞不好就能找到有用的东西. 很幸运, 我们直接发现 jaeger 引用了 go.opentelemetry.io/collector, 并且在这个库中找到了[`/v1`开头的3个 path](https://github.com/open-telemetry/opentelemetry-collector/blob/v0.55.0/receiver/otlpreceiver/otlp.go#L180 "").

```go
func (r *otlpReceiver) registerTraceConsumer(tc consumer.Traces) error {
    ...
    if r.httpMux != nil {
		r.httpMux.HandleFunc("/v1/traces", func(resp http.ResponseWriter, req *http.Request) {
```

3 处的代码长得一模一样, 但是在测试中只有`/v1/traces`可以正常使用, 其他两个都是 404. 于是我们直接把代码 build 起来进行一波 debug, 在所有 3 处注册 router 的地方都挂上断点, 发现只有 traces 的部分被调用了, 顺着 call stack 找回去, 发现[华点](https://github.com/jaegertracing/jaeger/blob/ddca3c84c3731025163d5b5bc4b1b648bc904fbf/cmd/collector/app/handler/otlp_receiver.go#L45-L52 "")

```go
func StartOTLPReceiver(options *flags.CollectorOptions, logger *zap.Logger, spanProcessor processor.SpanProcessor, tm *tenancy.TenancyManager) (component.TracesReceiver, error) {
	otlpFactory := otlpreceiver.NewFactory()
	return startOTLPReceiver(
		options,
		logger,
		spanProcessor,
		tm,
		otlpFactory,
		consumer.NewTraces,
		otlpFactory.CreateTracesReceiver,
	)
}
```

## 结论

在 jeager 启动 OTLP 的时候只调用了 traces 的 Reciver, 而没有调用 logs 或者 metrics, 所以这俩都没有生效, 我们发送的 logs 当然也没有出现在 jaeger 的 dashboard 上了.

## 摆烂
问题发现, 任务完成, 修 bug 是不可能修 bug 的, 更何况我根本不会 golang, 剩下的事情就交给 intern 了, 可能是用回旧版本的 jaeger client, 或者去 repo 里面提个 issue, 这个以后再说, 已有的内容够我水一篇文章就行.

## 参考
1. https://github.com/jaegertracing/jaeger/issues/3625