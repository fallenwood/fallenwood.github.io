title: 关于换了个Site Generator这件事
date: 2026-01-18 13:14:03
tags: [c#]
---

趁着周末 ~~和AI~~ 把拖了很久的换 *Static Site Generator (SSG)* 的事情办了, 倒不是对 *Hexo* 有什么意见, 只是不想在各种电脑上都装 nodejs/bun+一大堆 node_modules 了, 所以想搞个 **native** 一点的解决方案. <!---more--> 所以一直想用 c# 来搞一个版本.

众所周知, *c#* 官方自带一个 *Razor* 的模板引擎, 可以说是非常强悍了, 但是拿来搞 *SSG* 多少有点水土不服, 第三方的 *Scriban* 体验又很差 ~~好像不支持 {% base %} ~~, 所以, 开摆.

直到前两天看到了[*minijinja* 移植到 *go* 的新闻](https://x.com/mitsuhiko/status/2010980637059002605?s=20 ""), 等会儿你们 *minijinja* 不是用 *parser combinator* 写的吗, 移植这么方便吗. 看了一眼 *minijinja-go* 的源码, 好像还确实挺简单的,于是 让 Copilot 直接照着 *go* 版本抄了一份 [c# 版本](https://github.com/fallenwood/minijinja-csharp "") 出来, 虽然用了反射不太好 trim, 但是能用就行.

然后就开心的让 Copilot 继续写了份 *SSG* 出来, 也就是现在新换上的这个, 虽然功能缺的挺多, UI也多少有点丑, 但是能用就行.

*SSG* 目前还在继续 ~~让 Copilot~~ 开发, 等弄好之后会开源出来 ~~下一个有生之年~~.
