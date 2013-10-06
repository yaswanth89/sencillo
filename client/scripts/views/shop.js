this.Shop = Backbone.View.extend({
	template:null,
	initialize:function(){
		return this.template = Meteor.render(function(){
			return Template.shop();
		});
	},
	render:function(){
		this.$el = this.template;
		return this;
	}
});
this.ShopForm = Backbone.View.extend({
	template:null,
	initialize:function(page){
		return this.template = Meteor.render(function(){
			switch(page){
				case 1:
					return Template.shop1();
					break;
				case 2:
					return Template.shop2();
					break;
				case 3:
					return Template.shop3();
					break;
				default:
					return Template.shop1();
			}
		});
	},
	render:function(){
		this.$el = this.template;
		return this;
	}
});