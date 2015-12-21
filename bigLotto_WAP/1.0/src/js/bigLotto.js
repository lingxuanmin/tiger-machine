//拉霸
var bigLotto = bigLotto || {};

//设置手势指引3秒后消失
bigLotto.gesture = function() {
	setTimeout(function() {
		$('.game-gaid').animate({
			'opacity': '0'
		}, 200, function() {
			$(this).css('display', 'none');
		});
	}, 3000);
}

//星星旋转
bigLotto.star = function() {
	var angle = 0;
	setInterval(function() {
		angle += 6;
		$('.star').rotate(angle);
	}, 50);
}

//按钮状态
bigLotto.btnStyle = function() {
	$('.subtract').on({
		touchstart: function(event) {
			$(this).addClass('subtract-on');
			event.preventDefault();
		},
		touchend: function(event) {
			$(this).removeClass('subtract-on');
			event.preventDefault();
		}
	});

	$('.add').on({
		touchstart: function(event) {
			$(this).addClass('add-on');
			event.preventDefault();
		},
		touchend: function(event) {
			$(this).removeClass('add-on');
			event.preventDefault();
		}
	});

	$('.game-btn').on({
		touchstart: function(event) {
			$(this).addClass('game-btn-on');
			event.preventDefault();
		},
		touchend: function(event) {
			$(this).removeClass('game-btn-on');
			event.preventDefault();
		}
	});
}

//幸运榜中奖名单滚动
bigLotto.listScroll = function() {
	var itemStep = '1.33333';
	var itemLength = $('.winner li').length;

	$('.winner li').each(function(index, element) {
		var _this = $(this);
		_this.css('top', index * itemStep + 'rem');
	});

	if (itemLength > 2) {  //当幸运榜条数大于2条时滚动
		setInterval(function() {
			$('.winner li').each(function(index, element) {
				var _this = $(this);
				_this.animate({
					'top': itemStep * (index - 1) + 'rem'
				}, function() {
					if (parseInt(_this.css('top')) < 0) {
						var cloneItem = _this.clone().css('top', itemStep * (itemLength - 1) + 'rem');
						cloneItem.appendTo($('.winner'));
						_this.remove();
					};
				});
			});
		}, 3000);
	};	
}

//拉霸老虎机
var isBegin = false;
bigLotto.game = {
	init: function(options) {
		var defaults = {
			cardHeight: '5.09333', //卡片高(REM单位)
			cardLength: 2, //卡片数量
			baseNumber: 50, //赌注基数
			numberStep: 50, //赌注加减步幅
			maxNum: 500, //最大可以设置赌注
			minNum: 50 //最小可以设置赌注
		};
		this.opts = $.extend({}, defaults, options);
		this.betNum();
	},
	//赌注数目操作
	betNum: function() {
		var curNum, nextNum, nextbtn, prebtn;
		var maxNum = this.opts.maxNum;
		var minNum = this.opts.minNum;
		var baseNumber = this.opts.baseNumber;
		var numberStep = this.opts.numberStep;

		nextbtn = $('.add');
		prebtn = $('.subtract');
		$('.bet-num').html(baseNumber);
		curNum = parseInt($('.bet-num').html());
		disStyle(curNum);

		nextbtn.click(function() {
			nextNum = curNum + numberStep;
			if (nextNum >= maxNum) {
				nextNum = maxNum;
			};
			disStyle(nextNum);
			$('.bet-num').html(nextNum);
			baseNumber = curNum = nextNum;
		});
		prebtn.click(function() {
			nextNum = curNum - numberStep;
			if (nextNum <= minNum) {
				nextNum = minNum;
			};
			disStyle(nextNum);
			$('.bet-num').html(nextNum);
			baseNumber = curNum = nextNum;
		});

		//给云钻操作按钮添加disable样式
		function disStyle(num) {
			var curNum = num;
			(curNum == minNum) ? $('.subtract').addClass('subtract-dis'): $('.subtract').removeClass('subtract-dis');
			(curNum == maxNum) ? $('.add').addClass('add-dis'): $('.add').removeClass('add-dis');
		}
	},
	//开始游戏
	play: function(urlString, render) {		
		if (isBegin) {
			console.log("调皮，不给点击啊，现在");
		} else{
			var resultNum,
				baseNumber = this.opts.baseNumber,
				cardHeight = this.opts.cardHeight,
				cardLength = this.opts.cardLength;
			$.ajax({
				type: 'get',
				url: urlString(),
				dataType: 'json',
				success: function(data) {
					$.each(data, function(index, element) {
						var resultNum = element['result'];
						var msgJson = element['msg'];
						if (resultNum == '444') {
							console.log('444不滚动弹出错误提示；');
							if (render) {
								render.call($(this), 'failure', msgJson);
							}
						} else {
							scrollAction(resultNum, msgJson);
						};
					});
				},
				error: function() {
					console.log('AJAX请求数据失败');
				}
			});
		};		

		//滚动动画
		function scrollAction(resultNum, msgJson) {
			console.log('当前赌注：' + baseNumber);
			if (isBegin) return false;
			isBegin = true;
			$('.card').css('backgroundPositionY', '0rem');
			var result = resultNum,
				msgJson = msgJson;
			var num_arr = (result + '').split('');
			$('.card').each(function(index) {
				var _num = $(this);
				setTimeout(function() {
					_num.animate({
						backgroundPositionY: (cardHeight * 12) - (cardHeight * num_arr[index]) + 'rem'
					}, {
						duration: 3000 + index * 3000,
						easing: 'easeInOutCirc',
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
	},
}


//后期弹框蒙层
bigLotto.maskOpt = function(){
	//浮层出现  底层不能滚蛋
	var isShow = $(".mask-zone").is(":visible");
	if(isShow){
		var h = $(".bl-wrap").offset().top + "px",
			w = $(".bl-wrap").offset().left + "px";

		$(".bl-wrap").css({"position":"fixed","left":w,"top":h});
	
	}else{
		$(".bl-wrap").removeAttr("style");
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
			$(".bl-wrap").removeAttr("style");
		}
	},1000);

}

$(function() {
	bigLotto.gesture();
	bigLotto.star();
	bigLotto.btnStyle();
	bigLotto.listScroll();
	bigLotto.maskOpt();
	
});