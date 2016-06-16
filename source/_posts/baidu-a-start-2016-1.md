title: baidu-a-start-2016-1
date: 2016-05-16 13:38:10
tags: [algorithm]
---

> 百度之星本身其实也不怎么好，都是同行的衬托。

<!--more-->
<hr>
一年一度的度娘之星(年货)又开始了，昨天刚刚去打了资格赛的酱油，深切感受到自己在渣渣的道路上越走越远了。把做出来的和没做出来的题梳理一下，就当为初赛做个预热了。

### <a href="http://bestcoder.hdu.edu.cn/contests/contest_showproblem.php?cid=690&pid=1001">Problem A</a>

一开始没做出来_(:3)JL)_<br />
看出了前缀，如果直接撸前缀需要手撸大数，所以上Java，然后光荣MLE……优化内存，删掉临时数据，然后光荣TLE(我不是针对Java，我是说所有解释型语言，都是渣渣)<br />
可以通过重用+离散化解决gc的问题，但是没心情撸了，就当会做(-,-)。

当然上面这段是我解决后睡着前胡思乱想的结果。
作为半个C++厨(辣鸡语言, 不如D)我肯定先想用C++解决的，而且前缀和同余的特点也是相当明显，所以直接记录前缀积对`MOD`的模，然后找出`prefix[a] * k ≡ prefix[b]　mod MOD`的`k`就好了，水题(虽然想法对但是一开始写错T_T)。

### <a href="http://bestcoder.hdu.edu.cn/contests/contest_showproblem.php?cid=690&pid=1002">Problem B</a>
一开始看到找规律就弃了，直到我的膝盖中了一箭。<br />
**但是这真的不是fibonacci数列吗** <br />
**但是这真的不是fibonacci数列吗** <br />
**但是这真的不是fibonacci数列吗** <br />
搞个原生fib数列出来让我找规律你确定不是侮辱我的智商？难道难点是高精度计算？对不起，我有Java>_>

### <a href="http://bestcoder.hdu.edu.cn/contests/contest_showproblem.php?cid=690&pid=1003">Problem C</a>
字典树，一开始用Java写的居然又TLE了，改成C++就好，水题。

### <a href="http://bestcoder.hdu.edu.cn/contests/contest_showproblem.php?cid=690&pid=1004">Problem D</a>
真·水题，当然我直接用的C++，因为隔壁某哥们用Java超时了。对，我们方法一样。

### <a href="http://bestcoder.hdu.edu.cn/contests/contest_showproblem.php?cid=690&pid=1005">Problem E</a>
模拟？<br/>
不会做，呃，准确的说是有想法不想做，然而不知道这个想法对不对。

<hr />
我去，这么快就写完了。没放代码，水分大干货少，看看文字娱乐一下就行了。<br />
敲代码+水博客，没时间撸物理了Orz