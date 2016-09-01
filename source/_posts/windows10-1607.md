title: windows10-1607
date: 2016-08-02 22:37:49
tags: [windows, linux]
---

时隔一年，win10带着linux子系统回归，在第一时间装上红石以后马上来测试传说中的ubuntu，但是问题太多无力吐槽，希望官方能尽快修复，否则这个东西只能算是个玩具罢了。
<!--more-->

- Windows下的分区挂载在`/mnt`

- lxss的文件在`$HOME\AppData\Local\lxss`

- Linux与Windows共用端口

- ~~不要用Windows下的软件直接编辑Linux的文件~~

### Install
打开开发者模式，在ps里输入bash，然后等待或者很长或者很短的全看墙的力度的时间，就进入传说中的`LinuX Sub System`了。初始化时需要设置用户名密码，当然还是最常用的虚拟机管理密码`123456`，然后就打开了bash。

## Uninstall
由于子系统相当于一个虚拟机，所以玩坏了重新安装就行。`lxss /uninstall`

## Update
~~拿到Ubuntu14.04以后要做的15件事~~ 修改sources.list把软件源换到tuna，然后更新
```
$ sudo apt update -y && sudo apt upgrade -y
```
但是这个两年前的LTS版真心太旧，于是作死升级
```
$ sudo do-release-upgrade
```
然后失败，到gayhub上找到解决方案
```
$ sudo do‐release‐upgrade ‐f DistUpgradeViewNonInteractive ‐d
```
更新中途会出现询问，强制结束后
```
$ echo 'yourpasswordhere' | sudo ‐S dpkg ‐‐configure ‐a
```
然后一切正常

## Configure
首先当然是最最喜闻乐见的`oh my zsh`了，一切正常。

安装`nodejs`，不得不吐槽`ubuntu`源里的`node`版本简直太低，所以使用`nvm`

安装`python`，包括`2`和`3`，不懂他们混乱的python世界，据说这叫`优雅`?

安装`llvm`，一代神器llvm，让创造一个高效的新语言变得如此简单，以至于一群连基本的类型系统都不懂的人都造出了编程语言。

安装`neovim`，因为原版的`vim`没有`python3`的支持

以上，一切正常

安装`jdk`(不是openjdk)，javac命令卡死，所以关于JavaWeb和Androd的一切东西都不能正常运行了

安装`docker`，不能运行

安装`ruby`，好吧我还没试，不过Jruby看起来是跪了

没跑任何`GUI`程序，听说可以在win下跑xserver，lxss下跑xclient来实现GUI
