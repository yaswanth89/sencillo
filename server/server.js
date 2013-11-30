
Accounts.onCreateUser(function(options, user) {
	if(options.shopname != undefined)
  		user.shopname = options.shopname;
  	if(options.brandname != undefined)
  		user.brandname = options.brandname;
  	if(options.address != undefined)
  		user.address = options.address;
    if(options.shopLatitude != undefined)
      user.shopLatitude = options.shopLatitude;
    if(options.shopLongitude != undefined)
      user.shopLongitude = options.shopLongitude;
  	user.contactname = options.contactname;
  	user.contactnum = options.contactnum;
  	user.usertype = options.usertype;
  	if (options.profile)
    	user.profile = options.profile;
  	return user;
});

Meteor.startup(function(){
  console.log("hello");
  var tempId=[];
  var showId = Meteor.users.find({"usertype":"shop"},{fields:{productId:1}}).forEach(function(loop){
    tempId = _.union(tempId,loop.productId); 
  });
  HomeId.update({},{'idList':tempId});
  console.log(HomeId.find({}).fetch());
});

Meteor.publish("allUsers",function(){
  return Meteor.users.find({});
});

Meteor.publish('shopAddProducts',function(sub,brand,idList,limit){
  return shopAddProducts(sub,brand,idList,limit);
});

Meteor.publish('getProductInShop',function(id){
  return getProductInShop(id);
});

Meteor.publish('homeProductList',function(idList,sub,brand,limit){
  return homeProductList(idList,sub,brand,limit);
});
Meteor.publish('homeProductDetail',function(id){
  return homeProductDetail(id);
});
Meteor.publish('homeIdList',function(){
  return HomeId.find({});
});