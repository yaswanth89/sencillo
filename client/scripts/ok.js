this.App = {};

FrameData = new Meteor.Collection("framedata");
FrameDetail = new Meteor.Collection("framedetail");
HomeId = new Meteor.Collection("HomeId");
Products = new Meteor.Collection('Products');
Brands = new Meteor.Collection("Brands");
Prices = new Meteor.Collection("Prices");
pricerange = new Meteor.Collection('price_range');
Meteor.startup(function(){
	return $(function(){
		App.router = new Router();
		return Backbone.history.start({
			pushState:true
		});
	});
});
Meteor.subscribe('allUsers');
Meteor.subscribe('userData');