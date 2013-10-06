this.ShopEdit = Backbone.View.extend({
  template:null,
  initialize:function(page){
    this.template = Meteor.render(function(){
      return Template.shopEdit();
    });
  },
  render:function(){
    this.$el = this.template;
    return this;
  }
});
Template.shopEdit.events={
  "click .toggle" : function(e){
    if(e.currentTarget.className.indexOf('on')>-1)
      e.currentTarget.className = "toggle off";
    else if(e.currentTarget.className.indexOf('off')>-1)
      e.currentTarget.className = "toggle on";
  },
  "click #saveChanges" : function(e){
    e.preventDefault();
    var productSet = [];
    $('.productId').each(function(){
      var id = $(this).val();
      console.log(id);
      if($('#stock_'+id).attr('class') == 'toggle on') var instock = 1;
      else var instock = 0;
      productSet.push({'_id': id,'brand': $('#brand_'+id).val() ,'price': $('#price_'+id).val(), 'inStock': instock, 'discount': ''});
    });
    console.log(productSet);
    Meteor.call('editProducts', productSet);
  }
}
Template.shopEdit.allProducts = function(){
  var allproducts = [];
  var loaded=false;
  Meteor.call('readProducts',Meteor.user().username,function(error, result){
    for (var i = result.length - 1; i >= 0; i--){
        Meteor.call('findProductById',result[i],function(err,productDoc){
          if(productDoc!=undefined){
              productDoc.inStock = productDoc.shop.inStock;
              productDoc.price = productDoc.shop.price;
              productDoc.discount = productDoc.shop.discount;
              productDoc.shop = null;
              allproducts.push(productDoc);
              if(allproducts.length == result.length){
                Session.set('allproducts',allproducts);
              }
          }
        });
      }
    });
  return Session.get('allproducts');
};
