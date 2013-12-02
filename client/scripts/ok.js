this.App = {};
ShopAddProducts = new Meteor.Collection("shopAddProducts");
FrameData = new Meteor.Collection("framedata");
FrameDetail = new Meteor.Collection("framedetail");
HomeId = new Meteor.Collection("HomeId");
Products = new Meteor.Collection('Products');
Meteor.startup(function(){
	return $(function(){
		App.router = new Router();
		return Backbone.history.start({
			pushState:true
		});
	});
});
Meteor.subscribe('allUsers');