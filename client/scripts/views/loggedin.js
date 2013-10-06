this.Loggedin = Backbone.View.extend({
	template: null,
	initialize: function(){
		return this.template = Meteor.render(function(){
			return Template.loggedin();
		});
	},
	render: function(){
		this.$el = this.template;
		return this;
	}
});