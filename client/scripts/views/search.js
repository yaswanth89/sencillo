this.Search = Backbone.View.extend({
	template:null,
	initialize:function(query){
    queryString = decodeURIComponent(query).split(" ");
    a="";
    _.each(queryString,function(e){
      a += "(?=.*\\b"+e+"\\b)";
    })
    window.queryString = a;
    Session.set('searchLimit',20);
    try{
      Session.set('homeIdList',HomeId.find({}).fetch()[0].idList);
    }
    catch(e){
      Session.set('homeIdList','');
    }
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(function(position){
        window.here = position;
        Session.set('distanceCenter',window.here.coords);
        console.log(Session.get('distanceCenter'));
      });
    }
    if(Session.get('distanceFilter') == undefined || Session.get('distanceFilter') == '')
      Session.set('distanceFilter',5);
    if(Session.get('priceRange') == undefined)
      Session.set('priceRange', [10,100000]);
    return this.template = Meteor.render(function(){
      return Template.search();
    });
	},
	render:function(){
		this.$el = this.template;
		return this;
	}
});

Deps.autorun(function(){
    Meteor.subscribe('searchQuery',window.queryString,Session.get('searchSub'),Session.get('searchLimit'),Session.get('distanceFilter'),Session.get('distanceCenter'),Session.get('priceRange'));
    Meteor.subscribe('homeProductDetail',Session.get('searchId'));
    Meteor.subscribe('homeId');
});

Template.searchBrand.Brand = function(){
  if(Session.get('homeIdList')=="")
      retBrand = Products.find({"searchIndex": {$regex: new RegExp(window.queryString)}},{fields:{'_id':0,"Brand":1}}).fetch();
    else
      retBrand = Products.find({"_id":{$in:Session.get('homeIdList')},"searchIndex": {$regex: new RegExp(window.queryString)}},{fields:{'_id':0,"Brand":1}}).fetch();
  var tempAr=[];
  _.each(retBrand,function(obj){
    tempAr.push(obj.Brand);
  });
  var arr = _.uniq(tempAr);
  if(arr.length==1)
    return null;
  else
    return arr;
};
/*Template.searchSub.Sub = function(){
  message={
    "search":window.queryString,
    ""

  };

  chatStream.emit('getSubCategories', message);
  
  chatStream.on('gotSubCategories', function(message) {
  });
}*/
Template.searchProducts.ProductArr = function(){
  var withinProducts = [];
  window.shopList = [];
  if(Session.get('distanceCenter') == undefined)
    return;
  Meteor.users.find({'usertype':'shop'},{fields: {'shopLatitude':1,'shopLongitude':1,'productId':1}}).forEach(function(obj){
    if(Session.get('distanceFilter') != undefined){
      if(findDistance(obj.shopLatitude,obj.shopLongitude,Session.get('distanceCenter').latitude,Session.get('distanceCenter').longitude) < Session.get('distanceFilter')){
        window.shopList.push(obj._id);
        withinProducts = _.union(withinProducts,obj.productId);
      }
    }
    else{
      withinProducts = _.union(withinProducts,obj.productId);
    }
  });
    console.log(withinProducts);
    reg = new RegExp(window.queryString,'i');
    console.log(reg);
    dbq = {"_id":{$in: withinProducts},"searchIndex": {$regex: reg}}
    if(!_.isEmpty(Session.get('searchBrand'))){
      dbq.Brand = {$in:Session.get('searchBrand')};
    }
    if(Session.get('searchSub'))
      dbq.Sub = Session.get('searchSub');
    return addLeastPrice(Products.find(dbq).fetch());
}
Template.searchProducts.events = {
  "click div.show-product" : function(e,t){
      e.preventDefault();
      var now = e.currentTarget;
      var id = now.id.split('_');
      Session.set('searchId',id[1]);
      $("#searchModal").css("top",$(now).position().top+250+'px').fadeIn();
      $("#searchProductList").animate({ scrollTop: $(now).position().top+"px" });
  }
};
Template.searchModal.product = function(){
  return Products.find({_id:Session.get('searchId')});
};
Template.searchModalOverview.productOverview = function(){
  return Products.find({_id:Session.get('searchId')},{fields:{overViewList:1,overviewPara:1,feature:1}});
};
Template.searchModalSpec.productSpec = function(){
  return Products.find({_id:Session.get('searchId')},{fields:{spec:1}});
};
Template.searchModalAvailble.shopList = function(){
  returnarr =[];
  Meteor.users.find({"productId":{$all:[Session.get('searchId')]}}).forEach(function(el){
    returnarr.push({
      shopname:el.shopname,
      distance:findDistance(el.shopLatitude,el.shopLongitude,window.here.coords.latitude, window.here.coords.longitude),
      link:'/cv/'+el.username+'/'+Session.get('searchId')
    });
  });
  returnarr.sort(function(a,b) {return (a.distance > b.distance) ? 1 : ((b.distance > a.distance) ? -1 : 0);} );
  return returnarr;
};
Template.searchModal.events = {
  "click a#closeModal":function(e,t){
    e.preventDefault();
    $("#searchModal").fadeOut();
  },
  "click a.shopNav" : function(e,t){
    e.preventDefault();
    App.router.aReplace(e);
  }
};

Template.searchProducts.rendered = function(){
  if(this.rendered==1){
    $("#loadmask").fadeOut('slow');
    Session.set('newProducts',false);
    this.rendered=2;
  }
  if(!this.rendered){
    this.rendered = 1;
    $("#searchProductList").scroll(function() {
      if(!window.loading && $("#searchProductList").scrollTop() + $("#searchProductList").height() > $("#searchProductList .products-list").eq(0).height() - 100) {
        Session.set('newProducts',true);
        Session.set('searchLimit',Session.get('searchLimit')+10);
        window.loading = true;
      }
    });
  }
  if(window.loading)
    window.loading = false;
  $("img.item-image").lazyload({
    effect : "fadeIn",
    container: $("#searchProductList")
  });
};
$(function(){
  $('#searchFilter input').live('change',function(){
    var brandSel = $('#searchFilter input:checkbox:checked').map(function(){
      return $(this).val()
    }).get();
    Session.set('searchBrand',brandSel);
  });
});
function addLeastPrice(x){
  var ret = [];
  console.log(x);
  _.each(x,function(e) {
    // console.log(e._id);
    z = Prices.find({shopId:{$in:window.shopList},productId:e._id,price:{$gt:0}},{fields:{"price":1},sort:{"price":1},limit:1});
    console.log('asdf '+z.count());
    if(z.count()>0){
      e.leastPrice =  z.fetch()[0].price;
      if(Session.get('priceRange') != [] && Session.get('priceRange') != undefined){
        if(!(e.leastPrice < Session.get('priceRange')[0] || e.leastPrice > Session.get('priceRange')[1])){
          ret.push(e);
        }
      }
      else{
        ret.push(e);
      }
    }
  });
  Session.set('currentProducts',ret);
  return ret;
}