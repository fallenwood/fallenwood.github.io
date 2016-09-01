title: 配置VSCode
date: 2016-05-24 13:29:12
tags: [vscode, c++, js, go, python]
---

Visual Studio Code(以下简称VSCode或Code)是由大巨硬开发的一款跨平台的文本编辑器。它与Atom采用类似的架构，使用HTML渲染页面，并且将网页封装在一个Chrome浏览器中，因此具有很强的扩展能力~~和很慢的启动速度~~。

<!-- more -->

~~目前为止，VSCode 的最新版本为1.1，距离最初的0.1已经过了一年，~~虽然插件还不是很丰富，但是最常用的一些还是有的，而且有几个用起来特别舒服。本文将分享一些把VSCode配置为轻量IDE的经验，仅供参考，不足之处还请在评论中指出。

*注: 2016.08.31更新，最新版为1.4.0*

---

卖个安利，这里有VSCode文档的[中文翻译](https://github.com/jeasonstudio/CN-VScode-Docs "")，~~不过翻译还在进行中我也不知道哪天能翻译完，而且就算翻译完了官方更新我们也不一定能及时跟进，而且都是民间翻译的质量堪忧啊，主要是因为水货太多比如我~~。

---


## 全局配置

本渣渣不负责手把手的配置教学(比如怎么安装插件，怎么打开控制台，怎么打开配置文件，etc)，这些东西请左转官网[VSCode](https://code.visualstudio.com "")自行解决。

 ### window, editor
```JSON
{
  "window.openFilesInNewWindow": true,
  "window.reopenFolders": "all",
  "editor.fontSize": 16,
  "editor.tabSize": 2,
  "editor.formatOnType": true,
  "editor.renderWhitespace": true,
  "editor.wordSeparators": "`~!@#$%^&*()=+[{]}\\|;:'\",.<>/?"
}
```
个人使用的全局配置如上，这些配置项都有英文解释的，不需要我来一一赘述。

值得一提的是`"files.associations"`选项，可以将扩展名为`html`绑定到`jinja`或者`nunjucks`上，虽然对这种模版的支持挺呵呵的，但是好歹有高亮了。

 ### git
```JSON
{
  "git.enabled": true,
  "git.autofetch": false,
  "git.path": "git.exe",
}
```
我的git全局配置使用`git config`设置过了，所以就没怎么动\_(:3)JL)\_

不过`code`不能识别`msys2`的`git`(bug?)，所以我用了`sourcetree`的内嵌git

 ### terminal
1.2版本的`VSCode`最大的特点就是自带了一个集成的终端，从此可以告别`shell`和`editor`来回切换的日子了。
但是这个终端，目前为止在我手上还有问题，比如~~不能正常显示汉字~~(已在1.3版本中修复)，~~不能复制粘贴~~(已在1.4版本中修复)。

```JSON
"terminal.integrated.shell.windows": "C:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe",
```

## Javascript

`VSCode`自带了`npm`,`gulp`和`grunt`的task配置和`nodejs`的`launch`配置，我没需要改o.o

 ### javascript

首先我们需要安装插件，我选择使用[`eslint`](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint "")代替`jslint`，需要`nodejs`来安装[`eslint`](https://www.npmjs.com/package/eslint "")。

[eslint配置](https://github.com/fallenwood/dotfiles/blob/master/linter/.eslintrc.js "")

 ### typescript
[`typescript`](https://www.typescriptlang.org/ "")([中文网](http://www.tslang.cn/ ""))是微软发行的一个可以编译成`javascript`的静态类型语言，是`javascript`的超集，支持`es6`语法。

~~虽然安装了[`tslint`](https://www.npmjs.com/package/tslint "")插件，但是没配置，以后补上。~~

我的`tslint`[配置](https://github.com/fallenwood/dotfiles/blob/master/linter/tslint.json "")基本照搬了官网的demo

 ### 第三方库和nodejs
虽然`VSCode`本身带有了一定的代码提示，但是对于第三方库的补全却不是很够用。为了弥补这个功能，可以使用[`TypeScript Definition`](http://definitelytyped.org/ "")来增强补全。<br />
虽然可以手动下载`tsd`文件，但是我选择使用[`typings`](https://www.npmjs.com/package/typings "")<br />
以`node`为例

1. `npm i typings -g`
1. 在项目目录中`typings init`
1. 还是在项目目录中`typings install dt~node --global --save`
1. 在代码头部引入`/// <reference path="typings/index.d.ts" />`

然后，就没有然后了

 ### jsdoc
 [document this](https://marketplace.visualstudio.com/items?itemName=joelday.docthis "")可以给函数等生成jsdoc。

 [js doc tags](https://marketplace.visualstudio.com/items?itemName=HookyQR.JSDocTagComplete "")提供了jsdoc的补全。

## Vue
似乎除了高亮根本没有支持……所以我现在再用SublimeText写前端(顺带一提，Sublime的Anaconda插件对Python的支持很爽)

## HTML

似乎自从某一次更新以后，`html`的[`snippets`](https://marketplace.visualstudio.com/items?itemName=abusaidm.html-snippets "")就从自带变成了插件，不过不要紧，我们把插件装上就可以了。

由于自带了[`emmet`](http://emmet.io/ "")，写起来还是很舒服的
 ### nunjucks
`nunjucks`是一个`nodejs`的`html`模板，它的语法和`python`的`jinja2`很像。可以安装插件显示`nunjucks`的高亮，但是不能调用html的补全(通过修改插件可以)。

### Debugger for chrome
据说可以在Chrome里调试js，但是并没有这种需求所以没用过


基本配置如下
```JSON
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome against localhost, with sourcemaps",
      "type": "chrome",
      "request": "launch",
      "runtimeExecutable": "chrome --debug-port=9222",
      "url": "http://localhost:8080",
      "sourceMaps": true,
      "webRoot": "${workspaceRoot}"
    },
    {
      "name": "Attach to Chrome, with sourcemaps",
      "type": "chrome",
      "request": "attach",
      "port": 9222,
      "sourceMaps": true,
      "webRoot": "${workspaceRoot}"
    }
  ]
}
```
当然了，要在本地服务器上调试web页面，首先需要有一个`http server`，对我来说最简单的静态服务器就是`php -S 0.0.0.0:8080`，嗯没错，php(光速逃)

## C/C++

### clang

安装插件[`clang-format`](https://marketplace.visualstudio.com/items?itemName=kube.ClangComplete ""),[`c/c++`](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools "")和[`c/c++ clang`](https://marketplace.visualstudio.com/items?itemName=mitaki28.vscode-clang "")，但是补全和格式化需要额外安装[`clang`套装](http://llvm.org/ "")。

`clang`是一个编译器前端，以与`gcc`的兼容性，完善的标准支持和友好的错误提示著称。在`Linux`和`MacOSX`中可以方便的安装，但是在`Windows`下略有区别。`VS2015 U2`集成了一个`clang`前端，但是并不知道是否能用来提示。另一个安装二进制的方法是通过`msys2`，当然很多人并不用它。剩下来的大概只有编译安装了，这是个货真价实的大坑。

```JSON
{
  "clang-format.formatOnSave": false,
  "clang.cflags": [
    "-std=c99",
    "-Wall",
    "-I${workspaceRoot}/include",
    "-I${cwd}"
  ],
  "clang.cxxflags": [
    "-std=c++14",
    "-Wall",
    "-Weffc++",
    "-I${workspaceRoot}/include",
    "-I${cwd}"
  ],
}
```

### cpptools
在我刚开始写这一篇的时候，微软官方的cpptools还是一坨烂翔，不过经过几次升级以后越来越好用了。~~虽然我个人觉得还是没有clang好用~~
在`#include`预处理的绿线处放鼠标会出来灯泡，点一下会冒出来一个`c_cpp_properties.json`，根据平台配置一下头文件的位置就可以支持补全了

虽然理论上以巨硬的水平做出来的补全应该是基于语义，但是给我的感觉好像是基于tag的……没有阅读代码，真是惭愧。
详情可以参考[官方文档](http://code.visualstudio.com/docs/languages/cpp "")，似乎有人翻译了这一篇，我去找找嗯，在[这里](https://github.com/jeasonstudio/CN-VScode-Docs/blob/master/md/%E8%AF%AD%E8%A8%80/cpp.md "")，还没翻译完。(2016.8.26)

### 编译和调试
`C++`的编译可以通过`make`实现，不过在Windows上表现的不是很好，所以我自己写了`makefile`和`tasks.json`

```makefile
all:
  g++ -Wall -Weffc++ -std=c++1y -static -g -o a.out *.cpp

clean:
  rm -rf *.o a.out
```

```JSON
{
  "version": "0.1.0",
  "command": "mingw32-make",
  "isShellCommand": true,
  "showOutput": "always",
  "suppressTaskName": true,
  "tasks": [
    {
      "taskName": "all",
      "args": [
        ""
      ]
    },
    {
      "taskName": "clean",
      "args": [
        "clean"
      ]
    }
  ],
  "problemMatcher": {
    "owner": "cpp",
    "fileLocation": [
      "relative",
      "${workspaceRoot}"
    ],
    "pattern": {
      "regexp": "^(.*):(\\d+):(\\d+):\\s+(warning|error):\\s+(.*)$",
      "file": 1,
      "line": 2,
      "column": 3,
      "severity": 4,
      "message": 5
    }
  }
}
```

官方的C++插件自带了调试功能，但是我没有成功使用过，群里的聚聚反馈说这个插件不能打断点，所以我推荐另一个插件[native debugger](https://marketplace.visualstudio.com/items?itemName=webfreak.debug "")
```JSON
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug",
      "type": "gdb",
      "request": "launch",
      "target": "./a.out",
      "cwd": "${workspaceRoot}",
      "preLaunchTask": "all"
    }
  ]
}
```
demo<br/>
![demo](http://7xk052.com1.z0.glb.clouddn.com/QQ%E5%9B%BE%E7%89%8720160802223350.png "")

<div hidden>不知道我的ycm插件会跳票到什么时候555</div>

## Go
安装[`go`插件](https://marketplace.visualstudio.com/items?itemName=lukehoban.Go "")，然后fq下载go自己的一堆插件
```JSON
{
  "go.vetOnSave": true,
  "go.lintOnSave": true,
  "go.buildOnSave": false,
  "go.formatTool": "gofmt",
  "go.useCodeSnippetsOnFunctionSuggest": true,
}
```

`go`的插件带了调试选项，但是`build`和`run`需要我们自己写task

## Python
安装[`python`插件](https://marketplace.visualstudio.com/items?itemName=donjayamanne.python "")，然后配置一下，基本是开箱即用
```JSON
{
  "python.linting.pep8Enabled": true,
  "python.pythonPath": "python.exe",
}
```
然后安装一堆`pip`的包,比如`autopep8`什么的
```
pip install autopep8
```

## Java
[java插件](https://marketplace.visualstudio.com/items?itemName=georgewfraser.vscode-javac "")在我的机器上没有效果

## CSharp
[插件地址](https://marketplace.visualstudio.com/items?itemName=ms-vscode.csharp "")

~~`VSCode`的C#补全使用的是`dotnet core`提供的，编译task有`msbuild`和`dotnet core`两种，但由于我不会C#，所以我什么都不知道。~~

`dotnet core 1.0`正式发布了，但是`SDK`还是preview版本。配好环境变量以后用`dotnet`新建项目，然后就能用`VSCode`编辑了。到底是巨硬亲儿子，`C#`的支持程度与`Javascript`有的一拼。

我的vscode并不能直接在cs文件中使用format命令，但是提供了format on type的功能，并不知道是什么问题。

### [Nuget](https://marketplace.visualstudio.com/items?itemName=ksubedi.net-core-project-manager "")
安装dotnet core工程的依赖包

## PHP

~~我好像只装了~~ `PHP code format`，其他的也就配一下可执行文件的目录，而且我自从使用`VSCode`以后就没写过`PHP`(虽然原来也没写过多少)。

另外有`Crane`插件，似乎是提供补全等功能的。

PS.目前似乎没有`peek definition`一类的功能。

## Powershell

`Powershell`是`.Net`平台上的一门脚本语言，~~VSCode提供了一些基本的补全和tags~~，现在似乎有智能感知了(看我学会了一个高大上的词)。

## 其他

 ### [vscode-icons](https://marketplace.visualstudio.com/items?itemName=robertohuertasm.vscode-icons "")
 显示文件图标的插件，效果如下<br/>
 ![vscode-icons](http://7xk052.com1.z0.glb.clouddn.com/vscode-icons.jpg "")<br />
 在windows下需要以鹳狸猿身份打开Code，然后enable这个插件。其他平台未测试。

 <small>由于这个插件的原理是替换VS Code的文件，所以在更新过程中经常挂掉，如果对稳定性要求高还是等官方的icon出来吧</small>

 ### [vscode-file-header-comment-helper](https://marketplace.visualstudio.com/items?itemName=Gigabyte-Giant.vscode-file-header-comment-helper "")
一个可以在文件开头加上特定文本的插件，比如`#! /user/bin/env python`一类的东西。

 ### [background](https://marketplace.visualstudio.com/items?itemName=shalldie.background "")
 我没有这种奇奇怪怪的需求

 ### 我的hexo tasks
我的博客是使用`hexo`搭建在`github pages`上的，使用`VSCode`作为`Markdown`编辑器，所以配置了`hexo`的`tasks`用来生成和部署。
```JSON
{
  "version": "0.1.0",
  "command": "hexo",
  "isShellCommand": true,
  "showOutput": "always",
  "suppressTaskName": true,
  "tasks": [
    {
      "taskName": "Generate",
      "args": ["g"]
    },
    {
      "taskName": "Deploy",
      "args": ["d"]
    },
    {
      "taskName": "Generate and Deploy",
      "args": ["d", "--g"]
    },
    {
      "taskName": "Serve",
      "args": [
        "s"
      ]
    }
  ]
}
```

 ### 连体字
 我真的不懂什么人才能有这种需求……<br />
 不过既然遇(you)上(ren)了(wen)就顺便提一下
 效果图 <br />
 ![fontLigatures](http://7xk052.com1.z0.glb.clouddn.com/QQ%E5%9B%BE%E7%89%8720160616152212.jpg "") <br />
 需要改的配置也很少，就一个
 ```JSON
 "editor.fontLigatures": true
 ```
 然后，很重要，把字体改成支持连体字的，解决，可参考[issue](https://github.com/Microsoft/vscode/issues/192 "")图片所示的字体为[FiraCode](https://github.com/tonsky/FiraCode "")

 ### [彩虹括号](https://marketplace.visualstudio.com/items?itemName=2gua.rainbow-brackets "")
 酷炫的特效(逃)

 ### [Project Manager](https://marketplace.visualstudio.com/items?itemName=alefragnani.project-manager "")
 可以保存工程和在工程间切换

 ### [File Peeker](https://marketplace.visualstudio.com/items?itemName=abierbaum.vscode-file-peek "")
 类似于Peek Definition，可以查看文件

 ### [Path Intellisense](https://marketplace.visualstudio.com/items?itemName=christian-kohler.path-intellisense "")
 自动补全路径

 ### monokai
 自带的主题

 ### 补一张截图
![vscode](http://7xk052.com1.z0.glb.clouddn.com/QQ%E6%88%AA%E5%9B%BE20160715151647.jpg "")

## 总结
`VSCode`对我这种以`Javascript`为主力语言的伪全栈码畜非常够用，对其他的一些语言也有支持。相比于使用同种技术的`Atom`，`VSCode`虽然快，但是插件远不如`Atom`丰富，可定制性也较低，算是`Code`的一个硬伤。
另一个急缺的特性是内置的`repl`，虽然有集成的终端但是功能还不足。