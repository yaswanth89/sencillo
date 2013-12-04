var global = {};
if(navigator.geolocation){
  navigator.geolocation.getCurrentPosition(function(position){
    window.here = position;
  });
}
window.extending = false;
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
    Session.set("homeSub",subCat);
    Session.set("homeBrand",[]);
    Session.set("homeId",'');
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
    Meteor.subscribe('homeId');
});

Template.homeBrand.Brand = function(){
  if(Session.get('homeIdList')=="")
      retBrand = Products.find({},{fields:{'_id':0,"Brand":1}}).fetch();
    else
      retBrand = Products.find({"_id":{$in:Session.get('homeIdList')}},{fields:{'_id':0,"Brand":1}}).fetch();
  var tempAr=[];
  _.each(retBrand,function(obj){
    tempAr.push(obj.Brand);
  });
  return _.uniq(tempAr);
};


Template.homeProducts.ProductArr = function(){
  if(_.isEmpty(Session.get('homeBrand'))){
    if(Session.get('homeIdList')=="")
      return Products.find({"Sub":Session.get('homeSub')});
    else
      return Products.find({"_id":{$in:Session.get('homeIdList')},"Sub":Session.get('homeSub')});
  }
  else{
    if(Session.get('homeIdList')=="")
      return Products.find({"Sub":Session.get('homeSub'),'Brand':{$in:Session.get('homeBrand')}});
    else
      return Products.find({"_id":{$in:Session.get('homeIdList')},"Sub":Session.get('homeSub'),'Brand':{$in:Session.get('homeBrand')}});
  }
};
Template.homeProducts.events = {
  "click div.show-product" : function(e,t){
      e.preventDefault();
      var now = e.currentTarget;
      var id = now.id.split('_');
      Session.set('homeId',id[1]);
      $("#homeModal").css("top",$(now).position().top+250+'px').fadeIn();
      $("#productList").animate({ scrollTop: $(now).position().top+"px" });
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
  Meteor.users.find({"productId":{$elemMatch:Session.get('homeId')}}).forEach(function(el){
    returnarr.push({
      shopname:el.shopname,
      distance:findDistance(el.shopLatitude,el.shopLongitude,window.here.coords.latitude, window.here.coords.longitude)
    });
  });
  returnarr.sort(function(a,b) {return (a.distance > b.distance) ? 1 : ((b.distance > a.distance) ? -1 : 0);} );
  return returnarr;
}
Template.homeModal.events = {
  "click a#closeModal":function(e,t){
    e.preventDefault();
    $("#homeModal").fadeOut();
  },
  "click a.shopNav" : function(e,t){
    e.preventDefault();
    App.router.aReplace(e);
  }
}

Template.homeProducts.rendered = function(){
  $("#productList").scroll(function() {
    if($("#productList").scrollTop() + $("#productList").height() > $("#productList .products-list").eq(0).height() - 100) {
      var oldSize = _.size(Session.get('homelimitProducts'));
      var totalSize = _.size(Session.get('homefinalProducts'));
      if(oldSize==totalSize)
        return;
      var newSize = parseInt(oldSize / 10 + 1)*10;
      window.extending = true;
      Session.set('homelimitProducts',_.chain(Session.get('homefinalProducts')).first(newSize).value());
    }
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
/*
Template.homeView.destroyed = function(){
  homeProductListSub.stop();
  homeProductDetailSub.stop();
  console.log("Home Destroyed");
}
*/