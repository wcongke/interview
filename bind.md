# Function.prototype.bind()
<a href='https://github.com/mqyqingfeng/Blog/issues/12'>JavaScript深入之bind的模拟实现</a>

## 语法
```js
function.bind(thisArg, [, arg1[, args2[, ...]]])
```

## 参数
- `thisArg` 调用绑定函数时作为`this`参数传递给目标函数的值。如果使用`new`运算符构造绑定函数，则忽略该值。当使用`bind`在`setTimeout`中创建一个函数（作为回调提供）时，作为`thisArg`传递的任何原始值都将转换为`object`。如果`bind`函数的参数列表为空，或者`thisArg`是`null`或`undefined`，执行作用域的`this`将被视为新函数的`thisArg`。
- `arg1, arg2, ...` 当目标函数被调用时，被预置入绑定函数的参数列表中的参数。

## 返回值
返回一个原函数的拷贝，并拥有指定的`this`值和初始参数。

## 描述
`bind()` 函数会创建一个新的绑定函数（bound function, BF）。绑定函数是一个 exotic function object（怪异函数对象，ECMAScript 2015 中的术语），它包装了原函数对象。调用绑定函数通常会导致执行包装函数。
绑定函数具有以下内部属性：
  - [[BoundTargetFunction]] -包装的函数对象
  - [[BoundThis]] -在调用包装函数时始终作为`this`值传递的值
  - [[BoundArguments]] -列表，在对包装函数做任何调用都会优先用列表元素填充参数列表
  - [[Call]] -执行与此对象关联的代码。通过函数调用表达式调用。内部方法的参数是一个this值和一个包含通过调用表达式传递给函数的参数列表

## 示例

### 创建绑定函数
`bind()` 最简单的用法是创建一个函数，不论怎么调用，这个函数都有同样的 `this` 值。JavaScript新手经常犯的一个错误是将一个方法从对象中拿出来，然后再调用，期望方法中的`this`是原来的对象（比如在回调中传入这个方法）。如果不做特殊处理的话，一般会丢失原来的对象。基于这个函数，用原始的对象创建一个绑定函数，巧妙的解决了这个问题：
```js
this.x = 9; // 在浏览器中，this 指向全局 'window' 对象
var module = {
  x: 81,
  getX: function() { return this.x }
}

module.getX(); // 81

var retrieveX = module.getX;
retrieveX(); // 9 因为函数在全局作用域中调用

// 创建一个新函数，把'this'绑定到module对象
var boundGetX = retrieveX.bind(module);
boundGetX(); // 81
```

### 偏函数
`bind()`的另一个最简单的用法是使一个函数拥有预设的初始参数。只要将这些参数（如果有的话）作为`bind()`的参数写在`this`后面。当绑定函数被调用时，这些参数会被插入到目标函数的参数列表的开始位置，传递给绑定函数的参数会跟在它们后面。
```js
function list() { return Array.prototype.slice.call(arguments) }

function addArguments(arg1, arg2) { return arg1 + arg2 }

var list1 = list(1, 2, 3); // [1, 2, 3]

var result1 = addArguments(1, 2); // 3

// 创建一个函数，它拥有预设参数列表
var leadingThirtySevenList = list.bind(null, 37);

// 创建一个函数，它拥有预设的第一个测试
var addThirtySevenList = addArguments.bind(null, 37);

var list2 = leadingThirtySevenList(); // [37]

var list3 = leadingThirtySevenList(1, 2, 3) //[37, 1, 2, 3]

var result2 = addThirtySevenList(5); // 37 + 5 = 42

var result2 = addThirtySevenList(5, 10); // 37 + 5 = 42, 第二个参数被忽略
```

### 配合 `setTimeout`
在默认情况下，使用 `window.setTimeout()` 时，`this`关键字会指向 `window` （或global）对象。当类的方法中需要`this`指向类的实例时，你可能需要显式地把`this`绑定到回调函数，就不会丢失该实例的引用。
```js
function LateBloomer() {
  this.petalCount = Math.ceil(Math.random() * 12) + 1;
}

// 在一秒后声明 bloom
LateBloomer.prototype.bloom = function() {
  window.setTimeout(this.declare.bind(this), 1000);
}

LateBloomer.prototype.declare = function() {
  console.log(`I am a beautiful flower with ${this.petalCount} petals!`)
}

var flower = new LateBloomer();
flower.bloom(); // 一秒后，调用 'declare' 方法
```


## `bind`的模拟实现
```js
Function.prototype.bind2 = function(context) {
  if (typeof this !== 'function') {
    throw new Error('Function.prototype.bind - what is trying to be bound is not callable');
  }

  var self = this;
  var args = Array.prototype.slice.call(arguments, 1);
  var fNOP = function() {};

  var fBound = function() {
    var bindArgs = Array.prototype.slice.call(arguments);
    return self.apply(this instanceof fNOP ? this : context, args.concat(bindArgs));
  }

  fNOP.prototype = this.prototype;
  fBound.prototype = new fNOP();
  return fBound;
}
```
