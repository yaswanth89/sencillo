this.CustomerView = Backbone.View.extend({
	initialize:function(){
    	Session.set("shopSub","TV");
	    Session.set("shopBrand",[]);
	    Session.set('shopLimit',20);
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
    Meteor.subscribe('homeProductDetail',Session.get('shopId'));
    Meteor.subscribe('shopDetail',window.shopUsername);
});
Template.ShopMainCat.MainCatArr = function(){
	return FrameDetail.find({});
};

Template.shopInfo.shopDet = function(){
	Meteor.users.find({username:window.shopUsername}).forEach(function(loop){
    	shop = loop;
  	});
  	try{
    	var latlng = new google.maps.LatLng(shop.shopLatitude, shop.shopLongitude);
		var mapProp = {
			center: latlng,
			zoom:10,
			mapTypeId:google.maps.MapTypeId.ROADMAP
		};
		var map=new google.maps.Map(document.getElementById('googleMap'),mapProp);
		var marker = new google.maps.Marker({
		    position: latlng,
		    map: map,
		    title: shop.shopname
	  	});
		marker.setMap(map);
  		return shop;
  	}
  	catch(e){
  		return null;
  	}
};
Template.ShopBrand.BrandArr = function(){
	var productList = [];
    Meteor.users.find({username:window.shopUsername}).forEach(function(loop){
    	productList = loop.productId;
  	});
  	if(_.isEmpty(productList))
  		return null;
    retBrand = Products.find({"_id":{$in:productList}, "Sub":Session.get('shopSub')},{fields:{'_id':0,"Brand":1}}).fetch();
	var tempAr=[];
	_.each(retBrand,function(obj){
	tempAr.push(obj.Brand);
	});
	return _.uniq(tempAr);
};

Template.ShopBrand.events = {
	"change .brand" : function(){
		var brand = new Array;
		$('.brand').each(function(){ if($(this).is(':checked')) brand.push($(this).val()); });
		Session.set('shopBrand', brand);
	}
};
Template.ShopProducts.ProductArr = function(){
	var productList = [];
  	Meteor.users.find({username:window.shopUsername}).forEach(function(loop){
    	productList = loop.productId;
  	});
  	if(_.isEmpty(productList))
  		return null;
  	if(_.isEmpty(Session.get("shopBrand")))
  		return Products.find({_id:{$in:productList},'Sub':Session.get('shopSub')});
  	else	
		return Products.find({_id:{$in:productList},'Sub':Session.get('shopSub'),'Brand':{$in:Session.get("shopBrand")}});
};
Template.ShopProducts.shopname = function(){
	return window.shopUsername;
}

Template.customerView.events = {
	"mouseenter div#cvmap-ribbon" : function(){
		$('.cvMapDisplay').animate({left: '-0.5%'});
	},
	"mouseleave div.cvMapDisplay" : function(){
		$('.cvMapDisplay').animate({left: '25.5%'})
	}
}

Template.ShopProducts.events = {
	"click div.show-product" : function(e,t){
      e.preventDefault();
      var now = e.currentTarget;
      var id = now.id.split('_');
      Session.set('shopId',id[1]);
      $("#shopModal").css("top",$(now).position().top+250+'px').fadeIn();
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
  },
  "click a.shopNav" : function(e,t){
    e.preventDefault();
    App.router.aReplace(e);
  }
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
	if(window.shopProductId){
		$("#shopModal").css("top",'0px').fadeIn();
		Session.set('shopId',window.shopProductId);
	}
}


$(function(){
	prevNav = {};
	$('#subCat').live('click',function(e){
		$(prevNav).parent().removeClass("active");
		$(this).parent().addClass("active");
		prevNav = this;
		Session.set("shopSub",$(this).text());
	});
	console.log(window.shopProductId);
});