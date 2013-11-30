shopAddProducts = function(sub,brand,idList,limit){
	if(_.isEmpty(brand))
		return Products.find({_id:{$nin:idList},'Sub':sub},{fields:{'Brand':1,'ProductName':1,'ModelID':1,'Image':1},limit:limit}).fetch();
	else
		return Products.find({_id:{$nin:idList},'Sub':sub,'Brand':{$in:brand}},{fields:{'Brand':1,'ProductName':1,'ModelID':1,'Image':1},limit:limit}).fetch();
};

getProductInShop = function(id){
	if(Meteor.users.findOne({_id:id},{fields:{_id:0,productId:1}})!=undefined && Meteor.users.findOne({_id:id},{fields:{_id:0,productId:1}}).productId!=undefined)
		return Meteor.users.findOne({_id:id},{fields:{_id:0,productId:1}}).productId;
	else
		return [];
	
};
homeProductList = function(idList,sub,brand,limit){
	if(_.isEmpty(brand))
		return Products.find({_id:{$in:idList},'Sub':sub},{fields:{'Brand':1,'ProductName':1,'ModelID':1,'Image':1},limit:limit}).fetch();
	else
		return Products.find({_id:{$in:idList},'Sub':sub,'Brand':{$in:brand}},{fields:{'Brand':1,'ProductName':1,'ModelID':1,'Image':1},limit:limit}).fetch();
};
homeProductDetail = function(id){
	return Products.findOne({'_id':id});
}
