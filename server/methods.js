Meteor.methods({
	addToCat:function(all){
		var temp = all[0].value;
		FrameDetail.insert({Main:temp,Sub:[]});
		for (var i=1;i<all.length;i++)
		{
			FrameData.insert({Main:temp,Sub:all[i].value});
			FrameDetail.update({Main:temp},{$push:{Sub:all[i].value}});
		}
	},
	searchProducts: function(query){
		var queryString = query.replace(/ /g,"|");
		var re = new RegExp("\\b("+queryString+")\\b",'i');
		var matched = Products.find({"searchIndex": {$regex: re}},{sort: {Model: 1}}).fetch();
		return matched;
	},
	getBrands:function(query,av){
		if(av){
			var idList = HomeId.find({}).fetch()[0].idList;
			if(!_.isEmpty(idList))
				query._id={$in:idList};
		}
		else{
			try{
				idList = Meteor.user().productId;
				if(!_.isEmpty(idList))
					query._id={$nin:idList};
			}catch(e){
				return null;
			}
		}
		brands=[];
		Products.find(query,{fields:{"Brand":1}}).forEach(function(e){
			if (brands.indexOf(e.Brand) == -1)
				brands.push(e.Brand);
		});
		return brands;
	},
	getAccessToken : function() {
	    try {
	    	
	      	return Meteor.user().services.google.accessToken;
	    } catch(e) { 
	      return null;
	    }
  	},
	getUser: function(){
		var details = Meteor.users.findOne({'_id': Meteor.userId()});
		console.log(details.shopname);
		return details;
	},
	addProduct: function(id){
		var current = [];
		product = Products.findOne({"_id":id},{"fields":{"Sub":1,"Brand":1}});
		Brands.upsert({"shopid":Meteor.user().username,"Sub":product.Sub},{$addToSet:{"list":product.Brand}});
		Meteor.users.update({'_id': Meteor.userId()}, {$push: {'productId':id}});
	},
  addMultipleProducts: function(arr){
    products = Products.find({"_id": {$in: arr}},{'fields': {'Sub':1,'Brand':1}});
    grouped = _.groupBy(products.fetch(),'Sub');
    //due to bug in meteor...nxt line doesnt work :/
    //Brands.upsert({"shopid":Meteor.user().username,"Sub":key},{$addToSet: { "list":{$each: _.pluck(val, 'Brand')} } });
    _.each(grouped,function(val, key, e){
      var brands = _.pluck(val, 'Brand');
      _.each(brands, function(e){
         Brands.upsert({"shopid":Meteor.user().username,"Sub":key},{$addToSet: { "list": e } });
      });
    });
    Meteor.users.update({'_id':Meteor.userId()}, {$pushAll: {'productId': arr}});
  },
	readProducts: function(username){
		if(!username)
			var prod = Meteor.users.findOne({'username':Meteor.user().username}).products;
		else
			var prod = Meteor.users.findOne({'username':username}).products;
		return prod;
	},
	getShopDetail:function(username){
		var shopReturn = Meteor.users.findOne({'username':username});
		return shopReturn;
	},
	getShopUsername:function(shopname){
		console.log(shopname);
		var userReturn = Meteor.users.findOne({'shopname':shopname}).usertype;
		console.log(userReturn);
		return userReturn;
	},
	getUserType:function(){
		var type=Meteor.users.findOne({'_id':Meteor.userId()}).usertype;
		return type;
	},
	editProducts: function(set){
		var Fbpost = "";
		_.each(set,function(e){
			if(e.inStock){
				var addedProduct = Products.findOne({"_id":e.productId},{fields:{"_id":1,"ProductName":1,"ModelID":1}});
				Fbpost += addedProduct.ProductName+" "+ addedProduct.ModelID+" is now avaible at Rs."+e.price+"/-\n http://sencillo.co.in/cv/"+Meteor.user().username+"/"+addedProduct._id;
			}
			Prices.upsert({"productId":e.productId,"shopId":Meteor.userId()},{$set:{'price': e.price,'inStock': e.inStock,'onDisplay': e.onDisplay,'Featured':e.Featured}});
		});
		if(Meteor.user().shopFbPage){
			access = Meteor.users.findOne({"_id":Meteor.userId()},{fields:{"fbAccessToken":1}});
			var appData = ApiKeys.findOne({"name":"facebook"});
			var url = 'https://graph.facebook.com/'+Meteor.user().shopFbPage+'/feed?'+encodeURI('access_token='+access.fbAccessToken+'&message='+Fbpost);
			HTTP.post(url, function(er,result){
				console.log("result");
			});
		}
	},
	editDetails: function(details){
		Meteor.users.update({'_id': Meteor.userId()}, {$set : details});
	},
	categories:function(){
		return FrameDetail.find({});
		
	},
	subcategories:function(main){
		var subcat = FrameDetail.find({Main:main}).fetch();
		return subcat;
	},
	findProductById:function(shop){
		if(shop["_id"]!=undefined){
			var returnvar = Products.findOne({'_id': shop["_id"]});
			returnvar.shop = shop;
			return returnvar;
		}
	},
	findProductfromId:function(id){
		var ret = Products.findOne({'_id': id});
		return ret;
	},
	findBrandProducts:function(){
		return Products.find({Brand: Meteor.users.findOne({'_id':Meteor.userId()}).brandname }).fetch();
	},
	addFeature:function(all){
		var tempLabel = _.rest(all,2);
		FrameData.update({Sub:all[1]},{$pushAll:{featureField:tempLabel}});
	},
	addSpecs:function(all){
		var objct = {Main:all[1].value,Sub:[]};
		for(var i=2;i<all.length;i++){
			objct.Sub.push({name:all[1].value,value:all[i].value});
		}
		FrameData.update({Sub:all[0]},{$push:{Tags:objct}});
	},
	showData:function(){
		console.log(Products.find({}).fetch());
	},
	getMainProducts:function(filter){
		if(filter==null)
			return Products.find().fetch();
		return Products.find({Main:filter},{sort: {Model: 1}}).fetch();
	},
	getData:function(filt,find){
		console.log(FrameData.find({Sub:filt}).fetch());
		var xamp = FrameData.find({Sub:filt}).fetch()[0][find];
		if(xamp!=undefined)
			return xamp;
		else
			return null;
	},
	getAllShops:function(){
		var shops = Meteor.users.find({usertype: 'shop'}).fetch();
		return shops;
	},
	getShopLatLng: function(username){
		return Meteor.users.findOne({'username':username, 'usertype':'shop'});
	},
	getMainAvailableProducts:function(filter){
		var finalProducts = [];
		if(filter==null||filter==undefined)
			var productsarr = Products.find().fetch();
		else
			var productsarr = Products.find({Sub:filter}).fetch();
		var shops = Meteor.users.find({usertype:'shop'}).fetch();
		productsarr.forEach(function(prorec){
			var avshops = [];
			_.each(shops,function(rec){
				if(rec.products!=undefined)
					for(i = rec.products.length-1;i>=0;i--)
						if(rec.products[i]._id==prorec._id){
							var tranform = {
								shopId:rec._id,
								shopname:rec.shopname,
								contactname:rec.contactname,
								contactnum:rec.contactnum,
								price:rec.products[i].price,
								shoplat:rec.shopLatitude,
								shoplng:rec.shopLongitude,
								discount:rec.products[i].discount,
								inStock:rec.products[i].inStock
							};
							avshops.push(tranform);
							break;
						}
			});
			if(avshops.length>0){
				prorec.shopList = avshops;
				finalProducts.push(prorec);
			}
		});
		return finalProducts;
	},
	getShopsByProductId:function(id){
		if(id!=undefined){
			var shops = Meteor.users.find({usertype:'shop'}).fetch();
			var avshops = [];
			_.each(shops,function(rec){
				for(i = rec.products.length-1;i>=0;i--)
					if(rec.products[i]._id==id){
						var tranform = {
							shopId:rec._id,
							shopname:rec.shopname,
							contactname:rec.contactname,
							contactnum:rec.contactnum,
							price:rec.products[i].price,
							discount:rec.products[i].discount,
							inStock:rec.products[i].inStock
						};
						avshops.push(tranform);
						break;
					}
			});
			return avshops;
		}

	},
	addProductData:function(inputShow,mainCatInput,subCatInput,showSpec,productName,modelID,imageArray){
		var brandName = Meteor.users.findOne({'_id':Meteor.userId()}).brandname;
		Products.insert({"Main":mainCatInput,"Sub":subCatInput,"Brand":brandName,"ProductName":productName,"ModelID":modelID,"Image":imageArray,"showSpec":showSpec,"ProductInfo":inputShow,"searchIndex":brandName+' '+productName+' '+modelID});
	},
	updateProductData:function(productID,updateSet){
		console.log(productID);
		Products.update({'_id':productID},{ $set : updateSet });
	},
	getLocation:function(){
		if(navigator.geolocation){
    		navigator.geolocation.getCurrentPosition(showPosition);
  		}
  		else{
    		alert("Geolocation not supported");
  		}
	},
	findAdmin:function(adminUser){
		var output = Meteor.users.find({'username':adminUser}).fetch();
		console.log(output);
		if(output){
			return true;
		}
		else
			return false;
	},
	connectFb:function (data) {
		var appData = ApiKeys.findOne({"name":"facebook"});
		var url = "https://graph.facebook.com/oauth/access_token?client_id=" + appData.appId
			+ "&client_secret=" + appData.appSecret
			+"&grant_type=fb_exchange_token"
			+"&fb_exchange_token="+data.access_token;
		var result = HTTP.call("GET",url);
		var prmarr = result.content.split ("&");
		var params = {};
		for ( var i = 0; i < prmarr.length; i++) {
		    var tmparr = prmarr[i].split("=");
		    params[tmparr[0]] = tmparr[1];
		}
		Meteor.users.update({_id:Meteor.userId()},{$set:{"shopFbPage":data.id,"fbAccessToken":params.access_token}})
	}
});
function showPosition(position){
	var x = document.getElementById("shopLatitude");
	var y = document.getElementById("shopLongitude");
	x.value = position.coords.latitude;
	y.value = position.coords.longitude;
}