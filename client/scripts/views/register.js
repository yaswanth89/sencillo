this.Register = Backbone.View.extend({
	template:null,
	initialize:function(page){
		this.template = Meteor.render(function(){
			return Template.register();
		});
	},
	render:function(){
		this.$el = this.template;
		return this;
	}
});
Session.set('regSelect',true);
Template.register.shop = function(){
  return Session.get('regSelect');
};
Template.register.events({
    'submit #register-form-shop' : function(e, t) {
      e.preventDefault();
      var username = t.find('#shop-username').value;
      var shopname = t.find('#shop-shopname').value;
      var password = t.find('#shop-password').value;
      var address = t.find('#shop-shopaddress').value;
      var shopLatitude = t.find('#shopLatitude').value;
      var shopLongitude =t.find('#shopLongitude').value; 
      var contactname = t.find('#shop-contactname').value;
      var contactnum = t.find('#shop-contactnum').value;
      Accounts.createUser({username: username,shopname: shopname, password : password,check: 'checked', address: address, contactname: contactname, contactnum: contactnum,shopLatitude:shopLatitude, shopLongitude:shopLongitude, usertype: 'shop'}, function(err){
          if (err) {
            alert('Could not create');
            // Inform the user that account creation failed
          } else {
            App.router.navigate('dashboard',{trigger:true});
            // Success. Account has been created and the user
            // has logged in successfully. 
          }

        });
      return false;
    }
 });

var map;

Template.shopRegister.rendered = function(){
  console.log('rendered register!!');
  var mapOptions = {
    panControl: false,
    zoomControl: false
  };
  if(document.getElementById('registerMap') != null)
    this.removeChild(document.getElementById('registerMap'));
  var regMap = document.createElement('div');
  regMap.id = 'registerMap';
  regMap.style.width = '1200px';
  regMap.style.height = '700px';
  document.getElementById('register-wrapper').appendChild(regMap);
  map = new google.maps.Map(regMap);
  console.log(map);
  //map.panBy(-300,0);
  var localityBox = new google.maps.places.Autocomplete(document.getElementById('shop-locality'));
  var landmarkBox = new google.maps.places.Autocomplete(document.getElementById('shop-landmark'));
  localityBox.setComponentRestrictions({country: 'IN'});
  landmarkBox.setComponentRestrictions({country: 'IN'});
  localityBox.setTypes(['geocode']);

  var shopForm = document.getElementById('register-form-shop');
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(shopForm);
  console.log('controls pushed');
  shopForm.style.backgroundColor = 'rgba(255,255,255,0.7)';
  shopForm.style.fontWeight = 'bold';
  //landmarkBox.setTypes(['establishment']);
  var myLatLng;
  if(window.here != undefined){
      myLatLng = new google.maps.LatLng(window.here.coords.latitude, window.here.coords.longitude);
      map.setCenter(myLatLng);
      map.setZoom(13);
  }else{
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(function(position){
        window.here = position;
        console.log('geo!!');
        myLatLng = new google.maps.LatLng(window.here.coords.latitude, window.here.coords.longitude);
        map.setCenter(myLatLng);
        map.setZoom(13);
      });
    }
  }

  $('#shop-pincode').blur(function(){
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
      position: place.geometry.location
    });
  });
};

Template.shopRegister.destroyed = function() {
  console.log('destroyed!!!');
  Session.set('mapInit', true);
};

