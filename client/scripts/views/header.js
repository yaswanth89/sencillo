this.HeaderView = Backbone.View.extend({
	template:null,
	tagName:"div",
	id:"header",
	initialize:function(){
		Template.header.events = {
			"click a":function(e){
				e.preventDefault();
				if(e.target.id=='logout')
					Meteor.logout(function(err){
						if(!err)
							return App.router.navigate('login',{trigger:true});
						else
							alert('error')
					});
				else if(e.target.id=="dashboard"){
				}
				else
					App.router.aReplace(e);
			},
			'submit #searchForm':function(e){
				e.preventDefault();
				var query = encodeURIComponent($("#searchInput").val().trim());
				if(query!="")
					App.router.navigate('search/'+query,{trigger:true});
			},
			'click a.bt-menu-trigger':function(e){
				e.preventDefault();
				if(menu.hasClass('bt-menu-open')){
					resetMenu(menu);
				}
				else{
					openMenu(menu);
				}
			},
			'click div.bt-overlay':function(e){
				e.preventDefault();
				resetMenu(menu);
			}
		};

		return this.template = Meteor.render(function(){
			return Template.header({});
		});
	},
	render:function(){
		this.$el.html(this.template);
		return this;
	}
});

Template.header.MainCatArr=function(){
	return FrameDetail.find({});
};