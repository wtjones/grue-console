function GrueConsole(parentElement, options) {
  "use strict";

  if (!parentElement) return;
  var element = document.createElement('canvas');

  parentElement.appendChild(element);

  var defaultOptions = {
    width: 200,
    height: 200,
    scrollSpeed: 20,
    typeSpeed: 20,
    fontColor: 'green',
    font: '15px "Lucida Console", monospace',
    backgroundColor: 'black'
  }

  // extend via default options
  for (var key in defaultOptions) {
    if (!options.hasOwnProperty(key)) {
      options[key] = defaultOptions[key];
    }
  }

  element.width = options.width;
  element.height = options.height;

  var context = element.getContext("2d");
  context.font = options.font;
  var typeDelay = options.typeSpeed;
  var scrollDelay = options.scrollSpeed;
  var padding = 10;
  var scrollOffset = 0;
  var currentChar;
  var isScrolling = false;
  var callbackQueue = [];
  var appendQueue = [];
  var secondaryQueue = [];
  var lines = [];


  fillBackground();

  function appendLine(content, cb) {
    appendQueue[appendQueue.length] = content;
    if (cb) {callbackQueue[callbackQueue.length] = cb;}
    if (!isScrolling) {
      updateConsole(cb);
    }
  }

  function updateConsole(cb) {
    if (appendQueue.length === 0 && secondaryQueue.length === 0) {
      isScrolling = false;
      return;
    }

    if (secondaryQueue.length === 0) {
      if (appendQueue.length > 0) {
        var addLines = lineToWrappedLines(appendQueue[0]);
        appendQueue = appendQueue.slice(1);
        for (var i = 0; i < addLines.length; i++) {
          secondaryQueue[secondaryQueue.length] = addLines[i];
        }
      }
    }

    scrollOffset = getFontSize();
    isScrolling = true;
    currentChar = 0;
    if (lines.length === 0) {
      lines[lines.length] = secondaryQueue[0];
      secondaryQueue = secondaryQueue.slice(1);

      typeInterval(function () {
          updateConsole(cb);
          dequeCallback();
      });
    } else {

      scrollInterval(function () {
        lines[lines.length] = secondaryQueue[0];
        secondaryQueue = secondaryQueue.slice(1);
        typeInterval(function () {
          updateConsole(cb);
          dequeCallback();
        })
      })
    }
  }

  function typeInterval(cb) {

    var grueContent = getContent();
    var splitContent = grueContent.split('\n');
    scrollOffset = getFontSize();
    context.fillStyle = 'blue';

    var drawY = options.height - padding;
    var drawX = padding;
    var lastLine = splitContent[splitContent.length - 1];
    var line = lastLine.substring(0, currentChar + 0);

    context.fillText(line, drawX, drawY - scrollOffset + getFontSize());
    currentChar++;
    if (currentChar < lastLine.length + 1) {

      setTimeout(function() {
        typeInterval(cb);
      }, typeDelay);
    } else {
      cb();
    }
  }

  function scrollInterval(cb) {
    if (scrollOffset === getFontSize() * 2 ) {
      isScrolling = false;
      cb();
    } else {
      setTimeout(function () {
        scrollOffset++;
        draw();
        scrollInterval(cb);
      }, scrollDelay);
    }
  }


  function draw() {
    fillBackground();
    context.fillStyle = 'green';
    var drawY = options.height - padding;
    var drawX = padding;
    var content = getContent();
    var splitContent = content.split('\n');
    for (var i = splitContent.length - 1; i >= 0; i--) {
      var line = splitContent[i];
      context.fillText(line, drawX, drawY - scrollOffset + getFontSize());
      drawY -= getFontSize();
    }
  }

  function getContent() {
    var content = '';

    for (var i = 0; i < lines.length; i++) {
      var addLine = '';
      var lineWidth = context.measureText(lines[i]).width;
      if (context.measureText(lines[i]).width < element.width) {
        addLine = lines[i];
        content += content === '' ? addLine : '\n' + addLine;
      } else {
        addLine = '';

        var words = lines[i].split(' ');
        while (words.length > 0) {
          //if (addLine !== '') {addLine += '\n';}
          while (context.measureText(addLine).width < element.width && words.length > 0) {
            addLine += addLine === '' ? words[0] : ' ' + words[0];
            words = words.slice(1);
          }
          content += content === '' ? addLine : '\n' + addLine;
          addLine = '';
        }

      }
    }

    return content;
  }

  function lineToWrappedLines(line) {

    var result = [];
    var inLines = [];

    inLines = line.split('\n');
    for (var i = 0; i < inLines.length; i++) {
      var addLine = '';
      var lineWidth = context.measureText(inLines[i]).width;
      if (context.measureText(inLines[i]).width < element.width) {
        result[result.length] = inLines[i];
      } else {
        addLine = '';

        var words = inLines[i].split(' ');
        while (words.length > 0) {
          while (context.measureText(addLine).width < element.width && words.length > 0) {
            addLine += addLine === '' ? words[0] : ' ' + words[0];
            words = words.slice(1);
          }
          result[result.length] = addLine;
          addLine = '';
        }

      }
    }
    return result;
  }

  function dequeCallback() {
    if (callbackQueue.length > 0) {
      var cbTemp = callbackQueue[0];
      callbackQueue = callbackQueue.splice(1);
      cbTemp();
    }
  }

  function clear() {
    lines = [];
    appendQueue = [];
  }

  function fillBackground() {
    context.fillStyle = options.backgroundColor;
    context.fillRect(0, 0, options.width, options.height);
  }

  function getFontSize() {
    return parseInt(options.font);
  }

  return {
    appendLine: appendLine,
    clear: clear
  }
}
