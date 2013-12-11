var global = {};

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
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(function(position){
        window.here = position;
        Session.set('distanceCenter',window.here.coords);
      });
    }
    if(Session.get('distanceFilter') == undefined || Session.get('distanceFilter') == '')
      Session.set('distanceFilter',5);
    if(Session.get('priceRange') == undefined)
      Session.set('priceRange', []);
    Meteor.subscribe('homeProductList',Session.get('homeSub'),Session.get('homeLimit'),Session.get('distanceFilter'),Session.get('distanceCenter'),Session.get('priceRange'));
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
  if(Session.get('distanceFilter') == undefined || Session.get('distanceFilter') == "")
      Session.set('distanceFilter',5);
    var withinProducts = [];
      Meteor.users.find({'usertype':'shop'},{fields: {'shopLatitude':1,'shopLongitude':1,'productId':1}}).forEach(function(obj){
        console.log(obj);
        if(findDistance(obj.shopLatitude,obj.shopLongitude,window.here.coords.latitude,window.here.coords.longitude) < Session.get('distanceFilter')){
          withinProducts = _.union(withinProducts,obj.productId);
        }
      });
      console.log(withinProducts);
  if(_.isEmpty(Session.get('homeBrand'))){
      return addLeastPrice(Products.find({"_id":{$in: withinProducts},"Sub":Session.get('homeSub')},{reactive:Session.get('newProducts')}).fetch());
  }else{
      console.log('not empty');
      return addLeastPrice(Products.find({"_id":{$in: withinProducts},"Sub":Session.get('homeSub'),'Brand':{$in:Session.get('homeBrand')}},{reactive:Session.get('newProducts')}).fetch());
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
        distance:findDistance(el.shopLatitude,el.shopLongitude,Session.get('distanceCenter').latitude, Session.get('distanceCenter').longitude),
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

Template.homeDistanceFilter.rendered = function(){

  console.log('rendered distance');
  $('#distanceSlider').slider({
    min: 1,
    max: 10,
    step: 1,
    value: 5,
    selection: 'before',
    orientation: 'horizontal',
    tooltip: 'show'
  });

   $('#distanceSlider').on('slideStop', function(e){
    console.log('slide stop!!');
    Session.set('distanceFilter',$(this).val());
  });

  var center = new google.maps.places.Autocomplete(document.getElementById('distanceCenter'));
  center.setComponentRestrictions({country: 'IN'});
  center.setTypes(['geocode']);

  google.maps.event.addListener(center, 'place_changed', function(){
    var place = center.getPlace();
    console.log(place);
    if(!place.geometry)
      return;
    Session.set('distanceCenter', {'latitude': place.geometry.location.lat(),'longitude': place.geometry.location.lng()});
  });
};

Template.homePriceFilter.rendered = function(){
  $('#priceSlider').slider({
    min: 0,
    max: 10000,
    step: 100,
    orientation: 'horizontal',
    value: [0,10000],
    tooltip:'show'
  });

  $('#priceSlider').on('slideStop', function(e){
    Session.set('priceRange',$(this).val());
  });
};

Template.homeProducts.rendered = function(){
  if(this.rendered==1){
    $("#loadmask").fadeOut('slow');
    //Session.set('newProducts',false);
    this.rendered=2;
  }
  if(!this.rendered){
    this.rendered = 1;
    window.productHeight = $(window).height() - 133;
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
  var scrolled=0;
  $('#homeFilter input').live('change',function(){
    var brandSel = $('#homeFilter input:checkbox:checked').map(function(){
      return $(this).val()
    }).get();
    Session.set('homeBrand',brandSel);
  });
<<<<<<< HEAD
  $('#homeModal .column img').live('click',function(){
    var src = $(this).attr('src');
    var html = "<img src='"+src+"'/>";
    $('div#imageModal').html(html);
  });
  $('#thumbLeft').live('click',function(){
    scrolled=scrolled-200;
    if(scrolled<0)
      scrolled=0;
    $('#thumbSlider').scrollLeft(scrolled);
  });
  $('#thumbRight').live('click',function(){
    scrolled=scrolled+200;
    max = $("#thumbSlider")[0].scrollWidth - $("#thumbSlider").width();
    if(scrolled > max)
      scrolled=max;
    $('#thumbSlider').scrollLeft(scrolled);
    
  });

});
=======
});


function addLeastPrice(x){
  _.each(x,function(e) {
    console.log(e._id);
    z = Prices.find({productId:e._id,price:{$gt:0}},{fields:{"price":1},sort:{"price":1},limit:1});
    if(z.count()>0){
      e.leastPrice =  z.fetch()[0].price;
      if(Session.get('priceRange') != []){
        if(e.leastPrice < Session.get('priceRange')[0] || e.leastPrice > Session.get('priceRange')[1]){
          var i = x.indexOf(e);
          e=null;
        }
      }
    }
    else{
      var i = x.indexOf(e);
      e=null;
    }
  });
  return x;
}
>>>>>>> c62c68ab12af4ed97510231156badcf42f820fd7
