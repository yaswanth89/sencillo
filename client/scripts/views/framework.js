var text,tag=0,tagloop=0;
Session.set("current","ok");
Session.set("change",true);
Framework = Backbone.View.extend({
	template:null,
	initialize:function(page){
		this.template = Meteor.render(function(){
			if(page==2)
				{return Template.framework_two();}
			else
				{return Template.framework_one();}
		});
	},
	render:function(){
		this.$el = this.template;
		return this;
	}
});
Template.framework_one.events={
	'click #addSub':function(e){
		e.preventDefault();
		$('#inputSub').append("<input type='text' name='subCat'/>");
	},
	'click #remSub':function(e){
		e.preventDefault();
		var remInput = $('#inputSub').children().last();
		console.log(remInput);
		$(remInput).remove();
	},
	'submit':function(e){
		e.preventDefault();
		var allInputs = $(':input').serializeArray();
		Meteor.call('addToCat',allInputs);
		Session.set("toggle",!Session.get("toggle"));
	}
};
Template.framework_subcat.toggle = function(){
	Session.get("toggle");
	return;
}
Template.framework_two_1.Categories = function(){
	return FrameDetail.find({});
};

Template.framework_two_2.SubCategories = function(){
	Session.get("current");
	//return FrameData.find({Main:text});
	if(text != undefined)
		return FrameDetail.find({Main:text}).fetch()[0].Sub;
	else
		return null;
};
Template.framework_two_form.toggle = function(){
	Session.get("toggle");
}

Template.framework_two.events = {
	'click #addFeatureButton':function(e){
		e.preventDefault();
		var html = '<div class="control-group"><label for="section1" class="control-label"><strong>Primary Label</strong></label><div class="controls"><input id="section1" name="label" type="text"></div></div><div class="control-group"><label class="control-label"><strong>Feature List</strong></label><div class="controls" id="singleFeatureInput"><input name="feature" type="text"/></div><button class="btn controls" id="singleFeatureButton"><i class="icon-plus"></i></button><button class="btn" id="remSingleFeature"><i class="icon-remove"></i></button></div>';
		$('#addFeatureInput').append(html);
	},
	'submit':function(e){
		e.preventDefault();
		var featureInput = $(':input').serializeArray();
		var tempFeature = [];
		var tempLabel,tempLabelMatch,tempName="undefined";
		tempLabel=1;
		tempLabelMatch=1;
		_.each(featureInput,function(feature){
			if(feature.name=="label"){
				tempLabel=1;
				if(tempLabel>tempLabelMatch){
					tempFeature.push({"name":"additionalFeature","value":tempName});
				}
				tempFeature.push(feature);
				tempLabelMatch=1;
				tempName=feature.value;
			}
			else{
				tempLabel=0;
				tempLabelMatch=0;
				tempFeature.push(feature);

			}

		});
		tempFeature.push({"name":"additionalFeature","value":tempName});
		featureInput = tempFeature;
		var temp = $("#mainFrameButton.btn-info").text();
		
		var tmp = $("#subFrameButton.btn-info").text();
		
		featureInput.unshift(tmp);
		featureInput.unshift(temp);
		Meteor.call("addFeature",featureInput);
		Session.set("toggle",!Session.get("toggle"));
	}

};

$(function(){
	prevMain = this;
	prevSub = this;
	$("#singleFeatureButton").live('click',function(e){
		e.preventDefault();
		$(this).prev().append('<input name="feature" type="text"/>');
	});
	$("#remSingleFeature").live('click',function(e){
		e.preventDefault();
		$(this).prev().prev().children('input:last-child').remove();
	});
	
	$("#mainFrameButton").live("click",function(e){
			e.preventDefault();
			text = $(this).text();
			Session.set("current",text);
			$(prevMain).removeClass("btn-info");
			$(this).addClass("btn-info");
			prevMain = this;
			
	});
	$('#subFrameButton').live('click',function(e){
		e.preventDefault();
		$(prevSub).removeClass("btn-info");
		$(this).addClass("btn-info");
		prevSub = this;
	});
});
