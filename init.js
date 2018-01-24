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

$(function () {
    //初始化空闲区域
    for (var i = 0; i < 16; i++)
        idleContainers[i] = i;

    //初始化游戏界面
    gameBody = $("#game-body");
    size = getSuitableSize(0.6);
    gameBody.width(size + 50)
        .height(size + 60);
    for (i = 0; i < 16; i++) {
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

    placeABlock(randomBetween(0, 1) === 0 ? 2 : 4);

    //监听键盘的按键行为
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
    })
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
 * 执行滑动操作
 * @param arr  遍历顺序数组
 * @param direction
 */
function doAction(arr, direction) {
    var np;
    var merged = {};
    var isMove = false;
    for (var i = 0; i < arr.length; i++) {
        np = next(arr[i], direction, merged);
        if (np < 0 || cellValues[arr[i]] === undefined)
            continue;
        if (cellValues[np] === undefined) {             //目标位置是空块
            isMove = true;
            cellValues[arr[i]].target.myTransTo(containers, np);
            resetPosition(cellValues, arr[i], np);
        } else if (cellValues[np].value === cellValues[arr[i]].value) {        //可以合并
            isMove = true;
            merged[np] = np;
            easyMerge(arr[i], np);
        }
    }
    if(isMove){     //如果本次操作有块移动了，则放置一个新块
        window.setTimeout(function () {
            placeABlock(randomBetween(0, 1) === 0 ? 2 : 4);
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

////////////////////////////////////////////////////////////////////////////////////
/////////// 下面定义的是包装了信息的对象
///////////////////////////////////////////////////////////////////////////////////

function ActiveBlock(value, target) {
    this.value = value;
    this.target = target;
}