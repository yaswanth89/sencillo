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
	'submit #shopdetails': function(e, t){
		e.preventDefault();
		var details = {'shopname': t.find('#shopname').value, 'address': t.find('#address').value, 'contactname': t.find('#contactname').value, 'contactnum': t.find('#contactnum').value};
		Meteor.call('editDetails', details);
	}
};

	
	Template.mapTemplate.rendered = function(){
		alert('map rendered');
	      console.log(document.getElementById('googleMap'));
			var mapProp = {
		  center:new google.maps.LatLng(51.508742,-0.120850),
		  zoom:5,
		  mapTypeId:google.maps.MapTypeId.ROADMAP
		  };
			var map=new google.maps.Map(document.getElementById('googleMap')
		  ,mapProp);

			var marker = new google.maps.Marker({
		    title:'Meine Position',
		    icon:'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
		  });
		  marker.setMap(map); 
	}
	//google.maps.event.addDomListener(window, 'load', initialize);
	
