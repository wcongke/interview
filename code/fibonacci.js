/**
 * @function Fibonacci 数列
 * @param {number} n -大于等于1的整数
 * @link https://es6.ruanyifeng.com/?search=map&x=0&y=0#docs/function#%E5%B0%BE%E9%80%92%E5%BD%92
 */
function fib(n, ac1 = 1, ac2 = 1) {
  if (n <= 1) return ac2;

  return fib(n - 1, ac2, ac1 + ac2)
}
