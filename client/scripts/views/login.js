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
		console.log('asd');
		var button = $("#loginBtn");
		button.html('Loging in');
		button.prepend(' <i class="fa fa-refresh fa-spin"></i> ');
		var allInputs = $(':input').serializeArray();
		Meteor.loginWithPassword(allInputs[0].value,allInputs[1].value,
			function(Err){
				try{
					if(Meteor.user().usertype == "shop")
						App.router.navigate('shopAdd',{trigger:true});
					else
						App.router.navigate('/',{trigger:true});
					$("#loginRegisterChoice input").val('');
					button.html("login");
					$('#LoginModal').modal('hide');
				}
				catch(e){
					alert('Wrong Username or password!');
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