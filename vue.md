## VUE面试题

### 1.vue的优点和缺点
首先vue最核心的两个特点，响应式和组件化

#### 优点
- **响应式** 这是vue的最大优点，通过mvvm思想实现数据的双向绑定，通过虚拟dom让我们可以用数据来操作dom，而不必操作真实的dom，提升了性能。且让开发者有更多的时间去思考业务逻辑

- **组件化** 把一个单页应用中的各个模块拆分到一个个组件中，或者把一些公共的部分抽离出来做成一个可以复用的组件。所以组件化带来的好处是，提高了开发效率，方便重复使用，使项目的可维护性更强

- **虚拟dom**

#### 缺点
- 基于对象配置文件的写法，也就是option写法，开发时不利于对一个属性的查找
- 不利于seo
- 导航不可用
- 初次加载耗时较长

### 2.vue中`hash`模式和`history`模式的区别
- `hash`模式的`url`中会夹杂着#`#`号，而`history`模式没有
- vue底层对它们的实现方式是不同的。`hash`模式是依靠`onhashchange`事件（监听`location.hash`的改变），而`history`模式主要是依靠`html5 history`中新增的两个方法，`pushState()`可以改变`url`地址且不会发送请求，`replaceState()`可以读取历史记录栈，还可以对浏览器记录进行修改
- 当真正需要通过`url`向后端发送`http`请求时，比如创建的用户手动输入`url`后回车，或者是刷新浏览器，这时候`history`模式需要后端支持。因为在`history`模式，前端的`url`必须和实际后端发送的请求`url`一致，列如有一个`url`是带有路径`path`的（列如`www.baidu.com/p/123`），如果后端没有对这个路径做处理的话，就会返回404错误。所以需要后端增加一个覆盖所有情况的候选资源，一般会配合前端给出一个`404`页面

```js
// hash
window.onhashchange = function (e) {
  // location.hash获取到的是包括#号的，如'#heading-3'
  // 所以可以截取一下
  let hash = location.hash.slice(1);
  console.log(hash)
}
```

### 3.vue中key的作用
`key`的作用时尽可能的复用`DOM`元素
`key`不能设置为一个`Math.random()`，如果设置成一个随机数，那每次重写渲染都会时另一个数了，根本不可能达到复用的效果
新旧children中的节点只有顺序时不同的时候，最佳的操作应该是通过移动元素的位置来达到更新的目的。
需要在新旧children的节点中保存映射关系，以便那够在旧children的节点中找到可以复用的节点。key也就是children中节点的唯一标识。

### 4.vue的diff算法
`diff`算法的过程
- 先同级比较在比较子节点
- 先判断一方有子节点和一方没有子节点的情况。如果新的一方有子节点，旧的一方没有，相当于新的子节点替代了原来没有的节点；同理，如果新的一方没有子节点，旧的一方有，相当于要把老的节点删除
- 再来比较都有子节点的情况，这里时`diff`的核心。首先会通过判断两个节点的`key`、`tag`、`isComment`、`data`同时定义或不定义以及当标签类型为input的时候type相不相同来确定两个节点是不是相同的节点，如果不是的话就将新节点替换旧节点
- 如果是相同节点的话才会进入到`patchVNode`阶段。在这个阶段核心是采用双端比较的算法，同时从新旧节点的两端进行比较，在这个过程中，会用到模板编译时的静态标记配合`key`来跳过对比静态节点，如果不是的话在进行其他的比较

#### 4.1 diff算法的缺点
因为采用的是同级比较，所以如果发现本级的节点不同的话就会将新节点之间替换旧节点，不会再去比较其下的子节点是否有相同。

### 5.那你能讲一讲MVVM吗？
`MVVM`是`Model-View-ViewModel`缩写，就是把`MVC`中的`Controller`演变成`ViewModel`。`Model`层代表数据模型，`View`代表UI组件，`ViewModel`是`View`和`Model`的桥梁，数据会绑定到`ViewModel`层并自动将数据渲染到页面中，视图变化时会通知`ViewModel`更新数据

### 6.Vue2.x响应式原理
Vue在初始化数据时，会使用`Object.defineProperty`重新定义data中的所有属性，当页面使用对应属性时，首先会进行依赖收集（收集当前组件的`watcher`）如果属性发生变化会通知相关依赖进行更新操作（**发布订阅**）。

#### 6.1 Vue2.x中如何监测数组变化
使用了函数劫持的方式，重写了数组的方法，Vue将data中的数组进行了原型链的重写，指向了自己定义的数组原型方法。这样当调用数组api时，可以通知依赖更新。如果数组中包含着应用类型，会对数组中的引用类型再次递归遍历进行监控。这样旧实现了监测数组变化。

### 7.Vue3.x响应式原理
Vue3.x该用`Proxy`替代`Object.defineProperty`。因为`Proxy`可以直接监听对象和数组的变化，并且有多达13种拦截方法。并且作为鑫标准将收到浏览器厂商终点扶持的性能优化。

#### 7.1 `Proxy`只会代理对象的第一层，那Vue3又是怎么处理的？
判断当前的`Reflect.get`的返回值是否为Object，如果时则再通过`reactive`方法做代理，这样就解决了速度观测。

#### 7.2 监测数组的时候可能触发多次`get/set`，那么如何防止多次触发？
可以判断`key`是否为当前被代理对象的`target`自身属性，也可以判断旧值与新值是否相等，只有满足以上两个条件之一时，才有可能执行`trigger`

### 9.nextTick原理
在下一次DOM更新循环结束之后执行延迟回调。`nextTick`主要使用了宏任务和微任务。根据执行环境分别尝试采用
- `Promise`
- `MutationObserver`
- `setImmediate`
- 如果以上都不行则采用`setTimeout`

定义了一个异步方法，多次调用`nextTick`会将方法存入队列中，通过这个异步方法清空当前队列。

> 实际上考量的是`javascript`中的事件循环`EventLoop`

### 10.Vue的生命周期
- **`beforeCreate`** 是`new Vue()`之后触发的第一个钩子，在当前阶段`data`、`methods`、`computed`以及`watch`上的方法和数据都不能被访问
- **`created`** 在实例创建后发生的，当前阶段已经完成了数据监测，也就是可以使用数据更改数据，在这里更改数据不会触发`updated`函数。可以做一些初始数据的获取，在当前阶段无法与DOM进行交互，如果非要想，可以通过`vm.$nextTick`来访问DOM
- **`beforeMount`** 发生在挂载之前，在这之前`template`模板已导入渲染函数编译，而当前阶段虚拟Dom已经创建完成，即将开始渲染。在此时也可以对数据进行更改，不会触发`updated`
- **`mounted`** 在挂载完成之后，在当前阶段，真实的Dom挂载完毕，数据完成双向绑定，可以访问到Dom节点，使用`$refs`属性对Dom进行操作
- **`beforeUpdate`** 发生在更新之前，也就是响应式数据发送更新，虚拟Dom重新渲染之前被触发，你可以在当前阶段进行更改数据，不会造成重渲染
- **`updated`** 在更新完成之后，当前阶段组件Dom已经完成更新。要注意的是避免在此期间更改数据，因为这可能会导致无限循环的更新
- **`beforeDestroy`** 发送在实例销毁之前，在当前阶段实例可以完全被使用，我们可以在这时候进行善后收尾工作，比如清除计数器
- **`destroy`** 发送在实例销毁之后，这时候只剩下了dom空壳。组件已经被拆解，数据绑定被卸除，监听被移出，子实例也被统统销毁

> [从源码解读Vue生命周期](https://juejin.im/post/5d1b464a51882579d824af5b)

### 11.接口请求一般放在哪个生命周期里
接口请求一般放在`mounted`中，但是需要注意的是服务端渲染不支持`mounted`，需要放在`created`中。

### 12.`Computed`和`Watch`
- `computed`本质是一个具备缓存的`watcher`，依赖的属性发生变化就会更新视图。适用于计算比较消耗性能的计算场景。当表达式过于复杂时，在模板中放入过多逻辑会让模板难以维护，可以将复杂的逻辑放在计算属性中处理
- `watch`没有缓存的作用，更多的是观察的作用，可以监听某些数据执行回调。当我们需要深度监听对象中的属性时。可以打开`deep: true`，这样便会对对象中的每一项进行监听。这样会带来性能问题，优化的话可以使用**字符串形式**监听，如果没有写到组件中，不要忘记使用`unWatch`手动注销

### 13.`v-if`和`v-show`
- `v-if` 控制元素会不会被渲染到DOM中
- `v-show` 控制样式`display`,切换当前DOM的显示和隐藏

### 14.组件中的`data`为什么是一个函数
一个组件被复用多次的话，也就会创建多个实例。本质上，**这些实例用的都是同一个构造函数**。如果data是对象的话，对象属于应用类型，会影响到所有的实例。所以为了保证组件不同实例之间的data不冲突，data必须是一个函数


### 15.v-model的原理
`v-model`本质是一个语法糖，可以看做是`value + input`方法的语法糖。可以通过model属性的`prop`和`event`属性来进行自定义。原生的`v-model`，会根据标签的不同生成不同的事件和属性

### 16.Vue的事件绑定
原生事件是通过`addEventListener`绑定给真实元素的，组件事件绑定是通过Vue自定义的`$on`实现的

### 17.Vue的模板编译原理
Vue的编译过程就是将`template`转化成`render`函数的过程。会经历一下阶段：
- 生成AST树
- 优化
- codegen

首先解析模板，生成**AST语法树**(一种用javascript对象的形式来描绘整个模板)。使用大量的正则表达式对模板进行解析，遇到标签、文本的时候都会执行对应的钩子进行相关处理。

Vue的数据是响应式的，但其实模板中并不是所有的数据都是响应式的。有时候数据首次渲染后就不会在变化，对应的DOM也不会变化。那么优化的过程就是深度遍历AST树，按照相关条件对树节点进行标记。这些被标记的节点（静态节点）我们就可以**跳过他们的比对**，对运行时的模板起到很大的优化作用。

编译的最后异步是**将优化后的AST树转换为可执行的代码**。

### 18.`keep-alive`
`keep-alive`可以实现组件缓存，当组件切换时不会对当前组件进行卸载。
常用的两个属性`include/exclude`，允许组件有条件的进行缓存。
两个生命周期`activated/deactivated`，用来得知当前组件是否处于活跃状态。
`keep-alive`中还采用了`LRU(least recently used)`算法

### 19.Vue中组件的生命周期调用顺序
组件的调用顺序都是**先父后子**，渲染完成顺序是**先子后父**
组件的销毁操作是**先父后子**，销毁完成的顺序时**先子后父**

#### 19.1 加载渲染过程
`父beforeCreated -> 父created -> 父beforeMount -> 子beforeCreated -> 子created -> 子beforeMount -> 子mounted -> 父mounted`

#### 19.2 子组件更新过程
`父beforeUpdate -> 子beforeUpdate -> 子updated -> 父updated`

#### 19.3 父组件更新过程
`父beforeUpdate -> 父updated`

#### 19.4 销毁过程
`父beforeDestroy -> 子beforeDestroy -> 子destroyed -> 父destroyed`

#### 20.Vue2.x组件通讯方式
- 父子组件通讯
  - 父 -> 子`props`，子 -> 父`$on、$emit`
  - 获取父子组件实例 `$parent、$children`
  - `ref`获取实例的方式调用组件的属性或者方法
  - `Provide、Inject`官方不推荐使用，但是写组件库时比较常用

- 兄弟组件通讯
  - `Event Bus`实现跨组件通讯 `Vue.prototype.$bus = new Vue`
  - `Vuex`

- 跨级组件通讯
  - `Vuex`
  - `$attrs`、`$listeners`
  - `Provide、Inject`

### 21.虚拟`DOM`原理实现
- 创建dom树
- 树的 `diff`，同层比较，输出`patchs(listDiff/diffChildren/diffProps)`
  - 没有新的节点，返回
  - 新的节点`tagName`与`key`不变，对比`props`，继续递归遍历子树
    - 对比属性（对比新旧属性列表）：
      - 旧属性是否存在于新属性列表中
      - 都存在的是否有变化
      - 是否出现旧列表中没有的新属性
  - `tagName`和`key`值变化了，则直接替换成新节点
- 渲染差异
  - 遍历`patchs`，把需要更改的节点取出来
  - 局部更新`dom`
```js
// diff 算法的实现
function diff (oldTree, newTree) {
  // 差异收集
  let pathchs = {}
  dfs(oldTree, newTree, 0, pathchs)
  return pathchs
}

function dfs (old, newNode, index, pathchs) {
  let curPathchs = []
  if (newNode) {
    // 当新旧节点的 tagName 和 key 值完全一致时
    if (oldNode.tagName === newNode.tagName && oldNode.key === newNode.key) {
      // 继续比较差异
      let props = diffProps(oldNode.props, newNode.props)
      curPathchs.push({
        type: 'changeProps',
        props
      })
      diffChildrens(oldNode.children, newNode.children, index, pathchs)
    } else {
      // 当tagName或者key修改了后，表示已经是全新节点，无需在比
      curPathchs.push({
        type: 'replaceNode',
        node: newNode
      })
    }
  }

  // 构造出整颗差异树
  if (curPathchs.length) {
    if (pathchs[index]) {
      pathchs[index] = pathchs[index].concat(curPathchs)
    } else {
      pathchs[index] = curPathchs
    }
  }
}

// 属性对比实现
function diffProps (oldProps, newProps) {
  let propsPathchs = []
  // 遍历新旧属性列表
  // 查找删除项
  // 查找修改项
  // 查找新增项
  forin(oldProps, (k, v) => {
    if (!newProps.hasOwnProperty(k)) {
      propsPathchs.push({
        type: 'remove',
        prop: k
      })
    } else {
      if (v !== newProps[k]) {
        propsPathchs.push({
          type: 'change',
          prop: k,
          value: newProps[k]
        })
      }
    }
  })
  forin(newProps, (k, v) => {
    if (!oldProps.hasOwnProperty(k)) {
      propsPathchs.push({
        type: 'add',
        prop: k,
        value: v
      })
    }
  })
  return propsPathchs
}

// 对比子级差异
function diffChildrens(oldChild, newChild, index, pathchs) {
  // 标记子级的删除/新增/移动
  let {
    change, list
  } = diffList(oldChild, newChild, index, pathchs)

  if (change.length) {
    if (pathchs[index]) {
      pathchs[index] = pathchs[index].concat(change)
    } else {
      pathchs[index] = change
    }
  }

  // 根据key获取原本匹配的节点，进一步递归从头开始对比
  oldChild.map((item, i) => {
    let keyIndex = list.indexOf(item.key)
    if (keyIndex) {
      let node = newChild[keyIndex]
      // 进一步递归对比
      dfs(item, node, index, pathchs)
    }
  })
}

// 列表对比，主要也是根据key值查找匹配项
// 对比出新旧列表的新增/删除/移动
function diffList(oldList, newList, index, pathchs) {
  let change = []
  let list = []
  const newKeys = getKey(newList)
  oldList.map(v => {
    if (newKeys.indexOf(v.key) > -1) {
      list.push(v.key)
    } else {
      list.push(null)
    }
  })

  // 标记删除
  for (let i = list.length - 1; i >= 0; i--) {
    if (!list[i]) {
      list.splice(i, 1)
      change.push({
        type: 'remove',
        index: i
      })
    }
  }

  // 标记新增和移动
  newList.map((item, i) => {
    const key = item.key
    const index = list.indexOf(key)
    if (index === -1 || key == null) {
      // 新增
      change.push({
        type: 'add',
        node: item,
        index: i
      })
      list.splice(i, 0, key)
    } else {
      // 移动
      if (index !== i) {
        change.push({
          type: 'move',
          form: index,
          to: i
        })
        move(list, index, i)
      }
    }
  })
  
  return {
    change,
    list
  }
}
```

### 22.Vue性能优化
#### 22.1编码阶段
- 尽量减少data中的数据，data中的数据都会增加getter和setter，会收集对应的watcher
- v-if和v-for不能连用
- 如果需要使用v-for给每项元素绑定事件时使用事件代理
- SPA 页面采用keep-alive缓存组件
- 在更多的情况下，使用v-if替代v-show
- key保证唯一
- 使用路由懒加载、异步组件
- 防抖、节流
- 第三方模块按需导入
- 长列表滚动到可视区域动态加载
- 图片懒加载

#### 22.2SEO优化
- 预渲染
- 服务端渲染SSR

#### 22.3打包优化
- 压缩代码
- Tree Shaking/Scope Hoisting
- 使用cdn加载第三方模块
- 多线程打包happypack
- splitChunks抽离公共文件
- sourceMap优化

#### 22.4用户体验
- 骨架屏
- PWA

#### 23.其他
- [加载pdf](https://juejin.im/post/5ed3974ae51d45784d7ca7a5)
- [性能优化](https://juejin.im/post/5d548b83f265da03ab42471d)