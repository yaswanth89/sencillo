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

    return this.template = Meteor.render(function(){
    return Template.home();
      });
	},
	render:function(){
		this.$el = this.template;
		return this;
	}
});


var prod_inc = 20;
Session.set('homeLimit',prod_inc);
Deps.autorun(function(){
  Meteor.subscribe('homeProductList',Session.get('homeSub'),Session.get('homeLimit'));
  Meteor.subscribe('homeProductDetail',Session.get('homeId'));

});


Template.homeBrand.Brand = function(){
  var retBrand = Products.find({},{fields:{'_id':0,"Brand":1}}).fetch();
  var tempAr=[];
  _.each(retBrand,function(obj){
    tempAr.push(obj.Brand);
  });
  return _.uniq(tempAr);
};


Template.homeProducts.ProductArr = function(){

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
      
      /*result = findDistance(window.here.coords.latitude,window.here.coords.longitude,curProduct.shopList[0].shoplat,curProduct.shopList[0].shoplng);
      curProduct.shopList[0].distance = (Math.round(result*100)/100);*/
      
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
Template.homeModal.events = {
  "click a.shopNav" : function(e,t){
    e.preventDefault();
    App.router.aReplace(e);
  }
}


$(function(){
  $('#homeFilter input').live('change',function(){
    var brandSel = $('#homeFilter input:checkbox:checked').map(function(){
      return $(this).val()
    }).get();
    Session.set('homeBrand',brandSel);
  });
});
