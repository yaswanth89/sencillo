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
		console.log(Meteor.user());
	}
}
Template.connectFb.events = {
	"click #connectFbButton":function(e,t){
		FB.login(function(response) {
			console.log(response);
   			if (response.authResponse) {
	    		FB.ui({
	    		  method: 'pagetab',
	    		  display:'popup'
	    		}, function(response){
	    			var pageId = undefined;
	    			_.each(response.tabs_added,function(e,t){
	    				if(!pageId)
	    					pageId = t;
	    			});
	    			console.log(pageId);
	    			FB.api('/me/accounts', function(response) {
			    		$("#connectFbLogin").hide();
			       		_.each(response.data,function(e){
			       			if(pageId == e.id){
			       				var data = {"id":e.id,"access_token":e.access_token};
			       				var name = e.name;
			       				console.log(data);
			       				Meteor.call("connectFb",data,function(err,response){
									if(!err){
										$("#connectedPage").html("Connected to "+name);
									}
								});
			       			}
			       		});
	    			});
	    		});
   			} else {
    			console.log('User cancelled login or did not fully authorize.');
   			}
	 	},{scope: 'manage_pages,publish_actions'});
	}
}