function DomGen(){

  function makeTop(title) {

    return "<!DOCTYPE html>" + "\n" +
           "<html lang='en'>" + "\n" +
           "<head>" + "\n" +
           "  <meta charset='UTF-8'>" + "\n" +
           "  <title>" + title + "</title>" + "\n" +
           "  <link rel='stylesheet' href='/css/styles.css'>" + "\n" +
           "</head>" + "\n" +
           "<body>" + "\n\n";

  }

  function makeClose(){

    return "\n</body>\n</html>";

  }

  function makeElement(element, innerHTML, attribute){
    if (attribute !== undefined){
      return "<" + element + " " + attribute.name + "=" + "'" + attribute.value + "'" + ">" + innerHTML + "</" + element + ">";
    }

    return "  <" + element + ">" + innerHTML + "</" + element + ">";
  }


  function elementsTemplate(name, symbol, number, des){
    var elementsHTML = "";

    elementsHTML += makeTop(name);
    elementsHTML += makeElement('h1',name) + "\n";
    elementsHTML += makeElement('h2', symbol) + "\n";
    elementsHTML += makeElement('h3', "Atomic number " + number) + "\n";
    elementsHTML += makeElement('p', des) + "\n";
    elementsHTML += makeElement('p', makeElement('a', "back", {name: 'href', value: '/'})) + "\n";
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