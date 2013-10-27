var global = {};
Session.set('homeSearchFilter',{'askfja':'asjkfb'});
this.Home = Backbone.View.extend({
	template:null,
	initialize:function(page){
    if(page==undefined){
      Session.set("homeSearchFilter",{});
      return this.template = Meteor.render(function(){
      return Template.home();
		});
    }
    else
    {
      var subCat="";
      _.each(page,function(val){
        if(val=="_")
          subCat+=" ";
        else
          subCat+=val;
      });
      Session.set("homeSearchFilter",{Sub:subCat});
      return this.template = Meteor.render(function(){
      return Template.home();
    });
    }
	},

	render:function(){
		this.$el = this.template;
		return this;
	}
});

Template.homeBrand.BrandArr = function(){
  return Session.get("homeUniqueBrand");
};

Template.homeBrand.events = {
  "change .brand" : function(){
    var newsearch = Session.get('homeSearchFilter');
    var brand = new Array;
    $('.brand').each(function(){ if($(this).is(':checked')) brand.push($(this).val()); });
    newsearch.Brand = {$in: brand};
    Session.set('homeSearchFilter', newsearch);
  }
};
  

  Template.homeProducts.ProductArr = function(){
    var filter = Session.get("homeSearchFilter");
    var Brandfilter = filter.Brand;
    var Subfilter = filter.Sub;
    if (Brandfilter != undefined && Brandfilter.$in.length == 0)
      Brandfilter = undefined;
    if (Subfilter != undefined && Subfilter.length == 0)
      Subfilter = undefined;
    Meteor.call('getMainAvailableProducts',filter.Sub, function(error, result){
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
        Session.set('homeUniqueBrand',brandEJSON);
        Session.set('homeUniqueSubCat',subCatEJSON);
        Session.set('homefinalProducts',disProducts);
      }
    });
    return Session.get("homefinalProducts");
  }
  Template.homeProducts.events = {
  "click a.homeProductView" : function(e,t){
      Session.set("toggle",this._id);
      console.log(Session.get("toggle"));
      e.preventDefault();
      var now = e.currentTarget;
      var id = now.id.split('_');
      Session.set('curHomeProduct',_.findWhere(Session.get('homefinalProducts'), {"_id":id[1]}));
  }
}
Template.homeModal.product = function(){
  return Session.get('curHomeProduct');
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

