title: 串口笔记
date: 2016-07-28 17:38:43
tags: [python, 串口]
---
写了一个使用Python的PySerial库读取串口数据的demo，你说我一个想做devops的，怎么就成了伪硬件工程师了呢。
<!--more-->

程序非常简单，从串口读取数据，然后分割成多行文本。由于串口一直在发送数据，如果一边读入一遍处理很可能会丢失部分数据，而且这是一个典型的生产者-消费者模型，于是就上了多线程，虽然Python的多线程简直****(文明用语)。
```Python
#! /usr/bin/env python
# 串口库
import serial
# 线程库
from threading import Thread
# 线程安全的队列
from queue import Queue

taskQueue = Queue()
ser = None

# 消费函数
def consume():
  lastLine = ""
  while True:
    line = taskQueue.get()
    line = line.decode()
    lastLine += line
    splitLines = lastLine.split("\r\n")
    lastLine = splitLines[-1]
    for x in splitLines[0:-1]:
      print(x)
    
# 生产函数
def produce():
  while True:
    line = ser.read(8)
    taskQueue.put(line)

if __name__ == "__main__":

# 串口端口(COM3)
  port = 2
# 波特率，即每秒发送的数据bit数，需要和设备一致
  baudrate = 115200

  ser = serial.Serial(port=port, baudrate=baudrate, stopbits=1)
  
  # print(ser.name)

# 创建并开始线程
  produceThread = Thread(target=produce)
  consumeThread = Thread(target=consume)

  produceThread.start()
  consumeThread.start()

  produceThread.join()
  consumeThread.join()
```
数据暂时就到这里，下一步应该是利用起数据调用`matplotlib`画图。