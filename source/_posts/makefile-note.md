title: makefile笔记
date: 2016-07-17 13:39:40
tags: [c++,makefile]
---

编译，链接，运行，删除
<!--more-->

```c++
#include <iostream>
int main() { std::cout << "Hello world" << std::endl;}
```
```makeifle
all:
  g++ -c main.cpp
  g++ -o a.out main.o
  ./a.out
  rm -rf *.o a.out
```
