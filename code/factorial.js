/**
 * @function factorial 阶乘
 * @param {number} n -大于等于1的整数
 * @link https://es6.ruanyifeng.com/?search=map&x=0&y=0#docs/function#%E9%80%92%E5%BD%92%E5%87%BD%E6%95%B0%E7%9A%84%E6%94%B9%E5%86%99
 */
function fac(n, total = 1) {
  if (n === 1) return total;
  return fac(n - 1, n * total);
}
