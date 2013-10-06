this.BrandEdit = Backbone.View.extend({
	template:null,
	initialize:function(page){
		this.template = Meteor.render(function(){
			return Template.brandEdit();
		});
	},
	render:function(){
		this.$el = this.template;
		return this;
	}
});
