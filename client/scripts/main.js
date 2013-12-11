// this.App = {};
// FrameData = new Meteor.Collection("framedata");
// FrameDetail = new Meteor.Collection("framedetail");
// Products = new Meteor.Collection('Products');
// Meteor.startup(function(){
// 	return $(function(){
// 		App.router = new Router();
// 		return Backbone.history.start({
// 			pushState:true
// 		});
// 	});
// });
// Meteor.subscribe('allUsers');
$(window).load(function(){
	window.productHeight = $(this).height() - 94;
	content = $("#content").height(window.productHeight);
	$(window).resize(function(event) {
	  window.productHeight = $(this).height() - 94;
	  content.height(window.productHeight);
	});	
})
