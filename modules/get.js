'use strict';

function getMethod(request, response){
  var url = request.url;
  var fs = require('fs');

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

module.exports = getMethod;