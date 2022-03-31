/**
 * @function 显示new操作符
 * -1 创建新的空对象
 * -2 设置原型，将对象的原型设置为函数的prototype对象
 * -3 让函数的this指向这个对象，执行构造函数的代码（为这个新对象添加属性）
 * -4 判断函数的返回类型，如果是值类型，返回创建的对象。如果是引用类型，就返回这个引用类型的对象
 */
function objectFactory(arguments) {
  let newObject = null;
  let constructor = Array.prototype.shift.call(arguments);
  let result = null;

  // 参数判断
  if (typeof constructor !== 'function') {
    console.log('type error');
    return;
  }

  // 创建一个空对象，对象的原型为构造函数的prototype对象
  newObject = Object.create(constructor.prototype);

  // 将this指向新建对象，并且执行函数
  result = constructor.apply(newObject, arguments);

  // 判断返回对象
  let flag = result && (typeof result === 'object' || typeof result === 'function');

  // 判断返回结果
  return flag ? result : newObject
}
