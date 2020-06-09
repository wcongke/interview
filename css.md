## CSS 面试题

### 1.DIV+CSS 布局的好处

1.代码精简，且结构与样式分离，易于维护

2.代码量减少了，减少了大量的带宽，页面加载的也更快，提升了用户体验

3.对seo搜索引擎更加友好，且h5又新增了许多语义化标签更是如此

4.允许更多炫酷的页面效果，丰富了页面

5.符合w3c标准，保证网站不会因为网络应用的升级而被淘汰

缺点：不同浏览器对web标准默认值不同，所以容易出现对浏览器的兼容性问题。

### 2.如何解决a标签点击后hover事件失效的问题

改变a标签css属性的排列顺序，需要记住 `LoVe HAte` 原则
```
link -> visited -> hover -> active
```
> 注意各个阶段的含义
- `a:link` 未访问时的样式，一般省略成 `a`
- `a:visited` 已经访问后的样式
- `a:hover` 鼠标移上去时的样式
- `a:active` 鼠标按下去时的样式

### 3.盒模型
盒模型包括
- `content`
- `padding`
- `border`
- `margin`

盒模型分为
- `IE盒模型`
  - 宽度包含了`padding`和`border`
- `标准w3c盒模型`
  - 宽度就是内容宽度


### 4.CSS清除浮动
- 父级元素设置高度，手动撑开
- 浮动元素结尾增加空标签，设置 `clear: both`
- 父元素设置 `overflow: hidden`
- 父元素添加伪类 `:after` 和 `:zoom`

### 5.CSS选择器优先级
`!import > 内联样式（style）> ID选择器 > 类/属性/伪类 > 元素/关系`

### 6.CSS实现三列布局（左右固定宽度，中间自适应）
- CSS浮动
  - 左边设置 `float: left`
  - 右边设置 `float: right`
  - 中间设置 `margin-left` 和 `margin-right`
- 绝对定位法
  - 左边定位到left
  - 右边定位到right
  - 中间设置 `margin-left` 和 `margin-right`
- flex布局
  ```css
    .left {
      width: 200px;
    }
    .right {
      width: 200px;
    }
    .center {
      flex: 1;
    }
  ```

### 7.flex布局
`flex`是一种弹性布局，包含`flex-container`和`flex-item`
常见的属性包括`flex-direction`、`flex-wrap`、`justify-content`、`align-items`
水平居中`justify-content: center`，水平两头居中`justify-content: space-between`，垂直居中`align-items: center`
