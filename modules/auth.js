'use strict';

function auth(issue, request, response){

  if(issue === "no header"){
    response.writeHead(401, {
      'Content-Type': 'text/html',
      'WWW-Authenticate' : "Basic realm='Secure Area'"
    });

    response.write("<html><body>Not Authorized</body></html>");
    return response.end();
  }

  else {

    var users = require('../users.js');
    var method = request.method;

    var encodedString = request.headers.authorization;
    encodedString = encodedString.substring(encodedString.indexOf("Basic ") + 6);

    var base64Buffer = new Buffer(encodedString, 'base64');
    var decodedString = base64Buffer.toString();
    decodedString = decodedString.split(":");

    if (method !== 'GET' && decodedString[1] !== users[decodedString[0]]) {

      response.writeHead(401, {
        'Content-Type': 'text/html',
      });

      response.write("<html><body>Invalid Authentication Credentials</body></html>");
      response.end();

      return false;

    }

    else {
      return true;
    }

  }

}

module.exports = auth;