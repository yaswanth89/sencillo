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
	homeContainer = $("#homeContainer").height($(this).height() - 145);
	$(window).resize(function(event) {
		homeContainer.height($(this).height() - 145)
	});
});