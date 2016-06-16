title: D语言学习笔记
date: 2016-04-10 10:28:29
tags: [d]
---
## D语言简介
官网简介:<!--more-->
> D is a systems programming language with C-like syntax and static typing. It combines efficiency, control and modeling power with safety and programmer productivity.

 嗯……每个语言的官网都说自己很牛X……
 
 官网还有一小段示例代码，虽然我们不会D，但是我们会C啊，而且这段代码看起来怎么这么像C
```D
// Round floating point numbers
import std.algorithm, std.conv, std.functional,
    std.math, std.regex, std.stdio;

alias round = pipe!(to!real, std.math.round, to!string);
static reFloatingPoint = ctRegex!`[0-9]+\.[0-9]+`;

void main()
{
    // Replace anything that looks like a real
    // number with the rounded equivalent.
    stdin
        .byLine
        .map!(l => l.replaceAll!(c => c.hit.round)
                                (reFloatingPoint))
        .each!writeln;
}
```

仔细看看，虽然乍看和`C++`长得挺像的，但是区别还是不小，`regex`我认识，但是`=>`是什么鬼，`javascript`里的匿名函数？`!`又是什么东西？先留着， 以后再说。

## 使用VSCode配置D语言开发环境

 不得不说`VSCode`是微软近几年最成功的开源项目之一.自从它开始支持插件,我就把免费无限试用的`sublime text`删掉了.虽然`VSCode`的插件系统还并不很完善,但是已经满足日常学习和基础的生产需要了.现在我们来使用VSCode配置D语言的开发环境.

1. 首先我们要下载dlang的编译器

 ~~我选择的是官方的`dmd2`编译器(因为教材使用的是这一个，但是旁边的`llvm`看起来很诱人啊怎么办XD)~~
 
 官方的`dmd`2和`ldc2`我都装了，理由见下

1. 然后安装插件

 ~~`VSCode`有两个包含`dlang`的插件，一个提供语法高亮，另一个提供补全，全都装上XD，然后问题来了，挖掘机……不好意思，拿错剧本了，是`workspace-d`是什么东西，为什么我需要这个？算了，不管三七二十一先装上。于是打开同性交友网站搜索，有个`workspace-d-installer`，clone下来，又缺少一个叫`dub`的东西，呃，装装装，不差这点空间。呃，怎么workspace-d-installer`挂了，教练，这和说好的不一样啊。放狗搜索未果，到`segmentfault`和`stackoverflow`上分别用中文和英文提了问题，结果`sf`上没人理，`so`上把`workspace-d`的作者召唤过来了XD，然后作者表示这是个bug，你丫手动玩去吧，于是**他自己开了个issue**。卧槽，issue居然不让我提=.=，我还怕打扰你们没敢提。不过接触D语言第一天就回馈社区了，想想还有点小激动呢。~~
 
 ~~手动安装`workspace-d`成功，然后……`dfmt`,`dscanner`和`dcd`，失败(据说可以使用`monod`开发D，但是我为什么要在windows上装mono呢XD)~~
 
 安装`VSCode`的两个d语言插件`D language`和`code-d`，然后到d的官网上下载`dub`，准备工作完成。

 到`github`上clone `workspace-d`,使用`install.bat`安装(这里默认需要`ldc2`，可以手动修改源文件将`ldc`换成`dmd`，但是不知道会出什么问题)，出现关于`DCD`,`Dfmt`,`DScanner`的选项时就全选吧，反正我都编译失败了XD。若`workspace-d`编译成功但是三个配件失败，可以到github上分别下载然后手动编译。
 现在我的`VSCode`有提示和高亮，可以格式化代码，但是在关闭时会跳出`dcd`的错误，不知道怎么解决。

 Linux下的安装步骤类似，而且dcd没有错误，好评。

## 进入D语言的世界
 
 首先嘛……按照惯例我们应该先来一段`Hello world`对吧.上帝说我们要有`Hello world`，所以我们就来一段`Hello world`~<br />
代码如下:
```D
import std.stdio; // just import
void main() { // valid, same as int function with 0 returned
    writeln("Hello world"); // print something and a '\n'
}
```
在`VSCode`中的效果如下:

![VSCode](http://7xk052.com1.z0.glb.clouddn.com/dHello.jpg "")

在`D`中，`void main`是**合法**的(除了`C/C++`似乎都是合法的)

另一个例子
```D
void qsort(T)(T[] arr) {
    int i = 0, j = arr.length - 1;
    int mid = i + (j - i) / 2;
    int t = arr[mid];
    arr[mid] = arr[i];
    while (i < j) {
        while (i < j && arr[j] >= t) {
            j--;
        }
        arr[i] = arr[j];
        while (i < j && arr[i] < t) {
            i++;
        }
        arr[j] = arr[i];
    }
    arr[i] = t;
    if (i > 1) {
        qsort(arr[0 .. i]);
    }
    if (arr.length - i > 2) {
        qsort(arr[i + 1 .. $]);
    }
}

unittest {
    auto xs = [1, 3, 2, 0, 5, 4];
    qsort(xs);
    assert(xs == [0, 1, 2, 3, 4, 5]);
}
```

## 下一步呢
我看的是2010年的*The D programming language*，可能有些例子已经过时。后续会更新更多的例子上来，但是目测不会用D做什么看起来有用的项目。

### 参考链接
[dlang]("" https://dlang.org/) <br />
<a href="https://en.wikipedia.org/wiki/D_(programming_language)">wikipedia</a>