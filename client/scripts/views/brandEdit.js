this.BrandEdit = Backbone.View.extend({
	template:null,
	initialize:function(){
		return this.template = Meteor.render(function(){
			return Template.brandEdit();
		});
	},
	render:function(){
		this.$el = this.template;
		return this;
	}
});

Template.filtering.listProducts = function(){
	Meteor.call('findBrandProducts', function(error,result){
		Session.set('brandProducts', result);
	});
	return Session.get('brandProducts');
};

Template.filtering.rendered = function(){
	$('#brandfilter').change(function(){
		console.log($(this).val());
		var nowProduct = Meteor.call('findProductfromId', $('#brandfilter').val(), function(error,result){
			console.log(result);
			Session.set('editProduct',result);
		});
	});
};
/*
Template.product_edit_header.toggle = function(){
	return Session.get('toggle');
}

Template.product_edit_body.toggle = function(){
	return Session.get('toggle');
}
*/
Template.product_edit_form.thisProduct = function(){
	return Session.get('editProduct');
}

Template.product_edit_form.events = {
	"submit" : function(e){
		e.preventDefault();
		var ProductID = $('#brandfilter').val();
		var inputShow = $('#editTopInfo>input').serializeArray();
		var showSpec = $('textarea.keyFeature').serializeArray();
		var tempInput = $('#productImage>input').serializeArray();
		var image_array = _.pluck(tempInput,"value");
		
		$('#editProductForm .specHighlight').each(function(){
			var temp = $(this).nextUntil(".specHighlight",'input').serializeArray();
			console.log(temp);
			var tempAdditional = $(this).nextUntil(".specHighlight",'textarea').serializeArray();
			console.log(tempAdditional);
			temp = _.union(temp,tempAdditional);
			var tempLabel = $(this).text();
			var tempArray = [{"name":"label","value":tempLabel},{"name":"feature","value":temp}];
			inputShow = _.union(inputShow,tempArray);
		});

		console.log('the final edited product is ');
		console.log(inputShow);
		temp = _.where(inputShow,{"name":"Product Name"});
		var productName = _.pluck(temp,"value");
		inputShow = _.difference(inputShow,temp);
		temp = _.where(inputShow,{"name":"Model ID"});
		var modelID = _.pluck(temp,"value");
		inputShow = _.difference(inputShow,temp);
		inputShow = _.reject(inputShow, function(param){return param.value=="";});

		var prevData = Session.get('editProduct');
		var updateSet = {};
		/*var flag = 0;
		var features = _.where(inputShow,{'name': 'feature'});*/
		updateSet.ProductInfo = inputShow;
		if(productName != prevData.ProductName)
			updateSet.ProductName = productName;
		if(modelID != prevData.ModelID)
			updateSet.ModelID = modelID;
		if(showSpec != prevData.showSpec)
			updateSet.showSpec = showSpec;
		updateSet.imageArray = image_array;
		console.log('updateset');
		console.log(updateSet);
		Meteor.call('updateProductData',ProductID,updateSet);	
	},
	'click #addImage':function(e){
		e.preventDefault();
		var inputHtml = "<input type='text' name='Product Image'>";
		$('#productImage').append(inputHtml);
	}
}
