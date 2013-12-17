Handlebars.registerHelper('labelCheck', function(conditional,options) {
if (conditional==='label'){
	return options.fn(this);
}
else{
	return options.inverse(this);
}
});

Handlebars.registerHelper('addFeatCheck', function(conditional,options) {
if (conditional==='additionalFeature' || conditional.indexOf('Additional')!= -1){
	return options.fn(this);
}
else{
	return options.inverse(this);
}
});
Handlebars.registerHelper('subCatLink',function(subCatVal){
	var linkReturn = "";
	_.each(subCatVal,function(val){
		if(val==" "){
			linkReturn+="_";
		}
		else
			linkReturn+=val;
	});
	return linkReturn;
});
Handlebars.registerHelper('shopRouter',function(shopname){
	var linkReturn;
	linkReturn = Meteor.users.findOne({'shopname':shopname}).username;
	
	return linkReturn;
});
Handlebars.registerHelper('brandLogo', function(str) {
  return "/image/logos/"+str.toLowerCase()+".png";
});


Handlebars.registerHelper('key_value', function(context, options) {
  var result = [];
  _.each(context, function(value, key, list){
    result.push({key:key, value:value});
  })
  return result;
});
Handlebars.registerHelper("stripes", function(array,options) {
	var fn = options.fn,
	    elseFn = options.inverse;
  if (array && array.length > 0) {
    var buffer = "";
    for (var i = 0, j = array.length; i < j; i++) {
      var item = array[i];
      if((i+1) % 4 == 0)
      	item.odd = true;
      buffer += fn(item);
    }
    return buffer;
  }
  else {
    return elseFn();
  }

});