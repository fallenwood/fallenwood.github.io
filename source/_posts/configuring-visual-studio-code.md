title: 配置VSCode(长期更新)
date: 2016-05-24 13:29:12
tags: [vscode, c++, js, go, python]
---

Visual Studio Code(以下简称VSCode或Code)是由大巨硬开发的一款跨平台的文本编辑器。它与Atom采用类似的架构，使用HTML渲染页面，并且将网页封装在一个Chrome浏览器中，因此具有很强的扩展能力~~和很慢的启动速度~~。

<!-- more -->

~~目前为止，VSCode 的最新版本为1.1，距离最初的0.1已经过了一年，~~虽然插件还不是很丰富，但是最常用的一些还是有的，而且有几个用起来特别舒服。本文将分享一些把VSCode配置为轻量IDE的经验，仅供参考，不足之处还请在评论中指出。

*注: 2016.06.16更新，最新版为1.2.1*

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

不过code不能识别`msys2`的git，所以我用了sourcetree的内嵌git

 ### terminal
1.2版本的VSCode最大的特点就是自带了一个集成的终端，从此可以告别shell和editor来回切换的日子了。
但是这个终端，目前为止在我手上还有问题，比如不能正常显示汉字，不能复制粘贴。

```JSON
"terminal.integrated.shell.windows": "C:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe",
```

## Javascript

`VSCode`自带了`npm`,`gulp`和`grunt`的task配置和`nodejs`的launch配置，我没需要改o.o

 ### javascript

首先我们需要安装插件，我选择使用`eslint`代替`jslint`，需要`nodejs`来安装`eslint`。

[eslint配置](https://github.com/fallenwood/dotfiles/blob/master/linter/.eslintrc.js "")

 ### typescript
`typescript`是微软发行的一个可以编译成`javascript`的静态类型语言，是`javascript`的超集，支持`es6`语法。

~~虽然安装了`tslint`插件，但是没配置，以后补上。~~

我的`tslint`[配置](https://github.com/fallenwood/dotfiles/blob/master/linter/tslint.json "")基本照搬了官网的demo

 ### 第三方库和nodejs
虽然`VSCode`本身带有了一定的代码提示，但是对于第三方库的补全却不是很够用。为了弥补这个功能，可以使用[`TypeScript Definition`](http://definitelytyped.org/ "")来增强补全。<br />
虽然可以手动下载`tsd`文件，但是我选择使用`typings`<br />
以`jquery`为例

1. `npm i typings -g`
1. 在项目目录中`typings init`
1. 还是在项目目录中`typings install jquery --global --save`
1. 在代码头部引入`/// <reference path="typings/index.d.ts" />`

然后，就没有然后了

## HTML
似乎自从某一次更新以后，`html`的tags就从自带变成了插件，不过不要紧，我们把插件装上就可以了。

 ### nunjucks
`nunjucks`是一个`nodejs`的html模板，它的语法和python的`jinja2`很像。可以安装插件显示`nunjucks`的高亮，但是补全目前还很不足。

## C/C++
安装插件`clang-format`,`c/c++`和`c/c++ clang`，但是补全和格式化需要额外安装`clang`套装。

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

`C++`的编译可以通过`make`实现，不过在Windows上表现的不是很好，所以我自己写了`makefile`和`tasks.json`

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
      "taskName": "debug",
      "args": [
        "debug"
      ]
    },
    {
      "taskName": "clean",
      "args": [
        "clean"
      ]
    },
    {
      "taskName": "test",
      "args": [
        ""
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
## Go
安装lukehoban开发的`go`插件，然后fq，再下载go自己的一堆插件
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
安装jayamanne开发的`python`插件，然后配置一下，基本是开箱即用
```JSON
{
  "python.linting.pep8Enabled": true,
  "python.pythonPath": "python.exe",
}
```
然后安装一堆pip的包,比如`autopep8`什么的

## CSharp
`VSCode`的C#补全使用的是`dotnet core`提供的，编译task有`msbuild`和`dotnet core`两种，没有细究，不敢乱说。

## PHP
我好像只装了`PHP code format`，其他的也就配一下可执行文件的目录，而且我自从使用`VSCode`以后就没写过`PHP`(虽然原来也没写过多少)，所以也不敢乱说。

PS.目前似乎没有`peek definition`的功能

## 其他

 ### vscode-file-header-comment-helper
一个可以在文件开头加上特定文本的插件，比如`#! /user/bin/env python`一类的东西。


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

 ### 补一张截图
![vscode](http://7xk052.com1.z0.glb.clouddn.com/VSCode20160529143308.jpg "")