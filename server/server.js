
Accounts.onCreateUser(function(options, user) {
  if(user.services.facebook != undefined){
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
  //console.log('updated!');
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


function findDistance(lat1,lng1,lat2,lng2){
  var R = 6371; //Approximate Radius of Earth in km!!
  lat1 = lat1*Math.PI/180;
  lng1 = lng1*Math.PI/180;
  lat2 = lat2*Math.PI/180;
  lng2 = lng2*Math.PI/180;
  var x = (lng2-lng1) * Math.cos((lat1+lat2)/2);
  var y = (lat2-lat1);
  var d = Math.sqrt(x*x + y*y) * R;
  return Math.round(d*100) / 100;
}

Meteor.publish("allUsers",function(){
  return Meteor.users.find({"usertype": "shop"},{fields:{"username":1,"productId":1,"shopname":1,"shopLatitude":1,"shopLongitude":1,"usertype":1}});
});

Meteor.publish("frameDetail",function(){
  return FrameDetail.find({});
});

Meteor.publish("shopProductList",function(username,main,sub,limit){
  try{
    idList = Meteor.users.findOne({username:username}).productId;
  }
  catch(e){
    return null; 
  }
  if(main && sub)
    return Products.find({_id:{$in:idList},Main: main,Sub:sub},{fields:{'Main':1,'Sub':1,'Brand':1,'ProductName':1,'ModelID':1,'Image':1,'searchIndex':1},limit:limit});
  else if(main)
    return Products.find({_id:{$in:idList},Main: main},{fields:{'Main':1,'Sub':1,'Brand':1,'ProductName':1,'ModelID':1,'Image':1,'searchIndex':1},limit:limit});
  else if(sub)
    return Products.find({_id:{$in:idList},Sub:sub},{fields:{'Main':1,'Sub':1,'Brand':1,'ProductName':1,'ModelID':1,'Image':1,'searchIndex':1},limit:limit});
  else
    return Products.find({_id:{$in:idList}},{fields:{'Main':1,'Sub':1,'Brand':1,'ProductName':1,'ModelID':1,'Image':1,'searchIndex':1},limit:limit});
});

Meteor.publish("shopProducts",function(filter){
  try{
    idList = Meteor.users.findOne({_id:this.userId}).productId;
  }
  catch(e){
    return null; 
  }
  q = {_id:{$in:idList}};
  if(filter){
    q.Sub = filter[0];
    q.Brand = filter[1];
  }
  return Products.find(q,{fields:{'Sub':1,'Brand':1,'ProductName':1,'ModelID':1}});
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

Meteor.publish('homeId',function(){
  return HomeId.find({});
});

Meteor.publish('homeProductList',function(sub,limit,distance,loc,priceRange){
  if(!sub)
    return;
  var idList = HomeId.find({}).fetch()[0].idList;
  var blah = [];
  var blah2=[];
  var withinIdList = [];
  var shopList = [];
  Meteor.users.find({'usertype':'shop'},{fields:{'shopLatitude':1, 'shopLongitude':1,'productId':1}}).forEach(function(obj){
    if(loc != undefined){
      if(distance == undefined)
        distance = 5;
      console.log(findDistance(obj.shopLatitude, obj.shopLongitude, loc.latitude, loc.longitude));
      if(findDistance(obj.shopLatitude, obj.shopLongitude, loc.latitude, loc.longitude) < distance){
        withinIdList = _.union(withinIdList,obj.productId);
        shopList.push(obj._id);
      }
    }
    else{
      return;
      //withinIdList = _.union(withinIdList,obj.productId);
    }
  });
  console.log('shops are..');
  console.log(shopList);
  console.log(withinIdList);
  Products.find({_id:{$in:withinIdList},'Sub':sub},{fields:{'_id':1,"price":1}}).forEach(function(e){
    if(blah.length < limit){
      if(priceRange.length != 0 && priceRange != undefined)
        y = Prices.find({
          productId:e._id,
          shopId:{$in:shopList},
          price:{$gt:priceRange[0],$lt:priceRange[1]}
        },{
          fields:{"_id":1,"price":1},
          sort:{price:1},
          limit:1
        });
      else
        y = Prices.find({
          productId:e._id,
          shopId:{$in:shopList},
          price:{$gt:0}
        },{
          fields:{"_id":1,"price":1},
          sort:{price:1},
          limit:1
        });
      y = y.fetch()[0];
      if(y != undefined){
        console.log('bl');
        console.log(y._id);
        console.log(e._id);
        blah.push(y._id);
        blah2.push(e._id);
      }
    }
  });
  console.log(blah2);
  if(blah2.length>0)
    return [Products.find({_id:{$in:blah2}},{fields:{'Sub':1,'Brand':1,'ProductName':1,'ModelID':1,'Image':1}}),Prices.find({_id:{$in:blah}},{fields:{"shopId":1,"productId":1,"price":1}})];
});

Meteor.publish('homeProductDetail',function(id){
  return Products.find({_id:id}, {fields:{'Sub':0,'Brand':0,'ProductName':0,'ModelID':0,"Image":0,'searchIndex':0}});
});

Meteor.publish("shopDetail",function(name){
  return Meteor.users.find({"username": name,"usertype":"shop"},{fields:{"address":1,"contactnum":1,'shopLatitude':1,'shopLongitude':1,'emi':1,'payments':1,'openHour':1,'closeHour':1}});
});

Meteor.publish("searchQuery",function(query,sub,limit,distance,loc,priceRange){
  if(priceRange==null)
    return;
  q = {};
  query=new RegExp(query,'i');
  console.log(query);
  q.searchIndex = {$regex: query};
  blah=[];
  var blah = [];
  var blah2=[];
  var withinIdList = [];
  var shopList = [];
  if(sub)
    q.Sub = sub;
  Meteor.users.find({'usertype':'shop'},{fields:{'shopLatitude':1, 'shopLongitude':1,'productId':1}}).forEach(function(obj){
    if(loc != undefined){
      if(distance == undefined)
        distance = 5;
      if(findDistance(obj.shopLatitude, obj.shopLongitude, loc.latitude, loc.longitude) < distance){
        withinIdList = _.union(withinIdList,obj.productId);
        shopList.push(obj._id);
      }
    }
    else{
      withinIdList = _.union(withinIdList,obj.productId);
      shopList.push(obj._id);
    }
  });
  console.log(q);
  console.log(withinIdList);
  q._id = {$in:withinIdList};
  Products.find(q,{fields:{'_id':1,"price":1}}).forEach(function(e){
    if(blah.length < limit){
      if(priceRange.length != 0 && priceRange != undefined)
        y = Prices.find({
          productId:e._id,
          shopId:{$in:shopList},
          price:{$gt:priceRange[0],$lt:priceRange[1]}
        },{
          fields:{"_id":1,"price":1},
          sort:{price:1},
          limit:1
        });

      else
        y = Prices.find({
          productId:e._id,
          shopId:{$in:shopList},
          price:{$gt:0}
        },{
          fields:{"_id":1,"price":1},
          sort:{price:1},
          limit:1
        });
      y = y.fetch()[0];
      if(y != undefined){
        blah.push(y._id);
        blah2.push(e._id);
      }
    }
  });
  console.log(blah2);
  console.log(blah);
  if(blah2.length>0)
    return [Products.find({_id:{$in:blah2}},{fields:{'Sub':1,'Brand':1,'ProductName':1,'ModelID':1,'Image':1,'searchIndex':1}}),Prices.find({_id:{$in:blah}},{fields:{"shopId":1,"productId":1,"price":1}})];
});

Meteor.publish("homeBrand",function(sub){
  return Brands.find({"view":"home","Sub":sub},{fields:{"list":1,"view":1,"Sub":1}});
});

Meteor.publish("shopBrand",function(shopname,main,sub){
  if(main && sub)
    return Brands.find({"shopid":shopname,"Main":main,"Sub":sub},{fields:{"list":1, "shopid":1, "Sub":1}});
  else if(main)
    return Brands.find({"shopid":shopname,"Main":main},{fields:{"list":1, "shopid":1, "Sub":1}});
  else if(sub)
    return Brands.find({"shopid":shopname,"Sub":sub},{fields:{"list":1, "shopid":1, "Sub":1}});
  else
    return Brands.find({"shopid":shopname},{fields:{"list":1, "shopid":1, "Sub":1}});
});

Meteor.publish("productPrices",function(){
  return Prices.find({"shopId":this.userId});
});

Meteor.publish("homePrices",function(id){
  return Prices.find({"productId":id,"price":{$gt:0}});
});

Meteor.publish("shopProductPrices",function(username){
  if(username){
    var id = Meteor.users.findOne({'username':username,'usertype':'shop'})._id;
    return Prices.find({"shopId": id, 'price': {$gt: 0}});
  }
  else
    return null
});
Meteor.publish("userData", function () {
  return Meteor.users.find({_id: this.userId},{fields: {'usertype': 1}});
});
Meteor.publish("featuredProducts",function(){
  var blah=[];
  var id = Meteor.users.findOne({username:"achal"},{fields:{_id:1}})._id;
  x = Prices.find({"Featured":1,"shopId":id},{fields:{"Featured":1,productId:1,shopId:1,price:1},limit:5});
  // console.log(x.fetch());
  x.forEach(function(e){
    blah.push(e.productId);
  });
  return [x,Products.find({_id:{$in:blah}},{fields:{_id:1,"ProductName":1,"ModelID":1,"Image":1}}),Meteor.users.find({username:"achal"},{fields:{_id:1,shopname:1}})];
});

Meteor.publish("FrameAll", function(){
  return FrameDetail.find({});
});

Meteor.publish("shopCategories",function(){
  if(this.userId){
    var username = Meteor.users.findOne({"_id":this.userId},{fields:{"username":1}}).username;
    return Brands.find({"shopid":username},{fields:{"list":1, "shopid":1, "Sub":1}});
  }
});

