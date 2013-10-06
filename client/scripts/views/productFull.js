Template.ProductFull = Backbone.View.extend({
	template:null,
	tagName:"div",
	id:"product-full",
	initialize:function(){
		return this.template = Meteor.render(function(){
			return Template.ProductFull();
		});
	},
	render:function(){
		this.$el.html(this.template);
		return this;
	}
});

Template.ProductFull.details = function(){
	var product = Products.findOne({'_id': Session.get('currentProduct')});
	return product;
};