## 浏览器 面试题

### 1.输入URL到页面的呈现
- `DNS`解析
- `TCP`三次握手
- 发送请求，分析url，设置请求报文（头、主体）
- 服务器返回请求文件（html）
- 浏览器渲染
    - 解析html生成 `DOM Tree`
      - 标记化算法，进行元素状态的标记
      - dom树构建
    - 解析css生成 `Style Tree`
    - 结合`DOM Tree`与`Style Tree`，生成渲染树(`Render Tree`)
    - 布局`Render Tree`(`layout/reflow`)，负责各种元素尺寸、位置计算
    - 绘制`Render Tree`, 绘制页面像素信息
    - 将像素发送给GPU展示在页面上

> [浏览器面试题](https://juejin.im/post/5df5bcea6fb9a016091def69)

### 2.防抖和节流
防抖和节流都是希望在同一时间内，不要重复触发请求。一般场景在搜索和网页滚动事件中。
- 区别
  - 防抖主要是在规定时间内触发一次，如果再次调用，时间重新计算
  - 节流主要是在固定时间内触发一次。比如每间隔1s触发一次
