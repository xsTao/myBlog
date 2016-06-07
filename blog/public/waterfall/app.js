$(document).ready(function(){
	$(window).on("load",function(){
		imgLocation();
		var dataImg = {
			"data":[
				{"src":"1.gif"},
				{"src":"2.jpg"},
				{"src":"2.jpg"},
				{"src":"3.gif"},
				{"src":"4.jpg"},
				{"src":"5.jpg"},
				{"src":"6.gif"},
				{"src":"7.jpg"},
				{"src":"8.jpg"},
				{"src":"9.bmp"}
			]
		};
		$(".back-top").hide();
		//滚动条滚动300px则显示返回顶部按钮,滚动到底下则加载图片
		$(window).scroll(function(){
			if(scrollSide()){
				$.each(dataImg.data,function(index,value){
					var box = $("<div>").addClass("box").appendTo('#container');
					var content = $("<div>").addClass('content').appendTo(box);
					$("<img>").attr("src","/waterfall/img/"+$(value).attr("src")).appendTo(content);
				})
			}
			imgLocation();
			//
			if ($(this).scrollTop() > 300) {
				$(".back-top").fadeIn("slow");
			}else{
				$(".back-top").fadeOut("slow");
			}
		});
		//点击返回顶部按钮，页面回到顶部
		$(".back-top").on("click",function(){
			$("body,html").animate({scrollTop:0},1200);
			return false;
		})
	});

})

//图片位置排放方法
function imgLocation(){
	var box = $(".box");
	var boxWidth = box.eq(0).width();
	var num = Math.floor($("#container").width()/boxWidth);
	var boxArr = [];
	box.each(function(index, val) {
		var boxHeight = box.eq(index).height();
		if(index < num){
			boxArr[index] = boxHeight;
		}else{
			var minboxHeight = Math.min.apply(null,boxArr);
			var minboxIndex = $.inArray(minboxHeight,boxArr);
			$(val).css({
				"position":"absolute",
				"top": minboxHeight,
				"left":box.eq(minboxIndex).position().left
			});
			boxArr[minboxIndex] +=box.eq(index).height();	
			 
		}
	});
}

function scrollSide(){
	var box = $(".box");
	var lastboxHeight = box.last().get(0).offsetTop+Math.floor(box.last().height()/2);
	var documentHeight = $(window).height();
	var scrollHeight = $(window).scrollTop();
	return (lastboxHeight < scrollHeight + documentHeight)? true:false;
}