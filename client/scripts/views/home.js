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
    Session.set("homeSub",subCat);
    Session.set("homeBrand",[]);
    Session.set("homeId",'');
    /*
    HomeId.find({}).forEach(function(loop){
      Session.set('homeIdList',loop.idList);
    });
    */
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
  //Meteor.subscribe('homeProductDetail',Session.get('homeId'));
});

Template.homeBrand.Brand = function(){
  //return Products.find({},{fields:{_id:0,Brand:1}}).fetch();
  var retBrand = Products.find({},{fields:{'_id':0,"Brand":1}}).fetch();
  var tempAr=[];
  _.each(retBrand,function(obj){
    tempAr.push(obj.Brand);
  });
  return _.uniq(tempAr);
};


Template.homeProducts.ProductArr = function(){
  //return homeProductList(Session.get('homeIdList'),Session.get('homeSub'),Session.get('homeBrand'),Session.get('homeLimit'));
  if(_.isEmpty(Session.get('homeBrand')))
    return Products.find({});
  else
    return Products.find({'Brand':{$in:Session.get('homeBrand')}});
  
};
  Template.homeProducts.events = {
  "click div.show-product" : function(e,t){
      e.preventDefault();
      var now = e.currentTarget;
      var id = now.id.split('_');
      Session.set('homeId',id[1]);
      var curProduct = Products.find()
      /*result = findDistance(window.here.coords.latitude,window.here.coords.longitude,curProduct.shopList[0].shoplat,curProduct.shopList[0].shoplng);
      curProduct.shopList[0].distance = (Math.round(result*100)/100);*/
      Session.set('curHomeProduct', curProduct);
      }
  }
Template.homeModal.product = function(){
  return Session.get('curHomeProduct');
}
Template.homeModal.events = {
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