/**
 * 防抖: n 秒后在执行该事件，若在 n 秒内被重复触发，则重新计时
 * @function Debounce 防抖
 * @param {Function} fn -执行方法
 * @param {Number} wait -等待时间
 * @param {Boolean} immediate -是否立即执行
 */
function debounce(fn, wait, immediate) {
  let timeout;

  return function() {
    let context = this;
    let args = arguments;

    // timeout 不能为null
    if (timeout) clearTimeout(timeout);
    if (immediate) {
      // 第一次会立即执行，以后只有事件执行后才会再次触发
      let callNow = !timeout;
      timeout = setTimeout(() => {
        timeout = null;
      }, wait);
      if (callNow) {
        fn.apply(context, args);
      }
    } else {
      timeout = setTimeout(() => {
        fn.apply(context, args);
      }, wait);
    }
  }
}
