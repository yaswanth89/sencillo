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
	},
	'click #loginWithFB': function(){
		Meteor.loginWithFacebook({ requestPermissions: ['email','user_likes']},
		function (error) {
		    if (error) {
		        return console.log(error);
		    }else{
		    	Meteor.call('getAccessToken',function(err, result){
		    		console.log(result);
		    	});
		    	App.router.navigate('', {trigger:true});
		    }
		});
	},
	"click #loginWithGoogle": function(){
		Meteor.loginWithGoogle({ requestPermissions: ['https://maps.google.com/maps/feeds/','https://www.google.com/m8/feeds/'] }, function(error){
			if(error){
				return console.log(error);
			}else{
				Meteor.call('getAccessToken',function(err,result){
					console.log(result);
					/*var url = "https://maps.google.com/maps/feeds/maps/default/full";
				    var params = {
				      access_token: result
				    };
				    var p;
				    Meteor.http.get(url, {params: params}, function (err, result) {
				        //console.log(result.statusCode, result.data);
				        //var retdata =  result.data;
				        if(err) Session.set('res',err);
				        else Session.set('res',result);
				    });*/
				});
				App.router.navigate('', {trigger:true});
			}
		});
	}
};