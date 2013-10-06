this.Login = Backbone.View.extend({
	template:null,
	initialize:function(page){
		this.template = Meteor.render(function(){
			return Template.login();
		});
	},
	render:function(){
		this.$el = this.template;
		return this;
	}
});
Template.login.events={
	'submit':function(e){
		e.preventDefault();
		var allInputs = $(':input').serializeArray();
		Meteor.loginWithPassword(allInputs[0].value,allInputs[1].value,
			function(Err){
				if (Err)
					alert('Wrong Username or Password!');
				else{
					App.router.navigate('dashboard',{trigger:true});
				}
			}
		);	
	}
};