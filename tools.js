/**
 * 往空闲处放置一个活动块
 * @param value
 * @return 正值 ==> 放置的位置
 *          负值 ==> 没有空闲位置（Game over）
 */
function placeABlock(value) {
    var idlePosition = selectAIdleCell();
    if (idlePosition < 0)
        return idlePosition;
    addNewCellTo(idlePosition, value);
    return idlePosition;
}

/**
 *  获取合适的size，根据当前屏幕的大小
 * @param ratio
 * @returns {*}
 */
function getSuitableSize(ratio) {
    var win = $(window);
    var w = win.width();
    var h = win.height();
    var size = w > h ? h : w;
    size *= ratio;
    return size;
}

/**
 * 向指定的空块中添加一个活动块（该位置若有活动块，则不做任何操作）
 * @param position 向哪个位置添加，第一个容器的位置为0
 * @param value
 */
function addNewCellTo(position, value) {
    if (checkValue(position) > 0)
        return false;
    var ab = new ActiveBlock(value, $("<div></div>")
        .addClass("cell work-cell")
        .width(size / 4)
        .height(size / 4)
        .text(value)
        .css({
            "left": containers[position].offset().left,
            "top": containers[position].offset().top,
            "font-size": size / 12,
            "padding-top": size / 16,
            "background-color": colors[value]
        }));
    gameBody.append(ab.target);
    cellValues[position] = ab;
    delete idleContainers[position];
    return true;
}

/**
 * 检测某个位置块上是否有值
 * @param position
 * @returns 正值 ==> 有效值（该位置上有活动块）
 *           负值 ==> 无效值（该位置上没有活动块）
 */
function checkValue(position) {
    console.log(cellValues);
    if (cellValues[position] === undefined)
        return -1;
    return cellValues[position];
}

/**
 * 试图随机选择一个空闲容器，若没有空闲容器，则返回-1，游戏结束
 * @returns {number}
 */
function selectAIdleCell() {
    var keys = Object.keys(idleContainers);
    if (keys.length === 0)
        return -1;
    return idleContainers[keys[randomBetween(0, keys.length - 1)]];
}

/**
 * 生成一个介于min和max之间的随机数
 * @param min
 * @param max
 */
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}


/**
 * 获取下一个移动的位置
 * @param cellValues  保存所有活动块信息
 * @param position    要移动块的位置
 * @param direction 方向（up, down, left, right）
 * @return 非负值 ==> 下一个移动的位置
 *          负值 ==> 方向参数错误或无法往这个方向上移动
 *                   -1 : 无法找到下一个移动位置
 */
function nextPosition(position, direction) {
    var colNum = position % 4;              //列号
    var rowNum = Math.floor(position / 4);  //行号
    var result = -1;
    switch (direction.toLowerCase()) {
        case 'u':
        case 'up':
            result = rowNum === 0 ? -1 : (rowNum - 1) * 4 + colNum;
            break;
        case 'd':
        case 'down':
            result = rowNum === 3 ? -1 : (rowNum + 1) * 4 + colNum;
            break;
        case 'l':
        case 'left':
            result = colNum === 0 ? -1 : rowNum * 4 + colNum - 1;
            break;
        case 'r':
        case 'right':
            result = colNum === 3 ? -1 : rowNum * 4 + colNum + 1;
            break;
    }
    return result;
}

/**
 * 设置一个活动块的新位置
 * @param cellValues
 * @param oldPosition
 * @param newPosition
 */
function resetPosition(cellValues, oldPosition, newPosition) {
    var target = cellValues[oldPosition];
    if (target === undefined)
        return;
    delete cellValues[oldPosition];
    delete idleContainers[newPosition];
    idleContainers[oldPosition] = oldPosition;
    cellValues[newPosition] = target;
}

/**
 * 合并两个块
 */
function myMerge(oldItem, targetItem) {
    targetItem.target.text(targetItem.value);
    targetItem.target.css({
       "background-color": colors[targetItem.value] ? colors[targetItem.value] : "orange"
    });
    // targetItem.value = targetItem.value + oldItem.value;
    oldItem.target.remove();
}

//保存各个值对应的块的颜色
var colors = {
    2: "darkturquoise",
    4: "darkturquoise",
    8: "coral",
    16: "coral",
    32: "darkorange",
    64: "darkorange",
    128: "greenyellow",
    256: "greenyellow",
    512: "orange",
    1024: "orange"
};

/**
 * 扩展jQuery的方法
 * @param containers
 * @param position
 */
$.fn.extend({
    myTransTo: function (containers, position, callback) {
        $(this).animate({
            left: containers[position].offset().left,
            top: containers[position].offset().top
        }, 100, callback);
    }
});
