/**
 * @description new 运算符创建一个用户定义的对象类型的实例或具有构造函数的内置对象的实例
 * --语法--
 * new constructor[([arguments])]
 * --参数--
 * constructor -一个指定对象实例的类型的类或函数。
 * arguments -一个用于被 constructor 调用的参数列表。
 * --操作流程--
 * 1、创建一个空的简单的JavaScript对象（既{}）
 * 2、为步骤1新创建的对象添加属性__proto__，将该属性链接至构造函数的原型对象
 * 3、将步骤1新创建的对象作为this的上下文
 * 4、如果该函数没有返回对象，则返回this
 */

/**
 * @function car构造函数
 * @param {String} model
 * @param {String} year
 */
function Car(model, year) {
  this.model = model;
  this.year = year;
}

/**
 * new Foo(...)的执行流程
 * 1、一个继承自Foo.prototype的新对象被创建
 * 2、使用指定的参数调用构造函数Foo，并将this绑定到新创建的对象。new Foo等同与new Foo()，也就是没有指定参数列表，Foo不带任何参数调用的情况
 * 3、由构造函数返回的对象就是new表达式的结果。如果构造函数没有显示返回一个对象，则使用步骤1创建的对象。
 * (一般情况下，构造函数不会返回值，但是用户可以选择主动返回对象，来覆盖正常的对象创建步骤)
 */
const car1 = new Car('Talon TSi', '2001');
console.log(car1);
// Object { model: 'Talon TSi', year: '2001' }

/**
 * @function 实现new操作符
 * @link https://github.com/mqyqingfeng/Blog/issues/13
 * -1 用new Object()的方式新建了一个对象obj
 * -2 取出第一个参数，就是我们要传入的构造函数。此外因为shift会修改原数组，所以arguments会被去除第一个参数
 * -3 将obj的原型指向构造函数，这样obj就可以访问到构造函数原型中的属性
 * -4 使用apply，改变构造函数this的指向到新建的对象，这样obj就可以访问到构造函数中的属性
 * -5 返回obj
 */
function objectFactory() {
  var obj = new Object(),
    Constructor = [].shift.call(arguments);

  obj.__proto__ = Constructor.prototype;
  var ret = Constructor.apply(obj, arguments);
  return typeof ret === 'object' ? ret : obj;
}
