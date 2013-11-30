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
});
Template.default.MainCatArr=function(){
	return FrameDetail.find({});
}
Template.default.events={
	'click a':function(e,t){
		e.preventDefault();
		App.router.aReplace(e);
	}
}