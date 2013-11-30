this.ShopAdd = Backbone.View.extend({
  template:null,
  initialize:function(page){
    
    this.template = Meteor.render(function(){
      return Template.shopAdd();
    });
  },
  render:function(){
    this.$el = this.template;
    return this;
  }
});

Session.set('subForBrand','TV');
Session.set('shopAddBrand',[]);
Session.set('idInShop',[]);

Template.shopAddFilter.MainCatArr = function(){
    return FrameDetail.find({});
};

Template.shopAddFilter.Brand=function(){
  var retBrand = Products.find({"Sub":Session.get('subForBrand')},{fields:{'_id':0,"Brand":1}}).fetch();
  var tempAr=[];
  _.each(retBrand,function(obj){
    tempAr.push(obj.Brand);
  });
  return _.uniq(tempAr);

};
var ITEMS_INCREMENT = 20;
  Session.setDefault('itemsLimit', ITEMS_INCREMENT);
Deps.autorun(function(){
  Meteor.subscribe('shopAddProducts',Session.get('subForBrand'),Session.get('shopAddBrand'),Session.get('idInShop'),Session.get('itemsLimit'));
  Meteor.subscribe('getProductInShop',Meteor.userId());
});

Template.Products.ProductArr = function(){
  
  Session.set('idInShop',getProductInShop(Meteor.userId()));
  return shopAddProducts(Session.get('subForBrand'),Session.get('shopAddBrand'),Session.get('idInShop'),Session.get('itemsLimit'));
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
