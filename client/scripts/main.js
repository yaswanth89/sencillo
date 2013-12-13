$(window).load(function(){
	window.productHeight = $(this).height() - 94;
	content = $("#content").height(window.productHeight);
	$(window).resize(function(event) {
	  window.productHeight = $(this).height() - 94;
	  content.height(window.productHeight);
	});	
});
function displaySucess(string){
	$("#informer").html(string).fadeIn();
	setTimeout(function(){
		$("#informer").fadeOut();
	});
}
function dispalySucess(string){
	$("#alerter").html(string).fadeIn();
	setTimeout(function(){
		$("#alerter").fadeOut();
	});
}