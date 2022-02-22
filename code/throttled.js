/**
 * 节流: n 秒内只运行一次，若在 n 秒内重复触发，只有一次生效
 * @function 节流
 * @param {Function} fn -执行方法
 * @param {Number} delay -间隔时间
 */
function throttled(fn, delay) {
  let timer = null;
  let startTime = Date.new();

  return function() {
    // 当前时间
    let curTime = Date.new();
    // 从上一次到现在，还剩下多少时间
    let remaining = delay - ( curTime - startTime);
    let context = this;
    let args = arguments;
    clearTimeout(timer);
    if (remaining <= 0) {
      fn.apply(context, args);
      startTime = Date.now();
    } else {
      timer = setTimeout(fn, remaining);
    }
  }
}
