var global = {};
Session.set('searchSearchFilter',{'askfja':'asjkfb'});
window.extending = false;
this.Search = Backbone.View.extend({
	template:null,
	initialize:function(query){
      window.query = decodeURI(query);
      return this.template = Meteor.render(function(){
        return Template.search();
      });
	},
	render:function(){
		this.$el = this.template;
		return this;
	}
});
Template.searchBrand.BrandArr = function(){
  return Session.get("searchUniqueBrand");
};
Template.searchBrand.events = {
  "change .brand" : function(){
    var newsearch = Session.get('searchSearchFilter');
    var brand = new Array;
    $('.brand').each(function(){ if($(this).is(':checked')) brand.push($(this).val()); });
    newsearch.Brand = {$in: brand};
    Session.set('searchSearchFilter', newsearch);
  }
};
  Template.searchProducts.ProductArr = function(){
    var filter = Session.get("searchSearchFilter");
    var Brandfilter = filter.Brand;
    var Subfilter = filter.Sub;
    if (Brandfilter != undefined && Brandfilter.$in.length == 0)
      Brandfilter = undefined;
    if (Subfilter != undefined && Subfilter.length == 0)
      Subfilter = undefined;
    if(!window.extending){
      Meteor.call('searchProducts',window.query, function(error, result){
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
          disProducts.forEach(function(rec){
            if(count%3 == 0) rec.br = true;
            else rec.br = false;  
            if(subCat.indexOf(rec.Sub) < 0){
              subCat.push(rec.Sub);
              subCatEJSON.push({Name:rec.Sub});
            }
            if(brand.indexOf(rec.Brand)<0){
              brand.push(rec.Brand);
              brandEJSON.push({Name:rec.Brand});
            }
            count++;
          });
          Session.set('searchUniqueBrand',brandEJSON);
          Session.set('searchUniqueSubCat',subCatEJSON);
          Session.set('searchfinalProducts',disProducts);
          Session.set('searchlimitProducts',_.chain(disProducts).first(10).value());
        }
      });
    }
    window.extending = false;
    return Session.get("searchlimitProducts");
  }
  Template.searchProducts.events = {
  "click a.searchProductView" : function(e,t){
      Session.set("toggle",this._id);
      console.log(Session.get("toggle"));
      e.preventDefault();
      var now = e.currentTarget;
      var id = now.id.split('_');
      Session.set('curSearchProduct',_.findWhere(Session.get('searchlimitProducts'), {"_id":id[1]}));
    }
}
Template.searchModal.product = function(){
  return Session.get('curSearchProduct');
}
Template.searchModal.events = {
  "click a.shopNav" : function(e,t){
    e.preventDefault();
    App.router.aReplace(e);
  }
}
function autoResizeDiv()
  {
      document.getElementById('body').style.height = window.innerHeight +'px';
      console.log("resized");

  }
window.onresize = autoResizeDiv;


$(document).ready(function(){
  autoResizeDiv();
  
});
Template.searchProducts.rendered = function(){
  $("#productList").scroll(function() {
    if($("#productList").scrollTop() + $("#productList").height() > $("#productList .products-list").eq(0).height() - 100) {
      var oldSize = _.size(Session.get('searchlimitProducts'));
      var totalSize = _.size(Session.get('searchfinalProducts'));
      if(oldSize==totalSize)
        return;
      var newSize = parseInt(oldSize / 10 + 1)*10;
      window.extending = true;
      Session.set('searchlimitProducts',_.chain(Session.get('searchfinalProducts')).first(newSize).value());
    }
  });
}