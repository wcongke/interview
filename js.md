## JS 面试题

### 1.点击一个`input`依次触发的事件

```js
const text = document.getElementById('text')

text.onclick = function (e) {
  console.log('onclick')
}

text.onfocus = function (e) {
  console.log('onfocus')
}

text.onmousedown = function (e) {
  console.log('onmousedown')  
}

text.onmouseenter = function (e) {
  console.log('onmouseenter')
}
```

#### 答案

```
'onmouseenter'
'onmousedown'
'onfocus'
'onclick'
```

### 2.`null`和`undefined`的区别
- `null`代表一个'无'的对象，也就是该处不该有值；而`undefined`代表**未定义**
- 在转换为数字时的结果不同，`Number(null)`为0，而`undefined`为NaN

使用场景上：
`null`:
- 作为函数的参数，表示该函数的参数不是对象
- 最为原型链的终点

`undefined`:
- 变量被声明了，但是没有赋值时，就等于`undefined`
- 调用函数时，应该提供的参数没有提供，该参数等于`undefined`
- 对象没有赋值属性，该属性的值为`undefined`
- 函数没有返回值时，默认返回`undefined`

### 3.冒泡排序
```js
function bubbleSort (arr) {
  for (let i = 0; i < arr.length; i++) {
    let flag = true;
    for (let j = 0; j < arr.length - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        flag = false;
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
    if (flag) break;
  }
  return arr
}
```
这是一个优化过的冒泡排序，用了一个flag来优化，它的意思是，如果某一次循环中没有交换过元素，那就意味着排序完成。

> 冒泡排序总会执行(N-1)+(N-2)+(N-3)+..+2+1趟，但如果运行到当中某一趟时排序已经完成，或者输入的是一个有序数组，那么后边的比较就都是多余的，为了避免这种情况，我们增加一个flag，判断排序是否在中途就已经完成（也就是判断有无发生元素交换）

### 4.数组去重
1. `Array.from(new Set(arr))`
> 不考虑兼容性，这种去重的方法代码最少。这种方法还无法去掉“{}”空对象，后面的高阶方法会添加去掉重复“{}”的方法。
```js
function unique (arr) {
  return Array.from(new Set(arr))
}

var arr = [1,1,'true','true',true,true,15,15,false,false, undefined,undefined, null,null, NaN, NaN,'NaN', 0, 0, 'a', 'a',{},{}];
console.log(unique(arr))
 //[1, "true", true, 15, false, undefined, null, NaN, "NaN", 0, "a", {}, {}]
```

2. `[... new Set(arr)]`

3. `for`循环嵌套，利用`splice`去重
```js
function (arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] == arr [j]) {
        arr.splice(j, 1);
        j--;
      }
    }
  }
  return arr;
}

var arr = [1,1,'true','true',true,true,15,15,false,false, undefined,undefined, null,null, NaN, NaN,'NaN', 0, 0, 'a', 'a',{},{}];
console.log(unique(arr))
//[1, "true", 15, false, undefined, NaN, NaN, "NaN", "a", {…}, {…}]
//NaN和{}没有去重，两个null直接消失了
```

4. 新建数组，利用`indexOf`或者`includes`去重
```js
function unique (arr) {
  if (!Array.isArray(arr)) {
    console.log('type error!')
    return
  }

  const array = [];
  for (let i = 0; i < arr.length; i++) {
    if (array.indexOf(arr[i]) === -1) {
      array.push(arr[i])
    }
  }
  return array;
}

var arr = [1,1,'true','true',true,true,15,15,false,false, undefined,undefined, null,null, NaN, NaN,'NaN', 0, 0, 'a', 'a',{},{}];
console.log(unique(arr));
// [1, "true", true, 15, false, undefined, null, NaN, NaN, "NaN", 0, "a", {…}, {…}]
//NaN、{}没有去重
```

5. 利用`sort()`
```js
function unique(arr) {
  if (!Array.isArray(arr)) {
    console.log('type error!')
    return;
  }
  arr = arr.sort()
  var array = [arr[0]];
  for (var i = 1; i < arr.length; i++) {
    if (arr[i] !== arr[i-1]) {
        array.push(arr[i]);
    }
  }
  return array;
}
var arr = [1,1,'true','true',true,true,15,15,false,false, undefined,undefined, null,null, NaN, NaN,'NaN', 0, 0, 'a', 'a',{},{}];
  console.log(unique(arr));
// [0, 1, 15, "NaN", NaN, NaN, {…}, {…}, "a", false, null, true, "true", undefined]
//NaN、{}没有去重
```
> 利用`sort()`排序方法，然后根据排序后的结果进行遍历及相邻元素比对

**[JavaScript数组去重（12种方法，史上最全）](https://segmentfault.com/a/1190000016418021)**

### 5.描述一下Promise
`Promise`是一个对象，它代表了一个异步请求的最终完成或失败。由于它的`then`方法和`catch`、`finally`方法会返回一个新的`Promise`所以可以允许我们链式调用，解决了传统的回调地域问题。

> [Promise面试题](https://juejin.im/post/5e58c618e51d4526ed66b5cf#heading-56)

#### `then`和`catch`方法
1. `Promise`的状态一经改变就不能在改变
2. `.then`和`.catch`都会返回一个新的`Promise`
3. `catch`不管被链接到那里，都能捕获上层未捕获过的错误
4. 在`Promise`中，返回任意一个非`Promise`的值都会被包裹成`Promise`对象，列如`return 2`会被包裹为 `return Promise.resolve(2)`
5. `Promise`的`.then`或`.catch`可以被调用多次，但如果`Promise`内部的状态一经改变，并且有了一个值，那么后续每次调用`.then`或`.catch`的时候都会直接拿到该值
6. `.then`或`.catch`中`return`一个`error`对象并不会抛出错误，所以不会被后续的`.catch`捕获
7. `.then`或`.catch`返回的值不能是`Promise`本身，否则会造成死循环
8. `.then`或`.catch`的参数期望是函数，传入非函数则会发生值渗透
9. `.then`方法是能接受两个参数的，第一个是处理成功的参数，第二个是处理失败的参数，在某些时候可以认为`.catch`是`.then`第二个参数的简便写法
10. `.finally`方法返回的也是一个`Promise`，它在`Promise`结束的时候，无论结果为`resolve`还是`reject`，都会执行里面的回调函数

#### `finally`方法
1. `.finally()`方法不管`Promise`对象最后的状态如何都会执行
2. `.finally()`方法的回调函数不接受任何的参数，也就是说在`finally()`函数中是无法知道`Promise`最终的状态是`resolve`还是`reject`
3. 它最终返回的默认会是上一次`Promise`对象值，不过如果抛出的是一个异常则返回异常的`Promise`对象

#### `all`和`race`方法
1. `Promise.all()`的作用是接收一组异步任务，然后并行执行异步任务，并且在所有异步操作执行完后才执行回调
2. `Promise.race()`的作用也是接收一组异步任务，然后并行执行异步任务，只保留第一个执行完成的异步操作的结果，其他的方法扔在执行，不过执行结果会被抛弃
3. `Promise.all().then()`结果中数组的顺序和`Promise.all()`接收到的数组顺序一致
4. `all和race`传入的数组中如果有会抛出异常的异步任务，那么只有最先抛出的错误才会被捕获，并且是被`then`的第二个参数或者后面的`catch`捕获；但并不会影响数组中的其他异步任务的执行

### 6.`Promise.all`如果有一个抛出了异常会如何处理
`all和race`传入的数组中如果有会抛出异常的异步任务，那么只有最先抛出的错误才会被捕获，并且是被`then`的第二个参数或者后面的`catch`捕获；但并不会影响数组中的其他异步任务的执行

### 7.`Promise`为什么可以链式调用
由于它的`then`方法和`catch`、`finally`方法都会返回一个新的`Promise`所以可以允许我们链式调用

### 8.描述一下EventLoop的执行过程
> [Promise面试题](https://juejin.im/post/5e58c618e51d4526ed66b5cf#heading-56)

- 一开始整个脚本作为一个宏任务执行
- 执行过程中同步代码直接执行，宏任务进入宏任务队列，微任务进入微任务队列
- 当宏任务执行完出队，检查微任务列表，有则依次执行，直到全部执行完
- 执行浏览器UI线程的渲染工作
- 检查是否有`web worker`任务，有则继续执行
- 执行完本轮的宏任务，回到2，依次循环，直到宏任务和微任务队列都为空


### 9.addEventListener函数的第三个参数
第三个参数涉及到冒泡和捕获，是`true`时为捕获，是`false`时为冒泡
或者是一个对象`{passive: true}`，针对的是Safari浏览器，禁止/开启使用滚动时用到。

### 10.原生自定义事件
- 使用 `Event`
```js
let myEvent = new Event('event_name')
```
- 使用 `customEvent`（可传参）
```js
let myEvent = new CustomEvent('event_name', {
  detail: {
    // 将需要传递的参数放在这
    // 可以在监听的回调函数中获取到：event.detail
  }
})
```
- 使用 `document.createEvent('CustomEvent')`和`initEvent()`
```js
let myEvent = document.createEvent('CustomEvent')
myEvent.initEvent(
  // 1.event_name: 事件名称
  // 2.canBubble: 是否冒泡
  // 3.cancelable: 是否可以取消默认行为
)

// createEvent 创建一个事件
// initEvent 初始化一个时间，initEvent可以指定3个参数
```

#### 事件的监听
自定义时间的监听和普通事件一样，使用`addEventListener`来监听
```js
button.addEventListener('event_name', function (e) {})
```

#### 事件的触发
触发自定义事件使用`dispatchEvent(myEvent)`

> 注意，这里的参数是要自定义事件的对象（也就是`myEvent`），而不是自定义事件的名称(`'myEvent'`)

#### 案例
```js
let myEvent = new Event('myEvent')
let myEvent = new CustomEvent('myEvent', {
  detail: {
    name: 'text'
  }
})
let myEvent = document.createEvent('CustomEvent')
myEvent.initEvent('myEvent', true, true)


let btn = document.getElementByTagName('button)[0]
btn.addEventListener('myEvent', function(e) {
  console.log(e)
})

setTime(() => {
  btn.dispatchEvent(myEvent)
})
```

### 11.冒泡和捕获的过程
冒泡是指：当给某个目标元素绑定了事件之后，这个事件会依次在它的父级元素中被触发（当然前提是这个父级元素也有这个同名称的事件，比如子元素和父元素都绑定了`click`事件就触发父元素的`click`）
捕获的规则是从上层向下层传递，于冒泡相反。

#### 案例
```html
<ul onclick="alert('ul')">
  <li onclick="alert('li')">
    <button onclick="alert('button')">点击</button>
  </li>
</ul>
<script>
window.addEventListener('click', function (e) {
  alert('window')
})
document.addEventListener('click', function (e) {
  alert('document')
})
</script>
```

冒泡结果：`button > li > ul > document > window`
捕获结果：`window > document > ul > li > button`

### 12.所有事件都冒泡吗？
不是，以下事件就不冒泡
- `onblur`
- `onfocus`
- `onmouseenter`
- `onmouseleave`

### 13.手写new
```js
function myNew (fn, ...args) {
  let instance = Object.create(fn.prototype)
  let result = fn.call(instance, ...args)
  return typeof result === 'object' ? result : instance
}
```

### 14.`typeof`与`instanceof`的区别
`typeof`表示是对某个变量类型的检测，基本数据类型除了`null`都能正常的显示为对应的类型，引用类型除了会显示为`'function'`，其他都显示为`object`

而`instanceof`它主要是用于**检测某个构造函数的原型对象在不在某个对象的原型链上**

### 15.`typeof`为什么对`null`错误的显示
这只是 JS 存在的一个悠久 Bug。在 JS 的最初版本中使用的是 32 位系统，为了性能考虑使用低位存储变量的类型信息，000 开头代表是对象然而 null 表示为全零，所以将它错误的判断为 object
`
### 16.详细说一下`instanceof`
`instanceof`它主要是由于**检测某个构造函数的原型对象在不在某个对象的原型链上**

```js
function myInstanceOf (left, right) {
  let proto = Object.getPrototypeOf(left)
  while (true) {
    if (proto === null) return false
    if (ptoto === right.prototype) return true
    proto = Object.getPrototypeOf(proto)
  }
}
```

### 17.一句话描述一下`this`
指向最后调用函数的那个对象，是函数运行时内部自动生成的一个内部对象，只能在函数内部调用

### 18.`apply/call/bind`的相同和不同
- 都可以改变函数的作用域
- `call/apply`可以直接执行该函数，而`bind`不会立刻执行
- `call/apply`作用类似，都可以改变指针和执行函数，区别在于传参不同。`call`需要单个传参，`apply`通过数组传参

### 19.`webpack`中的`loader`和`plugin`有什么区别
`loader`是一个转换器。只专注于转换文件这一个领域，完成压缩、打包、语言编译，**它仅仅是为了打包**。并且运行在打包之前。
`plugin`是个扩展器。它丰富了webpack本身。为其进行一些其他功能的扩展。**它不局限于打包，资源的加载，还有其他的功能**。所以它是在整个编译周期都起作用

> [webpack面试题](https://juejin.im/post/5e6f4b4e6fb9a07cd443d4a5)

### 20.介绍一下虚拟`DOM`
虚拟`DOM`本质是一个用原生的`javascript`对象去描述的一个`DOM`节点，是对真实的`DOM`的一层抽象。

由于在浏览器中操作`DOM`是非常昂贵的。频繁的操作`DOM`会产生一些性能问题，因此我们需要这一层的抽象，在`patch`过程中尽可能的一次性将差异更新到`DOM`中，这样保证了`DOM`不会出现性能很差的情况。

### 21.常用的设计模式
- 单例模式
- 工厂模式
- 观察者模式
- 适配器模式

在`Vue`中通过观察者模式触发视图更新。`Vue2.x`通过`Object.defineProperty`劫持`data`数据，当数据变化后触发`setter`，`setter`内部通过订阅器来`notify`消息，`notify`会调用`watcher`更新视图

当一套前端对接不同后端服务时，会出现数据解构不一致的情况，这个时候可以使用适配器模式来兼容不同后端，使他们以统一的数据解构来对接前端

### 22.其他
[冴羽blog](https://github.com/mqyqingfeng/Blog)