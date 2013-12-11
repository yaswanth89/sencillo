this.CustomerView = Backbone.View.extend({
	initialize:function(){
    	Session.set("shopSub","TV");
	    Session.set("shopBrand",[]);
	    Session.set('shopLimit',20);
		Session.set('newProducts',true);
		return this.template = Meteor.render(function(){
			return Template.customerView();
		});
	},
	render:function(){
		this.$el.html(this.template);
		return this;
	}
});
Deps.autorun(function(){
    Meteor.subscribe('shopProductList',window.shopUsername,Session.get('shopSub'),Session.get('shopLimit'));
    Meteor.subscribe('shopProductPrices',window.shopUsername);
    Meteor.subscribe('homeProductDetail',Session.get('shopId'));
    Meteor.subscribe('shopDetail',window.shopUsername);
    Meteor.subscribe("shopBrand",window.shopUsername,Session.get('shopSub'))
});
Template.ShopMainCat.MainCatArr = function(){
	return FrameDetail.find({});
};

Template.ShopInfo.shopDet = function(){
	Meteor.users.find({username:window.shopUsername}).forEach(function(loop){
    	shop = loop;
  	});
  	var GMAPS_API_KEY = 'AIzaSyBoZj_NWxZTB-rKDEKGShhV1xlvn5UwYVc';
  	try{
		return shop;
  	}
  	catch(e){
  		return null;
  	}

};

$('#small-map').click(function(){
	$(this).fadeOut('slow',function(){
		$('#large-map').fadeIn();
	});
});

Template.mapCanvas.latlng = function(){
	var shop;
	if(window.shopUsername != undefined){
		Meteor.users.find({username:window.shopUsername}).forEach(function(loop){
	    	console.log(loop);
	    	shop = loop;
	  	});
	  	if(shop != undefined)
			return shop.shopLatitude+','+shop.shopLongitude; 
	}
}

Template.ShopBrand.BrandArr = function(){
	try{
    return Brands.findOne({"shopid":window.shopUsername,"Sub":Session.get('shopSub')}).list;
  }
  catch(e){
    return null;
  }
};

Template.ShopBrand.events = {
	"change .shopBrandCheck" : function(){
		var brand = new Array;
		$('.shopBrandCheck').each(function(){ if($(this).is(':checked')) brand.push($(this).val());});
		Session.set('shopBrand', brand);
	}
};

Template.FeaturedProducts.featuredProductArr = function(){
	var productList = [];
  	Meteor.users.find({username:window.shopUsername}).forEach(function(loop){
    	productList = loop.productId;
  	});
  	if(_.isEmpty(productList))
  		return null;
  	if(_.isEmpty(Session.get("shopBrand")))
  		return Products.find({_id:{$in:productList},'Sub':Session.get('shopSub')},{reactive:Session.get('newProducts')});
  	else	
		return Products.find({_id:{$in:productList},'Sub':Session.get('shopSub'),'Brand':{$in:Session.get("shopBrand")}},{reactive:Session.get('newProducts')});
};

Template.ShopProducts.ProductArr = function(){
	var productList = [];
	var shopid;
  	Meteor.users.find({username:window.shopUsername}).forEach(function(loop){
    	shopid = loop._id;
    	productList = loop.productId;
  	});
  	if(_.isEmpty(productList))
  		return null;
  	
  	if(_.isEmpty(Session.get("shopBrand"))){
  		var prods = [];
  		Products.find({_id:{$in:productList},'Sub':Session.get('shopSub')},{reactive:Session.get('newProducts')}).forEach(function(obj){
  			var p = Prices.findOne({'shopId':shopid,'productId':obj._id});
        if(p != undefined){
          if(Session.get('shopPriceRange') == [] || Session.get('shopPriceRange') == undefined){
            obj.price = p.price;
            prods.push(obj);
          }
          else{
            if(p.price > Session.get('shopPriceRange')[0] && p.price < Session.get('shopPriceRange')[1]){
              obj.price = p.price;
              prods.push(obj);
            }
          }
        }
  		});
  		return prods;
  	}
  	else{
  		var prods = [];
  		Products.find({_id:{$in:productList},'Sub':Session.get('shopSub'),'Brand':{$in:Session.get("shopBrand")}},{reactive:Session.get('newProducts')}).forEach(function(obj){
  			var p = Prices.findOne({'shopId':shopid,'productId':obj._id});
    		if(p != undefined){
    			if(Session.get('shopPriceRange') == [] || Session.get('shopPriceRange') == undefined){
            obj.price = p.price;
            prods.push(obj);
          }else{
            if(p.price > Session.get('shopPriceRange')[0] && p.price < Session.get('shopPriceRange')[1]){
              obj.price = p.price;
              prods.push(obj);
            }
          }
        }
  		});
  		return prods;
  	}
};

Template.ShopProducts.shopname = function(){
	return window.shopUsername;
}

Template.ShopProducts.events = {
	"click div.show-product" : function(e,t){
      e.preventDefault();
      var now = e.currentTarget;
      var id = now.id.split('_');
      Session.set('shopId',id[1]);
      Session.set('newProducts',false);
      App.router.navigate('cv/'+window.shopUsername+'/'+id[1], {trigger:false});
      $("#shopModal").css("top",$(now).position().top+260+24+'px').show().animate({
        height: 300,
        opacity: 1});
      $("#cvProductList").animate({ scrollTop: $(now).position().top+"px" });
  	}
}

Template.shopModal.product = function(){
  return Products.find({_id:Session.get('shopId')});
};
Template.shopModalOverview.productOverview = function(){
  return Products.find({_id:Session.get('shopId')},{fields:{overViewList:1,overviewPara:1,feature:1}});
};
Template.shopModalSpec.productSpec = function(){
  return Products.find({_id:Session.get('shopId')},{fields:{spec:1}});
};
Template.shopModal.events = {
  "click a#shopCloseModal":function(e,t){
    e.preventDefault();
    $("#shopModal").fadeOut();
    App.router.navigate('cv/'+window.shopUsername, {trigger: false});
  },
  "click a.shopNav" : function(e,t){
    e.preventDefault();
    App.router.aReplace(e);
  }
};

Template.ShopPriceFilter.rendered = function(){
  $('#shopPriceSlider').slider({
    min: 0,
    max: 10000,
    step: 100,
    orientation: 'horizontal',
    value: [1000,5000],
    tooltip:'show'
  });

  $('#shopPriceSlider').on('slideStop', function(e){
    Session.set('shopPriceRange',$(this).val());
  });
};

Template.ShopProducts.rendered = function(){
	if(this.rendered == 2){
		$("#loadmask").fadeOut();
		this.rendered=3;
	}
	if(this.rendered == 1){
		this.rendered=2;
	}
	if(!this.rendered)
		this.rendered=1;
	if(window.shopProductId != undefined){
		$("#shopModal").css("top",'24px').show().animate({
        height: 300,
        opacity: 1});
		Session.set('shopId',window.shopProductId);
		window.shopProductId = undefined;
	}
	$("img.item-image").lazyload({
	    effect : "fadeIn",
	    container: $(".cvShopProducts")
  });
}
$(function(){
	prevNav = {};
	$('#subCat').live('click',function(e){
		$(prevNav).parent().removeClass("active");
		$(this).parent().addClass("active");
		prevNav = this;
		Session.set("shopSub",$(this).text());
	});
});