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

Template.mapView.rendered = function(){
	var markers = [];
	var myLatLng = new google.maps.LatLng(window.here.coords.latitude,window.here.coords.longitude);	
	var mapProp = {
	  center: myLatLng,
	  zoom:5,
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
				placeMarker(new google.maps.LatLng(obj.shopLatitude,obj.shopLongitude), obj.shopname ,map, 13, false);
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
	  draggable:true,
	  editable:true
	};

	ProximityCircle = new google.maps.Circle(shopProximity);
	
	
  	google.maps.event.addListener(ProximityCircle, 'radius_changed', function(event) {
  		deleteMarkers();
  		//console.log(ProximityCircle.getCenter());
		findShopsWithin(ProximityCircle.getCenter(), ProximityCircle.getRadius());
	});
	google.maps.event.addListener(ProximityCircle, 'dragend', function(event) {
  		deleteMarkers();
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
	  

	function placeMarker(location, title ,map, zoom, clean) {
	  	marker = new google.maps.Marker({
		    position: location,
		    map: map, 
		    title: title
		});
		console.log('zooming to '+zoom);
		if(clean)
			deleteMarkers();
		markers.push(marker);
		if(zoom != undefined)
			map.setZoom(zoom);
	}
	function deleteMarkers(){
		for(var i=0; i<markers.length; i++){
				markers[i].setMap(null);
			}
			markers = [];
	}
};