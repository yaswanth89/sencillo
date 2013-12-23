var connect = Npm.require('connect');
var base64url = Meteor.require('base64url');
var Fiber = Npm.require('fibers');
var app = WebApp.connectHandlers;
var post, get;

app
  // parse the POST data
  .use(connect.bodyParser())
  // parse the GET data
  .use(connect.query())
  // intercept data and send continue
  .use(function(req, res, next) {
    post = req.body;
    get = req.query;
    if(req.url != "/fbPageApp"){
      return next();
    }
    else{
      // var appData = ApiKeys.findOne({"name":"facebook"});
      secret = "f63f6828077adcbc8d2bc6dea5df89e7";
      if(post.signed_request != undefined){
        signed_request = post.signed_request;
        encoded_data = signed_request.split('.',2);
        // decode the data
        sig = encoded_data[0];
        json = base64url.decode(encoded_data[1]);
        data = JSON.parse(json); // ERROR Occurs Here!
        
        // check algorithm - not relevant to error
        if (!data.algorithm || data.algorithm.toUpperCase() != 'HMAC-SHA256') {
            console.error('Unknown algorithm. Expected HMAC-SHA256');
            return null;
        }
        Fiber(function(){
          var str = "<html><head><link src='https://"+req.headers.host+"/style/canvas.css' type='text/css' rel='stylesheet' /></head><body>";
          var shop = Meteor.users.findOne({"shopFbPage":data.page.id},{"fields":{"_id":1}});
          Prices.find({"shopId":shop._id,"Featured":1}).forEach(function(e){
            var product = Products.findOne({"_id":e.productId},{fields:{"Image":1,"ProductName":1,"ModelID":1,"Brand":1}});
            str += "<div class='product'> <img src='"+ product.Image[0] +"' /> <span class='name'>"+product.ProductName+"</span> <span class='model'>"+product.ModelID+"</span><span class='brand'>"+product.Brand+"</span> <span class='price'>"+e.price+"</span></div>";
          });
          str += "</body></html>";
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.end(str);
        }).run();
      }
      else{
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end("ERROR");
      }
    }
  });