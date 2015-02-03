function GrueConsole(element, options) {
  "use strict";

  //var self = this;
  if (!element) return;

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
  var grueContent = '';
  var appendQueue = [];

  fillBackground();

  function appendLine(content, cb) {
    appendQueue[appendQueue.length] = content;
    // need any array of callbacks?
    if (!isScrolling) {
      updateConsole(cb);
    }
  }

  function updateConsole(cb) {
    if (appendQueue.length === 0) {
      console.log('q empty');
      isScrolling = false;
      if (cb) cb();
      return;
    }
    var content = appendQueue[0];
    appendQueue = appendQueue.slice(1);

    scrollOffset = getFontSize();
    isScrolling = true;
    currentChar = 0;
    if (grueContent.length === 0) {
      grueContent += grueContent === '' ? content : '\n' + content;
      typeInterval(function () {
          updateConsole(cb);
      });
    } else {

      scrollInterval(function () {
        grueContent += grueContent === '' ? content : '\n' + content;
        typeInterval(function () {
          updateConsole(cb);
        })
      })
    }
  }

  function typeInterval(cb) {

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
    var splitContent = grueContent.split('\n');
    for (var i = splitContent.length - 1; i >= 0; i--) {
      var line = splitContent[i];
      context.fillText(line, drawX, drawY - scrollOffset + getFontSize());
      drawY -= getFontSize();
    }
  }

  function fillBackground() {
    context.fillStyle = options.backgroundColor;
    context.fillRect(0, 0, options.width, options.height);
  }

  function getFontSize() {
    return parseInt(options.font);
  }

  return {
    appendLine: appendLine
  }
}
