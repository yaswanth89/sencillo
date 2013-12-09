
Accounts.onCreateUser(function(options, user) {
  if(user.services.facebook != undefined){
    //console.log('facebook accesstoken is '+user.services.facebook.accessToken);
    //console.log(user);
    //console.log(options);
    return user;
  }else{
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
  }
});

Meteor.startup(function(){
  //console.log("hello");
  var tempId=[];
  var showId = Meteor.users.find({"usertype":"shop"},{fields:{productId:1,"username":1}}).forEach(function(loop){
    brands={};
    idList = loop.productId;
    Products.find({"_id":{$in:loop.productId}},{fields:{"Sub":1,"Brand":1}}).forEach(function(f){
      if(brands[f.Sub] == undefined)
        brands[f.Sub] = [];
      if(brands[f.Sub].indexOf(f.Brand) == -1)
        brands[f.Sub].push(f.Brand);
    });
    _.each(brands,function(key, val){
      Brands.upsert({'shopid':loop.username,'Sub':val},{$set:{"list":key}});
    });
    tempId = _.union(tempId,loop.productId); 
  });
  z = _.filter(tempId,function(e){
    y = Prices.find({productId:e,price:{$gt:0}},{fields:{"price":1}});
    // console.log(y.count());
    if(y.count()>0)
      return true;
    else
      return false;
  });
  HomeId.update({},{'idList':z});
  brands={};
  Products.find({"_id":{$in:tempId}},{fields:{"Sub":1,"Brand":1}}).forEach(function(e){
    if(brands[e.Sub] == undefined)
      brands[e.Sub] = [];
    if(brands[e.Sub].indexOf(e.Brand) == -1)
      brands[e.Sub].push(e.Brand);
  });
  _.each(brands,function(key, val){
    Brands.upsert({'view':'home','Sub':val},{$set:{"list":key}});
  });
  console.log('updated!');
  //console.log(HomeId.find({}).fetch());
  Accounts.loginServiceConfiguration.remove({
    service: "facebook"
  });
  Accounts.loginServiceConfiguration.insert({
      service: "facebook",
      appId: "235209203307648",
      secret: "f63f6828077adcbc8d2bc6dea5df89e7"
  });

  Accounts.loginServiceConfiguration.remove({
    service: "google"
  });
  Accounts.loginServiceConfiguration.insert({
      service: "google",
      clientId: "621240889350-a0a86bjqp5fbn9f2l6ea4tj280m01kib.apps.googleusercontent.com",
      secret: "azehiKgpz3hkOqG4zd6gd3lj"
  }); 
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

Meteor.publish("shopProducts",function(){
  try{
    idList = Meteor.users.findOne({_id:this.userId}).productId;
  }
  catch(e){
    return null; 
  }
  return Products.find({_id:{$in:idList}},{fields:{'Brand':1,'ProductName':1,'ModelID':1}});
});

Meteor.publish('shopAddProducts',function(sub,brand,limit){
  try{
    var idList = Meteor.users.find({_id:this.userId, 'usertype':'shop'}).fetch()[0].productId;
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
  var blah = [];
  x = Products.find({_id:{$in:idList},'Sub':sub},{fields:{'Sub':1,'Brand':1,'ProductName':1,'ModelID':1,'Image':1,'searchIndex':1},limit:limit});
  _.each(x.fetch(),function(e){
    y = Prices.find({productId:e._id,price:{$gt:0}},{fields:{"_id":1,"price":1},sort:{price:1},limit:1});
    blah.push(y.fetch()[0]._id);
  });
  return [x,Prices.find({_id:{$in:blah}},{fields:{"productId":1,"price":1}})];
});

Meteor.publish('homeProductDetail',function(id){
  return Products.find({_id:id}, {fields:{'Sub':0,'Brand':0,'ProductName':0,'ModelID':0,"Image":0,'searchIndex':0}});
});

Meteor.publish("shopDetail",function(name){
  return Meteor.users.find({"username": name,"usertype":"shop"},{fields:{"address":1,"contactnum":1}});
});

Meteor.publish("searchQuery",function(query,limit){
  try{
    var idList = HomeId.find({}).fetch()[0].idList;
    return Products.find({_id:{$in:idList},"searchIndex": {$regex: query}},{fields:{'Sub':1,'Brand':1,'ProductName':1,'ModelID':1,'Image':1,'searchIndex':1},limit:limit});
  }catch(e){
    return null;
  }
});

Meteor.publish("homeBrand",function(sub){
  return Brands.find({"view":"home","Sub":sub},{fields:{"list":1,"view":1,"Sub":1}});
});

Meteor.publish("shopBrand",function(shopname,sub){
  return Brands.find({"shopid":shopname, "Sub":sub},{fields:{"list":1, "shopid":1, "Sub":1}});
});

Meteor.publish("productPrices",function(){
  return Prices.find({"shopId":this.userId});
});

Meteor.publish("homePrices",function(id){
  return Prices.find({"productId":id,"price":{$gt:0}});
});