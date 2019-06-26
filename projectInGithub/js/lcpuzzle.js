(function ($) {
    $.fn.drawPuzzle = function (opt) {
        opt._self = this;
        var ii = new InitPuzzle(opt);
        return ii;
    }
    var InitPuzzle = function (opt) {
        // 向外界抛出触发随机打乱事件---------------------------
        this.handleRandom = null;
        // 向外界抛出触发还原拼图事件
        this.returnOriginal = null;
        //选择拼图游戏模式
        this.mode = opt.mode ? opt.mode : 'easy';
        // 拼图成功回调函数
        this.successCallback = opt.successCallback;
        //打乱时间
        this.goRdTime = opt.goRdTime ? opt.goRdTime : 5000;
        //游戏难易度  默认3*3
        this.hard = opt.hard ? opt.hard : 3;
        this.img = opt.img ? opt.img : '';
        //#gameBox  DOM元素
        this._self = opt._self;
        this.splitW = opt.splitW ? opt.splitW : 100;
        this.splitH = opt.splitH ? opt.splitH : 100;
        this.whiteBlock = '';
        this.preBlock = '';
        this.arrSplit = new Array();
        this.isRandom = false;
        this.init();

    }
    InitPuzzle.prototype = {
        init: function () {
            var htmlstr = '';
            var sumpic = this.hard * this.hard;
            var $gameBox = this._self;
            for (var i = 0; i < sumpic; i++) {
                var hang = Math.floor(i / this.hard);
                var lie = i % this.hard;
                var x = (lie * (100 / (this.hard - 1))) + '%';
                var y = (hang * (100 / (this.hard - 1))) + '%';
                var splitW = ((100 / this.hard)) + '%';
                var size = this.hard * 100 + '%';
                // console.log(x, y);
                if (i == sumpic - 1 && this.mode != 'easy') {
                    htmlstr += '<div class="split" data_who=' + i + ' data_hl=' + (hang + '-' + lie) + ' style="width:' + splitW + ';height:' + splitW + ';background:#fff"></div>'
                } else {
                    htmlstr += '<div class="split" data_who=' + i + ' data_hl=' + (hang + '-' + lie) + ' style="width:' + splitW + ';height:' + splitW + ';background: url(' + this.img + ') no-repeat ' + x + ' ' + y + '; background-size:' + size + '"></div>';
                }
            }
            $gameBox.html(htmlstr);
            this.whiteBlock = $gameBox.find('.split[data_who=' + (sumpic - 1) + ']');
            this.arrSplit = $gameBox.find('.split').toArray();
            if (this.mode == 'easy') {
                this.bindEvent();
            } else if (this.mode == 'hard') {
                this.bindRealEvent();
            }
        },
        //绑定事件
        bindEvent: function () {
            var $gameBox = this._self;
            var obj = this;
            obj.white = 0;
            $gameBox.unbind();
            $gameBox.on('click', '.split', function () {
                if (!obj.isRandom) { return };
                if (!obj.white) {
                    $(this).html('<div class="white"></div>');
                    obj.white = 1;
                } else {
                    var whiteSplit = $gameBox.find('.white');
                    var whiteIndex = whiteSplit.parents('.split').index();
                    var toIndex = $(this).index();
                    replacePos(whiteIndex, toIndex);
                    whiteSplit.remove();
                    obj.white = 0;

                }
                if (obj.isWin()) {
                    obj.isRandom=false;
                    obj.successCallback();
                }
            });
            // 向外界抛出触发随机打乱事件---------------------------
            this.handleRandom = function () {
                for (var i = 0; i < obj.hard * obj.hard * 2; i++) {
                    easyGoRandom();
                }
                obj.isRandom = true;
            }
            // 向外界抛出触发还原拼图事件
            this.returnOriginal = function () {
                for (var i = 0; i < obj.hard * obj.hard; i++) {
                    var realPosIndex = $gameBox.find('.split[data_who=' + i + ']').index();
                    var nowPosIndex = $gameBox.find('.split').eq(i).index();
                    replacePos(nowPosIndex, realPosIndex);
                }
                obj.isRandom = false;
            }


            function replacePos(whiteIndex, toIndex) {
                var temp = obj.arrSplit[whiteIndex];
                obj.arrSplit[whiteIndex] = obj.arrSplit[toIndex];
                obj.arrSplit[toIndex] = temp;
                $gameBox.html(obj.arrSplit);
            }
            function easyGoRandom() {
                var random1 = Math.floor(Math.random() * (obj.hard * obj.hard));
                var random2 = Math.floor(Math.random() * (obj.hard * obj.hard));
                if (random1 == random2) {
                    return
                } else {
                    replacePos(random1, random2);
                }
            }
        },

        //绑定正规拼图事件
        bindRealEvent: function () {
            var $gameBox = this._self;
            var sumpic = this.hard * this.hard;
            var that = this


            //替换位置
            function replace(whiteBlock, toBlock) {
                var whiteIndex = whiteBlock.index();
                var toIndex = toBlock.index();
                var tempHl = toBlock.attr('data_hl');
                toBlock.attr('data_hl', whiteBlock.attr('data_hl'));
                whiteBlock.attr('data_hl', tempHl);

                var tempArr = $gameBox.find('.split').toArray();
                var temp = tempArr[whiteIndex];
                tempArr[whiteIndex] = tempArr[toIndex];
                tempArr[toIndex] = temp;
                $gameBox.html(tempArr);
            }


            //找寻空白图片
            function findWhite(hang, lie) {


                // var upSplit=$gameBox.find('.split[data_hl='+((hang-1)+'-'+lie)+']');
                // var leftSplit=$gameBox.find('.split[data_hl='+(hang+'-'+(lie-1))+']');
                // var downSplit=$gameBox.find('.split[data_hl='+((hang+1)+'-'+lie)+']');
                // var rightSplit=$gameBox.find('.split[data_hl='+(hang+'-'+(lie+1))+']');

                var objBlock = findBlock(hang, lie);
                var upSplit = objBlock['upSplit'];
                var leftSplit = objBlock['leftSplit'];
                var downSplit = objBlock['downSplit'];
                var rightSplit = objBlock['rightSplit'];

                if (downSplit) {
                    if (downSplit.attr('data_who') == (sumpic - 1)) {
                        return true
                    }
                }
                if (upSplit) {
                    if (upSplit.attr('data_who') == (sumpic - 1)) {
                        return true
                    }
                }
                if (leftSplit) {
                    if (leftSplit.attr('data_who') == (sumpic - 1)) {
                        return true
                    }
                }
                if (rightSplit) {
                    if (rightSplit.attr('data_who') == (sumpic - 1)) {
                        return true
                    }
                }
                return false
            }

            //找上下左右是否有块块
            function findBlock(hang, lie) {
                hang = parseInt(hang);
                lie = parseInt(lie);
                var upSplit = $gameBox.find('.split[data_hl=' + ((hang - 1) + '-' + lie) + ']');
                var leftSplit = $gameBox.find('.split[data_hl=' + (hang + '-' + (lie - 1)) + ']');
                var downSplit = $gameBox.find('.split[data_hl=' + ((hang + 1) + '-' + lie) + ']');
                var rightSplit = $gameBox.find('.split[data_hl=' + (hang + '-' + (lie + 1)) + ']');
                var objBlock = {};
                if (downSplit.length > 0) {
                    objBlock['downSplit'] = downSplit;
                }
                if (upSplit.length > 0) {
                    objBlock['upSplit'] = upSplit;
                }
                if (leftSplit.length > 0) {
                    objBlock['leftSplit'] = leftSplit;
                }
                if (rightSplit.length > 0) {
                    objBlock['rightSplit'] = rightSplit;
                }
                return objBlock
            }

            //白块随机移动程序执行
            function randomMove() {
                var whiteBlock = that.whiteBlock;
                var w_hang = whiteBlock.attr('data_hl').split('-')[0];
                var w_lie = whiteBlock.attr('data_hl').split('-')[1];
                var objBlock = findBlock(w_hang, w_lie);
                var arrBlock = new Array();
                for (var key in objBlock) {
                    if (objBlock[key].attr('data_who') != that.preBlock) {
                        arrBlock.push(objBlock[key]);
                    }
                }
                var rdnum = Math.floor(Math.random() * arrBlock.length);
                that.preBlock = arrBlock[rdnum].attr('data_who');
                replace(whiteBlock, arrBlock[rdnum]);
            }

            //绑定打乱图片事件
            function go_random(time) {
                var itime = setInterval(function () {
                    randomMove();
                }, 30)
                setTimeout(function () {
                    clearInterval(itime)
                    that.isRandom = true;
                }, time)
            }

            // 向外界抛出触发随机打乱事件---------------------------
            this.handleRandom = function () {
                go_random(that.goRdTime);
            }

            // 向外界抛出触发还原拼图事件
            this.returnOriginal = function () {
                for (var i = 0; i < that.hard * that.hard; i++) {
                    var realPosBlock = $gameBox.find('.split[data_who=' + i + ']');
                    var nowPosBlock = $gameBox.find('.split').eq(i);
                    replace(nowPosBlock, realPosBlock);
                }
                that.isRandom = false;
            }



            //绑定图片点击事件
            $gameBox.unbind();
            $gameBox.on('click', '.split', function () {
                if (!that.isRandom || $(this).attr('data_who') == sumpic - 1) {
                    return
                }
                var $this = $(this);
                var $whiteSplit = $gameBox.find('.split[data_who=' + (sumpic - 1) + ']');
                var toHnag = $(this).attr('data_hl').split('-')[0];
                var toLie = $(this).attr('data_hl').split('-')[1];
                if (findWhite(toHnag, toLie)) {
                    replace($whiteSplit, $this)
                }
                if (that.isWin()) {
                    that.isRandom=false;
                    that.successCallback();
                
                }

            })
        },
        isWin: function () {
            //判断是否排列成功
            var $split = this._self.find('.split');
            for (var i = 0; i < $split.length; i++) {
                if ($split.eq(i).attr('data_who') != i) {
                    return false
                }
            }
            return true
        }
    }

})(jQuery)
