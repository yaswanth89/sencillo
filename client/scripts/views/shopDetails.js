var user;
if(navigator.geolocation){
  navigator.geolocation.getCurrentPosition(function(position){
    window.here = position;
  });
}
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
	'submit #shopdetails': function(e, t){
		e.preventDefault();
		var details = {'shopname': t.find('#shopname').value, 'address': t.find('#address').value, 'landmark': t.find('#landmark').value, 'city': t.find('#city').value , 'pincode': t.find('#pincode').value,'contactname': t.find('#contactname').value, 'contactnum': t.find('#contactnum').value, 'shopLatitude': Session.get('selected').selectLatitude, 'shopLongitude': Session.get('selected').selectLongitude};
		Meteor.call('editDetails', details);
	}
};

	
	Template.mapTemplate.rendered = function(){
		var markers = [];
		var myLatLng = new google.maps.LatLng(Session.get('user').shopLatitude, Session.get('user').shopLongitude);	
		/*var mapProp = {
		  center: myLatLng,
		  zoom:5,
		  mapTypeId:google.maps.MapTypeId.ROADMAP
		  };*/
			var map=new google.maps.Map(document.getElementById('googleMap'));
			map.setZoom(5);
			//placeMarker(myLatLng, map, 5);
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
			
		  google.maps.event.addListener(map, 'click', function(event) {
	   			placeMarker(event.latLng, map, map.getZoom());
				selectLatitude = event.latLng.lat();
	   			selectLongitude = event.latLng.lng();
	   			Session.set('selected',{'selectLatitude': selectLatitude, 'selectLongitude': selectLongitude});
	   			//alert(lat+' '+lng);
  		  });
  		  google.maps.event.addListener(map, 'zoom_changed', function() {
			    if(Session.get('selected') != undefined)
			    	map.setCenter(new google.maps.LatLng(Session.get('selected').selectLatitude, Session.get('selected').selectLongitude));
		  });

		  $('#locate-landmark').click(function(){
		  	var land = $('#landmark').val();
			var city = $('#city').val();
			$.get('http://maps.googleapis.com/maps/api/geocode/json', {'address':land+'+'+city, 'sensor': 'true'}, function(data){
				
				var all = [];
				for(var i=0;i<data.results.length;i++){
					all.push(data.results[i].formatted_address);
					if(i == 0){
						$('#map-suggestions').html('');
						var str = '<li id="'+i+'" class="active">'+data.results[i].formatted_address+'</li>';	
					}
					else
						var str = '<li id="'+i+'">'+data.results[i].formatted_address+'</li>';
					$('#map-suggestions').html($('#map-suggestions').html().concat(str));
				}
				$('#suggestions-wrapper').css('display','block');

				showLandmark(data, 0);

				$('#map-suggestions li').click(function(){
					$('#map-suggestions li').each(function(){ $(this).removeClass('active'); })
					$(this).addClass('active');
  		  			showLandmark(data, $(this).attr('id'));
  		  		});

			});
		  });

		  $('#getGeolocation').click(function(){
		  	var hereLatLng = new google.maps.LatLng(window.here.coords.latitude, window.here.coords.longitude);
		  	map.setCenter(hereLatLng);
		  	placeMarker(hereLatLng, map, map.getZoom());
		  });
  		  
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

  		function placeMarker(location, map, zoom) {
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
		}
	}
	//google.maps.event.addDomListener(window, 'load', initialize);
	
