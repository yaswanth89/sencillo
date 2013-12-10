Session.set("mainButton","ok");
Session.set("subButton","ok");
Session.set("toggle",true);
this.UserDashboard = Backbone.View.extend({
	template:null,
	initialize:function(){
		return this.template = Meteor.render(function(){
			return Template.brand();
		});
	},
	render:function(){
		this.$el = this.template;
		return this;
	}
});

Template.brand_top_1.Categories = function(){
	return FrameDetail.find({});
};
Template.brand_top_2.SubCategories = function(){
	var main = Session.get("mainButton");
	if(main!="ok"){
		return FrameDetail.find({Main:main}).fetch()[0].Sub;
	}
	else
		return null;
};
Template.product_form_body.Feature = function(){
	var passGet = Session.get("subButton");
	var findGet = "featureField";
	Meteor.call("getData",passGet,findGet,function(error,result){
		if(error)
			console.log(error);
		Session.set("fillInResult",result);
	});
	return Session.get("fillInResult");
};

Template.product_form_header.toggle = function(){
	Session.get("toggle");
};
Template.product_form_body.toggle = function(){
	Session.get("toggle");
};
Template.product_form.events = {
	'submit':function(e){
		e.preventDefault();
		var inputShow = $('#topInfo>input').serializeArray();
		var showSpec = $('textarea.keyFeature').serializeArray();
		var tempInput = $('#productImage>input').serializeArray();
		var image_array = _.pluck(tempInput,"value");
		var mainCatInput = $("#mainButton.btn-info").text();
		var subCatInput = $("#subButton.btn-info").text();
		
		$('.specHighlight').each(function(){
			var temp = $(this).nextUntil(".specHighlight",'input').serializeArray();
			var tempAdditional = $(this).nextUntil(".specHighlight",'textarea').serializeArray();
			temp = _.union(temp,tempAdditional);
			var tempLabel = $(this).text();
			var tempArray = [{"name":"label","value":tempLabel},{"name":"feature","value":temp}];
			inputShow = _.union(inputShow,tempArray);
		});

		temp = _.where(inputShow,{"name":"Product Name"});
		var productName = _.pluck(temp,"value");
		inputShow = _.difference(inputShow,temp);
		temp = _.where(inputShow,{"name":"Model ID"});
		var modelID = _.pluck(temp,"value");
		inputShow = _.difference(inputShow,temp);
		inputShow = _.reject(inputShow, function(param){return param.value=="";});
		Meteor.call("addProductData",inputShow,mainCatInput,subCatInput,showSpec,productName[0],modelID[0],image_array);
		Session.set("toggle",!Session.get("toggle"));
	},
	'click #addImage':function(e){
		e.preventDefault();
		var inputHtml = "<input type='text' name='Product Image'>";
		$('#productImage').append(inputHtml);
	}
};
$(function(){
	prevMain = this;
	prevSub = this;
	$("#mainButton").live("click",function(e){
		$(prevMain).removeClass("btn-info");
		$(this).addClass("btn-info");
		prevMain = this;
		Session.set("mainButton",$(this).text());
	});
	$("#subButton").live("click",function(e){
		$(prevSub).removeClass("btn-info");
		$(this).addClass("btn-info");
		prevSub = this;
		console.log('text is '+$(this).text())
		Session.set("subButton",$(this).text());
	});
});