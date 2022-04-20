/**
 * @class Promise
 * @link https://juejin.cn/post/6844904096525189128
 * @link https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise
 * - Promise 的构造方法接收一个 executor(), 在 new Promise() 时立即执行这个 executor 回调
 * - executor() 内部的异步任务被放入宏/微任务队列，等待执行
 * - then()被执行，收集成功/失败回调，放入成功/失败队列
 * - executor() 的异步任务被执行，触发resolve/reject，从成功/失败队列中取出回调依次执行
 */

// Promise/A+规范的三种状态
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class Promise2 {
  // 构造方法接收回调
  constructor(executor) {
    // promise状态
    this._status = PENDING;
    // 存储then回调return的值
    this._value = undefined;
    // 成功队列，resolve时触发
    this._resolveQueue = [];
    // 失败队列，reject时触发
    this._rejectQueue = [];

    // 由于resolve/reject都是在executor内部被调用，因此需要使用箭头函数固定this指向，否则找不到this._resolveQueue
    let _resolve = (val) => {
      // 把resolve执行回调的操作封装成一个函数，放进setTimeout中，以兼容executor是同步代码的情况
      const run = () => {
        // 对应规范中的「状态只能有pending到fulfilled或rejected」
        if (this._status !== PENDING) return;
        // 变更状态
        this._status = FULFILLED;
        // 存储当前的value
        this._value = val;

        // 这里之所以使用一个队列来存储回调，是为了实现规范要求的then方法可以同一个promise调用多次
        // 如果使用一个变量而非队列来储存回调，那么即便多次p1.then()也只会执行一次回调
        while (this._resolveQueue.length) {
          const callback = this._resolveQueue.shift();
          callback(val);
        }
      }

      setTimeout(run);
    }
    let _reject = (val) => {
      const run = () => {
        if (this._status !== PENDING) return;
        // 变更状态
        this._status = REJECTED;
        // 存储当前的value
        this._value = val;

        while (this._rejectQueue.length) {
          const callback = this._rejectQueue.shift();
          callback(val);
        }
      }

      setTimeout(run);
    }

    // new Promise()时立即执行executor，并传入resolve和reject
    executor(_resolve, _reject)
  }

  // then方法，接收一个成功的回调和一个失败的回调
  then(resolveFn, rejectFn) {
    // 根据规范，如果then的参数不是function，则需要忽略他，让链式调用继续往下执行
    typeof resolveFn !== 'function' ? resolveFn = value => value : null;
    typeof rejectFn !== 'function' ? rejectFn = reason => {
      throw new Error(reason instanceof Error ? reason.message : reason);
    } : null;

    // return 一个新的Promise
    return new Promise2((resolve, reject) => {
      // 把resolveFn重新包装一下，再push进resolve执行队列，这是为了能够获取回调的返回值进行分类讨论
      const fulfilledFn = value => {
        try {
          // 执行第一个当前的Promise的成功回调，并获取返回值
          let x = resolveFn(value);
          // 分类讨论返回值，如果是Promise，那么等待Promise状态改变，否则直接resolve
          // 这里resolve之后，就能被下一个.then()的回调获取到返回值，从而实现链式调用
          x instanceof Promise2 ? x.then(resolve, reject) : resolve(x);
        } catch (error) {
          reject(error);
        }
      }

      // reject同理
      const rejectedFn = error => {
        try {
          let x = rejectFn(error);
          x instanceof Promise2 ? x.then(resolve, reject) : resolve(x);
        } catch (error) {
          reject(error);
        }
      }

      switch (this._status) {
        // 当状态为pending时，把then回调push进resolve/reject执行队列，等待执行
        case PENDING:
          this._resolveQueue.push(resolveFn);
          this._rejectQueue.push(rejectFn);
          break;
        // 当状态已经变为resolve/reject时，直接执行回调
        case FULFILLED:
          fulfilledFn(this._value);
          break;
        case REJECTED:
          rejectedFn(this._value);
          break;
      }
    })
  }

  // catch方法就是执行一下then的下一个回调
  catch(rejectFn) {
    return this.then(undefined, rejectFn);
  }

  // finally方法
  finally(callback) {
    return this.then(value => Promise2.resolve(callback()).then(() => value), reason => Promise2.resolve(callback().then(() => { throw reason })));
  }

  // 静态的resolve方法
  static resolve(value) {
    // 根据规范，如果参数是Promise实例，直接return这个实例
    if (value instanceof Promise2) return value;
    return new Promise2(resolve => resolve(value));
  }

  // 静态的reject方法
  static reject(reason) {
    return new Promise2((resolve, reject) => reject(reason));
  }

  // 静态的all方法
  static all(promiseArr) {
    let index = 0;
    let result = [];
    return new Promise2((resolve, reject) => {
      promiseArr.forEach((p, i) => {
        // Promise.resolve(p)用于处理传入值不为Promise的情况
        Promise2.resolve(p).then(val => {
          index++;
          result[i] = val;
          if (index === promiseArr.length) resolve(result)
        }, err => {
          reject(err)
        })
      })
    })
  }

  // 静态的race方法
  static race(promiseArr) {
    return new Promise2((resolve, reject) => {
      // 同时执行Promise, 如果有一个Promise的状态发生改变，就更新Promise的状态
      for (let p of promiseArr) {
        // Promise.resolve(p)用于处理传入值不为Promise的情况
        Promise2.resolve(p).then(value => resolve(value), err => reject(err))
      }
    })
  }
}
