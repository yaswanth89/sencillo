this.ConnectFb = Backbone.View.extend({
	initialize:function(page){
		window.fbAsyncInit = function() {
		    // init the FB JS SDK
		    FB.init({
				appId      : '235209203307648',                        // App ID from the app dashboard
		    });
		};
		(function(){
		    if (document.getElementById('facebook-jssdk')) {return;}
		    var firstScriptElement = document.getElementsByTagName('script')[0];
		    var facebookJS = document.createElement('script'); 
		    facebookJS.id = 'facebook-jssdk';
		    facebookJS.src = '//connect.facebook.net/en_US/all.js';
		    firstScriptElement.parentNode.insertBefore(facebookJS, firstScriptElement);
		}());
		this.template = Meteor.render(function(){
			return Template.connectFb();
		});
	},
	render:function(){
		this.$el = this.template;
		return this;
	}
});
Template.connectFb.rendered = function(){
	if(Meteor.user().shopFbPage){
		$("#connectFbLogin").hide();
		FB.api('/'+Meteor.user().shopFbPage, function(response) {
			$("#connectedPage").html("Connected to "+response.name);
		});
	}
	else{
		console.log(Meteor.user())
	}
}
Template.connectFb.events = {
	"click #connectFbButton":function(e,t){
		FB.login(function(response) {
			console.log(response);
   			if (response.authResponse) {
	    		console.log('Welcome!  Fetching your information.... ');
			    FB.api('/me/accounts', function(response) {
			    	$("#connectFbLogin").hide();
		       		_.each(response.data,function(e){
		       			$("#connectFbPagesList").append('<li><input type="radio" name="shopPage" value="'+e.id +' '+ e.access_token +'"/ >'+e.name+'</li>')
		       		});
		       		$("#connectFbPages").show();
    			});
   			} else {
    			console.log('User cancelled login or did not fully authorize.');
   			}
	 	},{scope: 'manage_pages,publish_actions'});
	},
	"submit #chooseFbPage":function(e,t){
		e.preventDefault();
		var data = $("#chooseFbPage").serializeArray();
		Meteor.call("connectFb",data,function(err,response){
			if(!err)
				console.log('connected!');
		});
	}
}