var global = {};
if(navigator.geolocation){
  navigator.geolocation.getCurrentPosition(function(position){
    window.here = position;
  });
}
this.Home = Backbone.View.extend({
	template:null,
	initialize:function(page){
    var subCat="";
    _.each(page,function(val){
      if(val=="_")
        subCat+=" ";
      else
        subCat+=val;
    });
    try{
      Session.set('homeIdList',HomeId.find({}).fetch()[0].idList);
    }
    catch(e){
      Session.set('homeIdList','');
    }
    Session.set('newProducts',true);
    Session.set("homeSub",subCat);
    Session.set("homeBrand",[]);
    if(window.homeProductId != undefined)
      Session.set("homeId",window.homeProductId);
    else
      Session.set('homeId','');
    var prod_inc = 20;
    Session.setDefault('homeLimit',prod_inc);
    return this.template = Meteor.render(function(){
    return Template.home();
      });
	},
	render:function(){
		this.$el = this.template;
		return this;
	}
});
Deps.autorun(function(){
    Meteor.subscribe('homeProductList',Session.get('homeSub'),Session.get('homeLimit'));
    Meteor.subscribe('homeProductDetail',Session.get('homeId'));
    Meteor.subscribe('homePrices',Session.get('homeId'));
    Meteor.subscribe('homeId');
    Meteor.subscribe('homeBrand', Session.get('homeSub'));
});

Template.homeBrand.Brand = function(){
  /*if(Session.get('homeIdList')=="")
      retBrand = Products.find({},{fields:{'_id':0,"Brand":1}}).fetch();
    else
      retBrand = Products.find({"_id":{$in:Session.get('homeIdList')}},{fields:{'_id':0,"Brand":1}}).fetch();
  var tempAr=[];
  _.each(retBrand,function(obj){
    tempAr.push(obj.Brand);
  });*/
  try{
    return Brands.findOne({"view":"home","Sub":Session.get('homeSub')}).list;
  }
  catch(e){
    return null;
  }
};


Template.homeProducts.ProductArr = function(){
  if(_.isEmpty(Session.get('homeBrand'))){
    if(Session.get('distanceFilter') != undefined && Session.get('distanceFilter') != ""){
      var withinProducts = [];
      Meteor.users.find({'usertype':'shop'},{fields: {'shopLatitude':1,'shopLongitude':1,'productId':1}}).forEach(function(obj){
        console.log(obj);
        if(findDistance(obj.shopLatitude,obj.shopLongitude,window.here.coords.latitude,window.here.coords.longitude) < Session.get('distanceFilter')){
          withinProducts = _.union(withinProducts,obj.productId);
        }
      });
      return addLeastPrice(Products.find({"_id":{$in : withinProducts}, "Sub":Session.get('homeSub')},{reactive: Session.get('newProducts')}).fetch());
    }
    if(Session.get('homeIdList')==""){
      return addLeastPrice(Products.find({"Sub":Session.get('homeSub')},{reactive:Session.get('newProducts')}).fetch());
    }
    else{
      return addLeastPrice(Products.find({"_id":{$in:Session.get('homeIdList')},"Sub":Session.get('homeSub')},{reactive:Session.get('newProducts')}).fetch());
    }
  }else{
    if(Session.get('distanceFilter') != undefined && Session.get('distanceFilter') != ""){
      var withinProducts = [];
      Meteor.users.find({'usertype':'shop'},{fields: {'shopLatitude':1,'shopLongitude':1,'productId':1}}).forEach(function(obj){
        console.log(obj);
        if(findDistance(obj.shopLatitude,obj.shopLongitude,window.here.coords.latitude,window.here.coords.longitude) < Session.get('distanceFilter')){
          withinProducts = _.union(withinProducts,obj.productId);
        }
      });
      return addLeastPrice(Products.find({"_id":{$in : withinProducts}, "Sub":Session.get('homeSub'), "Brand":{$in:Session.get('homeBrand')}},{reactive: Session.get('newProducts')}).fetch());
    }
    if(Session.get('homeIdList')=="")
      return addLeastPrice(Products.find({"Sub":Session.get('homeSub'),'Brand':{$in:Session.get('homeBrand')}},{reactive:Session.get('newProducts')}).fetch());
    else
      return addLeastPrice(Products.find({"_id":{$in:Session.get('homeIdList')},"Sub":Session.get('homeSub'),'Brand':{$in:Session.get('homeBrand')}},{reactive:Session.get('newProducts')}));
  }
};

Template.homeProducts.events = {
  "click div.show-product" : function(e,t){
      e.preventDefault();
      var now = e.currentTarget;
      var id = now.id.split('_');
      Session.set('homeId',id[1]);
      $("#homeModal").css("top",$(now).position().top+260+'px').show().animate({
        height: window.productHeight - 100,
        opacity: 1});
      $("#productList").animate({ scrollTop: ($(now).position().top+250)+"px" });
  }
}


Template.homeDistanceFilter.events = {
  "change input[name='distanceFilter']" : function(e, t){
    var now = e.currentTarget.value;
    console.log('distance filter is '+now);
    Session.set('distanceFilter',now);
  }
}

Template.homeModal.product = function(){
  return Products.find({_id:Session.get('homeId')});
};


Template.homeModalOverview.productOverview = function(){
  return Products.find({_id:Session.get('homeId')},{fields:{overViewList:1,overviewPara:1,feature:1}});
};


Template.homeModalSpec.productSpec = function(){
  return Products.find({_id:Session.get('homeId')},{fields:{spec:1}});
};


Template.homeModalAvailble.shopList = function(){
  returnarr =[];
  Meteor.users.find({"productId":{$all:[Session.get('homeId')]}}).forEach(function(el){
    price=undefined;
    Prices.find({"productId":Session.get('homeId'),"shopId":el._id,"price":{$gt:0}}).forEach(function(e){
      price = e.price;
    });
    if(price){
      returnarr.push({
        shopname:el.shopname,
        distance:findDistance(el.shopLatitude,el.shopLongitude,window.here.coords.latitude, window.here.coords.longitude),
        link:'/cv/'+el.username+'/'+Session.get('homeId'),
        price:price
      });
    }
  });
  returnarr.sort(function(a,b) {return (a.distance > b.distance) ? 1 : ((b.distance > a.distance) ? -1 : 0);} );
  return returnarr;
}


Template.homeModal.events = {
  "click a#closeModal":function(e,t){
    e.preventDefault();
    $("#homeModal").animate({
        height: 0,
        opacity: 0},function(){
          $(this).hide()
        });
    App.router.navigate(Session.get('homeSub'),{trigger:false});
  },
  "click a.shopNav" : function(e,t){
    e.preventDefault();
    App.router.aReplace(e);
  }
}


Template.homeProducts.rendered = function(){
  if(this.rendered==1){
    $("#loadmask").fadeOut('slow');
    Session.set('newProducts',false);
    this.rendered=2;
  }
  if(!this.rendered){
    this.rendered = 1;
    window.productHeight = $(window).height() - 133;
    homeContainer = $("#homeContainer").height(window.productHeight);
    $(window).resize(function(event) {
      window.productHeight = $(this).height() - 133;
      homeContainer.height(window.productHeight);
    });
    if(window.homeProductId != undefined){
      Session.set("homeId",window.homeProductId);
      $("#homeModal").css("top",'0px').show().animate({
        height: window.productHeight - 100,
        opacity: 1});
      window.homeProductId = undefined;
    }
    $("#productList").scroll(function() {
      if(!window.loading && $("#productList").scrollTop() + $("#productList").height() > $("#productList .products-list").eq(0).height() - 100) {
        Session.set('newProducts',true);
        Session.set('homeLimit',Session.get('homeLimit')*2);
        window.loading = true;
      }
    });
  }
  if(window.loading)
    window.loading = false;
  $("img.item-image").lazyload({
    effect : "fadeIn",
    container: $("#productList")
  });
};


$(function(){
  $('#homeFilter input').live('change',function(){
    var brandSel = $('#homeFilter input:checkbox:checked').map(function(){
      return $(this).val()
    }).get();
    Session.set('homeBrand',brandSel);
  });
});


function addLeastPrice(x){
  _.each(x,function(e) {
    console.log(e._id);
    z = Prices.find({productId:e._id,price:{$gt:0}},{fields:{"price":1},sort:{"price":1},limit:1});
    if(z.count()>0)
      e.leastPrice =  z.fetch()[0].price;
  });
  return x;
}