title: 动态博客和静态博客-从Tcp-socket谈起(dev)
date: 2016-04-29 17:37:28
tags: [socket, python]
---
前几天一位同学@GodKai让我推荐一个博客系统(因为这个壕新买了一个vps)，然后我就安利了WordPress(php是最好的语言)，顺便推销了一下@冬瓜的vimer-word.github.io。但是这货居然想在vps上搭一个这样的静态页面，<!--more-->简直暴殄天物，于是我果断阻止了这一sb行为。在交谈中我发现这家伙不知道啥交静态博客，于是我觉得可以水一篇文章了，所以就有了下面这一坨东西。

## Web是什么
> 一切B/S架构都是C/S架构。

没错，引用到的这句是我说的。

## Socket
讲到网络，大部分教材都会提到*socket*(剩下的都是2B教材)，*socket*是建立网络通信的接口，分为`tcp`和`udp`两种，`http`协议基于`tcp socket`.

一个最典型的`tcp server`如下:
```Python
#! /usr/bin/python
import socket

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM, 0)
server.bind(('127.0.0.1', 80))
server.listen(20)

while True:
    client, addr = server.accept()
    client.send(b'hello world')
    client.close()
```
这只是一个`tcp server`的例子，而不是一个`http server`，因为它没有实现*http协议*。那么*http协议*又是什么？
## HTTP/1.1
我们来改编一下上面的代码，让它输出收到的信息
```Python
#! /usr/bin/python
import socket

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM, 0)
server.bind(('127.0.0.1', 80))
server.listen(20)

while True:
    client, addr = server.accept()
    text = b""
    while True:
        buffer = client.recv(8192)
        if buffer is None or buffer == b"":
            print("breaking")
            break
        text += buffer
    print(text.decode())
    client.send(b'hello world')
    client.close()
```
然后用*Chrome*(这不是广告)连接到这个*server*，内容如下
```
GET / HTTP/1.1
Host: localhost
Connection: keep-alive
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2717.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
DNT: 1
Accept-Encoding: gzip, deflate,
Accept-Language: zh-CN,zh;q=0.8,en;q=0.6
```
嗯，这一大坨就是`HTTP Header`，我们只看几个最明了的
`GET`是一个`HTTP Method`，另外还有`POST`,`PUT`,`DELETE`。
`/`是路由，我们访问的*url*其实是`localhost/`，如果访问`localhost/hello`，那么得到的路由就是`/hello`。
`User-Agent`表明我们的浏览器版本，我这里是*Chrome 52.0*(别问我版本号怎么飙得这么快)。有的server会根据`User-Agent`返回不同的页面(比如手机版)，还有的会在页面上显示浏览器(比如本文下面的评论，神马，没有评论，你来一句不就好了吗→_→)。

## Nginx(雾)

然而这样还不能算是一个`HTTP server`，因为无论你给的url是什么都会得到相同的返回。
那么我们需要做什么呢，我们要根据`HTTP method`判断请求类型，根据`url`和`content`计算和返回数据。
```Python
#! /usr/bin/python
from socket import *

if __name__ == '__main__':
    serverSocket = socket(AF_INET, SOCK_STREAM, IPPROTO_IP)
    serverSocket.bind(('', 80))
    serverSocket.listen(20)
    while True:
        clientSocket, clinetAddr = serverSocket.accept()
        path = ""
        while True:
            buffer = clientSocket.recv(1024).decode()
            if len(buffer) > 0:
                break
        if buffer[:len('GET ')] == 'GET ':
            page = buffer[len('GET '):]
            end = page.find(' ')

            if end != -1 and page[end + 1 : end + len("HTTP") + 1] == "HTTP":
                path += page[:end]
            else:
                path = "index.html"
        else:
            path = "index.html"
        if path == "/":
            path = "index.html"
        try:
            with open(path) as file:
                clientSocket.send((''.join(file.readlines())).encode())
        except FileNotFoundError as e:
            try:
                with open('404.html') as file:
                    clientSocket.send((''.join(file.readlines())).encode())
            except FileNotFoundError as e:
                clientSocket.send(b"""404""")
        clientSocket.close()
    serverSocket.close()
```
虽然仅限当前目录，但是我们根据路由输出了同名文件，而且对找不到的文件进行了404处理，是不是看起来很像*nginx*呢^_^

当然`HTTP协议`是一个大坑，我们不可能用几十行代码就全部实现，以上基本上只是个引子，提供了一个实现`HTTP协议`的思路。

这种输出静态文件的网站就是静态网站，大名鼎鼎的*github pages*就是这样。
如果我要新建一个页面就必须手动编写页面和超链接吗？当然不会，人总是懒的。有大量工具将简单的*Markdown*文章和特定主题绑定生成静态页面的工具，最著名的有基于*Ruby*的*jekyll*，基于*nodejs*的*hexo*和基于*golang*的*hugo*。

## 最好的语言

那么动态网站又是啥？动态网站可以没有静态的*html* **文件**，而是靠程序生成*html* **字符串**，然后返回给浏览器。最典型的编写动态网站的语言就是*PHP*了， 不愧是最好的语言。一段输出`Hello world`的php代码如下
```PHP
<?php
    echo "Hello world";
?>
```
是不是很简单？但是这个东西怎么运行呢？
PHP自带了一个Web server，只要加上参数-S就可以运行一个简单的服务器，但是我们在生产环境中一般采用Apache/Nginx+fpm的方式运行php，加上最流行的关系型数据库MySQL，就成了传说中的*L/W N/A MP*。

按照前文的规矩，我应该用Python实现一个动态网站了。但是我不打算这么做，因为我有一个用*nodejs*的正在做的动态博客的项目(虽然做了很久了但是现在还没做好，主要原因是懒)。
所以我们用*WordPress*举例吧，enjoy it~