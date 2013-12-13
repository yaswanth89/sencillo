this.Default = Backbone.View.extend({
	template:null,
	render:function(){
		this.$el = this.template;
		return this;
	},
	initialize:function(){
		return this.template = Meteor.render(function(){
			return Template.default({});
		});
	}
});
Deps.autorun(function(){
	Meteor.subscribe("frameDetail");
	window.subscribed = Meteor.subscribe("featuredProducts");
});
Template.featuredProducts.shops=function(){
	var blah=[];
	var id = '';
	var shopName='';
	Meteor.users.find({username:"achal"},{_id:1}).forEach(function(e){
		id = e._id;
		shopName=e.shopname;
	});
	x = Prices.find({shopId:id,"Featured":1},{limit:5}).forEach(function(e){
		product = Products.find({_id:e.productId},{fields:{"ProductName":1,"ModelID":1,"Image":1}}).fetch();
		if(product[0]){
			product[0].price = e.price;
			blah.push(product[0]);
		}
	});
	console.log(blah);
	return [{"link":"/cv/achal","shopName":shopName,"Product":blah}];
};
Template.featuredProducts.events={
	"click .featuredProducts a":function(e,t){
		e.preventDefault();
		App.router.aReplace(e);
	}
}