function onOpen(e) {
  DocumentApp.getUi().createAddonMenu()
      .addItem('Start', 'showSidebar')
      .addToUi();
}

function onInstall(e) {
  onOpen(e);
}

function showSidebar() {
  var ui = HtmlService.createHtmlOutputFromFile('sidebar')
      .setTitle('Readwise');
  DocumentApp.getUi().showSidebar(ui);
}

/**
 * Gets the text the user has selected. If there is no selection,
 * this function displays an error message.
 */
function getSelectedText() {
  var selection = DocumentApp.getActiveDocument().getSelection();
  var text = [];
  if (selection) {
    var elements = selection.getSelectedElements();
    for (var i = 0; i < elements.length; ++i) {
      if (elements[i].isPartial()) {
        var element = elements[i].getElement().asText();
        var startIndex = elements[i].getStartOffset();
        var endIndex = elements[i].getEndOffsetInclusive();
        text.push(element.getText().substring(startIndex, endIndex + 1));
      } else {
        var element = elements[i].getElement();
        if (element.editAsText) {
          var elementText = element.asText().getText();
          if (elementText) {
            text.push(elementText);
          }
        }
      }
    }
  }
  if (!text.length) throw new Error('Please select some text.');
  return text;
}

/**
* Gets the stored readwise auth key.
*/
function getReadwiseAuthKey() {
  var userProperties = PropertiesService.getUserProperties();
  return userProperties.getProperty('READWISE_AUTH_KEY');
}

/**
* Saves the readwise authkey if requested by the user and sends the highlighted text to readwise.
*/
function sendSelectedTextToReadwise(authKey, saveAuthKey) {
  if (saveAuthKey) {
    PropertiesService.getUserProperties()
        .setProperty('READWISE_AUTH_KEY', authKey);
  }
  var text = getSelectedText().join('\n');
  return readwise(text, authKey);
}

/**
* A wraper function for Readwise API.
*/
function readwise(text, authKey) {
  var document = DocumentApp.getActiveDocument();
  var data = {
  'highlights': [
    {
      'text': text,
      'title': document.getName(),
    },
  ],
  };
  var options = {
    'method' : 'POST',
    'contentType': 'application/json',
    'headers': {
      'Authorization': 'Token ' + authKey,
    },
    'payload' : JSON.stringify(data)
  };
  return UrlFetchApp.fetch('https://readwise.io/api/v2/highlights/', options);
}
