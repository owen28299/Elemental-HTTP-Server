var http = require('http');
var fs = require('fs');
var domGen = require('./domGenerator.js');
var toHTML = domGen();

var server = http.createServer();

server.on('request',function(request,response){
  var method = request.method;
  var url = request.url;
  var headers = request.headers;
  var userAgent = headers['user-agent'];

  var cedObj = {};
  var message = "";

  console.log('method', method);
  console.log('url', url);

  request.on('data', function(data){
    console.log('data.toString()', data.toString());
    message += data;
  });

  if (method === "POST" && url === "/elements"){

    request.on('end', function(){
      var newFileContents = message.toString().split("&");

      newFileContents = newFileContents.forEach(function(element){
        var key = element.slice(0, element.indexOf("="));
        var value = element.slice(element.indexOf("=") + 1, element.length);

        value = value.split("+").join(" ");

        cedObj[key] = value;
      });

      var htmlDoc = toHTML.elementsTemplate(cedObj.elementName, cedObj.elementSymbol, cedObj.elementAtomicNumber, cedObj.elementDescription);

      var newFile = fs.createWriteStream("./public/" + cedObj.elementName + ".html");
      newFile.write(htmlDoc);
      console.log("end of request");
    });

  }

  else if (method === "GET"){

    request.on('end', function(data){

    });


  }


  request.on('error', function(error){
    console.log(error.stack);
  });

  response.writeHead(200, {
    'Content-Type': 'application/json',
  });

  var responseBody = {
    "success" : true
  };

  response.write(JSON.stringify(responseBody));
  response.end();

});

server.listen({port: 8080}, function(){
  var address = server.address();
  console.log("server running at on %j", address.port);
});