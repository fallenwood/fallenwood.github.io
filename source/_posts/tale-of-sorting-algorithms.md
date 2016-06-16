title: 乱扯排序算法
date: 2016-02-28 13:38:11
tags: [algorithm, c++, sort]
---

排序算法是数据结构课程中的一个很重要的部分，虽然在实际的编码中并没有什么卵用--但是我们还是要扯一扯这些算法←_←
本文所涉及的排序算法均为单线程的，基于冯-诺依曼架构的算法，且采用*C++*实现
于是让我们进入正题吧<!--more-->

#### 冒泡排序
以交换次数多而闻名的排序算法，时间复杂度为稳定的O(n^2)，额外空间为O(1)，是很多教材(谭浩强)
介绍的第一个排序算法，原理简单而反人类。
```c++
void bubblesort() {
    for (int i = 1; i < n; ++i) {
        changed = 0;
        for (int j = n; j > i; --j)
            if (num[j] < num[j - 1])
                swap(num[j], num[j - 1]), changed = 1;
        if (!changed)
            break;
    }
}
```
值得注意的是，当某一次遍历后没有交换元素，则说明数组已完成排序
#### 选择排序
大概是最符合直觉的排序方法之一了……时间复杂度为O(n^2)，额外空间O(1)
```c++
for (i = n; i > 1; --i) {
    maxnum = f[1], maxi = 1;
    for (j = 2; j <= i; j++) {
        if (f[j] > maxnum) {
            maxnum = f[j];
            maxi = j;
        }
    }
    swap(f[maxi], f[i]);
}
```
选择法可以先找出最大的**N**个数
#### 插入排序
*算法导论*中以纸牌排序为例引入了这个算法，也是很符合直觉的排序方法，最坏时间复杂度为O(n^2)，最好为O(n)，平均O(n^2)，额外空间为O(1)
```c++
for (int i = 1; i <= n; ++i) {
    scanf("%d", &x);
    for (j = i; j > 1 && f[j - 1] > x; --j)
        f[j] = f[j - 1];
    f[j] = x;
}
```
插入排序可以在数据输入的同时进行排序
#### 归并排序
本文所涉及的归并排序算法为二路归并排序，时间复杂度为O(nlgn)，额外空间为O(n)
```c++
void merge_sort (int l, int r) {
    if (l >= r) return;
    int m = (l + r) >> 1;
    merge_sort(l, m);
    merge_sort(m + 1, r);
    int i = l, j = m + 1, c = l;
    while (i <= m || j <= r) {
        if (j > r || (i <= m && f[i] <= f[j]))
            t[c++] = f[i++];
        else
            t[c++] = f[j++];
    }
    memcpy(f + l, t + l, sizeof(int) * (r - l + 1));
}
```
归并排序不仅可以对数组(随机读取器)排序，也可以对链表排序，还可以对文件排序
#### 堆排序
`堆`是一种数据结构(不是内存中的那个`堆`)，通常情况下指二叉堆，可以作为优先队列使用。堆排序的时间复杂度为O(nlgn)，额外空间为O(1)
```c++
void down(int i) {
    int p, l, r;
    while(true) {
        p = i, l = i << 1, r = l + 1;
        if (l <= size && f[p] < f[l]) p = l;
        if (r <= size && f[p] < f[r]) p = r;
        if (i == p) break;
        swap(f[i], f[p]);
        i = p;
    }
}
void build() {
    for (int i = size >> 1; i >= 1; --i)
        down(i);
}
void heapsort() {
    size = n;
    build();
    while(size > 1) {
        swap(f[1], f[size]);
        --size;
        down(1);
    }
}
```
堆排序可以看作选择排序的改进(优先队列的应用)，将O(n)的选择时间降为O(lgn)
#### 快速排序
快速排序(没错就是这个名字)是一种快速的排序算法(废话)，应用非常广泛，包括但不限于考试出题(比如时间复杂度分析，递归改为栈+迭代)。快速排序的最佳时间复杂度为O(nlgn)，最差达到了O(n^2)，平均为O(nlgn)，而且(据说)常数小，运行快，一般不会碰到最坏的情况，在工业界使用率很高。
```c++
void quicksort(int f[], int low, int high) {
    int k = (high - low) / 2 + low;
    int x = f[k], i = low, j = high;
    f[k] = f[i];
    while (i < j) {
        while (i < j && f[j] >= x) --j;
        f[i] = f[j];
        while (i < j && f[i] < x) ++i;
        f[j] = f[i];
    }
    f[i] = x;
    if (i - low > 1)
        quicksort(f, low, i - 1);
    if (high - i > 1)
        quicksort(f, i + 1, high);
}
```
非递归版
```c++
void quicksort() {
    std::stack<int> lowStack, highStack;
    lowStack.push(1);
    highStack.push(n);
    while (!lowStack.empty()) {
        int low = lowStack.top();lowStack.pop();
        int high = highStack.top();highStack.pop();
        int k = (high - low) / 2 + low;
        int x = f[k], i = low, j = high;
        f[k] = f[i];
        while (i < j) {
            while (i < j && f[j] >= x) --j;
            f[i] = f[j];
            while (i < j && f[i] < x) ++i;
            f[j] = f[i];
        }
        f[i] = x;
        if (i - low > 1) lowStack.push(low), highStack.push(i - 1);
        if (high - i > 1) lowStack.push(i + 1), highStack.push(high);
    }
}
```
乱入haskell版，也许更容易理解
```haskell
quicksort [] = []
quicksort (x:xs) = quicksort (filter (< x) xs) ++ [x] ++ quicksort (filter (>= x) xs)
```
PHP中的quicksort
```c++
ZEND_API void zend_qsort(void *base, size_t nmemb, size_t siz, compare_func_t compare, swap_func_t swp) /* {{{ */
{
    void           *begin_stack[QSORT_STACK_SIZE];
    void           *end_stack[QSORT_STACK_SIZE];
    register char  *begin;
    register char  *end;
    register char  *seg1;
    register char  *seg2;
    register char  *seg2p;
    register int    loop;
    size_t          offset;

    begin_stack[0] = (char *) base;
    end_stack[0]   = (char *) base + ((nmemb - 1) * siz);

    for (loop = 0; loop >= 0; --loop) {
        begin = begin_stack[loop];
        end   = end_stack[loop];

        while (begin < end) {
            offset = (end - begin) >> Z_L(1);
            swp(begin, begin + (offset - (offset % siz)));

            seg1 = begin + siz;
            seg2 = end;

            while (1) {
                for (; seg1 < seg2 && compare(begin, seg1) > 0;
                     seg1 += siz);

                for (; seg2 >= seg1 && compare(seg2, begin) > 0;
                     seg2 -= siz);

                if (seg1 >= seg2)
                    break;

                swp(seg1, seg2);

                seg1 += siz;
                seg2 -= siz;
            }

            swp(begin, seg2);

            seg2p = seg2;

            if ((seg2p - begin) <= (end - seg2p)) {
                if ((seg2p + siz) < end) {
                    begin_stack[loop] = seg2p + siz;
                    end_stack[loop++] = end;
                }
                end = seg2p - siz;
            }
            else {
                if ((seg2p - siz) > begin) {
                    begin_stack[loop] = begin;
                    end_stack[loop++] = seg2p - siz;
                }
                begin = seg2p + siz;
            }
        }
    }
}
```
以上代码出自PHP7，但是貌似已经废弃，被另一个quicksort代替了
```c++
ZEND_API void zend_sort(void *base, size_t nmemb, size_t siz, compare_func_t cmp, swap_func_t swp)
{
    while (1) {
        if (nmemb <= 16) {
            zend_insert_sort(base, nmemb, siz, cmp, swp);
            return;
        } else {
            char *i, *j;
            char *start = (char *)base;
            char *end = start + (nmemb * siz);
            size_t offset = (nmemb >> Z_L(1));
            char *pivot = start + (offset * siz);

            if ((nmemb >> Z_L(10))) {
                size_t delta = (offset >> Z_L(1)) * siz;
                zend_sort_5(start, start + delta, pivot, pivot + delta, end - siz, cmp, swp);
            } else {
                zend_sort_3(start, pivot, end - siz, cmp, swp);
            }
            swp(start + siz, pivot);
            pivot = start + siz;
            i = pivot + siz;
            j = end - siz;
            while (1) {
                while (cmp(pivot, i) > 0) {
                    i += siz;
                    if (UNEXPECTED(i == j)) {
                        goto done;
                    }
                }
                j -= siz;
                if (UNEXPECTED(j == i)) {
                    goto done;
                }
                while (cmp(j, pivot) > 0) {
                    j -= siz;
                    if (UNEXPECTED(j == i)) {
                        goto done;
                    }
                }
                swp(i, j);
                i += siz;
                if (UNEXPECTED(i == j)) {
                    goto done;
                }
            }
done:
            swp(pivot, i - siz);
            if ((i - siz) - start < end - i) {
                zend_sort(start, (i - start)/siz - 1, siz, cmp, swp);
                base = i;
                nmemb = (end - i)/siz;
            } else {
                zend_sort(i, (end - i)/siz, siz, cmp, swp);
                nmemb = (i - start)/siz - 1;
            }
        }
    }
}
```
PHP中的新版`sort`是一种混合排序，在待排序个数小于16个的时候调用插入排序
```c++
ZEND_API void zend_insert_sort(void *base, size_t nmemb, size_t siz, compare_func_t cmp, swap_func_t swp) /* {{{ */{
    switch (nmemb) {
        case 0:
        case 1:
            break;
        case 2:
            zend_sort_2(base, (char *)base + siz, cmp, swp);
            break;
        case 3:
            zend_sort_3(base, (char *)base + siz, (char *)base + siz + siz, cmp, swp);
            break;
        case 4:
            {
                size_t siz2 = siz + siz;
                zend_sort_4(base, (char *)base + siz, (char *)base + siz2, (char *)base + siz + siz2, cmp, swp);
            }
            break;
        case 5:
            {
                size_t siz2 = siz + siz;
                zend_sort_5(base, (char *)base + siz, (char *)base + siz2, (char *)base + siz + siz2, (char *)base + siz2 + siz2, cmp, swp);
            }
            break;
        default:
            {
                char *i, *j, *k;
                char *start = (char *)base;
                char *end = start + (nmemb * siz);
                size_t siz2= siz + siz;
                char *sentry = start + (6 * siz);
                for (i = start + siz; i < sentry; i += siz) {
                    j = i - siz;
                    if (!(cmp(j, i) > 0)) {
                        continue;
                    }
                    while (j != start) {
                        j -= siz;
                        if (!(cmp(j, i) > 0)) {
                            j += siz;
                            break;
                        }
                    }
                    for (k = i; k > j; k -= siz) {
                        swp(k, k - siz);
                    }
                }
                for (i = sentry; i < end; i += siz) {
                    j = i - siz;
                    if (!(cmp(j, i) > 0)) {
                        continue;
                    }
                    do {
                        j -= siz2;
                        if (!(cmp(j, i) > 0)) {
                            j += siz;
                            if (!(cmp(j, i) > 0)) {
                                j += siz;
                            }
                            break;
                        }
                        if (j == start) {
                            break;
                        }
                        if (j == start + siz) {
                            j -= siz;
                            if (cmp(i, j) > 0) {
                                j += siz;
                            }
                            break;
                        }
                    } while (1);
                    for (k = i; k > j; k -= siz) {
                        swp(k, k - siz);
                    }
                }
            }
            break;
    }
}
```
在插入排序中，当待排序个数小于等于5时分别有对应的特化
```c++
static inline void zend_sort_2(void *a, void *b, compare_func_t cmp, swap_func_t swp) {
    if (cmp(a, b) > 0) {
        swp(a, b);
    }
}

static inline void zend_sort_3(void *a, void *b, void *c, compare_func_t cmp, swap_func_t swp) {
    if (!(cmp(a, b) > 0)) {
        if (!(cmp(b, c) > 0)) {
            return;
        }
        swp(b, c);
        if (cmp(a, b) > 0) {
            swp(a, b);
        }
        return;
    }
    if (!(cmp(c, b) > 0)) {
        swp(a, c);
        return;
    }
    swp(a, b);
    if (cmp(b, c) > 0) {
        swp(b, c);
    }
}

static void zend_sort_4(void *a, void *b, void *c, void *d, compare_func_t cmp, swap_func_t swp) {
    zend_sort_3(a, b, c, cmp, swp);
    if (cmp(c, d) > 0) {
        swp(c, d);
        if (cmp(b, c) > 0) {
            swp(b, c);
            if (cmp(a, b) > 0) {
                swp(a, b);
            }
        }
    }
}

static void zend_sort_5(void *a, void *b, void *c, void *d, void *e, compare_func_t cmp, swap_func_t swp) {
    zend_sort_4(a, b, c, d, cmp, swp);
    if (cmp(d, e) > 0) {
        swp(d, e);
        if (cmp(c, d) > 0) {
            swp(c, d);
            if (cmp(b, c) > 0) {
                swp(b, c);
                if (cmp(a, b) > 0) {
                    swp(a, b);
                }
            }
        }
    }
}
```
有趣的是，这一段新版的排序算法衍生自*llvm*中的`std::sort`(见原代码注释)
#### Introsort(内省排序)
> Introsort was invented by David Musser in Musser (1997), in which he also introduced introselect, a hybrid selection algorithm based on quickselect (a variant of quicksort), which falls back to median of medians and thus provides worst-case linear complexity, which is optimal. Both algorithms were introduced with the purpose of providing generic algorithms for the C++ Standard Library which had both fast average performance and optimal worst-case performance, thus allowing the performance requirements to be tightened.
Introsort没有被写进教科书里，但这并不能说明它不强大。Introsort是*C++*标准模版库(STL)的内置排序算法，应用非常广泛。

*wikipedia*介绍的introsort非常简单，伪代码如下
```
procedure sort(A : array):
    let maxdepth = ⌊log(length(A))⌋ × 2
    introsort(A, maxdepth)

procedure introsort(A, maxdepth):
    n ← length(A)
    if n ≤ 1:
        return  // base case
    else if maxdepth = 0:
        heapsort(A)
    else:
        p ← partition(A)  // assume this function does pivot selection, p is the final position of the pivot
        introsort(A[0:p], maxdepth - 1)
        introsort(A[p+1:n], maxdepth - 1)
```
我们可以很方便的将其"翻译"为*C++*，这里不再赘述
#### Timsort
Timsort是21世纪才被发明出来的一种排序方法，但是很快就成为了*Python*和*Java*的御用排序算法，可见其强大。
但是Timsort源码非常长，这里就不贴出来了，详情可见`cpython/Objects/listobject.c`
#### 计数排序
计数排序是非常直观的一种排序方案，它不是基于比较的，所以突破了O(nlgn)的界定。
#### 基数排序
另一种不是基于比较的排序算法
```c++
for (base = 1; base < 100000; base *= 10) {
        while(!num.empty()) {
            int top = num.front();
            num.pop();
            q[top / base % 10].push(top);
        }
        for (int i = 0; i < 10; ++i)
            while(!q[i].empty()) {
                int top = q[i].front();
                q[i].pop();
                num.push(top);
            }
    }
 ```

串行排序就先写到这里，虽然卵用没有但是水了一片文章也是极好的XD。