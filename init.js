//保存游戏区域的大小
var size = 0;
//保存16个容器（每个容器盛装一个活动块）
var containers = [];
//游戏区域块
var gameBody = null;
//保存每个块的值
var cellValues = {};
//保存空闲区域
var idleContainers = {};

//保存遍历顺序
var left_order = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
var right_order = [3, 2, 1, 0, 7, 6, 5, 4, 11, 10, 9, 8, 15, 14, 13, 12];
var up_order = [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15];
var down_order = [12, 8, 4, 0, 13, 9, 5, 1, 14, 10, 6, 2, 15, 11, 7, 3];

//分数系统
var scoreNum = 0;
var bestScore = 0;
var scoreItem;
var bestItem;

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
 * 开始一局新的游戏
 */
function startNewGame() {
    var keys = Object.keys(cellValues);
    for(var i = 0; i < keys.length; i++){
        cellValues[keys[i]].target.remove();
        delete cellValues[keys[i]];
    }
    //初始化空闲区域
    for (i = 0; i < 16; i++)
        idleContainers[i] = i;
    scoreNum = 0;
    scoreItem.text(0);
    //随机在空闲位置放上一个活动块
    randomAdd();
}

function randomAdd(){
    placeABlock(randomBetween(0, 1) === 0 ? 2 : 4);
}
var startX;
var startY;
function handleTouchEvent(event) {
    switch (event.type){
        case "touchstart":
            startX = event.touches[0].pageX;
            startY = event.touches[0].pageY;
            break;
        case "touchend":
            var spanX = event.changedTouches[0].pageX - startX;
            var spanY = event.changedTouches[0].pageY - startY;

            if(Math.abs(spanX) > Math.abs(spanY)){      //认定为水平方向滑动
                if(spanX > 30){         //向右
                    myRight();
                } else if(spanX < -30){ //向左
                    myLeft();
                }
            } else {        //认定为垂直方向滑动
                if(spanY > 30){         //向下
                    myDown();
                } else if (spanY < -30) {//向上
                    myUp();
                }
            }

            break;
        case "touchmove":
            //阻止默认行为
            event.preventDefault();
            break;
    }
}
/**
 * 处理手机触摸事件
 */
function dealTouchEvent() {
    EventUtil.addHandler(document, "touchstart", handleTouchEvent);
    EventUtil.addHandler(document, "touchend", handleTouchEvent);
    EventUtil.addHandler(document, "touchmove", handleTouchEvent);
}

/**
 * 处理键盘事件
 */
function dealKeyDownEvent() {
    $(document).keydown(function (event) {
        switch (event.which) {
            case 38: //上
                myUp();
                break;
            case 39: //右
                myRight();
                break;
            case 40: //下
                myDown();
                break;
            case 37: //左
                myLeft();
                break;
        }
        console.log(event.which);
    });
}

$(function () {
    scoreItem = $("#score_value");
    bestItem = $("#best_value");
    $("#new_game").click(function () {
       startNewGame();
    });
    //初始化游戏界面
    gameBody = $("#game-body");
    size = getSuitableSize(0.6);
    $("#score").width(size + 50);
    gameBody.width(size + 50)
        .height(size + 60);
    for (var i = 0; i < 16; i++) {
        var div = $("<div></div>")
            .addClass("cell")
            .width(size / 4)
            .height(size / 4)
            .attr({
                'id': 'b-container' + i
            });
        containers.push(div);
        gameBody.append(div);
    }

    //监听键盘的按键行为
    dealKeyDownEvent();

    //处理手机的触摸事件
    dealTouchEvent();
    startNewGame();
});

/**
 * 左滑操作
 */
function myLeft() {
    doAction(left_order, 'l');
}

/**
 * 上滑操作
 */
function myUp() {
    doAction(up_order, 'u');
}

/**
 * 下滑操作
 */
function myDown() {
    doAction(down_order, 'd');
}

/**
 * 右滑操作
 */
function myRight() {
    doAction(right_order, 'r');
}

/**
 * 更新分数
 * @param plusScore
 */
function updateScore(plusScore) {
    scoreNum += plusScore;
    scoreItem.text(scoreNum);
    if(scoreNum > bestScore){
        bestScore = scoreNum;
        bestItem.text(bestScore);
    }
}

/**
 * 执行滑动操作
 * @param arr  遍历顺序数组
 * @param direction
 */
function doAction(arr, direction) {
    var np;
    var merged = {};
    var isMove = false;
    var plusScore = 1;
    for (var i = 0; i < arr.length; i++) {
        np = next(arr[i], direction, merged);
        if (np < 0 || cellValues[arr[i]] === undefined)
            continue;
        if (cellValues[np] === undefined) {             //目标位置是空块
            isMove = true;
            cellValues[arr[i]].target.myTransTo(containers, np);
            resetPosition(cellValues, arr[i], np);
        } else if (cellValues[np].value === cellValues[arr[i]].value) {        //可以合并
            plusScore *= cellValues[np].value;
            isMove = true;
            merged[np] = np;
            easyMerge(arr[i], np);
        }
    }
    if(isMove){     //如果本次操作有块移动了，则放置一个新块
        window.setTimeout(function () {
            randomAdd();
            if(plusScore !== 1)
                updateScore(plusScore);
        }, 100)
    }

}

/**
 * 获取下一次能滑到的最后的位置
 * @param position
 * @param direction
 * @param merged
 * @return {number}
 */
function next(position, direction, merged) {
    if (cellValues[position] === undefined)      //空块不移动
        return -1;
    var np = nextPosition(position, direction);
    var pre = np;
    while (np >= 0 && (cellValues[np] === undefined || cellValues[np].value === cellValues[position].value)
    && merged[np] === undefined) {
        pre = np;
        np = nextPosition(np, direction);
    }
    return pre;
}

function easyMerge(oldPosition, newPosition, callback) {
    var oldItem = cellValues[oldPosition];
    var newItem = cellValues[newPosition];
    if (oldItem === undefined || newItem === undefined)
        return;
    newItem.value = oldItem.value + newItem.value;
    delete cellValues[oldPosition];
    idleContainers[oldPosition] = oldPosition;
    oldItem.target.myTransTo(containers, newPosition, function () {
        if (typeof callback === "function" || typeof callback === "object")
            callback();
        myMerge(oldItem, newItem);
    });
}

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

////////////////////////////////////////////////////////////////////////////////////
/////////// 下面定义的是包装了信息的对象
///////////////////////////////////////////////////////////////////////////////////

function ActiveBlock(value, target) {
    this.value = value;
    this.target = target;
}