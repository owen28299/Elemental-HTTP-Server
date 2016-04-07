var http = require('http');
var fs = require('fs');
var domGen = require('./domGenerator.js');
var toHTML = domGen();

function replaceAt(string, index, newtext) {
  return string.substring(0, index) + newtext + string.substring(index + 1);
}

var server = http.createServer();

server.on('request',function(request,response){
  var method = request.method;
  var url = request.url;
  var headers = request.headers;
  var userAgent = headers['user-agent'];

  var cedObj = {};
  var message = "";


  request.on('data', function(data){
    message += data;
  });

  if (method === "POST" && url === "/elements"){

    request.on('end', function(){
      var newFileContents = message.toString().split("&");

      newFileContents = newFileContents.forEach(function(element){
        var key = element.slice(0, element.indexOf("="));
        var value = element.slice(element.indexOf("=") + 1, element.length);

        value = value.replace(/\+/g, " ");
        value = value.replace(/%2C/g, ",");
        cedObj[key] = value;

      });

      var htmlDoc = toHTML.elementsTemplate(cedObj.elementName, cedObj.elementSymbol, cedObj.elementAtomicNumber, cedObj.elementDescription);

      fs.stat("./public/" + cedObj.elementName + ".html", function(error){
        if(error){
          var newFile = fs.createWriteStream("./public/" + cedObj.elementName + ".html");
          newFile.write(htmlDoc);


          fs.readFile("./public/index.html", 'utf8', function(error, data){
            var indexFile = data;
            var newIndex = fs.createWriteStream("./public/index.html");
            var prepend = indexFile.indexOf("prepend") + 9;
            newIndex.write(replaceAt(indexFile, prepend, "\n    <li><a href=\'/" + cedObj.elementName + ".html\'>" + cedObj.elementName + "</a>" + "</li>\n"));
          });
        }
        else {
          console.log("file already exists");
        }
      });
    });

    var responseBody = {
      "success" : true
    };

    response.writeHead(200, {
      'Content-Type': 'application/json',
    });

    response.write(JSON.stringify(responseBody));
    response.end();

  }


  if (method === "GET"){

    if (url === "/" || url === " "){
      url = "./index.html";
    }

    fs.stat("./public/" + url, function(error){

      if(error){
        fs.readFile("./public/404.html", 'utf8', function(error, data){

        response.write(data.toString());
        response.end();
        });
      }

      else{
        fs.readFile("./public/" + url, 'utf8', function(error, data){

        response.write(data.toString());
        response.end();
        });
      }

    });

  }

  if (method === "PUT"){

    request.on('end', function(){
      var newFileContents = message.toString().split("&");

      newFileContents = newFileContents.forEach(function(element){
        var key = element.slice(0, element.indexOf("="));
        var value = element.slice(element.indexOf("=") + 1, element.length);

        value = value.replace(/\+/g, " ");
        value = value.replace(/%2C/g, ",");
        cedObj[key] = value;

      });

      var htmlDoc = toHTML.elementsTemplate(cedObj.elementName, cedObj.elementSymbol, cedObj.elementAtomicNumber, cedObj.elementDescription);

      fs.stat("./public/" + url, function(error){
        if(error){
          console.log("file does not exist");
        }
        else {
          var newFile = fs.createWriteStream("./public/" + url);
          newFile.write(htmlDoc);
          }
      });
    });

    var responseBdy = {
      "success" : true
    };

    response.writeHead(200, {
      'Content-Type': 'application/json',
    });

    response.write(JSON.stringify(responseBdy));
    response.end();

  }

  if (method === "DELETE" ){

    var responsebody = {
      "success" : false
    };

    if(url.indexOf('index') === -1){
      fs.unlink("./public/" + url, function(error){

      });

      responsebody.success = true;
    }

    else {
      responsebody.success = false;
      responsebody.error = "resource " + url + " does not exist";
    }


    response.writeHead(200, {
      'Content-Type': 'application/json',
    });

    response.write(JSON.stringify(responsebody));
    response.end();
  }

  request.on('error', function(error){
    console.log('error', error);
  });


});

server.listen({port: 8080}, function(){
  var address = server.address();
  console.log("server running at on %j", address.port);
});