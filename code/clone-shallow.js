/**
 * @function 浅拷贝
 * @param {Object} obj
 */
function cloneShallow(obj) {
  if (!obj) return obj;
  const newObj = {};

  for (let key in obj) {
    if (key in obj) {
      newObj[key] = obj[key];
    }
  }

  return newObj;
}
