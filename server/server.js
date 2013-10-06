Accounts.onCreateUser(function(options, user) {
	if(options.shopname != undefined)
  		user.shopname = options.shopname;
  	if(options.brandname != undefined)
  		user.brandname = options.brandname;
  	if(options.address != undefined)
  		user.address = options.address;
  	user.contactname = options.contactname;
  	user.contactnum = options.contactnum;
  	user.usertype = options.usertype;
  	if (options.profile)
    	user.profile = options.profile;
  	return user;
});