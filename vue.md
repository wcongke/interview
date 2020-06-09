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

#### diff算法的缺点
因为采用的是同级比较，所以如果发现本级的节点不同的话就会将新节点之间替换旧节点，不会再去比较其下的子节点是否有相同。

### 5.双向绑定

### 6.nextTick原理

### 7.虚拟`DOM`原理实现
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