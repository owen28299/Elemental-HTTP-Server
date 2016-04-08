function deleteMethod (request, response){
      var fs = require('fs');
      var url = request.url;
      var code = 200;

      function replaceAt(string, index, newtext) {
        return string.substring(0, index) + newtext + string.substring(index + 1);
      }

      var responseBody = {
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
            fs.readFile("./public/index.html", 'utf8', function(error, data){
              var indexFile = data;
              var newIndex = fs.createWriteStream("./public/index.html");
              var toDelete = indexFile.indexOf(url);
              var totalFiles = fs.readdirSync('./public').length - 4;
              var newHTML = indexFile.substring(0,toDelete - 13) + indexFile.substring(toDelete + url.length + 11 + 9) + "\n";
              newHTML = replaceAt(newHTML, newHTML.indexOf("<span>") + 6, totalFiles);
              newIndex.write(newHTML);
            });

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

}

module.exports = deleteMethod;