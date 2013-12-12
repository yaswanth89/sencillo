$(window).load(function(){
	window.productHeight = $(this).height() - 94;
	content = $("#content").height(window.productHeight);
	$(window).resize(function(event) {
	  window.productHeight = $(this).height() - 94;
	  content.height(window.productHeight);
	});	
});