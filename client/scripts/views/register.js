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
      var username = t.find('#shop-username').value;
      var shopname = t.find('#shop-shopname').value;
      var password = t.find('#shop-password').value;
      var address = t.find('#shop-shopaddress').value;
      var shopLatitude = t.find('#shopLatitude').value;
      var shopLongitude =t.find('#shopLongitude').value; 
      var contactname = t.find('#shop-contactname').value;
      var contactnum = t.find('#shop-contactnum').value;
      Accounts.createUser({username: username,shopname: shopname, password : password, address: address, contactname: contactname, contactnum: contactnum,shopLatitude:shopLatitude, shopLongitude:shopLongitude, usertype: 'shop'}, function(err){
          if (err) {
            alert('Could not create');
            // Inform the user that account creation failed
          } else {
            App.router.navigate('dashboard',{trigger:true});
            // Success. Account has been created and the user
            // has logged in successfully. 
          }

        });
      return false;
    },
    'submit #register-form-brand' : function(e, t) {
      e.preventDefault();
      var username = t.find('#brand-username').value;
      var brandname = t.find('#brand-brandname').value;
      var password = t.find('#brand-password').value;
      var contactname = t.find('#brand-contactname').value;
      var contactnum = t.find('#brand-contactnum').value;

        // Trim and validate the input

      Accounts.createUser({username: username,brandname: brandname, password : password, contactname: contactname, contactnum: contactnum, usertype: 'brand'}, function(err){
          if (err) {
            alert(err);
            // Inform the user that account creation failed
          } else {
            App.router.navigate('dashboard',{trigger:true});
          }

        });

      return false;
    },
    'click #shopRegisterBtn':function(e,t){
      e.preventDefault();
      Session.set("regSelect",true);
    },
    'click #brandRegisterBtn':function(e,t){
      e.preventDefault();
      Session.set("regSelect",false);
    },
    'click #getLocation':function(e,t){
      e.preventDefault();
      Meteor.call('getLocation');
    }
 });
