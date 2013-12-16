this.Default = Backbone.View.extend({
	template:null,
	render:function(){
		this.$el = this.template;
		return this;
	},
	initialize:function(){
		if(!localStorage.sencilloLat){
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
		return this.template = Meteor.render(function(){
			return Template.default({});
		});
	}
});
Deps.autorun(function(){
	Meteor.subscribe("frameDetail");
	window.subscribed = Meteor.subscribe("featuredProducts");
});
Template.featuredProducts.shops=function(){
	var blah=[];
	var id = '';
	var shopName='';
	Meteor.users.find({username:"achal"},{_id:1}).forEach(function(e){
		id = e._id;
		shopName=e.shopname;
	});
	x = Prices.find({shopId:id,"Featured":1},{limit:5}).forEach(function(e){
		product = Products.find({_id:e.productId},{fields:{"ProductName":1,"ModelID":1,"Image":1}}).fetch();
		if(product[0]){
			product[0].price = e.price;
			blah.push(product[0]);
		}
	});
	console.log(blah);
	return [{"link":"/cv/achal","shopName":shopName,"Product":blah}];
};
Template.featuredProducts.events={
	"click .featuredProducts a":function(e,t){
		e.preventDefault();
		App.router.aReplace(e);
	}
}