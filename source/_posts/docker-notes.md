title: docker笔记
date: 2016-06-15 14:55:49
tags: [docker]
---

没错我在腾讯云租了一个服务器，但是现在只有一个`hello world`级别的程序，有兴趣的(好吧我知道你没兴趣)可以[戳进去看看](http://123.206.195.27/ "")，等我有了支付宝以后我会添一个打赏的二维码的，相信我。

*以上为扯淡*
<!--more-->
## Docker
> Docker is "An open platform for distributed applications for developers and sysadmins"

乍看起来`docker`和虚拟化技术很像，但是目的不在此。`Docker`的作用实际上是一个包管理工具，是的，没错，包管理工具。

### 一般流程
我的`docker`一般使用流程为
 1. `pull`一个`image`
 image意为镜像，是docker的基础部分
 1. 使用`Dockerfile`创建一个新的`image`
 Dockerfile是类似于makefile的东西
 1. `save`为`tar`包
 save命令将image转换为tar包
 1. `ftp`上传
 1. `load`出`image`
 load命令从tar包中载入image
 1. 创建`container`
 container为容器，是image的实体，对container的更改不会影响image

另一种使用`docker`的流程为
 1. `pull`一个`image`
 1. 创建`container`
 1. 对`container`进行更改
 1. 将`container`导出为`image`
 1. 发布到私有或公有云
 1. 在生产环境中`pull`

不熟悉业界，不知道哪种方式更加**优雅**，~~但是从我的经验来看，我的方法一般比较属于二哔型的~~

## 常用命令
*`alias 常用 = 我用过的;`*

*以下排名不分先后*
- `docker pull`下载镜像
- `docker images`查看已下载的镜像
- `docker ps`查看容器
- `docker build`构建镜像
- `docker save`保存镜像
- `docker load`载入镜像
- `docker inspect`查看容器信息
- `docker start`开启一个已经关闭的容器
- `docker stop`关闭一个正在运行的容器

## 记一次脑残的(liu)部(shui)署(zhang)
*终于给网站套了一层`nginx`，虽然并没有什么卵用*

首先我们需要一个`nodejs`的镜像，不过由于`dockerhub`上没有官方镜像，所以我用`ubuntu`自己做了一个，然后用ftp扔到了服务器上
获取`ubuntu`
```
docker pull ubuntu:latest
```

打包的`dockerfile`如下，其中`nodejs`是从官网下载的二进制包
```Dockerfile
FROM 2fa927b5cdd3
COPY nodejs /opt/nodejs
RUN ln -s /opt/nodejs/bin/node /usr/bin/node
RUN ln -s /opt/nodejs/bin/npm /usr/bin/npm
```
然后构建镜像
```
docker build -t fw-nodejs .
```
得到镜像后打包
```
docker save -o fw-nodejs.tar.gz bae5c6ab381b
```
上传后载入
```
docker load < fw-nodejs.tar.gz
```
然后启动`docker`，完事大吉(省略了各种踩坑)
```
docker run --name nodeapp -v /home/username/app/app:/webapp:ro -w /webapp -d 24ebaf2b701e node app.js
sudo docker run --name nginxapp -p 80:80 -v /home/username/app/nginx.conf:/etc/nginx/nginx.conf:ro -v /home/username/app/app:/var/share/nginx/html -v /home/username/app/logs:/var/log/nginx -d d29b0bc44f33
```
我的项目目录为`/home/username/app/app`，`/home/username/app/logs`用来存放日志，nginx.conf为配置文件:
```nginx
worker_processes 1;
events {
  worker_connections 1024;
}
http {
  sendfile on;

  server {
    set $node_port 8000;
    root /var/share/nginx/html;
    index index.js index.html index.htm;
    listen 80;
    location / {
      proxy_pass http://172.17.0.2:$node_port$request_uri;
    }
    location ~ /static/ {
    }
  }
}
```
虽然能用了，但是目前还有一个很严重的问题，`docker`引以为豪的`link`似乎并不起作用，我只能手动在`nginx.conf`里输入了`nodeapp`容器的`ip`，~~折腾之路永无止境~~

## 总结

在目前我的这种情况下，使用`docker`并没有带来肉眼可见的优越性，~~但是可以把它当作一个沙箱随便玩而不用担心搞坏环境了~~<nr />
不过对一些需要编译还拖家带口的东西，还有经常出现依赖冲突的东西，`docker`的优势应该比包管理大很多。