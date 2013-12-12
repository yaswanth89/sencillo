this.Retailers = Backbone.View.extend({
	template:null,
	render:function(){
		this.$el = this.template;
		return this;
	},
	initialize:function(){
		return this.template = Meteor.render(function(){
			return Template.retailers({});
		});
	}
});