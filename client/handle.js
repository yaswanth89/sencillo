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