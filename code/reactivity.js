// 全局变量，用于存储被注册的全局副作用函数
let activeEffect;
// effect 栈
const effectStack = [];
// 存储副作用函数的桶
const bucket = new WeakMap();

/**
 * @description 在get拦截函数内调用track函数追踪数据变化
 * @param {object} target -目标对象
 * @param {object} key -键名
 */
function track(target, key) {
  // 没有activeEffect就直接return
  if (!activeEffect) return;
  // 在桶中查询目标对象的副作用函数，没有就创建一个新的Map存入桶中
  let depsMap = bucket.get(target);
  if (!depsMap) bucket.set(target, depsMap = new Map({}));
  // 用键名在map中查询副作用函数，没有就创建一个新的Set存入Map中
  let deps = depsMap.get(key);
  if (!deps) depsMap.set(key, deps = new Set());
  deps.add(activeEffect);
  activeEffect.deps.push(deps);
}

/**
 * @description 在set拦截函数内调用trigger函数触发变化
 * @param {object} target -目标对象
 * @param {object} key -键名
 */
function trigger(target, key) {
  // 在桶中查询目标对象的副作用函数，没有就return
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  // 用键名在map中查询副作用函数
  const effects = depsMap.get(key);

  // 需要执行的副作用函数
  const effectsToRun = new Set();
  effects && effects.forEach(effectFn => {
    // 如果trigger触发执行的副作用函数与当前正在执行的副作用函数不系统就加入需要执行的副作用函数Set中
    if (effectFn !== activeEffect) effectsToRun.add(effectFn)
  });
  effectsToRun.forEach(effectFn => {
    // scheduler 调度器，可以直接调用用户传递的调度器函数，把控制权交给用户
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}

/**
 * @description 清理副作用函数，避免产生遗留
 * @param {Function} effectFn - 副作用函数
 */
function cleanup(effectFn) {
  // 病历effectFn.deps数组
  for (let i = 0; i < effectFn.deps.length; i++) {
    // deps 是依赖集合
    const deps = effectFn.deps[i]
    // 将effectFn从依赖集合中移除
    deps.delete(effectFn)
  }
  // 最后重置effectFn.deps数组
  effectFn.deps.length = 0
}


/**
 * @description 注册副作用函数
 */
function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn);
    // 当调用 effect 注册副作用函数时，将副作用函数赋值给activeEffect
    activeEffect = effectFn;
    // 在调用副作用函数挣钱将当前副作用函数压栈
    effectStack.push(effectFn);
    const res = fn();
    // 在执行完当前副作用函数后，将当前副作用函数弹出栈，并还原activeEffect为之前的值
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];

    return res;
  }
  // 将options挂载到effectFn上
  effectFn.options = options;
  // activeEffect.deps 用来储存所有与该副作用函数相关的依赖集合
  effectFn.deps = [];
  // 执行副作用函数
  if (!options.lazy) effectFn()

  return effectFn
}

const obj = {
  foo: 1,
  get bar() {
    return this.foo;
  }
}

const p = new Proxy(obj, {
  // 拦截读取操作
  get(target, key) {
    // 将副作用函数activeEffect添加到存储副作用函数的桶中
    track(target, key);
    // 返回属性值
    return Reflect.get(target, key, receiver);
  },
  // 拦截赋值操作
  set(target, key, newVal) {
    // 设置属性值
    target[key] = newVal;
    // 把副作用函数从桶里取出来执行
    trigger(target, key);
  }
})

effect(() => {
  console.log(p.bar);
})

p.foo++;
