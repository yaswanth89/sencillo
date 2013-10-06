this.ShopDashboard = Backbone.View.extend({
	template:null,
	initialize:function(page){
		Template.shopDashboard.events = {
			"click a":function(e){
				e.preventDefault();
				return App.router.aReplace(e);
			}
		};
		this.template = Meteor.render(function(){
			return Template.shopDashboard();
		});
	},
	render:function(){
		this.$el = this.template;
		return this;
	}
});