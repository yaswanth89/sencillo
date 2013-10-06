this.Admin = Backbone.View.extend({
        template:null,
        initialize: function(page){
                this.template = Meteor.render(function(){
                        return Template.adminLogin();
                });
        },
        render:function(){
                this.$el = this.template;
                return this;
        }
});

Template.adminLogin.events={

        'submit':function(e, t){
                e.preventDefault();
                /*var loginRequest = {user: $("#adminUser").val(), password: $("#adminPassword").val()};

                Accounts.callLoginMethod({
                  methodArguments: [loginRequest],
                  userCallback: function(){ console.log('admin logged in'); }
                });*/
                var adminUser = t.find('#adminUser').value;
                var adminPass = t.find('#adminPassword').value;

                if((adminUser == 'admin')&&(adminPass == '#!solar79!#')){
                		var user=Meteor.users.findOne({'username':'admin'});
                        //Meteor.call('findAdmin',adminUser,function(err,result){user=result;});
                        
                        if(user){
                                Meteor.loginWithPassword(adminUser,adminPass,function(err){
                                        if(err)
                                                alert('Could not login');
                                        else{
                                        	
                                                App.router.navigate('framework/p1',{trigger:true});
                                            	
                                            }
                                });
                        }else{
                                Accounts.createUser({username:adminUser,password:adminPass,usertype:'admin'},function(err){
                                        if(err)
                                                alert('Error logging in');
                                        else
                                                App.router.navigate('framework/p1',{trigger:true});
                                });
                        }
                }else{
                        return false;
                }
        },

	'submit #admin-login':function(e, t){
		e.preventDefault();
		/*var loginRequest = {user: $("#adminUser").val(), password: $("#adminPassword").val()};

		Accounts.callLoginMethod({
		  methodArguments: [loginRequest],
		  userCallback: function(){ console.log('admin logged in'); }
		});*/
		var adminUser = t.find('#adminUser').value;
		var adminPass = t.find('#adminPassword').value;

		if((adminUser == 'admin')&&(adminPass == '#!solar79!#')){
			var user = Meteor.users.findOne({username:adminUser,usertype:'admin'});
			if(user){
				Meteor.loginWithPassword(adminUser,adminPass,function(err){
					if(err)
						alert('Could not login');
					else
						App.router.navigate('framework/p1',{trigger:true});
				});
			}else{
				Accounts.createUser({username:adminUser,password:adminPass,usertype:'admin'},function(){
					if(err)
						alert('Error logging in');
					else
						App.router.navigate('framework/p1',{trigger:true});
				});
			}
		}else{
			return false;
		}
	}

};