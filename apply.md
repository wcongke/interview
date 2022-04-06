# Function.prototype.apply()
<a href='https://github.com/mqyqingfeng/Blog/issues/11'>JavaScript深入之apply的模拟实现</a>

## 语法
```js
func.apply(thisArg, [argsArray])
```

## 参数
- `thisArg` 必选的。在 `func` 函数运行时使用的 `this` 值。请注意，`this`可能不是该方法看到的实际值：如果这个函数处于非严格模式下，则指定为 `null` 或 `undefined` 时会自动替换为指向全局对象，原始值会被包装。

- `argsArray` 可选的。一个数组或者类数组对象，其中的数组元素将作为单独的参数传给 `func` 函数。如果该参数的值为 `null` 或  `undefined`，则表示不需要传入任何参数。从ECMAScript 5 开始可以使用类数组对象

## 返回值
调用有指定`this`值和参数的函数的结果

## 描述
在调用一个存在的函数时，你可以为其指定一个 `this` 对象。 `this` 指当前对象，也就是正在调用这个函数的对象。 使用 `apply`， 你可以只写一次这个方法然后在另一个对象中继承它，而不用在新对象中重复写该方法。

`apply` 与 `call()` 非常相似，不同之处在于提供参数的方式。`apply` 使用参数数组而不是一组参数列表。`apply` 可以使用数组字面量（array literal），如 `fun.apply(this, ['eat', 'bananas'])`，或数组对象， 如  `fun.apply(this, new Array('eat', 'bananas'))`。

你也可以使用 `arguments`对象作为 `argsArray` 参数。 `arguments` 是一个函数的局部变量。 它可以被用作被调用对象的所有未指定的参数。 这样，你在使用apply函数的时候就不需要知道被调用对象的所有参数。 你可以使用`arguments`来把所有的参数传递给被调用对象。 被调用对象接下来就负责处理这些参数。

从 ECMAScript 第5版开始，可以使用任何种类的类数组对象，就是说只要有一个 `length` 属性和`(0..length-1)`范围的整数属性。例如现在可以使用 NodeList 或一个自己定义的类似 `{'length': 2, '0': 'eat', '1': 'bananas'}` 形式的对象。

## 用 `apply` 将数组各项添加到另一个数组里

我们可以使用`push`将元素追加到数组中。由于`push`接受可变数量的参数，所以也可以一次追加多个元素。

但是，如果`push`的参数是数组，它会将该数组作为单个元素添加，而不是将这个数组内的每个元素添加进去，因此我们最终会得到一个数组内的数组。如果不想这样呢？`concat`符合我们的需求，但它并不是将元素添加到现有数组，而是创建并返回一个新数组。 然而我们需要将元素追加到现有数组......那么怎么做好？难道要写一个循环吗？别当然不是！

`apply`正派上用场！

```js
var array = ['a', 'b'];
var elements = [0, 1, 2];
array.push.apply(array, elements);

console.log(array); // ['a', 'b', 0, 1, 2]
```

## 使用`apply`和内置函数
对于一些需要写循环以遍历数组各项的需求，我们可以用apply完成以避免循环。
下面是示例，我们将用 `Math.max` / `Math.min` 求得数组中的最大/小值。

```js
/* 找出数组中最大/最小的数字 */
var numbers = [5, 6, 2, 3, 7];

/* 使用Math.min/Math.max以及apply函数时的代码 */
var max = Math.max.apply(null, numbers); /* 基本等同于 Math.max(numbers[0], ...) 或 Math.max(5, 6, 7, ..) */
var min = Math.min.apply(null, numbers);
```

## 使用`apply`来链接构造器

你可以使用`apply`来链接一个对象构造器 (en-US)，类似于Java。在接下来的例子中我们会创建一个全局`Function`对象的`construct`方法 ，来使你能够在构造器中使用一个类数组对象而非参数列表。

```js
Function.prototype.construct = function(aArgs) {
  var oNew = Object.create(this.prototype);
  this.apply(oNew, aArgs);
  return oNew;
}
```

## `apply`的模拟实现
```js
Function.prototype.apply = function(context, arr) {
  var context = Object(context) || window;
  context.fn = this;

  var result;
  if (!arr) {
    result = context.fn();
  } else {
    var args = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      args.push(`arr[${i}]`)
    }
    result = eval(`context.fn(${args})`)
  }

  delete context.fn;
  return result;
}
```
