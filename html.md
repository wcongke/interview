## html 面试题

### 1.响应式的好处
对某些数据的修改就能自动更新视图，让开发者不用再去操作dom，有更多的时间去思考业务逻辑

### 2.document/window/html/body的层级关系
层级关系
```
window > document > html > body
```
- `window`是`BOM`的核心对象，它一方面用来获取或设置浏览器的属性和行为，另一方面作为一个全局对象
- `document`对象是一个根文档相关的对象，拥有一些操作文档内容的功能。但地位没有`window`高
- `html`元素对象和`document`元素对象是属于`html`文档的`DOM`对象，可以被认为是`html`源代码中那些标签所化成的对象。他们根`div`、`select`什么对象没有根本区别

### 3.h5自适应方案
可在应用初始化时根据窗口宽度来修改根节点的字体大小
```js
(function() {
  // 获取document的根元素
  const html = document.documentElement
  function onWindowResize () {
    // html.getBoundingClientRect().width 获取html的宽度（窗口的宽度）
    html.style.fontSize = html.getBoundingClientRect().width / 20 + 'px'
  }
  // 监听window的resize事件
  window.addEventListener('resize', onWindowResize)
  onWindowResize()
})()
```

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-sacle=1.0, maximum-scale=1.0, user-scalable=no" />
```
