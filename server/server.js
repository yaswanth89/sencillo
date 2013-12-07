
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
  return Meteor.users.find({"usertype": "shop"},{fields:{"username":1,"productId":1,"shopname":1,"shopLatitude":1,"shopLongitude":1,"usertype":1}});
});

Meteor.publish("frameDetail",function(){
  return FrameDetail.find({});
});

Meteor.publish("shopProductList",function(username,sub,limit){
  try{
    idList = Meteor.users.findOne({username:username}).productId;
  }
  catch(e){
    return null;
  }
  return Products.find({_id:{$in:idList},Sub:sub},{fields:{'Sub':1,'Brand':1,'ProductName':1,'ModelID':1,'Image':1,'searchIndex':1},limit:limit});
});

Meteor.publish('shopAddProducts',function(sub,brand,limit){
  try{
    var idList = Meteor.users.find({_id:this.userId}).fetch()[0].productId;
  }
  catch(e){
    return null;
  }
  if(_.isEmpty(brand))
    return Products.find({_id:{$nin:idList},'Sub':sub},{fields:{'Sub':1,'Brand':1,'ProductName':1,'ModelID':1,'Image':1,'searchIndex':1},limit:limit});
  else
    return Products.find({_id:{$nin:idList},'Sub':sub,'Brand':{$in:brand}},{fields:{'Sub':1,'Brand':1,'ProductName':1,'ModelID':1,'Image':1,'searchIndex':1},limit:limit});
});

Meteor.publish('searchProducts',function(query,limit){
  var re = new RegExp("\\b("+query+")\\b",'i');
  return Products.find({"searchIndex": {$regex: re}},{fields:{'Sub':1,'Brand':1,'ProductName':1,'ModelID':1,'Image':1,'searchIndex':1},limit:limit});
})

Meteor.publish('homeId',function(){
  return HomeId.find({});
});

Meteor.publish('homeProductList',function(sub,limit){
  var idList = HomeId.find({}).fetch()[0].idList;
  return Products.find({_id:{$in:idList},'Sub':sub},{fields:{'Sub':1,'Brand':1,'ProductName':1,'ModelID':1,'Image':1,'searchIndex':1},limit:limit});
});

Meteor.publish('homeProductDetail',function(id){
  return Products.find({_id:id}, {fields:{'Sub':0,'Brand':0,'ProductName':0,'ModelID':0,"Image":0,'searchIndex':0}});
});

Meteor.publish("shopDetail",function(name){
  return Meteor.users.find({"username": name,"usertype":"shop"},{fields:{"address":1,"contactnum":1}});
});
