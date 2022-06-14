/**
 * @function 冒泡排序
 * @description 对相连的元素进行两两比较，顺序相反则进行交换。这样，每一趟会将最小或最大的元素「浮」到顶端，最终达到有序
 * @param {Array[number]} array 
 */
function bubbleSort(array) {
  if (!Array.isArray(array) || !array.length) return;
  let lastIndex = array.length - 1;

  // 当最后一个交换的元素为第一个时，说明后面的元素全部排序完成
  while (lastIndex > 0) {
    let flag = true,
      k = lastIndex;

    for (let j = 0; j < k; j++) {
      if (array[j] > array[j + 1]) {
        flag = false;
        // 设置最后一次交换的位置
        lastIndex = j;
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
      }
    }

    if (flag) break;
  }

  return array;
}
