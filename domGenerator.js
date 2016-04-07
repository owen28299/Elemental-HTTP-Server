function DomGen(){

  function makeTop(title) {

    return "<!DOCTYPE html>" + "\n" +
           "<html lang='en'>" + "\n" +
           "<head>" + "\n" +
           "  <meta charset='UTF-8'>" + "\n" +
           "  <title>" + title + "</title>" + "\n" +
           "</head>" + "\n" +
           "<body>" + "\n\n";

  }

  function makeClose(){

    return "\n</body>\n</html>";

  }

  function makeElement(element, innerHTML){
    return "  <" + element + ">" + innerHTML + "</" + element + ">\n";
  }

  function elementsTemplate(name, symbol, number, des){
    var elementsHTML = "";

    elementsHTML += makeTop(name);
    elementsHTML += makeElement('h1',name);
    elementsHTML += makeElement('h2', symbol + " " + number);
    elementsHTML += makeElement('p', des);
    elementsHTML += makeClose();

    return elementsHTML;
  }

  return {
    makeTop : makeTop,
    makeClose : makeClose,
    makeElement : makeClose,
    elementsTemplate : elementsTemplate
  };

}

module.exports = DomGen;