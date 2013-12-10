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
Deps.autorun(function(){
  Meteor.subscribe('shopProducts');
  Meteor.subscribe('productPrices');
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
      if(instock){
        if(!$('#price_'+id).val()){
          $("#price_"+id).addClass('error');
          return;
        }
        var price = Number($("#price_"+id).val())
        if(price==NaN){
          $("#price_"+id).addClass('error');
          return;
        }
      }
      else
        price='';
      if($('#display_'+id).attr('class') == 'toggle on') var onDisplay = 1;
      else var onDisplay = 0;
      productSet.push({
        'productId': id,
        'price': price,
        'inStock': instock,
        'onDisplay':onDisplay
      });
    });
    Meteor.call('editProducts', productSet);
  }
}
Template.shopEdit.allProducts = function(){
  var allproducts = [];
  var loaded=false;
  Meteor.users.find({username:Meteor.user().username}).forEach(function(loop){
      productList = loop.productId;
      if(productList){
        Products.find({_id:{$in:productList}},{fields:{'Brand':1,'ProductName':1,'ModelID':1}}).forEach(function(e){
          pricetag = Prices.findOne({productId:e._id});
          if(pricetag)
            allproducts.push({
              "_id":e._id,
              'price': pricetag.price,
              'inStock': pricetag.inStock,
              'onDisplay': pricetag.onDisplay,
              'Brand': e.Brand,
              "ProductName":e.ProductName,
              "ModelID":e.ModelID
            });
          else
            allproducts.push({
              "_id":e._id,
              'price': '',
              'inStock': 0,
              'onDisplay': 0,
              'Brand': e.Brand,
              "ProductName":e.ProductName,
              "ModelID":e.ModelID
            });
        });
      }
  });
  return allproducts;
};
