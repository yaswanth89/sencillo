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
var global = {};
Session.set('searchFilter',{});
Template.MainCat.MainCatArr = function(){
    return FrameDetail.find({});
};
  Template.MainCat.events = {
   "change #mainCat" : function(){
      var main = $('select#mainCat').val();
      if(main!="select"){
        Session.set("searchFilter",{Main: main});
      }
      else{
        Session.set("searchFilter",{});
        $("#subCat").prop('disabled', true).val('select');
      }
    }
  };

  Template.SubCat.SubCatArr = function(){
    return Session.get('UniqueSubCat');
  };
  Template.Brand.BrandArr = function(){
    return Session.get("UniqueBrand");
  };

  Template.SubCat.events = {
    "change #subCat" : function(){
      var newsearch = Session.get('searchFilter');
      var sub = $('select#subCat').val();
      if(sub!="select")
        newsearch.Sub = sub;
      else
        newsearch.Sub = undefined;
      Session.set('searchFilter', newsearch);
    }
  };
  Template.Brand.events = {
    "change .brand" : function(){
      var newsearch = Session.get('searchFilter');
      var brand = new Array;
      $('.brand').each(function(){ if($(this).is(':checked')) brand.push($(this).val()); });
      newsearch.Brand = {$in: brand};
      Session.set('searchFilter', newsearch);
    }
  };
  Template.Products.ProductArr = function(){
    var filter = Session.get("searchFilter");
    if(filter.Main!=undefined){
        $("#subCat").prop('disabled', false);
    }
    var Brandfilter = filter.Brand;
    var Subfilter = filter.Sub;
    if (Brandfilter != undefined && Brandfilter.$in.length == 0)
      Brandfilter = undefined;
    if (Subfilter != undefined && Subfilter.length == 0)
      Subfilter = undefined;
    Meteor.call('getMainProducts',filter.Main, function(error, result){
      if(result!=undefined){
        var productscopy = result;
        var disProducts = _.filter(productscopy,function(rec){
          var sub = false; var brand = false;
          if(Subfilter!=undefined){
            if(Subfilter == rec.Sub){
              sub =true;
            }
          }
          else
            sub=true;
          if(Brandfilter != undefined){
            if(Brandfilter.$in.indexOf(rec.Brand)>-1){
              brand = true;
            }
          }
          else
            brand = true;
          return sub && brand;
        });
        var subCat = new Array();
        var brand = new Array();
        var finalProducts = new Array();
        var brandEJSON = [];
        var subCatEJSON = [];
        var count = 1;
        var ids = [];
        Meteor.call('readProducts', function(error, result){
          var existed = _.pluck(result, '_id');
          var filtered = _.difference(disProducts, _.filter(disProducts, function(prod){
            return _.contains(existed, prod._id);
          }));
          filtered.forEach(function(rec){
            if(count%3 == 0) rec.br = true;
            else rec.br = false;
            finalProducts.push(rec);
            count++;
          });

          finalProducts.forEach(function(rec){
            if(subCat.indexOf(rec.Sub) < 0){
              subCat.push(rec.Sub);
              subCatEJSON.push({Name:rec.Sub});
            }
            if(brand.indexOf(rec.Brand)<0){
              brand.push(rec.Brand);
              brandEJSON.push({Name:rec.Brand});
            }
          });
          Session.set('UniqueBrand',brandEJSON);
          Session.set('UniqueSubCat',subCatEJSON);
          Session.set('finalProducts',finalProducts);
        });
      }
    });
      return Session.get("finalProducts");
    }
  var animated=false;
  Template.Products.events = {
   "click .addProduct" : function(e, t){
      var now = e.currentTarget;
      var id = now.id;
      Meteor.call('addProduct', id, function(error){ if(error) alert(error); else $('div#product_'+id).fadeOut(); });
    },
  };