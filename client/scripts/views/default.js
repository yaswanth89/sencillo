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
	Meteor.subscribe("featuredProducts");
});
/*Template.featuredProducts.shops=function(){
	Meteor.user.find
}*/