title: Java笔记
date: 2016-07-28 17:38:49
tags: [Java]
---

虽然很不喜欢Java，但是要用，所以要学，于是花了好久想搭建一个SpringMVC的应用，但是一头雾水。不过好歹算学了一点Gradle的基本用法，

<!--more-->
占坑，调好SpringBoot再回来填

~~kotlin大法好啊，clojure大法好啊~~


~~用SpringBoot做好了Hello World，特地回来填坑~~

首先，我们的工具是敢于和VS叫板的世界第一卡的IDE-[Intellij IDEA]("")

## gradle

嗯……不要在意这些细节，下面我们来看一看我们的gradle文件

```gradle
buildscript {
  ext {
    kotlinVersion = '1.0.3'
    springBootVersion = '1.4.0.RELEASE'
  }
  repositories {
    mavenCentral()
  }
  dependencies {
    classpath("org.springframework.boot:spring-boot-gradle-plugin:${springBootVersion}")
    classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:${kotlinVersion}")
  }
}

apply plugin: 'kotlin'
apply plugin: 'eclipse'
apply plugin: 'idea'
apply plugin: 'spring-boot'

jar {
  baseName = 'demo'
  version = '0.0.1-SNAPSHOT'
}
sourceCompatibility = 1.8
targetCompatibility = 1.8

repositories {
  mavenCentral()
  maven { url "https://repo.spring.io/snapshot" }
  maven { url "https://repo.spring.io/milestone" }
}

dependencies {
  compile('org.springframework.boot:spring-boot-starter')
  compile("org.springframework.boot:spring-boot-starter-web")
  compile ("org.springframework.boot:spring-boot-starter-parent:1.4.0.RELEASE")
  compile ("org.springframework.boot:spring-boot-starter-thymeleaf")
  compile ("org.springframework.boot:spring-boot-starter-data-jpa")
  compile "com.h2database:h2"
  compile("org.jetbrains.kotlin:kotlin-stdlib:${kotlinVersion}")
  testCompile('org.springframework.boot:spring-boot-starter-test')
}

eclipse {
  classpath {
     containers.remove('org.eclipse.jdt.launching.JRE_CONTAINER')
     containers 'org.eclipse.jdt.launching.JRE_CONTAINER/org.eclipse.jdt.internal.debug.ui.launcher.StandardVMType/JavaSE-1.8'
  }
}
```
我是照着SpringBoot in action这本破书敲的，敲着敲着我发现哪里不对就把它做掉了，嗯，就是这样……

总之上面这个就是我们的`build.gradle`了，可以看到我们用了好多叫"starter"的包，虽然不知道他们正经做项目的是不是也这么用

对了，我不用Java，所以我选择了Kotlin-jetbrains开源的一款编译到JVM的语言，听说也可以编译到js，但是我有Typescript就够了不需要你们啥kotlin，scala，clojure啥的jvm上的土著来凑热闹~~(我才不会说我连clojurescript的环境都不会配呢)~~

## DemoApplication

文件`DemoApplication.kt`位于`src/Kotlin/example/com`下，别问我为什么反正就是这样。

代码是我从SpringBoot官网抄的Java，顺手翻译成了Kotlin

```kotlin

package com.example

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.*;
import org.springframework.boot.autoconfigure.*;
import org.springframework.stereotype.*;
import org.springframework.web.bind.annotation.*;


@RestController
@EnableAutoConfiguration
@SpringBootApplication
open class DemoApplication {
    @RequestMapping("/")
    @ResponseBody
    open fun home(): String {
        return "Hello world"
    }
}

fun main(args: Array<String>) {
    SpringApplication.run(DemoApplication::class.java, *args)
}

```

跑起来了，监听8080端口(这个可以在某个properties里改)，然后就看到了熟悉的"Hello World"。

按照正常的逻辑到这里我们就可以结束了，因为我也就忙到这里，剩下的时间接着撸我的Koa去，但是，有一个神奇的问题，那就是，Intellij IDEA报错了！

Intellij IDEA对一段正常运行的代码报错了，因为它找不到依赖包，请允许我做一个悲伤的表情。

未完，待再过几年来续