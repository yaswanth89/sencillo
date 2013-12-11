this.mapView = Backbone.View.extend({
	template:null,
	initialize:function(page){
		this.template = Meteor.render(function(){
			return Template.mapView();
		});
	},
	render:function(){
		this.$el = this.template;
		return this;
	}
});
Deps.autorun(function(){
	Meteor.subscribe('allUsers');
});


	/*****************************************CUSTOM OVERLAY FUNCTION***********************************/

function mapLabel(opt_options) {
  // Initialization
  this.setValues(opt_options);


  // Label specific
  var span = this.span_ = document.createElement('span');
  span.style.cssText = 'position: relative; left: -50%; top: -8px; ' +
  'white-space: nowrap; ' +
  'padding: 2px; background-color: rgb(124,138,236);';


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


Template.mapView.rendered = function(){
	var markers = [];
	var labels= [];

	if(window.here.coords != undefined)
		var myLatLng = new google.maps.LatLng(window.here.coords.latitude,window.here.coords.longitude);	
	else{
		if(navigator.geolocation){
	      navigator.geolocation.getCurrentPosition(function(position){
	        window.here = position;
	        Session.set('distanceCenter',window.here.coords);
	      });
    	}else{
    		alert('We are unable to locate where you are! Please select your location');
    	}
    	var myLatLng = new google.maps.LatLng(window.here.coords.latitude,window.here.coords.longitude);
	}
	var mapProp = {
	  center: myLatLng,
	  zoom:14,
	  mapTypeId:google.maps.MapTypeId.ROADMAP
	};
	var map=new google.maps.Map(document.getElementById('googleMapView'), mapProp);
	var info;

	
	findShopsWithin(new google.maps.LatLng(window.here.coords.latitude,window.here.coords.longitude), 5000);

	function findShopsWithin(center, radius){
		var shopsWithin = [];
		console.log(Meteor.users.find({'usertype':'shop'}).count());
		Meteor.users.find({'usertype':'shop'}).forEach(function(obj){
			if(findDistance(center.lat(),center.lng(),obj.shopLatitude,obj.shopLongitude) < radius/1000){
				shopsWithin.push(obj);
				console.log(obj);
				placeCustomMarker(new google.maps.LatLng(obj.shopLatitude,obj.shopLongitude), obj.usertype, obj.shopname, map, 13, false);
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
	var circleCenter = placeMarker(ProximityCircle.getCenter(), 'Drag to Change Center', map, 14, true, false);

	google.maps.event.addListener(circleCenter, 'dragend', function(event){
		deleteCustomMarkers();
		ProximityCircle.setCenter(circleCenter.getPosition());
		findShopsWithin(ProximityCircle.getCenter(), ProximityCircle.getRadius());
	});
	
	
  	google.maps.event.addListener(ProximityCircle, 'radius_changed', function(event) {
  		deleteCustomMarkers();
  		//console.log(ProximityCircle.getCenter());
		findShopsWithin(ProximityCircle.getCenter(), ProximityCircle.getRadius());
	});
	google.maps.event.addListener(ProximityCircle, 'dragend', function(event) {
		deleteCustomMarkers();
  		//console.log(ProximityCircle.getCenter());
		setTimeout(findShopsWithin(ProximityCircle.getCenter(), ProximityCircle.getRadius()), 1000);
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

	function placeCustomMarker(location, title, content, map, zoom, clean){
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
};