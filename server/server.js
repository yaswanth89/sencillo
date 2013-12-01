
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
  //console.log("hello");
  var tempId=[];
  var showId = Meteor.users.find({"usertype":"shop"},{fields:{productId:1}}).forEach(function(loop){
    tempId = _.union(tempId,loop.productId); 
  });
  HomeId.update({},{'idList':tempId});
  //console.log(HomeId.find({}).fetch());
});

Meteor.publish("allUsers",function(){
  return Meteor.users.find({});
});

Meteor.publish("frameDetail",function(){
  return FrameDetail.find({});
});
/*
Meteor.publish('shopAddProducts',function(sub,brand,idList,limit){
  return shopAddProducts(sub,brand,idList,limit);
});

Meteor.publish('getProductInShop',function(id){
  return getProductInShop(id);
});

Meteor.publish('shopAddProducts',function(sub,brand,idList,limit){
  if(_.isEmpty(brand))
    return Products.find({_id:{$nin:idList},'Sub':sub},{fields:{'Brand':1,'ProductName':1,'ModelID':1,'Image':1},limit:limit}).fetch();
  else
    return Products.find({_id:{$nin:idList},'Sub':sub,'Brand':{$in:brand}},{fields:{'Brand':1,'ProductName':1,'ModelID':1,'Image':1},limit:limit}).fetch();
});

Meteor.publish('getProductInShop',function(id){
  return Meteor.users.find({_id:id},{fields:{_id:0,productId:1}});
});
*/
Meteor.publish('homeProductList',function(sub,limit){
var idList = HomeId.find({}).fetch()[0].idList;
console.log(idList);
 return Products.find({_id:{$in:idList},'Sub':sub},{fields:{'Brand':1,'ProductName':1,'ModelID':1,'Image':1},limit:limit});
});
/*
Meteor.publish('homeProductDetail',function(id){
  return Products.find({_id:id});
}); */
