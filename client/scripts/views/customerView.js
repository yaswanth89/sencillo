this.CustomerView = Backbone.View.extend({
	initialize:function(){
  	//Session.set("shopSub","TV");
    Session.set("shopBrand",[]);
    Session.set('shopLimit',20);
		Session.set('newProducts',true);
    Session.set('setPriceRange',true);
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
    Meteor.subscribe('shopProductList',window.shopUsername,Session.get('shopMainFilter'),Session.get('shopSubFilter'),Session.get('shopLimit'));
    Meteor.subscribe('shopProductPrices',window.shopUsername);
    Meteor.subscribe('homeProductDetail',Session.get('shopId'));
    Meteor.subscribe('shopDetail',window.shopUsername);
    Meteor.subscribe("shopBrand",window.shopUsername,Session.get('shopMainFilter'),Session.get('shopSubFilter'));
    Meteor.subscribe('FrameAll');
    //Meteor.subscribe('shopSubs',window.shopUsername);
});
Template.ShopMainCat.MainCatArr = function(){
	return FrameDetail.find({});
};

Template.ShopInfo.shopDet = function(){
  var shop;
	Meteor.users.find({username:window.shopUsername}).forEach(function(loop){
    	shop = loop;
  	});
  	var GMAPS_API_KEY = 'AIzaSyBoZj_NWxZTB-rKDEKGShhV1xlvn5UwYVc';
  	console.log(shop);
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

Template.shopCategories.shopCat = function(){
  return FrameDetail.find({});
}

Template.ShopBrand.BrandArr = function(){
  if(Session.get('shopSubFilter')){
    console.log('brandssss');
    console.log(Brands.findOne({"shopid":window.shopUsername,"Sub":Session.get('shopSubFilter')}).list);
    return Brands.findOne({"shopid":window.shopUsername,"Sub":Session.get('shopSubFilter')}).list;
  }else
    return null;
};

Template.ShopBrand.events = {
	"change .shopBrandCheck" : function(){
		var brand = new Array;
		$('.shopBrandCheck').each(function(){ if($(this).is(':checked')) brand.push($(this).val());});
		Session.set('shopBrand', brand);
	}
};

Template.shopFeaturedProducts.featuredProductArr = function(){
  var blah=[];
  var id = '';
  var shopName='';
  Meteor.users.find({username:window.shopUsername},{fields: {'_id':1}}).forEach(function(e){
    id = e._id;
  });
  x = Prices.find({shopId:id,"Featured":1},{limit:5}).forEach(function(e){
    product = Products.find({_id:e.productId},{fields:{"ProductName":1,"ModelID":1,"Image":1}}).fetch();
    product[0].price = e.price;
    blah.push(product[0]);
  });
  console.log('feaaaaaatured!!!');
  console.log(blah);
  return blah;
};

/*
Template.shopFeaturedProducts.featuredProductArr = function(){
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
};*/

Template.ShopProducts.ProductArr = function(){
	var productList = [];
  var prices = [];
	var shopid;
  var setPriceRange = false;
  	Meteor.users.find({username:window.shopUsername}).forEach(function(loop){
    	shopid = loop._id;
    	productList = loop.productId;
  	});
  	if(_.isEmpty(productList))
  		return null;
  	console.log('productList');
    console.log(productList);
  	if(_.isEmpty(Session.get("shopBrand"))){
  		var prods = [];
  		if(Session.get('shopMainFilter') && Session.get('shopSubFilter')){
        console.log('main n sub');
        var docs = Products.find({_id:{$in:productList},'Main': Session.get('shopMainFilter'),'Sub':Session.get('shopSubFilter')},{reactive:Session.get('newProducts')});
        setPriceRange = true;
      }
      else if(Session.get('shopMainFilter')) {
        console.log('only main');
        var docs = Products.find({_id:{$in:productList},'Main': Session.get('shopMainFilter')},{reactive:Session.get('newProducts')});
        setPriceRange = true;
      }
      else if(Session.get('shopSubFilter')){
        console.log('only sub');
        var docs = Products.find({_id:{$in:productList},'Sub':Session.get('shopSubFilter')},{reactive:Session.get('newProducts')});
        setPriceRange = true;
      }
      else{
        console.log('nothing!!!');
        var docs = Products.find({_id:{$in:productList}},{reactive:Session.get('newProducts')});
        setPriceRange = true;
      }
      console.log('docsssss');
      console.log(docs);
      if(!_.isEmpty(Session.get('shopPriceRange')) && Session.get('shopPriceRange') != undefined){
        setPriceRange = false;
        console.log('called price filtering!!');
        var prods = [];
        docs.forEach(function(obj){
            var p = Prices.find({'shopId':shopid,'productId':obj._id,'price': {$gte: Session.get('shopPriceRange')[0], $lte: Session.get('shopPriceRange')[1]}}).fetch()[0];
            console.log('price is');
            if(p != undefined){
                console.log(p.price);
                console.log('passed price test!!');
                obj.price = p.price;
                prods.push(obj);
            }
        });
      }
      else{
        setPriceRange = true;
        console.log('no range to price filtering!!');
        var prods = [];
        docs.forEach(function(obj){
            var p = Prices.find({'shopId':shopid,'productId':obj._id,'price': {$gt: 0}}).fetch()[0];
            console.log('price is');
            if(p != undefined){
                console.log(p.price);
                if(p.price != ''){
                  obj.price = p.price;
                  prods.push(obj);
                }
            }
        });
      }
        //var pricedProds = Meteor.call('FilterByPrice',docs,0,0);
      var priceMin = _.min(prods,function(prod){ return prod.price; }).price;
      var priceMax = _.max(prods,function(prod){ return prod.price; }).price;
      
      if(priceMin && priceMax && setPriceRange){
        console.log('setting price range...');
        Session.set('priceRangeSet',{'min':priceMin, 'max': priceMax});
      }
      window.totalPriceRange = [priceMin,priceMax];
  	}
  	else{
  		var prods = [];
  		if(Session.get('shopMainFilter') && Session.get('shopSubFilter')){
        console.log('main n sub');
        var docs = Products.find({_id:{$in:productList},'Main': Session.get('shopMainFilter'),'Sub':Session.get('shopSubFilter'),'Brand':{$in:Session.get("shopBrand")}},{reactive:Session.get('newProducts')});
      }
      else if(Session.get('shopMainFilter')) {
        console.log('only main');
        var docs = Products.find({_id:{$in:productList},'Main': Session.get('shopMainFilter'),'Brand':{$in:Session.get("shopBrand")}},{reactive:Session.get('newProducts')});
      }
      else if(Session.get('shopSubFilter')){
        console.log('only sub');
        var docs = Products.find({_id:{$in:productList},'Sub':Session.get('shopSubFilter'),'Brand':{$in:Session.get("shopBrand")}},{reactive:Session.get('newProducts')});
      }
      else{
        console.log('nothing!!!');
        var docs = Products.find({_id:{$in:productList},'Brand':{$in:Session.get("shopBrand")}},{reactive:Session.get('newProducts')});
      }
      
      if(!_.isEmpty(Session.get('shopPriceRange')) && Session.get('shopPriceRange') != undefined){
        console.log('called price filtering!!')
        var prods = [];
        docs.forEach(function(obj){
            var p = Prices.find({'shopId':shopid,'productId':obj._id,'price': {$gte: Session.get('shopPriceRange')[0], $lte: Session.get('shopPriceRange')[1]}}).fetch()[0];
            console.log('price is');
            if(p != undefined){
                console.log(p.price);
                console.log('passed price test!!');
                obj.price = p.price;
                prods.push(obj);
            }
        });
      }
      else{
        console.log('no range to price filtering!!')
        var prods = [];
        docs.forEach(function(obj){
            var p = Prices.find({'shopId':shopid,'productId':obj._id,'price': {$gt: 0}}).fetch()[0];
            console.log('price is');
            if(p != undefined){
                console.log(p.price);
                if(p.price != ''){
                  obj.price = p.price;
                  prods.push(obj);
                }
            }
        });
      }
      
      var priceMin = _.min(prods,function(prod){ return prod.price; }).price;
      var priceMax = _.max(prods,function(prod){ return prod.price; }).price;
      console.log('came here..');

      if(priceMin && priceMax){
        console.log('setting price range...');
        Session.set('priceRangeSet',{'min':priceMin, 'max': priceMax});
      }else{
        console.log('unsetting price range...');
        Session.set('priceRangeSet',undefined);
      }
      window.totalPriceRange = [priceMin,priceMax];
  	
    }

    Template.ShopPriceFilter.priceRange = function(){
      if(Session.get('priceRangeSet'))
        return Session.get('priceRangeSet');
      return {'min':priceMin, 'max':priceMax};
    }
  return prods;
};

Template.shopCategories.events = {
  "click li.mainCat a.main-click": function(e, t){
    var now = e.currentTarget;
    var main = now.getAttribute('data-content');
    Session.set('shopSubFilter',undefined);
    Session.set('shopMainFilter',main);
    Session.set('shopPriceRange',[]);
    Session.set('shopBrand',[]);
  },
  "click li.subCat": function(e, t){
    console.log('clicked subcat!!!');
    var now = e.currentTarget;
    var sub = now.innerHTML;
    Session.set('shopMainFilter',undefined);
    Session.set('shopPriceRange',[]);
    Session.set('shopSubFilter',sub);
    Session.set('shopBrand',[]);
  }
};

Template.ShopProducts.shopname = function(){
	return window.shopUsername;
}

Template.shopFeaturedProducts.events = {
  "click div.show-product" : function(e,t){
      e.preventDefault();
      var now = e.currentTarget;
      var id = now.id.split('_');
      Session.set('shopId',id[1]);
      Session.set('newProducts',false);
      App.router.navigate('cv/'+window.shopUsername+'/'+id[1], {trigger:false});
      $('.cvShopContent .modal-wrapper').css('display','block');
      $("#shopModal").css("top",'-5px').show().animate({
        height: '100%',
        opacity: 1});
      //$("#content").animate({ scrollTop: $(now).position().top+260+24+"px" });
  }
}

Template.ShopProducts.events = {
	"click div.show-product" : function(e,t){
      e.preventDefault();
      var now = e.currentTarget;
      var par = now.parentNode;
      var id = now.id.split('_');
      Session.set('shopId',id[1]);
      Session.set('newProducts',false);
      App.router.navigate('cv/'+window.shopUsername+'/'+id[1], {trigger:false});
      $('.cvShopContent .modal-wrapper').css('display','block');
      $("#shopModal").css("top",'-5px').show().animate({
        height: '100%',
        opacity: 1});
      //$("#content").animate({ scrollTop: $(now).position().top+260+24+"px" });
  }
}

Template.shopModalOverview.product = function(){
  console.log('entered shopmodal '+window.shopUsername );
  if(Session.get('shopId') && window.shopUsername){
    var shop = Meteor.users.find({'username': window.shopUsername,'usertype':'shop'},{fields: {'_id':1}}).fetch()[0]._id;
    console.log('entered shopmodal if condition '+Session.get('shopId')+' '+shop);
    var price = Prices.find({'productId':Session.get('shopId'), 'shopId': shop},{fields: {'price':1}}).fetch()[0].price;
    var prod = Products.find({_id:Session.get('shopId')}).fetch()[0];
    prod.price = price;
    return prod;
  }
};
Template.shopModalOverview.productOverview = function(){
  return Products.find({_id:Session.get('shopId')},{fields:{overViewList:1,overviewPara:1,feature:1}});
};
Template.shopModalSpec.productSpec = function(){
  var res = Products.find({_id:Session.get('shopId')},{fields:{spec:1}});
  if(res.count() > 0)
    res = res.fetch()[0].spec;
  else
    return null;
  var ret = [];
  var obj = [];
  for(var i=0; i<res.length; i++){
    if(res[i].name == 'label'){
      if(obj.length != 0)
        ret.push(obj);
      obj = [];
    }
    obj.push(res[i]);
  }
  ret.push(obj);
  console.log(ret);
  return ret;
  //return Products.find({_id:Session.get('shopId')},{fields:{spec:1}});
};

Template.shopModalSpec.rendered = function(){
  var i = 0;
  $('#techSpec .spec-section').each(function(){
    if(i%2)
      $(this).css('float','right');
    else
      $(this).css('float','left');
    i++;
  });
};

Template.shopModal.events = {
  "click a#shopCloseModal":function(e,t){
    e.preventDefault();
    $("#shopModal").fadeOut('slow',function(){ $(this).parent().css('display','none'); });
    $('#shopModal').find('.nav-tabs li.active').removeClass('active');
    $('#shopModal').find('.nav-tabs li:first').addClass('active');
    $('#shopModal').find('.tab-content .tab-pane.active').removeClass('active');
    $('#shopModal').find('.tab-content .tab-pane#overview').addClass('active');
    App.router.navigate('cv/'+window.shopUsername, {trigger: false});
  },
  "click a.shopNav" : function(e,t){
    e.preventDefault();
    App.router.aReplace(e);
  }
};


Template.ShopProducts.rendered = function(){
  if(Session.get('priceRangeSet')){
    console.log('rendered pricerange filter');
    if($('.slider')){
      $('.slider').remove();
      $('#priceslider-wrapper').append('<div id="shopPriceSlider" class="span2"></div>');
    }

    $('#shopPriceSlider').slider({
      min: Math.floor(Session.get('priceRangeSet').min/100)*100,
      max: Math.round(Session.get('priceRangeSet').max/100)*100,
      step: 100,
      orientation: 'horizontal',
      value: [Session.get('priceRangeSet').min, Session.get('priceRangeSet').max],
      tooltip:'show'
    });

    $('#shopPriceSlider').on('slideStop', function(e){
      Session.set('shopPriceRange',$(this).val());
    });
  }

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
    $('.cvShopContent .modal-wrapper').css('display','block');
		$("#shopModal").css("top",'-5px').show().animate({
        height: '580px',
        opacity: 1});
		Session.set('shopId',window.shopProductId);
		window.shopProductId = undefined;
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
	
	$('#shopModal .column img').live('click',function(){
    var src = $(this).attr('src');
    var html = "<img src='"+src+"'/>";
    $('div#shopImageModal').html(html);
  });
});