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
          words: ['a','e','i','o','u'],
          color: '#ffff00',
          caseSensitive: true,
          resizable: false,
          debug: false,
          beforeParse: 0,
          afterParse: 0,
          onResize: 0
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
          
          // real relative textarea position
          var topMargin = eval(toPx($textarea.css('margin-top'))+toPx($textarea.css('border-top-width'))+toPx($textarea.css('padding-top'))),
              leftMargin = eval(toPx($textarea.css('margin-left'))+toPx($textarea.css('border-left-width'))+toPx($textarea.css('padding-left')));
          
          // apply css
          cloneCss($textarea, $main, [
            'float','vertical-align'
          ]);
          
          $main.css({
              'position':     'relative',
              'overflow':     'hidden',
              'width':        $textarea.outerWidth(true), /* r */
              'height':       $textarea.outerHeight(true) /* r */
          });
          
          cloneCss($textarea, $highlighterContainer, [
            'background','background-image','background-color','background-position','background-repeat','background-origin','background-clip','background-size'
          ]);
          
          $highlighterContainer.css({
              'position':     'absolute',
              'top':          topMargin+'px',
              'left':         leftMargin+'px',
              'width':        $textarea.width(), /* r */
              'height':       $textarea.height(), /* r */
              'border':       'none',
              'padding':      '0',
              'margin':       '0',
              'overflow':     'hidden'
          });
          
          cloneCss($textarea, $highlighter, [
            'font-size','font-family','font-style','font-weight'
          ]);
          
          $highlighter.css({
              'position':     'absolute',
              'top':          '0', /**/
              'left':         '0',
              'width':        $textarea.width(), /**/
              'height':       $textarea.height(), /* r */
              'border':       'none',
              'padding':      '0', /**/
              'margin':       '0',
              'color':        'transparent',
              'cursor':       'text',
              'overflow':     'hidden'
          });
          
          $textarea.css({
              'position':     'absolute',
              'left':         '0',
              'top':          '0',
              'background':   'none',
              'resize':       'none'
          });
          
          if (options.debug) {
            $highlighter.css({
                'color':      '#f00'
            });
          }
          
          // apply the hooks
          $highlighter.bind('click', function() {
              $textarea.focus();
          });
          
          $textarea.bind({
              'keyup': function() {
                applyText($textarea.val());
              },
              'scroll': function() {
                updateSizePosition();
              },
              'resize': function() {
                updateSizePosition(true);
              }
          });
          
          if (options.resizable) {
              $textarea.resizable({
                handles: "se",
                resize: function() { 
                    updateSizePosition(); 
                }
              });
              $(".ui-resizable-se").css({
                  'bottom':  '13px',
                  'right':   '1px'
              });
          }
          
          applyText($textarea.val());
          
          // applyText: replace $highlighter html with formated $textarea contents         
          function applyText(text) {
              if (options.beforeParse != 0) {
                  text = options.beforeParse(text, options, $textarea, $highlighter);
              }
              text = replaceAll(text, '\n', '<br/>');
              text = replaceAll(text, '  ', '&nbsp;&nbsp;');

              replace = options.words[0];
              for (var i=1;i<options.words.length;i++) replace+= '|'+options.words[i];
              text = replaceAll(text, replace, "<span style=\"background-color:"+options.color+";\">$1</span>");

              if (options.afterParse != 0) {
                  text = options.afterParse(text, options, $textarea, $highlighter);
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
              if (options.resizable || forced) {
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
                  $highlighter.css({
                      'width':         $textarea.width()-27,
                      'padding-right': '27px'
                  });
              } else {
                  $highlighter.css({
                      'width':         $textarea.width()-10,
                      'padding-right': '10px'
                  });
              }
              
              // follow scroll
              $highlighter.css({
                  'top':     '-'+$textarea.scrollTop()+'px',
                  'height':  $highlighter.height()+$textarea.scrollTop()
              });
              
              // callback
              if (options.onResize != 0) {
                  options.onResize($highlighter, $textarea, options);
              }
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
      });
      
      return this;
  };
})(jQuery);