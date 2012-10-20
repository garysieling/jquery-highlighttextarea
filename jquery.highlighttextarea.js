/**
 * jQuery highlightTextarea 1.0
 *
 * Copyright 2012, Damien "Mistic" Sorel
 *    http://www.strangeplanet.fr
 *
 * thanks to Julien L for part of the code
 *    http://stackoverflow.com/a/7599199
 *
 * Dual licensed under the MIT or GPL Version 3 licenses.
 *    http://www.opensource.org/licenses/mit-license.php
 *    http://www.gnu.org/licenses/gpl.html
 *
 * Depends:
 *	  jquery.js
 *    jquery-ui.js | resizable (optional)
 */
 
 /*
  * BUGS :
  *   scroll doesn't work in Opera
  *   incompatible with textareas with % dimensions (sizes, margin, padding, border)
  */
 
(function($) {
  $.fn.highlightTextarea = function(options) {
      var defaults = {
          words: [],
          color: '#ffff00',
          caseSensitive: true,
          resizable: false,
          id: null,
          debug: false
      };
      options = $.extend(defaults, options);
      
      options.regParam = 'g';
      if (options.caseSensitive == false) options.regParam+= 'i';
        
      this.each(function() {
          var $textarea = $(this);

          // create necessary wrappers
          $textarea.wrap('<div class="highlightTextarea" />');
          var $main = $textarea.parent('.highlightTextarea');
          $main.prepend('<div class="highlighterContainer"><div class="highlighter"></div></div>');
          var $highlighterContainer = $main.children('.highlighterContainer');
          var $highlighter = $highlighterContainer.children('.highlighter');
          
          // optional id
          if (options.id != null) {
              $main.attr('id', options.id);
          }
          
          // real relative textarea position
          var topMargin = toPx($textarea.css('margin-top'))+toPx($textarea.css('border-top-width')),
              leftMargin = toPx($textarea.css('margin-left'))+toPx($textarea.css('border-left-width'));
          
          // the main container must have same sizes and position than the original textarea
          cloneCss($textarea, $main, [
            'float','vertical-align'
          ]);
          
          $textarea.css({
              'word-break': 'normal',
              'word-wrap': 'normal',
              });
          
          $main.css({
              'width':        $textarea.outerWidth(true), /* r */
              'height':       $textarea.outerHeight(true) /* r */
          });
          
          // the highlighter container is positionned at "real" top-left corner of the textarea and takes its background
          cloneCss($textarea, $highlighterContainer, [
            'background','background-image','background-color','background-position','background-repeat','background-origin','background-clip','background-size',
            'padding-top','padding-right','padding-bottom','padding-left'
          ]);
          $highlighterContainer.css({
              'top':          topMargin+'px',
              'left':         leftMargin+'px',
              'width':        $textarea.width(), /* r */
              'height':       $textarea.height(), /* r */
          });
          
          // the highlighter has the same sizes than the inner textarea and must have same font properties
          cloneCss($textarea, $highlighter, [
            'font-size','font-family','font-style','font-weight','line-height',
            'vertical-align','word-spacing','text-align'
          ]);
          $highlighter.css({
              'width':        $textarea.width(), /* r */
              'height':       $textarea.height(), /* r */
          });
          
          // now make the textarea transparent to see the highlighter throught
          $textarea.css({
              'background':   'none',
          });
          
          // display highlighter text for debuging
          if (options.debug) {
            $highlighter.css({
                'color':      '#f00'
            });
          }
          
          // prevend positionning errors by allways focusing the textarea
          $highlighter.bind('click', function() {
              $textarea.focus();
          });
          
          // add triggers
          $textarea.bind({
              'keyup': function() {
                condensator(function() {
                  applyText($textarea.val());
                }, 200, 500);
              },
              'scroll': function() {
                updateSizePosition();
              },
              'resize': function() {
                updateSizePosition(true);
              }
          });
          
          // resizable with jquery-ui
          if (options.resizable) {
              if (jQuery.ui) { 
                  $textarea.resizable({
                    handles: "se",
                    resize: function() { 
                        updateSizePosition(true); 
                    }
                  });
                  $(".highlightTextarea .ui-resizable-se").css({
                      'bottom':  '13px',
                      'right':   '1px'
                  });
              }
          }
          
          // and finally make a first parse
          applyText($textarea.val());
          
          // applyText: replace $highlighter html with formated $textarea contents         
          function applyText(text) {
              text = html_entities(text);
              text = replaceAll(text, '\n ', '\n&nbsp;');
              text = replaceAll(text, '\n', '<br/>');
              text = replaceAll(text, '  ', '&nbsp;&nbsp;');
              
              if (options.words.length > 0) {
                replace = new Array();
                for (var i=0;i<options.words.length;i++) replace[i] = html_entities(options.words[i]);
                text = replaceAll(text, replace.join('|'), "<span class=\"highlight\" style=\"background-color:"+options.color+";\">$1</span>");
              }
              
              $highlighter.html(text);
              updateSizePosition();
          }
          
          // replaceAll
          function replaceAll(txt, replace, with_this) {
              return txt.replace(new RegExp('('+replace+')', options.regParam), with_this);
          }
          
          // updateSizePosition: adapt $highlighter size and position according to $textarea size and scroll bar
          function updateSizePosition(forced) {              
              // resize containers
              if (forced) {
                  $main.css({
                      'width':         $textarea.outerWidth(true),
                      'height':        $textarea.outerHeight(true)
                  });
                  $highlighterContainer.css({
                      'width':         $textarea.width(),
                      'height':        $textarea.height()
                  });
                  $highlighter.css({
                      'height':        $textarea.height()
                  });
              }
              
              
              // adapt width with textarea width and scroll bar
              if (
                ($textarea[0].clientHeight < $textarea[0].scrollHeight && $textarea.css('overflow') != 'hidden' && $textarea.css('overflow-y') != 'hidden')
                || $textarea.css('overflow') == 'scroll' || $textarea.css('overflow-y') == 'scroll'
              ) {
                  var padding = 25;
              } else {
                  var padding = 9;
              }
              
              
              
              // follow scroll
              $highlighter.css({
                  'width':          ($textarea.width()-padding) +'px',
                  'padding-right':  padding +'px',
                  'top':            -$textarea.scrollTop()+'px',
                  'height':         $textarea.height()+$textarea.scrollTop()
              });
          }

          // cloneCss: set 'to' css attributes listed in 'what' as defined for 'from'
          function cloneCss(from, to, what) {
            for (var i=0;i<what.length;i++) {
              to.css(what[i], from.css(what[i]));
            }
          }
          
          // toPx: clean/convert px and em size to px size (without 'px' suffix)
          function toPx(value) {
              if (value != value.replace('em', '')) {
                  // https://github.com/filamentgroup/jQuery-Pixel-Em-Converter
                  var that = parseFloat(value.replace('em', '')),
                      scopeTest = jQuery('<div style="display: none; font-size: 1em; margin: 0; padding:0; height: auto; line-height: 1; border:0;">&nbsp;</div>').appendTo('body'),
                      scopeVal = scopeTest.height();
                  scopeTest.remove();
                  return Math.round(that * scopeVal);
                  
              } else if (value != value.replace('px', '')) {
                  return parseInt(value.replace('px', ''));
                  
              } else {
                  return parseInt(value);
              }
          }
          
          function html_entities(value) {
              if (value) {
                  return jQuery('<div />').text(value).html();
              } else {
                  return '';
              }
          }
      });
      
      return this;
  };
})(jQuery);

var condensator = (function(){
    var timer = null;
    var startTime = null;
    
    return function(callback, ms, limit) {
        if (limit==null) {
          limit=ms;
        }
        
        var date = new Date();
        clearTimeout (timer);
        
        if (startTime==null) {
            startTime = date.getTime();
        }
        
        if (date.getTime() - startTime > limit) {
            callback.call();
            startTime = date.getTime();
        }
        else {
            timer = setTimeout(callback, ms);
        }
    };
})();