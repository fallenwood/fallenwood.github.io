title: PL/0前端与解释器实现
date: 2015-12-24 15:39:24
tags: [compiler, c++]
---

>把前面挖的坑都弃了

编译原理的第一个大作业是实现PL/0语言，经过了长达40天的跳票终于在前天开始<!--more-->动手并且在昨天基本完成，暂时写一篇文章冷静一下，顺便整理一下思路。

## What is PL/0

[wikipedia]("" https://en.wikipedia.org/wiki/PL/0)
摘录如下:
> The other PL/0, covered here, <br/>
is similar to but much simpler than the general-purpose programming language Pascal, <!--more--><br/>
intended as an educational programming language.<br/>
It serves as an example of how to construct a compiler. <br/>

`PL/0`是[Pascal]("" https://en.wikipedia.org/wiki/Pascal_(programming_language))语言的一个图灵完备的简化版，<s>语法简单适合来给小朋友们当大作业</s>。
`PL/0`的语法如下([EBNF]("" https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_Form)表示)
```
program = block "." .

block = [ "const" ident "=" number {"," ident "=" number} ";"]
        [ "var" ident {"," ident} ";"]
        { "procedure" ident ";" block ";" } statement .

statement = [ ident ":=" expression | "call" ident 
              | "?" ident | "!" expression 
              | "begin" statement {";" statement } "end" 
              | "if" condition "then" statement 
              | "while" condition "do" statement ].

condition = "odd" expression |
            expression ("="|"#"|"<"|"<="|">"|">=") expression .

expression = [ "+"|"-"] term { ("+"|"-") term}.

term = factor {("*"|"/") factor}.

factor = ident | number | "(" expression ")".
```

## Implement of tokenizier
`PL/0`语言的词法单元如下
```
class Symbol {
public:
    static const int nul = 0;
    static const int ident = 1;        // Identifier
    static const int plus = 2;         // +
    static const int minus = 3;        // -
    static const int mul = 4;          // *
    static const int div = 5;          // /
    static const int oddsym = 6; 
    static const int number = 7;       // Number
    static const int eql = 8;          // =
    static const int neq = 9;          // <>
    static const int lss = 10;         // <
    static const int geq = 11;         // >=
    static const int gtr = 12;         // >
    static const int leq = 13;         // <=
    static const int lparen = 14;      // (
    static const int rparen = 15;      // )
    static const int comma = 16;       // ,
    static const int semicolon = 17;   // ;
    static const int peroid = 18; 
    static const int becomes = 19;
    static const int beginsym = 20;    // begin
    static const int endsym = 21;      // end
    static const int ifsym = 22;       // if
    static const int thensym = 23;     // then
    static const int whilesym = 24;    // while 
    static const int dosym = 27;       // do
    static const int callsym = 28;     // call
    static const int constsym = 29;    // const
    static const int varsym = 30;      // var
    static const int procsym = 31;     // procedure
    static const int elsesym = 32;     // else
    static const int repeatsym = 33;
    static const int untilsym = 34;
    ...
};
```
出于很多原因(懒)，这个符号表中的一些单元在我的编译器中没有处理，但是这并不影响`PL/0`语言是一个**图灵完备**的语言这一事实(说到底还是图灵完备的条件太低了233)。
词法分析程序是整个编译器前后端里最简单的一部分。常用的"专业"的词法分析程序有`flex`，这是一种使用**正则表达式**描述词法单元的自动生成代码的程序，但是我们不用，杀鸡用不着牛刀。
手写的词法分析程序大概是这样
```
std::shared_ptr<Symbol> getsym() {
    std::shared_ptr<Symbol> sym(nullptr);
    while (curCh == ' ') {
        readAChar();
    }
    if (isalpha(curCh) || curCh == '_') {
        sym = std::move(matchKeywordOrIdentifier());
    } else if (isdigit(curCh)) {
        sym = std::move(matchNumber());
    } else if (curCh == '+' || curCh == '-') {
        int temp = curCh;
        readAChar();
        if (fn && isdigit(curCh)) {
            if (temp == '+') {
                sym = std::move(matchNumber(1));
            } else {
                sym = std::move(matchNumber(-1));
            }
        } else {
            lastCh = curCh;
            curCh = temp;
            sym = std::move(matchOperator());
        }
    } else {
        sym = std::move(matchOperator());
    }
    return std::move(sym);
}
```
值得注意的是`lastCh`的使用，在词法分析过程中我们一个一个读取字符加以判断，但是我们有时不能保证当前字符是一个词法单元的最后一个字符，所以要读入下一个字符才能确定，这样就需要暂时保存当前读取的字符，否则它会新的被覆盖。

## Implement of parser along with generator
词法分析器产生的token要交给语法分析器使用，这里有一个和`flex`配套使用的语法分析软件`bison`，使用**BNF**描述语法。教材中关于语法分析讲了好几种方法，考试重点是各种LR(n)，然而手写parser的时候还是选用简单粗暴的LL(1)文法。

我们选择在实现语法分析的时候顺便生成虚拟机字节码(我去这根本不能叫字节码好吗)，这样就避免了AST的生成，同时也失去了基于AST的各种优化的机会。

一个简单的parse函数大概是这样:
```C++
void praseIfStatement(symset fsys, int lev) {
    nextsym();
    symset nxtlev = fsys;
    nxtlev.set(Symbol::thensym);
    nxtlev.set(Symbol::dosym);
    condition(nxtlev, lev);
    if (sym->symtype == Symbol::thensym) {
        nextsym();
    } else {
        report(16, lineCnt);
    }
    int cx1 = arrayPtr;
    gen(Pcode::JPC, 0, 0);
    statement(fsys, lev);
    pcodeArray[cx1]->a = arrayPtr;
    if (sym->symtype == Symbol::elsesym) {
        pcodeArray[cx1]->a++;
        nextsym();
        int tmpPtr = arrayPtr;
        gen(Pcode::JMP, 0, 0);
        statement(fsys, lev);
        pcodeArray[tmpPtr]->a = arrayPtr;
    }
}
```
就是根据BNF范式一步一步推导。其中用`gen`函数来生成字节码。

## Implement of virtual machine
`PL0`语言有一个栈式虚拟机，基本组成如下:
```C++
class Pcode {
public:
    Pcode(int f, int l, int a) : f(f), l(l), a(a) { }

    static const int LIT = 0;
    static const int OPR = 1;
    static const int LOD = 2;
    static const int STO = 3;
    static const int CAL = 4;
    static const int INT = 5;
    static const int JMP = 6;
    static const int JPC = 7;
    static const int SYMNUM = 8;

    static const std::array<std::string, SYMNUM> pcode;

    int f;
    int l;
    int a;
};
```
每一个指令有四部分组成:一个指令名称，三个操作数。

## Let's compile
编译生成以后我们得到两个可执行文件:`pl0c`用来编译，`pl0`用来运行。
一段简单的`PL0`源码:
```Pascal
var a, b;
begin
    a := 0;
    b := 3;
    a := a + b * 1;
end.
```
保存为`test.pl0`，编译，得到一个二进制(文本)文件`test.plb`，使用`pl0`运行，效果如图:<br />
![pl0](http://7xk052.com1.z0.glb.clouddn.com/pl0c.jpg "")

结束。