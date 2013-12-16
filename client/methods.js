
Meteor.methods({
	FilterByPrice: function(collection,min,max){
		console.log('called price filtering!!')
		var prods = [];
		collection.forEach(function(obj){
			if(min == 0 && max == 0)
				var p = Prices.find({'shopId':shopid,'productId':obj._id,'price': {$gt: 0}}).fetch()[0];
			if(max)
		  		var p = Prices.find({'shopId':shopid,'productId':obj._id,'price': {$gte: min, $lte: max}}).fetch()[0];
		    console.log('price is');
		    if(p != undefined){
		      	console.log(p.price);
		        console.log('passed price test!!');
		        obj.price = p.price;
		        prods.push(obj);
		    }
		});
		return prods;
	}
});