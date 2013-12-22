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
      $('.modal-wrapper').css('display','block');
      $("#homeModal").css("top",'0px').show().animate({
        height: window.productHeight - 50,
        opacity: 1});
      $("#productList").animate({ scrollTop: ($(now).position().top+10)+"px" });
  }
}

var map;

Template.homeModal.rendered = function(){
    $('a[href="#homeMap"]').on('shown.bs.tab', function (e) {
      //alert(e.target); activated tab
      /*console.log('resizing map');
      console.log(map);
      if(!map)
        return;
      google.maps.event.trigger(map,'resize');
      map.setZoom(map.getZoom());*/


      var markers = [];
  var labels= [];

  if(!google)
    return;


  /*****************************************CUSTOM OVERLAY FUNCTION***********************************/

function mapLabel(opt_options) {
  // Initialization
  this.setValues(opt_options);
  if(!google)
    return;

  // Label specific
  var span = this.span_ = document.createElement('span');
  span.style.cssText = 'position: relative; left: -50%; top: -8px; ' +
  'white-space: nowrap; ' +
  'padding: 4px; background-color: #E67914; text-transform:capitalize;';


  var div = this.div_ = document.createElement('div');
  div.appendChild(span);
  div.style.cssText = 'position: absolute; display: none';
}


  mapLabel.prototype = new google.maps.OverlayView;


  // Implement onAdd
  mapLabel.prototype.onAdd = function() {
    var pane = this.getPanes().overlayImage;
    pane.appendChild(this.div_);


    // Ensures the label is redrawn if the text or position is changed.
    var me = this;
    this.listeners_ = [
      google.maps.event.addListener(this, 'position_changed', function() { me.draw(); }),
      google.maps.event.addListener(this, 'visible_changed', function() { me.draw(); }),
      google.maps.event.addListener(this, 'clickable_changed', function() { me.draw(); }),
      google.maps.event.addListener(this, 'text_changed', function() { me.draw(); }),
      google.maps.event.addListener(this, 'zindex_changed', function() { me.draw(); }),
      google.maps.event.addDomListener(this.div_, 'click', function() { 
        if (me.get('clickable')) {
          google.maps.event.trigger(me, 'click');
        }
      }),
      google.maps.event.addDomListener(this.div_, 'mouseover', function(){
        google.maps.event.trigger(me, 'mouseover');
      }),
      google.maps.event.addDomListener(this.div_, 'mouseout', function(){
        google.maps.event.trigger(me, 'mouseout');
      })
    ];
  };


  // Implement onRemove
  mapLabel.prototype.onRemove = function() {
    this.div_.parentNode.removeChild(this.div_);


    // Label is removed from the map, stop updating its position/text.
    for (var i = 0, I = this.listeners_.length; i < I; ++i) {
      google.maps.event.removeListener(this.listeners_[i]);
    }
  };


  // Implement draw
  mapLabel.prototype.draw = function() {
    var projection = this.getProjection();
    var position = projection.fromLatLngToDivPixel(this.get('position'));


    var div = this.div_;
    div.style.left = position.x + 'px';
    div.style.top = position.y + 'px';


    var visible = this.get('visible');
    div.style.display = visible ? 'block' : 'none';


    var clickable = this.get('clickable');
    this.span_.style.cursor = clickable ? 'pointer' : '';


    var zIndex = this.get('zIndex');
    div.style.zIndex = zIndex;


    this.span_.innerHTML = this.get('text').toString();
  };



  /********************************************************************************************************/

  if(!(Session.get('homeDistanceCenter')))
    return;
  if(!Session.get('homeId'))
    return;

/*
  if(window.here != undefined)
      var myLatLng = new google.maps.LatLng(window.here.coords.latitude,window.here.coords.longitude);  
  else{
    if(navigator.geolocation){
      console.log('here');
        navigator.geolocation.getCurrentPosition(function(position){
            window.here = position;
            Session.set('homeDistanceCenter',window.here.coords);
        });
      }else{
        alert('We are unable to locate where you are! Please select your location');
      }
      if(window.here != undefined)
        var myLatLng = new google.maps.LatLng(window.here.coords.latitude,window.here.coords.longitude);
  }*/
  var myLatLng = new google.maps.LatLng(Session.get('homeDistanceCenter').latitude, Session.get('homeDistanceCenter').longitude);
  var mapProp = {
    center: myLatLng,
    zoom:6,
    mapTypeId:google.maps.MapTypeId.ROADMAP
  };
  if(document.getElementById('googleMapView') != null)
    document.getElementById('homeMap').removeChild(document.getElementById('googleMapView'));
  var a = document.createElement('div');
  a.id = 'googleMapView';
  a.style.width = '930px';
  a.style.height = '511px';
  document.getElementById('homeMap').appendChild(a);
  console.log(mapProp);
  map = new google.maps.Map(a, mapProp);
  var info;
  console.log('map initializing');
  if(Session.get('homeDistanceCenter'))
    findShopsWithin(new google.maps.LatLng(Session.get('homeDistanceCenter').latitude,Session.get('homeDistanceCenter').longitude), 5000, Session.get('homeId'));
  else
    return;
  console.log(Session.get('homeDistanceCenter'));
  function findShopsWithin(center, radius, productId){
    var shopsWithin = [];
    console.log(Meteor.users.find({'usertype':'shop'}).count());
    Meteor.users.find({'usertype':'shop'}).forEach(function(obj){
      console.log(obj.shopname);
      console.log(productId);
      console.log(Prices.find({'productId':productId, 'price': {$gt: 0}, 'shopId': obj._id},{fields: {'_id':1}}).count());
      if(center)
          if(Prices.find({'productId':productId, 'price': {$gt: 0}, 'shopId': obj._id},{fields: {'_id':1}}).count() && findDistance(center.lat(),center.lng(),obj.shopLatitude,obj.shopLongitude) < radius/1000){
            shopsWithin.push(obj);
            console.log(obj);
            placeCustomMarker(new google.maps.LatLng(obj.shopLatitude,obj.shopLongitude), obj.usertype, obj.shopname, 'cv/'+obj.username+'/'+productId, map, 13, false);
          }
    });
  }

  var shopProximity = {
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillOpacity: 0,
    map: map,
    center: myLatLng,
    radius: 5000,
    draggable:false,
    editable:true,
    zIndex: 0
  };

  ProximityCircle = new google.maps.Circle(shopProximity);
  var circleCenter = placeMarker(ProximityCircle.getCenter(), 'Drag to Change Center', map, 13, true, false);

  google.maps.event.addListener(circleCenter, 'dragend', function(event){
    deleteCustomMarkers();
    ProximityCircle.setCenter(circleCenter.getPosition());
    findShopsWithin(ProximityCircle.getCenter(), ProximityCircle.getRadius(), Session.get('homeId'));
  });
  
  
    google.maps.event.addListener(ProximityCircle, 'radius_changed', function(event) {
      deleteCustomMarkers();
      //console.log(ProximityCircle.getCenter());
    findShopsWithin(ProximityCircle.getCenter(), ProximityCircle.getRadius(), Session.get('homeId'));
  });
  google.maps.event.addListener(ProximityCircle, 'dragend', function(event) {
    deleteCustomMarkers();
      //console.log(ProximityCircle.getCenter());
    setTimeout(findShopsWithin(ProximityCircle.getCenter(), ProximityCircle.getRadius()), 1000, Session.get('homeId'));
  });
  
  /*google.maps.event.addListener(map, 'zoom_changed', function() {
      if(Session.get('selected') != undefined)
        map.setCenter(new google.maps.LatLng(Session.get('selected').selectLatitude, Session.get('selected').selectLongitude));
    });*/
  

    /*$('#getGeolocation').click(function(){
      var hereLatLng = new google.maps.LatLng(window.here.coords.latitude, window.here.coords.longitude);
      map.setCenter(hereLatLng);
      placeMarker(hereLatLng, map, map.getZoom());
    });*/

  function placeCustomMarker(location, title, content, link, map, zoom, clean){
    if(clean)
      deleteCustomMarkers();

    var label = new mapLabel({
      map:map,
      position: location,
      text: title,
      zIndex: 3,
      visible: true,
      clickable: true
    });
    console.log(label);

    google.maps.event.addListener(label, 'mouseover', function(){
      label.set('text', title+' '+content );
    });
    google.maps.event.addListener(label, 'mouseout', function(){
      label.set('text', title);
    });
    google.maps.event.addListener(label, 'click', function(){
      App.router.navigate(link, {trigger: true});
    });
    try{
      labels.push(label);
    }catch(e){
      alert(e);
    }
  }
  function deleteCustomMarkers(){
    for(var i=0; i<labels.length; i++){
        labels[i].setMap(null);
      }
      labels = [];
  }

  function placeMarker(location, title ,map, zoom, draggable, clean) {
      marker = new google.maps.Marker({
        position: location,
        map: map, 
        title: title,
        draggable: draggable
    });
    console.log('zooming to '+zoom);
    if(clean)
      deleteMarkers();
    markers.push(marker);
    if(zoom != undefined)
      map.setZoom(zoom);
    return marker;
  }
  function deleteMarkers(){
    for(var i=0; i<markers.length; i++){
        markers[i].setMap(null);
      }
      markers = [];
  }



    });
  this.rendered = 1;
};

Template.homeModal.product = function(){
  return Products.find({_id:Session.get('homeId')});
};


Template.homeModalOverview.productOverview = function(){
  return Products.find({_id:Session.get('homeId')},{fields:{overViewList:1,overviewPara:1,feature:1}}).fetch();
};


Template.homeModalSpec.productSpec = function(){
  var res = Products.find({_id:Session.get('homeId')},{fields:{spec:1}});
  if(res.count() > 0)
    res = res.fetch()[0].spec;
  else
    return null;
  var ret = [];
  var obj = [];
  for(var i=0; i<res.length; i++){
    if(res[i].name == 'label'){
      if(obj.length != 0)
        ret.push(obj);
      obj = [];
    }
    obj.push(res[i]);
  }
  ret.push(obj);
  console.log(ret);
  return ret;
};

Template.homeModalSpec.rendered = function(){
  var i = 0;
  $('#techSpec .spec-section').each(function(){
    if(i%2)
      $(this).css('float','right');
    else
      $(this).css('float','left');
    i++;
  });
}
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
          $(this).parent().css('display','none');
          $(this).hide();
          $(this).find('.nav-tabs li.active').removeClass('active');
          $(this).find('.nav-tabs li:first').addClass('active');
          $(this).find('.tab-content .tab-pane.active').removeClass('active');
          $(this).find('.tab-content .tab-pane#overview').addClass('active');
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

var $priceslider;
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
      $('.modal-wrapper').css('display','block');
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

    /*if($('.slider')){
      $('.slider').remove();
      $('#homepriceslider-wrapper').append('<div id="priceSlider" class="span2"></div>');
    }*/

    /*if($priceslider != undefined){
      console.log('detaching........');
      $priceslider.detach();
    }*/

    $priceslider = $('#priceSlider').slider({
      min: pricerange.find({}).fetch()[0].minPrice,
      max: pricerange.find({}).fetch()[0].maxPrice,
      step: 100,
      orientation: 'horizontal',
      value: [pricerange.find({}).fetch()[0].minPrice,pricerange.find({}).fetch()[0].maxPrice],
      tooltip:'show'
    });

    //$('#homepriceslider-wrapper').append($priceslider);

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
      console.log('in the if');
      var pr = z.fetch()[0].price;
      if(pr != ''){
        e.leastPrice =  pr;
        ret.push(e);
      }
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


