this.ShopAdd = Backbone.View.extend({
  template:null,
  initialize:function(page){
    Session.set('subForBrand','TV');
    Session.set('shopAddBrand',[]);
    try{
      Session.set('shopIdList',Meteor.users.find({"_id":Meteor.userId()}).fetch()[0].idList);
    }
    catch(e){
      Session.set('shopIdList','');
    }
    this.template = Meteor.render(function(){
      return Template.shopAdd();
    });
  },
  render:function(){
    this.$el = this.template;
    return this;
  }
});
var ITEMS_INCREMENT = 20;
Session.setDefault('itemsLimit', ITEMS_INCREMENT);
Deps.autorun(function(){
  Meteor.subscribe('shopAddProducts',Session.get('subForBrand'),Session.get('shopAddBrand'),Session.get('itemsLimit'));
});

Template.shopAddFilter.MainCatArr = function(){
    return FrameDetail.find({});
};

Template.shopAddFilter.Brand=function(){
  if(_.isEmpty(Session.get('shopAddBrand'))){
    var retBrand = Products.find({"Sub":Session.get('subForBrand')},{fields:{'_id':0,"Brand":1}}).fetch();
    var tempAr=[];
    _.each(retBrand,function(obj){
      tempAr.push(obj.Brand);
    });
    Session.set('brandList',_.uniq(tempAr))
    return _.uniq(tempAr);
  }
  return Session.get('brandList');
};
/*

*/
Template.shopAddProducts.ProductArr = function(){
  var productList = [];
  Meteor.users.find({_id:Meteor.userId()}).forEach(function(loop){
    productList = loop.productId;
  }); 
  if(!_.isEmpty(productList))
  {
    console.log("not Empty");
    if(_.isEmpty(Session.get('shopAddBrand'))){
      console.log("Brand empty");
      return Products.find({_id:{$nin:productList},'Sub':Session.get('subForBrand')});
    }
    else{
      console.log("Brand present");
      return Products.find({_id:{$nin:productList},'Sub':Session.get('subForBrand'),'Brand':{$in:Session.get('shopAddBrand')}});
    }
  }
  else{
    console.log("empty");
    return [];
  }
};

$(function(){
  $('li#shopAddSub').live('click',function(e){
    e.preventDefault();
    Session.set('itemsLimit',ITEMS_INCREMENT);
    Session.set('shopAddBrand',[]);
    Session.set('subForBrand',$(this).text());
    
  });
  $('#showMoreResults').live('click',function(e){
    e.preventDefault();
    Session.set('itemsLimit',Session.get('itemsLimit')+ITEMS_INCREMENT);
  });
  $('#shopAddBrandSelect input').live('change',function(){
    var brandSel = $('#shopAddBrandSelect input:checkbox:checked').map(function(){
      return $(this).val()
    }).get();
    Session.set('shopAddBrand',brandSel);
  });
  $('.addProduct').live('click',function(e,t){
    var now = e.currentTarget;
    var id=now.id;
    Meteor.call('addProduct', id, function(error){ if(error) alert(error); else $('div#product_'+id).fadeOut(); });
  });
});
/*
Template.shopAdd.destroyed = function(){
  shopAddSub.stop();
  console.log("shopAdd destroyed");
}
*/