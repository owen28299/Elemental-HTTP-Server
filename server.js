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

  var cedObj = {};
  var message = "";
  request.on('data', function(data){
    message += data;
  });

  var acceptableFields = ["elementName", "elementSymbol", "elementAtomicNumber", "elementDescription"];
  var fieldIsUndefined;

  var responseBody = {
      "success" : true
  };

  if(!headers.authorization){

    console.log('headers.authorization', headers.authorization);

    response.writeHead(401, {
      'Content-Type': 'text/html',
      'WWW-Authenticate' : "Basic realm='Secure Area'"
    });

    response.write("<html><body>Not Authorized</body></html>");
    response.end();
  }

  else {

    var encodedString = headers.authorization;
    encodedString = encodedString.substring(encodedString.indexOf("Basic ") + 6);
    console.log('encodedString', encodedString);

    var base64Buffer = new Buffer(encodedString, 'base64');
    var decodedString = base64Buffer.toString();
    decodedString = decodedString.split(":");


    if(method !== 'GET' && decodedString[1] !== users[decodedString[0]]){
      response.writeHead(401, {
        'Content-Type': 'text/html',
      });

      response.write("<html><body>Invalid Authentication Credentials</body></html>");
      response.end();
    }



    else if (method === "POST" && url === "/elements"){
      fieldIsUndefined = false;

      request.on('end', function(){
        var newFileContents = message.toString().split("&");

        newFileContents = newFileContents.forEach(function(element){
          var key = element.slice(0, element.indexOf("="));
          var value = element.slice(element.indexOf("=") + 1, element.length);

          value = value.replace(/\+/g, " ");
          value = value.replace(/%2C/g, ",");
          cedObj[key] = value;

        });


        for (var key in Object.keys(cedObj)){
          if (acceptableFields.indexOf(Object.keys(cedObj)[key]) === -1){
            fieldIsUndefined = true;
          }
        }

        if (fieldIsUndefined === false){

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

            response.writeHead(200, {
              'Content-Type': 'application/json',
            });

            response.write(JSON.stringify(responseBody));
            response.end();
          }
          else {

            response.writeHead(409, {
              'Content-Type': 'application/json',
            });

            responseBody = {
              "success" : false,
              "error" : "File already Exists"
            };

            response.write(JSON.stringify(responseBody));
            response.end();
          }
        });

        }

        else {
            response.writeHead(404, {
              'Content-Type': 'application/json',
            });

            responseBody = {
              "success" : false,
              "error" : "Incorrect field data entered in body"
            };

            response.write(JSON.stringify(responseBody));
            response.end();
        }

      });

    } //End of POST


    else if (method === "GET"){

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

    } //End of GET

    else if (method === "PUT"){

      fieldIsUndefined = false;

      request.on('end', function(){
        var newFileContents = message.toString().split("&");

        newFileContents = newFileContents.forEach(function(element){
          var key = element.slice(0, element.indexOf("="));
          var value = element.slice(element.indexOf("=") + 1, element.length);

          value = value.replace(/\+/g, " ");
          value = value.replace(/%2C/g, ",");
          cedObj[key] = value;

        });

        for (var key in Object.keys(cedObj)){
          if (acceptableFields.indexOf(Object.keys(cedObj)[key]) === -1){
            fieldIsUndefined = true;
          }
        }

        if (fieldIsUndefined === false){

          var htmlDoc = toHTML.elementsTemplate(cedObj.elementName, cedObj.elementSymbol, cedObj.elementAtomicNumber, cedObj.elementDescription);

          fs.stat("./public/" + url, function(error){
            if(error){
              response.writeHead(404, {
                'Content-Type': 'application/json',
              });

              responseBody = {
                "success" : false,
                "error" : "File Not Found"
              };

              response.write(JSON.stringify(responseBody));
              response.end();
            }
            else {
              var newFile = fs.createWriteStream("./public/" + url);
              newFile.write(htmlDoc);

              response.writeHead(200, {
                'Content-Type': 'application/json',
              });

              response.write(JSON.stringify(responseBody));
              response.end();
              }
          });

        }

        else {
          response.writeHead(404, {
            'Content-Type': 'application/json',
          });

          responseBody = {
            "success" : false,
            "error" : "Incorrect Field Titles"
          };

          response.write(JSON.stringify(responseBody));
          response.end();
        }

      });

    } //end of PUT

    else if (method === "DELETE" ){

      var code = 200;

      responseBody = {
        "success" : false
      };

      if(url.indexOf('index') === -1 && url !== "/" && url.indexOf('404') === -1 ){
        fs.unlink("./public/" + url, function(error){

          if(error){
            code = 404;
            response.writeHead(code, {
              'Content-Type': 'application/json',
            });
            responseBody.success = false;
            response.write(JSON.stringify(responseBody));
            response.end();
          }

          else {
            code = 200;
            response.writeHead(code, {
              'Content-Type': 'application/json',
            });

            responseBody.success = true;
            response.write(JSON.stringify(responseBody));
            response.end();
          }

        });

      }

      else if(url.indexOf('index') !== -1 || url === "/" || url.indexOf('404') !== -1 ){

        code = 409;
        response.writeHead(code, {
          'Content-Type': 'application/json',
        });

        responseBody.success = false;
        responseBody.error = "cannot delete " + url;
        response.write(JSON.stringify(responseBody));
        response.end();
      }

      else {

        code = 404;
        response.writeHead(code, {
          'Content-Type': 'application/json',
        });

        responseBody.success = false;
        responseBody.error = "resource " + url + " does not exist";
        response.write(JSON.stringify(responseBody));
        response.end();
      }

    } //end of DELETE

    request.on('error', function(error){
      response.writeHead(400, {
        'Content-Type': 'application/json',
      });

      responseBody = {
        "success" : false,
        "error" : "Bad Request"
      };

      response.write(JSON.stringify(responseBody));
      response.end();
    });

  }//ends authorization IF

});

server.listen({port: 8080}, function(){
  var address = server.address();
  console.log("server running at on %j", address.port);
});