'use strict';

function postMethod(request, response, acceptableFields){
  var fs = require('fs');

  var domGen = require('./domGenerator.js');
  var toHTML = domGen();

  var fieldIsUndefined = false;
  var cedObj = {};
  var message = "";
  request.on('data', function(data){
    message += data;
  });

  function replaceAt(string, index, newtext) {
    return string.substring(0, index) + newtext + string.substring(index + 1);
  }

  var responseBody = {
      "success" : true
  };


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
          var totalFiles = fs.readdirSync('./public').length - 4;
          var prepend = indexFile.indexOf("prepend") + 9;
          var newHTML = replaceAt(indexFile, prepend, "\n    <li><a href=\'/" + cedObj.elementName + ".html\'>" + cedObj.elementName + "</a>" + "</li>\n");
          newHTML = replaceAt(newHTML, newHTML.indexOf("<span>") + 6, totalFiles);
          newIndex.write(newHTML);
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

}

module.exports = postMethod;