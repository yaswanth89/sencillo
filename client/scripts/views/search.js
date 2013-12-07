this.Search = Backbone.View.extend({
	template:null,
	initialize:function(query){
    queryString = decodeURIComponent(query).replace(/ /g,"|");
    window.queryString = new RegExp("\\b("+queryString+")\\b",'i');
    Session.setDefault('searchLimit',20);
    try{
      Session.set('homeIdList',HomeId.find({}).fetch()[0].idList);
    }
    catch(e){
      Session.set('homeIdList','');
    }
    return this.template = Meteor.render(function(){
      return Template.search();
    });
	},
	render:function(){
		this.$el = this.template;
		return this;
	}
});
Deps.autorun(function(){
    Meteor.subscribe('searchQuery',window.queryString,Session.get('searchLimit'));
    Meteor.subscribe('homeProductDetail',Session.get('searchId'));
    Meteor.subscribe('homeId');
});

Template.searchBrand.Brand = function(){
  if(Session.get('homeIdList')=="")
      retBrand = Products.find({"searchIndex": {$regex: window.queryString}},{fields:{'_id':0,"Brand":1}}).fetch();
    else
      retBrand = Products.find({"_id":{$in:Session.get('homeIdList')},"searchIndex": {$regex: window.queryString}},{fields:{'_id':0,"Brand":1}}).fetch();
  var tempAr=[];
  _.each(retBrand,function(obj){
    tempAr.push(obj.Brand);
  });
  return _.uniq(tempAr);
};


Template.searchProducts.ProductArr = function(){
  if(_.isEmpty(Session.get('searchBrand'))){
    if(Session.get('homeIdList')=="")
      return Products.find({"searchIndex": {$regex: window.queryString}},{reactive:Session.get('newProducts')});
    else
      return Products.find({"_id":{$in:Session.get('homeIdList')},"searchIndex": {$regex: window.queryString}},{reactive:Session.get('newProducts')});
  }
  else{
    if(Session.get('homeIdList')=="")
      return Products.find({"searchIndex": {$regex: window.queryString},'Brand':{$in:Session.get('searchBrand')}},{reactive:Session.get('newProducts')});
    else
      return Products.find({"_id":{$in:Session.get('homeIdList')},"searchIndex": {$regex: window.queryString},'Brand':{$in:Session.get('searchBrand')}},{reactive:Session.get('newProducts')});
  }
};
Template.searchProducts.events = {
  "click div.show-product" : function(e,t){
      e.preventDefault();
      var now = e.currentTarget;
      var id = now.id.split('_');
      Session.set('searchId',id[1]);
      $("#searchModal").css("top",$(now).position().top+250+'px').fadeIn();
      $("#searchProductList").animate({ scrollTop: $(now).position().top+"px" });
  }
  }
Template.searchModal.product = function(){
  return Products.find({_id:Session.get('searchId')});
};
Template.searchModalOverview.productOverview = function(){
  return Products.find({_id:Session.get('searchId')},{fields:{overViewList:1,overviewPara:1,feature:1}});
};
Template.searchModalSpec.productSpec = function(){
  return Products.find({_id:Session.get('searchId')},{fields:{spec:1}});
};
Template.searchModalAvailble.shopList = function(){
  returnarr =[];
  Meteor.users.find({"productId":{$all:[Session.get('searchId')]}}).forEach(function(el){
    returnarr.push({
      shopname:el.shopname,
      distance:findDistance(el.shopLatitude,el.shopLongitude,window.here.coords.latitude, window.here.coords.longitude),
      link:'/cv/'+el.username+'/'+Session.get('searchId')
    });
  });
  returnarr.sort(function(a,b) {return (a.distance > b.distance) ? 1 : ((b.distance > a.distance) ? -1 : 0);} );
  return returnarr;
}
Template.searchModal.events = {
  "click a#closeModal":function(e,t){
    e.preventDefault();
    $("#searchModal").fadeOut();
  },
  "click a.shopNav" : function(e,t){
    e.preventDefault();
    App.router.aReplace(e);
  }
}

Template.searchProducts.rendered = function(){
  if(this.rendered==1){
    $("#loadmask").fadeOut('slow');
    Session.set('newProducts',false);
    this.rendered=2;
  }
  if(!this.rendered){
    this.rendered = 1;
    $("#searchProductList").scroll(function() {
      if(!window.loading && $("#searchProductList").scrollTop() + $("#searchProductList").height() > $("#searchProductList .products-list").eq(0).height() - 100) {
        Session.set('newProducts',true);
        Session.set('searchLimit',Session.get('searchLimit')+10);
        window.loading = true;
      }
    });
  }
  if(window.loading)
    window.loading = false;
  $("img.item-image").lazyload({
    effect : "fadeIn",
    container: $("#searchProductList")
  });
};
$(function(){
  $('#searchFilter input').live('change',function(){
    var brandSel = $('#searchFilter input:checkbox:checked').map(function(){
      return $(this).val()
    }).get();
    Session.set('searchBrand',brandSel);
  });
});