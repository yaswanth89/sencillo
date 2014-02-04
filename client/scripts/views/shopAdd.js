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
  Meteor.call("getBrands",{Sub:Session.get("subForBrand")},false,function(e,r){
    Session.set('brandList',r);
  });
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
      return Products.find({_id:{$nin:productList},'Sub':Session.get('subForBrand')},{sort:{'ModelID':1}});
    }
    else{
      console.log("Brand present");
      return Products.find({_id:{$nin:productList},'Sub':Session.get('subForBrand'),'Brand':{$in:Session.get('shopAddBrand')}}, {sort: {'ModelID':1}});
    }
  }
  else{
    if(_.isEmpty(Session.get('shopAddBrand'))){
      console.log("Brand empty");
      return Products.find({'Sub':Session.get('subForBrand')},{sort:{'ModelID':1}});
    }
    else{
      console.log("Brand present");
      return Products.find({'Sub':Session.get('subForBrand'),'Brand':{$in:Session.get('shopAddBrand')}}, {sort: {'ModelID':1}});
    }
  }
};
Template.shopAddProducts.selectedArr = function(){
  return addSelected.find({},{sort: {_id: -1}});
};
Template.shopAddProducts.rendered = function (argument) {
  if(!this.rendered)
    $("#productsWrap").scroll(function() {
        if(!window.loading && $("#shopAddProducts").scrollTop() + $("#shopAddProducts").height() > $("#productsWrap").height() - 200) {
          console.log("loading...");
          $('#showMoreResults').html('loading....');
          Session.set('itemsLimit',Session.get('itemsLimit')+20);
          window.loading = true;
        }
    });
  if(window.loading){
    console.log("load More");
    $('#showMoreResults').html('load More');
    window.loading = false;
  }
};
$(function(){
  $('li#shopAddSub').live('click',function(e){
    e.preventDefault();
    Session.set('itemsLimit',ITEMS_INCREMENT);
    Session.set('shopAddBrand',[]);
    Session.set('subForBrand',$(this).text());
    
  });
  $('.removeFromList').live('click',function(e){
    e.preventDefault();
    /*var a = Session.get('selectedAddProds');
    a.splice(a.indexOf($(this).attr('id').split('_')[1]),1);
    Session.set('selectedAddProds',a);*/
    var prod = $(this).attr('id').split('_')[1];
    addSelected.remove({'productId': prod});
    $('#product_'+prod).fadeIn();
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
  /*$('.addToList').live('click',function(e,t){
    var now = e.currentTarget;
    var id = now.id;
    if(!window.productList)
      window.productList = [id];
    else
      window.productList.push(id);
  });
  $('.removeFromList').live('click',function(e,t){
    var now = e.currentTarget;
    var id = now.id;
    var i = window.productList.indexOf(id);
    if(i != -1)
      window.productList.splice(i,1);
  });*/
  $('#addSelected').live('click',function(e,t){
    var selected = [];
    /*$('.productCheck:checked').each(function(){ 
      selected.push($(this).attr('id').split('_')[1]); 
    });*/
    $('.listSelected ul li').each(function(){
      selected.push($(this).attr('id'));
    });
    Meteor.call('addMultipleProducts', selected, function(error){
      if(error)
        displayError(error);
      else{
        /*'.productCheck:checked').each(function(){ 
          $(this).parent().fadeOut();
        });*/
        addSelected.remove({});
        displaySuccess('Selected items have been added to your shop!');
      }
    });
  });
  $('.accordion-heading').live('click',function(e,t){
    var tar = $(this).find('h4').attr('data-target');
    $('.collapse').each(function(){
      console.log($(this).attr('id')+'       '+tar.substring(1));
      if($(this).attr('id') != tar.substring(1)){
        $(this).removeClass('in'); 
        $(this).css('height','0px');
      }
    });
  });
  $('.addProduct').live('click',function(e,t){
    var now = e.currentTarget;
    var id=now.id;
    /*if(Session.get('selectedAddProds') != undefined){
      var a = Session.get('selectedAddProds');
      a.push(id);
      Session.set('selectedAddProds',a);
    }else{
      var a = [id];
      Session.set('selectedAddProds',a);
    }*/
    var prod = Products.findOne({_id: id});
    addSelected.insert({'productId':id, 'ModelID': prod.ModelID, 'ProductName': prod.ProductName, 'Brand': prod.Brand});
    $('#product_'+id).fadeOut();
  });
});
/*
Template.shopAdd.destroyed = function(){
  shopAddSub.stop();
  console.log("shopAdd destroyed");
}
*/