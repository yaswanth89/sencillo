var user;

this.ShopDetails = Backbone.View.extend({
	template:null,
	initialize:function(page){
		Meteor.call('getUser', function(error, result){ Session.set('user',result);});
		this.template = Meteor.render(function(){
			return Template.shopDetails();
		});
	},
	render:function(){
		this.$el = this.template;
		return this;
	}
});

Template.shopDetails.details = function(){
	return Session.get('user');
};

Template.shopDetails.events = {
	'submit #edit-form-shop': function(e, t){
		e.preventDefault();
		var c = $("#edit-form-shop").serializeArray();
		payments=[];
		emi="no";
		openHour="";
		closeHour="";
		console.log(c);
		_.each(c,function(el, index) {
			if(el.name=="payments")
				payments.push(el.value);
			if(el.name=="emi"){
				if(el.value == "yes")
					emi=true;
				else
					emi=false;
			}
			if(el.name=="openHour")
				openHour = el.value;
			if(el.name=="closeHour")
				closeHour = el.value;
		});
		if(Session.get('selected') == undefined)
			Session.set('selected', {'lat': Session.get('user').shopLatitude, 'lng': Session.get('user').shopLongitude });
		var details = {
			'shopname': t.find('#edit-shopname').value,
			'address': t.find('#edit-address').value,
			'landmark': t.find('#edit-landmark').value,
			'locality': t.find('#edit-locality').value, 
			'city': t.find('#edit-city').value,
			'pincode': t.find('#edit-pincode').value,
			'contactname': t.find('#edit-contactname').value,
			'contactnum': t.find('#edit-contactnum').value,
			'shopLatitude': Session.get('selected').lat,
			'shopLongitude': Session.get('selected').lng,
			"emi":emi,
			"payments":payments,
			"openHour":openHour,
			"closeHour":closeHour
		};
		Meteor.call('editDetails', details,function(err){ if(err) alert('Sorry..could not edit!!'); });
		return false;
	}
};

	
	Template.mapTemplate.rendered = function(){
		/*var mapProp = {
		  center: myLatLng,
		  zoom:5,
		  mapTypeId:google.maps.MapTypeId.ROADMAP
		  };*/
		  var mapOptions = {
		    panControl: false,
		    zoomControl: false,
		    scrollwheel: false
		  };
		var map=new google.maps.Map(document.getElementById('googleMap'),mapOptions);
		map.setZoom(12);

		var localityBox = new google.maps.places.Autocomplete(document.getElementById('edit-locality'));
		var landmarkBox = new google.maps.places.Autocomplete(document.getElementById('edit-landmark'));
		localityBox.setComponentRestrictions({country: 'IN'});
		landmarkBox.setComponentRestrictions({country: 'IN'});
		localityBox.setTypes(['geocode']);
		
		var info;
		$.get("http://maps.googleapis.com/maps/api/geocode/json", {'address':Session.get('user').pincode,'sensor':'true'}, function(data){
			info = data;
			var bounds = info.results[0].geometry.bounds;
			var ne = new google.maps.LatLng(bounds.northeast.lat, bounds.northeast.lng);
			var sw = new google.maps.LatLng(bounds.southwest.lat, bounds.southwest.lng);
			var b = new google.maps.LatLngBounds(sw, ne);
			console.log(b.getCenter());
			map.fitBounds(b);
			//map.setCenter(b.getCenter());
		});

		var shopForm = document.getElementById('edit-form-shop');
		map.controls[google.maps.ControlPosition.TOP_LEFT].push(shopForm);
		console.log('controls pushed');
		shopForm.style.backgroundColor = 'rgba(255,255,255,0.7)';
		shopForm.style.fontWeight = 'bold';
		shopForm.style.padding = '10px 30px';
		shopForm.style.marginLeft = '30px';

		$('#edit-pincode').blur(function(){
		    $.get('http://maps.googleapis.com/maps/api/geocode/json', {'address':$(this).val()+'+india', 'sensor':'true'},function(data){
		      var bounds = data.results[0].geometry.bounds;
		      var ne = new google.maps.LatLng(bounds.northeast.lat, bounds.northeast.lng);
		      var sw = new google.maps.LatLng(bounds.southwest.lat, bounds.southwest.lng);
		      var b = new google.maps.LatLngBounds(sw, ne);
		      map.fitBounds(b);
		      console.log('midway!');
		      localityBox.setBounds(b);
		      landmarkBox.setBounds(b);
		      console.log('bounded!');
		    });
		});
		var marker;

		google.maps.event.addListener(localityBox, 'place_changed', function(){
		    var place = localityBox.getPlace();
		    if(!place.geometry)
		      return;
		    if(!map.getBounds().contains(place.geometry.location)){
		      alert('Your Selected Locality is not in specified Pincode region!');
		      return;
		    }
		    if(place.geometry.viewport){
		      map.fitBounds(place.geometry.viewport);
		    }else{
		      map.setCenter(place.geometry.location);
		      map.setZoom(17);
		      map.panBy(-300,0);
		    }

		    if(marker != undefined)
		      marker.setMap(null);

		    marker = new google.maps.Marker({
		      map: map,
		      visible: true,
		      draggable: true,
		      position: place.geometry.location
		    });

		    Session.set('selected',place.geometry.location);
		  });

		google.maps.event.addListener(landmarkBox, 'place_changed', function(){
		    var place = landmarkBox.getPlace();
		    if(!place.geometry)
		      return;
		    if(!map.getBounds().contains(place.geometry.location)){
		      alert('Your Selected Landmark is not in specified Pincode region!');
		      return;
		    }
		    if(place.geometry.viewport){
		      map.fitBounds(place.geometry.viewport);
		    }else{
		      map.setCenter(place.geometry.location);
		      map.setZoom(17);
		      map.panBy(-300,0);
		    }

		    if(marker != undefined)
		      marker.setMap(null);

		    marker = new google.maps.Marker({
		      map: map,
		      visible: true,
		      draggable: true,
		      position: place.geometry.location,
		      crossOnDrag: false
		    });

		    Session.set('selected',place.geometry.location);
		  });

		  google.maps.event.addListener(marker, 'dragend',function(e){
		    Session.set('selected',{'lat': e.latLng.lat(), 'lng': e.latLng.lng()});
		  });
			
	  	google.maps.event.addListener(map, 'click', function(e) {
   			placeMarker(event.latLng, map, map.getZoom());
   			Session.set('selected',{'lat': e.latLng.lat(), 'lng': e.latLng.lng()});
   			//alert(lat+' '+lng);
	  	});
	  	/*google.maps.event.addListener(map, 'zoom_changed', function() {
		    if(Session.get('selected') != undefined)
		    	map.setCenter(new google.maps.LatLng(Session.get('selected').selectLatitude, Session.get('selected').selectLongitude));
	  	});*/

			  	
  
		function showLandmark(data, index){
			var focus = data.results[index].geometry;
			if(focus.bounds != undefined){
				var ne = new google.maps.LatLng(focus.bounds.northeast.lat, focus.bounds.northeast.lng);
				var sw = new google.maps.LatLng(focus.bounds.southwest.lat, focus.bounds.southwest.lng);
			}else if(focus.viewport != undefined){
				var ne = new google.maps.LatLng(focus.viewport.northeast.lat, focus.viewport.northeast.lng);
				var sw = new google.maps.LatLng(focus.viewport.southwest.lat, focus.viewport.southwest.lng);
			}
			if(ne!=undefined && sw!=undefined){
				var bounds = new google.maps.LatLngBounds(sw, ne);
				map.fitBounds(bounds);
			}
			var loc = new google.maps.LatLng(focus.location.lat,focus.location.lng);
			placeMarker(loc,map,5);
		}

  		/*function placeMarker(location, map, zoom) {
		  	marker = new google.maps.Marker({
			    position: location,
			    map: map
			});
			console.log('zooming to '+zoom);
			deleteMarkers();
			markers.push(marker);
			//if(zoom != undefined)
				//map.setZoom(zoom);
		}
		function deleteMarkers(){
			for(var i=0; i<markers.length; i++){
  				markers[i].setMap(null);
  			}
  			markers = [];
		}*/
	}
	//google.maps.event.addDomListener(window, 'load', initialize);
	
