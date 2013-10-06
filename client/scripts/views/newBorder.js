headerValue=0;
console.log(headerValue);
Template.header.rendered = function(){
	menu = $('#bt-menu');
};
resetMenu = function(menu){
	menu.removeClass('bt-menu-open');
	menu.addClass('bt-menu-close');
};
openMenu = function(menu){
	menu.removeClass('bt-menu-close');
	menu.addClass('bt-menu-open');
};
