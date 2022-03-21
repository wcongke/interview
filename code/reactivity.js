/**
 * 全局变量，用于存储被注册的全局副作用函数
 */
let activeEffect;
/**
 * effect 栈
 */
const effectStack = [];
/**
 * 存储副作用函数的桶
 */
const bucket = new WeakMap();
/**
 * 迭代器关键词
 */
const ITERATE_KEY = Symbol();

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
 * @param {String} type -操作类型
 */
function trigger(target, key, type) {
  // 在桶中查询目标对象的副作用函数，没有就return
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  // 取得与key相关联的副作用函数
  const effects = depsMap.get(key);

  // 需要执行的副作用函数
  const effectsToRun = new Set();

  // 将与key相关联的副作用函数添加到effectsToRun
  effects && effects.forEach(effectFn => {
    if (effectFn !== activeEffect) effectsToRun.add(effectFn)
  });

  // 当操作类型为'ADD'或'DELETE'时，才触发与ITERATE_KEY相关联的副作用函数
  if (type === 'ADD' || type === 'DELETE') {
    // 取得与ITERATE_KEY相关联的副作用函数
    const iterateEffect = depsMap.get(ITERATE_KEY);
    // 将与ITERATE_KEY相关联的副作用函数添加到effectsToRun
    iterateEffect && iterateEffect.forEach(effectFn => {
      if (effectFn !== activeEffect) effectsToRun.add(effectFn)
    })
  }

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

/**
 * @description 响应式函数
 * @param {Object} obj
 */
function reactive(obj) {
  return new Proxy(obj, {
    /**
     * 1、receiver代表谁在读取属性
     * 列如：
     * p.bar 代表对象p在读取bar属性
     * 
     * 2、代理对象可以通过raw属性访问原始数据
     * 列如：
     * child.raw === obj
     */
    // 拦截读取操作
    get(target, key, receiver) {
      if (key === 'raw') return target;

      // 将副作用函数activeEffect添加到存储副作用函数的桶中
      track(target, key);
      // 返回属性值
      return Reflect.get(target, key, receiver);
    },
    // 拦截赋值操作
    set(target, key, newVal, receiver) {
      // 先获取旧值
      const oldVal = target[key];
      // 如果属性不支持，则说明是在增加新的属性，否则是设置已存在的属性
      const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD';

      // 设置属性值
      const res = Reflect.set(target, key, newVal, receiver);
      // target === receiver.raw 说明receiver就是target的代理对象
      if (target === receiver.raw) {
        // 比较新值与旧值，只有当它们不全等，并且都不是NaN的时候才触发响应(因: NaN === NaN = false)
        if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) trigger(target, key, type)
      }

      return res;
    },
    // 拦截Reflect.has操作
    has(target, key) {
      track(target, key);
      return Reflect.get(target, key);
    },
    // 拦截Reflect.ownKey操作
    ownKeys(target, key) {
      // 将副作用函数与 ITERATE_KEY 关联
      track(target, ITERATE_KEY);
      return Reflect.ownKeys(target);
    },
    // 拦截删除操作
    deleteProperty(target, key) {
      // 检查被操作的属性是否是对象自己的属性
      const hadKey = Object.prototype.hasOwnProperty.call(target, key);
      // 使用 Reflect.deleteProperty 完成属性的删除
      const res = Reflect.defineProperty(target, key);

      // 只有当被删除的属性是对象自己的属性并且成功删除的时，才触发更新
      if (res && hadKey) trigger(target, key, 'DELETE')
    },
  })
}

const obj = {
  foo: 1,
  get bar() {
    return this.foo;
  }
}

const child = reactive(obj);
const parent = reactive({ bar: 2 });

Object.setPrototypeOf(child, parent);

console.log('123', Object.getPrototypeOf(obj) === parent)

effect(() => {
  console.log(p.bar);
})

child.bar = 3
obj.bar = 3
