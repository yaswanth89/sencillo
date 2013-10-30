this.CustomerView = Backbone.View.extend({
	initialize:function(){
		ShopProducts = [];
		Meteor.call('readProducts',window.shopUsername,function(error, result){
			console.log(result);
			for (var i = result.length - 1; i >= 0; i--){
		      Meteor.call('findProductById',result[i],function(err,productDoc){
		      	if(productDoc!=undefined){
			      	productDoc.inStock = productDoc.shop.inStock;
		          	productDoc.price = productDoc.shop.price;
		          	productDoc.discount = productDoc.shop.discount;
		          	productDoc.shop = null;
			        ShopProducts.push(productDoc);
			        if(ShopProducts.length == result.length){
			        	Session.set('ShopProducts',ShopProducts);
			        }
			    }   
		      });
		    }
		    if(window.shopProductId != undefined){
		    	var prod = _.indexOf(_.pluck(result,'_id'), window.shopProductId);
		    	if(prod != -1){
		    		Meteor.call('findProductById',result[prod], function(err,productDoc){
		    			if(err)
		    				alert(err);
		    			if(productDoc!=undefined){
					      	productDoc.inStock = productDoc.shop.inStock;
				          	productDoc.price = productDoc.shop.price;
				          	productDoc.discount = productDoc.shop.discount;
				          	productDoc.shop = null;
					        Session.set('currentProduct',productDoc);
			    		}
		    		});
		    	}
		    }
		});
		
		return this.template = Meteor.render(function(){
			return Template.customerView();
		});
	},
	render:function(){
		this.$el.html(this.template);
		return this;
	}
});
Session.set('ShopsearchFilter',{});
Template.ShopMainCat.MainCatArr = function(){
	return FrameDetail.find({});
};

Template.ShopSubCat.SubCatArr = function(){
	return Session.get('ShopUniqueSubCat');
};
Template.ShopBrand.BrandArr = function(){
	return Session.get("ShopUniqueBrand");
};

Template.ShopBrand.events = {
	"change .brand" : function(){
		var newsearch = Session.get('ShopsearchFilter');
		var brand = new Array;
		$('.brand').each(function(){ if($(this).is(':checked')) brand.push($(this).val()); });
		newsearch.Brand = {$in: brand};
		Session.set('ShopsearchFilter', newsearch);
	}
};
Template.ShopProducts.ProductArr = function(){
	var Brandfilter = Session.get("ShopsearchFilter").Brand;
	var Mainfilter = Session.get('ShopsearchFilter').Main;
	var Subfilter = Session.get('ShopsearchFilter').Sub;
	$("#shopSubCat").prop('disabled', false);
	if (Brandfilter != undefined && Brandfilter.$in.length == 0)
		Brandfilter = undefined;
	if (Subfilter != undefined && Subfilter.length == 0)
		Subfilter = undefined;
	var disProducts = _.filter(Session.get('ShopProducts'),function(rec){
		if(Mainfilter != undefined){
			if(Mainfilter == rec.Main){
				var sub = false;
		        var brand = false;
		        if(Subfilter!=undefined){
		          if(Subfilter == rec.Sub)
		            sub =true;
		        }
		        else
		          sub=true;
		        if(Brandfilter != undefined){
		          if(Brandfilter.$in.indexOf(rec.Brand)>-1)
		            brand = true;
		        }
		        else
		          brand = true;
		        return sub && brand;
			}
			else
				return false;
		}
		else
			return true;
	});
	var productscopy = _.filter(Session.get('ShopProducts'),function(rec){
		if(Mainfilter != undefined)
			return Mainfilter == rec.Main;
		else
			return false;
	});
	var subCat = new Array();
	var brand = new Array();
	var finalProducts = new Array();
	var brandEJSON = [];
	var subCatEJSON = [];
	var count = 1;
	disProducts.forEach(function(rec){
		if(count%3 == 0)
			rec.br = true;
		else 
			rec.br = false;
		finalProducts.push(rec);
		count++;
	});
	finalProducts.forEach(function(rec){
		if(subCat.indexOf(rec.Sub) < 0){
			subCat.push(rec.Sub);
			subCatEJSON.push({Name:rec.Sub});
		}
		if(brand.indexOf(rec.Brand)<0){
			brand.push(rec.Brand);
			brandEJSON.push({Name:rec.Brand});
		}
	});
	Session.set('ShopUniqueBrand',brandEJSON);
	Session.set('ShopUniqueSubCat',subCatEJSON);
	return finalProducts;
};
Template.ShopProducts.shopname = function(){
	return window.shopUsername;
}

Template.ShopProducts.events = {
	"click a.productView" : function(e,t){
		e.preventDefault();
	    var now = e.currentTarget;
	    var id = now.id.split('_');
	    Meteor.call('findProductById',{"_id":id[1]},function(error, result){
	    	if(error)
	        	alert(error); 
	      	else
	        	Session.set('currentProduct',result);
	    });
	    return App.router.navigate('/cv/'+window.shopUsername+'/'+id[1],{trigger: false});
	}
}
Template.ProductModal.product = function(){
    return Session.get('currentProduct');
    
};


Template.ProductModal.rendered = function(){
	if (!this.rendered){
    	this.rendered = true;
    	return
  	}
  	$('#myModal').modal('show');
	$('#myModal').on('hide.bs.modal', function(){
	  console.log('yay');
      return App.router.navigate('/cv/'+window.shopUsername, {trigger: false});
    });
    $('#myModal').click(function(){
    	console.log('clicked');
    });
};

$(function(){
	//SubLink = this;
	prevNav = this;
	$('#mainCat').live('click',function(e){
		mainTemp = $(this).text();
	});
	$('#subCat').live('click',function(e){
		$(prevNav).parent().removeClass("active");
		$(this).parent().addClass("active");
		prevNav = this;
		Session.set("ShopsearchFilter",{Main:mainTemp,Sub:$(this).text()});
		
	});
});

Template.mapCanvas.rendered = function(){
	Meteor.call('getShopLatLng', window.shopUsername, function(error,result){
		console.log(result);
		Session.set('ShopLatLng', {'lat': result.shopLatitude, 'lng': result.shopLongitude});
	});

		var latlng = new google.maps.LatLng(Session.get('ShopLatLng').lat, Session.get('ShopLatLng').lng);
		var mapProp = {
	  center: latlng,
	  zoom:5,
	  mapTypeId:google.maps.MapTypeId.ROADMAP
	  };
		var map=new google.maps.Map(document.getElementById('googleMap')
	  ,mapProp);

		/*var marker = new google.maps.Marker({
	    title:'Meine Position',
	    icon:'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
	  });*/
		var marker = new google.maps.Marker({
	      position: latlng,
	      map: map,
	      title: 'Hello World!'
  		});
	  marker.setMap(map); 
};
