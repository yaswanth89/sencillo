this.Router = Backbone.Router.extend({
	routes:{
		"":"default",
		"/:page":"home",
		"shopAdd": "shopAdd",
		"shopEdit": "shopEdit",
		"shopDetails": "shopDetails",
		"dashboard":"dashboard",
		"framework/p:page":"framework",
		"brandedit":"brandEdit",
		"brand":"brand",
		"login":"login",
		"admin":"admin",
		"register": "register",
		"cv/:shop":'customerView',
		"cv/:shop/:product": 'customerView',
		"shop":"shop",
		"search/:query":"search",
		"shop/p:page":"shopForm",
		"*path":"home",
		"loggedin": "loggedin"
	},
	view:null,
	page_header_sel:"#header",
	page_parent_sel:"#content",
	shop_sel:"#shopContent",
	initialize:function(){
		this.headerView = new HeaderView();
		return $(this.page_header_sel).replaceWith(this.headerView.render().$el);
	},
	search:function(query){
		return this.go(Home,query+" 1");
	},
	dashboard:function(){
		if(Meteor.userId()==null){
			this.navigate("login", {trigger: true});
			return;
		}
		var router = this;
		Meteor.call('getUserType',function(error,result){
			switch(result){
				case "shop":
					router.go(ShopDashboard);
				break;
				case "brand":
					router.go(BrandDashboard);
				break;
				case 'admin':
					router.go(Framework,page);
				break;
			}
		});
	},
	customerView:function(shop,product){
		var linkReturn = "";
		_.each(shop,function(val){
			if(val=="_"){
				linkReturn+=" ";
			}
			else
				linkReturn+=val;
		});
		console.log(linkReturn);
		window.shopUsername = linkReturn;
		if(product != undefined){
			window.shopProductId = product;
		}
		return this.go(CustomerView);
	},
	shopEdit:function(){
		if(Meteor.userId()==null){
			this.navigate("login", {trigger: true});
			return;
		}
		return this.go(ShopEdit);
	},
	shopDetails:function(){
		if(Meteor.userId()==null){
			this.navigate("login", {trigger: true});
			return;
		}
		return this.go(ShopDetails);
	},
	shopAdd:function(){
		if(Meteor.userId()==null){
			this.navigate("login", {trigger: true});
			return;
		}
		return this.go(ShopAdd);
	},
	home:function(page){
		return this.go(Home,page+" 0");
	},
	default:function(){
		return this.go(Default);
	},
	login:function(){
		if(Meteor.userId()==null){
			return this.go(Login);
		}
		this.navigate("dashboard", {trigger: true});
	},
	admin:function(){
		if(Meteor.userId()==null){
			return this.go(Admin);
		}
		this.navigate("dashboard",{trigger: true});
	},
	register:function(){
		if(Meteor.userId()==null){
			return this.go(Register);
		}
		this.navigate("dashboard", {trigger: true});
	},
	framework:function(page){
		var router = this;
		Meteor.call('getUserType',function(error,result){
			if(result == 'admin')
				router.go(Framework,page);
			else
				router.navigate('admin', {trigger: true});
		});
	},
	shop:function(page){
		return this.go(Shop);
	},
	loggedin:function(page){
		return this.go(Loggedin);
	},
	shopForm:function(page){
		return this.goShop(ShopForm,page);
	},
	brandEdit:function(){
		var router = this;
		Meteor.call('getUserType', function(error,result){
			if(result == 'brand')
				router.go(BrandEdit);
			else
				router.navigate('dashboard',{trigger: true});
		});
	},
	goShop:function(viewClass,page){
		console.log("ok");
		this.view = new viewClass(page);
		this.renderShop();
	},
	renderShop:function(){
		console.log("ok");
		console.log(this.shop_sel);
		return $(this.shop_sel).html(this.view.render().$el);
	},
	go:function(viewClass,page){
		var me = this;
		if(viewClass == null){
			viewClass = Home;
		}
		this.view = new viewClass(page);
		this.render();
	},
	render:function(){
		return $(this.page_parent_sel).html(this.view.render().$el);
	},
	aReplace:function(e){
		var a,route;
		a = document.createElement("a");
		a.href = this.getHref(e.target);
		route = a.pathname+a.search;
		this.navigate(route,{
			trigger:true
		});
		return window.scrollTo(0,0);
	},

	getHref:function(elt){
		if(elt.hasAttribute("href")){
			return elt.href;
		} else{
			return this.getHref(elt.parentElement);
		}
	}
	
});
