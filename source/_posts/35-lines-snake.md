title: 闲谈-从35行的贪吃蛇说起
date: 2015-07-14 15:24:08
tags: [clojure]
---
明天就是上学期的最后一门考试了~~（感觉哪里怪怪的XD）~~，考完以后白天就闲下来，可以做自己的事情了。本来小学期计划好多的说，结果这么快已经过半了，<!--more-->选上了某老师的linux课，说是上三周课（一周两次），结果**第三次**上课了有个妹子还没装linux\_(:3JL)\_。所以只能靠自己了，两本鸟哥看完**半本**了，然并卵，都是会的，估计不会的都在剩下的部分里面。

打算上一门函数式编程的，在上一篇已经说过了，选定了**clojure**，在图书馆借了一本《clojure程序设计》，被里面提到的35行贪吃蛇吓哭了。

代码：
```clojure
(import '(java.awt Color) '(javax.swing JPanel JFrame Timer)
         '(java.awt.event KeyEvent ActionListener KeyListener))
 
(defn gen-apple [_] [(rand-int 750) (rand-int 550)])
(defn move [{:keys [body dir] :as snake} & grow]
  (assoc snake :body (cons (vec (map #(+ (dir %) ((first body) %)) [0  1]))
                            (if grow body (butlast body)))))
(defn turn [snake newdir] (if newdir (assoc snake :dir newdir) snake))
(defn collision? [{[b] :body} a]
   (every? #(<= (- (a %) 10) (b %) (+ 10 (a %))) [0 1]))
(defn paint [g p c] (.setColor g c) (.fillRect g (p 0) (p 1) 10 10))
 
(def dirs {KeyEvent/VK_LEFT [-10 0] KeyEvent/VK_RIGHT [10 0]
            KeyEvent/VK_UP   [0 -10] KeyEvent/VK_DOWN  [0 10]})
(def apple (atom (gen-apple nil)))
(def snake (atom {:body (list [10 10]) :dir [10 0]}))
(def colors {:apple (Color. 210 50 90) :snake (Color. 15 160 70)})
(def panel (proxy [JPanel ActionListener KeyListener] []
              (paintComponent [g] (proxy-super paintComponent g)
                              (paint g @apple (colors :apple))
                              (doseq [p (:body @snake)]
                                (paint g p (colors :snake))))
              (actionPerformed [e] (if (collision? @snake @apple)
                                     (do (swap! apple gen-apple)
                                         (swap! snake move :grow))
                                     (swap! snake move))
                               (.repaint this))
              (keyPressed [e] (swap! snake turn (dirs (.getKeyCode e))))
              (keyReleased [e])
              (keyTyped [e])))
 
(doto panel (.setFocusable true)(.addKeyListener panel))
(doto (JFrame. "Snake")(.add panel)(.setSize 800 600)(.setVisible true))
(.start (Timer. 75 panel))
```
游戏截图：
![SNAKE](http://7xk052.com1.z0.glb.clouddn.com/snake.jpg "")

嗯……教练我要学lisp……~~（然而我写的clojure都是命令式的我会乱说？）~~


除了lisp，原本打算处理的课程还有编译器（然而根本看不懂，你们能不能讲点实际的啊摔），现在打算放弃了，过段时间再看，因为找到了~~貌似~~更好玩的**opengl**，图形学板载!