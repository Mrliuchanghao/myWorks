(function ($) {
    $.fn.lcCircleChart = function (opt) {
        var ii=[];
        this.each(function(ind,el){
            opt._self = $(el);
            ii.push(new LcCircleChartClass(opt)) ;
        })
        return ii;
       
    }

    var LcCircleChartClass = function (opt) {
        this._self = opt._self;
        //[背景圆颜色，主圆颜色，副圆颜色]
        this.colorArr = opt.colorArr ? opt.colorArr : ['#e6e6e6', '#6bba65', '#6bba65'];
        //百分比
        this.per = opt.per ? opt.per : 80;
        //[背景圆粗细，主圆粗细，副圆粗细] 相对大圆宽度的占比，默认[0.10,0.16,0.02]
        this.lineWidth = opt.lineWidth ? opt.lineWidth : [0.10,0.16,0.02];


        //容器大小
        this.sizeW = opt._self.outerWidth();
        //容器中心
        this.org = this.sizeW / 2;

        // 起始弧度
        this.sHudu = 0;
        // 当前弧度
        this.cHudu = 0;
        // 结束弧度
        this.eHudu = 0;
        this.init();


    }
    // 百分比和弧度的转化方法
    var  rToD = function(rad) {return rad / Math.PI * 180} ;
    var  dToR = function(deg) {return  deg / 180 * Math.PI} ;
    var  pToR = function(percent) {return dToR(percent / 100 * 360)} ;
    var  rToP = function(rad){return rToD(rad) / 360 * 100} ;

    var TWEEN = {};
    TWEEN.easeInOutCubic = (t, b, c, d) => {
        t /= d / 2;
        if (t < 1)
            return c / 2 * t * t * t + b;
        t -= 2;
        return c / 2 * (t * t * t + 2) + b;
    };

    LcCircleChartClass.prototype = {
        init: function () {
            var newCtx = this.creatCanvas();
            var that=this;
            this.animate(0,this.per,function(cPer){
                that.drawBackCircle(newCtx);
                that.drawCircle(newCtx,cPer);
            })

        },
        // 创建画布
        creatCanvas: function () {
            var $canvas = this._self.find('canvas');
            $canvas.css({
                'display': 'block',
                'width': this.sizeW,
                'height': this.sizeW
            })
            var getPixelRatio = function (context) {
                var backingStore = context.backingStorePixelRatio ||
                    context.webkitBackingStorePixelRatio ||
                    context.mozBackingStorePixelRatio ||
                    context.msBackingStorePixelRatio ||
                    context.oBackingStorePixelRatio ||
                    context.backingStorePixelRatio || 1;
                return (window.devicePixelRatio || 1) / backingStore;
            };

            var ctx = $canvas[0].getContext("2d");

            var ratio = getPixelRatio(ctx);

            $canvas[0].width = this.sizeW * ratio;
            $canvas[0].height = this.sizeW * ratio;

            $canvas[0].style.width = this.sizeW + 'px';
            $canvas[0].style.height = this.sizeW + 'px';

            ctx.scale(ratio, ratio);

            this.oneCtx = ctx;
            return ctx;
        },
        // 画背景圆
        drawBackCircle: function (ctx) {
            ctx.clearRect(0,0,this.sizeW,this.sizeW);

            ctx.beginPath();
            var org = this.org;
            ctx.arc(org, org, org * (1 - this.lineWidth[1] / 2)-org*0.1-org*(this.lineWidth[1]-this.lineWidth[0])/2, 0, Math.PI*2);
           
            ctx.lineWidth = org * this.lineWidth[0];
            ctx.strokeStyle = this.colorArr[0];
            ctx.stroke();

        },
        //画进度圆
        drawCircle: function (ctx,cPer) {

            this.cHudu=pToR(cPer);
            ctx.beginPath();
            var org = this.org;
            ctx.arc(org, org, org * (1 - this.lineWidth[1] / 2)-org*0.1, this.sHudu-(Math.PI/2), this.cHudu-(Math.PI/2));
            ctx.lineWidth = org * this.lineWidth[1];
            // ctx.lineCap = 'round';
            ctx.lineCap = 'butt';
            ctx.strokeStyle = this.colorArr[1];
            ctx.stroke();

            ctx.beginPath();
            var org = this.org;
            ctx.arc(org, org, org * (1 - this.lineWidth[2] / 2), this.sHudu-(Math.PI/2), this.cHudu-(Math.PI/2));
            ctx.lineWidth = org * this.lineWidth[2];
            ctx.strokeStyle = this.colorArr[2];
            ctx.stroke();
        },
        animate:function (start, target,callback) {
            target=target*10;
            //清理定时器
            clearInterval(this.timer);
            var current=start;
            var that=this;
            var t=0; //已经运动时间，需要++
            var d=80; //总步数
            this.timer = setInterval(function () {
                t++;
                if (t >= d) {
                    //清理定时器
                    clearInterval(that.timer);
                }
                var current=TWEEN.easeInOutCubic(t,start,target,d);
                callback(current/10);
            }, 20);
        }
    }


})(jQuery)