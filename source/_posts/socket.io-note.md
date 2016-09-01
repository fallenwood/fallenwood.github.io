title: socket.io使用笔记
date: 2016-07-16 08:13:36
tags: [js, websocket]
---
由于某些需要，看了一下`socket.io`，并且实现了一个最简单的在线聊天室。<!--more-->

## 基础
`socket.io`的使用似乎没有什么难度，简单来说就是这样(server来自官网的demo)
```js
//server
var io = require('socket.io')();
io.on('connection', function(socket){
  socket.on('event', function(data){});
  socket.on('disconnect', function(){});
  /* do whatever you want */
});
io.listen(3000);

//client
import * as socketio from "socket.io-client";
let socket = socketio("ws://localhost:3000");
socket.emit("new message", {
  title: "wtf"
});
socket.emit("233", "233");
socket.on("wtf", (data) => {
  console.log("wtf");
  console.log(JSON.stringify(data));
});
```
其中`ws://`是websocket协议，但是并不是所有浏览器都支持，所以`socket.io`提供了基于`http`协议的`ajax轮询`来模拟长连接的方法。
```js
let socket = socketio("ws://localhost:3000");
```

## namespace
命名空间(namespace)相当于路由，默认的命名空间为`"/"`
```
let nsp = io.of("/");
```
## room
隐式的二级路由

## example