$(document).ready(function(){
    $('body').addClass('interactive')
	$(".menu .content").append('<span class="close">X</span>');
	$(".menu li").on("click",function(){
		showContent($(this));
	});
	$(".menu .close").on("click",function(e){
		e.stopPropagation();
		hideContent();
	});
	function showContent(e){
		hideContent();
		console.log(e);
		e.find('.content').addClass('expanded');
		e.addClass('cover');

	}
	function hideContent(){
		$(".menu .content").removeClass('expanded');
		$(".menu li").removeClass('cover');
	}
});