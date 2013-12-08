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


Template.mapView.rendered = function(){
	var markers = [];
	var myLatLng = new google.maps.LatLng(window.here.coords.latitude,window.here.coords.longitude);	
	var mapProp = {
	  center: myLatLng,
	  zoom:5,
	  mapTypeId:google.maps.MapTypeId.ROADMAP
	};
	var map=new google.maps.Map(document.getElementById('googleMapView'), mapProp);
	placeMarker(myLatLng, 'Your Position' , map, 5, false);
	var info;
	findShopsWithin([window.here.coords.latitude,window.here.coords.longitude], 5);
	function showShopsWithin(center, radius){
		var shops = findShopsWithin(center, radius);
	}

	function findShopsWithin(center, radius){
		var shopsWithin = [];
		Meteor.users.find({'usertype':'shop'}).forEach(function(obj){
			if(findDistance(center[0],center[1],obj.shopLatitude,obj.shopLongitude) < radius){
				shopsWithin.push(obj);
				console.log(obj);
				placeMarker(new google.maps.LatLng(obj.shopLatitude,obj.shopLongitude), obj.shopname ,map, 13, false);
			}
		});
		return shopsWithin;
	}
	
	/*
  	google.maps.event.addListener(map, 'click', function(event) {
		placeMarker(event.latLng, map, map.getZoom());
		selectLatitude = event.latLng.lat();
		selectLongitude = event.latLng.lng();
		Session.set('selected',{'selectLatitude': selectLatitude, 'selectLongitude': selectLongitude});
		//alert(lat+' '+lng);
	});*/
	
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