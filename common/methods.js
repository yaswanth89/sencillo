Meteor.methods({
	'findDistance': function(lat1,lng1,lat2,lng2){
		var R = 6371; //Approximate Radius of Earth in km!!
	    lat1 = lat1*Math.PI/180;
	    lng1 = lng1*Math.PI/180;
	    lat2 = lat2*Math.PI/180;
	    lng2 = lng2*Math.PI/180;
	    var x = (lng2-lng1) * Math.cos((lat1+lat2)/2);
	    var y = (lat2-lat1);
	    var d = Math.sqrt(x*x + y*y) * R;
	    return Math.round(d*100) / 100;
	}
});