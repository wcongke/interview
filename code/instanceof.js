/**
 * @function 实现instanceof
 * @description instanceof 运算符用于判断构造函数的prototype属性是否出现在对象的原型链中的任何位置
 * @param {Object} left
 * @param {Object} right
 */
function myInstanceOf(left, right) {
  // 获取对象的原型
  let proto = Object.getPrototypeOf(left);
  // 获取构造函数的prototype对象
  let prototype = right.prototype;

  // 判断构造函数的prototype对象是否在对象的原型链上
  while (true) {
    if (!proto) return false;
    if (proto === prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }
}
