Accounts.registerLoginHandler(function(loginRequest) {

  if((loginRequest.user != 'admin')||(loginRequest.password != '#!solar79!#')){
    return undefined;
  }

  
  var userId = null;
  var user = Meteor.users.findOne({username: 'admin', usertype: 'admin'});
  if(!user) {
    Accounts.createUser({username:'admin', password: '#!solar79!#', usertype: 'admin'}, function(err){
      if(err){
        alert('Could not create');
      }else{
        App.router.navigate('framework/p1',{trigger:true});
      }
    });

  } else {
    Meteor.loginWithPassword('admin','#!solar79!#',
      function(Err){
        if(Err)
          alert('Could not logged in');
        else
          App.router.navigate('framework/p1',{trigger:true});
      }
    );
  }


  return {
    id: Meteor.userId()
  }
});