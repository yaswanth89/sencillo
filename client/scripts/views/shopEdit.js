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
  Meteor.subscribe('shopProducts',Session.get('shopEditFilters'));
  Meteor.subscribe('shopCategories');
  Meteor.subscribe('productPrices');
});
Template.shopEdit.events={
  "click #editSearchSubmit":function(e){
    e.preventDefault();
    var query = $('#editSearchInput').val().trim();
    if(query == '')
      return;
    var queryString = query.split(" ");
    var a="";
    _.each(queryString,function(e){
      a += "(?=.*\\b"+e+"\\b)";
    });
    Session.set('editSearchQuery',a);
  },
  "click .toggle": function(e){
    console.log('yessssssssssssssss '+e.currentTarget.className);
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
      if($('#display_'+id).attr('class') == 'toggle on') var onDisplay = 1;
      else var onDisplay = 0;
      if($('#featured_'+id).attr('class') == 'toggle on') var featured = 1;
      else var featured = 0;
      if(instock){
        if(!$('#price_'+id).val()){
          $("#price_"+id).addClass('error');
          return;
        }
        var price = Number($("#price_"+id).val().replace(/,/g,''));
        if(price==NaN){
          $("#price_"+id).addClass('error');
          return;
        }
      }
      else{
        price='';
        if(onDisplay || featured){
          $("#price_"+id).addClass('error');
          $("#alerter").html("Product was specified as Not in stock!").fadeIn();
          setTimeout(function(){
            $("#alerter").fadeOut();
          },5000);
          return;
        }
      }
      productSet.push({
        'productId': id,
        'price': price,
        'inStock': instock,
        'onDisplay':onDisplay,
        'Featured':featured
      });
    });
    productSet = _.filter(productSet,function(e){
      var oldData = Prices.findOne({productId:e.productId,shopId:Meteor.userId()},{fields:{"_id":0,"productId":1,"price":1,"inStock":1,"onDisplay":1,"Featured":1}});
      if(!oldData)
        return true;
      else{
        if(oldData.productId != e.productId || oldData.price != e.price || oldData.inStock != e.inStock || oldData.onDisplay != e.onDisplay || oldData.Featured != e.Featured)
          return true;
        else
          return false;
      }
    });
    if(productSet.length != 0)
      Meteor.call('editProducts', productSet,function(e){
        $("#informer").html("The preferences were saved!").fadeIn();
            setTimeout(function(){
              $("#informer").fadeOut();
            },5000);
      });
    else
      displaySuccess("No changes were made");
  }
}
Template.shopEdit.allProducts = function(){
  var allproducts = [];
  var loaded=false;
  Meteor.users.find({username:Meteor.user().username}).forEach(function(loop){
      productList = loop.productId;
      if(productList){
        q={_id:{$in:productList}};
        if(Session.get('editSearchQuery') && Session.get('editSearchQuery') != ''){
          reg = new RegExp(Session.get('editSearchQuery'),'i');
          q.searchIndex = {$regex: reg};
        }else if(Session.get('shopEditFilters')){
          q.Sub = Session.get('shopEditFilters')[0];
          q.Brand = Session.get('shopEditFilters')[1];
        }
        console.log(q);
        Products.find(q,{fields:{'Brand':1,'ProductName':1,'ModelID':1}}).forEach(function(e){
          pricetag = Prices.findOne({productId:e._id,shopId:loop._id});
          if(pricetag)
            allproducts.push({
              "_id":e._id,
              'price': commaNumber(pricetag.price),
              'inStock': pricetag.inStock,
              'onDisplay': pricetag.onDisplay,
              'Brand': e.Brand,
              "ProductName":e.ProductName,
              "ModelID":e.ModelID,
              "Featured":pricetag.Featured
            });
          else
            allproducts.push({
              "_id":e._id,
              'price': '',
              'inStock': 1,
              'onDisplay': 0,
              'Featured':0,
              'Brand': e.Brand,
              "ProductName":e.ProductName,
              "ModelID":e.ModelID
            });
        });
      }
  });
  return allproducts;
};
Template.shopEdit.rendered = function(){
  $('input.edit-price').keyup(function(event){
      if(event.which >= 37 && event.which <= 40){
          event.preventDefault();
          return;
      }
      var num = $(this).val();
      $(this).val(commaNumber(num));
  });
};

Template.shopEditCategories.cat = function(){
  if(Meteor.user())
    if(Brands.find({"shopid":Meteor.user().username}).count() > 0)
      return Brands.find({"shopid":Meteor.user().username});
    else if(Brands.find({"shopid":Meteor.userId()}).count() > 0){
      console.log(Meteor.userId());
      return Brands.find({"shopid":Meteor.userId()});
    }
}
Template.shopEditCategories.events={
  "click .filterLinks":function(e){
    $("#saveChanges").click();
    filters = e.currentTarget.getAttribute('data-filter').split('-');
    console.log(filters);
    setTimeout(function(){
      Session.set('editSearchQuery','');
      Session.set('shopEditFilters',filters);
    },100);
  }
}
