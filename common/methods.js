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
	getUser: function(){
		var details = Meteor.users.findOne({'_id': Meteor.userId()});
		return details;
	},
	addProduct: function(id){
		 var current = [];
		Meteor.users.update({'_id': Meteor.userId()}, {$push: {'products': {'_id':id,'price':'','inStock':1,'discount':''}} });

	},
	readProducts: function(username){
		if(!username)
			var prod = Meteor.users.findOne({'username':Meteor.user().username}).products;
		else
			var prod = Meteor.users.findOne({'username':username}).products;
		return prod;
	},
	getUserType:function(){
		var type=Meteor.users.findOne({'_id':Meteor.userId()}).usertype;
		return type;
	},
	editProducts: function(set){
		Meteor.users.update({'_id': Meteor.userId()}, {$set : { 'products': set}});
	},
	editDetails: function(details){
		Meteor.users.update({'_id': Meteor.userId()}, {$set : details});
	},
	categories:function(){
		var cat = FrameDetail.find({}).fetch();
		return cat;
	},
	subcategories:function(main){
		var subcat = FrameDetail.find({Main:main});
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
		console.log(ret);
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
	getUserLocation:function(){
		if(navigator.geolocation){
    		navigator.geolocation.getCurrentPosition(function(position){
    			Session.set('geolocation',position);
    		});
  		}
  		else{
    		alert("Geolocation not supported");
  		}
	},
	findDistance: function(lat1,lng1,lat2,lng2){
		var R = 6371; //Approximate Radius of Earth in km!!
		lat1 = lat1*Math.PI/180;
		lng1 = lng1*Math.PI/180;
		lat2 = lat2*Math.PI/180;
		lng2 = lng2*Math.PI/180;
		var x = (lng2-lng1) * Math.cos((lat1+lat2)/2);
		var y = (lat2-lat1);
		var d = Math.sqrt(x*x + y*y) * R;
		return d;
	},
	findAdmin:function(adminUser){
		var output = Meteor.users.find({'username':adminUser}).fetch();
		console.log(output);
		if(output){
			return true;
		}
		else
			return false;

	}
});
function showPosition(position){
	var x = document.getElementById("shopLatitude");
	var y = document.getElementById("shopLongitude");
	x.value = position.coords.latitude;
	y.value = position.coords.longitude;
}