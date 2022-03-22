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
 * 存储原始对象到代理对象的映射
 */
const reactiveMap = new Map();
/**
 * 数组方法对象
 */
const arrayInstrumentations = {}
// 重写数组的查找方法
;['includes', 'indexOf', 'lastIndexOf'].forEach(method => {
  // 获取原始数组查找方法
  const originMethod = Array.prototype[method];
  // 重写
  arrayInstrumentations[method] = function(...args) {
    // this 是代理对象，现在代理对象中查找，将结果存储到res中
    let res = originMethod.apply(this, args);

    if (res === false) {
      // res 为false说明没找到，在通过this.raw拿到原始数组，再去原始数组中查找，并更新res值
      res = originMethod.apply(this.raw, args);
    }

    // 返回最终结果
    return res
  }
})

/**
 * !在修改数组长度时，会间接读取length属性，导致响应系统会反复把所有与length相关的副作用函数取出来执行，最终导致栈溢出。
 * !所以要屏蔽对length属性的读取，避免在修改数组长度的原型方法与length相关副作用建立响应链接
 * 标记变量，代表是否追踪
 */
let shouldTrack = true;
// 重写修改数组长度的原型方法
;['push', 'pop', 'shift', 'unshift', 'splice'].forEach(method => {
  // 获取原始方法
  const originMethod = Array.prototype[method];
  // 重写
  arrayInstrumentations[method] = function(...args) {
    // 在调用原始方法前，禁止追踪
    shouldTrack = false;
    // push方法的默认行为
    let res = originMethod.apply(this, args);
    // 在调用原始方法后，恢复追踪
    shouldTrack = true;
    return res;
  }
})

/**
 * @function 深响应
 * @param {Object} obj
 */
function reactive(obj) {
  // 优先通过原始对象obj寻找之前创建的代理对象，如果找到了，直接返回已有的代理对象
  const existingProxy = reactiveMap.get(obj);
  if (existingProxy) return existingProxy;

  // 否则创建新的代理对象
  const proxy = createReactive(obj);
  // 存储到Map中，从而防止重复创建
  reactiveMap.set(obj, proxy);

  return proxy;
}

/**
 * @function 浅响应
 * @param {Object} obj
 */
function shallowReactive(obj) {
  return createReactive(obj, true);
}

/**
 * @function 只读
 * @param {Object} obj
 */
function readonly(obj) {
  return createReactive(obj, false, true);
}

/**
 * @function 浅只读
 * @param {Object} obj
 */
function shallowReadonly(obj) {
  return createReactive(obj, true, true);
}

/**
 * @description 在get拦截函数内调用track函数追踪数据变化
 * @param {object} target -目标对象
 * @param {object} key -键名
 */
function track(target, key) {
  // 没有activeEffect就直接return，禁止追踪时也直接return
  if (!activeEffect || !shouldTrack) return;
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
 * @param {Any} newVal -新值
 */
function trigger(target, key, type, newVal) {
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

  // 当操作类型为ADD并且目标对象是数组时，应该取出并执行那些与length相关联的副作用函数
  if (type === 'ADD' && Array.isArray(target)) {
    // 取出与length相关联的副作用函数
    const lengthEffects = depsMap.get('length');
    // 将这些副作用函数添加到effectsToRun中，待执行
    lengthEffects && lengthEffects.forEach((effectFn => {
      if (effectFn !== activeEffect) effectsToRun.add(effectFn)
    }))
  }

  // 当操作目标是数组，并且修改了数组的length属性
  if (Array.isArray(target) && key === 'length') {
    // 对于索引大于或者等于新的length值的元素，需要把所有相关联的副作用函数取出来并添加到effectsToRun中待执行
    depsMap.forEach((effects, index) => {
      if (index >= newVal) {
        effects.forEach((effectFn => {
          if (effectFn !== activeEffect) effectsToRun.add(effectFn)
        }))
      }
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
 * @description 创建响应式函数
 * @param {Object} obj
 * @param {Boolean} isShallow -是否浅响应
 * @param {Boolean} isReadonly -是否只读
 */
function createReactive(obj, isShallow = false, isReadonly = false) {
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

      // 如果操作的目标是数组，并且key存在与arrayInstrumentations上，那么就返回定义在arrayInstrumentations上的值
      if (Array.isArray(target) && arrayInstrumentations.hasOwnProperty(key)) {
        return Reflect.get(arrayInstrumentations, key, receiver);
      }

      // 非只读且key的类型不是symbol时，将副作用函数activeEffect添加到存储副作用函数的桶中
      if (!isReadonly && typeof key !== 'symbol') track(target, key);
      // 获取属性值
      const res = Reflect.get(target, key, receiver);

      // 浅响应直接返回属性
      if (isShallow) return res;

      // 深响应/只读
      if (typeof res === 'object' && res !== null) return isReadonly ? readonly(res) : reactive(res);

      return res;
    },
    // 拦截赋值操作
    set(target, key, newVal, receiver) {
      if (isReadonly) {
        console.warn(`属性${key}只读！`);
        return true;
      }

      // 先获取旧值
      const oldVal = target[key];
      // 如果属性存在，则说明是在增加新的属性，否则是设置已存在的属性
      const type = Array.isArray(target)
        // 如果代理目标是数组，则检测被设置的索引值是否小于数组长度
        // 如果是，则视做SET操作，否则是ADD操作
        ? Number(key) < target.length ? 'SET' : 'ADD'
        : Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD';

      // 设置属性值
      const res = Reflect.set(target, key, newVal, receiver);
      // target === receiver.raw 说明receiver就是target的代理对象
      if (target === receiver.raw) {
        // 比较新值与旧值，只有当它们不全等，并且都不是NaN的时候才触发响应(因: NaN === NaN = false)
        if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) trigger(target, key, type, newVal);
      }

      return res;
    },
    // 拦截Reflect.has操作
    has(target, key) {
      track(target, key);
      return Reflect.get(target, key);
    },
    // 拦截Reflect.ownKey操作
    ownKeys(target) {
      // 将副作用函数与 ITERATE_KEY 关联
      track(target, Array.isArray(target) ? 'length' : ITERATE_KEY);
      return Reflect.ownKeys(target);
    },
    // 拦截删除操作
    deleteProperty(target, key) {
      if (isReadonly) {
        console.warn(`属性${key}只读！`);
        return true;
      }

      // 检查被操作的属性是否是对象自己的属性
      const hadKey = Object.prototype.hasOwnProperty.call(target, key);
      // 使用 Reflect.deleteProperty 完成属性的删除
      const res = Reflect.defineProperty(target, key);

      // 只有当被删除的属性是对象自己的属性并且成功删除的时，才触发更新
      if (res && hadKey) trigger(target, key, 'DELETE');

      return res;
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
