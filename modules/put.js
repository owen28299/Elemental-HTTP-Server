'use strict';

function putMethod(request, response, acceptableFields){

      var domGen = require('./domGenerator.js');
      var toHTML = domGen();

      var url = request.url;
      var message = "";
      request.on('data', function(data){
        message += data;
      });

      var fieldIsUndefined = false;
      var fs = require('fs');
      var responseBody = {
        "success" : true,
      };

      request.on('end', function(){

        var cedObj = {};

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
}

module.exports = putMethod;