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
      console.log('register submitting....');
      var username = t.find('#shop-username').value;
      var shopname = t.find('#shop-shopname').value;
      var password = t.find('#shop-password').value;
      var pincode = t.find('#shop-pincode').value;
      var locality = t.find('#shop-locality').value;
      var landmark = t.find('#shop-landmark').value;
      var city = t.find('#shop-city').value;
      var address = t.find('#shop-shopaddress').value;
      var contactnum = t.find('#shop-contactnum').value;
      if (!(username && shopname && password && pincode && locality && landmark && city && address && contactnum)){
        displayError('Please fill all the fields!');
        return;
      }
      console.log('all values OK');
      var formatted_address = address+','+locality.split(',')[0]+','+locality.split(',')[1]+',Near '+landmark.split(',')[0]+','+city+','+pincode;
      displaySuccess('Your address is going to be '+formatted_address);
      if(Session.get('shopLocation') != undefined)
        Accounts.createUser({username: username,shopname: shopname, password : password,check: 'checked',pincode: pincode,locality: locality,landmark: landmark,city: city ,address: address,formatted_address: formatted_address,contactnum: contactnum,shopLatitude:Session.get('shopLocation').lat, shopLongitude:Session.get('shopLocation').lng, usertype: 'shop'}, function(err){
              App.router.navigate('shopAdd',{trigger:true});
              // Success. Account has been created and the user
              // has logged in successfully.
          });
      else
        displayError('Please Choose Your Location on the Map');
      return false;
    }
 });

var map;
var geocoder;

Template.shopRegister.rendered = function(){
  console.log('rendered register!!');
  geocoder = new google.maps.Geocoder();
  
  var mapStyles = [
    {"featureType":"landscape","stylers":[{"hue":"#F1FF00"},{"saturation":-27.4},{"lightness":9.4},{"gamma":1}]}
    ,{"featureType":"road.highway","stylers":[{"hue":"#0099FF"},{"saturation":-20},{"lightness":36.4},{"gamma":1}]}
    ,{"featureType":"road.arterial","stylers":[{"hue":"#00FF4F"},{"saturation":0},{"lightness":0},{"gamma":1}]}
    ,{"featureType":"road.local","stylers":[{"hue":"#FFB300"},{"saturation":-38},{"lightness":11.2},{"gamma":1}]}
    ,{"featureType":"water","stylers":[{"hue":"#00B6FF"},{"saturation":4.2},{"lightness":-10.4},{"gamma":1}]}
    ,{"featureType":"poi","stylers":[{"hue":"#9FFF00"},{"saturation":0},{"lightness":0},{"gamma":1}]}];

  var mapOptions = {
    panControl: false,
    zoomControl: false,
    scrollwheel: false,
    styles: mapStyles
  };
  if(document.getElementById('registerMap') != null)
    this.removeChild(document.getElementById('registerMap'));
  var regMap = document.createElement('div');
  regMap.id = 'registerMap';
  regMap.style.width = '1363px';
  regMap.style.height = '583px';
  document.getElementById('register-map').appendChild(regMap);
  map = new google.maps.Map(regMap, mapOptions);
  console.log(map);
  try{
    map.panBy(-300,0);
  }catch(e){console.log(e);}
  var localityBox = new google.maps.places.Autocomplete(document.getElementById('shop-locality'));
  var landmarkBox = new google.maps.places.Autocomplete(document.getElementById('shop-landmark'));
  localityBox.setComponentRestrictions({country: 'IN'});
  landmarkBox.setComponentRestrictions({country: 'IN'});
  localityBox.setTypes(['geocode']);

  // var shopForm = document.getElementById('register-form-shop');
  // map.controls[google.maps.ControlPosition.TOP_LEFT].push(shopForm);
  // console.log('controls pushed');
  // shopForm.style.backgroundColor = 'rgba(184,184,184,0.701961)';
  // shopForm.style.fontWeight = 'bold';
  // shopForm.style.padding = '16px 30px'; 
  // shopForm.style.marginLeft = '30px';
  // shopForm.style.fontSize = '12px';
  // shopForm.style.overflow = 'auto';
  // shopForm.style.height = '94%';
  //landmarkBox.setTypes(['establishment']);
  var myLatLng;
  myLatLng = new google.maps.LatLng(22.572646,88.36389500000001);
  map.setCenter(myLatLng);
  map.setZoom(13);

  var b;

  $('#shop-pincode').blur(function(){
    if($(this).val())
      $.get('http://maps.googleapis.com/maps/api/geocode/json', {'address':$(this).val()+'+india', 'sensor':'true'},function(data){
        var bounds = data.results[0].geometry.bounds;
        var ne = new google.maps.LatLng(bounds.northeast.lat, bounds.northeast.lng);
        var sw = new google.maps.LatLng(bounds.southwest.lat, bounds.southwest.lng);
        b = new google.maps.LatLngBounds(sw, ne);
        map.fitBounds(b);
        map.panBy(-300,0);
        console.log('midway!');
        localityBox.setBounds(b);
        landmarkBox.setBounds(b);
        console.log('bounded!');
      });
  });
  
  var marker;

  function getAddress(latlng){
    geocoder.geocode({'latLng': latlng}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]){
          $('#shop-shopaddress').val(results[1].address_components);
        }
      }else{
        alert('Geocoder failed due to: ' + status);
      }
    });
  }



  google.maps.event.addListener(localityBox, 'place_changed', function(){
    var place = localityBox.getPlace();
    if(!place.geometry)
      return;
    if(!b){
      displayError('Please Enter Pincode!!');
      return;
    }
    if(!b.contains(place.geometry.location)){
      displayError('Your Selected Locality is not in specified Pincode region!');
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
    displaySuccess('Move the marker around to point your location!');
    Session.set('shopLocation',place.geometry.location);
  });

  google.maps.event.addListener(landmarkBox, 'place_changed', function(){
    var place = landmarkBox.getPlace();
    if(!place.geometry)
      return;
    if(!b){
      displayError('Please Enter Pincode!!');
      return;
    }
    if(!b.contains(place.geometry.location)){
      displayError('Your Selected Landmark is not in specified Pincode region!');
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
    displaySuccess('Move the marker around to point your location!');
    Session.set('shopLocation',place.geometry.location);
  });

  google.maps.event.addListener(marker, 'dragend',function(e){
    Session.set('shopLocation',{'lat': e.latLng.lat(), 'lng': e.latLng.lng()});
  });
};

Template.shopRegister.destroyed = function() {
  console.log('destroyed!!!');
  Session.set('mapInit', true);
};

