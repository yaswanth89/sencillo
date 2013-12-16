this.Home = Backbone.View.extend({
	template:null,
	initialize:function(page){
    var subCat="";
    _.each(page,function(val){
      if(val=="_")
        subCat+=" ";
      else
        subCat+=val;
    });
    if(localStorage.sencilloLat){
      Session.set('homeDistanceCenter', {
        'name': localStorage.sencilloPlaceName,
        'latitude': localStorage.sencilloLat,
        'longitude': localStorage.sencilloLng
      });
    }
    else{
        $('#myModal').modal("show");
        var center = new google.maps.places.Autocomplete(document.getElementById('defaultDistanceCenter'));
        console.log('crossed');
        center.setComponentRestrictions({country: 'IN'});
        center.setTypes(['(regions)']);
        google.maps.event.addListener(center, 'place_changed', function(){
              var place = center.getPlace();
              console.log(place);
              if(!place.geometry)
                return;
              localStorage.sencilloLat = place.geometry.location.lat();
              localStorage.sencilloLng = place.geometry.location.lng();
              localStorage.sencilloPlaceName = place.address_components[0].short_name+','+place.address_components[1].short_name+','+place.address_components[2].short_name;
              Session.set('homeDistanceCenter', {'name': place.address_components[0].short_name+','+place.address_components[1].short_name+','+place.address_components[2].short_name,'latitude': place.geometry.location.lat(),'longitude': place.geometry.location.lng()});
            $("#myModal").modal("hide");
          });
          $("#detectGeo").click(function(){
            $(this).attr('disabled', '');
            $(this).html('Give permission');
            if (navigator.geolocation){
              $("defaultDistanceCenter").attr('disabled', '');
              $(this).html('Detecting');
              $(this).prepend(' <i class="fa fa-refresh fa-spin"></i> ');
                navigator.geolocation.getCurrentPosition(function(pos){
                  localStorage.sencilloLat = pos.coords.latitude;
                  localStorage.sencilloLng = pos.coords.longitude;
                  $.get("http://maps.googleapis.com/maps/api/geocode/json?latlng="+localStorage.sencilloLat+","+localStorage.sencilloLng+"&sensor=false",function(data){
                    localStorage.sencilloPlaceName = data.results[0].address_components[0].short_name+','+data.results[0].address_components[1].short_name+','+data.results[0].address_components[2].short_name;
                    Session.set('homeDistanceCenter', {
                      'name': localStorage.sencilloPlaceName,
                        'latitude': localStorage.sencilloLat,
                        'longitude': localStorage.sencilloLng
                    });
                  $("#myModal").modal("hide");
                });
                });
            }
            else{
              alert("Geolocation is not supported by this browser. Please Manually enter a location");
            }
          });
    }
    try{
      Session.set('homeIdList',HomeId.find({}).fetch()[0].idList);
    }
    catch(e){
      Session.set('homeIdList','');
    }
    Session.set('setPriceMinMax',true);
    console.log('initializing........');
    Session.set('newProducts',true);
    Session.set("homeSub",subCat);
    Session.set("homeBrand",[]);
    if(window.homeProductId != undefined)
      Session.set("homeId",window.homeProductId);
    else
      Session.set('homeId','');
    var prod_inc = 20;
    if(Session.get('distanceFilter') == undefined || Session.get('distanceFilter') == '')
      Session.set('distanceFilter',5);
    if(Session.get('priceRange') == undefined)
      Session.set('priceRange', []);
    Session.set('homeLimit',prod_inc);

    return this.template = Meteor.render(function(){
      return Template.home();
    });
	},
	render:function(){
		this.$el = this.template;
		return this;
	}
});
Deps.autorun(function(){
    Meteor.subscribe('homeProductList',Session.get('homeSub'),Session.get('homeLimit'),Session.get('distanceFilter'),Session.get('homeDistanceCenter'),Session.get('priceRange'));
    Meteor.subscribe('homeProductDetail',Session.get('homeId'));
    Meteor.subscribe('homePrices',Session.get('homeId'));
    Meteor.subscribe('homeId');
    Meteor.subscribe('homeBrand', Session.get('homeSub'));
});

Template.homeView.centerSet = function(){
  if(Session.get('homeDistanceCenter') != undefined)
    return Session.get('homeDistanceCenter').name;
  else
    return false;
};

Template.homeBrand.Brand = function(){
  try{
    return Brands.findOne({"view":"home","Sub":Session.get('homeSub')}).list;
  }
  catch(e){
    return null;
  }
};


Template.homeProducts.ProductArr = function(){
  if(!this.rendered){
    window.setPriceMinMax = 1;
    this.rendered = 1;
  }
  var withinProducts = [];
  window.shopList = [];
  if(Session.get('homeDistanceCenter') == undefined)
    return;
  Meteor.users.find({'usertype':'shop'},{fields: {'shopLatitude':1,'shopLongitude':1,'productId':1}}).forEach(function(obj){
    if(Session.get('distanceFilter') != undefined){
      if(findDistance(obj.shopLatitude,obj.shopLongitude,Session.get('homeDistanceCenter').latitude,Session.get('homeDistanceCenter').longitude) < Session.get('distanceFilter')){
        window.shopList.push(obj._id);
        withinProducts = _.union(withinProducts,obj.productId);
      }
    }
    else{
      console.log('not checked!!');
      withinProducts = _.union(withinProducts,obj.productId);
    }
  });
    console.log(withinProducts);


  if(_.isEmpty(Session.get('homeBrand'))){
      return addLeastPrice(Products.find({"_id":{$in: withinProducts},"Sub":Session.get('homeSub')},{reactive:Session.get('newProducts')}).fetch());
  }else{
      // console.log('not empty');
      return addLeastPrice(Products.find({"_id":{$in: withinProducts},"Sub":Session.get('homeSub'),'Brand':{$in:Session.get('homeBrand')}},{reactive:Session.get('newProducts')}).fetch());
  }
};

Template.homeProducts.events = {
  "click div.show-product" : function(e,t){
      e.preventDefault();
      var now = e.currentTarget;
      var id = now.id.split('_');
      Session.set('homeId',id[1]);
      $("#homeModal").css("top",$(now).position().top+260+'px').show().animate({
        height: window.productHeight - 100,
        opacity: 1});
      $("#productList").animate({ scrollTop: ($(now).position().top+250)+"px" });
  }
}

Template.homeModal.product = function(){
  return Products.find({_id:Session.get('homeId')});
};


Template.homeModalOverview.productOverview = function(){
  return Products.find({_id:Session.get('homeId')},{fields:{overViewList:1,overviewPara:1,feature:1}});
};


Template.homeModalSpec.productSpec = function(){
  return Products.find({_id:Session.get('homeId')},{fields:{spec:1}});
};


Template.homeModalAvailble.shopList = function(){
  returnarr =[];
  if(!Session.get('homeDistanceCenter'))
    return;
  Meteor.users.find({"productId":{$all:[Session.get('homeId')]}}).forEach(function(el){
    price=undefined;
    Prices.find({"productId":Session.get('homeId'),"shopId":el._id,"price":{$gt:0}}).forEach(function(e){
      price = e.price;
    });
    if(price){
      returnarr.push({
        shopname:el.shopname,
        distance:findDistance(el.shopLatitude,el.shopLongitude,Session.get('homeDistanceCenter').latitude, Session.get('homeDistanceCenter').longitude),
        link:'/cv/'+el.username+'/'+Session.get('homeId'),
        price:price
      });
    }
  });
  returnarr.sort(function(a,b) {return (a.distance > b.distance) ? 1 : ((b.distance > a.distance) ? -1 : 0);} );
  return returnarr;
}


Template.homeModal.events = {
  "click a#closeModal":function(e,t){
    e.preventDefault();
    $("#homeModal").animate({
        height: 0,
        opacity: 0},function(){
          $(this).hide()
        });
    App.router.navigate(Session.get('homeSub'),{trigger:false});
  },
  "click a.shopNav" : function(e,t){
    e.preventDefault();
    App.router.aReplace(e);
  }
}

Template.homeDistanceFilter.rendered = function(){

  // console.log('rendered distance');
  $('#distanceSlider').slider({
    min: 1,
    max: 10,
    step: 1,
    value: 5,
    selection: 'before',
    orientation: 'horizontal',
    tooltip: 'show'
  });

   $('#distanceSlider').on('slideStop', function(e){
    // console.log('slide stop!!');
    Session.set('distanceFilter',$(this).val());
  });
};


Template.homeView.rendered = function(){
  console.log('home rendered!!');
  var center = new google.maps.places.Autocomplete(document.getElementById('homeDistanceCenter'));
  console.log('crossed');
  center.setComponentRestrictions({country: 'IN'});
  center.setTypes(['(regions)']);

  google.maps.event.addListener(center, 'place_changed', function(){
      var place = center.getPlace();
      console.log(place);
      if(!place.geometry)
        return;
      localStorage.sencilloLat = place.geometry.location.lat();
      localStorage.sencilloLng = place.geometry.location.lng();
      localStorage.sencilloPlaceName = place.address_components[0].short_name+','+place.address_components[1].short_name+','+place.address_components[2].short_name;
      Session.set('homeDistanceCenter', {'name': place.address_components[0].short_name+','+place.address_components[1].short_name+','+place.address_components[2].short_name,'latitude': place.geometry.location.lat(),'longitude': place.geometry.location.lng()});
  });

  $('.change-center').click(function(){
    $(this).parent().parent().find('span').fadeOut('fast',function(){ $(this).parent().parent().find('input.distance-center').fadeIn(); });
  });
};

Template.homeProducts.rendered = function(){
  if(this.rendered==1){
    $("#loadmask").fadeOut('slow');
    //Session.set('newProducts',false);
    this.rendered=2;
  }
  if(!this.rendered){
    this.rendered = 1;
    window.productHeight = $(window).height() - 133;
    if(window.homeProductId != undefined){
      Session.set("homeId",window.homeProductId);
      $("#homeModal").css("top",'0px').show().animate({
        height: window.productHeight - 100,
        opacity: 1});
      window.homeProductId = undefined;
    }
    $("#productList").scroll(function() {
      if(!window.loading && $("#productList").scrollTop() + $("#productList").height() > $("#productList .products-list").eq(0).height() - 100) {
        Session.set('newProducts',true);
        Session.set('homeLimit',Session.get('homeLimit')+10);
        window.loading = true;
      }
    });
  }
  if(window.loading)
    window.loading = false;
    console.log('pricefilter template');
    if(!pricerange.find({}).count())
      return;
    $('#priceSlider').slider({
      min: pricerange.find({}).fetch()[0].minPrice,
      max: pricerange.find({}).fetch()[0].maxPrice,
      step: 100,
      orientation: 'horizontal',
      value: [pricerange.find({}).fetch()[0].minPrice,pricerange.find({}).fetch()[0].maxPrice],
      tooltip:'show'
    });

    $('#priceSlider').on('slideStop', function(e){
      Session.set('homePriceRange',$(this).val());
    });
};


$(function(){
  var scrolled=0;
  $('#homeFilter input').live('change',function(){
    var brandSel = $('#homeFilter input:checkbox:checked').map(function(){
      return $(this).val()
    }).get();
    Session.set('homeBrand',brandSel);
  });

  $('#homeModal .column img').live('click',function(){
    var src = $(this).attr('src');
    var html = "<img src='"+src+"'/>";
    $('div#imageModal').html(html);
  });
  $('#thumbLeft').live('click',function(){
    scrolled=scrolled-200;
    if(scrolled<0)
      scrolled=0;
    $('#thumbSlider').scrollLeft(scrolled);
  });
  $('#thumbRight').live('click',function(){
    scrolled=scrolled+200;
    max = $("#thumbSlider")[0].scrollWidth - $("#thumbSlider").width();
    if(scrolled > max)
      scrolled=max;
    $('#thumbSlider').scrollLeft(scrolled);
  });
});

function addLeastPrice(x){
  var ret = [];
  _.each(x,function(e) {
    // console.log(e._id);
    if(Session.get('homePriceRange') != [] && Session.get('homePriceRange') != undefined)
      z = Prices.find({shopId:{$in:window.shopList},productId:e._id,price:{$gte: Session.get('homePriceRange')[0], $lte: Session.get('homePriceRange')[1]}},{fields:{"price":1},sort:{"price":1},limit:1});
    else
      z = Prices.find({shopId:{$in:window.shopList},productId:e._id,price:{$gt:0}},{fields:{"price":1},sort:{"price":1},limit:1});
    console.log('asdf '+z.count());
    if(z.count()>0){
      e.leastPrice =  z.fetch()[0].price;
      ret.push(e);
    }
  });
  var priceMin = _.min(ret, function(r){ return r.leastPrice; }).leastPrice;
  var priceMax = _.max(ret, function(r){ return r.leastPrice; }).leastPrice;
  console.log('min n max are '+priceMin+' '+priceMax);
  //if(window.setPriceMinMax && priceMin && priceMax)
  //  Session.set('priceMinMax',[priceMin,priceMax]);
  console.log(ret);
  return ret;
}
