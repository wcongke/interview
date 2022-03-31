/**
 * @function 数组洗牌
 * @param {Array} arr
 */
function randomSort(arr) {
  if (!arr || !Array.isArray(arr)) return arr;

  let rIndex;
  let temp;

  for (let i = 0; i < array.length; i++) {
    rIndex = Math.floor(Math.random() * (arr.length - i)) + i;
    temp = arr[i];
    arr[i] = arr[rIndex];
    arr[rIndex] = temp;
  }

  return arr;
}
