// 拉霸
var diamSlot = diamSlot || {};

//手势
diamSlot.gesture = function(){
	var guide = $(".guide-wrap"),
	    gesture = $(".guide-wrap .gesture");

	var oLeft = gesture.css("left"),
		oTop = gesture.css("top");

	function gLeft(){
		gesture.stop().animate({left:'+=20',top:'+=16'},120,"linear",function(){
			gesture.stop().animate({left:oLeft,top:oTop},120);
		});
	};

	var t = setInterval(gLeft,600);
	var timeout = setTimeout(function(){
		clearInterval(t);
		guide.stop().animate({'opacity': '0'}, 100);
		guide.hide();
	},2000);


};

//操作效果
diamSlot.diamOpt = function(){
	var diamLess = $(".opt-diam .diam-less"),
		diamMore = $(".opt-diam .diam-more"),
		gameBtn = $(".game-start");

	//鼠标按下效果
	diamLess.mousedown(function(){
		$(this).addClass("less-click");
	}).mouseup(function(){
		$(this).removeClass("less-click");
	});
	diamMore.mousedown(function(){
		$(this).addClass("more-click");
	}).mouseup(function(){
		$(this).removeClass("more-click");
	});
	gameBtn.mousedown(function(){
		$(this).addClass("game-btn-click");
	}).mouseup(function(){
		$(this).removeClass("game-btn-click");
	});
};
//幸运榜滚动
diamSlot.luckyListloop = function(){
	
	var listWrap = $(".list-wrap"),
		listUl = listWrap.find("ul"),
		listLi = listUl.find("li"),
		listLength = listUl.find("li").size();
	    itemStep = '71';
        itemLength = listLi.length;

	//变成定位
	listLi.each(function(index, element) {
		var _this = $(this);
		_this.css('top', index*itemStep+'px');
	});

	//幸运榜中奖名单滚动
	if(listLength <= 6){
		return;
	}

	setInterval(function() {
		var listLi = listUl.find("li");
		listLi.each(function(index, element) {
			var _this = $(this);
			_this.stop().animate({'top': itemStep*(index-1)+'px'}, function() {

				if (parseInt(_this.css('top')) < 0) {
					var cloneItem = _this.clone().css('top', itemStep*(itemLength-1)+'px');
					cloneItem.appendTo(listUl);
					_this.remove();
				};
			});
		});
	}, 3000);


};

//动画
var isBegin = false;
diamSlot.game = {
	init:function(options){
		var defaults = {
			cardHeight: '128',//卡片高(REM单位)
			cardLength: 2,//卡片数量
			baseNumber: 50,//赌注基数
			numberStep: 50,//赌注加减步幅
			maxNum: 500,//最大可以设置赌注
			minNum: 50//最小可以设置赌注
		};
		this.opts = $.extend({}, defaults, options);
		this._betNum();
	},
	_betNum:function() {
		var maxNum=this.opts.maxNum;
		var minNum=this.opts.minNum;
		var baseNumber=this.opts.baseNumber;
		var numberStep=this.opts.numberStep;

		var curNum, nextNum, nextbtn, prebtn;
		nextbtn = $('.diam-more');
		prebtn = $('.diam-less');
		$('.diam-num').val(baseNumber);
		curNum = parseInt($('.diam-num').val());

		//当前是最小或最大值，按钮直接置灰
		if(curNum <= minNum){
			prebtn.addClass("less-disabled");
		}
		if(curNum >= maxNum){
			nextbtn.addClass("more-disabled");
		}
		
		nextbtn.click(function() {
			nextNum = curNum + numberStep;
			if (nextNum >= maxNum) {
				nextNum = maxNum;
				$(this).addClass("more-disabled");
			}else{
				if(nextNum >= minNum){
					prebtn.removeClass("less-disabled");
				}
				$(this).removeClass("more-disabled");
			}
			$('.diam-num').val(nextNum)
			baseNumber = curNum = nextNum;
		});
		prebtn.click(function() {
			nextNum = curNum - numberStep;
			if (nextNum <= minNum) {
				nextNum = minNum;
				$(this).addClass("less-disabled");
			}else{
				if(nextNum <= maxNum){
					nextbtn.removeClass("more-disabled");	
				}
				$(this).removeClass("less-disabled");
			}
			$('.diam-num').val(nextNum)
			baseNumber = curNum = nextNum;
		});
	},
	play:function(urlfun,render){
		var resultNum,cardHeight=this.opts.cardHeight,cardLength=this.opts.cardLength;
		$.ajax({
			type: 'get',
			url: urlfun(),
			dataType: 'json',
			success: function(data) { 
				$.each(data,function(index, element){
					var resultNum = element['result'];
					var msgJson = element['msg'];
					if (resultNum == '000') {
						// console.log('000不滚动弹出错误提示；');
						if (render) {
	                        render.call(this, 'failure', msgJson);
	                    }
					} else{
						scrollAction(resultNum, msgJson);
					};						
				}); 
			},
			error: function() {
				// console.log('AJAX请求数据失败');
			}
		});		

		//滚动动画
		function scrollAction(resultNum,msgJson) {
			// console.log('当前赌注：'+baseNumber);
			if (isBegin) return false;
			isBegin = true;
			var result = resultNum,
				msgJson = msgJson;
			$('.slot').css('backgroundPosition','0 0');
			var result = resultNum;
			var num_arr = (result + '').split('');
			$('.slot').each(function(index) {
				var _num = $(this);
				setTimeout(function() {
					_num.animate({
						backgroundPosition: "0px" + " " +((cardHeight * 60) - (cardHeight * num_arr[index]))+"px",
						duration: 6000 + index * 3000
					}, {
						easing: "easeInOutCirc",
						complete: function() {
							if (index == cardLength) {
								isBegin = false;
								console.log('动画执行完成，弹出弹框');
								if (render) {
			                        render.call($(this), 'failure', msgJson);
			                    }
			                }
						}
					});
				}, index * 0);
			});
		}

	}
}

//后期弹框蒙层
diamSlot.maskOpt = function(){
	//浮层出现  底层不能滚蛋
	var isShow = $(".mask-zone").is(":visible");
	if(isShow){
		var h = $(".second-wrapper").offset().top + "px",
			w = $(".second-wrapper").offset().left + "px";

		$(".second-wrapper").css({"position":"fixed","left":w,"top":h});
	
	}else{
		$(".vip-wrapper").removeAttr("style");
	}

	//倒计时
	var totalSecond = 8,
		time;
	time = setInterval(function(){
		$(".mask-btn i").text(totalSecond--);
		if(totalSecond == -2){
			//隐藏蒙层
			$(".mask-zone").hide();
			clearInterval(time);
			$(".second-wrapper").removeAttr("style");
		}
	},1000);

}



$(function(){
	//判断IE6
	if(navigator.userAgent.indexOf("MSIE 6.0") > 0){
		$("html,body").animate({ scrollTop: 316 }, 1000);
	}else{
		$("html,body").animate({ scrollTop: 276 }, 1000);
	}
	
	diamSlot.gesture();
	diamSlot.diamOpt();
	//幸运榜滚动
	diamSlot.luckyListloop();
	diamSlot.maskOpt();
});