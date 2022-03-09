/**
 * @function 深拷贝
 * @param {Object} obj
 * @link https://es6.ruanyifeng.com/?search=map&x=0&y=0#docs/set-map#WeakMap
 */
function cloneDeep(obj, hash = new WeakMap()) {
  // 如果是null或者undefined就不进行拷贝操作
  if (!obj) return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  // 可能是对象或者其他普通的值，如果是函数不需要深拷贝
  // 是对象就进行深拷贝
  if (typeof obj !== 'object') return obj;
  if (hash.get(obj)) return hash.get(obj);

  // 找到的是所属类原型上的constructor,而原型上的 constructor指向的是当前类本身
  let cloneObj = new obj.constructor();
  hash.set(obj, cloneObj);
  for (let key in obj) {
    if (key in obj) {
      // 递归拷贝
      cloneObj[key] = cloneDeep(obj[key], hash);
    }
  }
  return cloneObj;
}
