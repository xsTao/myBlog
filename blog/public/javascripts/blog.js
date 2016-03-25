$(function() {
	$("#regform").validate({
		rules:{
			password:'required',
			passwordconf:{
				equalTo:".password"
			}
		}
	});	

	$('.comment  .reply').on('click', function(e) {
		e.preventDefault();
		if ($(this).html() == "回复"){
			$(this).html("取消回复");
			$(this).next().show('slow');
		}else{
			$(this).html("回复");
			$(this).next().hide('slow');
		} 
			
		
	});

	var editor;
	KindEditor.ready(function(K) {
		editor1 = K.create('#kindeditor');
		editor2 = K.create('textarea', {
			allowImageUpload : false,
			items : [
		    'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'italic',
		    'underline', 'removeformat', '|', 'justifyleft', 'justifycenter', 'justifyright',
		    'insertorderedlist', 'insertunorderedlist', '|', 'emoticons', 'image', 'link']
		});
	});

	$('.comments  .btn-comment').on('click', function(e) {
		var $that = $(this);
		var name = $that.parent().find("#name")[0].value;	
		var content = $that.prev().find(".ke-edit-iframe").contents().find('.ke-content').html();
		console.log($that.prev().find(".ke-edit-iframe").contents().find('.ke-content'))	
		if(content == ""|| content =="<br>" || name ==""){
			alert('姓名和回复内容都不能为空！');
			e.preventDefault();
		}else{			
			$('.comment .add-reply').css('display', 'none');
		}


	});
	
	$('.btn-post').on('click', function(e) {
                var $that = $(this);
                var contents = $that.prev().find(".ke-edit-iframe").contents().find('.ke-content').html();                        if(contents == ""|| contents =="<br>"){
                        alert('内容不能为空！');
                        e.preventDefault();
              	}


        });

	var timer = null;
	$('.search-title').hover(function() {
		var that = this;
		 timer=setTimeout(function(){$(that).next().show(500)},700);
	}, function() {
		/* Stuff to do when the mouse leaves the element */
		if(timer)  clearTimeout(timer);
		$(this).next().hide(500);
	});

	function messageAjax() {
		//创建一个ajax对象
		//var xhr = window.XMLHttpRequest?new XMLHttpRequest():new ActiveXObject("Microsoft.XMLHTTP");
		//直接用jquery的ajax()方法

		$.ajax({
			type: 'get',
			url: '/message',
			dataType: 'json',
			success: function(data) {
				if (data) {
					var count = data.comments.length;
					$('.nav .badge').html(count);
					$('.nav .message .badge').html(count);
				}
			},
			error: function(err) {
				if (err) {
					//console.log(err);
				}
			}

		});
	};
	setInterval(messageAjax, 1000 * 60); //1分钟查询一次是否有新消息

	$('.comments .show-reason').on('click',function(e){
		e.preventDefault();
		$('.comments .hide-reason').toggle('slow');
	})
});
