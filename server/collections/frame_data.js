//var FrameData;

FrameData = new Meteor.Collection("framedata");
//ProductData = new Meteor.Collection("productdata");
Products = new Meteor.Collection('Products');

/*Meteor.publish("framedata",function(){
	return FrameData.find();
});

FrameData.deny({
	remove:function(userId,doc){
		return false;
	}
});
FrameData.allow({
	update:function(){
		return true;
	},
	insert:function(){
		return true;
	}
});
*/
Meteor.startup(function(){
	//FrameData.remove({});
	//console.log("whatever");
});

