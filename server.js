var http = require('http');

var deleteMethod = require('./modules/delete.js');
var putMethod = require('./modules/put.js');
var getMethod = require('./modules/get.js');
var postMethod = require('./modules/post.js');
var auth = require('./modules/auth.js');

var acceptableFields = ["elementName", "elementSymbol", "elementAtomicNumber", "elementDescription"];

var server = http.createServer();

server.on('request',function(request,response){
  var method = request.method;

  //If no authorization header
  if(!request.headers.authorization){
    auth("no header", null, response);
  }

  //Processes relevant requests if correct password
  if (auth(null, request, response)) {

    if (method === "POST" && request.url === "/elements"){
      postMethod(request, response, acceptableFields);
    }

    else if (method === "GET"){
      getMethod(request, response);
    }

    else if (method === "PUT"){
      putMethod(request, response, acceptableFields);
    }

    else if (method === "DELETE" ){
      deleteMethod(request, response);
    }

  }

});

server.listen({port: 8080}, function(){
  var address = server.address();
  console.log("server running at on %j", address.port);
});