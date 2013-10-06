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