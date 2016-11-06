var Common = (function() {
  return {
    buildDomElement: buildDomElementFromJson,
    fireEvent: fireEvent,
    listForEach: listForEach
  };

  function buildDomElementFromJson(domJson) {
    var element = document.createElement(domJson.tagName);

    if (domJson.text) {
      element.innerHTML = domJson.text;
    } else if (domJson.html) {
      element.insertAdjacentHTML('beforeend', domJson.html);
    }
    if (domJson.classNames) {
      for (var i = 0; i < domJson.classNames.length; i++) {
        element.classList.add(domJson.classNames[i]);
      }
    }
    if (domJson.attributes) {
      for (var j = 0; j < domJson.attributes.length; j++) {
        var currentAttribute = domJson.attributes[j];
        element.setAttribute(currentAttribute.name, currentAttribute.value);
      }
    }
    if (domJson.children) {
      for (var k = 0; k < domJson.children.length; k++) {
        var currentChild = domJson.children[k];
        element.appendChild(buildDomElementFromJson(currentChild));
      }
    }
    return element;
  }

  function fireEvent(element, event) {
    var evt;
    if (document.createEventObject) {
      evt = document.createEventObject();
      return element.fireEvent('on' + event, evt);
    }
    evt = document.createEvent('HTMLEvents');
    evt.initEvent(event, true, true); 
    return !element.dispatchEvent(evt);
  }
  
  function listForEach(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback.call(null, list[i]);
    }
  }
}());
