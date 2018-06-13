/*
 * # Semantic - Search
 * http://github.com/jlukic/semantic-ui/
 *
 *
 * Copyright 2013 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

$.fn.search = function(source, parameters) {
  var
    $allModules     = $(this),
    moduleSelector  = $allModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),
    returnedValue
  ;
  $(this)
    .each(function() {
      var
        settings        = $.extend(true, {}, $.fn.search.settings, parameters),

        className       = settings.className,
        selector        = settings.selector,
        error           = settings.error,
        namespace       = settings.namespace,

        eventNamespace  = '.' + namespace,
        moduleNamespace = namespace + '-module',

        $module         = $(this),
        $prompt         = $module.find(selector.prompt),
        $searchButton   = $module.find(selector.searchButton),
        $results        = $module.find(selector.results),
        $result         = $module.find(selector.result),
        $category       = $module.find(selector.category),

        element         = this,
        instance        = $module.data(moduleNamespace),

        module
      ;
      module = {

        initialize: function() {
          module.verbose('Initializing module');
          var
            prompt = $prompt[0],
            inputEvent   = (prompt.oninput !== undefined)
              ? 'input'
              : (prompt.onpropertychange !== undefined)
                ? 'propertychange'
                : 'keyup'
          ;
          // attach events
          $prompt
            .on('focus' + eventNamespace, module.event.focus)
            .on('blur' + eventNamespace, module.event.blur)
            .on('keydown' + eventNamespace, module.handleKeyboard)
          ;
          if(settings.automatic) {
            $prompt
              .on(inputEvent + eventNamespace, module.search.throttle)
            ;
          }
          $searchButton
            .on('click' + eventNamespace, module.search.query)
          ;
          $results
            .on('click' + eventNamespace, selector.result, module.results.select)
          ;
          module.instantiate();
        },
        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },
        destroy: function() {
          module.verbose('Destroying instance');
          $module
            .removeData(moduleNamespace)
          ;
        },
        event: {
          focus: function() {
            $module
              .addClass(className.focus)
            ;
            module.results.show();
          },
          blur: function() {
            module.search.cancel();
            $module
              .removeClass(className.focus)
            ;
            module.results.hide();
          }
        },
        handleKeyboard: function(event) {
          var
            // force latest jq dom
            $result       = $module.find(selector.result),
            $category     = $module.find(selector.category),
            keyCode       = event.which,
            keys          = {
              backspace : 8,
              enter     : 13,
              escape    : 27,
              upArrow   : 38,
              downArrow : 40
            },
            activeClass  = className.active,
            currentIndex = $result.index( $result.filter('.' + activeClass) ),
            resultSize   = $result.size(),
            newIndex
          ;
          // search shortcuts
          if(keyCode == keys.escape) {
            module.verbose('Escape key pressed, blurring search field');
            $prompt
              .trigger('blur')
            ;
          }
          // result shortcuts
          if($results.filter(':visible').size() > 0) {
            if(keyCode == keys.enter) {
              module.verbose('Enter key pressed, selecting active result');
              if( $result.filter('.' + activeClass).size() > 0 ) {
                $.proxy(module.results.select, $result.filter('.' + activeClass) )();
                event.preventDefault();
                return false;
              }
            }
            else if(keyCode == keys.upArrow) {
              module.verbose('Up key pressed, changing active result');
              newIndex = (currentIndex - 1 < 0)
                ? currentIndex
                : currentIndex - 1
              ;
              $category
                .removeClass(activeClass)
              ;
              $result
                .removeClass(activeClass)
                .eq(newIndex)
                  .addClass(activeClass)
                  .closest($category)
                    .addClass(activeClass)
              ;
              event.preventDefault();
            }
            else if(keyCode == keys.downArrow) {
              module.verbose('Down key pressed, changing active result');
              newIndex = (currentIndex + 1 >= resultSize)
                ? currentIndex
                : currentIndex + 1
              ;
              $category
                .removeClass(activeClass)
              ;
              $result
                .removeClass(activeClass)
                .eq(newIndex)
                  .addClass(activeClass)
                  .closest($category)
                    .addClass(activeClass)
              ;
              event.preventDefault();
            }
          }
          else {
            // query shortcuts
            if(keyCode == keys.enter) {
              module.verbose('Enter key pressed, executing query');
              module.search.query();
              $searchButton
                .addClass(className.down)
              ;
              $prompt
                .one('keyup', function(){
                  $searchButton
                    .removeClass(className.down)
                  ;
                })
              ;
            }
          }
        },
        search: {
          cancel: function() {
            var
              xhr = $module.data('xhr') || false
            ;
            if( xhr && xhr.state() != 'resolved') {
              module.debug('Cancelling last search');
              xhr.abort();
            }
          },
          throttle: function() {
            var
              searchTerm    = $prompt.val(),
              numCharacters = searchTerm.length
            ;
            clearTimeout(module.timer);
            if(numCharacters >= settings.minCharacters)  {
              module.timer = setTimeout(module.search.query, settings.searchThrottle);
            }
            else {
              module.results.hide();
            }
          },
          query: function() {
            var
              searchTerm = $prompt.val(),
              cachedHTML = module.search.cache.read(searchTerm)
            ;
            if(cachedHTML) {
              module.debug("Reading result for '" + searchTerm + "' from cache");
              module.results.add(cachedHTML);
            }
            else {
              module.debug("Querying for '" + searchTerm + "'");
              if(typeof source == 'object') {
                module.search.local(searchTerm);
              }
              else {
                module.search.remote(searchTerm);
              }
              $.proxy(settings.onSearchQuery, $module)(searchTerm);
            }
          },
          local: function(searchTerm) {
            var
              results   = [],
              fullTextResults = [],
              searchFields    = $.isArray(settings.searchFields)
                ? settings.searchFields
                : [settings.searchFields],

              searchRegExp   = new RegExp('(?:\s|^)' + searchTerm, 'i'),
              fullTextRegExp = new RegExp(searchTerm, 'i'),
              searchHTML
            ;
            $module
              .addClass(className.loading)
            ;
            // iterate through search fields in array order
            $.each(searchFields, function(index, field) {
              $.each(source, function(label, thing) {
                if(typeof thing[field] == 'string' && ($.inArray(thing, results) == -1) && ($.inArray(thing, fullTextResults) == -1) ) {
                  if( searchRegExp.test( thing[field] ) ) {
                    results.push(thing);
                  }
                  else if( fullTextRegExp.test( thing[field] ) ) {
                    fullTextResults.push(thing);
                  }
                }
              });
            });
            searchHTML = module.results.generate({
              results: $.merge(results, fullTextResults)
            });
            $module
              .removeClass(className.loading)
            ;
            module.search.cache.write(searchTerm, searchHTML);
            module.results.add(searchHTML);
          },
          remote: function(searchTerm) {
            var
              apiSettings = {
                stateContext  : $module,
                url           : source,
                urlData: { query: searchTerm },
                success       : function(response) {
                  searchHTML = module.results.generate(response);
                  module.search.cache.write(searchTerm, searchHTML);
                  module.results.add(searchHTML);
                },
                failure      : module.error
              },
              searchHTML
            ;
            module.search.cancel();
            module.debug('Executing search');
            $.extend(true, apiSettings, settings.apiSettings);
            $.api(apiSettings);
          },

          cache: {
            read: function(name) {
              var
                cache = $module.data('cache')
              ;
              return (settings.cache && (typeof cache == 'object') && (cache[name] !== undefined) )
                ? cache[name]
                : false
              ;
            },
            write: function(name, value) {
              var
                cache = ($module.data('cache') !== undefined)
                  ? $module.data('cache')
                  : {}
              ;
              cache[name] = value;
              $module
                .data('cache', cache)
              ;
            }
          }
        },

        results: {
          generate: function(response) {
            module.debug('Generating html from response', response);
            var
              template = settings.templates[settings.type],
              html     = ''
            ;
            if(($.isPlainObject(response.results) && !$.isEmptyObject(response.results)) || ($.isArray(response.results) && response.results.length > 0) ) {
              if(settings.maxResults > 0) {
                response.results = $.makeArray(response.results).slice(0, settings.maxResults);
              }
              if(response.results.length > 0) {
                if($.isFunction(template)) {
                  html = template(response);
                }
                else {
                  module.error(error.noTemplate, false);
                }
              }
            }
            else {
              html = module.message(error.noResults, 'empty');
            }
            $.proxy(settings.onResults, $module)(response);
            return html;
          },
          add: function(html) {
            if(settings.onResultsAdd == 'default' || $.proxy(settings.onResultsAdd, $results)(html) == 'default') {
              $results
                .html(html)
              ;
            }
            module.results.show();
          },
          show: function() {
            if( ($results.filter(':visible').size() === 0) && ($prompt.filter(':focus').size() > 0) && $results.html() !== '') {
              $results
                .stop()
                .fadeIn(200)
              ;
              $.proxy(settings.onResultsOpen, $results)();
            }
          },
          hide: function() {
            if($results.filter(':visible').size() > 0) {
              $results
                .stop()
                .fadeOut(200)
              ;
              $.proxy(settings.onResultsClose, $results)();
            }
          },
          select: function(event) {
            module.debug('Search result selected');
            var
              $result = $(this),
              $title  = $result.find('.title'),
              title   = $title.html()
            ;
            if(settings.onSelect == 'default' || $.proxy(settings.onSelect, this)(event) == 'default') {
              var
                $link  = $result.find('a[href]').eq(0),
                href   = $link.attr('href') || false,
                target = $link.attr('target') || false
              ;
              module.results.hide();
              $prompt
                .val(title)
              ;
              if(href) {
                if(target == '_blank' || event.ctrlKey) {
                  window.open(href);
                }
                else {
                  window.location.href = (href);
                }
              }
            }
          }
        },

        setting: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Element'        : element,
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if($allModules.size() > 1) {
              title += ' ' + '(' + $allModules.size() + ')';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };
      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }

    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.search.settings = {

  name           : 'Search Module',
  namespace      : 'search',

  debug          : false,
  verbose        : true,
  performance    : true,

  // onSelect default action is defined in module
  onSelect       : 'default',
  onResultsAdd   : 'default',

  onSearchQuery  : function(){},
  onResults      : function(response){},

  onResultsOpen  : function(){},
  onResultsClose : function(){},

  automatic      : 'true',
  type           : 'simple',
  minCharacters  : 3,
  searchThrottle : 300,
  maxResults     : 7,
  cache          : true,

  searchFields    : [
    'title',
    'description'
  ],

  // api config
  apiSettings: {

  },

  className: {
    active  : 'active',
    down    : 'down',
    focus   : 'focus',
    empty   : 'empty',
    loading : 'loading'
  },

  error : {
    noResults   : 'Your search returned no results',
    logging     : 'Error in debug logging, exiting.',
    noTemplate  : 'A valid template name was not specified.',
    serverError : 'There was an issue with querying the server.',
    method      : 'The method you called is not defined.'
  },

  selector : {
    prompt       : '.prompt',
    searchButton : '.search.button',
    results      : '.results',
    category     : '.category',
    result       : '.result'
  },

  templates: {
    message: function(message, type) {
      var
        html = ''
      ;
      if(message !== undefined && type !== undefined) {
        html +=  ''
          + '<div class="message ' + type +'">'
        ;
        // message type
        if(type == 'empty') {
          html += ''
            + '<div class="header">No Results</div class="header">'
            + '<div class="description">' + message + '</div class="description">'
          ;
        }
        else {
          html += ' <div class="description">' + message + '</div>';
        }
        html += '</div>';
      }
      return html;
    },
    categories: function(response) {
      var
        html = ''
      ;
      if(response.results !== undefined) {
        // each category
        $.each(response.results, function(index, category) {
          if(category.results !== undefined && category.results.length > 0) {
            html  += ''
              + '<div class="category">'
              + '<div class="name">' + category.name + '</div>'
            ;
            // each item inside category
            $.each(category.results, function(index, result) {
              html  += '<div class="result">';
              html  += '<a href="' + result.url + '"></a>';
              if(result.image !== undefined) {
                html+= ''
                  + '<div class="image">'
                  + ' <img src="' + result.image + '">'
                  + '</div>'
                ;
              }
              html += '<div class="info">';
              if(result.price !== undefined) {
                html+= '<div class="price">' + result.price + '</div>';
              }
              if(result.title !== undefined) {
                html+= '<div class="title">' + result.title + '</div>';
              }
              if(result.description !== undefined) {
                html+= '<div class="description">' + result.description + '</div>';
              }
              html  += ''
                + '</div>'
                + '</div>'
              ;
            });
            html  += ''
              + '</div>'
            ;
          }
        });
        if(response.resultPage) {
          html += ''
          + '<a href="' + response.resultPage.url + '" class="all">'
          +   response.resultPage.text
          + '</a>';
        }
        return html;
      }
      return false;
    },
    simple: function(response) {
      var
        html = ''
      ;
      if(response.results !== undefined) {

        // each result
        $.each(response.results, function(index, result) {
          html  += '<a class="result" href="' + result.url + '">';
          if(result.image !== undefined) {
            html+= ''
              + '<div class="image">'
              + ' <img src="' + result.image + '">'
              + '</div>'
            ;
          }
          html += '<div class="info">';
          if(result.price !== undefined) {
            html+= '<div class="price">' + result.price + '</div>';
          }
          if(result.title !== undefined) {
            html+= '<div class="title">' + result.title + '</div>';
          }
          if(result.description !== undefined) {
            html+= '<div class="description">' + result.description + '</div>';
          }
          html  += ''
            + '</div>'
            + '</a>'
          ;
        });

        if(response.resultPage) {
          html += ''
          + '<a href="' + response.resultPage.url + '" class="all">'
          +   response.resultPage.text
          + '</a>';
        }
        return html;
      }
      return false;
    }
  }
};

})( jQuery, window , document );;/*
 * # Semantic - Dropdown
 * http://github.com/jlukic/semantic-ui/
 *
 *
 * Copyright 2013 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
;(function ( $, window, document, undefined ) {

$.fn.dropdown = function(parameters) {
    var
    $allModules    = $(this),
    $document      = $(document),

    moduleSelector = $allModules.selector || '',

    hasTouch       = ('ontouchstart' in document.documentElement),
    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),
    returnedValue
  ;

  $allModules
    .each(function() {
      var
        settings          = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.dropdown.settings, parameters)
          : $.extend({}, $.fn.dropdown.settings),

        className       = settings.className,
        metadata        = settings.metadata,
        namespace       = settings.namespace,
        selector        = settings.selector,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        $module         = $(this),
        $item           = $module.find(selector.item),
        $text           = $module.find(selector.text),
        $input          = $module.find(selector.input),

        $menu           = $module.children(selector.menu),


        element         = this,
        instance        = $module.data(moduleNamespace),
        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing dropdown', settings);

          module.save.defaults();
          module.set.selected();

          if(hasTouch) {
            module.bind.touchEvents();
          }
          module.bind.mouseEvents();
          module.bind.keyboardEvents();
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of dropdown', module);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous dropdown for', $module);
          $item
            .off(eventNamespace)
          ;
          $module
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        bind: {
          keyboardEvents: function() {
            module.debug('Binding keyboard events');
            $module
              .on('keydown' + eventNamespace, module.handleKeyboard)
            ;
            $module
              .on('focus' + eventNamespace, module.show)
            ;
          },
          touchEvents: function() {
            module.debug('Touch device detected binding touch events');
            $module
              .on('touchstart' + eventNamespace, module.event.test.toggle)
            ;
            $item
              .on('touchstart' + eventNamespace, module.event.item.mouseenter)
              .on('touchstart' + eventNamespace, module.event.item.click)
            ;
          },
          mouseEvents: function() {
            module.verbose('Mouse detected binding mouse events');
            if(settings.on == 'click') {
              $module
                .on('click' + eventNamespace, module.event.test.toggle)
              ;
            }
            else if(settings.on == 'hover') {
              $module
                .on('mouseenter' + eventNamespace, module.delay.show)
                .on('mouseleave' + eventNamespace, module.delay.hide)
              ;
            }
            else {
              $module
                .on(settings.on + eventNamespace, module.toggle)
              ;
            }
            $item
              .on('mouseenter' + eventNamespace, module.event.item.mouseenter)
              .on('mouseleave' + eventNamespace, module.event.item.mouseleave)
              .on('click'      + eventNamespace, module.event.item.click)
            ;
          },
          intent: function() {
            module.verbose('Binding hide intent event to document');
            if(hasTouch) {
              $document
                .on('touchstart' + eventNamespace, module.event.test.touch)
                .on('touchmove'  + eventNamespace, module.event.test.touch)
              ;
            }
            $document
              .on('click' + eventNamespace, module.event.test.hide)
            ;
          }
        },

        unbind: {
          intent: function() {
            module.verbose('Removing hide intent event from document');
            if(hasTouch) {
              $document
                .off('touchstart' + eventNamespace)
                .off('touchmove' + eventNamespace)
              ;
            }
            $document
              .off('click' + eventNamespace)
            ;
          }
        },

        handleKeyboard: function(event) {
          var
            $selectedItem = $item.filter('.' + className.selected),
            pressedKey    = event.which,
            keys          = {
              enter     : 13,
              escape    : 27,
              upArrow   : 38,
              downArrow : 40
            },
            selectedClass   = className.selected,
            currentIndex    = $item.index( $selectedItem ),
            hasSelectedItem = ($selectedItem.size() > 0),
            resultSize      = $item.size(),
            newIndex
          ;
          // close shortcuts
          if(pressedKey == keys.escape) {
            module.verbose('Escape key pressed, closing dropdown');
            module.hide();
          }
          // result shortcuts
          if(module.is.visible()) {
            if(pressedKey == keys.enter && hasSelectedItem) {
              module.verbose('Enter key pressed, choosing selected item');
              $.proxy(module.event.item.click, $item.filter('.' + selectedClass) )(event);
              event.preventDefault();
              return false;
            }
            else if(pressedKey == keys.upArrow) {
              module.verbose('Up key pressed, changing active item');
              newIndex = (currentIndex - 1 < 0)
                ? currentIndex
                : currentIndex - 1
              ;
              $item
                .removeClass(selectedClass)
                .eq(newIndex)
                  .addClass(selectedClass)
              ;
              event.preventDefault();
            }
            else if(pressedKey == keys.downArrow) {
              module.verbose('Down key pressed, changing active item');
              newIndex = (currentIndex + 1 >= resultSize)
                ? currentIndex
                : currentIndex + 1
              ;
              $item
                .removeClass(selectedClass)
                .eq(newIndex)
                  .addClass(selectedClass)
              ;
              event.preventDefault();
            }
          }
          else {
            if(pressedKey == keys.enter) {
              module.show();
            }
          }
        },

        event: {
          test: {
            toggle: function(event) {
              if( module.determine.intent(event, module.toggle) ) {
                event.preventDefault();
              }
            },
            touch: function(event) {
              module.determine.intent(event, function() {
                if(event.type == 'touchstart') {
                  module.timer = setTimeout(module.hide, settings.delay.touch);
                }
                else if(event.type == 'touchmove') {
                  clearTimeout(module.timer);
                }
              });
              event.stopPropagation();
            },
            hide: function(event) {
              module.determine.intent(event, module.hide);
            }
          },

          item: {

            mouseenter: function(event) {
              var
                $currentMenu = $(this).find(selector.submenu),
                $otherMenus  = $(this).siblings(selector.item).children(selector.menu)
              ;
              if($currentMenu.length > 0  || $otherMenus.length > 0) {
                clearTimeout(module.itemTimer);
                  module.itemTimer = setTimeout(function() {
                  if($otherMenus.length > 0) {
                    module.animate.hide(false, $otherMenus.filter(':visible'));
                  }
                  if($currentMenu.length > 0) {
                    module.verbose('Showing sub-menu', $currentMenu);
                    module.animate.show(false, $currentMenu);
                  }
                }, settings.delay.show * 2);
                event.preventDefault();
                event.stopPropagation();
              }
            },

            mouseleave: function(event) {
              var
                $currentMenu = $(this).find(selector.menu)
              ;
              if($currentMenu.size() > 0) {
                clearTimeout(module.itemTimer);
                module.itemTimer = setTimeout(function() {
                  module.verbose('Hiding sub-menu', $currentMenu);
                  module.animate.hide(false,  $currentMenu);
                }, settings.delay.hide);
              }
            },

            click: function (event) {
              var
                $choice = $(this),
                text    = ( $choice.data(metadata.text) !== undefined )
                  ? $choice.data(metadata.text)
                  : $choice.text(),
                value   = ( $choice.data(metadata.value) !== undefined)
                  ? $choice.data(metadata.value)
                  : (typeof text === 'string')
                      ? text.toLowerCase()
                      : text,
                callback = function() {
                  module.determine.selectAction(text, value);
                  $.proxy(settings.onChange, element)(value, text);
                }
              ;
              if( $choice.find(selector.menu).size() === 0 ) {
                if(event.type == 'touchstart') {
                  $choice.one('click', callback);
                }
                else {
                  callback();
                }
              }
            }

          },

          resetStyle: function() {
            $(this).removeAttr('style');
          }

        },

        determine: {
          selectAction: function(text, value) {
            module.verbose('Determining action', settings.action);
            if( $.isFunction( module.action[settings.action] ) ) {
              module.verbose('Triggering preset action', settings.action, text, value);
              module.action[ settings.action ](text, value);
            }
            else if( $.isFunction(settings.action) ) {
              module.verbose('Triggering user action', settings.action, text, value);
              settings.action(text, value);
            }
            else {
              module.error(error.action, settings.action);
            }
          },
          intent: function(event, callback) {
            module.debug('Determining whether event occurred in dropdown', event.target);
            callback = callback || function(){};
            if( $(event.target).closest($menu).size() === 0 ) {
              module.verbose('Triggering event', callback);
              callback();
              return true;
            }
            else {
              module.verbose('Event occurred in dropdown, canceling callback');
              return false;
            }
          }
        },

        action: {

          nothing: function() {},

          hide: function() {
            module.hide();
          },

          activate: function(text, value) {
            value = (value !== undefined)
              ? value
              : text
            ;
            module.set.selected(value);
            module.set.value(value);
            module.hide();
          },

          /* Deprecated */
          auto: function(text, value) {
            value = (value !== undefined)
              ? value
              : text
            ;
            module.set.selected(value);
            module.set.value(value);
            module.hide();
          },

          /* Deprecated */
          changeText: function(text, value) {
            value = (value !== undefined)
              ? value
              : text
            ;
            module.set.selected(value);
            module.hide();
          },

          /* Deprecated */
          updateForm: function(text, value) {
            value = (value !== undefined)
              ? value
              : text
            ;
            module.set.selected(value);
            module.set.value(value);
            module.hide();
          }

        },

        get: {
          text: function() {
            return $text.text();
          },
          value: function() {
            return ($input.size() > 0)
              ? $input.val()
              : $module.data(metadata.value)
            ;
          },
          item: function(value, strict) {
            var
              $selectedItem = false
            ;
            value = (value !== undefined)
              ? value
              : ( module.get.value() !== undefined)
                ? module.get.value()
                : module.get.text()
            ;
            if(strict === undefined && value === '') {
              module.debug('Ambiguous dropdown value using strict type check', value);
              strict = true;
            }
            else {
              strict = strict || false;
            }
            if(value !== undefined) {
              $item
                .each(function() {
                  var
                    $choice       = $(this),
                    optionText    = ( $choice.data(metadata.text) !== undefined )
                      ? $choice.data(metadata.text)
                      : $choice.text(),
                    optionValue   = ( $choice.data(metadata.value) !== undefined )
                      ? $choice.data(metadata.value)
                      : (typeof optionText === 'string')
                        ? optionText.toLowerCase()
                        : optionText
                  ;
                  if(strict) {
                    if( optionValue === value ) {
                      $selectedItem = $(this);
                    }
                    else if( !$selectedItem && optionText === value ) {
                      $selectedItem = $(this);
                    }
                  }
                  else {
                    if( optionValue == value ) {
                      $selectedItem = $(this);
                    }
                    else if( !$selectedItem && optionText == value ) {
                      $selectedItem = $(this);
                    }
                  }
                })
              ;
            }
            else {
              value = module.get.text();
            }
            return $selectedItem || false;
          }
        },

        restore: {
          defaults: function() {
            module.restore.defaultText();
            module.restore.defaultValue();
          },
          defaultText: function() {
            var
              defaultText = $module.data(metadata.defaultText)
            ;
            module.debug('Restoring default text', defaultText);
            module.set.text(defaultText);
          },
          defaultValue: function() {
            var
              defaultValue = $module.data(metadata.defaultValue)
            ;
            if(defaultValue !== undefined) {
              module.debug('Restoring default value', defaultValue);
              module.set.selected(defaultValue);
              module.set.value(defaultValue);
            }
          }
        },

        save: {
          defaults: function() {
            module.save.defaultText();
            module.save.defaultValue();
          },
          defaultValue: function() {
            $module.data(metadata.defaultValue, module.get.value() );
          },
          defaultText: function() {
            $module.data(metadata.defaultText, $text.text() );
          }
        },

        set: {
          text: function(text) {
            module.debug('Changing text', text, $text);
            $text.removeClass(className.placeholder);
            $text.text(text);
          },
          value: function(value) {
            module.debug('Adding selected value to hidden input', value, $input);
            if($input.size() > 0) {
              $input
                .val(value)
                .trigger('change')
              ;
            }
            else {
              $module.data(metadata.value, value);
            }
          },
          active: function() {
            $module.addClass(className.active);
          },
          visible: function() {
            $module.addClass(className.visible);
          },
          selected: function(value) {
            var
              $selectedItem = module.get.item(value),
              selectedText
            ;
            if($selectedItem) {
              module.debug('Setting selected menu item to', $selectedItem);
              selectedText = ($selectedItem.data(metadata.text) !== undefined)
                ? $selectedItem.data(metadata.text)
                : $selectedItem.text()
              ;
              $item
                .removeClass(className.active)
              ;
              $selectedItem
                .addClass(className.active)
              ;
              module.set.text(selectedText);
            }
          }
        },

        remove: {
          active: function() {
            $module.removeClass(className.active);
          },
          visible: function() {
            $module.removeClass(className.visible);
          }
        },

        is: {
          selection: function() {
            return $module.hasClass(className.selection);
          },
          animated: function($subMenu) {
            return ($subMenu)
              ? $subMenu.is(':animated') || $subMenu.transition && $subMenu.transition('is animating')
              : $menu.is(':animated') || $menu.transition && $menu.transition('is animating')
            ;
          },
          visible: function($subMenu) {
            return ($subMenu)
              ? $subMenu.is(':visible')
              : $menu.is(':visible')
            ;
          },
          hidden: function($subMenu) {
            return ($subMenu)
              ? $subMenu.is(':not(:visible)')
              : $menu.is(':not(:visible)')
            ;
          }
        },

        can: {
          click: function() {
            return (hasTouch || settings.on == 'click');
          },
          show: function() {
            return !$module.hasClass(className.disabled);
          }
        },

        animate: {
          show: function(callback, $subMenu) {
            var
              $currentMenu = $subMenu || $menu
            ;
            callback = callback || function(){};
            if( module.is.hidden($currentMenu) ) {
              module.verbose('Doing menu show animation', $currentMenu);
              if(settings.transition == 'none') {
                callback();
              }
              else if($.fn.transition !== undefined && $module.transition('is supported')) {
                $currentMenu
                  .transition({
                    animation : settings.transition + ' in',
                    duration  : settings.duration,
                    complete  : callback,
                    queue     : false
                  })
                ;
              }
              else if(settings.transition == 'slide down') {
                $currentMenu
                  .hide()
                  .clearQueue()
                  .children()
                    .clearQueue()
                    .css('opacity', 0)
                    .delay(50)
                    .animate({
                      opacity : 1
                    }, settings.duration, 'easeOutQuad', module.event.resetStyle)
                    .end()
                  .slideDown(100, 'easeOutQuad', function() {
                    $.proxy(module.event.resetStyle, this)();
                    callback();
                  })
                ;
              }
              else if(settings.transition == 'fade') {
                $currentMenu
                  .hide()
                  .clearQueue()
                  .fadeIn(settings.duration, function() {
                    $.proxy(module.event.resetStyle, this)();
                    callback();
                  })
                ;
              }
              else {
                module.error(error.transition, settings.transition);
              }
            }
          },
          hide: function(callback, $subMenu) {
            var
              $currentMenu = $subMenu || $menu
            ;
            callback = callback || function(){};
            if(module.is.visible($currentMenu) ) {
              module.verbose('Doing menu hide animation', $currentMenu);
              if($.fn.transition !== undefined && $module.transition('is supported')) {
                $currentMenu
                  .transition({
                    animation : settings.transition + ' out',
                    duration  : settings.duration,
                    complete  : callback,
                    queue     : false
                  })
                ;
              }
              else if(settings.transition == 'none') {
                callback();
              }
              else if(settings.transition == 'slide down') {
                $currentMenu
                  .show()
                  .clearQueue()
                  .children()
                    .clearQueue()
                    .css('opacity', 1)
                    .animate({
                      opacity : 0
                    }, 100, 'easeOutQuad', module.event.resetStyle)
                    .end()
                  .delay(50)
                  .slideUp(100, 'easeOutQuad', function() {
                    $.proxy(module.event.resetStyle, this)();
                    callback();
                  })
                ;
              }
              else if(settings.transition == 'fade') {
                $currentMenu
                  .show()
                  .clearQueue()
                  .fadeOut(150, function() {
                    $.proxy(module.event.resetStyle, this)();
                    callback();
                  })
                ;
              }
              else {
                module.error(error.transition);
              }
            }
          }
        },

        show: function() {
          module.debug('Checking if dropdown can show');
          if( module.is.hidden() ) {
            module.hideOthers();
            module.set.active();
            module.animate.show(function() {
              if( module.can.click() ) {
                module.bind.intent();
              }
              module.set.visible();
            });
            $.proxy(settings.onShow, element)();
          }
        },

        hide: function() {
          if( !module.is.animated() && module.is.visible() ) {
            module.debug('Hiding dropdown');
            if( module.can.click() ) {
              module.unbind.intent();
            }
            module.remove.active();
            module.animate.hide(module.remove.visible);
            $.proxy(settings.onHide, element)();
          }
        },

        delay: {
          show: function() {
            module.verbose('Delaying show event to ensure user intent');
            clearTimeout(module.timer);
            module.timer = setTimeout(module.show, settings.delay.show);
          },
          hide: function() {
            module.verbose('Delaying hide event to ensure user intent');
            clearTimeout(module.timer);
            module.timer = setTimeout(module.hide, settings.delay.hide);
          }
        },

        hideOthers: function() {
          module.verbose('Finding other dropdowns to hide');
          $allModules
            .not($module)
              .has(selector.menu + ':visible')
              .dropdown('hide')
          ;
        },

        toggle: function() {
          module.verbose('Toggling menu visibility');
          if( module.is.hidden() ) {
            module.show();
          }
          else {
            module.hide();
          }
        },

        setting: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Element'        : element,
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                module.error(error.method, query);
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.dropdown.settings = {

  name        : 'Dropdown',
  namespace   : 'dropdown',

  debug       : false,
  verbose     : true,
  performance : true,

  on          : 'click',
  action      : 'activate',

  delay: {
    show  : 200,
    hide  : 300,
    touch : 50
  },

  transition : 'slide down',
  duration   : 250,

  onChange : function(value, text){},
  onShow   : function(){},
  onHide   : function(){},

  error   : {
    action    : 'You called a dropdown action that was not defined',
    method    : 'The method you called is not defined.',
    transition : 'The requested transition was not found'
  },

  metadata: {
    defaultText  : 'defaultText',
    defaultValue : 'defaultValue',
    text         : 'text',
    value        : 'value'
  },

  selector : {
    menu    : '.menu',
    submenu : '> .menu',
    item    : '.menu > .item',
    text    : '> .text',
    input   : '> input[type="hidden"]'
  },

  className : {
    active      : 'active',
    placeholder : 'default',
    disabled    : 'disabled',
    visible     : 'visible',
    selected    : 'selected',
    selection   : 'selection'
  }

};

// Adds easing
$.extend( $.easing, {
  easeOutQuad: function (x, t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
  }
});


})( jQuery, window , document );
;/*
 * # Semantic - Checkbox
 * http://github.com/jlukic/semantic-ui/
 *
 *
 * Copyright 2013 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

$.fn.checkbox = function(parameters) {
  var
    $allModules    = $(this),
    moduleSelector = $allModules.selector || '',

    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),
    returnedValue
  ;

  $allModules
    .each(function() {
      var
        settings        = $.extend(true, {}, $.fn.checkbox.settings, parameters),

        className       = settings.className,
        namespace       = settings.namespace,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        $module         = $(this),
        $label          = $(this).next(settings.selector.label).first(),
        $input          = $(this).find(settings.selector.input),

        selector        = $module.selector || '',
        instance        = $module.data(moduleNamespace),

        element         = this,
        module
      ;

      module      = {

        initialize: function() {
          module.verbose('Initializing checkbox', settings);
          if(settings.context && selector !== '') {
            module.verbose('Adding delegated events');
            $(element, settings.context)
              .on(selector, 'click' + eventNamespace, module.toggle)
              .on(selector + ' + ' + settings.selector.label, 'click' + eventNamespace, module.toggle)
            ;
          }
          else {
            $module
              .on('click' + eventNamespace, module.toggle)
              .data(moduleNamespace, module)
            ;
            $label
              .on('click' + eventNamespace, module.toggle)
            ;
          }
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module');
          $module
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        is: {
          radio: function() {
            return $module.hasClass(className.radio);
          },
          enabled: function() {
            return $input.prop('checked') !== undefined && $input.prop('checked');
          },
          disabled: function() {
            return !module.is.enabled();
          }
        },

        can: {
          disable: function() {
            return (typeof settings.required === 'boolean')
              ? settings.required
              : !module.is.radio()
            ;
          }
        },

        enable: function() {
          module.debug('Enabling checkbox', $input);
          $input
            .prop('checked', true)
            .trigger('change')
          ;
          $.proxy(settings.onChange, $input.get())();
          $.proxy(settings.onEnable, $input.get())();
        },

        disable: function() {
          module.debug('Disabling checkbox');
          $input
            .prop('checked', false)
            .trigger('change')
          ;
          $.proxy(settings.onChange, $input.get())();
          $.proxy(settings.onDisable, $input.get())();
        },

        toggle: function(event) {
          module.verbose('Determining new checkbox state');
          if( !$input.prop('disabled') ) {
            if( module.is.disabled() ) {
              module.enable();
            }
            else if( module.is.enabled() && module.can.disable() ) {
              module.disable();
            }
          }
        },
        setting: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Element'        : element,
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.checkbox.settings = {

  name        : 'Checkbox',
  namespace   : 'checkbox',

  debug       : false,
  verbose     : true,
  performance : true,

  // delegated event context
  context     : false,
  required    : 'auto',

  onChange    : function(){},
  onEnable    : function(){},
  onDisable   : function(){},

  error     : {
    method   : 'The method you called is not defined.'
  },

  selector : {
    input  : 'input[type=checkbox], input[type=radio]',
    label  : 'label'
  },

  className : {
    radio  : 'radio'
  }

};

})( jQuery, window , document );
;/*
 * # Semantic - Dimmer
 * http://github.com/jlukic/semantic-ui/
 *
 *
 * Copyright 2013 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

$.fn.dimmer = function(parameters) {
  var
    $allModules     = $(this),

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    returnedValue
  ;

  $allModules
    .each(function() {
      var
        settings        = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.dimmer.settings, parameters)
          : $.extend({}, $.fn.dimmer.settings),

        selector        = settings.selector,
        namespace       = settings.namespace,
        className       = settings.className,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,
        moduleSelector  = $allModules.selector || '',

        clickEvent      = ('ontouchstart' in document.documentElement)
          ? 'touchstart'
          : 'click',

        $module = $(this),
        $dimmer,
        $dimmable,

        element   = this,
        instance  = $module.data(moduleNamespace),
        module
      ;

      module = {

        preinitialize: function() {
          if( module.is.dimmer() ) {
            $dimmable = $module.parent();
            $dimmer   = $module;
          }
          else {
            $dimmable = $module;
            if( module.has.dimmer() ) {
              $dimmer = $dimmable.children(selector.dimmer).first();
            }
            else {
              $dimmer = module.create();
            }
          }
        },

        initialize: function() {
          module.debug('Initializing dimmer', settings);
          if(settings.on == 'hover') {
            $dimmable
              .on('mouseenter' + eventNamespace, module.show)
              .on('mouseleave' + eventNamespace, module.hide)
            ;
          }
          else if(settings.on == 'click') {
            $dimmable
              .on(clickEvent + eventNamespace, module.toggle)
            ;
          }

          if( module.is.page() ) {
            module.debug('Setting as a page dimmer', $dimmable);
            module.set.pageDimmer();
          }

          if(settings.closable) {
            module.verbose('Adding dimmer close event', $dimmer);
            $dimmer
              .on(clickEvent + eventNamespace, module.event.click)
            ;
          }
          module.set.dimmable();
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, instance)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module', $dimmer);
          $module
            .removeData(moduleNamespace)
          ;
          $dimmable
            .off(eventNamespace)
          ;
          $dimmer
            .off(eventNamespace)
          ;
        },

        event: {

          click: function(event) {
            module.verbose('Determining if event occured on dimmer', event);
            if( $dimmer.find(event.target).size() === 0 || $(event.target).is(selector.content) ) {
              module.hide();
              event.stopImmediatePropagation();
            }
          }

        },

        addContent: function(element) {
          var
            $content = $(element)
          ;
          module.debug('Add content to dimmer', $content);
          if($content.parent()[0] !== $dimmer[0]) {
            $content.detach().appendTo($dimmer);
          }
        },

        create: function() {
          return $( settings.template.dimmer() ).appendTo($dimmable);
        },

        animate: {
          show: function(callback) {
            callback = $.isFunction(callback)
              ? callback
              : function(){}
            ;
            module.set.dimmed();
            if(settings.on != 'hover' && settings.useCSS && $.fn.transition !== undefined && $dimmer.transition('is supported')) {
              $dimmer
                .transition({
                  animation : settings.transition + ' in',
                  queue     : true,
                  duration  : module.get.duration(),
                  complete  : function() {
                    module.set.active();
                    callback();
                  }
                })
              ;
            }
            else {
              module.verbose('Showing dimmer animation with javascript');
              $dimmer
                .stop()
                .css({
                  opacity : 0,
                  width   : '100%',
                  height  : '100%'
                })
                .fadeTo(module.get.duration(), 1, function() {
                  $dimmer.removeAttr('style');
                  module.set.active();
                  callback();
                })
              ;
            }
          },
          hide: function(callback) {
            callback = $.isFunction(callback)
              ? callback
              : function(){}
            ;
            if(settings.on != 'hover' && settings.useCSS && $.fn.transition !== undefined && $dimmer.transition('is supported')) {
              module.verbose('Hiding dimmer with css');
              $dimmer
                .transition({
                  animation : settings.transition + ' out',
                  duration  : module.get.duration(),
                  queue     : true,
                  complete  : function() {
                    module.remove.dimmed();
                    module.remove.active();
                    callback();
                  }
                })
              ;
            }
            else {
              module.verbose('Hiding dimmer with javascript');
              $dimmer
                .stop()
                .fadeOut(module.get.duration(), function() {
                  $dimmer.removeAttr('style');
                  module.remove.dimmed();
                  module.remove.active();
                  callback();
                })
              ;
            }
          }
        },

        get: {
          dimmer: function() {
            return $dimmer;
          },
          duration: function() {
            if(typeof settings.duration == 'object') {
              if( module.is.active() ) {
                return settings.duration.hide;
              }
              else {
                return settings.duration.show;
              }
            }
            return settings.duration;
          }
        },

        has: {
          dimmer: function() {
            return ( $module.children(selector.dimmer).size() > 0 );
          }
        },

        is: {
          active: function() {
            return $dimmer.hasClass(className.active);
          },
          animating: function() {
            return ( $dimmer.is(':animated') || $dimmer.hasClass(className.transition) );
          },
          dimmer: function() {
            return $module.is(selector.dimmer);
          },
          dimmable: function() {
            return $module.is(selector.dimmable);
          },
          dimmed: function() {
            return $dimmable.hasClass(className.dimmed);
          },
          disabled: function() {
            return $dimmable.hasClass(className.disabled);
          },
          enabled: function() {
            return !module.is.disabled();
          },
          page: function () {
            return $dimmable.is('body');
          },
          pageDimmer: function() {
            return $dimmer.hasClass(className.pageDimmer);
          }
        },

        can: {
          show: function() {
            return !$dimmer.hasClass(className.disabled);
          }
        },

        set: {
          active: function() {
            module.set.dimmed();
            $dimmer
              .removeClass(className.transition)
              .addClass(className.active)
            ;
          },
          dimmable: function() {
            $dimmable.addClass(className.dimmable);
          },
          dimmed: function() {
            $dimmable.addClass(className.dimmed);
          },
          pageDimmer: function() {
            $dimmer.addClass(className.pageDimmer);
          },
          disabled: function() {
            $dimmer.addClass(className.disabled);
          }
        },

        remove: {
          active: function() {
            $dimmer
              .removeClass(className.transition)
              .removeClass(className.active)
            ;
          },
          dimmed: function() {
            $dimmable.removeClass(className.dimmed);
          },
          disabled: function() {
            $dimmer.removeClass(className.disabled);
          }
        },

        show: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          module.debug('Showing dimmer', $dimmer, settings);
          if( !module.is.active() && module.is.enabled() ) {
            module.animate.show(callback);
            $.proxy(settings.onShow, element)();
            $.proxy(settings.onChange, element)();
          }
          else {
            module.debug('Dimmer is already shown or disabled');
          }
        },

        hide: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          if( module.is.active() || module.is.animating() ) {
            module.debug('Hiding dimmer', $dimmer);
            module.animate.hide(callback);
            $.proxy(settings.onHide, element)();
            $.proxy(settings.onChange, element)();
          }
          else {
            module.debug('Dimmer is not visible');
          }
        },

        toggle: function() {
          module.verbose('Toggling dimmer visibility', $dimmer);
          if( !module.is.dimmed() ) {
            module.show();
          }
          else {
            module.hide();
          }
        },

        setting: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Element'        : element,
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if($allModules.size() > 1) {
              title += ' ' + '(' + $allModules.size() + ')';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      module.preinitialize();

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.dimmer.settings = {

  name        : 'Dimmer',
  namespace   : 'dimmer',

  debug       : false,
  verbose     : true,
  performance : true,

  transition  : 'fade',
  useCSS      : true,
  on          : false,
  closable    : true,

  duration    : {
    show : 500,
    hide : 500
  },

  onChange    : function(){},
  onShow      : function(){},
  onHide      : function(){},

  error   : {
    method   : 'The method you called is not defined.'
  },

  selector: {
    dimmable : '.ui.dimmable',
    dimmer   : '.ui.dimmer',
    content  : '.ui.dimmer > .content, .ui.dimmer > .content > .center'
  },

  template: {
    dimmer: function() {
     return $('<div />').attr('class', 'ui dimmer');
    }
  },

  className : {
    active     : 'active',
    dimmable   : 'ui dimmable',
    dimmed     : 'dimmed',
    disabled   : 'disabled',
    pageDimmer : 'page',
    hide       : 'hide',
    show       : 'show',
    transition : 'transition'
  }

};

})( jQuery, window , document );;/*
 * # Semantic - Modal
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2013 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

$.fn.modal = function(parameters) {
  var
    $allModules = $(this),
    $window     = $(window),
    $document   = $(document),
    $body       = $('body'),

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    requestAnimationFrame = window.requestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.msRequestAnimationFrame
      || function(callback) { setTimeout(callback, 0); },

    returnedValue
  ;


  $allModules
    .each(function() {
      var
        settings    = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.modal.settings, parameters)
          : $.extend({}, $.fn.modal.settings),

        selector        = settings.selector,
        className       = settings.className,
        namespace       = settings.namespace,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,
        moduleSelector  = $allModules.selector || '',

        $module      = $(this),
        $context     = $(settings.context),
        $close       = $module.find(selector.close),

        $allModals,
        $otherModals,
        $focusedElement,
        $dimmable,
        $dimmer,

        element      = this,
        instance     = $module.data(moduleNamespace),
        module
      ;

      module  = {

        initialize: function() {
          module.verbose('Initializing dimmer', $context);

          if($.fn.dimmer === undefined) {
            module.error(error.dimmer);
            return;
          }
          $dimmable = $context
            .dimmer({
              closable : false,
              useCSS   : true,
              duration : {
                show     : settings.duration * 0.9,
                hide     : settings.duration * 1.1
              }
            })
          ;

          if(settings.detachable) {
            $dimmable.dimmer('add content', $module);
          }

          $dimmer = $dimmable
            .dimmer('get dimmer')
          ;

          module.refreshSelectors();

          module.verbose('Attaching close events', $close);
          $close
            .on('click' + eventNamespace, module.event.close)
          ;
          $window
            .on('resize' + eventNamespace, module.event.resize)
          ;
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of modal');
          instance = module;
          $module
            .data(moduleNamespace, instance)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous modal');
          $module
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
          $close
            .off(eventNamespace)
          ;
          $context
            .dimmer('destroy')
          ;
        },

        refresh: function() {
          module.remove.scrolling();
          module.cacheSizes();
          module.set.screenHeight();
          module.set.type();
          module.set.position();
        },

        refreshSelectors: function() {
          $otherModals = $module.siblings(selector.modal);
          $allModals   = $otherModals.add($module);
        },

        attachEvents: function(selector, event) {
          var
            $toggle = $(selector)
          ;
          event = $.isFunction(module[event])
            ? module[event]
            : module.toggle
          ;
          if($toggle.size() > 0) {
            module.debug('Attaching modal events to element', selector, event);
            $toggle
              .off(eventNamespace)
              .on('click' + eventNamespace, event)
            ;
          }
          else {
            module.error(error.notFound);
          }
        },

        event: {
          close: function() {
            module.verbose('Closing element pressed');
            if( $(this).is(selector.approve) ) {
              if($.proxy(settings.onApprove, element)() !== false) {
                module.hide();
              }
              else {
                module.verbose('Approve callback returned false cancelling hide');
              }
            }
            else if( $(this).is(selector.deny) ) {
              if($.proxy(settings.onDeny, element)() !== false) {
                module.hide();
              }
              else {
                module.verbose('Deny callback returned false cancelling hide');
              }
            }
            else {
              module.hide();
            }
          },
          click: function(event) {
            if( $(event.target).closest(selector.modal).size() === 0 ) {
              module.debug('Dimmer clicked, hiding all modals');
              if(settings.allowMultiple) {
                module.hide();
              }
              else {
                module.hideAll();
              }
              event.stopImmediatePropagation();
            }
          },
          debounce: function(method, delay) {
            clearTimeout(module.timer);
            module.timer = setTimeout(method, delay);
          },
          keyboard: function(event) {
            var
              keyCode   = event.which,
              escapeKey = 27
            ;
            if(keyCode == escapeKey) {
              if(settings.closable) {
                module.debug('Escape key pressed hiding modal');
                module.hide();
              }
              else {
                module.debug('Escape key pressed, but closable is set to false');
              }
              event.preventDefault();
            }
          },
          resize: function() {
            if( $dimmable.dimmer('is active') ) {
              requestAnimationFrame(module.refresh);
            }
          }
        },

        toggle: function() {
          if( module.is.active() ) {
            module.hide();
          }
          else {
            module.show();
          }
        },

        show: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          module.showDimmer();
          module.showModal(callback);
        },

        onlyVisible: function() {
          module.refreshSelectors();
          return module.is.active() && $otherModals.filter(':visible').size() === 0;
        },

        othersVisible: function() {
          module.refreshSelectors();
          return $otherModals.filter(':visible').size() > 0;
        },

        showModal: function(callback) {
          if(module.is.active()) {
            module.debug('Modal is already visible');
            return;
          }

          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;

          module.save.focus();
          module.add.keyboardShortcuts();

          if(module.cache === undefined) {
            module.cacheSizes();
          }
          module.set.position();
          module.set.screenHeight();
          module.set.type();

          if(module.othersVisible()  && !settings.allowMultiple) {
            module.debug('Other modals visible, queueing show animation');
            module.hideOthers(module.showModal);
          }
          else {
            $.proxy(settings.onShow, element)();

            var transitionCallback = function() {
              module.set.active();
              $.proxy(settings.onVisible, element)();
              callback();
            };

            if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
              module.debug('Showing modal with css animations');
              $module
                .transition(settings.transition + ' in', settings.duration, transitionCallback)
              ;
            }
            else {
              module.debug('Showing modal with javascript');
              $module
                .fadeIn(settings.duration, settings.easing, transitionCallback)
              ;
            }
          }
        },

        showDimmer: function() {
          if( !$dimmable.dimmer('is active') ) {
            module.debug('Showing dimmer');
            $dimmable.dimmer('show');
          }
          else {
            module.debug('Dimmer is already visible');
          }
        },

        hide: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          module.refreshSelectors();
          if(module.onlyVisible()) {
            module.hideDimmer();
          }
          module.hideModal(callback);
        },

        hideDimmer: function() {
          if( !module.is.active() ) {
            module.debug('Dimmer is already hidden');
            return;
          }
          module.debug('Hiding dimmer');
          if(settings.closable) {
            $dimmer
              .off('click' + eventNamespace)
            ;
          }
          $dimmable.dimmer('hide', function() {
            if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
              $module
                .transition('reset')
              ;
              module.remove.screenHeight();
            }
            module.remove.active();
          });
        },

        hideModal: function(callback) {
          if(!module.is.active()) {
            module.debug('Modal is already hidden');
            return;
          }

          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;

          module.restore.focus();
          module.remove.keyboardShortcuts();

          $.proxy(settings.onHide, element)();

          var transitionCallback = function() {
            module.remove.active();
            $.proxy(settings.onHidden, element)();
            callback();
          };

          if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
            module.debug('Hiding modal with css animations');
            $module
              .transition(settings.transition + ' out', settings.duration, transitionCallback)
            ;
          }
          else {
            module.debug('Hiding modal with javascript');
            $module
              .fadeOut(settings.duration, settings.easing, transitionCallback)
            ;
          }
        },

        hideAll: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          if( $module.is(':visible') || module.othersVisible() ) {
            module.debug('Hiding all visible modals');
            module.hideDimmer();
            $allModals
              .filter(':visible')
                .modal('hide modal', callback)
            ;
          }
        },

        hideOthers: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          if( module.othersVisible() ) {
            module.debug('Hiding other modals');
            $otherModals
              .filter(':visible')
                .modal('hide modal', callback)
            ;
          }
        },

        add: {
          keyboardShortcuts: function() {
            module.verbose('Adding keyboard shortcuts');
            $document
              .on('keyup' + eventNamespace, module.event.keyboard)
            ;
          }
        },

        save: {
          focus: function() {
            $focusedElement = $(document.activeElement).blur();
          }
        },

        restore: {
          focus: function() {
            if($focusedElement && $focusedElement.size() > 0) {
              $focusedElement.focus();
            }
          }
        },

        remove: {
          active: function() {
            $module.removeClass(className.active);
          },
          screenHeight: function() {
            if(module.cache.height > module.cache.pageHeight) {
              module.debug('Removing page height');
              $body
                .css('height', '')
              ;
            }
          },
          keyboardShortcuts: function() {
            module.verbose('Removing keyboard shortcuts');
            $document
              .off('keyup' + eventNamespace)
            ;
          },
          scrolling: function() {
            $dimmable.removeClass(className.scrolling);
            $module.removeClass(className.scrolling);
          }
        },

        cacheSizes: function() {
          module.cache = {
            pageHeight    : $body.outerHeight(),
            height        : $module.outerHeight() + settings.offset,
            contextHeight : (settings.context == 'body')
              ? $(window).height()
              : $dimmable.height()
          };
          module.debug('Caching modal and container sizes', module.cache);
        },

        can: {
          fit: function() {
            return (module.cache.height < module.cache.contextHeight);
          }
        },

        is: {
          active: function() {
            return $module.hasClass(className.active);
          },
          modernBrowser: function() {
            // appName for IE11 reports 'Netscape' can no longer use
            return !(window.ActiveXObject || "ActiveXObject" in window);
          }
        },

        set: {
          screenHeight: function() {
            if(module.cache.height > module.cache.pageHeight) {
              module.debug('Modal is taller than page content, resizing page height');
              $body
                .css('height', module.cache.height + settings.padding)
              ;
            }
          },
          active: function() {
            $module.addClass(className.active);

            if(settings.closable) {
              $dimmer
                .off('click' + eventNamespace)
                .on('click' + eventNamespace, module.event.click)
              ;
            }

            if(settings.autofocus) {
                var $inputs    = $module.find(':input:visible');
                var $autofocus = $inputs.filter('[autofocus]');
                var $input     = $autofocus.length ? $autofocus : $inputs;

                $input.first().focus();
            }
          },
          scrolling: function() {
            $dimmable.addClass(className.scrolling);
            $module.addClass(className.scrolling);
          },
          type: function() {
            if(module.can.fit()) {
              module.verbose('Modal fits on screen');
              module.remove.scrolling();
            }
            else {
              module.verbose('Modal cannot fit on screen setting to scrolling');
              module.set.scrolling();
            }
          },
          position: function() {
            module.verbose('Centering modal on page', module.cache);
            if(module.can.fit()) {
              $module
                .css({
                  top: '',
                  marginTop: -(module.cache.height / 2)
                })
              ;
            }
            else {
              $module
                .css({
                  marginTop : '1em',
                  top       : $document.scrollTop()
                })
              ;
            }
          }
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Element'        : element,
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.modal.settings = {

  name          : 'Modal',
  namespace     : 'modal',

  debug         : false,
  verbose       : true,
  performance   : true,

  allowMultiple : true,
  detachable    : true,
  closable      : true,
  autofocus     : true,
  context       : 'body',

  duration      : 500,
  easing        : 'easeOutQuad',
  offset        : 0,
  transition    : 'scale',

  padding       : 30,

  onShow        : function(){},
  onHide        : function(){},

  onVisible     : function(){},
  onHidden      : function(){},

  onApprove     : function(){ return true; },
  onDeny        : function(){ return true; },

  selector    : {
    close    : '.close, .actions .button',
    approve  : '.actions .positive, .actions .approve, .actions .ok',
    deny     : '.actions .negative, .actions .deny, .actions .cancel',
    modal    : '.ui.modal'
  },
  error : {
    dimmer    : 'UI Dimmer, a required component is not included in this page',
    method    : 'The method you called is not defined.'
  },
  className : {
    active    : 'active',
    scrolling : 'scrolling'
  }
};

// Adds easing
$.extend( $.easing, {
  easeOutQuad: function (x, t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
  }
});

})( jQuery, window , document );
;/*
 * # Semantic - Accordion
 * http://github.com/jlukic/semantic-ui/
 *
 *
 * Copyright 2013 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

$.fn.accordion = function(parameters) {
  var
    $allModules     = $(this),

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),
    returnedValue
  ;
  $allModules
    .each(function() {
      var
        settings        = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.accordion.settings, parameters)
          : $.extend({}, $.fn.accordion.settings),

        className       = settings.className,
        namespace       = settings.namespace,
        selector        = settings.selector,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,
        moduleSelector  = $allModules.selector || '',

        $module  = $(this),
        $title   = $module.find(selector.title),
        $content = $module.find(selector.content),

        element  = this,
        instance = $module.data(moduleNamespace),
        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing accordion with bound events', $module);
          // initializing
          $title
            .on('click' + eventNamespace, module.event.click)
          ;
          module.instantiate();
        },

        instantiate: function() {
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.debug('Destroying previous accordion for', $module);
          $module
            .removeData(moduleNamespace)
          ;
          $title
            .off(eventNamespace)
          ;
        },

        event: {
          click: function() {
            module.verbose('Title clicked', this);
            var
              $activeTitle = $(this),
              index        = $title.index($activeTitle)
            ;
            module.toggle(index);
          },
          resetDisplay: function() {
            $(this).css('display', '');
            if( $(this).attr('style') == '') {
              $(this)
                .attr('style', '')
                .removeAttr('style')
              ;
            }
          },
          resetOpacity: function() {
            $(this).css('opacity', '');
            if( $(this).attr('style') == '') {
              $(this)
                .attr('style', '')
                .removeAttr('style')
              ;
            }
          }
        },

        toggle: function(index) {
          module.debug('Toggling content content at index', index);
          var
            $activeTitle   = $title.eq(index),
            $activeContent = $activeTitle.next($content),
            contentIsOpen  = $activeContent.is(':visible')
          ;
          if(contentIsOpen) {
            if(settings.collapsible) {
              module.close(index);
            }
            else {
              module.debug('Cannot close accordion content collapsing is disabled');
            }
          }
          else {
            module.open(index);
          }
        },

        open: function(index) {
          var
            $activeTitle     = $title.eq(index),
            $activeContent   = $activeTitle.next($content),
            $otherSections   = module.is.menu()
              ? $activeTitle.parent().siblings(selector.item).find(selector.title)
              : $activeTitle.siblings(selector.title),
            $previousTitle   = $otherSections.filter('.' + className.active),
            $previousContent = $previousTitle.next($title),
            contentIsOpen    =  ($previousTitle.size() > 0)
          ;
          if( !$activeContent.is(':animated') ) {
            module.debug('Opening accordion content', $activeTitle);
            if(settings.exclusive && contentIsOpen) {
              $previousTitle
                .removeClass(className.active)
              ;
              $previousContent
                .stop()
                .children()
                  .stop()
                  .animate({
                    opacity: 0
                  }, settings.duration, module.event.resetOpacity)
                  .end()
                .slideUp(settings.duration , settings.easing, function() {
                  $previousContent
                    .removeClass(className.active)
                    .children()
                  ;
                  $.proxy(module.event.resetDisplay, this)();
                })
              ;
            }
            $activeTitle
              .addClass(className.active)
            ;
            $activeContent
              .stop()
              .children()
                .stop()
                .animate({
                  opacity: 1
                }, settings.duration)
                .end()
              .slideDown(settings.duration, settings.easing, function() {
                $activeContent
                  .addClass(className.active)
                ;
                $.proxy(module.event.resetDisplay, this)();
                $.proxy(settings.onOpen, $activeContent)();
                $.proxy(settings.onChange, $activeContent)();
              })
            ;
          }
        },

        close: function(index) {
          var
            $activeTitle   = $title.eq(index),
            $activeContent = $activeTitle.next($content)
          ;
          module.debug('Closing accordion content', $activeContent);
          $activeTitle
            .removeClass(className.active)
          ;
          $activeContent
            .removeClass(className.active)
            .show()
            .stop()
            .children()
              .stop()
              .animate({
                opacity: 0
              }, settings.duration, module.event.resetOpacity)
              .end()
            .slideUp(settings.duration, settings.easing, function(){
              $.proxy(module.event.resetDisplay, this)();
              $.proxy(settings.onClose, $activeContent)();
              $.proxy(settings.onChange, $activeContent)();
            })
          ;
        },
        is: {
          menu: function () {
            return $module.hasClass(className.menu);
          }
        },
        setting: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          module.debug('Changing internal', name, value);
          if(value !== undefined) {
            if( $.isPlainObject(name) ) {
              $.extend(true, module, name);
            }
            else {
              module[name] = value;
            }
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Element'        : element,
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };
      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;
  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.accordion.settings = {
  name        : 'Accordion',
  namespace   : 'accordion',

  debug       : false,
  verbose     : true,
  performance : true,

  exclusive   : true,
  collapsible : true,

  duration    : 500,
  easing      : 'easeInOutQuint',

  onOpen      : function(){},
  onClose     : function(){},
  onChange    : function(){},

  error: {
    method    : 'The method you called is not defined'
  },

  className   : {
    active : 'active',
    menu   : 'menu',
  },

  selector    : {
    title   : '.title',
    content : '.content',
    menu    : '.menu',
    item    : '.item',
  }


};

// Adds easing
$.extend( $.easing, {
  easeInOutQuint: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
    return c/2*((t-=2)*t*t*t*t + 2) + b;
  }
});

})( jQuery, window , document );

;/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
/*! jQuery Address v${version} | (c) 2009, 2013 Rostislav Hristov | jquery.org/license */
(function ($) {

    $.address = (function () {

        var _trigger = function(name) {
               var e = $.extend($.Event(name), (function() {
                    var parameters = {},
                        parameterNames = $.address.parameterNames();
                    for (var i = 0, l = parameterNames.length; i < l; i++) {
                        parameters[parameterNames[i]] = $.address.parameter(parameterNames[i]);
                    }
                    return {
                        value: $.address.value(),
                        path: $.address.path(),
                        pathNames: $.address.pathNames(),
                        parameterNames: parameterNames,
                        parameters: parameters,
                        queryString: $.address.queryString()
                    };
                }).call($.address));
                $($.address).trigger(e);
                return e;
            },
            _array = function(obj) {
                return Array.prototype.slice.call(obj);
            },
            _bind = function(value, data, fn) {
                $().bind.apply($($.address), Array.prototype.slice.call(arguments));
                return $.address;
            },
            _unbind = function(value,  fn) {
                $().unbind.apply($($.address), Array.prototype.slice.call(arguments));
                return $.address;
            },
            _supportsState = function() {
                return (_h.pushState && _opts.state !== UNDEFINED);
            },
            _hrefState = function() {
                return ('/' + _l.pathname.replace(new RegExp(_opts.state), '') + 
                    _l.search + (_hrefHash() ? '#' + _hrefHash() : '')).replace(_re, '/');
            },
            _hrefHash = function() {
                var index = _l.href.indexOf('#');
                return index != -1 ? _l.href.substr(index + 1) : '';
            },
            _href = function() {
                return _supportsState() ? _hrefState() : _hrefHash();
            },
            _window = function() {
                try {
                    return top.document !== UNDEFINED && top.document.title !== UNDEFINED && top.jQuery !== UNDEFINED && 
                        top.jQuery.address !== UNDEFINED && top.jQuery.address.frames() !== false ? top : window;
                } catch (e) { 
                    return window;
                }
            },
            _js = function() {
                return 'javascript';
            },
            _strict = function(value) {
                value = value.toString();
                return (_opts.strict && value.substr(0, 1) != '/' ? '/' : '') + value;
            },
            _cssint = function(el, value) {
                return parseInt(el.css(value), 10);
            },
            _listen = function() {
                if (!_silent) {
                    var hash = _href(),
                        diff = decodeURI(_value) != decodeURI(hash);
                    if (diff) {
                        if (_msie && _version < 7) {
                            _l.reload();
                        } else {
                            if (_msie && !_hashchange && _opts.history) {
                                _st(_html, 50);
                            }
                            _value = hash;
                            _update(FALSE);
                        }
                    }
                }
            },
            _update = function(internal) {
                _st(_track, 10);
                return _trigger(CHANGE).isDefaultPrevented() || 
                    _trigger(internal ? INTERNAL_CHANGE : EXTERNAL_CHANGE).isDefaultPrevented();
            },
            _track = function() {
                if (_opts.tracker !== 'null' && _opts.tracker !== NULL) {
                    var fn = $.isFunction(_opts.tracker) ? _opts.tracker : _t[_opts.tracker],
                        value = (_l.pathname + _l.search + 
                                ($.address && !_supportsState() ? $.address.value() : ''))
                                .replace(/\/\//, '/').replace(/^\/$/, '');
                    if ($.isFunction(fn)) {
                        fn(value);
                    } else if ($.isFunction(_t.urchinTracker)) {
                        _t.urchinTracker(value);
                    } else if (_t.pageTracker !== UNDEFINED && $.isFunction(_t.pageTracker._trackPageview)) {
                        _t.pageTracker._trackPageview(value);
                    } else if (_t._gaq !== UNDEFINED && $.isFunction(_t._gaq.push)) {
                        _t._gaq.push(['_trackPageview', decodeURI(value)]);
                    } else if ($.isFunction(_t.ga)) {
                        _t.ga('send', 'pageview', value);
                    }
                }
            },
            _html = function() {
                var src = _js() + ':' + FALSE + ';document.open();document.writeln(\'<html><head><title>' + 
                    _d.title.replace(/\'/g, '\\\'') + '</title><script>var ' + ID + ' = "' + encodeURIComponent(_href()).replace(/\'/g, '\\\'') + 
                    (_d.domain != _l.hostname ? '";document.domain="' + _d.domain : '') + 
                    '";</' + 'script></head></html>\');document.close();';
                if (_version < 7) {
                    _frame.src = src;
                } else {
                    _frame.contentWindow.location.replace(src);
                }
            },
            _options = function() {
                if (_url && _qi != -1) {
                    var i, param, params = _url.substr(_qi + 1).split('&');
                    for (i = 0; i < params.length; i++) {
                        param = params[i].split('=');
                        if (/^(autoUpdate|history|strict|wrap)$/.test(param[0])) {
                            _opts[param[0]] = (isNaN(param[1]) ? /^(true|yes)$/i.test(param[1]) : (parseInt(param[1], 10) !== 0));
                        }
                        if (/^(state|tracker)$/.test(param[0])) {
                            _opts[param[0]] = param[1];
                        }
                    }
                    _url = NULL;
                }
                _value = _href();
            },
            _load = function() {
                if (!_loaded) {
                    _loaded = TRUE;
                    _options();
                    $('a[rel*="address:"]').address();
                    if (_opts.wrap) {
                        var body = $('body'),
                            wrap = $('body > *')
                                .wrapAll('<div style="padding:' + 
                                    (_cssint(body, 'marginTop') + _cssint(body, 'paddingTop')) + 'px ' + 
                                    (_cssint(body, 'marginRight') + _cssint(body, 'paddingRight')) + 'px ' + 
                                    (_cssint(body, 'marginBottom') + _cssint(body, 'paddingBottom')) + 'px ' + 
                                    (_cssint(body, 'marginLeft') + _cssint(body, 'paddingLeft')) + 'px;" />')
                                .parent()
                                .wrap('<div id="' + ID + '" style="height:100%;overflow:auto;position:relative;' + 
                                    (_webkit && !window.statusbar.visible ? 'resize:both;' : '') + '" />');
                        $('html, body')
                            .css({
                                height: '100%',
                                margin: 0,
                                padding: 0,
                                overflow: 'hidden'
                            });
                        if (_webkit) {
                            $('<style type="text/css" />')
                                .appendTo('head')
                                .text('#' + ID + '::-webkit-resizer { background-color: #fff; }');
                        }
                    }
                    if (_msie && !_hashchange) {
                        var frameset = _d.getElementsByTagName('frameset')[0];
                        _frame = _d.createElement((frameset ? '' : 'i') + 'frame');
                        _frame.src = _js() + ':' + FALSE;
                        if (frameset) {
                            frameset.insertAdjacentElement('beforeEnd', _frame);
                            frameset[frameset.cols ? 'cols' : 'rows'] += ',0';
                            _frame.noResize = TRUE;
                            _frame.frameBorder = _frame.frameSpacing = 0;
                        } else {
                            _frame.style.display = 'none';
                            _frame.style.width = _frame.style.height = 0;
                            _frame.tabIndex = -1;
                            _d.body.insertAdjacentElement('afterBegin', _frame);
                        }
                        _st(function() {
                            $(_frame).bind('load', function() {
                                var win = _frame.contentWindow;
                                _value = win[ID] !== UNDEFINED ? win[ID] : '';
                                if (_value != _href()) {
                                    _update(FALSE);
                                    _l.hash = _value;
                                }
                            });
                            if (_frame.contentWindow[ID] === UNDEFINED) {
                                _html();
                            }
                        }, 50);
                    }
                    _st(function() {
                        _trigger('init');
                        _update(FALSE);
                    }, 1);
                    if (!_supportsState()) {
                        if ((_msie && _version > 7) || (!_msie && _hashchange)) {
                            if (_t.addEventListener) {
                                _t.addEventListener(HASH_CHANGE, _listen, FALSE);
                            } else if (_t.attachEvent) {
                                _t.attachEvent('on' + HASH_CHANGE, _listen);
                            }
                        } else {
                            _si(_listen, 50);
                        }
                    }
                    if ('state' in window.history) {
                        $(window).trigger('popstate');
                    }
                }
            },
            _popstate = function() {
                if (decodeURI(_value) != decodeURI(_href())) {
                    _value = _href();
                    _update(FALSE);
                }
            },
            _unload = function() {
                if (_t.removeEventListener) {
                    _t.removeEventListener(HASH_CHANGE, _listen, FALSE);
                } else if (_t.detachEvent) {
                    _t.detachEvent('on' + HASH_CHANGE, _listen);
                }
            },
            _uaMatch = function(ua) {
                ua = ua.toLowerCase();
                var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
                    /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
                    /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
                    /(msie) ([\w.]+)/.exec( ua ) ||
                    ua.indexOf('compatible') < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
                    [];
                return {
                    browser: match[ 1 ] || '',
                    version: match[ 2 ] || '0'
                };
            },
            _detectBrowser = function() {
                var browser = {},
                    matched = _uaMatch(navigator.userAgent);
                if (matched.browser) {
                    browser[matched.browser] = true;
                    browser.version = matched.version;
                }
                if (browser.chrome) {
                    browser.webkit = true;
                } else if (browser.webkit) {
                    browser.safari = true;
                }
                return browser;
            },
            UNDEFINED,
            NULL = null,
            ID = 'jQueryAddress',
            STRING = 'string',
            HASH_CHANGE = 'hashchange',
            INIT = 'init',
            CHANGE = 'change',
            INTERNAL_CHANGE = 'internalChange',
            EXTERNAL_CHANGE = 'externalChange',
            TRUE = true,
            FALSE = false,
            _opts = {
                autoUpdate: TRUE, 
                history: TRUE, 
                strict: TRUE,
                frames: TRUE,
                wrap: FALSE
            },
            _browser = _detectBrowser(),
            _version = parseFloat(_browser.version),
            _webkit = _browser.webkit || _browser.safari,
            _msie = !$.support.opacity,
            _t = _window(),
            _d = _t.document,
            _h = _t.history, 
            _l = _t.location,
            _si = setInterval,
            _st = setTimeout,
            _re = /\/{2,9}/g,
            _agent = navigator.userAgent,
            _hashchange = 'on' + HASH_CHANGE in _t,
            _frame,
            _form,
            _url = $('script:last').attr('src'),
            _qi = _url ? _url.indexOf('?') : -1,
            _title = _d.title, 
            _silent = FALSE,
            _loaded = FALSE,
            _juststart = TRUE,
            _updating = FALSE,
            _listeners = {}, 
            _value = _href();
            
        if (_msie) {
            _version = parseFloat(_agent.substr(_agent.indexOf('MSIE') + 4));
            if (_d.documentMode && _d.documentMode != _version) {
                _version = _d.documentMode != 8 ? 7 : 8;
            }
            var pc = _d.onpropertychange;
            _d.onpropertychange = function() {
                if (pc) {
                    pc.call(_d);
                }
                if (_d.title != _title && _d.title.indexOf('#' + _href()) != -1) {
                    _d.title = _title;
                }
            };
        }
        
        if (_h.navigationMode) {
            _h.navigationMode = 'compatible';
        }
        if (document.readyState == 'complete') {
            var interval = setInterval(function() {
                if ($.address) {
                    _load();
                    clearInterval(interval);
                }
            }, 50);
        } else {
            _options();
            $(_load);
        }
        $(window).bind('popstate', _popstate).bind('unload', _unload);

        return {
            bind: function(type, data, fn) {
                return _bind.apply(this, _array(arguments));
            },
            unbind: function(type, fn) {
                return _unbind.apply(this, _array(arguments));
            },
            init: function(data, fn) {
                return _bind.apply(this, [INIT].concat(_array(arguments)));
            },
            change: function(data, fn) {
                return _bind.apply(this, [CHANGE].concat(_array(arguments)));
            },
            internalChange: function(data, fn) {
                return _bind.apply(this, [INTERNAL_CHANGE].concat(_array(arguments)));
            },
            externalChange: function(data, fn) {
                return _bind.apply(this, [EXTERNAL_CHANGE].concat(_array(arguments)));
            },
            baseURL: function() {
                var url = _l.href;
                if (url.indexOf('#') != -1) {
                    url = url.substr(0, url.indexOf('#'));
                }
                if (/\/$/.test(url)) {
                    url = url.substr(0, url.length - 1);
                }
                return url;
            },
            autoUpdate: function(value) {
                if (value !== UNDEFINED) {
                    _opts.autoUpdate = value;
                    return this;
                }
                return _opts.autoUpdate;
            },
            history: function(value) {
                if (value !== UNDEFINED) {
                    _opts.history = value;
                    return this;
                }
                return _opts.history;
            },
            state: function(value) {
                if (value !== UNDEFINED) {
                    _opts.state = value;
                    var hrefState = _hrefState();
                    if (_opts.state !== UNDEFINED) {
                        if (_h.pushState) {
                            if (hrefState.substr(0, 3) == '/#/') {
                                _l.replace(_opts.state.replace(/^\/$/, '') + hrefState.substr(2));
                            }
                        } else if (hrefState != '/' && hrefState.replace(/^\/#/, '') != _hrefHash()) {
                            _st(function() {
                                _l.replace(_opts.state.replace(/^\/$/, '') + '/#' + hrefState);
                            }, 1);
                        }
                    }
                    return this;
                }
                return _opts.state;
            },
            frames: function(value) {
                if (value !== UNDEFINED) {
                    _opts.frames = value;
                    _t = _window();
                    return this;
                }
                return _opts.frames;
            },            
            strict: function(value) {
                if (value !== UNDEFINED) {
                    _opts.strict = value;
                    return this;
                }
                return _opts.strict;
            },
            tracker: function(value) {
                if (value !== UNDEFINED) {
                    _opts.tracker = value;
                    return this;
                }
                return _opts.tracker;
            },
            wrap: function(value) {
                if (value !== UNDEFINED) {
                    _opts.wrap = value;
                    return this;
                }
                return _opts.wrap;
            },
            update: function() {
                _updating = TRUE;
                this.value(_value);
                _updating = FALSE;
                return this;
            },
            title: function(value) {
                if (value !== UNDEFINED) {
                    _st(function() {
                        _title = _d.title = value;
                        if (_juststart && _frame && _frame.contentWindow && _frame.contentWindow.document) {
                            _frame.contentWindow.document.title = value;
                            _juststart = FALSE;
                        }
                    }, 50);
                    return this;
                }
                return _d.title;
            },
            value: function(value) {
                if (value !== UNDEFINED) {
                    value = _strict(value);
                    if (value == '/') {
                        value = '';
                    }
                    if (_value == value && !_updating) {
                        return;
                    }
                    _value = value;
                    if (_opts.autoUpdate || _updating) {
                        if (_update(TRUE)) {
                            return this;
                        }
                        if (_supportsState()) {
                            _h[_opts.history ? 'pushState' : 'replaceState']({}, '', 
                                    _opts.state.replace(/\/$/, '') + (_value === '' ? '/' : _value));
                        } else {
                            _silent = TRUE;
                            if (_webkit) {
                                if (_opts.history) {
                                    _l.hash = '#' + _value;
                                } else {
                                    _l.replace('#' + _value);
                                }
                            } else if (_value != _href()) {
                                if (_opts.history) {
                                    _l.hash = '#' + _value;
                                } else {
                                    _l.replace('#' + _value);
                                }
                            }
                            if ((_msie && !_hashchange) && _opts.history) {
                                _st(_html, 50);
                            }
                            if (_webkit) {
                                _st(function(){ _silent = FALSE; }, 1);
                            } else {
                                _silent = FALSE;
                            }
                        }
                    }
                    return this;
                }
                return _strict(_value);
            },
            path: function(value) {
                if (value !== UNDEFINED) {
                    var qs = this.queryString(),
                        hash = this.hash();
                    this.value(value + (qs ? '?' + qs : '') + (hash ? '#' + hash : ''));
                    return this;
                }
                return _strict(_value).split('#')[0].split('?')[0];
            },
            pathNames: function() {
                var path = this.path(),
                    names = path.replace(_re, '/').split('/');
                if (path.substr(0, 1) == '/' || path.length === 0) {
                    names.splice(0, 1);
                }
                if (path.substr(path.length - 1, 1) == '/') {
                    names.splice(names.length - 1, 1);
                }
                return names;
            },
            queryString: function(value) {
                if (value !== UNDEFINED) {
                    var hash = this.hash();
                    this.value(this.path() + (value ? '?' + value : '') + (hash ? '#' + hash : ''));
                    return this;
                }
                var arr = _value.split('?');
                return arr.slice(1, arr.length).join('?').split('#')[0];
            },
            parameter: function(name, value, append) {
                var i, params;
                if (value !== UNDEFINED) {
                    var names = this.parameterNames();
                    params = [];
                    value = value === UNDEFINED || value === NULL ? '' : value.toString();
                    for (i = 0; i < names.length; i++) {
                        var n = names[i],
                            v = this.parameter(n);
                        if (typeof v == STRING) {
                            v = [v];
                        }
                        if (n == name) {
                            v = (value === NULL || value === '') ? [] : 
                                (append ? v.concat([value]) : [value]);
                        }
                        for (var j = 0; j < v.length; j++) {
                            params.push(n + '=' + v[j]);
                        }
                    }
                    if ($.inArray(name, names) == -1 && value !== NULL && value !== '') {
                        params.push(name + '=' + value);
                    }
                    this.queryString(params.join('&'));
                    return this;
                }
                value = this.queryString();
                if (value) {
                    var r = [];
                    params = value.split('&');
                    for (i = 0; i < params.length; i++) {
                        var p = params[i].split('=');
                        if (p[0] == name) {
                            r.push(p.slice(1).join('='));
                        }
                    }
                    if (r.length !== 0) {
                        return r.length != 1 ? r : r[0];
                    }
                }
            },
            parameterNames: function() {
                var qs = this.queryString(),
                    names = [];
                if (qs && qs.indexOf('=') != -1) {
                    var params = qs.split('&');
                    for (var i = 0; i < params.length; i++) {
                        var name = params[i].split('=')[0];
                        if ($.inArray(name, names) == -1) {
                            names.push(name);
                        }
                    }
                }
                return names;
            },
            hash: function(value) {
                if (value !== UNDEFINED) {
                    this.value(_value.split('#')[0] + (value ? '#' + value : ''));
                    return this;
                }
                var arr = _value.split('#');
                return arr.slice(1, arr.length).join('#');                
            }
        };
    })();
    
    $.fn.address = function(fn) {
        $(this).each(function(index) {
            if (!$(this).data('address')) {
                $(this).on('click', function(e) {
                    if (e.shiftKey || e.ctrlKey || e.metaKey || e.which == 2) {
                        return true;
                    }
                    var target = e.currentTarget;
                    if ($(target).is('a')) {
                        e.preventDefault();
                        var value = fn ? fn.call(target) : 
                            /address:/.test($(target).attr('rel')) ? $(target).attr('rel').split('address:')[1].split(' ')[0] : 
                            $.address.state() !== undefined && !/^\/?$/.test($.address.state()) ? 
                                    $(target).attr('href').replace(new RegExp('^(.*' + $.address.state() + '|\\.)'), '') : 
                                    $(target).attr('href').replace(/^(#\!?|\.)/, '');
                        $.address.value(value);
                    }
                }).on('submit', function(e) {
                    var target = e.currentTarget;
                    if ($(target).is('form')) {
                        e.preventDefault();
                        var action = $(target).attr('action'),
                            value = fn ? fn.call(target) : (action.indexOf('?') != -1 ? action.replace(/&$/, '') : action + '?') + 
                                $(target).serialize();
                        $.address.value(value);
                    }
                }).data('address', true);
            }
        });
        return this;
    };
    
})(jQuery);

;/*
 * # Semantic - Tab
 * http://github.com/jlukic/semantic-ui/
 *
 * Copyright 2013 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */


;(function ($, window, document, undefined) {

  $.fn.tab = function(parameters) {

    var
      settings        = $.extend(true, {}, $.fn.tab.settings, parameters),

      $module         = $(this),
      $tabs           = $(settings.context).find(settings.selector.tabs),

      moduleSelector  = $module.selector || '',

      cache           = {},
      firstLoad       = true,
      recursionDepth  = 0,

      activeTabPath,
      parameterArray,
      historyEvent,

      element         = this,
      time            = new Date().getTime(),
      performance     = [],

      className       = settings.className,
      metadata        = settings.metadata,
      error           = settings.error,

      eventNamespace  = '.' + settings.namespace,
      moduleNamespace = 'module-' + settings.namespace,

      instance        = $module.data(moduleNamespace),

      query           = arguments[0],
      methodInvoked   = (instance !== undefined && typeof query == 'string'),
      queryArguments  = [].slice.call(arguments, 1),

      module,
      returnedValue
    ;

    module = {

      initialize: function() {
        module.debug('Initializing Tabs', $module);

        // set up automatic routing
        if(settings.auto) {
          module.verbose('Setting up automatic tab retrieval from server');
          settings.apiSettings = {
            url: settings.path + '/{$tab}'
          };
        }

        // attach history events
        if(settings.history) {
          module.debug('Initializing page state');
          if( $.address === undefined ) {
            module.error(error.state);
            return false;
          }
          else {
            if(settings.historyType == 'hash') {
              module.debug('Using hash state change to manage state');
            }
            if(settings.historyType == 'html5') {
              module.debug('Using HTML5 to manage state');
              if(settings.path !== false) {
                $.address
                  .history(true)
                  .state(settings.path)
                ;
              }
              else {
                module.error(error.path);
                return false;
              }
            }
            $.address
              .unbind('change')
              .bind('change', module.event.history.change)
            ;
          }
        }

        // attach events if navigation wasn't set to window
        if( !$.isWindow( element ) ) {
          module.debug('Attaching tab activation events to element', $module);
          $module
            .on('click' + eventNamespace, module.event.click)
          ;
        }
        module.instantiate();
      },

      instantiate: function () {
        module.verbose('Storing instance of module', module);
        $module
          .data(moduleNamespace, module)
        ;
      },

      destroy: function() {
        module.debug('Destroying tabs', $module);
        $module
          .removeData(moduleNamespace)
          .off(eventNamespace)
        ;
      },

      event: {
        click: function(event) {
          var
            tabPath = $(this).data(metadata.tab)
          ;
          if(tabPath !== undefined) {
            if(settings.history) {
              module.verbose('Updating page state', event);
              $.address.value(tabPath);
            }
            else {
              module.verbose('Changing tab without state management', event);
              module.changeTab(tabPath);
            }
            event.preventDefault();
          }
          else {
            module.debug('No tab specified');
          }
        },
        history: {
          change: function(event) {
            var
              tabPath   = event.pathNames.join('/') || module.get.initialPath(),
              pageTitle = settings.templates.determineTitle(tabPath) || false
            ;
            module.debug('History change event', tabPath, event);
            historyEvent = event;
            if(tabPath !== undefined) {
              module.changeTab(tabPath);
            }
            if(pageTitle) {
              $.address.title(pageTitle);
            }
          }
        }
      },

      refresh: function() {
        if(activeTabPath) {
          module.debug('Refreshing tab', activeTabPath);
          module.changeTab(activeTabPath);
        }
      },

      cache: {

        read: function(cacheKey) {
          return (cacheKey !== undefined)
            ? cache[cacheKey]
            : false
          ;
        },
        add: function(cacheKey, content) {
          cacheKey = cacheKey || activeTabPath;
          module.debug('Adding cached content for', cacheKey);
          cache[cacheKey] = content;
        },
        remove: function(cacheKey) {
          cacheKey = cacheKey || activeTabPath;
          module.debug('Removing cached content for', cacheKey);
          delete cache[cacheKey];
        }
      },

      set: {
        state: function(url) {
          $.address.value(url);
        }
      },

      changeTab: function(tabPath) {
        var
          pushStateAvailable = (window.history && window.history.pushState),
          shouldIgnoreLoad   = (pushStateAvailable && settings.ignoreFirstLoad && firstLoad),
          remoteContent      = (settings.auto || $.isPlainObject(settings.apiSettings) ),
          // only get default path if not remote content
          pathArray = (remoteContent && !shouldIgnoreLoad)
            ? module.utilities.pathToArray(tabPath)
            : module.get.defaultPathArray(tabPath)
        ;
        tabPath = module.utilities.arrayToPath(pathArray);
        module.deactivate.all();
        $.each(pathArray, function(index, tab) {
          var
            currentPathArray   = pathArray.slice(0, index + 1),
            currentPath        = module.utilities.arrayToPath(currentPathArray),

            isTab              = module.is.tab(currentPath),
            isLastIndex        = (index + 1 == pathArray.length),

            $tab               = module.get.tabElement(currentPath),
            nextPathArray,
            nextPath,
            isLastTab
          ;
          module.verbose('Looking for tab', tab);
          if(isTab) {
            module.verbose('Tab was found', tab);

            // scope up
            activeTabPath = currentPath;
            parameterArray = module.utilities.filterArray(pathArray, currentPathArray);

            if(isLastIndex) {
              isLastTab = true;
            }
            else {
              nextPathArray = pathArray.slice(0, index + 2);
              nextPath      = module.utilities.arrayToPath(nextPathArray);
              isLastTab     = ( !module.is.tab(nextPath) );
              if(isLastTab) {
                module.verbose('Tab parameters found', nextPathArray);
              }
            }
            if(isLastTab && remoteContent) {
              if(!shouldIgnoreLoad) {
                module.activate.navigation(currentPath);
                module.content.fetch(currentPath, tabPath);
              }
              else {
                module.debug('Ignoring remote content on first tab load', currentPath);
                firstLoad = false;
                module.cache.add(tabPath, $tab.html());
                module.activate.all(currentPath);
                $.proxy(settings.onTabInit, $tab)(currentPath, parameterArray, historyEvent);
                $.proxy(settings.onTabLoad, $tab)(currentPath, parameterArray, historyEvent);
              }
              return false;
            }
            else {
              module.debug('Opened local tab', currentPath);
              module.activate.all(currentPath);
              if( !module.cache.read(currentPath) ) {
                module.cache.add(currentPath, true);
                module.debug('First time tab loaded calling tab init');
                $.proxy(settings.onTabInit, $tab)(currentPath, parameterArray, historyEvent);
              }
              $.proxy(settings.onTabLoad, $tab)(currentPath, parameterArray, historyEvent);
            }
          }
          else {
            module.error(error.missingTab, tab);
            return false;
          }
        });
      },

      content: {

        fetch: function(tabPath, fullTabPath) {
          var
            $tab             = module.get.tabElement(tabPath),
            apiSettings      = {
              dataType     : 'html',
              stateContext : $tab,
              success      : function(response) {
                module.cache.add(fullTabPath, response);
                module.content.update(tabPath, response);
                if(tabPath == activeTabPath) {
                  module.debug('Content loaded', tabPath);
                  module.activate.tab(tabPath);
                }
                else {
                  module.debug('Content loaded in background', tabPath);
                }
                $.proxy(settings.onTabInit, $tab)(tabPath, parameterArray, historyEvent);
                $.proxy(settings.onTabLoad, $tab)(tabPath, parameterArray, historyEvent);
              },
              urlData: { tab: fullTabPath }
            },
            request         = $tab.data(metadata.promise) || false,
            existingRequest = ( request && request.state() === 'pending' ),
            requestSettings,
            cachedContent
          ;

          fullTabPath   = fullTabPath || tabPath;
          cachedContent = module.cache.read(fullTabPath);

          if(settings.cache && cachedContent) {
            module.debug('Showing existing content', fullTabPath);
            module.content.update(tabPath, cachedContent);
            module.activate.tab(tabPath);
            $.proxy(settings.onTabLoad, $tab)(tabPath, parameterArray, historyEvent);
          }
          else if(existingRequest) {
            module.debug('Content is already loading', fullTabPath);
            $tab
              .addClass(className.loading)
            ;
          }
          else if($.api !== undefined) {
            console.log(settings.apiSettings);
            requestSettings = $.extend(true, { headers: { 'X-Remote': true } }, settings.apiSettings, apiSettings);
            module.debug('Retrieving remote content', fullTabPath, requestSettings);
            $.api( requestSettings );
          }
          else {
            module.error(error.api);
          }
        },

        update: function(tabPath, html) {
          module.debug('Updating html for', tabPath);
          var
            $tab = module.get.tabElement(tabPath)
          ;
          $tab
            .html(html)
          ;
        }
      },

      activate: {
        all: function(tabPath) {
          module.activate.tab(tabPath);
          module.activate.navigation(tabPath);
        },
        tab: function(tabPath) {
          var
            $tab = module.get.tabElement(tabPath)
          ;
          module.verbose('Showing tab content for', $tab);
          $tab.addClass(className.active);
        },
        navigation: function(tabPath) {
          var
            $navigation = module.get.navElement(tabPath)
          ;
          module.verbose('Activating tab navigation for', $navigation, tabPath);
          $navigation.addClass(className.active);
        }
      },

      deactivate: {
        all: function() {
          module.deactivate.navigation();
          module.deactivate.tabs();
        },
        navigation: function() {
          $module
            .removeClass(className.active)
          ;
        },
        tabs: function() {
          $tabs
            .removeClass(className.active + ' ' + className.loading)
          ;
        }
      },

      is: {
        tab: function(tabName) {
          return (tabName !== undefined)
            ? ( module.get.tabElement(tabName).size() > 0 )
            : false
          ;
        }
      },

      get: {
        initialPath: function() {
          return $module.eq(0).data(metadata.tab) || $tabs.eq(0).data(metadata.tab);
        },
        path: function() {
          return $.address.value();
        },
        // adds default tabs to tab path
        defaultPathArray: function(tabPath) {
          return module.utilities.pathToArray( module.get.defaultPath(tabPath) );
        },
        defaultPath: function(tabPath) {
          var
            $defaultNav = $module.filter('[data-' + metadata.tab + '^="' + tabPath + '/"]').eq(0),
            defaultTab  = $defaultNav.data(metadata.tab) || false
          ;
          if( defaultTab ) {
            module.debug('Found default tab', defaultTab);
            if(recursionDepth < settings.maxDepth) {
              recursionDepth++;
              return module.get.defaultPath(defaultTab);
            }
            module.error(error.recursion);
          }
          else {
            module.debug('No default tabs found for', tabPath, $tabs);
          }
          recursionDepth = 0;
          return tabPath;
        },
        navElement: function(tabPath) {
          tabPath = tabPath || activeTabPath;
          return $module.filter('[data-' + metadata.tab + '="' + tabPath + '"]');
        },
        tabElement: function(tabPath) {
          var
            $fullPathTab,
            $simplePathTab,
            tabPathArray,
            lastTab
          ;
          tabPath        = tabPath || activeTabPath;
          tabPathArray   = module.utilities.pathToArray(tabPath);
          lastTab        = module.utilities.last(tabPathArray);
          $fullPathTab   = $tabs.filter('[data-' + metadata.tab + '="' + lastTab + '"]');
          $simplePathTab = $tabs.filter('[data-' + metadata.tab + '="' + tabPath + '"]');
          return ($fullPathTab.size() > 0)
            ? $fullPathTab
            : $simplePathTab
          ;
        },
        tab: function() {
          return activeTabPath;
        }
      },

      utilities: {
        filterArray: function(keepArray, removeArray) {
          return $.grep(keepArray, function(keepValue) {
            return ( $.inArray(keepValue, removeArray) == -1);
          });
        },
        last: function(array) {
          return $.isArray(array)
            ? array[ array.length - 1]
            : false
          ;
        },
        pathToArray: function(pathName) {
          if(pathName === undefined) {
            pathName = activeTabPath;
          }
          return typeof pathName == 'string'
            ? pathName.split('/')
            : [pathName]
          ;
        },
        arrayToPath: function(pathArray) {
          return $.isArray(pathArray)
            ? pathArray.join('/')
            : false
          ;
        }
      },

      setting: function(name, value) {
        if( $.isPlainObject(name) ) {
          $.extend(true, settings, name);
        }
        else if(value !== undefined) {
          settings[name] = value;
        }
        else {
          return settings[name];
        }
      },
      internal: function(name, value) {
        if( $.isPlainObject(name) ) {
          $.extend(true, module, name);
        }
        else if(value !== undefined) {
          module[name] = value;
        }
        else {
          return module[name];
        }
      },
      debug: function() {
        if(settings.debug) {
          if(settings.performance) {
            module.performance.log(arguments);
          }
          else {
            module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
            module.debug.apply(console, arguments);
          }
        }
      },
      verbose: function() {
        if(settings.verbose && settings.debug) {
          if(settings.performance) {
            module.performance.log(arguments);
          }
          else {
            module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
            module.verbose.apply(console, arguments);
          }
        }
      },
      error: function() {
        module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
        module.error.apply(console, arguments);
      },
      performance: {
        log: function(message) {
          var
            currentTime,
            executionTime,
            previousTime
          ;
          if(settings.performance) {
            currentTime   = new Date().getTime();
            previousTime  = time || currentTime;
            executionTime = currentTime - previousTime;
            time          = currentTime;
            performance.push({
              'Element'        : element,
              'Name'           : message[0],
              'Arguments'      : [].slice.call(message, 1) || '',
              'Execution Time' : executionTime
            });
          }
          clearTimeout(module.performance.timer);
          module.performance.timer = setTimeout(module.performance.display, 100);
        },
        display: function() {
          var
            title = settings.name + ':',
            totalTime = 0
          ;
          time = false;
          clearTimeout(module.performance.timer);
          $.each(performance, function(index, data) {
            totalTime += data['Execution Time'];
          });
          title += ' ' + totalTime + 'ms';
          if(moduleSelector) {
            title += ' \'' + moduleSelector + '\'';
          }
          if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
            console.groupCollapsed(title);
            if(console.table) {
              console.table(performance);
            }
            else {
              $.each(performance, function(index, data) {
                console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
              });
            }
            console.groupEnd();
          }
          performance = [];
        }
      },
      invoke: function(query, passedArguments, context) {
        var
          object = instance,
          maxDepth,
          found,
          response
        ;
        passedArguments = passedArguments || queryArguments;
        context         = element         || context;
        if(typeof query == 'string' && object !== undefined) {
          query    = query.split(/[\. ]/);
          maxDepth = query.length - 1;
          $.each(query, function(depth, value) {
            var camelCaseValue = (depth != maxDepth)
              ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
              : query
            ;
            if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
              object = object[camelCaseValue];
            }
            else if( object[camelCaseValue] !== undefined ) {
              found = object[camelCaseValue];
              return false;
            }
            else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
              object = object[value];
            }
            else if( object[value] !== undefined ) {
              found = object[value];
              return false;
            }
            else {
              return false;
            }
          });
        }
        if ( $.isFunction( found ) ) {
          response = found.apply(context, passedArguments);
        }
        else if(found !== undefined) {
          response = found;
        }
        if($.isArray(returnedValue)) {
          returnedValue.push(response);
        }
        else if(returnedValue !== undefined) {
          returnedValue = [returnedValue, response];
        }
        else if(response !== undefined) {
          returnedValue = response;
        }
        return found;
      }
    };

    if(methodInvoked) {
      if(instance === undefined) {
        module.initialize();
      }
      module.invoke(query);
    }
    else {
      if(instance !== undefined) {
        module.destroy();
      }
      module.initialize();
    }

    return (returnedValue !== undefined)
      ? returnedValue
      : this
    ;

  };

  // shortcut for tabbed content with no defined navigation
  $.tab = function(settings) {
    $(window).tab(settings);
  };

  $.fn.tab.settings = {

    name        : 'Tab',
    debug       : false,
    verbose     : true,
    performance : true,
    namespace   : 'tab',

    // only called first time a tab's content is loaded (when remote source)
    onTabInit   : function(tabPath, parameterArray, historyEvent) {},
    // called on every load
    onTabLoad   : function(tabPath, parameterArray, historyEvent) {},

    templates   : {
      determineTitle: function(tabArray) {}
    },

    // uses pjax style endpoints fetching content from same url with remote-content headers
    auto            : false,
    history         : true,
    historyType     : 'hash',
    path            : false,

    context         : 'body',

    // max depth a tab can be nested
    maxDepth        : 25,
    // dont load content on first load
    ignoreFirstLoad : false,
    // load tab content new every tab click
    alwaysRefresh   : false,
    // cache the content requests to pull locally
    cache           : true,
    // settings for api call
    apiSettings     : false,

    error: {
      api        : 'You attempted to load content without API module',
      method     : 'The method you called is not defined',
      missingTab : 'Tab cannot be found',
      noContent  : 'The tab you specified is missing a content url.',
      path       : 'History enabled, but no path was specified',
      recursion  : 'Max recursive depth reached',
      state      : 'The state library has not been initialized'
    },

    metadata : {
      tab    : 'tab',
      loaded : 'loaded',
      promise: 'promise'
    },

    className   : {
      loading : 'loading',
      active  : 'active'
    },

    selector    : {
      tabs : '.ui.tab'
    }

  };

})( jQuery, window , document );
;/*
 * # Semantic - Sidebar
 * http://github.com/jlukic/semantic-ui/
 *
 *
 * Copyright 2013 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

$.fn.sidebar = function(parameters) {
  var
    $allModules    = $(this),
    $body          = $('body'),
    $head          = $('head'),

    moduleSelector = $allModules.selector || '',

    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),
    returnedValue
  ;

  $allModules
    .each(function() {
      var
        settings        = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.sidebar.settings, parameters)
          : $.extend({}, $.fn.sidebar.settings),

        selector        = settings.selector,
        className       = settings.className,
        namespace       = settings.namespace,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        $module         = $(this),
        $style          = $('style[title=' + namespace + ']'),

        element         = this,
        instance        = $module.data(moduleNamespace),
        module
      ;

      module      = {

        initialize: function() {
          module.debug('Initializing sidebar', $module);
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module for', $module);
          $module
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        refresh: function() {
          module.verbose('Refreshing selector cache');
          $style  = $('style[title=' + namespace + ']');
        },

        attachEvents: function(selector, event) {
          var
            $toggle = $(selector)
          ;
          event = $.isFunction(module[event])
            ? module[event]
            : module.toggle
          ;
          if($toggle.size() > 0) {
            module.debug('Attaching sidebar events to element', selector, event);
            $toggle
              .off(eventNamespace)
              .on('click' + eventNamespace, event)
            ;
          }
          else {
            module.error(error.notFound);
          }
        },

        show: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          module.debug('Showing sidebar', callback);
          if(module.is.closed()) {
            if(!settings.overlay) {
              if(settings.exclusive) {
                module.hideAll();
              }
              module.pushPage();
            }
            module.set.active();
            callback();
            $.proxy(settings.onChange, element)();
            $.proxy(settings.onShow, element)();
          }
          else {
            module.debug('Sidebar is already visible');
          }
        },

        hide: function(callback) {
          callback = $.isFunction(callback)
            ? callback
            : function(){}
          ;
          module.debug('Hiding sidebar', callback);
          if(module.is.open()) {
            if(!settings.overlay) {
              module.pullPage();
              module.remove.pushed();
            }
            module.remove.active();
            callback();
            $.proxy(settings.onChange, element)();
            $.proxy(settings.onHide, element)();
          }
        },

        hideAll: function() {
          $(selector.sidebar)
            .filter(':visible')
              .sidebar('hide')
          ;
        },

        toggle: function() {
          if(module.is.closed()) {
            module.show();
          }
          else {
            module.hide();
          }
        },

        pushPage: function() {
          var
            direction = module.get.direction(),
            distance  = (module.is.vertical())
              ? $module.outerHeight()
              : $module.outerWidth()
          ;
          if(settings.useCSS) {
            module.debug('Using CSS to animate body');
            module.add.bodyCSS(direction, distance);
            module.set.pushed();
          }
          else {
            module.animatePage(direction, distance, module.set.pushed);
          }
        },

        pullPage: function() {
          var
            direction = module.get.direction()
          ;
          if(settings.useCSS) {
            module.debug('Resetting body position css');
            module.remove.bodyCSS();
          }
          else {
            module.debug('Resetting body position using javascript');
            module.animatePage(direction, 0);
          }
          module.remove.pushed();
        },

        animatePage: function(direction, distance) {
          var
            animateSettings = {}
          ;
          animateSettings['padding-' + direction] = distance;
          module.debug('Using javascript to animate body', animateSettings);
          $body
            .animate(animateSettings, settings.duration, module.set.pushed)
          ;
        },

        add: {
          bodyCSS: function(direction, distance) {
            var
              style
            ;
            if(direction !== className.bottom) {
              style = ''
                + '<style title="' + namespace + '">'
                + 'body.pushed {'
                + '  margin-' + direction + ': ' + distance + 'px !important;'
                + '}'
                + '</style>'
              ;
            }
            $head.append(style);
            module.debug('Adding body css to head', $style);
          }
        },


        remove: {
          bodyCSS: function() {
            module.debug('Removing body css styles', $style);
            module.refresh();
            $style.remove();
          },
          active: function() {
            $module.removeClass(className.active);
          },
          pushed: function() {
            module.verbose('Removing body push state', module.get.direction());
            $body
              .removeClass(className[ module.get.direction() ])
              .removeClass(className.pushed)
            ;
          }
        },

        set: {
          active: function() {
            $module.addClass(className.active);
          },
          pushed: function() {
            module.verbose('Adding body push state', module.get.direction());
            $body
              .addClass(className[ module.get.direction() ])
              .addClass(className.pushed)
            ;
          }
        },

        get: {
          direction: function() {
            if($module.hasClass(className.top)) {
              return className.top;
            }
            else if($module.hasClass(className.right)) {
              return className.right;
            }
            else if($module.hasClass(className.bottom)) {
              return className.bottom;
            }
            else {
              return className.left;
            }
          },
          transitionEvent: function() {
            var
              element     = document.createElement('element'),
              transitions = {
                'transition'       :'transitionend',
                'OTransition'      :'oTransitionEnd',
                'MozTransition'    :'transitionend',
                'WebkitTransition' :'webkitTransitionEnd'
              },
              transition
            ;
            for(transition in transitions){
              if( element.style[transition] !== undefined ){
                return transitions[transition];
              }
            }
          }
        },

        is: {
          open: function() {
            return $module.is(':animated') || $module.hasClass(className.active);
          },
          closed: function() {
            return !module.is.open();
          },
          vertical: function() {
            return $module.hasClass(className.top);
          }
        },

        setting: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Element'        : element,
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if($allModules.size() > 1) {
              title += ' ' + '(' + $allModules.size() + ')';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };
      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.sidebar.settings = {

  name        : 'Sidebar',
  namespace   : 'sidebar',

  debug       : false,
  verbose     : true,
  performance : true,

  useCSS      : true,
  exclusive   : true,
  overlay     : false,
  duration    : 300,

  onChange     : function(){},
  onShow       : function(){},
  onHide       : function(){},

  className: {
    active : 'active',
    pushed : 'pushed',
    top    : 'top',
    left   : 'left',
    right  : 'right',
    bottom : 'bottom'
  },

  selector: {
    sidebar: '.ui.sidebar'
  },

  error   : {
    method   : 'The method you called is not defined.',
    notFound : 'There were no elements that matched the specified selector'
  }

};

})( jQuery, window , document );
;/*
 * # Semantic - Popup
 * http://github.com/jlukic/semantic-ui/
 *
 *
 * Copyright 2013 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ($, window, document, undefined) {

$.fn.popup = function(parameters) {
  var
    $allModules     = $(this),
    $document       = $(document),

    moduleSelector  = $allModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    returnedValue
  ;
  $allModules
    .each(function() {
      var
        settings        = ( $.isPlainObject(parameters) )
          ? $.extend(true, {}, $.fn.popup.settings, parameters)
          : $.extend({}, $.fn.popup.settings),

        selector        = settings.selector,
        className       = settings.className,
        error           = settings.error,
        metadata        = settings.metadata,
        namespace       = settings.namespace,

        eventNamespace  = '.' + settings.namespace,
        moduleNamespace = 'module-' + namespace,

        $module         = $(this),
        $context        = $(settings.context),
        $target         = (settings.target)
          ? $(settings.target)
          : $module,

        $window         = $(window),

        $offsetParent   = (settings.inline)
          ? $target.offsetParent()
          : $window,
        $popup          = (settings.inline)
          ? $target.next(settings.selector.popup)
          : $window.children(settings.selector.popup).last(),

        searchDepth     = 0,

        element         = this,
        instance        = $module.data(moduleNamespace),
        module
      ;

      module = {

        // binds events
        initialize: function() {
          module.debug('Initializing module', $module);
          if(settings.on == 'click') {
            $module
              .on('click', module.toggle)
            ;
          }
          else {
            $module
              .on(module.get.startEvent() + eventNamespace, module.event.start)
              .on(module.get.endEvent() + eventNamespace, module.event.end)
            ;
          }
          if(settings.target) {
            module.debug('Target set to element', $target);
          }
          $window
            .on('resize' + eventNamespace, module.event.resize)
          ;
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, instance)
          ;
        },

        refresh: function() {
          if(settings.inline) {
            $popup = $target.next(selector.popup);
            $offsetParent = $target.offsetParent();
          }
          else {
            $popup = $window.children(selector.popup).last();
          }
        },

        destroy: function() {
          module.debug('Destroying previous module');
          $window
            .off(eventNamespace)
          ;
          $popup
            .remove()
          ;
          $module
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        event: {
          start:  function(event) {
            module.timer = setTimeout(function() {
              if( module.is.hidden() ) {
                module.show();
              }
            }, settings.delay);
          },
          end:  function() {
            clearTimeout(module.timer);
            if( module.is.visible() ) {
              module.hide();
            }
          },
          resize: function() {
            if( module.is.visible() ) {
              module.set.position();
            }
          }
        },

        // generates popup html from metadata
        create: function() {
          module.debug('Creating pop-up html');
          var
            html      = $module.data(metadata.html)      || settings.html,
            variation = $module.data(metadata.variation) || settings.variation,
            title     = $module.data(metadata.title)     || settings.title,
            content   = $module.data(metadata.content)   || $module.attr('title') || settings.content
          ;
          if(html || content || title) {
            if(!html) {
              html = settings.template({
                title   : title,
                content : content
              });
            }
            $popup = $('<div/>')
              .addClass(className.popup)
              .addClass(variation)
              .html(html)
            ;
            if(settings.inline) {
              module.verbose('Inserting popup element inline', $popup);
              $popup
                .data(moduleNamespace, instance)
                .insertAfter($module)
              ;
            }
            else {
              module.verbose('Appending popup element to body', $popup);
              $popup
                .data(moduleNamespace, instance)
                .appendTo( $context )
              ;
            }
            $.proxy(settings.onCreate, $popup)();
          }
          else {
            module.error(error.content);
          }
        },

        // determines popup state
        toggle: function() {
          module.debug('Toggling pop-up');
          if( module.is.hidden() ) {
            module.debug('Popup is hidden, showing pop-up');
            module.unbind.close();
            module.hideAll();
            module.show();
          }
          else {
            module.debug('Popup is visible, hiding pop-up');
            module.hide();
          }
        },

        show: function(callback) {
          callback = callback || function(){};
          module.debug('Showing pop-up', settings.transition);
          if(!settings.preserve) {
            module.refresh();
          }
          if( !module.exists() ) {
            module.create();
          }
          module.save.conditions();
          module.set.position();
          module.animate.show(callback);
        },


        hide: function(callback) {
          callback = callback || function(){};
          $module
            .removeClass(className.visible)
          ;
          module.restore.conditions();
          module.unbind.close();
          if( module.is.visible() ) {
            module.animate.hide(callback);
          }
        },

        hideAll: function() {
          $(selector.popup)
            .filter(':visible')
              .popup('hide')
          ;
        },

        hideGracefully: function(event) {
          // don't close on clicks inside popup
          if(event && $(event.target).closest(selector.popup).size() === 0) {
            module.debug('Click occurred outside popup hiding popup');
            module.hide();
          }
          else {
            module.debug('Click was inside popup, keeping popup open');
          }
        },

        exists: function() {
          if(settings.inline) {
            return ( $popup.size() !== 0 );
          }
          else {
            return ( $popup.parent($context).size() );
          }
        },

        remove: function() {
          module.debug('Removing popup');
          $popup
            .remove()
          ;
          $.proxy(settings.onRemove, $popup)();
        },

        save: {
          conditions: function() {
            module.cache = {
              title: $module.attr('title')
            };
            if (module.cache.title) {
              $module.removeAttr('title');
            }
            module.verbose('Saving original attributes', module.cache.title);
          }
        },
        restore: {
          conditions: function() {
            if(module.cache && module.cache.title) {
              $module.attr('title', module.cache.title);
              module.verbose('Restoring original attributes', module.cache.title);
            }
            return true;
          }
        },
        animate: {
          show: function(callback) {
            callback = callback || function(){};
            $module
              .addClass(className.visible)
            ;
            if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
              $popup
                .transition(settings.transition + ' in', settings.duration, function() {
                  module.bind.close();
                  $.proxy(callback, element)();
                })
              ;
            }
            else {
              $popup
                .stop()
                .fadeIn(settings.duration, settings.easing, function() {
                  module.bind.close();
                  $.proxy(callback, element)();
                })
              ;
            }
            $.proxy(settings.onShow, element)();
          },
          hide: function(callback) {
            callback = callback || function(){};
            module.debug('Hiding pop-up');
            if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
              $popup
                .transition(settings.transition + ' out', settings.duration, function() {
                  module.reset();
                  callback();
                })
              ;
            }
            else {
              $popup
                .stop()
                .fadeOut(settings.duration, settings.easing, function() {
                  module.reset();
                  callback();
                })
              ;
            }
            $.proxy(settings.onHide, element)();
          }
        },

        get: {
          startEvent: function() {
            if(settings.on == 'hover') {
              return 'mouseenter';
            }
            else if(settings.on == 'focus') {
              return 'focus';
            }
          },
          endEvent: function() {
            if(settings.on == 'hover') {
              return 'mouseleave';
            }
            else if(settings.on == 'focus') {
              return 'blur';
            }
          },
          offstagePosition: function() {
            var
              boundary  = {
                top    : $(window).scrollTop(),
                bottom : $(window).scrollTop() + $(window).height(),
                left   : 0,
                right  : $(window).width()
              },
              popup     = {
                width    : $popup.width(),
                height   : $popup.outerHeight(),
                position : $popup.offset()
              },
              offstage  = {},
              offstagePositions = []
            ;
            if(popup.position) {
              offstage = {
                top    : (popup.position.top < boundary.top),
                bottom : (popup.position.top + popup.height > boundary.bottom),
                right  : (popup.position.left + popup.width > boundary.right),
                left   : (popup.position.left < boundary.left)
              };
            }
            module.verbose('Checking if outside viewable area', popup.position);
            // return only boundaries that have been surpassed
            $.each(offstage, function(direction, isOffstage) {
              if(isOffstage) {
                offstagePositions.push(direction);
              }
            });
            return (offstagePositions.length > 0)
              ? offstagePositions.join(' ')
              : false
            ;
          },
          nextPosition: function(position) {
            switch(position) {
              case 'top left':
                position = 'bottom left';
              break;
              case 'bottom left':
                position = 'top right';
              break;
              case 'top right':
                position = 'bottom right';
              break;
              case 'bottom right':
                position = 'top center';
              break;
              case 'top center':
                position = 'bottom center';
              break;
              case 'bottom center':
                position = 'right center';
              break;
              case 'right center':
                position = 'left center';
              break;
              case 'left center':
                position = 'top center';
              break;
            }
            return position;
          }
        },

        set: {
          position: function(position, arrowOffset) {
            var
              windowWidth  = $(window).width(),
              windowHeight = $(window).height(),

              width        = $target.outerWidth(),
              height       = $target.outerHeight(),

              popupWidth   = $popup.width(),
              popupHeight  = $popup.outerHeight(),

              parentWidth  = $offsetParent.outerWidth(),
              parentHeight = $offsetParent.outerHeight(),

              distanceAway = settings.distanceAway,

              offset       = (settings.inline)
                ? $target.position()
                : $target.offset(),

              positioning,
              offstagePosition
            ;
            position    = position    || $module.data(metadata.position)    || settings.position;
            arrowOffset = arrowOffset || $module.data(metadata.offset)      || settings.offset;
            // adjust for margin when inline
            if(settings.inline) {
              if(position == 'left center' || position == 'right center') {
                arrowOffset  += parseInt( window.getComputedStyle(element).getPropertyValue('margin-top'), 10);
                distanceAway += -parseInt( window.getComputedStyle(element).getPropertyValue('margin-left'), 10);
              }
              else {
                arrowOffset  += parseInt( window.getComputedStyle(element).getPropertyValue('margin-left'), 10);
                distanceAway += parseInt( window.getComputedStyle(element).getPropertyValue('margin-top'), 10);
              }
            }
            module.debug('Calculating offset for position', position);
            switch(position) {
              case 'top left':
                positioning = {
                  bottom :  parentHeight - offset.top + distanceAway,
                  right  :  parentWidth - offset.left - arrowOffset,
                  top    : 'auto',
                  left   : 'auto'
                };
              break;
              case 'top center':
                positioning = {
                  bottom :  parentHeight - offset.top + distanceAway,
                  left   : offset.left + (width / 2) - (popupWidth / 2) + arrowOffset,
                  top    : 'auto',
                  right  : 'auto'
                };
              break;
              case 'top right':
                positioning = {
                  top    : 'auto',
                  bottom :  parentHeight - offset.top + distanceAway,
                  left   : offset.left + width + arrowOffset,
                  right  : 'auto'
                };
              break;
              case 'left center':
                positioning = {
                  top    :  offset.top + (height / 2) - (popupHeight / 2) + arrowOffset,
                  right  : parentWidth - offset.left + distanceAway,
                  left   : 'auto',
                  bottom : 'auto'
                };
              break;
              case 'right center':
                positioning = {
                  top    :  offset.top + (height / 2) - (popupHeight / 2) + arrowOffset,
                  left   : offset.left + width + distanceAway,
                  bottom : 'auto',
                  right  : 'auto'
                };
              break;
              case 'bottom left':
                positioning = {
                  top    :  offset.top + height + distanceAway,
                  right  : parentWidth - offset.left - arrowOffset,
                  left   : 'auto',
                  bottom : 'auto'
                };
              break;
              case 'bottom center':
                positioning = {
                  top    :  offset.top + height + distanceAway,
                  left   : offset.left + (width / 2) - (popupWidth / 2) + arrowOffset,
                  bottom : 'auto',
                  right  : 'auto'
                };
              break;
              case 'bottom right':
                positioning = {
                  top    :  offset.top + height + distanceAway,
                  left   : offset.left + width + arrowOffset,
                  bottom : 'auto',
                  right  : 'auto'
                };
              break;
            }
            // tentatively place on stage
            $popup
              .css(positioning)
              .removeClass(className.position)
              .addClass(position)
              .addClass(className.loading)
            ;
            // check if is offstage
            offstagePosition = module.get.offstagePosition();

            // recursively find new positioning
            if(offstagePosition) {
              module.debug('Element is outside boundaries', offstagePosition);
              if(searchDepth < settings.maxSearchDepth) {
                position = module.get.nextPosition(position);
                searchDepth++;
                module.debug('Trying new position', position);
                return module.set.position(position);
              }
              else {
                module.error(error.recursion);
                searchDepth = 0;
                module.reset();
                $popup.removeClass(className.loading);
                return false;
              }
            }
            else {
              module.debug('Position is on stage', position);
              searchDepth = 0;
              $popup.removeClass(className.loading);
              return true;
            }
          }

        },

        bind: {
          close:function() {
            if(settings.on == 'click' && settings.closable) {
              module.verbose('Binding popup close event to document');
              $document
                .on('click' + eventNamespace, function(event) {
                  module.verbose('Pop-up clickaway intent detected');
                  $.proxy(module.hideGracefully, this)(event);
                })
              ;
            }
          }
        },

        unbind: {
          close: function() {
            if(settings.on == 'click' && settings.closable) {
              module.verbose('Removing close event from document');
              $document
                .off('click' + eventNamespace)
              ;
            }
          }
        },

        is: {
          animating: function() {
            return ( $popup.is(':animated') || $popup.hasClass(className.animating) );
          },
          visible: function() {
            return $popup.is(':visible');
          },
          hidden: function() {
            return !module.is.visible();
          }
        },

        reset: function() {
          $popup
            .attr('style', '')
            .removeAttr('style')
          ;
          if(!settings.preserve) {
            module.remove();
          }
        },

        setting: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Element'        : element,
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.popup.settings = {

  name           : 'Popup',
  debug          : false,
  verbose        : true,
  performance    : true,
  namespace      : 'popup',

  onCreate       : function(){},
  onRemove       : function(){},
  onShow         : function(){},
  onHide         : function(){},

  variation      : '',
  content        : false,
  html           : false,
  title          : false,

  on             : 'hover',
  target         : false,
  closable       : true,

  context        : 'body',
  position       : 'top center',
  delay          : 150,
  inline         : false,
  preserve       : false,

  duration       : 250,
  easing         : 'easeOutQuad',
  transition     : 'scale',

  distanceAway   : 0,
  offset         : 0,
  maxSearchDepth : 10,

  error: {
    content   : 'Your popup has no content specified',
    method    : 'The method you called is not defined.',
    recursion : 'Popup attempted to reposition element to fit, but could not find an adequate position.'
  },

  metadata: {
    content   : 'content',
    html      : 'html',
    offset    : 'offset',
    position  : 'position',
    title     : 'title',
    variation : 'variation'
  },

  className   : {
    animating   : 'animating',
    loading     : 'loading',
    popup       : 'ui popup',
    position    : 'top left center bottom right',
    visible     : 'visible'
  },

  selector    : {
    popup    : '.ui.popup'
  },

  template: function(text) {
    var html = '';
    if(typeof text !== undefined) {
      if(typeof text.title !== undefined && text.title) {
        html += '<div class="header">' + text.title + '</div class="header">';
      }
      if(typeof text.content !== undefined && text.content) {
        html += '<div class="content">' + text.content + '</div>';
      }
    }
    return html;
  }

};

// Adds easing
$.extend( $.easing, {
  easeOutQuad: function (x, t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
  }
});


})( jQuery, window , document );
;/*
 * # Semantic - Form Validation
 * http://github.com/jlukic/semantic-ui/
 *
 *
 * Copyright 2013 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

$.fn.form = function(fields, parameters) {
  var
    $allModules     = $(this),

    settings        = $.extend(true, {}, $.fn.form.settings, parameters),
    validation      = $.extend({}, $.fn.form.settings.defaults, fields),

    namespace       = settings.namespace,
    metadata        = settings.metadata,
    selector        = settings.selector,
    className       = settings.className,
    error           = settings.error,

    eventNamespace  = '.' + namespace,
    moduleNamespace = 'module-' + namespace,

    moduleSelector  = $allModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),
    returnedValue
  ;
  $allModules
    .each(function() {
      var
        $module    = $(this),
        $field     = $(this).find(selector.field),
        $group     = $(this).find(selector.group),
        $message   = $(this).find(selector.message),
        $prompt    = $(this).find(selector.prompt),
        $submit    = $(this).find(selector.submit),

        formErrors = [],

        element    = this,
        instance   = $module.data(moduleNamespace),
        module
      ;

      module      = {

        initialize: function() {
          module.verbose('Initializing form validation', $module, validation, settings);
          module.bindEvents();
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          $module
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module', instance);
          module.removeEvents();
          $module
            .removeData(moduleNamespace)
          ;
        },

        refresh: function() {
          module.verbose('Refreshing selector cache');
          $field = $module.find(selector.field);
        },

        submit: function() {
          module.verbose('Submitting form', $module);
          $module
            .submit()
          ;
        },

        bindEvents: function() {
          if(settings.keyboardShortcuts) {
            $field
              .on('keydown' + eventNamespace, module.event.field.keydown)
            ;
          }
          $module
            .on('submit' + eventNamespace, module.validate.form)
          ;
          $field
            .on('blur' + eventNamespace, module.event.field.blur)
          ;
          $submit
            .on('click' + eventNamespace, module.submit)
          ;
          $field
            .each(function() {
              var
                type       = $(this).prop('type'),
                inputEvent = module.get.changeEvent(type)
              ;
              $(this)
                .on(inputEvent + eventNamespace, module.event.field.change)
              ;
            })
          ;
        },

        removeEvents: function() {
          $module
            .off(eventNamespace)
          ;
          $field
            .off(eventNamespace)
          ;
          $submit
            .off(eventNamespace)
          ;
          $field
            .off(eventNamespace)
          ;
        },

        event: {
          field: {
            keydown: function(event) {
              var
                $field  = $(this),
                key     = event.which,
                keyCode = {
                  enter  : 13,
                  escape : 27
                }
              ;
              if( key == keyCode.escape) {
                module.verbose('Escape key pressed blurring field');
                $field
                  .blur()
                ;
              }
              if(!event.ctrlKey && key == keyCode.enter && $field.is(selector.input) ) {
                module.debug('Enter key pressed, submitting form');
                $submit
                  .addClass(className.down)
                ;
                $field
                  .one('keyup' + eventNamespace, module.event.field.keyup)
                ;
                event.preventDefault();
                return false;
              }
            },
            keyup: function() {
              module.verbose('Doing keyboard shortcut form submit');
              $submit.removeClass(className.down);
              module.submit();
            },
            blur: function() {
              var
                $field      = $(this),
                $fieldGroup = $field.closest($group)
              ;
              if( $fieldGroup.hasClass(className.error) ) {
                module.debug('Revalidating field', $field,  module.get.validation($field));
                module.validate.field( module.get.validation($field) );
              }
              else if(settings.on == 'blur' || settings.on == 'change') {
                module.validate.field( module.get.validation($field) );
              }
            },
            change: function() {
              var
                $field      = $(this),
                $fieldGroup = $field.closest($group)
              ;
              if(settings.on == 'change' || ( $fieldGroup.hasClass(className.error) && settings.revalidate) ) {
                clearTimeout(module.timer);
                module.timer = setTimeout(function() {
                  module.debug('Revalidating field', $field,  module.get.validation($field));
                  module.validate.field( module.get.validation($field) );
                }, settings.delay);
              }
            }
          }

        },

        get: {
          changeEvent: function(type) {
            if(type == 'checkbox' || type == 'radio' || type == 'hidden') {
              return 'change';
            }
            else {
              return (document.createElement('input').oninput !== undefined)
                ? 'input'
                : (document.createElement('input').onpropertychange !== undefined)
                  ? 'propertychange'
                  : 'keyup'
              ;
            }
          },
          field: function(identifier) {
            module.verbose('Finding field with identifier', identifier);
            if( $field.filter('#' + identifier).size() > 0 ) {
              return $field.filter('#' + identifier);
            }
            else if( $field.filter('[name="' + identifier +'"]').size() > 0 ) {
              return $field.filter('[name="' + identifier +'"]');
            }
            else if( $field.filter('[data-' + metadata.validate + '="'+ identifier +'"]').size() > 0 ) {
              return $field.filter('[data-' + metadata.validate + '="'+ identifier +'"]');
            }
            return $('<input/>');
          },
          validation: function($field) {
            var
              rules
            ;
            $.each(validation, function(fieldName, field) {
              if( module.get.field(field.identifier).get(0) == $field.get(0) ) {
                rules = field;
              }
            });
            return rules || false;
          }
        },

        has: {

          field: function(identifier) {
            module.verbose('Checking for existence of a field with identifier', identifier);
            if( $field.filter('#' + identifier).size() > 0 ) {
              return true;
            }
            else if( $field.filter('[name="' + identifier +'"]').size() > 0 ) {
              return true;
            }
            else if( $field.filter('[data-' + metadata.validate + '="'+ identifier +'"]').size() > 0 ) {
              return true;
            }
            return false;
          }

        },

        add: {
          prompt: function(identifier, errors) {
            var
              $field       = module.get.field(identifier),
              $fieldGroup  = $field.closest($group),
              $prompt      = $fieldGroup.find(selector.prompt),
              promptExists = ($prompt.size() !== 0)
            ;
            errors = (typeof errors == 'string')
              ? [errors]
              : errors
            ;
            module.verbose('Adding field error state', identifier);
            $fieldGroup
              .addClass(className.error)
            ;
            if(settings.inline) {
              if(!promptExists) {
                $prompt = settings.templates.prompt(errors);
                $prompt
                  .appendTo($fieldGroup)
                ;
              }
              $prompt
                .html(errors[0])
              ;
              if(!promptExists) {
                if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
                  module.verbose('Displaying error with css transition', settings.transition);
                  $prompt.transition(settings.transition + ' in', settings.duration);
                }
                else {
                  module.verbose('Displaying error with fallback javascript animation');
                  $prompt
                    .fadeIn(settings.duration)
                  ;
                }
              }
              else {
                module.verbose('Inline errors are disabled, no inline error added', identifier);
              }
            }
          },
          errors: function(errors) {
            module.debug('Adding form error messages', errors);
            $message
              .html( settings.templates.error(errors) )
            ;
          }
        },

        remove: {
          prompt: function(field) {
            var
              $field      = module.get.field(field.identifier),
              $fieldGroup = $field.closest($group),
              $prompt     = $fieldGroup.find(selector.prompt)
            ;
            $fieldGroup
              .removeClass(className.error)
            ;
            if(settings.inline && $prompt.is(':visible')) {
              module.verbose('Removing prompt for field', field);
              if(settings.transition && $.fn.transition !== undefined && $module.transition('is supported')) {
                $prompt.transition(settings.transition + ' out', settings.duration, function() {
                  $prompt.remove();
                });
              }
              else {
                $prompt
                  .fadeOut(settings.duration, function(){
                    $prompt.remove();
                  })
                ;
              }
            }
          }
        },

        validate: {

          form: function(event) {
            var
              allValid = true
            ;
            // reset errors
            formErrors = [];
            $.each(validation, function(fieldName, field) {
              if( !( module.validate.field(field) ) ) {
                allValid = false;
              }
            });
            if(allValid) {
              module.debug('Form has no validation errors, submitting');
              $module
                .removeClass(className.error)
                .addClass(className.success)
              ;
              return $.proxy(settings.onSuccess, this)(event);
            }
            else {
              module.debug('Form has errors');
              $module.addClass(className.error);
              if(!settings.inline) {
                module.add.errors(formErrors);
              }
              return $.proxy(settings.onFailure, this)(formErrors);
            }
          },

          // takes a validation object and returns whether field passes validation
          field: function(field) {
            var
              $field      = module.get.field(field.identifier),
              fieldValid  = true,
              fieldErrors = []
            ;
            if(field.rules !== undefined) {
              $.each(field.rules, function(index, rule) {
                if( module.has.field(field.identifier) && !( module.validate.rule(field, rule) ) ) {
                  module.debug('Field is invalid', field.identifier, rule.type);
                  fieldErrors.push(rule.prompt);
                  fieldValid = false;
                }
              });
            }
            if(fieldValid) {
              module.remove.prompt(field, fieldErrors);
              $.proxy(settings.onValid, $field)();
            }
            else {
              formErrors = formErrors.concat(fieldErrors);
              module.add.prompt(field.identifier, fieldErrors);
              $.proxy(settings.onInvalid, $field)(fieldErrors);
              return false;
            }
            return true;
          },

          // takes validation rule and returns whether field passes rule
          rule: function(field, validation) {
            var
              $field        = module.get.field(field.identifier),
              type          = validation.type,
              value         = $.trim($field.val() + ''),

              bracketRegExp = /\[(.*)\]/i,
              bracket       = bracketRegExp.exec(type),
              isValid       = true,
              ancillary,
              functionType
            ;
            // if bracket notation is used, pass in extra parameters
            if(bracket !== undefined && bracket !== null) {
              ancillary    = '' + bracket[1];
              functionType = type.replace(bracket[0], '');
              isValid      = $.proxy(settings.rules[functionType], $module)(value, ancillary);
            }
            // normal notation
            else {
              isValid = $.proxy(settings.rules[type], $field)(value);
            }
            return isValid;
          }
        },

        setting: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( $.isPlainObject(name) ) {
            $.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Element'        : element,
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            $.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if($allModules.size() > 1) {
              title += ' ' + '(' + $allModules.size() + ')';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                $.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            $.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( $.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( $.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( $.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if($.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };
      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }

    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

$.fn.form.settings = {

  name              : 'Form',
  namespace         : 'form',

  debug             : true,
  verbose           : true,
  performance       : true,


  keyboardShortcuts : true,
  on                : 'submit',
  inline            : false,

  delay             : 200,
  revalidate        : true,

  transition        : 'scale',
  duration          : 150,


  onValid           : function() {},
  onInvalid         : function() {},
  onSuccess         : function() { return true; },
  onFailure         : function() { return false; },

  metadata : {
    validate: 'validate'
  },

  selector : {
    message : '.error.message',
    field   : 'input, textarea, select',
    group   : '.field',
    input   : 'input',
    prompt  : '.prompt',
    submit  : '.submit:not([type="submit"])'
  },

  className : {
    error   : 'error',
    success : 'success',
    down    : 'down',
    label   : 'ui label prompt'
  },

  // errors
  error: {
    method   : 'The method you called is not defined.'
  },


  templates: {
    error: function(errors) {
      var
        html = '<ul class="list">'
      ;
      $.each(errors, function(index, value) {
        html += '<li>' + value + '</li>';
      });
      html += '</ul>';
      return $(html);
    },
    prompt: function(errors) {
      return $('<div/>')
        .addClass('ui red pointing prompt label')
        .html(errors[0])
      ;
    }
  },

  rules: {
    checked: function() {
      return ($(this).filter(':checked').size() > 0);
    },
    empty: function(value) {
      return !(value === undefined || '' === value);
    },
    email: function(value){
      var
        emailRegExp = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?", "i")
      ;
      return emailRegExp.test(value);
    },
    length: function(value, requiredLength) {
      return (value !== undefined)
        ? (value.length >= requiredLength)
        : false
      ;
    },
    not: function(value, notValue) {
      return (value != notValue);
    },
    contains: function(value, text) {
      text = text.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
      return (value.search(text) !== -1);
    },
    is: function(value, text) {
      return (value == text);
    },
    maxLength: function(value, maxLength) {
      return (value !== undefined)
        ? (value.length <= maxLength)
        : false
      ;
    },
    match: function(value, fieldIdentifier) {
      // use either id or name of field
      var
        $form = $(this),
        matchingValue
      ;
      if($form.find('#' + fieldIdentifier).size() > 0) {
        matchingValue = $form.find('#' + fieldIdentifier).val();
      }
      else if($form.find('[name=' + fieldIdentifier +']').size() > 0) {
        matchingValue = $form.find('[name=' + fieldIdentifier + ']').val();
      }
      else if( $form.find('[data-validate="'+ fieldIdentifier +'"]').size() > 0 ) {
        matchingValue = $form.find('[data-validate="'+ fieldIdentifier +'"]').val();
      }
      return (matchingValue !== undefined)
        ? ( value.toString() == matchingValue.toString() )
        : false
      ;
    },
    url: function(value) {
      var
        urlRegExp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
      ;
      return urlRegExp.test(value);
    }
  }

};

})( jQuery, window , document );
;/* Created by jankoatwarpspeed.com */

(function($) {
    $.fn.formToWizard = function(options) {
        options = $.extend({
            submitButton: "",
            prevLbl:"Précédent",
            nextLbl:"Suivant",
        }, options);

        var element = this;

        var steps = $(element).find("fieldset");
        var count = steps.size();
        var submmitButtonName = "#" + options.submitButton;
        $(submmitButtonName).hide();

        // 2
        //$(element).before("<ul id='steps'></ul>");
        //
        //
        //
        //
        //Adaptation semantic-ui
        //
        //
        //
        //
        //
        //

        $(element).before("<div class='ui steps' id='steps'></div>");

        steps.each(function(i) {

            //$(this).addClass('ui grid');

            (i == 0) ? disabled = "" : disabled = "disabled";

            $(this).wrap("<div id='step" + i + "'></div>");

            //$(this).append("<p id='step" + i + "commands'></p>");
            $(this).append("<div id='step" + i + "commands' class='ui'></div>");

            // 2
            var name = $(this).find("legend").html();
            $(this).find("legend").hide();
            //$("#steps").append("<li id='stepDesc" + i + "'>" + (i + 1) + ". <span>" + name + "</span></li>");
            $("#steps").append("<div class='ui step " + disabled + "' id='stepDesc" + i + "'>" + (i + 1) + ". <span>" + name + "</span></div>");

            $("#stepDesc" + i).bind("click", function() {
                if (!($(this).hasClass("disabled"))) {
                    showStep(i);
                }
            });

            if (i == 0) {
                //createNextButton(i);
                selectStep(i);
            }
            else if (i == count - 1) {
                $("#step" + i).hide();
                //createPrevButton(i);
            }
            else {
                $("#step" + i).hide();
                //createPrevButton(i);
                //createNextButton(i);
            }
        });

        function createPrevButton(i) {
            var stepName = "step" + i;

            //$("#" + stepName + "commands").append("<a href='#' id='" + stepName + "Prev' class='prev'>< Précédent</a>");
            $("#" + stepName + "commands").append("<button id='" + stepName + "Prev' class='prev small blue ui labeled icon button' type='button'>< "+options.prevLbl+"</button>");

            $("#" + stepName + "Prev").bind("click", function(e) {
                $("#" + stepName).hide();
                $("#step" + (i - 1)).show();
                $(submmitButtonName).hide();
                selectStep(i - 1);
            });
        }

        function createNextButton(i) {
            var stepName = "step" + i;

            //$("#" + stepName + "commands").append("<a href='#' id='" + stepName + "Next' class='next'>Suivant ></a>");
            $("#" + stepName + "commands").append("<button id='" + stepName + "Next' class='next small blue ui labeled icon button' type='button'>"+options.nextLbl+" ></button>");


            $("#" + stepName + "Next").bind("click", function(e) {
                $("#" + stepName).hide();
                $("#step" + (i + 1)).show();
                if (i + 2 == count)
                    $(submmitButtonName).show();
                selectStep(i + 1);
            });
        }

        function selectStep(i) {
            /*$("#steps li").removeClass("current");
             $("#stepDesc" + i).addClass("current");*/
            $("#steps div").removeClass("active");
            $("#stepDesc" + i).addClass("active");

        }

        function showStep(i) {
            
            for(var j=0;j<count;j++){
                $("#step" + j).hide();
            }
            
            $("#step" + i).show();
            
            /*if (i + 2 == count)
                $(submmitButtonName).show();*/
            selectStep(i);

        }

    }
})(jQuery); ;/*! jQuery UI - v1.10.4 - 2016-11-10
* http://jqueryui.com
* Includes: jquery.ui.core.js, jquery.ui.widget.js, jquery.ui.mouse.js, jquery.ui.position.js, jquery.ui.draggable.js, jquery.ui.droppable.js, jquery.ui.resizable.js, jquery.ui.selectable.js, jquery.ui.sortable.js, jquery.ui.effect.js, jquery.ui.effect-blind.js, jquery.ui.effect-bounce.js, jquery.ui.effect-clip.js, jquery.ui.effect-drop.js, jquery.ui.effect-explode.js, jquery.ui.effect-fade.js, jquery.ui.effect-fold.js, jquery.ui.effect-highlight.js, jquery.ui.effect-pulsate.js, jquery.ui.effect-scale.js, jquery.ui.effect-shake.js, jquery.ui.effect-slide.js, jquery.ui.effect-transfer.js
* Copyright jQuery Foundation and other contributors; Licensed MIT */

(function( $, undefined ) {

var uuid = 0,
	runiqueId = /^ui-id-\d+$/;

// $.ui might exist from components with no dependencies, e.g., $.ui.position
$.ui = $.ui || {};

$.extend( $.ui, {
	version: "1.10.4",

	keyCode: {
		BACKSPACE: 8,
		COMMA: 188,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		LEFT: 37,
		NUMPAD_ADD: 107,
		NUMPAD_DECIMAL: 110,
		NUMPAD_DIVIDE: 111,
		NUMPAD_ENTER: 108,
		NUMPAD_MULTIPLY: 106,
		NUMPAD_SUBTRACT: 109,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SPACE: 32,
		TAB: 9,
		UP: 38
	}
});

// plugins
$.fn.extend({
	focus: (function( orig ) {
		return function( delay, fn ) {
			return typeof delay === "number" ?
				this.each(function() {
					var elem = this;
					setTimeout(function() {
						$( elem ).focus();
						if ( fn ) {
							fn.call( elem );
						}
					}, delay );
				}) :
				orig.apply( this, arguments );
		};
	})( $.fn.focus ),

	scrollParent: function() {
		var scrollParent;
		if (($.ui.ie && (/(static|relative)/).test(this.css("position"))) || (/absolute/).test(this.css("position"))) {
			scrollParent = this.parents().filter(function() {
				return (/(relative|absolute|fixed)/).test($.css(this,"position")) && (/(auto|scroll)/).test($.css(this,"overflow")+$.css(this,"overflow-y")+$.css(this,"overflow-x"));
			}).eq(0);
		} else {
			scrollParent = this.parents().filter(function() {
				return (/(auto|scroll)/).test($.css(this,"overflow")+$.css(this,"overflow-y")+$.css(this,"overflow-x"));
			}).eq(0);
		}

		return (/fixed/).test(this.css("position")) || !scrollParent.length ? $(document) : scrollParent;
	},

	zIndex: function( zIndex ) {
		if ( zIndex !== undefined ) {
			return this.css( "zIndex", zIndex );
		}

		if ( this.length ) {
			var elem = $( this[ 0 ] ), position, value;
			while ( elem.length && elem[ 0 ] !== document ) {
				// Ignore z-index if position is set to a value where z-index is ignored by the browser
				// This makes behavior of this function consistent across browsers
				// WebKit always returns auto if the element is positioned
				position = elem.css( "position" );
				if ( position === "absolute" || position === "relative" || position === "fixed" ) {
					// IE returns 0 when zIndex is not specified
					// other browsers return a string
					// we ignore the case of nested elements with an explicit value of 0
					// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
					value = parseInt( elem.css( "zIndex" ), 10 );
					if ( !isNaN( value ) && value !== 0 ) {
						return value;
					}
				}
				elem = elem.parent();
			}
		}

		return 0;
	},

	uniqueId: function() {
		return this.each(function() {
			if ( !this.id ) {
				this.id = "ui-id-" + (++uuid);
			}
		});
	},

	removeUniqueId: function() {
		return this.each(function() {
			if ( runiqueId.test( this.id ) ) {
				$( this ).removeAttr( "id" );
			}
		});
	}
});

// selectors
function focusable( element, isTabIndexNotNaN ) {
	var map, mapName, img,
		nodeName = element.nodeName.toLowerCase();
	if ( "area" === nodeName ) {
		map = element.parentNode;
		mapName = map.name;
		if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
			return false;
		}
		img = $( "img[usemap=#" + mapName + "]" )[0];
		return !!img && visible( img );
	}
	return ( /input|select|textarea|button|object/.test( nodeName ) ?
		!element.disabled :
		"a" === nodeName ?
			element.href || isTabIndexNotNaN :
			isTabIndexNotNaN) &&
		// the element and all of its ancestors must be visible
		visible( element );
}

function visible( element ) {
	return $.expr.filters.visible( element ) &&
		!$( element ).parents().addBack().filter(function() {
			return $.css( this, "visibility" ) === "hidden";
		}).length;
}

$.extend( $.expr[ ":" ], {
	data: $.expr.createPseudo ?
		$.expr.createPseudo(function( dataName ) {
			return function( elem ) {
				return !!$.data( elem, dataName );
			};
		}) :
		// support: jQuery <1.8
		function( elem, i, match ) {
			return !!$.data( elem, match[ 3 ] );
		},

	focusable: function( element ) {
		return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
	},

	tabbable: function( element ) {
		var tabIndex = $.attr( element, "tabindex" ),
			isTabIndexNaN = isNaN( tabIndex );
		return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
	}
});

// support: jQuery <1.8
if ( !$( "<a>" ).outerWidth( 1 ).jquery ) {
	$.each( [ "Width", "Height" ], function( i, name ) {
		var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
			type = name.toLowerCase(),
			orig = {
				innerWidth: $.fn.innerWidth,
				innerHeight: $.fn.innerHeight,
				outerWidth: $.fn.outerWidth,
				outerHeight: $.fn.outerHeight
			};

		function reduce( elem, size, border, margin ) {
			$.each( side, function() {
				size -= parseFloat( $.css( elem, "padding" + this ) ) || 0;
				if ( border ) {
					size -= parseFloat( $.css( elem, "border" + this + "Width" ) ) || 0;
				}
				if ( margin ) {
					size -= parseFloat( $.css( elem, "margin" + this ) ) || 0;
				}
			});
			return size;
		}

		$.fn[ "inner" + name ] = function( size ) {
			if ( size === undefined ) {
				return orig[ "inner" + name ].call( this );
			}

			return this.each(function() {
				$( this ).css( type, reduce( this, size ) + "px" );
			});
		};

		$.fn[ "outer" + name] = function( size, margin ) {
			if ( typeof size !== "number" ) {
				return orig[ "outer" + name ].call( this, size );
			}

			return this.each(function() {
				$( this).css( type, reduce( this, size, true, margin ) + "px" );
			});
		};
	});
}

// support: jQuery <1.8
if ( !$.fn.addBack ) {
	$.fn.addBack = function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	};
}

// support: jQuery 1.6.1, 1.6.2 (http://bugs.jquery.com/ticket/9413)
if ( $( "<a>" ).data( "a-b", "a" ).removeData( "a-b" ).data( "a-b" ) ) {
	$.fn.removeData = (function( removeData ) {
		return function( key ) {
			if ( arguments.length ) {
				return removeData.call( this, $.camelCase( key ) );
			} else {
				return removeData.call( this );
			}
		};
	})( $.fn.removeData );
}





// deprecated
$.ui.ie = !!/msie [\w.]+/.exec( navigator.userAgent.toLowerCase() );

$.support.selectstart = "onselectstart" in document.createElement( "div" );
$.fn.extend({
	disableSelection: function() {
		return this.bind( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
			".ui-disableSelection", function( event ) {
				event.preventDefault();
			});
	},

	enableSelection: function() {
		return this.unbind( ".ui-disableSelection" );
	}
});

$.extend( $.ui, {
	// $.ui.plugin is deprecated. Use $.widget() extensions instead.
	plugin: {
		add: function( module, option, set ) {
			var i,
				proto = $.ui[ module ].prototype;
			for ( i in set ) {
				proto.plugins[ i ] = proto.plugins[ i ] || [];
				proto.plugins[ i ].push( [ option, set[ i ] ] );
			}
		},
		call: function( instance, name, args ) {
			var i,
				set = instance.plugins[ name ];
			if ( !set || !instance.element[ 0 ].parentNode || instance.element[ 0 ].parentNode.nodeType === 11 ) {
				return;
			}

			for ( i = 0; i < set.length; i++ ) {
				if ( instance.options[ set[ i ][ 0 ] ] ) {
					set[ i ][ 1 ].apply( instance.element, args );
				}
			}
		}
	},

	// only used by resizable
	hasScroll: function( el, a ) {

		//If overflow is hidden, the element might have extra content, but the user wants to hide it
		if ( $( el ).css( "overflow" ) === "hidden") {
			return false;
		}

		var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop",
			has = false;

		if ( el[ scroll ] > 0 ) {
			return true;
		}

		// TODO: determine which cases actually cause this to happen
		// if the element doesn't have the scroll set, see if it's possible to
		// set the scroll
		el[ scroll ] = 1;
		has = ( el[ scroll ] > 0 );
		el[ scroll ] = 0;
		return has;
	}
});

})( jQuery );
(function( $, undefined ) {

var uuid = 0,
	slice = Array.prototype.slice,
	_cleanData = $.cleanData;
$.cleanData = function( elems ) {
	for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
		try {
			$( elem ).triggerHandler( "remove" );
		// http://bugs.jquery.com/ticket/8235
		} catch( e ) {}
	}
	_cleanData( elems );
};

$.widget = function( name, base, prototype ) {
	var fullName, existingConstructor, constructor, basePrototype,
		// proxiedPrototype allows the provided prototype to remain unmodified
		// so that it can be used as a mixin for multiple widgets (#8876)
		proxiedPrototype = {},
		namespace = name.split( "." )[ 0 ];

	name = name.split( "." )[ 1 ];
	fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	// create selector for plugin
	$.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
		return !!$.data( elem, fullName );
	};

	$[ namespace ] = $[ namespace ] || {};
	existingConstructor = $[ namespace ][ name ];
	constructor = $[ namespace ][ name ] = function( options, element ) {
		// allow instantiation without "new" keyword
		if ( !this._createWidget ) {
			return new constructor( options, element );
		}

		// allow instantiation without initializing for simple inheritance
		// must use "new" keyword (the code above always passes args)
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};
	// extend with the existing constructor to carry over any static properties
	$.extend( constructor, existingConstructor, {
		version: prototype.version,
		// copy the object used to create the prototype in case we need to
		// redefine the widget later
		_proto: $.extend( {}, prototype ),
		// track widgets that inherit from this widget in case this widget is
		// redefined after a widget inherits from it
		_childConstructors: []
	});

	basePrototype = new base();
	// we need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
	basePrototype.options = $.widget.extend( {}, basePrototype.options );
	$.each( prototype, function( prop, value ) {
		if ( !$.isFunction( value ) ) {
			proxiedPrototype[ prop ] = value;
			return;
		}
		proxiedPrototype[ prop ] = (function() {
			var _super = function() {
					return base.prototype[ prop ].apply( this, arguments );
				},
				_superApply = function( args ) {
					return base.prototype[ prop ].apply( this, args );
				};
			return function() {
				var __super = this._super,
					__superApply = this._superApply,
					returnValue;

				this._super = _super;
				this._superApply = _superApply;

				returnValue = value.apply( this, arguments );

				this._super = __super;
				this._superApply = __superApply;

				return returnValue;
			};
		})();
	});
	constructor.prototype = $.widget.extend( basePrototype, {
		// TODO: remove support for widgetEventPrefix
		// always use the name + a colon as the prefix, e.g., draggable:start
		// don't prefix for widgets that aren't DOM-based
		widgetEventPrefix: existingConstructor ? (basePrototype.widgetEventPrefix || name) : name
	}, proxiedPrototype, {
		constructor: constructor,
		namespace: namespace,
		widgetName: name,
		widgetFullName: fullName
	});

	// If this widget is being redefined then we need to find all widgets that
	// are inheriting from it and redefine all of them so that they inherit from
	// the new version of this widget. We're essentially trying to replace one
	// level in the prototype chain.
	if ( existingConstructor ) {
		$.each( existingConstructor._childConstructors, function( i, child ) {
			var childPrototype = child.prototype;

			// redefine the child widget using the same prototype that was
			// originally used, but inherit from the new version of the base
			$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto );
		});
		// remove the list of existing child constructors from the old constructor
		// so the old child constructors can be garbage collected
		delete existingConstructor._childConstructors;
	} else {
		base._childConstructors.push( constructor );
	}

	$.widget.bridge( name, constructor );
};

$.widget.extend = function( target ) {
	var input = slice.call( arguments, 1 ),
		inputIndex = 0,
		inputLength = input.length,
		key,
		value;
	for ( ; inputIndex < inputLength; inputIndex++ ) {
		for ( key in input[ inputIndex ] ) {
			value = input[ inputIndex ][ key ];
			if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {
				// Clone objects
				if ( $.isPlainObject( value ) ) {
					target[ key ] = $.isPlainObject( target[ key ] ) ?
						$.widget.extend( {}, target[ key ], value ) :
						// Don't extend strings, arrays, etc. with objects
						$.widget.extend( {}, value );
				// Copy everything else by reference
				} else {
					target[ key ] = value;
				}
			}
		}
	}
	return target;
};

$.widget.bridge = function( name, object ) {
	var fullName = object.prototype.widgetFullName || name;
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string",
			args = slice.call( arguments, 1 ),
			returnValue = this;

		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
			$.widget.extend.apply( null, [ options ].concat(args) ) :
			options;

		if ( isMethodCall ) {
			this.each(function() {
				var methodValue,
					instance = $.data( this, fullName );
				if ( !instance ) {
					return $.error( "cannot call methods on " + name + " prior to initialization; " +
						"attempted to call method '" + options + "'" );
				}
				if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
					return $.error( "no such method '" + options + "' for " + name + " widget instance" );
				}
				methodValue = instance[ options ].apply( instance, args );
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue && methodValue.jquery ?
						returnValue.pushStack( methodValue.get() ) :
						methodValue;
					return false;
				}
			});
		} else {
			this.each(function() {
				var instance = $.data( this, fullName );
				if ( instance ) {
					instance.option( options || {} )._init();
				} else {
					$.data( this, fullName, new object( options, this ) );
				}
			});
		}

		return returnValue;
	};
};

$.Widget = function( /* options, element */ ) {};
$.Widget._childConstructors = [];

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	defaultElement: "<div>",
	options: {
		disabled: false,

		// callbacks
		create: null
	},
	_createWidget: function( options, element ) {
		element = $( element || this.defaultElement || this )[ 0 ];
		this.element = $( element );
		this.uuid = uuid++;
		this.eventNamespace = "." + this.widgetName + this.uuid;
		this.options = $.widget.extend( {},
			this.options,
			this._getCreateOptions(),
			options );

		this.bindings = $();
		this.hoverable = $();
		this.focusable = $();

		if ( element !== this ) {
			$.data( element, this.widgetFullName, this );
			this._on( true, this.element, {
				remove: function( event ) {
					if ( event.target === element ) {
						this.destroy();
					}
				}
			});
			this.document = $( element.style ?
				// element within the document
				element.ownerDocument :
				// element is window or document
				element.document || element );
			this.window = $( this.document[0].defaultView || this.document[0].parentWindow );
		}

		this._create();
		this._trigger( "create", null, this._getCreateEventData() );
		this._init();
	},
	_getCreateOptions: $.noop,
	_getCreateEventData: $.noop,
	_create: $.noop,
	_init: $.noop,

	destroy: function() {
		this._destroy();
		// we can probably remove the unbind calls in 2.0
		// all event bindings should go through this._on()
		this.element
			.unbind( this.eventNamespace )
			// 1.9 BC for #7810
			// TODO remove dual storage
			.removeData( this.widgetName )
			.removeData( this.widgetFullName )
			// support: jquery <1.6.3
			// http://bugs.jquery.com/ticket/9413
			.removeData( $.camelCase( this.widgetFullName ) );
		this.widget()
			.unbind( this.eventNamespace )
			.removeAttr( "aria-disabled" )
			.removeClass(
				this.widgetFullName + "-disabled " +
				"ui-state-disabled" );

		// clean up events and states
		this.bindings.unbind( this.eventNamespace );
		this.hoverable.removeClass( "ui-state-hover" );
		this.focusable.removeClass( "ui-state-focus" );
	},
	_destroy: $.noop,

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key,
			parts,
			curOption,
			i;

		if ( arguments.length === 0 ) {
			// don't return a reference to the internal hash
			return $.widget.extend( {}, this.options );
		}

		if ( typeof key === "string" ) {
			// handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
			options = {};
			parts = key.split( "." );
			key = parts.shift();
			if ( parts.length ) {
				curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
				for ( i = 0; i < parts.length - 1; i++ ) {
					curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
					curOption = curOption[ parts[ i ] ];
				}
				key = parts.pop();
				if ( arguments.length === 1 ) {
					return curOption[ key ] === undefined ? null : curOption[ key ];
				}
				curOption[ key ] = value;
			} else {
				if ( arguments.length === 1 ) {
					return this.options[ key ] === undefined ? null : this.options[ key ];
				}
				options[ key ] = value;
			}
		}

		this._setOptions( options );

		return this;
	},
	_setOptions: function( options ) {
		var key;

		for ( key in options ) {
			this._setOption( key, options[ key ] );
		}

		return this;
	},
	_setOption: function( key, value ) {
		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this.widget()
				.toggleClass( this.widgetFullName + "-disabled ui-state-disabled", !!value )
				.attr( "aria-disabled", value );
			this.hoverable.removeClass( "ui-state-hover" );
			this.focusable.removeClass( "ui-state-focus" );
		}

		return this;
	},

	enable: function() {
		return this._setOption( "disabled", false );
	},
	disable: function() {
		return this._setOption( "disabled", true );
	},

	_on: function( suppressDisabledCheck, element, handlers ) {
		var delegateElement,
			instance = this;

		// no suppressDisabledCheck flag, shuffle arguments
		if ( typeof suppressDisabledCheck !== "boolean" ) {
			handlers = element;
			element = suppressDisabledCheck;
			suppressDisabledCheck = false;
		}

		// no element argument, shuffle and use this.element
		if ( !handlers ) {
			handlers = element;
			element = this.element;
			delegateElement = this.widget();
		} else {
			// accept selectors, DOM elements
			element = delegateElement = $( element );
			this.bindings = this.bindings.add( element );
		}

		$.each( handlers, function( event, handler ) {
			function handlerProxy() {
				// allow widgets to customize the disabled handling
				// - disabled as an array instead of boolean
				// - disabled class as method for disabling individual parts
				if ( !suppressDisabledCheck &&
						( instance.options.disabled === true ||
							$( this ).hasClass( "ui-state-disabled" ) ) ) {
					return;
				}
				return ( typeof handler === "string" ? instance[ handler ] : handler )
					.apply( instance, arguments );
			}

			// copy the guid so direct unbinding works
			if ( typeof handler !== "string" ) {
				handlerProxy.guid = handler.guid =
					handler.guid || handlerProxy.guid || $.guid++;
			}

			var match = event.match( /^(\w+)\s*(.*)$/ ),
				eventName = match[1] + instance.eventNamespace,
				selector = match[2];
			if ( selector ) {
				delegateElement.delegate( selector, eventName, handlerProxy );
			} else {
				element.bind( eventName, handlerProxy );
			}
		});
	},

	_off: function( element, eventName ) {
		eventName = (eventName || "").split( " " ).join( this.eventNamespace + " " ) + this.eventNamespace;
		element.unbind( eventName ).undelegate( eventName );
	},

	_delay: function( handler, delay ) {
		function handlerProxy() {
			return ( typeof handler === "string" ? instance[ handler ] : handler )
				.apply( instance, arguments );
		}
		var instance = this;
		return setTimeout( handlerProxy, delay || 0 );
	},

	_hoverable: function( element ) {
		this.hoverable = this.hoverable.add( element );
		this._on( element, {
			mouseenter: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-hover" );
			},
			mouseleave: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-hover" );
			}
		});
	},

	_focusable: function( element ) {
		this.focusable = this.focusable.add( element );
		this._on( element, {
			focusin: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-focus" );
			},
			focusout: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-focus" );
			}
		});
	},

	_trigger: function( type, event, data ) {
		var prop, orig,
			callback = this.options[ type ];

		data = data || {};
		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();
		// the original event may come from any element
		// so we need to reset the target on the new event
		event.target = this.element[ 0 ];

		// copy original event properties over to the new event
		orig = event.originalEvent;
		if ( orig ) {
			for ( prop in orig ) {
				if ( !( prop in event ) ) {
					event[ prop ] = orig[ prop ];
				}
			}
		}

		this.element.trigger( event, data );
		return !( $.isFunction( callback ) &&
			callback.apply( this.element[0], [ event ].concat( data ) ) === false ||
			event.isDefaultPrevented() );
	}
};

$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
	$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
		if ( typeof options === "string" ) {
			options = { effect: options };
		}
		var hasOptions,
			effectName = !options ?
				method :
				options === true || typeof options === "number" ?
					defaultEffect :
					options.effect || defaultEffect;
		options = options || {};
		if ( typeof options === "number" ) {
			options = { duration: options };
		}
		hasOptions = !$.isEmptyObject( options );
		options.complete = callback;
		if ( options.delay ) {
			element.delay( options.delay );
		}
		if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
			element[ method ]( options );
		} else if ( effectName !== method && element[ effectName ] ) {
			element[ effectName ]( options.duration, options.easing, callback );
		} else {
			element.queue(function( next ) {
				$( this )[ method ]();
				if ( callback ) {
					callback.call( element[ 0 ] );
				}
				next();
			});
		}
	};
});

})( jQuery );
(function( $, undefined ) {

var mouseHandled = false;
$( document ).mouseup( function() {
	mouseHandled = false;
});

$.widget("ui.mouse", {
	version: "1.10.4",
	options: {
		cancel: "input,textarea,button,select,option",
		distance: 1,
		delay: 0
	},
	_mouseInit: function() {
		var that = this;

		this.element
			.bind("mousedown."+this.widgetName, function(event) {
				return that._mouseDown(event);
			})
			.bind("click."+this.widgetName, function(event) {
				if (true === $.data(event.target, that.widgetName + ".preventClickEvent")) {
					$.removeData(event.target, that.widgetName + ".preventClickEvent");
					event.stopImmediatePropagation();
					return false;
				}
			});

		this.started = false;
	},

	// TODO: make sure destroying one instance of mouse doesn't mess with
	// other instances of mouse
	_mouseDestroy: function() {
		this.element.unbind("."+this.widgetName);
		if ( this._mouseMoveDelegate ) {
			$(document)
				.unbind("mousemove."+this.widgetName, this._mouseMoveDelegate)
				.unbind("mouseup."+this.widgetName, this._mouseUpDelegate);
		}
	},

	_mouseDown: function(event) {
		// don't let more than one widget handle mouseStart
		if( mouseHandled ) { return; }

		// we may have missed mouseup (out of window)
		(this._mouseStarted && this._mouseUp(event));

		this._mouseDownEvent = event;

		var that = this,
			btnIsLeft = (event.which === 1),
			// event.target.nodeName works around a bug in IE 8 with
			// disabled inputs (#7620)
			elIsCancel = (typeof this.options.cancel === "string" && event.target.nodeName ? $(event.target).closest(this.options.cancel).length : false);
		if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
			return true;
		}

		this.mouseDelayMet = !this.options.delay;
		if (!this.mouseDelayMet) {
			this._mouseDelayTimer = setTimeout(function() {
				that.mouseDelayMet = true;
			}, this.options.delay);
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted = (this._mouseStart(event) !== false);
			if (!this._mouseStarted) {
				event.preventDefault();
				return true;
			}
		}

		// Click event may never have fired (Gecko & Opera)
		if (true === $.data(event.target, this.widgetName + ".preventClickEvent")) {
			$.removeData(event.target, this.widgetName + ".preventClickEvent");
		}

		// these delegates are required to keep context
		this._mouseMoveDelegate = function(event) {
			return that._mouseMove(event);
		};
		this._mouseUpDelegate = function(event) {
			return that._mouseUp(event);
		};
		$(document)
			.bind("mousemove."+this.widgetName, this._mouseMoveDelegate)
			.bind("mouseup."+this.widgetName, this._mouseUpDelegate);

		event.preventDefault();

		mouseHandled = true;
		return true;
	},

	_mouseMove: function(event) {
		// IE mouseup check - mouseup happened when mouse was out of window
		if ($.ui.ie && ( !document.documentMode || document.documentMode < 9 ) && !event.button) {
			return this._mouseUp(event);
		}

		if (this._mouseStarted) {
			this._mouseDrag(event);
			return event.preventDefault();
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted =
				(this._mouseStart(this._mouseDownEvent, event) !== false);
			(this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
		}

		return !this._mouseStarted;
	},

	_mouseUp: function(event) {
		$(document)
			.unbind("mousemove."+this.widgetName, this._mouseMoveDelegate)
			.unbind("mouseup."+this.widgetName, this._mouseUpDelegate);

		if (this._mouseStarted) {
			this._mouseStarted = false;

			if (event.target === this._mouseDownEvent.target) {
				$.data(event.target, this.widgetName + ".preventClickEvent", true);
			}

			this._mouseStop(event);
		}

		return false;
	},

	_mouseDistanceMet: function(event) {
		return (Math.max(
				Math.abs(this._mouseDownEvent.pageX - event.pageX),
				Math.abs(this._mouseDownEvent.pageY - event.pageY)
			) >= this.options.distance
		);
	},

	_mouseDelayMet: function(/* event */) {
		return this.mouseDelayMet;
	},

	// These are placeholder methods, to be overriden by extending plugin
	_mouseStart: function(/* event */) {},
	_mouseDrag: function(/* event */) {},
	_mouseStop: function(/* event */) {},
	_mouseCapture: function(/* event */) { return true; }
});

})(jQuery);
(function( $, undefined ) {

$.ui = $.ui || {};

var cachedScrollbarWidth,
	max = Math.max,
	abs = Math.abs,
	round = Math.round,
	rhorizontal = /left|center|right/,
	rvertical = /top|center|bottom/,
	roffset = /[\+\-]\d+(\.[\d]+)?%?/,
	rposition = /^\w+/,
	rpercent = /%$/,
	_position = $.fn.position;

function getOffsets( offsets, width, height ) {
	return [
		parseFloat( offsets[ 0 ] ) * ( rpercent.test( offsets[ 0 ] ) ? width / 100 : 1 ),
		parseFloat( offsets[ 1 ] ) * ( rpercent.test( offsets[ 1 ] ) ? height / 100 : 1 )
	];
}

function parseCss( element, property ) {
	return parseInt( $.css( element, property ), 10 ) || 0;
}

function getDimensions( elem ) {
	var raw = elem[0];
	if ( raw.nodeType === 9 ) {
		return {
			width: elem.width(),
			height: elem.height(),
			offset: { top: 0, left: 0 }
		};
	}
	if ( $.isWindow( raw ) ) {
		return {
			width: elem.width(),
			height: elem.height(),
			offset: { top: elem.scrollTop(), left: elem.scrollLeft() }
		};
	}
	if ( raw.preventDefault ) {
		return {
			width: 0,
			height: 0,
			offset: { top: raw.pageY, left: raw.pageX }
		};
	}
	return {
		width: elem.outerWidth(),
		height: elem.outerHeight(),
		offset: elem.offset()
	};
}

$.position = {
	scrollbarWidth: function() {
		if ( cachedScrollbarWidth !== undefined ) {
			return cachedScrollbarWidth;
		}
		var w1, w2,
			div = $( "<div style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>" ),
			innerDiv = div.children()[0];

		$( "body" ).append( div );
		w1 = innerDiv.offsetWidth;
		div.css( "overflow", "scroll" );

		w2 = innerDiv.offsetWidth;

		if ( w1 === w2 ) {
			w2 = div[0].clientWidth;
		}

		div.remove();

		return (cachedScrollbarWidth = w1 - w2);
	},
	getScrollInfo: function( within ) {
		var overflowX = within.isWindow || within.isDocument ? "" :
				within.element.css( "overflow-x" ),
			overflowY = within.isWindow || within.isDocument ? "" :
				within.element.css( "overflow-y" ),
			hasOverflowX = overflowX === "scroll" ||
				( overflowX === "auto" && within.width < within.element[0].scrollWidth ),
			hasOverflowY = overflowY === "scroll" ||
				( overflowY === "auto" && within.height < within.element[0].scrollHeight );
		return {
			width: hasOverflowY ? $.position.scrollbarWidth() : 0,
			height: hasOverflowX ? $.position.scrollbarWidth() : 0
		};
	},
	getWithinInfo: function( element ) {
		var withinElement = $( element || window ),
			isWindow = $.isWindow( withinElement[0] ),
			isDocument = !!withinElement[ 0 ] && withinElement[ 0 ].nodeType === 9;
		return {
			element: withinElement,
			isWindow: isWindow,
			isDocument: isDocument,
			offset: withinElement.offset() || { left: 0, top: 0 },
			scrollLeft: withinElement.scrollLeft(),
			scrollTop: withinElement.scrollTop(),
			width: isWindow ? withinElement.width() : withinElement.outerWidth(),
			height: isWindow ? withinElement.height() : withinElement.outerHeight()
		};
	}
};

$.fn.position = function( options ) {
	if ( !options || !options.of ) {
		return _position.apply( this, arguments );
	}

	// make a copy, we don't want to modify arguments
	options = $.extend( {}, options );

	var atOffset, targetWidth, targetHeight, targetOffset, basePosition, dimensions,
		target = $( options.of ),
		within = $.position.getWithinInfo( options.within ),
		scrollInfo = $.position.getScrollInfo( within ),
		collision = ( options.collision || "flip" ).split( " " ),
		offsets = {};

	dimensions = getDimensions( target );
	if ( target[0].preventDefault ) {
		// force left top to allow flipping
		options.at = "left top";
	}
	targetWidth = dimensions.width;
	targetHeight = dimensions.height;
	targetOffset = dimensions.offset;
	// clone to reuse original targetOffset later
	basePosition = $.extend( {}, targetOffset );

	// force my and at to have valid horizontal and vertical positions
	// if a value is missing or invalid, it will be converted to center
	$.each( [ "my", "at" ], function() {
		var pos = ( options[ this ] || "" ).split( " " ),
			horizontalOffset,
			verticalOffset;

		if ( pos.length === 1) {
			pos = rhorizontal.test( pos[ 0 ] ) ?
				pos.concat( [ "center" ] ) :
				rvertical.test( pos[ 0 ] ) ?
					[ "center" ].concat( pos ) :
					[ "center", "center" ];
		}
		pos[ 0 ] = rhorizontal.test( pos[ 0 ] ) ? pos[ 0 ] : "center";
		pos[ 1 ] = rvertical.test( pos[ 1 ] ) ? pos[ 1 ] : "center";

		// calculate offsets
		horizontalOffset = roffset.exec( pos[ 0 ] );
		verticalOffset = roffset.exec( pos[ 1 ] );
		offsets[ this ] = [
			horizontalOffset ? horizontalOffset[ 0 ] : 0,
			verticalOffset ? verticalOffset[ 0 ] : 0
		];

		// reduce to just the positions without the offsets
		options[ this ] = [
			rposition.exec( pos[ 0 ] )[ 0 ],
			rposition.exec( pos[ 1 ] )[ 0 ]
		];
	});

	// normalize collision option
	if ( collision.length === 1 ) {
		collision[ 1 ] = collision[ 0 ];
	}

	if ( options.at[ 0 ] === "right" ) {
		basePosition.left += targetWidth;
	} else if ( options.at[ 0 ] === "center" ) {
		basePosition.left += targetWidth / 2;
	}

	if ( options.at[ 1 ] === "bottom" ) {
		basePosition.top += targetHeight;
	} else if ( options.at[ 1 ] === "center" ) {
		basePosition.top += targetHeight / 2;
	}

	atOffset = getOffsets( offsets.at, targetWidth, targetHeight );
	basePosition.left += atOffset[ 0 ];
	basePosition.top += atOffset[ 1 ];

	return this.each(function() {
		var collisionPosition, using,
			elem = $( this ),
			elemWidth = elem.outerWidth(),
			elemHeight = elem.outerHeight(),
			marginLeft = parseCss( this, "marginLeft" ),
			marginTop = parseCss( this, "marginTop" ),
			collisionWidth = elemWidth + marginLeft + parseCss( this, "marginRight" ) + scrollInfo.width,
			collisionHeight = elemHeight + marginTop + parseCss( this, "marginBottom" ) + scrollInfo.height,
			position = $.extend( {}, basePosition ),
			myOffset = getOffsets( offsets.my, elem.outerWidth(), elem.outerHeight() );

		if ( options.my[ 0 ] === "right" ) {
			position.left -= elemWidth;
		} else if ( options.my[ 0 ] === "center" ) {
			position.left -= elemWidth / 2;
		}

		if ( options.my[ 1 ] === "bottom" ) {
			position.top -= elemHeight;
		} else if ( options.my[ 1 ] === "center" ) {
			position.top -= elemHeight / 2;
		}

		position.left += myOffset[ 0 ];
		position.top += myOffset[ 1 ];

		// if the browser doesn't support fractions, then round for consistent results
		if ( !$.support.offsetFractions ) {
			position.left = round( position.left );
			position.top = round( position.top );
		}

		collisionPosition = {
			marginLeft: marginLeft,
			marginTop: marginTop
		};

		$.each( [ "left", "top" ], function( i, dir ) {
			if ( $.ui.position[ collision[ i ] ] ) {
				$.ui.position[ collision[ i ] ][ dir ]( position, {
					targetWidth: targetWidth,
					targetHeight: targetHeight,
					elemWidth: elemWidth,
					elemHeight: elemHeight,
					collisionPosition: collisionPosition,
					collisionWidth: collisionWidth,
					collisionHeight: collisionHeight,
					offset: [ atOffset[ 0 ] + myOffset[ 0 ], atOffset [ 1 ] + myOffset[ 1 ] ],
					my: options.my,
					at: options.at,
					within: within,
					elem : elem
				});
			}
		});

		if ( options.using ) {
			// adds feedback as second argument to using callback, if present
			using = function( props ) {
				var left = targetOffset.left - position.left,
					right = left + targetWidth - elemWidth,
					top = targetOffset.top - position.top,
					bottom = top + targetHeight - elemHeight,
					feedback = {
						target: {
							element: target,
							left: targetOffset.left,
							top: targetOffset.top,
							width: targetWidth,
							height: targetHeight
						},
						element: {
							element: elem,
							left: position.left,
							top: position.top,
							width: elemWidth,
							height: elemHeight
						},
						horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
						vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
					};
				if ( targetWidth < elemWidth && abs( left + right ) < targetWidth ) {
					feedback.horizontal = "center";
				}
				if ( targetHeight < elemHeight && abs( top + bottom ) < targetHeight ) {
					feedback.vertical = "middle";
				}
				if ( max( abs( left ), abs( right ) ) > max( abs( top ), abs( bottom ) ) ) {
					feedback.important = "horizontal";
				} else {
					feedback.important = "vertical";
				}
				options.using.call( this, props, feedback );
			};
		}

		elem.offset( $.extend( position, { using: using } ) );
	});
};

$.ui.position = {
	fit: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
				outerWidth = within.width,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = withinOffset - collisionPosLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
				newOverRight;

			// element is wider than within
			if ( data.collisionWidth > outerWidth ) {
				// element is initially over the left side of within
				if ( overLeft > 0 && overRight <= 0 ) {
					newOverRight = position.left + overLeft + data.collisionWidth - outerWidth - withinOffset;
					position.left += overLeft - newOverRight;
				// element is initially over right side of within
				} else if ( overRight > 0 && overLeft <= 0 ) {
					position.left = withinOffset;
				// element is initially over both left and right sides of within
				} else {
					if ( overLeft > overRight ) {
						position.left = withinOffset + outerWidth - data.collisionWidth;
					} else {
						position.left = withinOffset;
					}
				}
			// too far left -> align with left edge
			} else if ( overLeft > 0 ) {
				position.left += overLeft;
			// too far right -> align with right edge
			} else if ( overRight > 0 ) {
				position.left -= overRight;
			// adjust based on position and margin
			} else {
				position.left = max( position.left - collisionPosLeft, position.left );
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
				outerHeight = data.within.height,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = withinOffset - collisionPosTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
				newOverBottom;

			// element is taller than within
			if ( data.collisionHeight > outerHeight ) {
				// element is initially over the top of within
				if ( overTop > 0 && overBottom <= 0 ) {
					newOverBottom = position.top + overTop + data.collisionHeight - outerHeight - withinOffset;
					position.top += overTop - newOverBottom;
				// element is initially over bottom of within
				} else if ( overBottom > 0 && overTop <= 0 ) {
					position.top = withinOffset;
				// element is initially over both top and bottom of within
				} else {
					if ( overTop > overBottom ) {
						position.top = withinOffset + outerHeight - data.collisionHeight;
					} else {
						position.top = withinOffset;
					}
				}
			// too far up -> align with top
			} else if ( overTop > 0 ) {
				position.top += overTop;
			// too far down -> align with bottom edge
			} else if ( overBottom > 0 ) {
				position.top -= overBottom;
			// adjust based on position and margin
			} else {
				position.top = max( position.top - collisionPosTop, position.top );
			}
		}
	},
	flip: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.left + within.scrollLeft,
				outerWidth = within.width,
				offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = collisionPosLeft - offsetLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
				myOffset = data.my[ 0 ] === "left" ?
					-data.elemWidth :
					data.my[ 0 ] === "right" ?
						data.elemWidth :
						0,
				atOffset = data.at[ 0 ] === "left" ?
					data.targetWidth :
					data.at[ 0 ] === "right" ?
						-data.targetWidth :
						0,
				offset = -2 * data.offset[ 0 ],
				newOverRight,
				newOverLeft;

			if ( overLeft < 0 ) {
				newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth - outerWidth - withinOffset;
				if ( newOverRight < 0 || newOverRight < abs( overLeft ) ) {
					position.left += myOffset + atOffset + offset;
				}
			}
			else if ( overRight > 0 ) {
				newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset + atOffset + offset - offsetLeft;
				if ( newOverLeft > 0 || abs( newOverLeft ) < overRight ) {
					position.left += myOffset + atOffset + offset;
				}
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.top + within.scrollTop,
				outerHeight = within.height,
				offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = collisionPosTop - offsetTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
				top = data.my[ 1 ] === "top",
				myOffset = top ?
					-data.elemHeight :
					data.my[ 1 ] === "bottom" ?
						data.elemHeight :
						0,
				atOffset = data.at[ 1 ] === "top" ?
					data.targetHeight :
					data.at[ 1 ] === "bottom" ?
						-data.targetHeight :
						0,
				offset = -2 * data.offset[ 1 ],
				newOverTop,
				newOverBottom;
			if ( overTop < 0 ) {
				newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;
				if ( ( position.top + myOffset + atOffset + offset) > overTop && ( newOverBottom < 0 || newOverBottom < abs( overTop ) ) ) {
					position.top += myOffset + atOffset + offset;
				}
			}
			else if ( overBottom > 0 ) {
				newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;
				if ( ( position.top + myOffset + atOffset + offset) > overBottom && ( newOverTop > 0 || abs( newOverTop ) < overBottom ) ) {
					position.top += myOffset + atOffset + offset;
				}
			}
		}
	},
	flipfit: {
		left: function() {
			$.ui.position.flip.left.apply( this, arguments );
			$.ui.position.fit.left.apply( this, arguments );
		},
		top: function() {
			$.ui.position.flip.top.apply( this, arguments );
			$.ui.position.fit.top.apply( this, arguments );
		}
	}
};

// fraction support test
(function () {
	var testElement, testElementParent, testElementStyle, offsetLeft, i,
		body = document.getElementsByTagName( "body" )[ 0 ],
		div = document.createElement( "div" );

	//Create a "fake body" for testing based on method used in jQuery.support
	testElement = document.createElement( body ? "div" : "body" );
	testElementStyle = {
		visibility: "hidden",
		width: 0,
		height: 0,
		border: 0,
		margin: 0,
		background: "none"
	};
	if ( body ) {
		$.extend( testElementStyle, {
			position: "absolute",
			left: "-1000px",
			top: "-1000px"
		});
	}
	for ( i in testElementStyle ) {
		testElement.style[ i ] = testElementStyle[ i ];
	}
	testElement.appendChild( div );
	testElementParent = body || document.documentElement;
	testElementParent.insertBefore( testElement, testElementParent.firstChild );

	div.style.cssText = "position: absolute; left: 10.7432222px;";

	offsetLeft = $( div ).offset().left;
	$.support.offsetFractions = offsetLeft > 10 && offsetLeft < 11;

	testElement.innerHTML = "";
	testElementParent.removeChild( testElement );
})();

}( jQuery ) );
(function( $, undefined ) {

$.widget("ui.draggable", $.ui.mouse, {
	version: "1.10.4",
	widgetEventPrefix: "drag",
	options: {
		addClasses: true,
		appendTo: "parent",
		axis: false,
		connectToSortable: false,
		containment: false,
		cursor: "auto",
		cursorAt: false,
		grid: false,
		handle: false,
		helper: "original",
		iframeFix: false,
		opacity: false,
		refreshPositions: false,
		revert: false,
		revertDuration: 500,
		scope: "default",
		scroll: true,
		scrollSensitivity: 20,
		scrollSpeed: 20,
		snap: false,
		snapMode: "both",
		snapTolerance: 20,
		stack: false,
		zIndex: false,

		// callbacks
		drag: null,
		start: null,
		stop: null
	},
	_create: function() {

		if (this.options.helper === "original" && !(/^(?:r|a|f)/).test(this.element.css("position"))) {
			this.element[0].style.position = "relative";
		}
		if (this.options.addClasses){
			this.element.addClass("ui-draggable");
		}
		if (this.options.disabled){
			this.element.addClass("ui-draggable-disabled");
		}

		this._mouseInit();

	},

	_destroy: function() {
		this.element.removeClass( "ui-draggable ui-draggable-dragging ui-draggable-disabled" );
		this._mouseDestroy();
	},

	_mouseCapture: function(event) {

		var o = this.options;

		// among others, prevent a drag on a resizable-handle
		if (this.helper || o.disabled || $(event.target).closest(".ui-resizable-handle").length > 0) {
			return false;
		}

		//Quit if we're not on a valid handle
		this.handle = this._getHandle(event);
		if (!this.handle) {
			return false;
		}

		$(o.iframeFix === true ? "iframe" : o.iframeFix).each(function() {
			$("<div class='ui-draggable-iframeFix' style='background: #fff;'></div>")
			.css({
				width: this.offsetWidth+"px", height: this.offsetHeight+"px",
				position: "absolute", opacity: "0.001", zIndex: 1000
			})
			.css($(this).offset())
			.appendTo("body");
		});

		return true;

	},

	_mouseStart: function(event) {

		var o = this.options;

		//Create and append the visible helper
		this.helper = this._createHelper(event);

		this.helper.addClass("ui-draggable-dragging");

		//Cache the helper size
		this._cacheHelperProportions();

		//If ddmanager is used for droppables, set the global draggable
		if($.ui.ddmanager) {
			$.ui.ddmanager.current = this;
		}

		/*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 */

		//Cache the margins of the original element
		this._cacheMargins();

		//Store the helper's css position
		this.cssPosition = this.helper.css( "position" );
		this.scrollParent = this.helper.scrollParent();
		this.offsetParent = this.helper.offsetParent();
		this.offsetParentCssPosition = this.offsetParent.css( "position" );

		//The element's absolute position on the page minus margins
		this.offset = this.positionAbs = this.element.offset();
		this.offset = {
			top: this.offset.top - this.margins.top,
			left: this.offset.left - this.margins.left
		};

		//Reset scroll cache
		this.offset.scroll = false;

		$.extend(this.offset, {
			click: { //Where the click happened, relative to the element
				left: event.pageX - this.offset.left,
				top: event.pageY - this.offset.top
			},
			parent: this._getParentOffset(),
			relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
		});

		//Generate the original position
		this.originalPosition = this.position = this._generatePosition(event);
		this.originalPageX = event.pageX;
		this.originalPageY = event.pageY;

		//Adjust the mouse offset relative to the helper if "cursorAt" is supplied
		(o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

		//Set a containment if given in the options
		this._setContainment();

		//Trigger event + callbacks
		if(this._trigger("start", event) === false) {
			this._clear();
			return false;
		}

		//Recache the helper size
		this._cacheHelperProportions();

		//Prepare the droppable offsets
		if ($.ui.ddmanager && !o.dropBehaviour) {
			$.ui.ddmanager.prepareOffsets(this, event);
		}


		this._mouseDrag(event, true); //Execute the drag once - this causes the helper not to be visible before getting its correct position

		//If the ddmanager is used for droppables, inform the manager that dragging has started (see #5003)
		if ( $.ui.ddmanager ) {
			$.ui.ddmanager.dragStart(this, event);
		}

		return true;
	},

	_mouseDrag: function(event, noPropagation) {
		// reset any necessary cached properties (see #5009)
		if ( this.offsetParentCssPosition === "fixed" ) {
			this.offset.parent = this._getParentOffset();
		}

		//Compute the helpers position
		this.position = this._generatePosition(event);
		this.positionAbs = this._convertPositionTo("absolute");

		//Call plugins and callbacks and use the resulting position if something is returned
		if (!noPropagation) {
			var ui = this._uiHash();
			if(this._trigger("drag", event, ui) === false) {
				this._mouseUp({});
				return false;
			}
			this.position = ui.position;
		}

		if(!this.options.axis || this.options.axis !== "y") {
			this.helper[0].style.left = this.position.left+"px";
		}
		if(!this.options.axis || this.options.axis !== "x") {
			this.helper[0].style.top = this.position.top+"px";
		}
		if($.ui.ddmanager) {
			$.ui.ddmanager.drag(this, event);
		}

		return false;
	},

	_mouseStop: function(event) {

		//If we are using droppables, inform the manager about the drop
		var that = this,
			dropped = false;
		if ($.ui.ddmanager && !this.options.dropBehaviour) {
			dropped = $.ui.ddmanager.drop(this, event);
		}

		//if a drop comes from outside (a sortable)
		if(this.dropped) {
			dropped = this.dropped;
			this.dropped = false;
		}

		//if the original element is no longer in the DOM don't bother to continue (see #8269)
		if ( this.options.helper === "original" && !$.contains( this.element[ 0 ].ownerDocument, this.element[ 0 ] ) ) {
			return false;
		}

		if((this.options.revert === "invalid" && !dropped) || (this.options.revert === "valid" && dropped) || this.options.revert === true || ($.isFunction(this.options.revert) && this.options.revert.call(this.element, dropped))) {
			$(this.helper).animate(this.originalPosition, parseInt(this.options.revertDuration, 10), function() {
				if(that._trigger("stop", event) !== false) {
					that._clear();
				}
			});
		} else {
			if(this._trigger("stop", event) !== false) {
				this._clear();
			}
		}

		return false;
	},

	_mouseUp: function(event) {
		//Remove frame helpers
		$("div.ui-draggable-iframeFix").each(function() {
			this.parentNode.removeChild(this);
		});

		//If the ddmanager is used for droppables, inform the manager that dragging has stopped (see #5003)
		if( $.ui.ddmanager ) {
			$.ui.ddmanager.dragStop(this, event);
		}

		return $.ui.mouse.prototype._mouseUp.call(this, event);
	},

	cancel: function() {

		if(this.helper.is(".ui-draggable-dragging")) {
			this._mouseUp({});
		} else {
			this._clear();
		}

		return this;

	},

	_getHandle: function(event) {
		return this.options.handle ?
			!!$( event.target ).closest( this.element.find( this.options.handle ) ).length :
			true;
	},

	_createHelper: function(event) {

		var o = this.options,
			helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event])) : (o.helper === "clone" ? this.element.clone().removeAttr("id") : this.element);

		if(!helper.parents("body").length) {
			helper.appendTo((o.appendTo === "parent" ? this.element[0].parentNode : o.appendTo));
		}

		if(helper[0] !== this.element[0] && !(/(fixed|absolute)/).test(helper.css("position"))) {
			helper.css("position", "absolute");
		}

		return helper;

	},

	_adjustOffsetFromHelper: function(obj) {
		if (typeof obj === "string") {
			obj = obj.split(" ");
		}
		if ($.isArray(obj)) {
			obj = {left: +obj[0], top: +obj[1] || 0};
		}
		if ("left" in obj) {
			this.offset.click.left = obj.left + this.margins.left;
		}
		if ("right" in obj) {
			this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
		}
		if ("top" in obj) {
			this.offset.click.top = obj.top + this.margins.top;
		}
		if ("bottom" in obj) {
			this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
		}
	},

	_getParentOffset: function() {

		//Get the offsetParent and cache its position
		var po = this.offsetParent.offset();

		// This is a special case where we need to modify a offset calculated on start, since the following happened:
		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
		if(this.cssPosition === "absolute" && this.scrollParent[0] !== document && $.contains(this.scrollParent[0], this.offsetParent[0])) {
			po.left += this.scrollParent.scrollLeft();
			po.top += this.scrollParent.scrollTop();
		}

		//This needs to be actually done for all browsers, since pageX/pageY includes this information
		//Ugly IE fix
		if((this.offsetParent[0] === document.body) ||
			(this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() === "html" && $.ui.ie)) {
			po = { top: 0, left: 0 };
		}

		return {
			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"),10) || 0),
			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"),10) || 0)
		};

	},

	_getRelativeOffset: function() {

		if(this.cssPosition === "relative") {
			var p = this.element.position();
			return {
				top: p.top - (parseInt(this.helper.css("top"),10) || 0) + this.scrollParent.scrollTop(),
				left: p.left - (parseInt(this.helper.css("left"),10) || 0) + this.scrollParent.scrollLeft()
			};
		} else {
			return { top: 0, left: 0 };
		}

	},

	_cacheMargins: function() {
		this.margins = {
			left: (parseInt(this.element.css("marginLeft"),10) || 0),
			top: (parseInt(this.element.css("marginTop"),10) || 0),
			right: (parseInt(this.element.css("marginRight"),10) || 0),
			bottom: (parseInt(this.element.css("marginBottom"),10) || 0)
		};
	},

	_cacheHelperProportions: function() {
		this.helperProportions = {
			width: this.helper.outerWidth(),
			height: this.helper.outerHeight()
		};
	},

	_setContainment: function() {

		var over, c, ce,
			o = this.options;

		if ( !o.containment ) {
			this.containment = null;
			return;
		}

		if ( o.containment === "window" ) {
			this.containment = [
				$( window ).scrollLeft() - this.offset.relative.left - this.offset.parent.left,
				$( window ).scrollTop() - this.offset.relative.top - this.offset.parent.top,
				$( window ).scrollLeft() + $( window ).width() - this.helperProportions.width - this.margins.left,
				$( window ).scrollTop() + ( $( window ).height() || document.body.parentNode.scrollHeight ) - this.helperProportions.height - this.margins.top
			];
			return;
		}

		if ( o.containment === "document") {
			this.containment = [
				0,
				0,
				$( document ).width() - this.helperProportions.width - this.margins.left,
				( $( document ).height() || document.body.parentNode.scrollHeight ) - this.helperProportions.height - this.margins.top
			];
			return;
		}

		if ( o.containment.constructor === Array ) {
			this.containment = o.containment;
			return;
		}

		if ( o.containment === "parent" ) {
			o.containment = this.helper[ 0 ].parentNode;
		}

		c = $( o.containment );
		ce = c[ 0 ];

		if( !ce ) {
			return;
		}

		over = c.css( "overflow" ) !== "hidden";

		this.containment = [
			( parseInt( c.css( "borderLeftWidth" ), 10 ) || 0 ) + ( parseInt( c.css( "paddingLeft" ), 10 ) || 0 ),
			( parseInt( c.css( "borderTopWidth" ), 10 ) || 0 ) + ( parseInt( c.css( "paddingTop" ), 10 ) || 0 ) ,
			( over ? Math.max( ce.scrollWidth, ce.offsetWidth ) : ce.offsetWidth ) - ( parseInt( c.css( "borderRightWidth" ), 10 ) || 0 ) - ( parseInt( c.css( "paddingRight" ), 10 ) || 0 ) - this.helperProportions.width - this.margins.left - this.margins.right,
			( over ? Math.max( ce.scrollHeight, ce.offsetHeight ) : ce.offsetHeight ) - ( parseInt( c.css( "borderBottomWidth" ), 10 ) || 0 ) - ( parseInt( c.css( "paddingBottom" ), 10 ) || 0 ) - this.helperProportions.height - this.margins.top  - this.margins.bottom
		];
		this.relative_container = c;
	},

	_convertPositionTo: function(d, pos) {

		if(!pos) {
			pos = this.position;
		}

		var mod = d === "absolute" ? 1 : -1,
			scroll = this.cssPosition === "absolute" && !( this.scrollParent[ 0 ] !== document && $.contains( this.scrollParent[ 0 ], this.offsetParent[ 0 ] ) ) ? this.offsetParent : this.scrollParent;

		//Cache the scroll
		if (!this.offset.scroll) {
			this.offset.scroll = {top : scroll.scrollTop(), left : scroll.scrollLeft()};
		}

		return {
			top: (
				pos.top	+																// The absolute mouse position
				this.offset.relative.top * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.top * mod -										// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollTop() : this.offset.scroll.top ) * mod )
			),
			left: (
				pos.left +																// The absolute mouse position
				this.offset.relative.left * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.left * mod	-										// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollLeft() : this.offset.scroll.left ) * mod )
			)
		};

	},

	_generatePosition: function(event) {

		var containment, co, top, left,
			o = this.options,
			scroll = this.cssPosition === "absolute" && !( this.scrollParent[ 0 ] !== document && $.contains( this.scrollParent[ 0 ], this.offsetParent[ 0 ] ) ) ? this.offsetParent : this.scrollParent,
			pageX = event.pageX,
			pageY = event.pageY;

		//Cache the scroll
		if (!this.offset.scroll) {
			this.offset.scroll = {top : scroll.scrollTop(), left : scroll.scrollLeft()};
		}

		/*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */

		// If we are not dragging yet, we won't check for options
		if ( this.originalPosition ) {
			if ( this.containment ) {
				if ( this.relative_container ){
					co = this.relative_container.offset();
					containment = [
						this.containment[ 0 ] + co.left,
						this.containment[ 1 ] + co.top,
						this.containment[ 2 ] + co.left,
						this.containment[ 3 ] + co.top
					];
				}
				else {
					containment = this.containment;
				}

				if(event.pageX - this.offset.click.left < containment[0]) {
					pageX = containment[0] + this.offset.click.left;
				}
				if(event.pageY - this.offset.click.top < containment[1]) {
					pageY = containment[1] + this.offset.click.top;
				}
				if(event.pageX - this.offset.click.left > containment[2]) {
					pageX = containment[2] + this.offset.click.left;
				}
				if(event.pageY - this.offset.click.top > containment[3]) {
					pageY = containment[3] + this.offset.click.top;
				}
			}

			if(o.grid) {
				//Check for grid elements set to 0 to prevent divide by 0 error causing invalid argument errors in IE (see ticket #6950)
				top = o.grid[1] ? this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1] : this.originalPageY;
				pageY = containment ? ((top - this.offset.click.top >= containment[1] || top - this.offset.click.top > containment[3]) ? top : ((top - this.offset.click.top >= containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

				left = o.grid[0] ? this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0] : this.originalPageX;
				pageX = containment ? ((left - this.offset.click.left >= containment[0] || left - this.offset.click.left > containment[2]) ? left : ((left - this.offset.click.left >= containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
			}

		}

		return {
			top: (
				pageY -																	// The absolute mouse position
				this.offset.click.top	-												// Click offset (relative to the element)
				this.offset.relative.top -												// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.top +												// The offsetParent's offset without borders (offset + border)
				( this.cssPosition === "fixed" ? -this.scrollParent.scrollTop() : this.offset.scroll.top )
			),
			left: (
				pageX -																	// The absolute mouse position
				this.offset.click.left -												// Click offset (relative to the element)
				this.offset.relative.left -												// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.left +												// The offsetParent's offset without borders (offset + border)
				( this.cssPosition === "fixed" ? -this.scrollParent.scrollLeft() : this.offset.scroll.left )
			)
		};

	},

	_clear: function() {
		this.helper.removeClass("ui-draggable-dragging");
		if(this.helper[0] !== this.element[0] && !this.cancelHelperRemoval) {
			this.helper.remove();
		}
		this.helper = null;
		this.cancelHelperRemoval = false;
	},

	// From now on bulk stuff - mainly helpers

	_trigger: function(type, event, ui) {
		ui = ui || this._uiHash();
		$.ui.plugin.call(this, type, [event, ui]);
		//The absolute position has to be recalculated after plugins
		if(type === "drag") {
			this.positionAbs = this._convertPositionTo("absolute");
		}
		return $.Widget.prototype._trigger.call(this, type, event, ui);
	},

	plugins: {},

	_uiHash: function() {
		return {
			helper: this.helper,
			position: this.position,
			originalPosition: this.originalPosition,
			offset: this.positionAbs
		};
	}

});

$.ui.plugin.add("draggable", "connectToSortable", {
	start: function(event, ui) {

		var inst = $(this).data("ui-draggable"), o = inst.options,
			uiSortable = $.extend({}, ui, { item: inst.element });
		inst.sortables = [];
		$(o.connectToSortable).each(function() {
			var sortable = $.data(this, "ui-sortable");
			if (sortable && !sortable.options.disabled) {
				inst.sortables.push({
					instance: sortable,
					shouldRevert: sortable.options.revert
				});
				sortable.refreshPositions();	// Call the sortable's refreshPositions at drag start to refresh the containerCache since the sortable container cache is used in drag and needs to be up to date (this will ensure it's initialised as well as being kept in step with any changes that might have happened on the page).
				sortable._trigger("activate", event, uiSortable);
			}
		});

	},
	stop: function(event, ui) {

		//If we are still over the sortable, we fake the stop event of the sortable, but also remove helper
		var inst = $(this).data("ui-draggable"),
			uiSortable = $.extend({}, ui, { item: inst.element });

		$.each(inst.sortables, function() {
			if(this.instance.isOver) {

				this.instance.isOver = 0;

				inst.cancelHelperRemoval = true; //Don't remove the helper in the draggable instance
				this.instance.cancelHelperRemoval = false; //Remove it in the sortable instance (so sortable plugins like revert still work)

				//The sortable revert is supported, and we have to set a temporary dropped variable on the draggable to support revert: "valid/invalid"
				if(this.shouldRevert) {
					this.instance.options.revert = this.shouldRevert;
				}

				//Trigger the stop of the sortable
				this.instance._mouseStop(event);

				this.instance.options.helper = this.instance.options._helper;

				//If the helper has been the original item, restore properties in the sortable
				if(inst.options.helper === "original") {
					this.instance.currentItem.css({ top: "auto", left: "auto" });
				}

			} else {
				this.instance.cancelHelperRemoval = false; //Remove the helper in the sortable instance
				this.instance._trigger("deactivate", event, uiSortable);
			}

		});

	},
	drag: function(event, ui) {

		var inst = $(this).data("ui-draggable"), that = this;

		$.each(inst.sortables, function() {

			var innermostIntersecting = false,
				thisSortable = this;

			//Copy over some variables to allow calling the sortable's native _intersectsWith
			this.instance.positionAbs = inst.positionAbs;
			this.instance.helperProportions = inst.helperProportions;
			this.instance.offset.click = inst.offset.click;

			if(this.instance._intersectsWith(this.instance.containerCache)) {
				innermostIntersecting = true;
				$.each(inst.sortables, function () {
					this.instance.positionAbs = inst.positionAbs;
					this.instance.helperProportions = inst.helperProportions;
					this.instance.offset.click = inst.offset.click;
					if (this !== thisSortable &&
						this.instance._intersectsWith(this.instance.containerCache) &&
						$.contains(thisSortable.instance.element[0], this.instance.element[0])
					) {
						innermostIntersecting = false;
					}
					return innermostIntersecting;
				});
			}


			if(innermostIntersecting) {
				//If it intersects, we use a little isOver variable and set it once, so our move-in stuff gets fired only once
				if(!this.instance.isOver) {

					this.instance.isOver = 1;
					//Now we fake the start of dragging for the sortable instance,
					//by cloning the list group item, appending it to the sortable and using it as inst.currentItem
					//We can then fire the start event of the sortable with our passed browser event, and our own helper (so it doesn't create a new one)
					this.instance.currentItem = $(that).clone().removeAttr("id").appendTo(this.instance.element).data("ui-sortable-item", true);
					this.instance.options._helper = this.instance.options.helper; //Store helper option to later restore it
					this.instance.options.helper = function() { return ui.helper[0]; };

					event.target = this.instance.currentItem[0];
					this.instance._mouseCapture(event, true);
					this.instance._mouseStart(event, true, true);

					//Because the browser event is way off the new appended portlet, we modify a couple of variables to reflect the changes
					this.instance.offset.click.top = inst.offset.click.top;
					this.instance.offset.click.left = inst.offset.click.left;
					this.instance.offset.parent.left -= inst.offset.parent.left - this.instance.offset.parent.left;
					this.instance.offset.parent.top -= inst.offset.parent.top - this.instance.offset.parent.top;

					inst._trigger("toSortable", event);
					inst.dropped = this.instance.element; //draggable revert needs that
					//hack so receive/update callbacks work (mostly)
					inst.currentItem = inst.element;
					this.instance.fromOutside = inst;

				}

				//Provided we did all the previous steps, we can fire the drag event of the sortable on every draggable drag, when it intersects with the sortable
				if(this.instance.currentItem) {
					this.instance._mouseDrag(event);
				}

			} else {

				//If it doesn't intersect with the sortable, and it intersected before,
				//we fake the drag stop of the sortable, but make sure it doesn't remove the helper by using cancelHelperRemoval
				if(this.instance.isOver) {

					this.instance.isOver = 0;
					this.instance.cancelHelperRemoval = true;

					//Prevent reverting on this forced stop
					this.instance.options.revert = false;

					// The out event needs to be triggered independently
					this.instance._trigger("out", event, this.instance._uiHash(this.instance));

					this.instance._mouseStop(event, true);
					this.instance.options.helper = this.instance.options._helper;

					//Now we remove our currentItem, the list group clone again, and the placeholder, and animate the helper back to it's original size
					this.instance.currentItem.remove();
					if(this.instance.placeholder) {
						this.instance.placeholder.remove();
					}

					inst._trigger("fromSortable", event);
					inst.dropped = false; //draggable revert needs that
				}

			}

		});

	}
});

$.ui.plugin.add("draggable", "cursor", {
	start: function() {
		var t = $("body"), o = $(this).data("ui-draggable").options;
		if (t.css("cursor")) {
			o._cursor = t.css("cursor");
		}
		t.css("cursor", o.cursor);
	},
	stop: function() {
		var o = $(this).data("ui-draggable").options;
		if (o._cursor) {
			$("body").css("cursor", o._cursor);
		}
	}
});

$.ui.plugin.add("draggable", "opacity", {
	start: function(event, ui) {
		var t = $(ui.helper), o = $(this).data("ui-draggable").options;
		if(t.css("opacity")) {
			o._opacity = t.css("opacity");
		}
		t.css("opacity", o.opacity);
	},
	stop: function(event, ui) {
		var o = $(this).data("ui-draggable").options;
		if(o._opacity) {
			$(ui.helper).css("opacity", o._opacity);
		}
	}
});

$.ui.plugin.add("draggable", "scroll", {
	start: function() {
		var i = $(this).data("ui-draggable");
		if(i.scrollParent[0] !== document && i.scrollParent[0].tagName !== "HTML") {
			i.overflowOffset = i.scrollParent.offset();
		}
	},
	drag: function( event ) {

		var i = $(this).data("ui-draggable"), o = i.options, scrolled = false;

		if(i.scrollParent[0] !== document && i.scrollParent[0].tagName !== "HTML") {

			if(!o.axis || o.axis !== "x") {
				if((i.overflowOffset.top + i.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity) {
					i.scrollParent[0].scrollTop = scrolled = i.scrollParent[0].scrollTop + o.scrollSpeed;
				} else if(event.pageY - i.overflowOffset.top < o.scrollSensitivity) {
					i.scrollParent[0].scrollTop = scrolled = i.scrollParent[0].scrollTop - o.scrollSpeed;
				}
			}

			if(!o.axis || o.axis !== "y") {
				if((i.overflowOffset.left + i.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity) {
					i.scrollParent[0].scrollLeft = scrolled = i.scrollParent[0].scrollLeft + o.scrollSpeed;
				} else if(event.pageX - i.overflowOffset.left < o.scrollSensitivity) {
					i.scrollParent[0].scrollLeft = scrolled = i.scrollParent[0].scrollLeft - o.scrollSpeed;
				}
			}

		} else {

			if(!o.axis || o.axis !== "x") {
				if(event.pageY - $(document).scrollTop() < o.scrollSensitivity) {
					scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
				} else if($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity) {
					scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);
				}
			}

			if(!o.axis || o.axis !== "y") {
				if(event.pageX - $(document).scrollLeft() < o.scrollSensitivity) {
					scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
				} else if($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity) {
					scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);
				}
			}

		}

		if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour) {
			$.ui.ddmanager.prepareOffsets(i, event);
		}

	}
});

$.ui.plugin.add("draggable", "snap", {
	start: function() {

		var i = $(this).data("ui-draggable"),
			o = i.options;

		i.snapElements = [];

		$(o.snap.constructor !== String ? ( o.snap.items || ":data(ui-draggable)" ) : o.snap).each(function() {
			var $t = $(this),
				$o = $t.offset();
			if(this !== i.element[0]) {
				i.snapElements.push({
					item: this,
					width: $t.outerWidth(), height: $t.outerHeight(),
					top: $o.top, left: $o.left
				});
			}
		});

	},
	drag: function(event, ui) {

		var ts, bs, ls, rs, l, r, t, b, i, first,
			inst = $(this).data("ui-draggable"),
			o = inst.options,
			d = o.snapTolerance,
			x1 = ui.offset.left, x2 = x1 + inst.helperProportions.width,
			y1 = ui.offset.top, y2 = y1 + inst.helperProportions.height;

		for (i = inst.snapElements.length - 1; i >= 0; i--){

			l = inst.snapElements[i].left;
			r = l + inst.snapElements[i].width;
			t = inst.snapElements[i].top;
			b = t + inst.snapElements[i].height;

			if ( x2 < l - d || x1 > r + d || y2 < t - d || y1 > b + d || !$.contains( inst.snapElements[ i ].item.ownerDocument, inst.snapElements[ i ].item ) ) {
				if(inst.snapElements[i].snapping) {
					(inst.options.snap.release && inst.options.snap.release.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
				}
				inst.snapElements[i].snapping = false;
				continue;
			}

			if(o.snapMode !== "inner") {
				ts = Math.abs(t - y2) <= d;
				bs = Math.abs(b - y1) <= d;
				ls = Math.abs(l - x2) <= d;
				rs = Math.abs(r - x1) <= d;
				if(ts) {
					ui.position.top = inst._convertPositionTo("relative", { top: t - inst.helperProportions.height, left: 0 }).top - inst.margins.top;
				}
				if(bs) {
					ui.position.top = inst._convertPositionTo("relative", { top: b, left: 0 }).top - inst.margins.top;
				}
				if(ls) {
					ui.position.left = inst._convertPositionTo("relative", { top: 0, left: l - inst.helperProportions.width }).left - inst.margins.left;
				}
				if(rs) {
					ui.position.left = inst._convertPositionTo("relative", { top: 0, left: r }).left - inst.margins.left;
				}
			}

			first = (ts || bs || ls || rs);

			if(o.snapMode !== "outer") {
				ts = Math.abs(t - y1) <= d;
				bs = Math.abs(b - y2) <= d;
				ls = Math.abs(l - x1) <= d;
				rs = Math.abs(r - x2) <= d;
				if(ts) {
					ui.position.top = inst._convertPositionTo("relative", { top: t, left: 0 }).top - inst.margins.top;
				}
				if(bs) {
					ui.position.top = inst._convertPositionTo("relative", { top: b - inst.helperProportions.height, left: 0 }).top - inst.margins.top;
				}
				if(ls) {
					ui.position.left = inst._convertPositionTo("relative", { top: 0, left: l }).left - inst.margins.left;
				}
				if(rs) {
					ui.position.left = inst._convertPositionTo("relative", { top: 0, left: r - inst.helperProportions.width }).left - inst.margins.left;
				}
			}

			if(!inst.snapElements[i].snapping && (ts || bs || ls || rs || first)) {
				(inst.options.snap.snap && inst.options.snap.snap.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
			}
			inst.snapElements[i].snapping = (ts || bs || ls || rs || first);

		}

	}
});

$.ui.plugin.add("draggable", "stack", {
	start: function() {
		var min,
			o = this.data("ui-draggable").options,
			group = $.makeArray($(o.stack)).sort(function(a,b) {
				return (parseInt($(a).css("zIndex"),10) || 0) - (parseInt($(b).css("zIndex"),10) || 0);
			});

		if (!group.length) { return; }

		min = parseInt($(group[0]).css("zIndex"), 10) || 0;
		$(group).each(function(i) {
			$(this).css("zIndex", min + i);
		});
		this.css("zIndex", (min + group.length));
	}
});

$.ui.plugin.add("draggable", "zIndex", {
	start: function(event, ui) {
		var t = $(ui.helper), o = $(this).data("ui-draggable").options;
		if(t.css("zIndex")) {
			o._zIndex = t.css("zIndex");
		}
		t.css("zIndex", o.zIndex);
	},
	stop: function(event, ui) {
		var o = $(this).data("ui-draggable").options;
		if(o._zIndex) {
			$(ui.helper).css("zIndex", o._zIndex);
		}
	}
});

})(jQuery);
(function( $, undefined ) {

function isOverAxis( x, reference, size ) {
	return ( x > reference ) && ( x < ( reference + size ) );
}

$.widget("ui.droppable", {
	version: "1.10.4",
	widgetEventPrefix: "drop",
	options: {
		accept: "*",
		activeClass: false,
		addClasses: true,
		greedy: false,
		hoverClass: false,
		scope: "default",
		tolerance: "intersect",

		// callbacks
		activate: null,
		deactivate: null,
		drop: null,
		out: null,
		over: null
	},
	_create: function() {

		var proportions,
			o = this.options,
			accept = o.accept;

		this.isover = false;
		this.isout = true;

		this.accept = $.isFunction(accept) ? accept : function(d) {
			return d.is(accept);
		};

		this.proportions = function( /* valueToWrite */ ) {
			if ( arguments.length ) {
				// Store the droppable's proportions
				proportions = arguments[ 0 ];
			} else {
				// Retrieve or derive the droppable's proportions
				return proportions ?
					proportions :
					proportions = {
						width: this.element[ 0 ].offsetWidth,
						height: this.element[ 0 ].offsetHeight
					};
			}
		};

		// Add the reference and positions to the manager
		$.ui.ddmanager.droppables[o.scope] = $.ui.ddmanager.droppables[o.scope] || [];
		$.ui.ddmanager.droppables[o.scope].push(this);

		(o.addClasses && this.element.addClass("ui-droppable"));

	},

	_destroy: function() {
		var i = 0,
			drop = $.ui.ddmanager.droppables[this.options.scope];

		for ( ; i < drop.length; i++ ) {
			if ( drop[i] === this ) {
				drop.splice(i, 1);
			}
		}

		this.element.removeClass("ui-droppable ui-droppable-disabled");
	},

	_setOption: function(key, value) {

		if(key === "accept") {
			this.accept = $.isFunction(value) ? value : function(d) {
				return d.is(value);
			};
		}
		$.Widget.prototype._setOption.apply(this, arguments);
	},

	_activate: function(event) {
		var draggable = $.ui.ddmanager.current;
		if(this.options.activeClass) {
			this.element.addClass(this.options.activeClass);
		}
		if(draggable){
			this._trigger("activate", event, this.ui(draggable));
		}
	},

	_deactivate: function(event) {
		var draggable = $.ui.ddmanager.current;
		if(this.options.activeClass) {
			this.element.removeClass(this.options.activeClass);
		}
		if(draggable){
			this._trigger("deactivate", event, this.ui(draggable));
		}
	},

	_over: function(event) {

		var draggable = $.ui.ddmanager.current;

		// Bail if draggable and droppable are same element
		if (!draggable || (draggable.currentItem || draggable.element)[0] === this.element[0]) {
			return;
		}

		if (this.accept.call(this.element[0],(draggable.currentItem || draggable.element))) {
			if(this.options.hoverClass) {
				this.element.addClass(this.options.hoverClass);
			}
			this._trigger("over", event, this.ui(draggable));
		}

	},

	_out: function(event) {

		var draggable = $.ui.ddmanager.current;

		// Bail if draggable and droppable are same element
		if (!draggable || (draggable.currentItem || draggable.element)[0] === this.element[0]) {
			return;
		}

		if (this.accept.call(this.element[0],(draggable.currentItem || draggable.element))) {
			if(this.options.hoverClass) {
				this.element.removeClass(this.options.hoverClass);
			}
			this._trigger("out", event, this.ui(draggable));
		}

	},

	_drop: function(event,custom) {

		var draggable = custom || $.ui.ddmanager.current,
			childrenIntersection = false;

		// Bail if draggable and droppable are same element
		if (!draggable || (draggable.currentItem || draggable.element)[0] === this.element[0]) {
			return false;
		}

		this.element.find(":data(ui-droppable)").not(".ui-draggable-dragging").each(function() {
			var inst = $.data(this, "ui-droppable");
			if(
				inst.options.greedy &&
				!inst.options.disabled &&
				inst.options.scope === draggable.options.scope &&
				inst.accept.call(inst.element[0], (draggable.currentItem || draggable.element)) &&
				$.ui.intersect(draggable, $.extend(inst, { offset: inst.element.offset() }), inst.options.tolerance)
			) { childrenIntersection = true; return false; }
		});
		if(childrenIntersection) {
			return false;
		}

		if(this.accept.call(this.element[0],(draggable.currentItem || draggable.element))) {
			if(this.options.activeClass) {
				this.element.removeClass(this.options.activeClass);
			}
			if(this.options.hoverClass) {
				this.element.removeClass(this.options.hoverClass);
			}
			this._trigger("drop", event, this.ui(draggable));
			return this.element;
		}

		return false;

	},

	ui: function(c) {
		return {
			draggable: (c.currentItem || c.element),
			helper: c.helper,
			position: c.position,
			offset: c.positionAbs
		};
	}

});

$.ui.intersect = function(draggable, droppable, toleranceMode) {

	if (!droppable.offset) {
		return false;
	}

	var draggableLeft, draggableTop,
		x1 = (draggable.positionAbs || draggable.position.absolute).left,
		y1 = (draggable.positionAbs || draggable.position.absolute).top,
		x2 = x1 + draggable.helperProportions.width,
		y2 = y1 + draggable.helperProportions.height,
		l = droppable.offset.left,
		t = droppable.offset.top,
		r = l + droppable.proportions().width,
		b = t + droppable.proportions().height;

	switch (toleranceMode) {
		case "fit":
			return (l <= x1 && x2 <= r && t <= y1 && y2 <= b);
		case "intersect":
			return (l < x1 + (draggable.helperProportions.width / 2) && // Right Half
				x2 - (draggable.helperProportions.width / 2) < r && // Left Half
				t < y1 + (draggable.helperProportions.height / 2) && // Bottom Half
				y2 - (draggable.helperProportions.height / 2) < b ); // Top Half
		case "pointer":
			draggableLeft = ((draggable.positionAbs || draggable.position.absolute).left + (draggable.clickOffset || draggable.offset.click).left);
			draggableTop = ((draggable.positionAbs || draggable.position.absolute).top + (draggable.clickOffset || draggable.offset.click).top);
			return isOverAxis( draggableTop, t, droppable.proportions().height ) && isOverAxis( draggableLeft, l, droppable.proportions().width );
		case "touch":
			return (
				(y1 >= t && y1 <= b) ||	// Top edge touching
				(y2 >= t && y2 <= b) ||	// Bottom edge touching
				(y1 < t && y2 > b)		// Surrounded vertically
			) && (
				(x1 >= l && x1 <= r) ||	// Left edge touching
				(x2 >= l && x2 <= r) ||	// Right edge touching
				(x1 < l && x2 > r)		// Surrounded horizontally
			);
		default:
			return false;
		}

};

/*
	This manager tracks offsets of draggables and droppables
*/
$.ui.ddmanager = {
	current: null,
	droppables: { "default": [] },
	prepareOffsets: function(t, event) {

		var i, j,
			m = $.ui.ddmanager.droppables[t.options.scope] || [],
			type = event ? event.type : null, // workaround for #2317
			list = (t.currentItem || t.element).find(":data(ui-droppable)").addBack();

		droppablesLoop: for (i = 0; i < m.length; i++) {

			//No disabled and non-accepted
			if(m[i].options.disabled || (t && !m[i].accept.call(m[i].element[0],(t.currentItem || t.element)))) {
				continue;
			}

			// Filter out elements in the current dragged item
			for (j=0; j < list.length; j++) {
				if(list[j] === m[i].element[0]) {
					m[i].proportions().height = 0;
					continue droppablesLoop;
				}
			}

			m[i].visible = m[i].element.css("display") !== "none";
			if(!m[i].visible) {
				continue;
			}

			//Activate the droppable if used directly from draggables
			if(type === "mousedown") {
				m[i]._activate.call(m[i], event);
			}

			m[ i ].offset = m[ i ].element.offset();
			m[ i ].proportions({ width: m[ i ].element[ 0 ].offsetWidth, height: m[ i ].element[ 0 ].offsetHeight });

		}

	},
	drop: function(draggable, event) {

		var dropped = false;
		// Create a copy of the droppables in case the list changes during the drop (#9116)
		$.each(($.ui.ddmanager.droppables[draggable.options.scope] || []).slice(), function() {

			if(!this.options) {
				return;
			}
			if (!this.options.disabled && this.visible && $.ui.intersect(draggable, this, this.options.tolerance)) {
				dropped = this._drop.call(this, event) || dropped;
			}

			if (!this.options.disabled && this.visible && this.accept.call(this.element[0],(draggable.currentItem || draggable.element))) {
				this.isout = true;
				this.isover = false;
				this._deactivate.call(this, event);
			}

		});
		return dropped;

	},
	dragStart: function( draggable, event ) {
		//Listen for scrolling so that if the dragging causes scrolling the position of the droppables can be recalculated (see #5003)
		draggable.element.parentsUntil( "body" ).bind( "scroll.droppable", function() {
			if( !draggable.options.refreshPositions ) {
				$.ui.ddmanager.prepareOffsets( draggable, event );
			}
		});
	},
	drag: function(draggable, event) {

		//If you have a highly dynamic page, you might try this option. It renders positions every time you move the mouse.
		if(draggable.options.refreshPositions) {
			$.ui.ddmanager.prepareOffsets(draggable, event);
		}

		//Run through all droppables and check their positions based on specific tolerance options
		$.each($.ui.ddmanager.droppables[draggable.options.scope] || [], function() {

			if(this.options.disabled || this.greedyChild || !this.visible) {
				return;
			}

			var parentInstance, scope, parent,
				intersects = $.ui.intersect(draggable, this, this.options.tolerance),
				c = !intersects && this.isover ? "isout" : (intersects && !this.isover ? "isover" : null);
			if(!c) {
				return;
			}

			if (this.options.greedy) {
				// find droppable parents with same scope
				scope = this.options.scope;
				parent = this.element.parents(":data(ui-droppable)").filter(function () {
					return $.data(this, "ui-droppable").options.scope === scope;
				});

				if (parent.length) {
					parentInstance = $.data(parent[0], "ui-droppable");
					parentInstance.greedyChild = (c === "isover");
				}
			}

			// we just moved into a greedy child
			if (parentInstance && c === "isover") {
				parentInstance.isover = false;
				parentInstance.isout = true;
				parentInstance._out.call(parentInstance, event);
			}

			this[c] = true;
			this[c === "isout" ? "isover" : "isout"] = false;
			this[c === "isover" ? "_over" : "_out"].call(this, event);

			// we just moved out of a greedy child
			if (parentInstance && c === "isout") {
				parentInstance.isout = false;
				parentInstance.isover = true;
				parentInstance._over.call(parentInstance, event);
			}
		});

	},
	dragStop: function( draggable, event ) {
		draggable.element.parentsUntil( "body" ).unbind( "scroll.droppable" );
		//Call prepareOffsets one final time since IE does not fire return scroll events when overflow was caused by drag (see #5003)
		if( !draggable.options.refreshPositions ) {
			$.ui.ddmanager.prepareOffsets( draggable, event );
		}
	}
};

})(jQuery);
(function( $, undefined ) {

function num(v) {
	return parseInt(v, 10) || 0;
}

function isNumber(value) {
	return !isNaN(parseInt(value, 10));
}

$.widget("ui.resizable", $.ui.mouse, {
	version: "1.10.4",
	widgetEventPrefix: "resize",
	options: {
		alsoResize: false,
		animate: false,
		animateDuration: "slow",
		animateEasing: "swing",
		aspectRatio: false,
		autoHide: false,
		containment: false,
		ghost: false,
		grid: false,
		handles: "e,s,se",
		helper: false,
		maxHeight: null,
		maxWidth: null,
		minHeight: 10,
		minWidth: 10,
		// See #7960
		zIndex: 90,

		// callbacks
		resize: null,
		start: null,
		stop: null
	},
	_create: function() {

		var n, i, handle, axis, hname,
			that = this,
			o = this.options;
		this.element.addClass("ui-resizable");

		$.extend(this, {
			_aspectRatio: !!(o.aspectRatio),
			aspectRatio: o.aspectRatio,
			originalElement: this.element,
			_proportionallyResizeElements: [],
			_helper: o.helper || o.ghost || o.animate ? o.helper || "ui-resizable-helper" : null
		});

		//Wrap the element if it cannot hold child nodes
		if(this.element[0].nodeName.match(/canvas|textarea|input|select|button|img/i)) {

			//Create a wrapper element and set the wrapper to the new current internal element
			this.element.wrap(
				$("<div class='ui-wrapper' style='overflow: hidden;'></div>").css({
					position: this.element.css("position"),
					width: this.element.outerWidth(),
					height: this.element.outerHeight(),
					top: this.element.css("top"),
					left: this.element.css("left")
				})
			);

			//Overwrite the original this.element
			this.element = this.element.parent().data(
				"ui-resizable", this.element.data("ui-resizable")
			);

			this.elementIsWrapper = true;

			//Move margins to the wrapper
			this.element.css({ marginLeft: this.originalElement.css("marginLeft"), marginTop: this.originalElement.css("marginTop"), marginRight: this.originalElement.css("marginRight"), marginBottom: this.originalElement.css("marginBottom") });
			this.originalElement.css({ marginLeft: 0, marginTop: 0, marginRight: 0, marginBottom: 0});

			//Prevent Safari textarea resize
			this.originalResizeStyle = this.originalElement.css("resize");
			this.originalElement.css("resize", "none");

			//Push the actual element to our proportionallyResize internal array
			this._proportionallyResizeElements.push(this.originalElement.css({ position: "static", zoom: 1, display: "block" }));

			// avoid IE jump (hard set the margin)
			this.originalElement.css({ margin: this.originalElement.css("margin") });

			// fix handlers offset
			this._proportionallyResize();

		}

		this.handles = o.handles || (!$(".ui-resizable-handle", this.element).length ? "e,s,se" : { n: ".ui-resizable-n", e: ".ui-resizable-e", s: ".ui-resizable-s", w: ".ui-resizable-w", se: ".ui-resizable-se", sw: ".ui-resizable-sw", ne: ".ui-resizable-ne", nw: ".ui-resizable-nw" });
		if(this.handles.constructor === String) {

			if ( this.handles === "all") {
				this.handles = "n,e,s,w,se,sw,ne,nw";
			}

			n = this.handles.split(",");
			this.handles = {};

			for(i = 0; i < n.length; i++) {

				handle = $.trim(n[i]);
				hname = "ui-resizable-"+handle;
				axis = $("<div class='ui-resizable-handle " + hname + "'></div>");

				// Apply zIndex to all handles - see #7960
				axis.css({ zIndex: o.zIndex });

				//TODO : What's going on here?
				if ("se" === handle) {
					axis.addClass("ui-icon ui-icon-gripsmall-diagonal-se");
				}

				//Insert into internal handles object and append to element
				this.handles[handle] = ".ui-resizable-"+handle;
				this.element.append(axis);
			}

		}

		this._renderAxis = function(target) {

			var i, axis, padPos, padWrapper;

			target = target || this.element;

			for(i in this.handles) {

				if(this.handles[i].constructor === String) {
					this.handles[i] = $(this.handles[i], this.element).show();
				}

				//Apply pad to wrapper element, needed to fix axis position (textarea, inputs, scrolls)
				if (this.elementIsWrapper && this.originalElement[0].nodeName.match(/textarea|input|select|button/i)) {

					axis = $(this.handles[i], this.element);

					//Checking the correct pad and border
					padWrapper = /sw|ne|nw|se|n|s/.test(i) ? axis.outerHeight() : axis.outerWidth();

					//The padding type i have to apply...
					padPos = [ "padding",
						/ne|nw|n/.test(i) ? "Top" :
						/se|sw|s/.test(i) ? "Bottom" :
						/^e$/.test(i) ? "Right" : "Left" ].join("");

					target.css(padPos, padWrapper);

					this._proportionallyResize();

				}

				//TODO: What's that good for? There's not anything to be executed left
				if(!$(this.handles[i]).length) {
					continue;
				}
			}
		};

		//TODO: make renderAxis a prototype function
		this._renderAxis(this.element);

		this._handles = $(".ui-resizable-handle", this.element)
			.disableSelection();

		//Matching axis name
		this._handles.mouseover(function() {
			if (!that.resizing) {
				if (this.className) {
					axis = this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i);
				}
				//Axis, default = se
				that.axis = axis && axis[1] ? axis[1] : "se";
			}
		});

		//If we want to auto hide the elements
		if (o.autoHide) {
			this._handles.hide();
			$(this.element)
				.addClass("ui-resizable-autohide")
				.mouseenter(function() {
					if (o.disabled) {
						return;
					}
					$(this).removeClass("ui-resizable-autohide");
					that._handles.show();
				})
				.mouseleave(function(){
					if (o.disabled) {
						return;
					}
					if (!that.resizing) {
						$(this).addClass("ui-resizable-autohide");
						that._handles.hide();
					}
				});
		}

		//Initialize the mouse interaction
		this._mouseInit();

	},

	_destroy: function() {

		this._mouseDestroy();

		var wrapper,
			_destroy = function(exp) {
				$(exp).removeClass("ui-resizable ui-resizable-disabled ui-resizable-resizing")
					.removeData("resizable").removeData("ui-resizable").unbind(".resizable").find(".ui-resizable-handle").remove();
			};

		//TODO: Unwrap at same DOM position
		if (this.elementIsWrapper) {
			_destroy(this.element);
			wrapper = this.element;
			this.originalElement.css({
				position: wrapper.css("position"),
				width: wrapper.outerWidth(),
				height: wrapper.outerHeight(),
				top: wrapper.css("top"),
				left: wrapper.css("left")
			}).insertAfter( wrapper );
			wrapper.remove();
		}

		this.originalElement.css("resize", this.originalResizeStyle);
		_destroy(this.originalElement);

		return this;
	},

	_mouseCapture: function(event) {
		var i, handle,
			capture = false;

		for (i in this.handles) {
			handle = $(this.handles[i])[0];
			if (handle === event.target || $.contains(handle, event.target)) {
				capture = true;
			}
		}

		return !this.options.disabled && capture;
	},

	_mouseStart: function(event) {

		var curleft, curtop, cursor,
			o = this.options,
			iniPos = this.element.position(),
			el = this.element;

		this.resizing = true;

		// bugfix for http://dev.jquery.com/ticket/1749
		if ( (/absolute/).test( el.css("position") ) ) {
			el.css({ position: "absolute", top: el.css("top"), left: el.css("left") });
		} else if (el.is(".ui-draggable")) {
			el.css({ position: "absolute", top: iniPos.top, left: iniPos.left });
		}

		this._renderProxy();

		curleft = num(this.helper.css("left"));
		curtop = num(this.helper.css("top"));

		if (o.containment) {
			curleft += $(o.containment).scrollLeft() || 0;
			curtop += $(o.containment).scrollTop() || 0;
		}

		//Store needed variables
		this.offset = this.helper.offset();
		this.position = { left: curleft, top: curtop };
		this.size = this._helper ? { width: this.helper.width(), height: this.helper.height() } : { width: el.width(), height: el.height() };
		this.originalSize = this._helper ? { width: el.outerWidth(), height: el.outerHeight() } : { width: el.width(), height: el.height() };
		this.originalPosition = { left: curleft, top: curtop };
		this.sizeDiff = { width: el.outerWidth() - el.width(), height: el.outerHeight() - el.height() };
		this.originalMousePosition = { left: event.pageX, top: event.pageY };

		//Aspect Ratio
		this.aspectRatio = (typeof o.aspectRatio === "number") ? o.aspectRatio : ((this.originalSize.width / this.originalSize.height) || 1);

		cursor = $(".ui-resizable-" + this.axis).css("cursor");
		$("body").css("cursor", cursor === "auto" ? this.axis + "-resize" : cursor);

		el.addClass("ui-resizable-resizing");
		this._propagate("start", event);
		return true;
	},

	_mouseDrag: function(event) {

		//Increase performance, avoid regex
		var data,
			el = this.helper, props = {},
			smp = this.originalMousePosition,
			a = this.axis,
			prevTop = this.position.top,
			prevLeft = this.position.left,
			prevWidth = this.size.width,
			prevHeight = this.size.height,
			dx = (event.pageX-smp.left)||0,
			dy = (event.pageY-smp.top)||0,
			trigger = this._change[a];

		if (!trigger) {
			return false;
		}

		// Calculate the attrs that will be change
		data = trigger.apply(this, [event, dx, dy]);

		// Put this in the mouseDrag handler since the user can start pressing shift while resizing
		this._updateVirtualBoundaries(event.shiftKey);
		if (this._aspectRatio || event.shiftKey) {
			data = this._updateRatio(data, event);
		}

		data = this._respectSize(data, event);

		this._updateCache(data);

		// plugins callbacks need to be called first
		this._propagate("resize", event);

		if (this.position.top !== prevTop) {
			props.top = this.position.top + "px";
		}
		if (this.position.left !== prevLeft) {
			props.left = this.position.left + "px";
		}
		if (this.size.width !== prevWidth) {
			props.width = this.size.width + "px";
		}
		if (this.size.height !== prevHeight) {
			props.height = this.size.height + "px";
		}
		el.css(props);

		if (!this._helper && this._proportionallyResizeElements.length) {
			this._proportionallyResize();
		}

		// Call the user callback if the element was resized
		if ( ! $.isEmptyObject(props) ) {
			this._trigger("resize", event, this.ui());
		}

		return false;
	},

	_mouseStop: function(event) {

		this.resizing = false;
		var pr, ista, soffseth, soffsetw, s, left, top,
			o = this.options, that = this;

		if(this._helper) {

			pr = this._proportionallyResizeElements;
			ista = pr.length && (/textarea/i).test(pr[0].nodeName);
			soffseth = ista && $.ui.hasScroll(pr[0], "left") /* TODO - jump height */ ? 0 : that.sizeDiff.height;
			soffsetw = ista ? 0 : that.sizeDiff.width;

			s = { width: (that.helper.width()  - soffsetw), height: (that.helper.height() - soffseth) };
			left = (parseInt(that.element.css("left"), 10) + (that.position.left - that.originalPosition.left)) || null;
			top = (parseInt(that.element.css("top"), 10) + (that.position.top - that.originalPosition.top)) || null;

			if (!o.animate) {
				this.element.css($.extend(s, { top: top, left: left }));
			}

			that.helper.height(that.size.height);
			that.helper.width(that.size.width);

			if (this._helper && !o.animate) {
				this._proportionallyResize();
			}
		}

		$("body").css("cursor", "auto");

		this.element.removeClass("ui-resizable-resizing");

		this._propagate("stop", event);

		if (this._helper) {
			this.helper.remove();
		}

		return false;

	},

	_updateVirtualBoundaries: function(forceAspectRatio) {
		var pMinWidth, pMaxWidth, pMinHeight, pMaxHeight, b,
			o = this.options;

		b = {
			minWidth: isNumber(o.minWidth) ? o.minWidth : 0,
			maxWidth: isNumber(o.maxWidth) ? o.maxWidth : Infinity,
			minHeight: isNumber(o.minHeight) ? o.minHeight : 0,
			maxHeight: isNumber(o.maxHeight) ? o.maxHeight : Infinity
		};

		if(this._aspectRatio || forceAspectRatio) {
			// We want to create an enclosing box whose aspect ration is the requested one
			// First, compute the "projected" size for each dimension based on the aspect ratio and other dimension
			pMinWidth = b.minHeight * this.aspectRatio;
			pMinHeight = b.minWidth / this.aspectRatio;
			pMaxWidth = b.maxHeight * this.aspectRatio;
			pMaxHeight = b.maxWidth / this.aspectRatio;

			if(pMinWidth > b.minWidth) {
				b.minWidth = pMinWidth;
			}
			if(pMinHeight > b.minHeight) {
				b.minHeight = pMinHeight;
			}
			if(pMaxWidth < b.maxWidth) {
				b.maxWidth = pMaxWidth;
			}
			if(pMaxHeight < b.maxHeight) {
				b.maxHeight = pMaxHeight;
			}
		}
		this._vBoundaries = b;
	},

	_updateCache: function(data) {
		this.offset = this.helper.offset();
		if (isNumber(data.left)) {
			this.position.left = data.left;
		}
		if (isNumber(data.top)) {
			this.position.top = data.top;
		}
		if (isNumber(data.height)) {
			this.size.height = data.height;
		}
		if (isNumber(data.width)) {
			this.size.width = data.width;
		}
	},

	_updateRatio: function( data ) {

		var cpos = this.position,
			csize = this.size,
			a = this.axis;

		if (isNumber(data.height)) {
			data.width = (data.height * this.aspectRatio);
		} else if (isNumber(data.width)) {
			data.height = (data.width / this.aspectRatio);
		}

		if (a === "sw") {
			data.left = cpos.left + (csize.width - data.width);
			data.top = null;
		}
		if (a === "nw") {
			data.top = cpos.top + (csize.height - data.height);
			data.left = cpos.left + (csize.width - data.width);
		}

		return data;
	},

	_respectSize: function( data ) {

		var o = this._vBoundaries,
			a = this.axis,
			ismaxw = isNumber(data.width) && o.maxWidth && (o.maxWidth < data.width), ismaxh = isNumber(data.height) && o.maxHeight && (o.maxHeight < data.height),
			isminw = isNumber(data.width) && o.minWidth && (o.minWidth > data.width), isminh = isNumber(data.height) && o.minHeight && (o.minHeight > data.height),
			dw = this.originalPosition.left + this.originalSize.width,
			dh = this.position.top + this.size.height,
			cw = /sw|nw|w/.test(a), ch = /nw|ne|n/.test(a);
		if (isminw) {
			data.width = o.minWidth;
		}
		if (isminh) {
			data.height = o.minHeight;
		}
		if (ismaxw) {
			data.width = o.maxWidth;
		}
		if (ismaxh) {
			data.height = o.maxHeight;
		}

		if (isminw && cw) {
			data.left = dw - o.minWidth;
		}
		if (ismaxw && cw) {
			data.left = dw - o.maxWidth;
		}
		if (isminh && ch) {
			data.top = dh - o.minHeight;
		}
		if (ismaxh && ch) {
			data.top = dh - o.maxHeight;
		}

		// fixing jump error on top/left - bug #2330
		if (!data.width && !data.height && !data.left && data.top) {
			data.top = null;
		} else if (!data.width && !data.height && !data.top && data.left) {
			data.left = null;
		}

		return data;
	},

	_proportionallyResize: function() {

		if (!this._proportionallyResizeElements.length) {
			return;
		}

		var i, j, borders, paddings, prel,
			element = this.helper || this.element;

		for ( i=0; i < this._proportionallyResizeElements.length; i++) {

			prel = this._proportionallyResizeElements[i];

			if (!this.borderDif) {
				this.borderDif = [];
				borders = [prel.css("borderTopWidth"), prel.css("borderRightWidth"), prel.css("borderBottomWidth"), prel.css("borderLeftWidth")];
				paddings = [prel.css("paddingTop"), prel.css("paddingRight"), prel.css("paddingBottom"), prel.css("paddingLeft")];

				for ( j = 0; j < borders.length; j++ ) {
					this.borderDif[ j ] = ( parseInt( borders[ j ], 10 ) || 0 ) + ( parseInt( paddings[ j ], 10 ) || 0 );
				}
			}

			prel.css({
				height: (element.height() - this.borderDif[0] - this.borderDif[2]) || 0,
				width: (element.width() - this.borderDif[1] - this.borderDif[3]) || 0
			});

		}

	},

	_renderProxy: function() {

		var el = this.element, o = this.options;
		this.elementOffset = el.offset();

		if(this._helper) {

			this.helper = this.helper || $("<div style='overflow:hidden;'></div>");

			this.helper.addClass(this._helper).css({
				width: this.element.outerWidth() - 1,
				height: this.element.outerHeight() - 1,
				position: "absolute",
				left: this.elementOffset.left +"px",
				top: this.elementOffset.top +"px",
				zIndex: ++o.zIndex //TODO: Don't modify option
			});

			this.helper
				.appendTo("body")
				.disableSelection();

		} else {
			this.helper = this.element;
		}

	},

	_change: {
		e: function(event, dx) {
			return { width: this.originalSize.width + dx };
		},
		w: function(event, dx) {
			var cs = this.originalSize, sp = this.originalPosition;
			return { left: sp.left + dx, width: cs.width - dx };
		},
		n: function(event, dx, dy) {
			var cs = this.originalSize, sp = this.originalPosition;
			return { top: sp.top + dy, height: cs.height - dy };
		},
		s: function(event, dx, dy) {
			return { height: this.originalSize.height + dy };
		},
		se: function(event, dx, dy) {
			return $.extend(this._change.s.apply(this, arguments), this._change.e.apply(this, [event, dx, dy]));
		},
		sw: function(event, dx, dy) {
			return $.extend(this._change.s.apply(this, arguments), this._change.w.apply(this, [event, dx, dy]));
		},
		ne: function(event, dx, dy) {
			return $.extend(this._change.n.apply(this, arguments), this._change.e.apply(this, [event, dx, dy]));
		},
		nw: function(event, dx, dy) {
			return $.extend(this._change.n.apply(this, arguments), this._change.w.apply(this, [event, dx, dy]));
		}
	},

	_propagate: function(n, event) {
		$.ui.plugin.call(this, n, [event, this.ui()]);
		(n !== "resize" && this._trigger(n, event, this.ui()));
	},

	plugins: {},

	ui: function() {
		return {
			originalElement: this.originalElement,
			element: this.element,
			helper: this.helper,
			position: this.position,
			size: this.size,
			originalSize: this.originalSize,
			originalPosition: this.originalPosition
		};
	}

});

/*
 * Resizable Extensions
 */

$.ui.plugin.add("resizable", "animate", {

	stop: function( event ) {
		var that = $(this).data("ui-resizable"),
			o = that.options,
			pr = that._proportionallyResizeElements,
			ista = pr.length && (/textarea/i).test(pr[0].nodeName),
			soffseth = ista && $.ui.hasScroll(pr[0], "left") /* TODO - jump height */ ? 0 : that.sizeDiff.height,
			soffsetw = ista ? 0 : that.sizeDiff.width,
			style = { width: (that.size.width - soffsetw), height: (that.size.height - soffseth) },
			left = (parseInt(that.element.css("left"), 10) + (that.position.left - that.originalPosition.left)) || null,
			top = (parseInt(that.element.css("top"), 10) + (that.position.top - that.originalPosition.top)) || null;

		that.element.animate(
			$.extend(style, top && left ? { top: top, left: left } : {}), {
				duration: o.animateDuration,
				easing: o.animateEasing,
				step: function() {

					var data = {
						width: parseInt(that.element.css("width"), 10),
						height: parseInt(that.element.css("height"), 10),
						top: parseInt(that.element.css("top"), 10),
						left: parseInt(that.element.css("left"), 10)
					};

					if (pr && pr.length) {
						$(pr[0]).css({ width: data.width, height: data.height });
					}

					// propagating resize, and updating values for each animation step
					that._updateCache(data);
					that._propagate("resize", event);

				}
			}
		);
	}

});

$.ui.plugin.add("resizable", "containment", {

	start: function() {
		var element, p, co, ch, cw, width, height,
			that = $(this).data("ui-resizable"),
			o = that.options,
			el = that.element,
			oc = o.containment,
			ce = (oc instanceof $) ? oc.get(0) : (/parent/.test(oc)) ? el.parent().get(0) : oc;

		if (!ce) {
			return;
		}

		that.containerElement = $(ce);

		if (/document/.test(oc) || oc === document) {
			that.containerOffset = { left: 0, top: 0 };
			that.containerPosition = { left: 0, top: 0 };

			that.parentData = {
				element: $(document), left: 0, top: 0,
				width: $(document).width(), height: $(document).height() || document.body.parentNode.scrollHeight
			};
		}

		// i'm a node, so compute top, left, right, bottom
		else {
			element = $(ce);
			p = [];
			$([ "Top", "Right", "Left", "Bottom" ]).each(function(i, name) { p[i] = num(element.css("padding" + name)); });

			that.containerOffset = element.offset();
			that.containerPosition = element.position();
			that.containerSize = { height: (element.innerHeight() - p[3]), width: (element.innerWidth() - p[1]) };

			co = that.containerOffset;
			ch = that.containerSize.height;
			cw = that.containerSize.width;
			width = ($.ui.hasScroll(ce, "left") ? ce.scrollWidth : cw );
			height = ($.ui.hasScroll(ce) ? ce.scrollHeight : ch);

			that.parentData = {
				element: ce, left: co.left, top: co.top, width: width, height: height
			};
		}
	},

	resize: function( event ) {
		var woset, hoset, isParent, isOffsetRelative,
			that = $(this).data("ui-resizable"),
			o = that.options,
			co = that.containerOffset, cp = that.position,
			pRatio = that._aspectRatio || event.shiftKey,
			cop = { top:0, left:0 }, ce = that.containerElement;

		if (ce[0] !== document && (/static/).test(ce.css("position"))) {
			cop = co;
		}

		if (cp.left < (that._helper ? co.left : 0)) {
			that.size.width = that.size.width + (that._helper ? (that.position.left - co.left) : (that.position.left - cop.left));
			if (pRatio) {
				that.size.height = that.size.width / that.aspectRatio;
			}
			that.position.left = o.helper ? co.left : 0;
		}

		if (cp.top < (that._helper ? co.top : 0)) {
			that.size.height = that.size.height + (that._helper ? (that.position.top - co.top) : that.position.top);
			if (pRatio) {
				that.size.width = that.size.height * that.aspectRatio;
			}
			that.position.top = that._helper ? co.top : 0;
		}

		that.offset.left = that.parentData.left+that.position.left;
		that.offset.top = that.parentData.top+that.position.top;

		woset = Math.abs( (that._helper ? that.offset.left - cop.left : (that.offset.left - cop.left)) + that.sizeDiff.width );
		hoset = Math.abs( (that._helper ? that.offset.top - cop.top : (that.offset.top - co.top)) + that.sizeDiff.height );

		isParent = that.containerElement.get(0) === that.element.parent().get(0);
		isOffsetRelative = /relative|absolute/.test(that.containerElement.css("position"));

		if ( isParent && isOffsetRelative ) {
			woset -= Math.abs( that.parentData.left );
		}

		if (woset + that.size.width >= that.parentData.width) {
			that.size.width = that.parentData.width - woset;
			if (pRatio) {
				that.size.height = that.size.width / that.aspectRatio;
			}
		}

		if (hoset + that.size.height >= that.parentData.height) {
			that.size.height = that.parentData.height - hoset;
			if (pRatio) {
				that.size.width = that.size.height * that.aspectRatio;
			}
		}
	},

	stop: function(){
		var that = $(this).data("ui-resizable"),
			o = that.options,
			co = that.containerOffset,
			cop = that.containerPosition,
			ce = that.containerElement,
			helper = $(that.helper),
			ho = helper.offset(),
			w = helper.outerWidth() - that.sizeDiff.width,
			h = helper.outerHeight() - that.sizeDiff.height;

		if (that._helper && !o.animate && (/relative/).test(ce.css("position"))) {
			$(this).css({ left: ho.left - cop.left - co.left, width: w, height: h });
		}

		if (that._helper && !o.animate && (/static/).test(ce.css("position"))) {
			$(this).css({ left: ho.left - cop.left - co.left, width: w, height: h });
		}

	}
});

$.ui.plugin.add("resizable", "alsoResize", {

	start: function () {
		var that = $(this).data("ui-resizable"),
			o = that.options,
			_store = function (exp) {
				$(exp).each(function() {
					var el = $(this);
					el.data("ui-resizable-alsoresize", {
						width: parseInt(el.width(), 10), height: parseInt(el.height(), 10),
						left: parseInt(el.css("left"), 10), top: parseInt(el.css("top"), 10)
					});
				});
			};

		if (typeof(o.alsoResize) === "object" && !o.alsoResize.parentNode) {
			if (o.alsoResize.length) { o.alsoResize = o.alsoResize[0]; _store(o.alsoResize); }
			else { $.each(o.alsoResize, function (exp) { _store(exp); }); }
		}else{
			_store(o.alsoResize);
		}
	},

	resize: function (event, ui) {
		var that = $(this).data("ui-resizable"),
			o = that.options,
			os = that.originalSize,
			op = that.originalPosition,
			delta = {
				height: (that.size.height - os.height) || 0, width: (that.size.width - os.width) || 0,
				top: (that.position.top - op.top) || 0, left: (that.position.left - op.left) || 0
			},

			_alsoResize = function (exp, c) {
				$(exp).each(function() {
					var el = $(this), start = $(this).data("ui-resizable-alsoresize"), style = {},
						css = c && c.length ? c : el.parents(ui.originalElement[0]).length ? ["width", "height"] : ["width", "height", "top", "left"];

					$.each(css, function (i, prop) {
						var sum = (start[prop]||0) + (delta[prop]||0);
						if (sum && sum >= 0) {
							style[prop] = sum || null;
						}
					});

					el.css(style);
				});
			};

		if (typeof(o.alsoResize) === "object" && !o.alsoResize.nodeType) {
			$.each(o.alsoResize, function (exp, c) { _alsoResize(exp, c); });
		}else{
			_alsoResize(o.alsoResize);
		}
	},

	stop: function () {
		$(this).removeData("resizable-alsoresize");
	}
});

$.ui.plugin.add("resizable", "ghost", {

	start: function() {

		var that = $(this).data("ui-resizable"), o = that.options, cs = that.size;

		that.ghost = that.originalElement.clone();
		that.ghost
			.css({ opacity: 0.25, display: "block", position: "relative", height: cs.height, width: cs.width, margin: 0, left: 0, top: 0 })
			.addClass("ui-resizable-ghost")
			.addClass(typeof o.ghost === "string" ? o.ghost : "");

		that.ghost.appendTo(that.helper);

	},

	resize: function(){
		var that = $(this).data("ui-resizable");
		if (that.ghost) {
			that.ghost.css({ position: "relative", height: that.size.height, width: that.size.width });
		}
	},

	stop: function() {
		var that = $(this).data("ui-resizable");
		if (that.ghost && that.helper) {
			that.helper.get(0).removeChild(that.ghost.get(0));
		}
	}

});

$.ui.plugin.add("resizable", "grid", {

	resize: function() {
		var that = $(this).data("ui-resizable"),
			o = that.options,
			cs = that.size,
			os = that.originalSize,
			op = that.originalPosition,
			a = that.axis,
			grid = typeof o.grid === "number" ? [o.grid, o.grid] : o.grid,
			gridX = (grid[0]||1),
			gridY = (grid[1]||1),
			ox = Math.round((cs.width - os.width) / gridX) * gridX,
			oy = Math.round((cs.height - os.height) / gridY) * gridY,
			newWidth = os.width + ox,
			newHeight = os.height + oy,
			isMaxWidth = o.maxWidth && (o.maxWidth < newWidth),
			isMaxHeight = o.maxHeight && (o.maxHeight < newHeight),
			isMinWidth = o.minWidth && (o.minWidth > newWidth),
			isMinHeight = o.minHeight && (o.minHeight > newHeight);

		o.grid = grid;

		if (isMinWidth) {
			newWidth = newWidth + gridX;
		}
		if (isMinHeight) {
			newHeight = newHeight + gridY;
		}
		if (isMaxWidth) {
			newWidth = newWidth - gridX;
		}
		if (isMaxHeight) {
			newHeight = newHeight - gridY;
		}

		if (/^(se|s|e)$/.test(a)) {
			that.size.width = newWidth;
			that.size.height = newHeight;
		} else if (/^(ne)$/.test(a)) {
			that.size.width = newWidth;
			that.size.height = newHeight;
			that.position.top = op.top - oy;
		} else if (/^(sw)$/.test(a)) {
			that.size.width = newWidth;
			that.size.height = newHeight;
			that.position.left = op.left - ox;
		} else {
			if ( newHeight - gridY > 0 ) {
				that.size.height = newHeight;
				that.position.top = op.top - oy;
			} else {
				that.size.height = gridY;
				that.position.top = op.top + os.height - gridY;
			}
			if ( newWidth - gridX > 0 ) {
				that.size.width = newWidth;
				that.position.left = op.left - ox;
			} else {
				that.size.width = gridX;
				that.position.left = op.left + os.width - gridX;
			}
		}
	}

});

})(jQuery);
(function( $, undefined ) {

$.widget("ui.selectable", $.ui.mouse, {
	version: "1.10.4",
	options: {
		appendTo: "body",
		autoRefresh: true,
		distance: 0,
		filter: "*",
		tolerance: "touch",

		// callbacks
		selected: null,
		selecting: null,
		start: null,
		stop: null,
		unselected: null,
		unselecting: null
	},
	_create: function() {
		var selectees,
			that = this;

		this.element.addClass("ui-selectable");

		this.dragged = false;

		// cache selectee children based on filter
		this.refresh = function() {
			selectees = $(that.options.filter, that.element[0]);
			selectees.addClass("ui-selectee");
			selectees.each(function() {
				var $this = $(this),
					pos = $this.offset();
				$.data(this, "selectable-item", {
					element: this,
					$element: $this,
					left: pos.left,
					top: pos.top,
					right: pos.left + $this.outerWidth(),
					bottom: pos.top + $this.outerHeight(),
					startselected: false,
					selected: $this.hasClass("ui-selected"),
					selecting: $this.hasClass("ui-selecting"),
					unselecting: $this.hasClass("ui-unselecting")
				});
			});
		};
		this.refresh();

		this.selectees = selectees.addClass("ui-selectee");

		this._mouseInit();

		this.helper = $("<div class='ui-selectable-helper'></div>");
	},

	_destroy: function() {
		this.selectees
			.removeClass("ui-selectee")
			.removeData("selectable-item");
		this.element
			.removeClass("ui-selectable ui-selectable-disabled");
		this._mouseDestroy();
	},

	_mouseStart: function(event) {
		var that = this,
			options = this.options;

		this.opos = [event.pageX, event.pageY];

		if (this.options.disabled) {
			return;
		}

		this.selectees = $(options.filter, this.element[0]);

		this._trigger("start", event);

		$(options.appendTo).append(this.helper);
		// position helper (lasso)
		this.helper.css({
			"left": event.pageX,
			"top": event.pageY,
			"width": 0,
			"height": 0
		});

		if (options.autoRefresh) {
			this.refresh();
		}

		this.selectees.filter(".ui-selected").each(function() {
			var selectee = $.data(this, "selectable-item");
			selectee.startselected = true;
			if (!event.metaKey && !event.ctrlKey) {
				selectee.$element.removeClass("ui-selected");
				selectee.selected = false;
				selectee.$element.addClass("ui-unselecting");
				selectee.unselecting = true;
				// selectable UNSELECTING callback
				that._trigger("unselecting", event, {
					unselecting: selectee.element
				});
			}
		});

		$(event.target).parents().addBack().each(function() {
			var doSelect,
				selectee = $.data(this, "selectable-item");
			if (selectee) {
				doSelect = (!event.metaKey && !event.ctrlKey) || !selectee.$element.hasClass("ui-selected");
				selectee.$element
					.removeClass(doSelect ? "ui-unselecting" : "ui-selected")
					.addClass(doSelect ? "ui-selecting" : "ui-unselecting");
				selectee.unselecting = !doSelect;
				selectee.selecting = doSelect;
				selectee.selected = doSelect;
				// selectable (UN)SELECTING callback
				if (doSelect) {
					that._trigger("selecting", event, {
						selecting: selectee.element
					});
				} else {
					that._trigger("unselecting", event, {
						unselecting: selectee.element
					});
				}
				return false;
			}
		});

	},

	_mouseDrag: function(event) {

		this.dragged = true;

		if (this.options.disabled) {
			return;
		}

		var tmp,
			that = this,
			options = this.options,
			x1 = this.opos[0],
			y1 = this.opos[1],
			x2 = event.pageX,
			y2 = event.pageY;

		if (x1 > x2) { tmp = x2; x2 = x1; x1 = tmp; }
		if (y1 > y2) { tmp = y2; y2 = y1; y1 = tmp; }
		this.helper.css({left: x1, top: y1, width: x2-x1, height: y2-y1});

		this.selectees.each(function() {
			var selectee = $.data(this, "selectable-item"),
				hit = false;

			//prevent helper from being selected if appendTo: selectable
			if (!selectee || selectee.element === that.element[0]) {
				return;
			}

			if (options.tolerance === "touch") {
				hit = ( !(selectee.left > x2 || selectee.right < x1 || selectee.top > y2 || selectee.bottom < y1) );
			} else if (options.tolerance === "fit") {
				hit = (selectee.left > x1 && selectee.right < x2 && selectee.top > y1 && selectee.bottom < y2);
			}

			if (hit) {
				// SELECT
				if (selectee.selected) {
					selectee.$element.removeClass("ui-selected");
					selectee.selected = false;
				}
				if (selectee.unselecting) {
					selectee.$element.removeClass("ui-unselecting");
					selectee.unselecting = false;
				}
				if (!selectee.selecting) {
					selectee.$element.addClass("ui-selecting");
					selectee.selecting = true;
					// selectable SELECTING callback
					that._trigger("selecting", event, {
						selecting: selectee.element
					});
				}
			} else {
				// UNSELECT
				if (selectee.selecting) {
					if ((event.metaKey || event.ctrlKey) && selectee.startselected) {
						selectee.$element.removeClass("ui-selecting");
						selectee.selecting = false;
						selectee.$element.addClass("ui-selected");
						selectee.selected = true;
					} else {
						selectee.$element.removeClass("ui-selecting");
						selectee.selecting = false;
						if (selectee.startselected) {
							selectee.$element.addClass("ui-unselecting");
							selectee.unselecting = true;
						}
						// selectable UNSELECTING callback
						that._trigger("unselecting", event, {
							unselecting: selectee.element
						});
					}
				}
				if (selectee.selected) {
					if (!event.metaKey && !event.ctrlKey && !selectee.startselected) {
						selectee.$element.removeClass("ui-selected");
						selectee.selected = false;

						selectee.$element.addClass("ui-unselecting");
						selectee.unselecting = true;
						// selectable UNSELECTING callback
						that._trigger("unselecting", event, {
							unselecting: selectee.element
						});
					}
				}
			}
		});

		return false;
	},

	_mouseStop: function(event) {
		var that = this;

		this.dragged = false;

		$(".ui-unselecting", this.element[0]).each(function() {
			var selectee = $.data(this, "selectable-item");
			selectee.$element.removeClass("ui-unselecting");
			selectee.unselecting = false;
			selectee.startselected = false;
			that._trigger("unselected", event, {
				unselected: selectee.element
			});
		});
		$(".ui-selecting", this.element[0]).each(function() {
			var selectee = $.data(this, "selectable-item");
			selectee.$element.removeClass("ui-selecting").addClass("ui-selected");
			selectee.selecting = false;
			selectee.selected = true;
			selectee.startselected = true;
			that._trigger("selected", event, {
				selected: selectee.element
			});
		});
		this._trigger("stop", event);

		this.helper.remove();

		return false;
	}

});

})(jQuery);
(function( $, undefined ) {

function isOverAxis( x, reference, size ) {
	return ( x > reference ) && ( x < ( reference + size ) );
}

function isFloating(item) {
	return (/left|right/).test(item.css("float")) || (/inline|table-cell/).test(item.css("display"));
}

$.widget("ui.sortable", $.ui.mouse, {
	version: "1.10.4",
	widgetEventPrefix: "sort",
	ready: false,
	options: {
		appendTo: "parent",
		axis: false,
		connectWith: false,
		containment: false,
		cursor: "auto",
		cursorAt: false,
		dropOnEmpty: true,
		forcePlaceholderSize: false,
		forceHelperSize: false,
		grid: false,
		handle: false,
		helper: "original",
		items: "> *",
		opacity: false,
		placeholder: false,
		revert: false,
		scroll: true,
		scrollSensitivity: 20,
		scrollSpeed: 20,
		scope: "default",
		tolerance: "intersect",
		zIndex: 1000,

		// callbacks
		activate: null,
		beforeStop: null,
		change: null,
		deactivate: null,
		out: null,
		over: null,
		receive: null,
		remove: null,
		sort: null,
		start: null,
		stop: null,
		update: null
	},
	_create: function() {

		var o = this.options;
		this.containerCache = {};
		this.element.addClass("ui-sortable");

		//Get the items
		this.refresh();

		//Let's determine if the items are being displayed horizontally
		this.floating = this.items.length ? o.axis === "x" || isFloating(this.items[0].item) : false;

		//Let's determine the parent's offset
		this.offset = this.element.offset();

		//Initialize mouse events for interaction
		this._mouseInit();

		//We're ready to go
		this.ready = true;

	},

	_destroy: function() {
		this.element
			.removeClass("ui-sortable ui-sortable-disabled");
		this._mouseDestroy();

		for ( var i = this.items.length - 1; i >= 0; i-- ) {
			this.items[i].item.removeData(this.widgetName + "-item");
		}

		return this;
	},

	_setOption: function(key, value){
		if ( key === "disabled" ) {
			this.options[ key ] = value;

			this.widget().toggleClass( "ui-sortable-disabled", !!value );
		} else {
			// Don't call widget base _setOption for disable as it adds ui-state-disabled class
			$.Widget.prototype._setOption.apply(this, arguments);
		}
	},

	_mouseCapture: function(event, overrideHandle) {
		var currentItem = null,
			validHandle = false,
			that = this;

		if (this.reverting) {
			return false;
		}

		if(this.options.disabled || this.options.type === "static") {
			return false;
		}

		//We have to refresh the items data once first
		this._refreshItems(event);

		//Find out if the clicked node (or one of its parents) is a actual item in this.items
		$(event.target).parents().each(function() {
			if($.data(this, that.widgetName + "-item") === that) {
				currentItem = $(this);
				return false;
			}
		});
		if($.data(event.target, that.widgetName + "-item") === that) {
			currentItem = $(event.target);
		}

		if(!currentItem) {
			return false;
		}
		if(this.options.handle && !overrideHandle) {
			$(this.options.handle, currentItem).find("*").addBack().each(function() {
				if(this === event.target) {
					validHandle = true;
				}
			});
			if(!validHandle) {
				return false;
			}
		}

		this.currentItem = currentItem;
		this._removeCurrentsFromItems();
		return true;

	},

	_mouseStart: function(event, overrideHandle, noActivation) {

		var i, body,
			o = this.options;

		this.currentContainer = this;

		//We only need to call refreshPositions, because the refreshItems call has been moved to mouseCapture
		this.refreshPositions();

		//Create and append the visible helper
		this.helper = this._createHelper(event);

		//Cache the helper size
		this._cacheHelperProportions();

		/*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 */

		//Cache the margins of the original element
		this._cacheMargins();

		//Get the next scrolling parent
		this.scrollParent = this.helper.scrollParent();

		//The element's absolute position on the page minus margins
		this.offset = this.currentItem.offset();
		this.offset = {
			top: this.offset.top - this.margins.top,
			left: this.offset.left - this.margins.left
		};

		$.extend(this.offset, {
			click: { //Where the click happened, relative to the element
				left: event.pageX - this.offset.left,
				top: event.pageY - this.offset.top
			},
			parent: this._getParentOffset(),
			relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
		});

		// Only after we got the offset, we can change the helper's position to absolute
		// TODO: Still need to figure out a way to make relative sorting possible
		this.helper.css("position", "absolute");
		this.cssPosition = this.helper.css("position");

		//Generate the original position
		this.originalPosition = this._generatePosition(event);
		this.originalPageX = event.pageX;
		this.originalPageY = event.pageY;

		//Adjust the mouse offset relative to the helper if "cursorAt" is supplied
		(o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

		//Cache the former DOM position
		this.domPosition = { prev: this.currentItem.prev()[0], parent: this.currentItem.parent()[0] };

		//If the helper is not the original, hide the original so it's not playing any role during the drag, won't cause anything bad this way
		if(this.helper[0] !== this.currentItem[0]) {
			this.currentItem.hide();
		}

		//Create the placeholder
		this._createPlaceholder();

		//Set a containment if given in the options
		if(o.containment) {
			this._setContainment();
		}

		if( o.cursor && o.cursor !== "auto" ) { // cursor option
			body = this.document.find( "body" );

			// support: IE
			this.storedCursor = body.css( "cursor" );
			body.css( "cursor", o.cursor );

			this.storedStylesheet = $( "<style>*{ cursor: "+o.cursor+" !important; }</style>" ).appendTo( body );
		}

		if(o.opacity) { // opacity option
			if (this.helper.css("opacity")) {
				this._storedOpacity = this.helper.css("opacity");
			}
			this.helper.css("opacity", o.opacity);
		}

		if(o.zIndex) { // zIndex option
			if (this.helper.css("zIndex")) {
				this._storedZIndex = this.helper.css("zIndex");
			}
			this.helper.css("zIndex", o.zIndex);
		}

		//Prepare scrolling
		if(this.scrollParent[0] !== document && this.scrollParent[0].tagName !== "HTML") {
			this.overflowOffset = this.scrollParent.offset();
		}

		//Call callbacks
		this._trigger("start", event, this._uiHash());

		//Recache the helper size
		if(!this._preserveHelperProportions) {
			this._cacheHelperProportions();
		}


		//Post "activate" events to possible containers
		if( !noActivation ) {
			for ( i = this.containers.length - 1; i >= 0; i-- ) {
				this.containers[ i ]._trigger( "activate", event, this._uiHash( this ) );
			}
		}

		//Prepare possible droppables
		if($.ui.ddmanager) {
			$.ui.ddmanager.current = this;
		}

		if ($.ui.ddmanager && !o.dropBehaviour) {
			$.ui.ddmanager.prepareOffsets(this, event);
		}

		this.dragging = true;

		this.helper.addClass("ui-sortable-helper");
		this._mouseDrag(event); //Execute the drag once - this causes the helper not to be visible before getting its correct position
		return true;

	},

	_mouseDrag: function(event) {
		var i, item, itemElement, intersection,
			o = this.options,
			scrolled = false;

		//Compute the helpers position
		this.position = this._generatePosition(event);
		this.positionAbs = this._convertPositionTo("absolute");

		if (!this.lastPositionAbs) {
			this.lastPositionAbs = this.positionAbs;
		}

		//Do scrolling
		if(this.options.scroll) {
			if(this.scrollParent[0] !== document && this.scrollParent[0].tagName !== "HTML") {

				if((this.overflowOffset.top + this.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity) {
					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop + o.scrollSpeed;
				} else if(event.pageY - this.overflowOffset.top < o.scrollSensitivity) {
					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop - o.scrollSpeed;
				}

				if((this.overflowOffset.left + this.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity) {
					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft + o.scrollSpeed;
				} else if(event.pageX - this.overflowOffset.left < o.scrollSensitivity) {
					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft - o.scrollSpeed;
				}

			} else {

				if(event.pageY - $(document).scrollTop() < o.scrollSensitivity) {
					scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
				} else if($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity) {
					scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);
				}

				if(event.pageX - $(document).scrollLeft() < o.scrollSensitivity) {
					scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
				} else if($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity) {
					scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);
				}

			}

			if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour) {
				$.ui.ddmanager.prepareOffsets(this, event);
			}
		}

		//Regenerate the absolute position used for position checks
		this.positionAbs = this._convertPositionTo("absolute");

		//Set the helper position
		if(!this.options.axis || this.options.axis !== "y") {
			this.helper[0].style.left = this.position.left+"px";
		}
		if(!this.options.axis || this.options.axis !== "x") {
			this.helper[0].style.top = this.position.top+"px";
		}

		//Rearrange
		for (i = this.items.length - 1; i >= 0; i--) {

			//Cache variables and intersection, continue if no intersection
			item = this.items[i];
			itemElement = item.item[0];
			intersection = this._intersectsWithPointer(item);
			if (!intersection) {
				continue;
			}

			// Only put the placeholder inside the current Container, skip all
			// items from other containers. This works because when moving
			// an item from one container to another the
			// currentContainer is switched before the placeholder is moved.
			//
			// Without this, moving items in "sub-sortables" can cause
			// the placeholder to jitter beetween the outer and inner container.
			if (item.instance !== this.currentContainer) {
				continue;
			}

			// cannot intersect with itself
			// no useless actions that have been done before
			// no action if the item moved is the parent of the item checked
			if (itemElement !== this.currentItem[0] &&
				this.placeholder[intersection === 1 ? "next" : "prev"]()[0] !== itemElement &&
				!$.contains(this.placeholder[0], itemElement) &&
				(this.options.type === "semi-dynamic" ? !$.contains(this.element[0], itemElement) : true)
			) {

				this.direction = intersection === 1 ? "down" : "up";

				if (this.options.tolerance === "pointer" || this._intersectsWithSides(item)) {
					this._rearrange(event, item);
				} else {
					break;
				}

				this._trigger("change", event, this._uiHash());
				break;
			}
		}

		//Post events to containers
		this._contactContainers(event);

		//Interconnect with droppables
		if($.ui.ddmanager) {
			$.ui.ddmanager.drag(this, event);
		}

		//Call callbacks
		this._trigger("sort", event, this._uiHash());

		this.lastPositionAbs = this.positionAbs;
		return false;

	},

	_mouseStop: function(event, noPropagation) {

		if(!event) {
			return;
		}

		//If we are using droppables, inform the manager about the drop
		if ($.ui.ddmanager && !this.options.dropBehaviour) {
			$.ui.ddmanager.drop(this, event);
		}

		if(this.options.revert) {
			var that = this,
				cur = this.placeholder.offset(),
				axis = this.options.axis,
				animation = {};

			if ( !axis || axis === "x" ) {
				animation.left = cur.left - this.offset.parent.left - this.margins.left + (this.offsetParent[0] === document.body ? 0 : this.offsetParent[0].scrollLeft);
			}
			if ( !axis || axis === "y" ) {
				animation.top = cur.top - this.offset.parent.top - this.margins.top + (this.offsetParent[0] === document.body ? 0 : this.offsetParent[0].scrollTop);
			}
			this.reverting = true;
			$(this.helper).animate( animation, parseInt(this.options.revert, 10) || 500, function() {
				that._clear(event);
			});
		} else {
			this._clear(event, noPropagation);
		}

		return false;

	},

	cancel: function() {

		if(this.dragging) {

			this._mouseUp({ target: null });

			if(this.options.helper === "original") {
				this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
			} else {
				this.currentItem.show();
			}

			//Post deactivating events to containers
			for (var i = this.containers.length - 1; i >= 0; i--){
				this.containers[i]._trigger("deactivate", null, this._uiHash(this));
				if(this.containers[i].containerCache.over) {
					this.containers[i]._trigger("out", null, this._uiHash(this));
					this.containers[i].containerCache.over = 0;
				}
			}

		}

		if (this.placeholder) {
			//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
			if(this.placeholder[0].parentNode) {
				this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
			}
			if(this.options.helper !== "original" && this.helper && this.helper[0].parentNode) {
				this.helper.remove();
			}

			$.extend(this, {
				helper: null,
				dragging: false,
				reverting: false,
				_noFinalSort: null
			});

			if(this.domPosition.prev) {
				$(this.domPosition.prev).after(this.currentItem);
			} else {
				$(this.domPosition.parent).prepend(this.currentItem);
			}
		}

		return this;

	},

	serialize: function(o) {

		var items = this._getItemsAsjQuery(o && o.connected),
			str = [];
		o = o || {};

		$(items).each(function() {
			var res = ($(o.item || this).attr(o.attribute || "id") || "").match(o.expression || (/(.+)[\-=_](.+)/));
			if (res) {
				str.push((o.key || res[1]+"[]")+"="+(o.key && o.expression ? res[1] : res[2]));
			}
		});

		if(!str.length && o.key) {
			str.push(o.key + "=");
		}

		return str.join("&");

	},

	toArray: function(o) {

		var items = this._getItemsAsjQuery(o && o.connected),
			ret = [];

		o = o || {};

		items.each(function() { ret.push($(o.item || this).attr(o.attribute || "id") || ""); });
		return ret;

	},

	/* Be careful with the following core functions */
	_intersectsWith: function(item) {

		var x1 = this.positionAbs.left,
			x2 = x1 + this.helperProportions.width,
			y1 = this.positionAbs.top,
			y2 = y1 + this.helperProportions.height,
			l = item.left,
			r = l + item.width,
			t = item.top,
			b = t + item.height,
			dyClick = this.offset.click.top,
			dxClick = this.offset.click.left,
			isOverElementHeight = ( this.options.axis === "x" ) || ( ( y1 + dyClick ) > t && ( y1 + dyClick ) < b ),
			isOverElementWidth = ( this.options.axis === "y" ) || ( ( x1 + dxClick ) > l && ( x1 + dxClick ) < r ),
			isOverElement = isOverElementHeight && isOverElementWidth;

		if ( this.options.tolerance === "pointer" ||
			this.options.forcePointerForContainers ||
			(this.options.tolerance !== "pointer" && this.helperProportions[this.floating ? "width" : "height"] > item[this.floating ? "width" : "height"])
		) {
			return isOverElement;
		} else {

			return (l < x1 + (this.helperProportions.width / 2) && // Right Half
				x2 - (this.helperProportions.width / 2) < r && // Left Half
				t < y1 + (this.helperProportions.height / 2) && // Bottom Half
				y2 - (this.helperProportions.height / 2) < b ); // Top Half

		}
	},

	_intersectsWithPointer: function(item) {

		var isOverElementHeight = (this.options.axis === "x") || isOverAxis(this.positionAbs.top + this.offset.click.top, item.top, item.height),
			isOverElementWidth = (this.options.axis === "y") || isOverAxis(this.positionAbs.left + this.offset.click.left, item.left, item.width),
			isOverElement = isOverElementHeight && isOverElementWidth,
			verticalDirection = this._getDragVerticalDirection(),
			horizontalDirection = this._getDragHorizontalDirection();

		if (!isOverElement) {
			return false;
		}

		return this.floating ?
			( ((horizontalDirection && horizontalDirection === "right") || verticalDirection === "down") ? 2 : 1 )
			: ( verticalDirection && (verticalDirection === "down" ? 2 : 1) );

	},

	_intersectsWithSides: function(item) {

		var isOverBottomHalf = isOverAxis(this.positionAbs.top + this.offset.click.top, item.top + (item.height/2), item.height),
			isOverRightHalf = isOverAxis(this.positionAbs.left + this.offset.click.left, item.left + (item.width/2), item.width),
			verticalDirection = this._getDragVerticalDirection(),
			horizontalDirection = this._getDragHorizontalDirection();

		if (this.floating && horizontalDirection) {
			return ((horizontalDirection === "right" && isOverRightHalf) || (horizontalDirection === "left" && !isOverRightHalf));
		} else {
			return verticalDirection && ((verticalDirection === "down" && isOverBottomHalf) || (verticalDirection === "up" && !isOverBottomHalf));
		}

	},

	_getDragVerticalDirection: function() {
		var delta = this.positionAbs.top - this.lastPositionAbs.top;
		return delta !== 0 && (delta > 0 ? "down" : "up");
	},

	_getDragHorizontalDirection: function() {
		var delta = this.positionAbs.left - this.lastPositionAbs.left;
		return delta !== 0 && (delta > 0 ? "right" : "left");
	},

	refresh: function(event) {
		this._refreshItems(event);
		this.refreshPositions();
		return this;
	},

	_connectWith: function() {
		var options = this.options;
		return options.connectWith.constructor === String ? [options.connectWith] : options.connectWith;
	},

	_getItemsAsjQuery: function(connected) {

		var i, j, cur, inst,
			items = [],
			queries = [],
			connectWith = this._connectWith();

		if(connectWith && connected) {
			for (i = connectWith.length - 1; i >= 0; i--){
				cur = $(connectWith[i]);
				for ( j = cur.length - 1; j >= 0; j--){
					inst = $.data(cur[j], this.widgetFullName);
					if(inst && inst !== this && !inst.options.disabled) {
						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element) : $(inst.options.items, inst.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), inst]);
					}
				}
			}
		}

		queries.push([$.isFunction(this.options.items) ? this.options.items.call(this.element, null, { options: this.options, item: this.currentItem }) : $(this.options.items, this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), this]);

		function addItems() {
			items.push( this );
		}
		for (i = queries.length - 1; i >= 0; i--){
			queries[i][0].each( addItems );
		}

		return $(items);

	},

	_removeCurrentsFromItems: function() {

		var list = this.currentItem.find(":data(" + this.widgetName + "-item)");

		this.items = $.grep(this.items, function (item) {
			for (var j=0; j < list.length; j++) {
				if(list[j] === item.item[0]) {
					return false;
				}
			}
			return true;
		});

	},

	_refreshItems: function(event) {

		this.items = [];
		this.containers = [this];

		var i, j, cur, inst, targetData, _queries, item, queriesLength,
			items = this.items,
			queries = [[$.isFunction(this.options.items) ? this.options.items.call(this.element[0], event, { item: this.currentItem }) : $(this.options.items, this.element), this]],
			connectWith = this._connectWith();

		if(connectWith && this.ready) { //Shouldn't be run the first time through due to massive slow-down
			for (i = connectWith.length - 1; i >= 0; i--){
				cur = $(connectWith[i]);
				for (j = cur.length - 1; j >= 0; j--){
					inst = $.data(cur[j], this.widgetFullName);
					if(inst && inst !== this && !inst.options.disabled) {
						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element[0], event, { item: this.currentItem }) : $(inst.options.items, inst.element), inst]);
						this.containers.push(inst);
					}
				}
			}
		}

		for (i = queries.length - 1; i >= 0; i--) {
			targetData = queries[i][1];
			_queries = queries[i][0];

			for (j=0, queriesLength = _queries.length; j < queriesLength; j++) {
				item = $(_queries[j]);

				item.data(this.widgetName + "-item", targetData); // Data for target checking (mouse manager)

				items.push({
					item: item,
					instance: targetData,
					width: 0, height: 0,
					left: 0, top: 0
				});
			}
		}

	},

	refreshPositions: function(fast) {

		//This has to be redone because due to the item being moved out/into the offsetParent, the offsetParent's position will change
		if(this.offsetParent && this.helper) {
			this.offset.parent = this._getParentOffset();
		}

		var i, item, t, p;

		for (i = this.items.length - 1; i >= 0; i--){
			item = this.items[i];

			//We ignore calculating positions of all connected containers when we're not over them
			if(item.instance !== this.currentContainer && this.currentContainer && item.item[0] !== this.currentItem[0]) {
				continue;
			}

			t = this.options.toleranceElement ? $(this.options.toleranceElement, item.item) : item.item;

			if (!fast) {
				item.width = t.outerWidth();
				item.height = t.outerHeight();
			}

			p = t.offset();
			item.left = p.left;
			item.top = p.top;
		}

		if(this.options.custom && this.options.custom.refreshContainers) {
			this.options.custom.refreshContainers.call(this);
		} else {
			for (i = this.containers.length - 1; i >= 0; i--){
				p = this.containers[i].element.offset();
				this.containers[i].containerCache.left = p.left;
				this.containers[i].containerCache.top = p.top;
				this.containers[i].containerCache.width	= this.containers[i].element.outerWidth();
				this.containers[i].containerCache.height = this.containers[i].element.outerHeight();
			}
		}

		return this;
	},

	_createPlaceholder: function(that) {
		that = that || this;
		var className,
			o = that.options;

		if(!o.placeholder || o.placeholder.constructor === String) {
			className = o.placeholder;
			o.placeholder = {
				element: function() {

					var nodeName = that.currentItem[0].nodeName.toLowerCase(),
						element = $( "<" + nodeName + ">", that.document[0] )
							.addClass(className || that.currentItem[0].className+" ui-sortable-placeholder")
							.removeClass("ui-sortable-helper");

					if ( nodeName === "tr" ) {
						that.currentItem.children().each(function() {
							$( "<td>&#160;</td>", that.document[0] )
								.attr( "colspan", $( this ).attr( "colspan" ) || 1 )
								.appendTo( element );
						});
					} else if ( nodeName === "img" ) {
						element.attr( "src", that.currentItem.attr( "src" ) );
					}

					if ( !className ) {
						element.css( "visibility", "hidden" );
					}

					return element;
				},
				update: function(container, p) {

					// 1. If a className is set as 'placeholder option, we don't force sizes - the class is responsible for that
					// 2. The option 'forcePlaceholderSize can be enabled to force it even if a class name is specified
					if(className && !o.forcePlaceholderSize) {
						return;
					}

					//If the element doesn't have a actual height by itself (without styles coming from a stylesheet), it receives the inline height from the dragged item
					if(!p.height()) { p.height(that.currentItem.innerHeight() - parseInt(that.currentItem.css("paddingTop")||0, 10) - parseInt(that.currentItem.css("paddingBottom")||0, 10)); }
					if(!p.width()) { p.width(that.currentItem.innerWidth() - parseInt(that.currentItem.css("paddingLeft")||0, 10) - parseInt(that.currentItem.css("paddingRight")||0, 10)); }
				}
			};
		}

		//Create the placeholder
		that.placeholder = $(o.placeholder.element.call(that.element, that.currentItem));

		//Append it after the actual current item
		that.currentItem.after(that.placeholder);

		//Update the size of the placeholder (TODO: Logic to fuzzy, see line 316/317)
		o.placeholder.update(that, that.placeholder);

	},

	_contactContainers: function(event) {
		var i, j, dist, itemWithLeastDistance, posProperty, sizeProperty, base, cur, nearBottom, floating,
			innermostContainer = null,
			innermostIndex = null;

		// get innermost container that intersects with item
		for (i = this.containers.length - 1; i >= 0; i--) {

			// never consider a container that's located within the item itself
			if($.contains(this.currentItem[0], this.containers[i].element[0])) {
				continue;
			}

			if(this._intersectsWith(this.containers[i].containerCache)) {

				// if we've already found a container and it's more "inner" than this, then continue
				if(innermostContainer && $.contains(this.containers[i].element[0], innermostContainer.element[0])) {
					continue;
				}

				innermostContainer = this.containers[i];
				innermostIndex = i;

			} else {
				// container doesn't intersect. trigger "out" event if necessary
				if(this.containers[i].containerCache.over) {
					this.containers[i]._trigger("out", event, this._uiHash(this));
					this.containers[i].containerCache.over = 0;
				}
			}

		}

		// if no intersecting containers found, return
		if(!innermostContainer) {
			return;
		}

		// move the item into the container if it's not there already
		if(this.containers.length === 1) {
			if (!this.containers[innermostIndex].containerCache.over) {
				this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
				this.containers[innermostIndex].containerCache.over = 1;
			}
		} else {

			//When entering a new container, we will find the item with the least distance and append our item near it
			dist = 10000;
			itemWithLeastDistance = null;
			floating = innermostContainer.floating || isFloating(this.currentItem);
			posProperty = floating ? "left" : "top";
			sizeProperty = floating ? "width" : "height";
			base = this.positionAbs[posProperty] + this.offset.click[posProperty];
			for (j = this.items.length - 1; j >= 0; j--) {
				if(!$.contains(this.containers[innermostIndex].element[0], this.items[j].item[0])) {
					continue;
				}
				if(this.items[j].item[0] === this.currentItem[0]) {
					continue;
				}
				if (floating && !isOverAxis(this.positionAbs.top + this.offset.click.top, this.items[j].top, this.items[j].height)) {
					continue;
				}
				cur = this.items[j].item.offset()[posProperty];
				nearBottom = false;
				if(Math.abs(cur - base) > Math.abs(cur + this.items[j][sizeProperty] - base)){
					nearBottom = true;
					cur += this.items[j][sizeProperty];
				}

				if(Math.abs(cur - base) < dist) {
					dist = Math.abs(cur - base); itemWithLeastDistance = this.items[j];
					this.direction = nearBottom ? "up": "down";
				}
			}

			//Check if dropOnEmpty is enabled
			if(!itemWithLeastDistance && !this.options.dropOnEmpty) {
				return;
			}

			if(this.currentContainer === this.containers[innermostIndex]) {
				return;
			}

			itemWithLeastDistance ? this._rearrange(event, itemWithLeastDistance, null, true) : this._rearrange(event, null, this.containers[innermostIndex].element, true);
			this._trigger("change", event, this._uiHash());
			this.containers[innermostIndex]._trigger("change", event, this._uiHash(this));
			this.currentContainer = this.containers[innermostIndex];

			//Update the placeholder
			this.options.placeholder.update(this.currentContainer, this.placeholder);

			this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
			this.containers[innermostIndex].containerCache.over = 1;
		}


	},

	_createHelper: function(event) {

		var o = this.options,
			helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event, this.currentItem])) : (o.helper === "clone" ? this.currentItem.clone() : this.currentItem);

		//Add the helper to the DOM if that didn't happen already
		if(!helper.parents("body").length) {
			$(o.appendTo !== "parent" ? o.appendTo : this.currentItem[0].parentNode)[0].appendChild(helper[0]);
		}

		if(helper[0] === this.currentItem[0]) {
			this._storedCSS = { width: this.currentItem[0].style.width, height: this.currentItem[0].style.height, position: this.currentItem.css("position"), top: this.currentItem.css("top"), left: this.currentItem.css("left") };
		}

		if(!helper[0].style.width || o.forceHelperSize) {
			helper.width(this.currentItem.width());
		}
		if(!helper[0].style.height || o.forceHelperSize) {
			helper.height(this.currentItem.height());
		}

		return helper;

	},

	_adjustOffsetFromHelper: function(obj) {
		if (typeof obj === "string") {
			obj = obj.split(" ");
		}
		if ($.isArray(obj)) {
			obj = {left: +obj[0], top: +obj[1] || 0};
		}
		if ("left" in obj) {
			this.offset.click.left = obj.left + this.margins.left;
		}
		if ("right" in obj) {
			this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
		}
		if ("top" in obj) {
			this.offset.click.top = obj.top + this.margins.top;
		}
		if ("bottom" in obj) {
			this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
		}
	},

	_getParentOffset: function() {


		//Get the offsetParent and cache its position
		this.offsetParent = this.helper.offsetParent();
		var po = this.offsetParent.offset();

		// This is a special case where we need to modify a offset calculated on start, since the following happened:
		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
		if(this.cssPosition === "absolute" && this.scrollParent[0] !== document && $.contains(this.scrollParent[0], this.offsetParent[0])) {
			po.left += this.scrollParent.scrollLeft();
			po.top += this.scrollParent.scrollTop();
		}

		// This needs to be actually done for all browsers, since pageX/pageY includes this information
		// with an ugly IE fix
		if( this.offsetParent[0] === document.body || (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() === "html" && $.ui.ie)) {
			po = { top: 0, left: 0 };
		}

		return {
			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"),10) || 0),
			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"),10) || 0)
		};

	},

	_getRelativeOffset: function() {

		if(this.cssPosition === "relative") {
			var p = this.currentItem.position();
			return {
				top: p.top - (parseInt(this.helper.css("top"),10) || 0) + this.scrollParent.scrollTop(),
				left: p.left - (parseInt(this.helper.css("left"),10) || 0) + this.scrollParent.scrollLeft()
			};
		} else {
			return { top: 0, left: 0 };
		}

	},

	_cacheMargins: function() {
		this.margins = {
			left: (parseInt(this.currentItem.css("marginLeft"),10) || 0),
			top: (parseInt(this.currentItem.css("marginTop"),10) || 0)
		};
	},

	_cacheHelperProportions: function() {
		this.helperProportions = {
			width: this.helper.outerWidth(),
			height: this.helper.outerHeight()
		};
	},

	_setContainment: function() {

		var ce, co, over,
			o = this.options;
		if(o.containment === "parent") {
			o.containment = this.helper[0].parentNode;
		}
		if(o.containment === "document" || o.containment === "window") {
			this.containment = [
				0 - this.offset.relative.left - this.offset.parent.left,
				0 - this.offset.relative.top - this.offset.parent.top,
				$(o.containment === "document" ? document : window).width() - this.helperProportions.width - this.margins.left,
				($(o.containment === "document" ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
			];
		}

		if(!(/^(document|window|parent)$/).test(o.containment)) {
			ce = $(o.containment)[0];
			co = $(o.containment).offset();
			over = ($(ce).css("overflow") !== "hidden");

			this.containment = [
				co.left + (parseInt($(ce).css("borderLeftWidth"),10) || 0) + (parseInt($(ce).css("paddingLeft"),10) || 0) - this.margins.left,
				co.top + (parseInt($(ce).css("borderTopWidth"),10) || 0) + (parseInt($(ce).css("paddingTop"),10) || 0) - this.margins.top,
				co.left+(over ? Math.max(ce.scrollWidth,ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"),10) || 0) - (parseInt($(ce).css("paddingRight"),10) || 0) - this.helperProportions.width - this.margins.left,
				co.top+(over ? Math.max(ce.scrollHeight,ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"),10) || 0) - (parseInt($(ce).css("paddingBottom"),10) || 0) - this.helperProportions.height - this.margins.top
			];
		}

	},

	_convertPositionTo: function(d, pos) {

		if(!pos) {
			pos = this.position;
		}
		var mod = d === "absolute" ? 1 : -1,
			scroll = this.cssPosition === "absolute" && !(this.scrollParent[0] !== document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent,
			scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		return {
			top: (
				pos.top	+																// The absolute mouse position
				this.offset.relative.top * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.top * mod -											// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ) * mod)
			),
			left: (
				pos.left +																// The absolute mouse position
				this.offset.relative.left * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.left * mod	-										// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ) * mod)
			)
		};

	},

	_generatePosition: function(event) {

		var top, left,
			o = this.options,
			pageX = event.pageX,
			pageY = event.pageY,
			scroll = this.cssPosition === "absolute" && !(this.scrollParent[0] !== document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		// This is another very weird special case that only happens for relative elements:
		// 1. If the css position is relative
		// 2. and the scroll parent is the document or similar to the offset parent
		// we have to refresh the relative offset during the scroll so there are no jumps
		if(this.cssPosition === "relative" && !(this.scrollParent[0] !== document && this.scrollParent[0] !== this.offsetParent[0])) {
			this.offset.relative = this._getRelativeOffset();
		}

		/*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */

		if(this.originalPosition) { //If we are not dragging yet, we won't check for options

			if(this.containment) {
				if(event.pageX - this.offset.click.left < this.containment[0]) {
					pageX = this.containment[0] + this.offset.click.left;
				}
				if(event.pageY - this.offset.click.top < this.containment[1]) {
					pageY = this.containment[1] + this.offset.click.top;
				}
				if(event.pageX - this.offset.click.left > this.containment[2]) {
					pageX = this.containment[2] + this.offset.click.left;
				}
				if(event.pageY - this.offset.click.top > this.containment[3]) {
					pageY = this.containment[3] + this.offset.click.top;
				}
			}

			if(o.grid) {
				top = this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1];
				pageY = this.containment ? ( (top - this.offset.click.top >= this.containment[1] && top - this.offset.click.top <= this.containment[3]) ? top : ((top - this.offset.click.top >= this.containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

				left = this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0];
				pageX = this.containment ? ( (left - this.offset.click.left >= this.containment[0] && left - this.offset.click.left <= this.containment[2]) ? left : ((left - this.offset.click.left >= this.containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
			}

		}

		return {
			top: (
				pageY -																// The absolute mouse position
				this.offset.click.top -													// Click offset (relative to the element)
				this.offset.relative.top	-											// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.top +												// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ))
			),
			left: (
				pageX -																// The absolute mouse position
				this.offset.click.left -												// Click offset (relative to the element)
				this.offset.relative.left	-											// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.left +												// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ))
			)
		};

	},

	_rearrange: function(event, i, a, hardRefresh) {

		a ? a[0].appendChild(this.placeholder[0]) : i.item[0].parentNode.insertBefore(this.placeholder[0], (this.direction === "down" ? i.item[0] : i.item[0].nextSibling));

		//Various things done here to improve the performance:
		// 1. we create a setTimeout, that calls refreshPositions
		// 2. on the instance, we have a counter variable, that get's higher after every append
		// 3. on the local scope, we copy the counter variable, and check in the timeout, if it's still the same
		// 4. this lets only the last addition to the timeout stack through
		this.counter = this.counter ? ++this.counter : 1;
		var counter = this.counter;

		this._delay(function() {
			if(counter === this.counter) {
				this.refreshPositions(!hardRefresh); //Precompute after each DOM insertion, NOT on mousemove
			}
		});

	},

	_clear: function(event, noPropagation) {

		this.reverting = false;
		// We delay all events that have to be triggered to after the point where the placeholder has been removed and
		// everything else normalized again
		var i,
			delayedTriggers = [];

		// We first have to update the dom position of the actual currentItem
		// Note: don't do it if the current item is already removed (by a user), or it gets reappended (see #4088)
		if(!this._noFinalSort && this.currentItem.parent().length) {
			this.placeholder.before(this.currentItem);
		}
		this._noFinalSort = null;

		if(this.helper[0] === this.currentItem[0]) {
			for(i in this._storedCSS) {
				if(this._storedCSS[i] === "auto" || this._storedCSS[i] === "static") {
					this._storedCSS[i] = "";
				}
			}
			this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
		} else {
			this.currentItem.show();
		}

		if(this.fromOutside && !noPropagation) {
			delayedTriggers.push(function(event) { this._trigger("receive", event, this._uiHash(this.fromOutside)); });
		}
		if((this.fromOutside || this.domPosition.prev !== this.currentItem.prev().not(".ui-sortable-helper")[0] || this.domPosition.parent !== this.currentItem.parent()[0]) && !noPropagation) {
			delayedTriggers.push(function(event) { this._trigger("update", event, this._uiHash()); }); //Trigger update callback if the DOM position has changed
		}

		// Check if the items Container has Changed and trigger appropriate
		// events.
		if (this !== this.currentContainer) {
			if(!noPropagation) {
				delayedTriggers.push(function(event) { this._trigger("remove", event, this._uiHash()); });
				delayedTriggers.push((function(c) { return function(event) { c._trigger("receive", event, this._uiHash(this)); };  }).call(this, this.currentContainer));
				delayedTriggers.push((function(c) { return function(event) { c._trigger("update", event, this._uiHash(this));  }; }).call(this, this.currentContainer));
			}
		}


		//Post events to containers
		function delayEvent( type, instance, container ) {
			return function( event ) {
				container._trigger( type, event, instance._uiHash( instance ) );
			};
		}
		for (i = this.containers.length - 1; i >= 0; i--){
			if (!noPropagation) {
				delayedTriggers.push( delayEvent( "deactivate", this, this.containers[ i ] ) );
			}
			if(this.containers[i].containerCache.over) {
				delayedTriggers.push( delayEvent( "out", this, this.containers[ i ] ) );
				this.containers[i].containerCache.over = 0;
			}
		}

		//Do what was originally in plugins
		if ( this.storedCursor ) {
			this.document.find( "body" ).css( "cursor", this.storedCursor );
			this.storedStylesheet.remove();
		}
		if(this._storedOpacity) {
			this.helper.css("opacity", this._storedOpacity);
		}
		if(this._storedZIndex) {
			this.helper.css("zIndex", this._storedZIndex === "auto" ? "" : this._storedZIndex);
		}

		this.dragging = false;
		if(this.cancelHelperRemoval) {
			if(!noPropagation) {
				this._trigger("beforeStop", event, this._uiHash());
				for (i=0; i < delayedTriggers.length; i++) {
					delayedTriggers[i].call(this, event);
				} //Trigger all delayed events
				this._trigger("stop", event, this._uiHash());
			}

			this.fromOutside = false;
			return false;
		}

		if(!noPropagation) {
			this._trigger("beforeStop", event, this._uiHash());
		}

		//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
		this.placeholder[0].parentNode.removeChild(this.placeholder[0]);

		if(this.helper[0] !== this.currentItem[0]) {
			this.helper.remove();
		}
		this.helper = null;

		if(!noPropagation) {
			for (i=0; i < delayedTriggers.length; i++) {
				delayedTriggers[i].call(this, event);
			} //Trigger all delayed events
			this._trigger("stop", event, this._uiHash());
		}

		this.fromOutside = false;
		return true;

	},

	_trigger: function() {
		if ($.Widget.prototype._trigger.apply(this, arguments) === false) {
			this.cancel();
		}
	},

	_uiHash: function(_inst) {
		var inst = _inst || this;
		return {
			helper: inst.helper,
			placeholder: inst.placeholder || $([]),
			position: inst.position,
			originalPosition: inst.originalPosition,
			offset: inst.positionAbs,
			item: inst.currentItem,
			sender: _inst ? _inst.element : null
		};
	}

});

})(jQuery);
(function($, undefined) {

var dataSpace = "ui-effects-";

$.effects = {
	effect: {}
};

/*!
 * jQuery Color Animations v2.1.2
 * https://github.com/jquery/jquery-color
 *
 * Copyright 2013 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * Date: Wed Jan 16 08:47:09 2013 -0600
 */
(function( jQuery, undefined ) {

	var stepHooks = "backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color columnRuleColor outlineColor textDecorationColor textEmphasisColor",

	// plusequals test for += 100 -= 100
	rplusequals = /^([\-+])=\s*(\d+\.?\d*)/,
	// a set of RE's that can match strings and generate color tuples.
	stringParsers = [{
			re: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
			parse: function( execResult ) {
				return [
					execResult[ 1 ],
					execResult[ 2 ],
					execResult[ 3 ],
					execResult[ 4 ]
				];
			}
		}, {
			re: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
			parse: function( execResult ) {
				return [
					execResult[ 1 ] * 2.55,
					execResult[ 2 ] * 2.55,
					execResult[ 3 ] * 2.55,
					execResult[ 4 ]
				];
			}
		}, {
			// this regex ignores A-F because it's compared against an already lowercased string
			re: /#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/,
			parse: function( execResult ) {
				return [
					parseInt( execResult[ 1 ], 16 ),
					parseInt( execResult[ 2 ], 16 ),
					parseInt( execResult[ 3 ], 16 )
				];
			}
		}, {
			// this regex ignores A-F because it's compared against an already lowercased string
			re: /#([a-f0-9])([a-f0-9])([a-f0-9])/,
			parse: function( execResult ) {
				return [
					parseInt( execResult[ 1 ] + execResult[ 1 ], 16 ),
					parseInt( execResult[ 2 ] + execResult[ 2 ], 16 ),
					parseInt( execResult[ 3 ] + execResult[ 3 ], 16 )
				];
			}
		}, {
			re: /hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
			space: "hsla",
			parse: function( execResult ) {
				return [
					execResult[ 1 ],
					execResult[ 2 ] / 100,
					execResult[ 3 ] / 100,
					execResult[ 4 ]
				];
			}
		}],

	// jQuery.Color( )
	color = jQuery.Color = function( color, green, blue, alpha ) {
		return new jQuery.Color.fn.parse( color, green, blue, alpha );
	},
	spaces = {
		rgba: {
			props: {
				red: {
					idx: 0,
					type: "byte"
				},
				green: {
					idx: 1,
					type: "byte"
				},
				blue: {
					idx: 2,
					type: "byte"
				}
			}
		},

		hsla: {
			props: {
				hue: {
					idx: 0,
					type: "degrees"
				},
				saturation: {
					idx: 1,
					type: "percent"
				},
				lightness: {
					idx: 2,
					type: "percent"
				}
			}
		}
	},
	propTypes = {
		"byte": {
			floor: true,
			max: 255
		},
		"percent": {
			max: 1
		},
		"degrees": {
			mod: 360,
			floor: true
		}
	},
	support = color.support = {},

	// element for support tests
	supportElem = jQuery( "<p>" )[ 0 ],

	// colors = jQuery.Color.names
	colors,

	// local aliases of functions called often
	each = jQuery.each;

// determine rgba support immediately
supportElem.style.cssText = "background-color:rgba(1,1,1,.5)";
support.rgba = supportElem.style.backgroundColor.indexOf( "rgba" ) > -1;

// define cache name and alpha properties
// for rgba and hsla spaces
each( spaces, function( spaceName, space ) {
	space.cache = "_" + spaceName;
	space.props.alpha = {
		idx: 3,
		type: "percent",
		def: 1
	};
});

function clamp( value, prop, allowEmpty ) {
	var type = propTypes[ prop.type ] || {};

	if ( value == null ) {
		return (allowEmpty || !prop.def) ? null : prop.def;
	}

	// ~~ is an short way of doing floor for positive numbers
	value = type.floor ? ~~value : parseFloat( value );

	// IE will pass in empty strings as value for alpha,
	// which will hit this case
	if ( isNaN( value ) ) {
		return prop.def;
	}

	if ( type.mod ) {
		// we add mod before modding to make sure that negatives values
		// get converted properly: -10 -> 350
		return (value + type.mod) % type.mod;
	}

	// for now all property types without mod have min and max
	return 0 > value ? 0 : type.max < value ? type.max : value;
}

function stringParse( string ) {
	var inst = color(),
		rgba = inst._rgba = [];

	string = string.toLowerCase();

	each( stringParsers, function( i, parser ) {
		var parsed,
			match = parser.re.exec( string ),
			values = match && parser.parse( match ),
			spaceName = parser.space || "rgba";

		if ( values ) {
			parsed = inst[ spaceName ]( values );

			// if this was an rgba parse the assignment might happen twice
			// oh well....
			inst[ spaces[ spaceName ].cache ] = parsed[ spaces[ spaceName ].cache ];
			rgba = inst._rgba = parsed._rgba;

			// exit each( stringParsers ) here because we matched
			return false;
		}
	});

	// Found a stringParser that handled it
	if ( rgba.length ) {

		// if this came from a parsed string, force "transparent" when alpha is 0
		// chrome, (and maybe others) return "transparent" as rgba(0,0,0,0)
		if ( rgba.join() === "0,0,0,0" ) {
			jQuery.extend( rgba, colors.transparent );
		}
		return inst;
	}

	// named colors
	return colors[ string ];
}

color.fn = jQuery.extend( color.prototype, {
	parse: function( red, green, blue, alpha ) {
		if ( red === undefined ) {
			this._rgba = [ null, null, null, null ];
			return this;
		}
		if ( red.jquery || red.nodeType ) {
			red = jQuery( red ).css( green );
			green = undefined;
		}

		var inst = this,
			type = jQuery.type( red ),
			rgba = this._rgba = [];

		// more than 1 argument specified - assume ( red, green, blue, alpha )
		if ( green !== undefined ) {
			red = [ red, green, blue, alpha ];
			type = "array";
		}

		if ( type === "string" ) {
			return this.parse( stringParse( red ) || colors._default );
		}

		if ( type === "array" ) {
			each( spaces.rgba.props, function( key, prop ) {
				rgba[ prop.idx ] = clamp( red[ prop.idx ], prop );
			});
			return this;
		}

		if ( type === "object" ) {
			if ( red instanceof color ) {
				each( spaces, function( spaceName, space ) {
					if ( red[ space.cache ] ) {
						inst[ space.cache ] = red[ space.cache ].slice();
					}
				});
			} else {
				each( spaces, function( spaceName, space ) {
					var cache = space.cache;
					each( space.props, function( key, prop ) {

						// if the cache doesn't exist, and we know how to convert
						if ( !inst[ cache ] && space.to ) {

							// if the value was null, we don't need to copy it
							// if the key was alpha, we don't need to copy it either
							if ( key === "alpha" || red[ key ] == null ) {
								return;
							}
							inst[ cache ] = space.to( inst._rgba );
						}

						// this is the only case where we allow nulls for ALL properties.
						// call clamp with alwaysAllowEmpty
						inst[ cache ][ prop.idx ] = clamp( red[ key ], prop, true );
					});

					// everything defined but alpha?
					if ( inst[ cache ] && jQuery.inArray( null, inst[ cache ].slice( 0, 3 ) ) < 0 ) {
						// use the default of 1
						inst[ cache ][ 3 ] = 1;
						if ( space.from ) {
							inst._rgba = space.from( inst[ cache ] );
						}
					}
				});
			}
			return this;
		}
	},
	is: function( compare ) {
		var is = color( compare ),
			same = true,
			inst = this;

		each( spaces, function( _, space ) {
			var localCache,
				isCache = is[ space.cache ];
			if (isCache) {
				localCache = inst[ space.cache ] || space.to && space.to( inst._rgba ) || [];
				each( space.props, function( _, prop ) {
					if ( isCache[ prop.idx ] != null ) {
						same = ( isCache[ prop.idx ] === localCache[ prop.idx ] );
						return same;
					}
				});
			}
			return same;
		});
		return same;
	},
	_space: function() {
		var used = [],
			inst = this;
		each( spaces, function( spaceName, space ) {
			if ( inst[ space.cache ] ) {
				used.push( spaceName );
			}
		});
		return used.pop();
	},
	transition: function( other, distance ) {
		var end = color( other ),
			spaceName = end._space(),
			space = spaces[ spaceName ],
			startColor = this.alpha() === 0 ? color( "transparent" ) : this,
			start = startColor[ space.cache ] || space.to( startColor._rgba ),
			result = start.slice();

		end = end[ space.cache ];
		each( space.props, function( key, prop ) {
			var index = prop.idx,
				startValue = start[ index ],
				endValue = end[ index ],
				type = propTypes[ prop.type ] || {};

			// if null, don't override start value
			if ( endValue === null ) {
				return;
			}
			// if null - use end
			if ( startValue === null ) {
				result[ index ] = endValue;
			} else {
				if ( type.mod ) {
					if ( endValue - startValue > type.mod / 2 ) {
						startValue += type.mod;
					} else if ( startValue - endValue > type.mod / 2 ) {
						startValue -= type.mod;
					}
				}
				result[ index ] = clamp( ( endValue - startValue ) * distance + startValue, prop );
			}
		});
		return this[ spaceName ]( result );
	},
	blend: function( opaque ) {
		// if we are already opaque - return ourself
		if ( this._rgba[ 3 ] === 1 ) {
			return this;
		}

		var rgb = this._rgba.slice(),
			a = rgb.pop(),
			blend = color( opaque )._rgba;

		return color( jQuery.map( rgb, function( v, i ) {
			return ( 1 - a ) * blend[ i ] + a * v;
		}));
	},
	toRgbaString: function() {
		var prefix = "rgba(",
			rgba = jQuery.map( this._rgba, function( v, i ) {
				return v == null ? ( i > 2 ? 1 : 0 ) : v;
			});

		if ( rgba[ 3 ] === 1 ) {
			rgba.pop();
			prefix = "rgb(";
		}

		return prefix + rgba.join() + ")";
	},
	toHslaString: function() {
		var prefix = "hsla(",
			hsla = jQuery.map( this.hsla(), function( v, i ) {
				if ( v == null ) {
					v = i > 2 ? 1 : 0;
				}

				// catch 1 and 2
				if ( i && i < 3 ) {
					v = Math.round( v * 100 ) + "%";
				}
				return v;
			});

		if ( hsla[ 3 ] === 1 ) {
			hsla.pop();
			prefix = "hsl(";
		}
		return prefix + hsla.join() + ")";
	},
	toHexString: function( includeAlpha ) {
		var rgba = this._rgba.slice(),
			alpha = rgba.pop();

		if ( includeAlpha ) {
			rgba.push( ~~( alpha * 255 ) );
		}

		return "#" + jQuery.map( rgba, function( v ) {

			// default to 0 when nulls exist
			v = ( v || 0 ).toString( 16 );
			return v.length === 1 ? "0" + v : v;
		}).join("");
	},
	toString: function() {
		return this._rgba[ 3 ] === 0 ? "transparent" : this.toRgbaString();
	}
});
color.fn.parse.prototype = color.fn;

// hsla conversions adapted from:
// https://code.google.com/p/maashaack/source/browse/packages/graphics/trunk/src/graphics/colors/HUE2RGB.as?r=5021

function hue2rgb( p, q, h ) {
	h = ( h + 1 ) % 1;
	if ( h * 6 < 1 ) {
		return p + (q - p) * h * 6;
	}
	if ( h * 2 < 1) {
		return q;
	}
	if ( h * 3 < 2 ) {
		return p + (q - p) * ((2/3) - h) * 6;
	}
	return p;
}

spaces.hsla.to = function ( rgba ) {
	if ( rgba[ 0 ] == null || rgba[ 1 ] == null || rgba[ 2 ] == null ) {
		return [ null, null, null, rgba[ 3 ] ];
	}
	var r = rgba[ 0 ] / 255,
		g = rgba[ 1 ] / 255,
		b = rgba[ 2 ] / 255,
		a = rgba[ 3 ],
		max = Math.max( r, g, b ),
		min = Math.min( r, g, b ),
		diff = max - min,
		add = max + min,
		l = add * 0.5,
		h, s;

	if ( min === max ) {
		h = 0;
	} else if ( r === max ) {
		h = ( 60 * ( g - b ) / diff ) + 360;
	} else if ( g === max ) {
		h = ( 60 * ( b - r ) / diff ) + 120;
	} else {
		h = ( 60 * ( r - g ) / diff ) + 240;
	}

	// chroma (diff) == 0 means greyscale which, by definition, saturation = 0%
	// otherwise, saturation is based on the ratio of chroma (diff) to lightness (add)
	if ( diff === 0 ) {
		s = 0;
	} else if ( l <= 0.5 ) {
		s = diff / add;
	} else {
		s = diff / ( 2 - add );
	}
	return [ Math.round(h) % 360, s, l, a == null ? 1 : a ];
};

spaces.hsla.from = function ( hsla ) {
	if ( hsla[ 0 ] == null || hsla[ 1 ] == null || hsla[ 2 ] == null ) {
		return [ null, null, null, hsla[ 3 ] ];
	}
	var h = hsla[ 0 ] / 360,
		s = hsla[ 1 ],
		l = hsla[ 2 ],
		a = hsla[ 3 ],
		q = l <= 0.5 ? l * ( 1 + s ) : l + s - l * s,
		p = 2 * l - q;

	return [
		Math.round( hue2rgb( p, q, h + ( 1 / 3 ) ) * 255 ),
		Math.round( hue2rgb( p, q, h ) * 255 ),
		Math.round( hue2rgb( p, q, h - ( 1 / 3 ) ) * 255 ),
		a
	];
};


each( spaces, function( spaceName, space ) {
	var props = space.props,
		cache = space.cache,
		to = space.to,
		from = space.from;

	// makes rgba() and hsla()
	color.fn[ spaceName ] = function( value ) {

		// generate a cache for this space if it doesn't exist
		if ( to && !this[ cache ] ) {
			this[ cache ] = to( this._rgba );
		}
		if ( value === undefined ) {
			return this[ cache ].slice();
		}

		var ret,
			type = jQuery.type( value ),
			arr = ( type === "array" || type === "object" ) ? value : arguments,
			local = this[ cache ].slice();

		each( props, function( key, prop ) {
			var val = arr[ type === "object" ? key : prop.idx ];
			if ( val == null ) {
				val = local[ prop.idx ];
			}
			local[ prop.idx ] = clamp( val, prop );
		});

		if ( from ) {
			ret = color( from( local ) );
			ret[ cache ] = local;
			return ret;
		} else {
			return color( local );
		}
	};

	// makes red() green() blue() alpha() hue() saturation() lightness()
	each( props, function( key, prop ) {
		// alpha is included in more than one space
		if ( color.fn[ key ] ) {
			return;
		}
		color.fn[ key ] = function( value ) {
			var vtype = jQuery.type( value ),
				fn = ( key === "alpha" ? ( this._hsla ? "hsla" : "rgba" ) : spaceName ),
				local = this[ fn ](),
				cur = local[ prop.idx ],
				match;

			if ( vtype === "undefined" ) {
				return cur;
			}

			if ( vtype === "function" ) {
				value = value.call( this, cur );
				vtype = jQuery.type( value );
			}
			if ( value == null && prop.empty ) {
				return this;
			}
			if ( vtype === "string" ) {
				match = rplusequals.exec( value );
				if ( match ) {
					value = cur + parseFloat( match[ 2 ] ) * ( match[ 1 ] === "+" ? 1 : -1 );
				}
			}
			local[ prop.idx ] = value;
			return this[ fn ]( local );
		};
	});
});

// add cssHook and .fx.step function for each named hook.
// accept a space separated string of properties
color.hook = function( hook ) {
	var hooks = hook.split( " " );
	each( hooks, function( i, hook ) {
		jQuery.cssHooks[ hook ] = {
			set: function( elem, value ) {
				var parsed, curElem,
					backgroundColor = "";

				if ( value !== "transparent" && ( jQuery.type( value ) !== "string" || ( parsed = stringParse( value ) ) ) ) {
					value = color( parsed || value );
					if ( !support.rgba && value._rgba[ 3 ] !== 1 ) {
						curElem = hook === "backgroundColor" ? elem.parentNode : elem;
						while (
							(backgroundColor === "" || backgroundColor === "transparent") &&
							curElem && curElem.style
						) {
							try {
								backgroundColor = jQuery.css( curElem, "backgroundColor" );
								curElem = curElem.parentNode;
							} catch ( e ) {
							}
						}

						value = value.blend( backgroundColor && backgroundColor !== "transparent" ?
							backgroundColor :
							"_default" );
					}

					value = value.toRgbaString();
				}
				try {
					elem.style[ hook ] = value;
				} catch( e ) {
					// wrapped to prevent IE from throwing errors on "invalid" values like 'auto' or 'inherit'
				}
			}
		};
		jQuery.fx.step[ hook ] = function( fx ) {
			if ( !fx.colorInit ) {
				fx.start = color( fx.elem, hook );
				fx.end = color( fx.end );
				fx.colorInit = true;
			}
			jQuery.cssHooks[ hook ].set( fx.elem, fx.start.transition( fx.end, fx.pos ) );
		};
	});

};

color.hook( stepHooks );

jQuery.cssHooks.borderColor = {
	expand: function( value ) {
		var expanded = {};

		each( [ "Top", "Right", "Bottom", "Left" ], function( i, part ) {
			expanded[ "border" + part + "Color" ] = value;
		});
		return expanded;
	}
};

// Basic color names only.
// Usage of any of the other color names requires adding yourself or including
// jquery.color.svg-names.js.
colors = jQuery.Color.names = {
	// 4.1. Basic color keywords
	aqua: "#00ffff",
	black: "#000000",
	blue: "#0000ff",
	fuchsia: "#ff00ff",
	gray: "#808080",
	green: "#008000",
	lime: "#00ff00",
	maroon: "#800000",
	navy: "#000080",
	olive: "#808000",
	purple: "#800080",
	red: "#ff0000",
	silver: "#c0c0c0",
	teal: "#008080",
	white: "#ffffff",
	yellow: "#ffff00",

	// 4.2.3. "transparent" color keyword
	transparent: [ null, null, null, 0 ],

	_default: "#ffffff"
};

})( jQuery );


/******************************************************************************/
/****************************** CLASS ANIMATIONS ******************************/
/******************************************************************************/
(function() {

var classAnimationActions = [ "add", "remove", "toggle" ],
	shorthandStyles = {
		border: 1,
		borderBottom: 1,
		borderColor: 1,
		borderLeft: 1,
		borderRight: 1,
		borderTop: 1,
		borderWidth: 1,
		margin: 1,
		padding: 1
	};

$.each([ "borderLeftStyle", "borderRightStyle", "borderBottomStyle", "borderTopStyle" ], function( _, prop ) {
	$.fx.step[ prop ] = function( fx ) {
		if ( fx.end !== "none" && !fx.setAttr || fx.pos === 1 && !fx.setAttr ) {
			jQuery.style( fx.elem, prop, fx.end );
			fx.setAttr = true;
		}
	};
});

function getElementStyles( elem ) {
	var key, len,
		style = elem.ownerDocument.defaultView ?
			elem.ownerDocument.defaultView.getComputedStyle( elem, null ) :
			elem.currentStyle,
		styles = {};

	if ( style && style.length && style[ 0 ] && style[ style[ 0 ] ] ) {
		len = style.length;
		while ( len-- ) {
			key = style[ len ];
			if ( typeof style[ key ] === "string" ) {
				styles[ $.camelCase( key ) ] = style[ key ];
			}
		}
	// support: Opera, IE <9
	} else {
		for ( key in style ) {
			if ( typeof style[ key ] === "string" ) {
				styles[ key ] = style[ key ];
			}
		}
	}

	return styles;
}


function styleDifference( oldStyle, newStyle ) {
	var diff = {},
		name, value;

	for ( name in newStyle ) {
		value = newStyle[ name ];
		if ( oldStyle[ name ] !== value ) {
			if ( !shorthandStyles[ name ] ) {
				if ( $.fx.step[ name ] || !isNaN( parseFloat( value ) ) ) {
					diff[ name ] = value;
				}
			}
		}
	}

	return diff;
}

// support: jQuery <1.8
if ( !$.fn.addBack ) {
	$.fn.addBack = function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	};
}

$.effects.animateClass = function( value, duration, easing, callback ) {
	var o = $.speed( duration, easing, callback );

	return this.queue( function() {
		var animated = $( this ),
			baseClass = animated.attr( "class" ) || "",
			applyClassChange,
			allAnimations = o.children ? animated.find( "*" ).addBack() : animated;

		// map the animated objects to store the original styles.
		allAnimations = allAnimations.map(function() {
			var el = $( this );
			return {
				el: el,
				start: getElementStyles( this )
			};
		});

		// apply class change
		applyClassChange = function() {
			$.each( classAnimationActions, function(i, action) {
				if ( value[ action ] ) {
					animated[ action + "Class" ]( value[ action ] );
				}
			});
		};
		applyClassChange();

		// map all animated objects again - calculate new styles and diff
		allAnimations = allAnimations.map(function() {
			this.end = getElementStyles( this.el[ 0 ] );
			this.diff = styleDifference( this.start, this.end );
			return this;
		});

		// apply original class
		animated.attr( "class", baseClass );

		// map all animated objects again - this time collecting a promise
		allAnimations = allAnimations.map(function() {
			var styleInfo = this,
				dfd = $.Deferred(),
				opts = $.extend({}, o, {
					queue: false,
					complete: function() {
						dfd.resolve( styleInfo );
					}
				});

			this.el.animate( this.diff, opts );
			return dfd.promise();
		});

		// once all animations have completed:
		$.when.apply( $, allAnimations.get() ).done(function() {

			// set the final class
			applyClassChange();

			// for each animated element,
			// clear all css properties that were animated
			$.each( arguments, function() {
				var el = this.el;
				$.each( this.diff, function(key) {
					el.css( key, "" );
				});
			});

			// this is guarnteed to be there if you use jQuery.speed()
			// it also handles dequeuing the next anim...
			o.complete.call( animated[ 0 ] );
		});
	});
};

$.fn.extend({
	addClass: (function( orig ) {
		return function( classNames, speed, easing, callback ) {
			return speed ?
				$.effects.animateClass.call( this,
					{ add: classNames }, speed, easing, callback ) :
				orig.apply( this, arguments );
		};
	})( $.fn.addClass ),

	removeClass: (function( orig ) {
		return function( classNames, speed, easing, callback ) {
			return arguments.length > 1 ?
				$.effects.animateClass.call( this,
					{ remove: classNames }, speed, easing, callback ) :
				orig.apply( this, arguments );
		};
	})( $.fn.removeClass ),

	toggleClass: (function( orig ) {
		return function( classNames, force, speed, easing, callback ) {
			if ( typeof force === "boolean" || force === undefined ) {
				if ( !speed ) {
					// without speed parameter
					return orig.apply( this, arguments );
				} else {
					return $.effects.animateClass.call( this,
						(force ? { add: classNames } : { remove: classNames }),
						speed, easing, callback );
				}
			} else {
				// without force parameter
				return $.effects.animateClass.call( this,
					{ toggle: classNames }, force, speed, easing );
			}
		};
	})( $.fn.toggleClass ),

	switchClass: function( remove, add, speed, easing, callback) {
		return $.effects.animateClass.call( this, {
			add: add,
			remove: remove
		}, speed, easing, callback );
	}
});

})();

/******************************************************************************/
/*********************************** EFFECTS **********************************/
/******************************************************************************/

(function() {

$.extend( $.effects, {
	version: "1.10.4",

	// Saves a set of properties in a data storage
	save: function( element, set ) {
		for( var i=0; i < set.length; i++ ) {
			if ( set[ i ] !== null ) {
				element.data( dataSpace + set[ i ], element[ 0 ].style[ set[ i ] ] );
			}
		}
	},

	// Restores a set of previously saved properties from a data storage
	restore: function( element, set ) {
		var val, i;
		for( i=0; i < set.length; i++ ) {
			if ( set[ i ] !== null ) {
				val = element.data( dataSpace + set[ i ] );
				// support: jQuery 1.6.2
				// http://bugs.jquery.com/ticket/9917
				// jQuery 1.6.2 incorrectly returns undefined for any falsy value.
				// We can't differentiate between "" and 0 here, so we just assume
				// empty string since it's likely to be a more common value...
				if ( val === undefined ) {
					val = "";
				}
				element.css( set[ i ], val );
			}
		}
	},

	setMode: function( el, mode ) {
		if (mode === "toggle") {
			mode = el.is( ":hidden" ) ? "show" : "hide";
		}
		return mode;
	},

	// Translates a [top,left] array into a baseline value
	// this should be a little more flexible in the future to handle a string & hash
	getBaseline: function( origin, original ) {
		var y, x;
		switch ( origin[ 0 ] ) {
			case "top": y = 0; break;
			case "middle": y = 0.5; break;
			case "bottom": y = 1; break;
			default: y = origin[ 0 ] / original.height;
		}
		switch ( origin[ 1 ] ) {
			case "left": x = 0; break;
			case "center": x = 0.5; break;
			case "right": x = 1; break;
			default: x = origin[ 1 ] / original.width;
		}
		return {
			x: x,
			y: y
		};
	},

	// Wraps the element around a wrapper that copies position properties
	createWrapper: function( element ) {

		// if the element is already wrapped, return it
		if ( element.parent().is( ".ui-effects-wrapper" )) {
			return element.parent();
		}

		// wrap the element
		var props = {
				width: element.outerWidth(true),
				height: element.outerHeight(true),
				"float": element.css( "float" )
			},
			wrapper = $( "<div></div>" )
				.addClass( "ui-effects-wrapper" )
				.css({
					fontSize: "100%",
					background: "transparent",
					border: "none",
					margin: 0,
					padding: 0
				}),
			// Store the size in case width/height are defined in % - Fixes #5245
			size = {
				width: element.width(),
				height: element.height()
			},
			active = document.activeElement;

		// support: Firefox
		// Firefox incorrectly exposes anonymous content
		// https://bugzilla.mozilla.org/show_bug.cgi?id=561664
		try {
			active.id;
		} catch( e ) {
			active = document.body;
		}

		element.wrap( wrapper );

		// Fixes #7595 - Elements lose focus when wrapped.
		if ( element[ 0 ] === active || $.contains( element[ 0 ], active ) ) {
			$( active ).focus();
		}

		wrapper = element.parent(); //Hotfix for jQuery 1.4 since some change in wrap() seems to actually lose the reference to the wrapped element

		// transfer positioning properties to the wrapper
		if ( element.css( "position" ) === "static" ) {
			wrapper.css({ position: "relative" });
			element.css({ position: "relative" });
		} else {
			$.extend( props, {
				position: element.css( "position" ),
				zIndex: element.css( "z-index" )
			});
			$.each([ "top", "left", "bottom", "right" ], function(i, pos) {
				props[ pos ] = element.css( pos );
				if ( isNaN( parseInt( props[ pos ], 10 ) ) ) {
					props[ pos ] = "auto";
				}
			});
			element.css({
				position: "relative",
				top: 0,
				left: 0,
				right: "auto",
				bottom: "auto"
			});
		}
		element.css(size);

		return wrapper.css( props ).show();
	},

	removeWrapper: function( element ) {
		var active = document.activeElement;

		if ( element.parent().is( ".ui-effects-wrapper" ) ) {
			element.parent().replaceWith( element );

			// Fixes #7595 - Elements lose focus when wrapped.
			if ( element[ 0 ] === active || $.contains( element[ 0 ], active ) ) {
				$( active ).focus();
			}
		}


		return element;
	},

	setTransition: function( element, list, factor, value ) {
		value = value || {};
		$.each( list, function( i, x ) {
			var unit = element.cssUnit( x );
			if ( unit[ 0 ] > 0 ) {
				value[ x ] = unit[ 0 ] * factor + unit[ 1 ];
			}
		});
		return value;
	}
});

// return an effect options object for the given parameters:
function _normalizeArguments( effect, options, speed, callback ) {

	// allow passing all options as the first parameter
	if ( $.isPlainObject( effect ) ) {
		options = effect;
		effect = effect.effect;
	}

	// convert to an object
	effect = { effect: effect };

	// catch (effect, null, ...)
	if ( options == null ) {
		options = {};
	}

	// catch (effect, callback)
	if ( $.isFunction( options ) ) {
		callback = options;
		speed = null;
		options = {};
	}

	// catch (effect, speed, ?)
	if ( typeof options === "number" || $.fx.speeds[ options ] ) {
		callback = speed;
		speed = options;
		options = {};
	}

	// catch (effect, options, callback)
	if ( $.isFunction( speed ) ) {
		callback = speed;
		speed = null;
	}

	// add options to effect
	if ( options ) {
		$.extend( effect, options );
	}

	speed = speed || options.duration;
	effect.duration = $.fx.off ? 0 :
		typeof speed === "number" ? speed :
		speed in $.fx.speeds ? $.fx.speeds[ speed ] :
		$.fx.speeds._default;

	effect.complete = callback || options.complete;

	return effect;
}

function standardAnimationOption( option ) {
	// Valid standard speeds (nothing, number, named speed)
	if ( !option || typeof option === "number" || $.fx.speeds[ option ] ) {
		return true;
	}

	// Invalid strings - treat as "normal" speed
	if ( typeof option === "string" && !$.effects.effect[ option ] ) {
		return true;
	}

	// Complete callback
	if ( $.isFunction( option ) ) {
		return true;
	}

	// Options hash (but not naming an effect)
	if ( typeof option === "object" && !option.effect ) {
		return true;
	}

	// Didn't match any standard API
	return false;
}

$.fn.extend({
	effect: function( /* effect, options, speed, callback */ ) {
		var args = _normalizeArguments.apply( this, arguments ),
			mode = args.mode,
			queue = args.queue,
			effectMethod = $.effects.effect[ args.effect ];

		if ( $.fx.off || !effectMethod ) {
			// delegate to the original method (e.g., .show()) if possible
			if ( mode ) {
				return this[ mode ]( args.duration, args.complete );
			} else {
				return this.each( function() {
					if ( args.complete ) {
						args.complete.call( this );
					}
				});
			}
		}

		function run( next ) {
			var elem = $( this ),
				complete = args.complete,
				mode = args.mode;

			function done() {
				if ( $.isFunction( complete ) ) {
					complete.call( elem[0] );
				}
				if ( $.isFunction( next ) ) {
					next();
				}
			}

			// If the element already has the correct final state, delegate to
			// the core methods so the internal tracking of "olddisplay" works.
			if ( elem.is( ":hidden" ) ? mode === "hide" : mode === "show" ) {
				elem[ mode ]();
				done();
			} else {
				effectMethod.call( elem[0], args, done );
			}
		}

		return queue === false ? this.each( run ) : this.queue( queue || "fx", run );
	},

	show: (function( orig ) {
		return function( option ) {
			if ( standardAnimationOption( option ) ) {
				return orig.apply( this, arguments );
			} else {
				var args = _normalizeArguments.apply( this, arguments );
				args.mode = "show";
				return this.effect.call( this, args );
			}
		};
	})( $.fn.show ),

	hide: (function( orig ) {
		return function( option ) {
			if ( standardAnimationOption( option ) ) {
				return orig.apply( this, arguments );
			} else {
				var args = _normalizeArguments.apply( this, arguments );
				args.mode = "hide";
				return this.effect.call( this, args );
			}
		};
	})( $.fn.hide ),

	toggle: (function( orig ) {
		return function( option ) {
			if ( standardAnimationOption( option ) || typeof option === "boolean" ) {
				return orig.apply( this, arguments );
			} else {
				var args = _normalizeArguments.apply( this, arguments );
				args.mode = "toggle";
				return this.effect.call( this, args );
			}
		};
	})( $.fn.toggle ),

	// helper functions
	cssUnit: function(key) {
		var style = this.css( key ),
			val = [];

		$.each( [ "em", "px", "%", "pt" ], function( i, unit ) {
			if ( style.indexOf( unit ) > 0 ) {
				val = [ parseFloat( style ), unit ];
			}
		});
		return val;
	}
});

})();

/******************************************************************************/
/*********************************** EASING ***********************************/
/******************************************************************************/

(function() {

// based on easing equations from Robert Penner (http://www.robertpenner.com/easing)

var baseEasings = {};

$.each( [ "Quad", "Cubic", "Quart", "Quint", "Expo" ], function( i, name ) {
	baseEasings[ name ] = function( p ) {
		return Math.pow( p, i + 2 );
	};
});

$.extend( baseEasings, {
	Sine: function ( p ) {
		return 1 - Math.cos( p * Math.PI / 2 );
	},
	Circ: function ( p ) {
		return 1 - Math.sqrt( 1 - p * p );
	},
	Elastic: function( p ) {
		return p === 0 || p === 1 ? p :
			-Math.pow( 2, 8 * (p - 1) ) * Math.sin( ( (p - 1) * 80 - 7.5 ) * Math.PI / 15 );
	},
	Back: function( p ) {
		return p * p * ( 3 * p - 2 );
	},
	Bounce: function ( p ) {
		var pow2,
			bounce = 4;

		while ( p < ( ( pow2 = Math.pow( 2, --bounce ) ) - 1 ) / 11 ) {}
		return 1 / Math.pow( 4, 3 - bounce ) - 7.5625 * Math.pow( ( pow2 * 3 - 2 ) / 22 - p, 2 );
	}
});

$.each( baseEasings, function( name, easeIn ) {
	$.easing[ "easeIn" + name ] = easeIn;
	$.easing[ "easeOut" + name ] = function( p ) {
		return 1 - easeIn( 1 - p );
	};
	$.easing[ "easeInOut" + name ] = function( p ) {
		return p < 0.5 ?
			easeIn( p * 2 ) / 2 :
			1 - easeIn( p * -2 + 2 ) / 2;
	};
});

})();

})(jQuery);
(function( $, undefined ) {

var rvertical = /up|down|vertical/,
	rpositivemotion = /up|left|vertical|horizontal/;

$.effects.effect.blind = function( o, done ) {
	// Create element
	var el = $( this ),
		props = [ "position", "top", "bottom", "left", "right", "height", "width" ],
		mode = $.effects.setMode( el, o.mode || "hide" ),
		direction = o.direction || "up",
		vertical = rvertical.test( direction ),
		ref = vertical ? "height" : "width",
		ref2 = vertical ? "top" : "left",
		motion = rpositivemotion.test( direction ),
		animation = {},
		show = mode === "show",
		wrapper, distance, margin;

	// if already wrapped, the wrapper's properties are my property. #6245
	if ( el.parent().is( ".ui-effects-wrapper" ) ) {
		$.effects.save( el.parent(), props );
	} else {
		$.effects.save( el, props );
	}
	el.show();
	wrapper = $.effects.createWrapper( el ).css({
		overflow: "hidden"
	});

	distance = wrapper[ ref ]();
	margin = parseFloat( wrapper.css( ref2 ) ) || 0;

	animation[ ref ] = show ? distance : 0;
	if ( !motion ) {
		el
			.css( vertical ? "bottom" : "right", 0 )
			.css( vertical ? "top" : "left", "auto" )
			.css({ position: "absolute" });

		animation[ ref2 ] = show ? margin : distance + margin;
	}

	// start at 0 if we are showing
	if ( show ) {
		wrapper.css( ref, 0 );
		if ( ! motion ) {
			wrapper.css( ref2, margin + distance );
		}
	}

	// Animate
	wrapper.animate( animation, {
		duration: o.duration,
		easing: o.easing,
		queue: false,
		complete: function() {
			if ( mode === "hide" ) {
				el.hide();
			}
			$.effects.restore( el, props );
			$.effects.removeWrapper( el );
			done();
		}
	});

};

})(jQuery);
(function( $, undefined ) {

$.effects.effect.bounce = function( o, done ) {
	var el = $( this ),
		props = [ "position", "top", "bottom", "left", "right", "height", "width" ],

		// defaults:
		mode = $.effects.setMode( el, o.mode || "effect" ),
		hide = mode === "hide",
		show = mode === "show",
		direction = o.direction || "up",
		distance = o.distance,
		times = o.times || 5,

		// number of internal animations
		anims = times * 2 + ( show || hide ? 1 : 0 ),
		speed = o.duration / anims,
		easing = o.easing,

		// utility:
		ref = ( direction === "up" || direction === "down" ) ? "top" : "left",
		motion = ( direction === "up" || direction === "left" ),
		i,
		upAnim,
		downAnim,

		// we will need to re-assemble the queue to stack our animations in place
		queue = el.queue(),
		queuelen = queue.length;

	// Avoid touching opacity to prevent clearType and PNG issues in IE
	if ( show || hide ) {
		props.push( "opacity" );
	}

	$.effects.save( el, props );
	el.show();
	$.effects.createWrapper( el ); // Create Wrapper

	// default distance for the BIGGEST bounce is the outer Distance / 3
	if ( !distance ) {
		distance = el[ ref === "top" ? "outerHeight" : "outerWidth" ]() / 3;
	}

	if ( show ) {
		downAnim = { opacity: 1 };
		downAnim[ ref ] = 0;

		// if we are showing, force opacity 0 and set the initial position
		// then do the "first" animation
		el.css( "opacity", 0 )
			.css( ref, motion ? -distance * 2 : distance * 2 )
			.animate( downAnim, speed, easing );
	}

	// start at the smallest distance if we are hiding
	if ( hide ) {
		distance = distance / Math.pow( 2, times - 1 );
	}

	downAnim = {};
	downAnim[ ref ] = 0;
	// Bounces up/down/left/right then back to 0 -- times * 2 animations happen here
	for ( i = 0; i < times; i++ ) {
		upAnim = {};
		upAnim[ ref ] = ( motion ? "-=" : "+=" ) + distance;

		el.animate( upAnim, speed, easing )
			.animate( downAnim, speed, easing );

		distance = hide ? distance * 2 : distance / 2;
	}

	// Last Bounce when Hiding
	if ( hide ) {
		upAnim = { opacity: 0 };
		upAnim[ ref ] = ( motion ? "-=" : "+=" ) + distance;

		el.animate( upAnim, speed, easing );
	}

	el.queue(function() {
		if ( hide ) {
			el.hide();
		}
		$.effects.restore( el, props );
		$.effects.removeWrapper( el );
		done();
	});

	// inject all the animations we just queued to be first in line (after "inprogress")
	if ( queuelen > 1) {
		queue.splice.apply( queue,
			[ 1, 0 ].concat( queue.splice( queuelen, anims + 1 ) ) );
	}
	el.dequeue();

};

})(jQuery);
(function( $, undefined ) {

$.effects.effect.clip = function( o, done ) {
	// Create element
	var el = $( this ),
		props = [ "position", "top", "bottom", "left", "right", "height", "width" ],
		mode = $.effects.setMode( el, o.mode || "hide" ),
		show = mode === "show",
		direction = o.direction || "vertical",
		vert = direction === "vertical",
		size = vert ? "height" : "width",
		position = vert ? "top" : "left",
		animation = {},
		wrapper, animate, distance;

	// Save & Show
	$.effects.save( el, props );
	el.show();

	// Create Wrapper
	wrapper = $.effects.createWrapper( el ).css({
		overflow: "hidden"
	});
	animate = ( el[0].tagName === "IMG" ) ? wrapper : el;
	distance = animate[ size ]();

	// Shift
	if ( show ) {
		animate.css( size, 0 );
		animate.css( position, distance / 2 );
	}

	// Create Animation Object:
	animation[ size ] = show ? distance : 0;
	animation[ position ] = show ? 0 : distance / 2;

	// Animate
	animate.animate( animation, {
		queue: false,
		duration: o.duration,
		easing: o.easing,
		complete: function() {
			if ( !show ) {
				el.hide();
			}
			$.effects.restore( el, props );
			$.effects.removeWrapper( el );
			done();
		}
	});

};

})(jQuery);
(function( $, undefined ) {

$.effects.effect.drop = function( o, done ) {

	var el = $( this ),
		props = [ "position", "top", "bottom", "left", "right", "opacity", "height", "width" ],
		mode = $.effects.setMode( el, o.mode || "hide" ),
		show = mode === "show",
		direction = o.direction || "left",
		ref = ( direction === "up" || direction === "down" ) ? "top" : "left",
		motion = ( direction === "up" || direction === "left" ) ? "pos" : "neg",
		animation = {
			opacity: show ? 1 : 0
		},
		distance;

	// Adjust
	$.effects.save( el, props );
	el.show();
	$.effects.createWrapper( el );

	distance = o.distance || el[ ref === "top" ? "outerHeight": "outerWidth" ]( true ) / 2;

	if ( show ) {
		el
			.css( "opacity", 0 )
			.css( ref, motion === "pos" ? -distance : distance );
	}

	// Animation
	animation[ ref ] = ( show ?
		( motion === "pos" ? "+=" : "-=" ) :
		( motion === "pos" ? "-=" : "+=" ) ) +
		distance;

	// Animate
	el.animate( animation, {
		queue: false,
		duration: o.duration,
		easing: o.easing,
		complete: function() {
			if ( mode === "hide" ) {
				el.hide();
			}
			$.effects.restore( el, props );
			$.effects.removeWrapper( el );
			done();
		}
	});
};

})(jQuery);
(function( $, undefined ) {

$.effects.effect.explode = function( o, done ) {

	var rows = o.pieces ? Math.round( Math.sqrt( o.pieces ) ) : 3,
		cells = rows,
		el = $( this ),
		mode = $.effects.setMode( el, o.mode || "hide" ),
		show = mode === "show",

		// show and then visibility:hidden the element before calculating offset
		offset = el.show().css( "visibility", "hidden" ).offset(),

		// width and height of a piece
		width = Math.ceil( el.outerWidth() / cells ),
		height = Math.ceil( el.outerHeight() / rows ),
		pieces = [],

		// loop
		i, j, left, top, mx, my;

	// children animate complete:
	function childComplete() {
		pieces.push( this );
		if ( pieces.length === rows * cells ) {
			animComplete();
		}
	}

	// clone the element for each row and cell.
	for( i = 0; i < rows ; i++ ) { // ===>
		top = offset.top + i * height;
		my = i - ( rows - 1 ) / 2 ;

		for( j = 0; j < cells ; j++ ) { // |||
			left = offset.left + j * width;
			mx = j - ( cells - 1 ) / 2 ;

			// Create a clone of the now hidden main element that will be absolute positioned
			// within a wrapper div off the -left and -top equal to size of our pieces
			el
				.clone()
				.appendTo( "body" )
				.wrap( "<div></div>" )
				.css({
					position: "absolute",
					visibility: "visible",
					left: -j * width,
					top: -i * height
				})

			// select the wrapper - make it overflow: hidden and absolute positioned based on
			// where the original was located +left and +top equal to the size of pieces
				.parent()
				.addClass( "ui-effects-explode" )
				.css({
					position: "absolute",
					overflow: "hidden",
					width: width,
					height: height,
					left: left + ( show ? mx * width : 0 ),
					top: top + ( show ? my * height : 0 ),
					opacity: show ? 0 : 1
				}).animate({
					left: left + ( show ? 0 : mx * width ),
					top: top + ( show ? 0 : my * height ),
					opacity: show ? 1 : 0
				}, o.duration || 500, o.easing, childComplete );
		}
	}

	function animComplete() {
		el.css({
			visibility: "visible"
		});
		$( pieces ).remove();
		if ( !show ) {
			el.hide();
		}
		done();
	}
};

})(jQuery);
(function( $, undefined ) {

$.effects.effect.fade = function( o, done ) {
	var el = $( this ),
		mode = $.effects.setMode( el, o.mode || "toggle" );

	el.animate({
		opacity: mode
	}, {
		queue: false,
		duration: o.duration,
		easing: o.easing,
		complete: done
	});
};

})( jQuery );
(function( $, undefined ) {

$.effects.effect.fold = function( o, done ) {

	// Create element
	var el = $( this ),
		props = [ "position", "top", "bottom", "left", "right", "height", "width" ],
		mode = $.effects.setMode( el, o.mode || "hide" ),
		show = mode === "show",
		hide = mode === "hide",
		size = o.size || 15,
		percent = /([0-9]+)%/.exec( size ),
		horizFirst = !!o.horizFirst,
		widthFirst = show !== horizFirst,
		ref = widthFirst ? [ "width", "height" ] : [ "height", "width" ],
		duration = o.duration / 2,
		wrapper, distance,
		animation1 = {},
		animation2 = {};

	$.effects.save( el, props );
	el.show();

	// Create Wrapper
	wrapper = $.effects.createWrapper( el ).css({
		overflow: "hidden"
	});
	distance = widthFirst ?
		[ wrapper.width(), wrapper.height() ] :
		[ wrapper.height(), wrapper.width() ];

	if ( percent ) {
		size = parseInt( percent[ 1 ], 10 ) / 100 * distance[ hide ? 0 : 1 ];
	}
	if ( show ) {
		wrapper.css( horizFirst ? {
			height: 0,
			width: size
		} : {
			height: size,
			width: 0
		});
	}

	// Animation
	animation1[ ref[ 0 ] ] = show ? distance[ 0 ] : size;
	animation2[ ref[ 1 ] ] = show ? distance[ 1 ] : 0;

	// Animate
	wrapper
		.animate( animation1, duration, o.easing )
		.animate( animation2, duration, o.easing, function() {
			if ( hide ) {
				el.hide();
			}
			$.effects.restore( el, props );
			$.effects.removeWrapper( el );
			done();
		});

};

})(jQuery);
(function( $, undefined ) {

$.effects.effect.highlight = function( o, done ) {
	var elem = $( this ),
		props = [ "backgroundImage", "backgroundColor", "opacity" ],
		mode = $.effects.setMode( elem, o.mode || "show" ),
		animation = {
			backgroundColor: elem.css( "backgroundColor" )
		};

	if (mode === "hide") {
		animation.opacity = 0;
	}

	$.effects.save( elem, props );

	elem
		.show()
		.css({
			backgroundImage: "none",
			backgroundColor: o.color || "#ffff99"
		})
		.animate( animation, {
			queue: false,
			duration: o.duration,
			easing: o.easing,
			complete: function() {
				if ( mode === "hide" ) {
					elem.hide();
				}
				$.effects.restore( elem, props );
				done();
			}
		});
};

})(jQuery);
(function( $, undefined ) {

$.effects.effect.pulsate = function( o, done ) {
	var elem = $( this ),
		mode = $.effects.setMode( elem, o.mode || "show" ),
		show = mode === "show",
		hide = mode === "hide",
		showhide = ( show || mode === "hide" ),

		// showing or hiding leaves of the "last" animation
		anims = ( ( o.times || 5 ) * 2 ) + ( showhide ? 1 : 0 ),
		duration = o.duration / anims,
		animateTo = 0,
		queue = elem.queue(),
		queuelen = queue.length,
		i;

	if ( show || !elem.is(":visible")) {
		elem.css( "opacity", 0 ).show();
		animateTo = 1;
	}

	// anims - 1 opacity "toggles"
	for ( i = 1; i < anims; i++ ) {
		elem.animate({
			opacity: animateTo
		}, duration, o.easing );
		animateTo = 1 - animateTo;
	}

	elem.animate({
		opacity: animateTo
	}, duration, o.easing);

	elem.queue(function() {
		if ( hide ) {
			elem.hide();
		}
		done();
	});

	// We just queued up "anims" animations, we need to put them next in the queue
	if ( queuelen > 1 ) {
		queue.splice.apply( queue,
			[ 1, 0 ].concat( queue.splice( queuelen, anims + 1 ) ) );
	}
	elem.dequeue();
};

})(jQuery);
(function( $, undefined ) {

$.effects.effect.puff = function( o, done ) {
	var elem = $( this ),
		mode = $.effects.setMode( elem, o.mode || "hide" ),
		hide = mode === "hide",
		percent = parseInt( o.percent, 10 ) || 150,
		factor = percent / 100,
		original = {
			height: elem.height(),
			width: elem.width(),
			outerHeight: elem.outerHeight(),
			outerWidth: elem.outerWidth()
		};

	$.extend( o, {
		effect: "scale",
		queue: false,
		fade: true,
		mode: mode,
		complete: done,
		percent: hide ? percent : 100,
		from: hide ?
			original :
			{
				height: original.height * factor,
				width: original.width * factor,
				outerHeight: original.outerHeight * factor,
				outerWidth: original.outerWidth * factor
			}
	});

	elem.effect( o );
};

$.effects.effect.scale = function( o, done ) {

	// Create element
	var el = $( this ),
		options = $.extend( true, {}, o ),
		mode = $.effects.setMode( el, o.mode || "effect" ),
		percent = parseInt( o.percent, 10 ) ||
			( parseInt( o.percent, 10 ) === 0 ? 0 : ( mode === "hide" ? 0 : 100 ) ),
		direction = o.direction || "both",
		origin = o.origin,
		original = {
			height: el.height(),
			width: el.width(),
			outerHeight: el.outerHeight(),
			outerWidth: el.outerWidth()
		},
		factor = {
			y: direction !== "horizontal" ? (percent / 100) : 1,
			x: direction !== "vertical" ? (percent / 100) : 1
		};

	// We are going to pass this effect to the size effect:
	options.effect = "size";
	options.queue = false;
	options.complete = done;

	// Set default origin and restore for show/hide
	if ( mode !== "effect" ) {
		options.origin = origin || ["middle","center"];
		options.restore = true;
	}

	options.from = o.from || ( mode === "show" ? {
		height: 0,
		width: 0,
		outerHeight: 0,
		outerWidth: 0
	} : original );
	options.to = {
		height: original.height * factor.y,
		width: original.width * factor.x,
		outerHeight: original.outerHeight * factor.y,
		outerWidth: original.outerWidth * factor.x
	};

	// Fade option to support puff
	if ( options.fade ) {
		if ( mode === "show" ) {
			options.from.opacity = 0;
			options.to.opacity = 1;
		}
		if ( mode === "hide" ) {
			options.from.opacity = 1;
			options.to.opacity = 0;
		}
	}

	// Animate
	el.effect( options );

};

$.effects.effect.size = function( o, done ) {

	// Create element
	var original, baseline, factor,
		el = $( this ),
		props0 = [ "position", "top", "bottom", "left", "right", "width", "height", "overflow", "opacity" ],

		// Always restore
		props1 = [ "position", "top", "bottom", "left", "right", "overflow", "opacity" ],

		// Copy for children
		props2 = [ "width", "height", "overflow" ],
		cProps = [ "fontSize" ],
		vProps = [ "borderTopWidth", "borderBottomWidth", "paddingTop", "paddingBottom" ],
		hProps = [ "borderLeftWidth", "borderRightWidth", "paddingLeft", "paddingRight" ],

		// Set options
		mode = $.effects.setMode( el, o.mode || "effect" ),
		restore = o.restore || mode !== "effect",
		scale = o.scale || "both",
		origin = o.origin || [ "middle", "center" ],
		position = el.css( "position" ),
		props = restore ? props0 : props1,
		zero = {
			height: 0,
			width: 0,
			outerHeight: 0,
			outerWidth: 0
		};

	if ( mode === "show" ) {
		el.show();
	}
	original = {
		height: el.height(),
		width: el.width(),
		outerHeight: el.outerHeight(),
		outerWidth: el.outerWidth()
	};

	if ( o.mode === "toggle" && mode === "show" ) {
		el.from = o.to || zero;
		el.to = o.from || original;
	} else {
		el.from = o.from || ( mode === "show" ? zero : original );
		el.to = o.to || ( mode === "hide" ? zero : original );
	}

	// Set scaling factor
	factor = {
		from: {
			y: el.from.height / original.height,
			x: el.from.width / original.width
		},
		to: {
			y: el.to.height / original.height,
			x: el.to.width / original.width
		}
	};

	// Scale the css box
	if ( scale === "box" || scale === "both" ) {

		// Vertical props scaling
		if ( factor.from.y !== factor.to.y ) {
			props = props.concat( vProps );
			el.from = $.effects.setTransition( el, vProps, factor.from.y, el.from );
			el.to = $.effects.setTransition( el, vProps, factor.to.y, el.to );
		}

		// Horizontal props scaling
		if ( factor.from.x !== factor.to.x ) {
			props = props.concat( hProps );
			el.from = $.effects.setTransition( el, hProps, factor.from.x, el.from );
			el.to = $.effects.setTransition( el, hProps, factor.to.x, el.to );
		}
	}

	// Scale the content
	if ( scale === "content" || scale === "both" ) {

		// Vertical props scaling
		if ( factor.from.y !== factor.to.y ) {
			props = props.concat( cProps ).concat( props2 );
			el.from = $.effects.setTransition( el, cProps, factor.from.y, el.from );
			el.to = $.effects.setTransition( el, cProps, factor.to.y, el.to );
		}
	}

	$.effects.save( el, props );
	el.show();
	$.effects.createWrapper( el );
	el.css( "overflow", "hidden" ).css( el.from );

	// Adjust
	if (origin) { // Calculate baseline shifts
		baseline = $.effects.getBaseline( origin, original );
		el.from.top = ( original.outerHeight - el.outerHeight() ) * baseline.y;
		el.from.left = ( original.outerWidth - el.outerWidth() ) * baseline.x;
		el.to.top = ( original.outerHeight - el.to.outerHeight ) * baseline.y;
		el.to.left = ( original.outerWidth - el.to.outerWidth ) * baseline.x;
	}
	el.css( el.from ); // set top & left

	// Animate
	if ( scale === "content" || scale === "both" ) { // Scale the children

		// Add margins/font-size
		vProps = vProps.concat([ "marginTop", "marginBottom" ]).concat(cProps);
		hProps = hProps.concat([ "marginLeft", "marginRight" ]);
		props2 = props0.concat(vProps).concat(hProps);

		el.find( "*[width]" ).each( function(){
			var child = $( this ),
				c_original = {
					height: child.height(),
					width: child.width(),
					outerHeight: child.outerHeight(),
					outerWidth: child.outerWidth()
				};
			if (restore) {
				$.effects.save(child, props2);
			}

			child.from = {
				height: c_original.height * factor.from.y,
				width: c_original.width * factor.from.x,
				outerHeight: c_original.outerHeight * factor.from.y,
				outerWidth: c_original.outerWidth * factor.from.x
			};
			child.to = {
				height: c_original.height * factor.to.y,
				width: c_original.width * factor.to.x,
				outerHeight: c_original.height * factor.to.y,
				outerWidth: c_original.width * factor.to.x
			};

			// Vertical props scaling
			if ( factor.from.y !== factor.to.y ) {
				child.from = $.effects.setTransition( child, vProps, factor.from.y, child.from );
				child.to = $.effects.setTransition( child, vProps, factor.to.y, child.to );
			}

			// Horizontal props scaling
			if ( factor.from.x !== factor.to.x ) {
				child.from = $.effects.setTransition( child, hProps, factor.from.x, child.from );
				child.to = $.effects.setTransition( child, hProps, factor.to.x, child.to );
			}

			// Animate children
			child.css( child.from );
			child.animate( child.to, o.duration, o.easing, function() {

				// Restore children
				if ( restore ) {
					$.effects.restore( child, props2 );
				}
			});
		});
	}

	// Animate
	el.animate( el.to, {
		queue: false,
		duration: o.duration,
		easing: o.easing,
		complete: function() {
			if ( el.to.opacity === 0 ) {
				el.css( "opacity", el.from.opacity );
			}
			if( mode === "hide" ) {
				el.hide();
			}
			$.effects.restore( el, props );
			if ( !restore ) {

				// we need to calculate our new positioning based on the scaling
				if ( position === "static" ) {
					el.css({
						position: "relative",
						top: el.to.top,
						left: el.to.left
					});
				} else {
					$.each([ "top", "left" ], function( idx, pos ) {
						el.css( pos, function( _, str ) {
							var val = parseInt( str, 10 ),
								toRef = idx ? el.to.left : el.to.top;

							// if original was "auto", recalculate the new value from wrapper
							if ( str === "auto" ) {
								return toRef + "px";
							}

							return val + toRef + "px";
						});
					});
				}
			}

			$.effects.removeWrapper( el );
			done();
		}
	});

};

})(jQuery);
(function( $, undefined ) {

$.effects.effect.shake = function( o, done ) {

	var el = $( this ),
		props = [ "position", "top", "bottom", "left", "right", "height", "width" ],
		mode = $.effects.setMode( el, o.mode || "effect" ),
		direction = o.direction || "left",
		distance = o.distance || 20,
		times = o.times || 3,
		anims = times * 2 + 1,
		speed = Math.round(o.duration/anims),
		ref = (direction === "up" || direction === "down") ? "top" : "left",
		positiveMotion = (direction === "up" || direction === "left"),
		animation = {},
		animation1 = {},
		animation2 = {},
		i,

		// we will need to re-assemble the queue to stack our animations in place
		queue = el.queue(),
		queuelen = queue.length;

	$.effects.save( el, props );
	el.show();
	$.effects.createWrapper( el );

	// Animation
	animation[ ref ] = ( positiveMotion ? "-=" : "+=" ) + distance;
	animation1[ ref ] = ( positiveMotion ? "+=" : "-=" ) + distance * 2;
	animation2[ ref ] = ( positiveMotion ? "-=" : "+=" ) + distance * 2;

	// Animate
	el.animate( animation, speed, o.easing );

	// Shakes
	for ( i = 1; i < times; i++ ) {
		el.animate( animation1, speed, o.easing ).animate( animation2, speed, o.easing );
	}
	el
		.animate( animation1, speed, o.easing )
		.animate( animation, speed / 2, o.easing )
		.queue(function() {
			if ( mode === "hide" ) {
				el.hide();
			}
			$.effects.restore( el, props );
			$.effects.removeWrapper( el );
			done();
		});

	// inject all the animations we just queued to be first in line (after "inprogress")
	if ( queuelen > 1) {
		queue.splice.apply( queue,
			[ 1, 0 ].concat( queue.splice( queuelen, anims + 1 ) ) );
	}
	el.dequeue();

};

})(jQuery);
(function( $, undefined ) {

$.effects.effect.slide = function( o, done ) {

	// Create element
	var el = $( this ),
		props = [ "position", "top", "bottom", "left", "right", "width", "height" ],
		mode = $.effects.setMode( el, o.mode || "show" ),
		show = mode === "show",
		direction = o.direction || "left",
		ref = (direction === "up" || direction === "down") ? "top" : "left",
		positiveMotion = (direction === "up" || direction === "left"),
		distance,
		animation = {};

	// Adjust
	$.effects.save( el, props );
	el.show();
	distance = o.distance || el[ ref === "top" ? "outerHeight" : "outerWidth" ]( true );

	$.effects.createWrapper( el ).css({
		overflow: "hidden"
	});

	if ( show ) {
		el.css( ref, positiveMotion ? (isNaN(distance) ? "-" + distance : -distance) : distance );
	}

	// Animation
	animation[ ref ] = ( show ?
		( positiveMotion ? "+=" : "-=") :
		( positiveMotion ? "-=" : "+=")) +
		distance;

	// Animate
	el.animate( animation, {
		queue: false,
		duration: o.duration,
		easing: o.easing,
		complete: function() {
			if ( mode === "hide" ) {
				el.hide();
			}
			$.effects.restore( el, props );
			$.effects.removeWrapper( el );
			done();
		}
	});
};

})(jQuery);
(function( $, undefined ) {

$.effects.effect.transfer = function( o, done ) {
	var elem = $( this ),
		target = $( o.to ),
		targetFixed = target.css( "position" ) === "fixed",
		body = $("body"),
		fixTop = targetFixed ? body.scrollTop() : 0,
		fixLeft = targetFixed ? body.scrollLeft() : 0,
		endPosition = target.offset(),
		animation = {
			top: endPosition.top - fixTop ,
			left: endPosition.left - fixLeft ,
			height: target.innerHeight(),
			width: target.innerWidth()
		},
		startPosition = elem.offset(),
		transfer = $( "<div class='ui-effects-transfer'></div>" )
			.appendTo( document.body )
			.addClass( o.className )
			.css({
				top: startPosition.top - fixTop ,
				left: startPosition.left - fixLeft ,
				height: elem.innerHeight(),
				width: elem.innerWidth(),
				position: targetFixed ? "fixed" : "absolute"
			})
			.animate( animation, o.duration, o.easing, function() {
				transfer.remove();
				done();
			});
};

})(jQuery);
;/*
 * imgAreaSelect jQuery plugin
 * version 0.9.9
 *
 * Copyright (c) 2008-2012 Michal Wojciechowski (odyniec.net)
 *
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://odyniec.net/projects/imgareaselect/
 *
 */

(function($) {

/*
 * Math functions will be used extensively, so it's convenient to make a few
 * shortcuts
 */
var abs = Math.abs,
    max = Math.max,
    min = Math.min,
    round = Math.round;

function div(cssClass) {
    /**
     * Create a new HTML div element, with optional class cssClass
     *
     * @return A jQuery object representing the new element
     */
    var mydiv = $('<div/>');
    mydiv.addClass("imgareaselect");
    if(cssClass){
        mydiv.addClass(cssClass);
    }
    return mydiv
}

$.imgAreaSelect = function (img, options) {

    // variables that happen once, or apply to all selections on this image.
    var
        /* jQuery object representing the image */
        $img = $(img),

        minWidth, minHeight, maxWidth, maxHeight,

        /* User agent */
        ua = navigator.userAgent,

        //selections lol
        selections = [],

        /* Selection area constraints */
        minWidth, minHeight, maxWidth, maxHeight,

        /* Document element */
        docElem = document.documentElement,

        /* User agent */
        ua = navigator.userAgent,

        /* Image position (relative to viewport) */
        left, top,

        /* Image offset (as returned by .offset()) */
        imgOfs = { left: 0, top: 0 },

        /* Image dimensions (as returned by .width() and .height()) */
        imgWidth, imgHeight,

        /* Horizontal and vertical scaling factors, as they relate to the image's true (i.e. not scaled by CSS) height */
        scaleX, scaleY,

        /* temporary global variables because everything is awful TODO: remove */
        startX, startY,

        /* Parent element offset (as returned by .offset()) */
        parOfs = { left: 0, top: 0 },

        /* keeps track of the most recently edited selection, for proper event binding/unbinding. */
        most_recent_selection,

        /*
         * jQuery object representing the parent element that the plugin
         * elements are appended to.
         *
         * Default: body
         */
        $parent = $('body'),

        /* Base z-index for plugin elements */
        zIndex = 0,


        /* Has the image finished loading? */
        imgLoaded;

    //variables that we have once per selection.
    function Selection(x1, y1, x2, y2, noScale){
        this.$box = div("imgareaselect-box");
        this.$area = div("imgareaselect-area");
        this.$border = div("imgareaselect-border-1").add(div("imgareaselect-border-2")).add(div("imgareaselect-border-3")).add(div("imgareaselect-border-4"));
        //$outer = div("imgareaselect-outer-1").add(div("imgareaselect-outer-2")).add(div("imgareaselect-outer-3")).add(div("imgareaselect-outer-4")),

        this.$closeBtn = div("imgareaselect-closebtn");
        this.$closeBtn.html("<div class='closeBtnInner'>×</div>");
        this.$closeBtn.on('click.imgareaselect-closebtn', _.bind(this.cancelSelection, this)); // function(event){ this.cancelSelection(true); event.stopPropagation(); return false; });

        /* set up handles */
        this.$handles = $([]);
        if (options.handles != null) {
            this.$handles.remove();
            this.$handles = $([]);

            this.i = options.handles ? options.handles == 'corners' ? 4 : 8 : 0;

            while (this.i--)
                this.$handles = this.$handles.add(div());

            /* Add a class to handles and set the CSS properties */
            this.$handles.addClass(options.classPrefix + '-handle').css({
                position: 'absolute',
                /*
                 * The font-size property needs to be set to zero, otherwise
                 * Internet Explorer makes the handles too large
                 */
                fontSize: 0,
                zIndex: zIndex + 1 || 1
            });

            /*
             * If handle width/height has not been set with CSS rules, set the
             * default 5px
             */
            if (!parseInt(this.$handles.css('width')) >= 0)
                this.$handles.width(5).height(5);

            /*
             * If the borderWidth option is in use, add a solid border to
             * handles
             */
            if (this.o = options.borderWidth)
                this.$handles.css({ borderWidth: o, borderStyle: 'solid' });

            /* Apply other style options */
            styleOptions(this.$handles, { borderColor1: 'border-color',
                borderColor2: 'background-color',
                borderOpacity: 'opacity' });
        };

        /*
         * Additional element to work around a cursor problem in Opera
         * (explained later)
         */
        this.$areaOpera;

        /* Plugin elements position */
        this.position = 'absolute';

        /* X/Y coordinates of the starting point for move/resize operations */
        this.startX, this.startY;

        /* Current resize mode ("nw", "se", etc.) */
        this.resize;

        /* Aspect ratio to maintain (floating point number) */
        this.aspectRatio;

        /* Are this box's elements currently displayed? */
        this.shown;

        /* Current selection (relative to parent element) */
        this.x1, this.y1, this.x2, this.y2;


        /* Various helper variables used throughout the code */
        this.$p, this.d, this.i, this.o, this.w, this.h, this.adjusted;

        if (options.disable || options.enable === false) {
            /* Disable the plugin */
            this.$box.unbind('mousemove.imgareaselect').unbind('mousedown.imgareaselect', areaMouseDown);
        }else {
            /* Enable the plugin */
            if (options.resizable || options.movable){
                this.$box.on('mousemove.imgareaselect', _.bind(this.areaMouseMove, this)).on('mousedown.imgareaselect', _.bind(this.areaMouseDown, this));
            }
        }

        /* Current selection (relative to scaled image) */
        this.selection = { x1: 0, y1: 0, x2: 0, y2: 0, width: 0, height: 0 };

        if (x1 && y1 && x2 && y2 ){ //if dimensions are specified, set them and display the selection.
            this.setSelection(x1, y1, x2, y2, noScale);
            this.shown = true;
            this.doUpdate();
        }

        $parent.append(this.$box);
        this.$box/*.add($outer)*/.css({ position: this.position,
            overflow: 'hidden', zIndex: zIndex || '0' });
        this.$box.css({ zIndex: zIndex + 2 || 2 });
        this.$closeBtn.css({ zIndex: zIndex + 3 || 3 });
        this.$area.add(this.$border).css({ position: 'absolute', fontSize: 0 });

        $parent.append(this.$closeBtn);
        this.$box.append(this.$area.add(this.$border).add(this.$areaOpera)).append(this.$handles);
    }; //ends the object

    /**
     * Set the current selection
     *
     * @param x1
     *            X coordinate of the upper left corner of the selection area
     * @param y1
     *            Y coordinate of the upper left corner of the selection area
     * @param x2
     *            X coordinate of the lower right corner of the selection area
     * @param y2
     *            Y coordinate of the lower right corner of the selection area
     * @param noScale
     *            If set to <code>true</code>, scaling is not applied to the
     *            new selection
     */
    Selection.prototype.setSelection = function(x1, y1, x2, y2, noScale) {
        var sx = noScale || scaleX || 1; //TODO: the options version should override this, but it doesnt'. Fix.
        var sy = noScale || scaleY || 1;

        this.selection = {
            x1: round(x1 / sx || 0),
            y1: round(y1 / sy || 0),
            x2: round(x2 / sx || 0),
            y2: round(y2 / sy || 0)
        };

        this.selection.width = this.selection.x2 - this.selection.x1;
        this.selection.height = this.selection.y2 - this.selection.y1;
    };


    /**
     * Update plugin elements
     *
     * @param resetKeyPress
     *            If set to <code>false</code>, this instance's keypress
     *            event handler is not activated
     */
    Selection.prototype.update = function(resetKeyPress) {
        /* If plugin elements are hidden, do nothing */
        if (!this.shown) return;
        /*
         * Set the position and size of the container box and the selection area
         * inside it
         */
        this.$box.css({ left: viewX(this.selection.x1), top: viewY(this.selection.y1) })
            .add(this.$area).width(this.w = this.selection.width).height(this.h = this.selection.height);

        /*
         * Reset the position of selection area, borders, and handles (IE6/IE7
         * position them incorrectly if we don't do this)
         */
        this.$area.add(this.$border).add(this.$handles).css({ left: 0, top: 0 });

        this.$closeBtn.css({left: left + this.selection.x2 + 4, top: top + this.selection.y1 - 20});

        /* Set border dimensions */
        this.$border
            .width(max(this.w - this.$border.outerWidth() + this.$border.innerWidth(), 0))
            .height(max(this.h - this.$border.outerHeight() + this.$border.innerHeight(), 0));

        /* Arrange the outer area elements */
        /*$($outer[0]).css({ left: left, top: top,
            width: selection.x1, height: imgHeight });
        $($outer[1]).css({ left: left + selection.x1, top: top,
            width: w, height: selection.y1 });
        $($outer[2]).css({ left: left + selection.x2, top: top,
            width: imgWidth - selection.x2, height: imgHeight });
        $($outer[3]).css({ left: left + selection.x1, top: top + selection.y2,
            width: w, height: imgHeight - selection.y2 });*/

        this.w -= this.$handles.outerWidth();
        this.h -= this.$handles.outerHeight();

        /* Arrange handles */
        switch (this.$handles.length) {
        case 8:
            $(this.$handles[4]).css({ left: this.w >> 1 }); // n >> 1 just means Math.floor(n / 2)
            $(this.$handles[5]).css({ left: this.w, top: this.h >> 1 });
            $(this.$handles[6]).css({ left: this.w >> 1, top: this.h });
            $(this.$handles[7]).css({ top: this.h >> 1 });
        case 4:
            this.$handles.slice(1,3).css({ left: this.w });
            this.$handles.slice(2,4).css({ top: this.h });
        }

        if (resetKeyPress !== false) {
            /*
             * Need to reset the document keypress event handler -- unbind the
             * current handler
             */
            if ($.imgAreaSelect.onKeyPress != docKeyPress)
                $(document).unbind($.imgAreaSelect.keyPress,
                    $.imgAreaSelect.onKeyPress);

            if (options.keys)
                /*
                 * Set the document keypress event handler to this instance's
                 * docKeyPress() function
                 */
                $(document)[$.imgAreaSelect.keyPress](
                    $.imgAreaSelect.onKeyPress = docKeyPress);
        }

        /*
         * Internet Explorer displays 1px-wide dashed borders incorrectly by
         * filling the spaces between dashes with white. Toggling the margin
         * property between 0 and "auto" fixes this in IE6 and IE7 (IE8 is still
         * broken). This workaround is not perfect, as it requires setTimeout()
         * and thus causes the border to flicker a bit, but I haven't found a
         * better solution.
         *
         * Note: This only happens with CSS borders, set with the borderWidth,
         * borderOpacity, borderColor1, and borderColor2 options (which are now
         * deprecated). Borders created with GIF background images are fine.
         */
        if ($.browser.msie && this.$border.outerWidth() - this.$border.innerWidth() == 2) {
            this.$border.css('margin', 0);
            setTimeout(function () { this.$border.css('margin', 'auto'); }, 0);
        }
    };

    /**
     * Do the complete update sequence: recalculate offsets, update the
     * elements, and set the correct values of x1, y1, x2, and y2.
     *
     * @param resetKeyPress
     *            If set to <code>false</code>, this instance's keypress
     *            event handler is not activated
     */
    Selection.prototype.doUpdate = function(resetKeyPress) {
        adjust();
        this.update(resetKeyPress);

        this.x1 = viewX(this.selection.x1);
        this.y1 = viewY(this.selection.y1);
        this.x2 = viewX(this.selection.x2);
        this.y2 = viewY(this.selection.y2);
    };

    /**
     * Hide or fade out an element (or multiple elements)
     *
     * @param $elem
     *            A jQuery object containing the element(s) to hide/fade out
     * @param fn
     *            Callback function to be called when fadeOut() completes
     */
    Selection.prototype.hide = function($elem, fn) {
        options.fadeSpeed ? $elem.fadeOut(options.fadeSpeed, fn) : $elem.hide();
    };

    /**
     * Selection area mousemove event handler
     *
     * @param event
     *            The event object
     */
    Selection.prototype.areaMouseMove = function(event) {
        var x = selX(evX(event)) - this.selection.x1,
            y = selY(evY(event)) - this.selection.y1;

        if (!this.adjusted) {
            adjust();
            this.adjusted = true;

            this.$box.one('mouseout', function () { this.adjusted = false; });
        }

        /* Clear the resize mode */
        this.resize = '';

        if (options.resizable) {
            /*
             * Check if the mouse pointer is over the resize margin area and set
             * the resize mode accordingly
             */
            if (y <= options.resizeMargin)
                this.resize = 'n';
            else if (y >= this.selection.height - options.resizeMargin)
                this.resize = 's';
            if (x <= options.resizeMargin)
                this.resize += 'w';
            else if (x >= this.selection.width - options.resizeMargin)
                this.resize += 'e';
        }

        this.$box.css('cursor', this.resize ? this.resize + '-resize' :
            options.movable ? 'move' : '');
        if (this.$areaOpera)
            this.$areaOpera.toggle();
    };


    /**
     * Selection area mousedown event handler
     *
     * @param event
     *            The event object
     * @return false
     */
    Selection.prototype.areaMouseDown = function(event) {
        if (event.which != 1) return false;

        adjust();

        most_recent_selection = this;

        if (this.resize) {
            /* Resize mode is in effect */
            $('body').css('cursor', this.resize + '-resize');

            this.x1 = viewX(this.selection[/w/.test(this.resize) ? 'x2' : 'x1']);
            this.y1 = viewY(this.selection[/n/.test(this.resize) ? 'y2' : 'y1']);

            $(document).on('mousemove.imgareaselect', _.bind(this.selectingMouseMove, this))
                .one('mouseup', docMouseUp);
            this.$box.unbind('mousemove.imgareaselect');
        }
        else if (options.movable) {
            this.startX = left + this.selection.x1 - evX(event);
            this.startY = top + this.selection.y1 - evY(event);

            this.$box.unbind('mousemove.imgareaselect');

            $(document).on('mousemove.imgareaselect', _.bind(this.movingMouseMove, this))
                .one('mouseup', _.bind(function () {
                    options.onSelectEnd(img, this.getSelection());

                    $(document).unbind('mousemove.imgareaselect');
                    this.$box.on('mousemove.imgareaselect', _.bind(this.areaMouseMove, this));
                }, this));
        }else{
            $img.mousedown(event);
        }
        return false;
    };

    /**
     * TODO: documentation goes here lol.
     *
     * id is guaranteed to be unique only within this API object.
     */

    Selection.prototype.getSelection = function(noScale){
        var sx = noScale || scaleX, sy = noScale || scaleY;

        return { x1: round(this.selection.x1 * sx),
            y1: round(this.selection.y1 * sy),
            x2: round(this.selection.x2 * sx),
            y2: round(this.selection.y2 * sy),
            width: round(this.selection.x2 * sx) - round(this.selection.x1 * sx),
            height: round(this.selection.y2 * sy) - round(this.selection.y1 * sy) ,
            id: selections.indexOf(this)
        };
    };

    /**
     * Adjust the x2/y2 coordinates to maintain aspect ratio (if defined)
     *
     * @param xFirst
     *            If set to <code>true</code>, calculate x2 first. Otherwise,
     *            calculate y2 first.
     */
    Selection.prototype.fixAspectRatio = function(xFirst) {
        if (this.aspectRatio)
            if (xFirst) {
                this.x2 = max(left, min(left + imgWidth,
                    this.x1 + abs(this.y2 - this.y1) * this.aspectRatio * (this.x2 > this.x1 || -1)));
                this.y2 = round(max(this.top, min(top + imgHeight,
                    y1 + abs(this.x2 - this.x1) / this.aspectRatio * (this.y2 > this.y1 || -1))));
                this.x2 = round(this.x2);
            }
            else {
                this.y2 = max(top, min(top + imgHeight,
                    y1 + abs(this.x2 - this.x1) / this.aspectRatio * (this.y2 > this.y1 || -1)));
                this.x2 = round(max(left, min(left + imgWidth,
                    x1 + abs(this.y2 - this.y1) * this.aspectRatio * (this.x2 > this.x1 || -1))));
                this.y2 = round(this.y2);
            }
    };

    /**
     * Selection area mousedown event handler
     *
     * @param otherSelection
     *            Another selection object.
     * @return "" whether the
     *            '' otherwise.
     */

    Selection.prototype.overlapsOrAbuts = function(otherSelection){
        var left_infringement_amount = 0;
        var right_infringement_amount = 0;
        var top_infringement_amount = 0;
        var bottom_infringement_amount = 0;

        if( (this.x2 > otherSelection.x1 && this.x1 < otherSelection.x2) && //infringe from the left
                ((this.y1 >= otherSelection.y1 && this.y1 <= otherSelection.y2) ||
                (this.y2 >= otherSelection.y1 && this.y2 <= otherSelection.y2)||
                (this.y1 <= otherSelection.y1 && this.y2 >= otherSelection.y2))){
           //console.log("infringes on the left");
            left_infringement_amount = this.x2 - otherSelection.x1;
        }
        if((this.x1 < otherSelection.x2 && this.x2 > otherSelection.x1) && //infringe from the right
                ((this.y1 >= otherSelection.y1 && this.y1 <= otherSelection.y2) ||
                (this.y2 >= otherSelection.y1 && this.y2 <= otherSelection.y2)||
                (this.y1 <= otherSelection.y1 && this.y2 >= otherSelection.y2))){
           //console.log("infringes on the right");
            right_infringement_amount = otherSelection.x2 - this.x1;
        }
        if( (this.y2 > otherSelection.y1 && this.y1 < otherSelection.y2)  && //infringe from the top
                ((this.x1 >= otherSelection.x1 && this.x1 <= otherSelection.x2) ||
                (this.x2 >= otherSelection.x1 && this.x2 <= otherSelection.x2) ||
                (this.x1 <= otherSelection.x1 && this.x2 >= otherSelection.x2))){
           //console.log("infringes on the top");
            top_infringement_amount = this.y2 - otherSelection.y1;
        }
        if((this.y1 < otherSelection.y2 && this.y2 > otherSelection.y1) && //infringe from the bottom
                ((this.x1 >= otherSelection.x1 && this.x1 <= otherSelection.x2) ||
                (this.x2 >= otherSelection.x1 && this.x2 <= otherSelection.x2)||
                (this.x1 <= otherSelection.x1 && this.x2 >= otherSelection.x2))){
           //console.log("infringes on the bottom");
            bottom_infringement_amount = otherSelection.y2 - this.y1;
        }
        if (top_infringement_amount == 0 && bottom_infringement_amount == 0 && left_infringement_amount == 0 && right_infringement_amount == 0){
            return false;
        }else{
            return true;
        }
    };

    Selection.prototype.doesOverlap = function(otherSelection){
        var left_infringement_amount = 0;
        var right_infringement_amount = 0;
        var top_infringement_amount = 0;
        var bottom_infringement_amount = 0;

        if( (this.x2 > otherSelection.x1 && this.x1 < otherSelection.x2) && //infringe from the left
                ((this.y1 > otherSelection.y1 && this.y1 < otherSelection.y2) ||
                (this.y2 > otherSelection.y1 && this.y2 < otherSelection.y2)||
                (this.y1 < otherSelection.y1 && this.y2 > otherSelection.y2))){
           //console.log("infringes on the left");
            left_infringement_amount = this.x2 - otherSelection.x1;
        }
        if((this.x1 < otherSelection.x2 && this.x2 > otherSelection.x1) && //infringe from the right
                ((this.y1 > otherSelection.y1 && this.y1 < otherSelection.y2) ||
                (this.y2 > otherSelection.y1 && this.y2 < otherSelection.y2)||
                (this.y1 < otherSelection.y1 && this.y2 > otherSelection.y2))){
           //console.log("infringes on the right");
            right_infringement_amount = otherSelection.x2 - this.x1;
        }
        if( (this.y2 > otherSelection.y1 && this.y1 < otherSelection.y2)  && //infringe from the top
                ((this.x1 > otherSelection.x1 && this.x1 < otherSelection.x2) ||
                (this.x2 > otherSelection.x1 && this.x2 < otherSelection.x2) ||
                (this.x1 < otherSelection.x1 && this.x2 > otherSelection.x2))){
           //console.log("infringes on the top");
            top_infringement_amount = this.y2 - otherSelection.y1;
        }
        if((this.y1 < otherSelection.y2 && this.y2 > otherSelection.y1) && //infringe from the bottom
                ((this.x1 > otherSelection.x1 && this.x1 < otherSelection.x2) ||
                (this.x2 > otherSelection.x1 && this.x2 < otherSelection.x2)||
                (this.x1 < otherSelection.x1 && this.x2 > otherSelection.x2))){
           //console.log("infringes on the bottom");
            bottom_infringement_amount = otherSelection.y2 - this.y1;
        }
        if (top_infringement_amount == 0 && bottom_infringement_amount == 0 && left_infringement_amount == 0 && right_infringement_amount == 0){
            return false;
        }else{
            return {top: top_infringement_amount,
                    bottom: bottom_infringement_amount,
                    left: left_infringement_amount,
                    right: right_infringement_amount,
                    otherSelection: otherSelection};
        }
    };

    Selection.prototype.fixMoveOverlaps = function(infringements){
        var otherSelection = infringements.otherSelection;
        //assume proper orientation.
        if (infringements){
           //console.log(infringements);
            if( min(infringements['left'], infringements['right']) < min(infringements['top'], infringements['bottom']) ){

                if (((infringements['left'] < infringements['right'] || this.selection.width > (imgWidth - otherSelection.selection.x2 )) && this.selection.width <= otherSelection.selection.x1)){ // prefer to move the selection into the nearest legal space.
                   //console.log("go left", this.selection.width, otherSelection.selection.x1);
                    var newX1 = this.x1 - infringements['left']
                    var newX2 = this.x2 - infringements['left']
                }else{
                   //console.log("go right", this.selection.width, imgWidth - otherSelection.selection.x2);
                    var newX1 = this.x1 + infringements['right']
                    var newX2 = this.x2 + infringements['right']
                }

                //only move the selection if it doesn't go outside the image!
                if ( (newX1 == max(left, min(newX1, left + imgWidth))) && (newX2 == max(left, min(newX2, left + imgWidth))) ){
                    this.x1 = newX1;
                    this.x2 = newX2;
                }else{
                   //console.log("illegal x");
                    this.x1 = (max(newX1, newX2) < left + imgWidth) ? otherSelection.x1: otherSelection.x2;
                    this.x2 = abs(newX2 - newX1) - ((max(newX1, newX2) < left + imgWidth) && (newX2 < left + imgWidth)) ? otherSelection.x1 : otherSelection.x2;
                }
            }else{
                var newY1 = this.y1 + (infringements['top'] < infringements['bottom'] ? -1 * infringements['top'] : infringements['bottom'] )
                var newY2 = this.y2 + (infringements['top'] < infringements['bottom'] ? -1 * infringements['top'] : infringements['bottom'] )

                //only move the selection if it doesn't go outside the image!
                if ( (newY1 < top + imgHeight) && (newY1 > top) && (newY2 < top + imgHeight) && (newY2 > top)){
                    this.y1 = newY1;
                    this.y2 = newY2;
                }else{
                   //console.log("illegal y");
                    this.y1 = (max(newY1, newY2) < top + imgHeight) ? otherSelection.y2 : otherSelection.y1;
                    this.y2 = abs(newY2 - newY1) + (max(newY1, newY2) < top + imgHeight)? otherSelection.y2 : otherSelection.y1;
                }
            }
        }
    };

    Selection.prototype.fixResizeOverlaps = function(otherSelection){
        //assume proper orientation.
        if(this == otherSelection){
           //console.log("comparing this selectiont to itself; that shouldn't happen");
        }else{
            if(!this.resize || this.resize.length == 2){
                this.fixTwoAxisResizeOverlaps(otherSelection);
            }else if(this.resize && this.resize.length == 1){
                this.fixOneAxisResizeOverlaps(this.doesOverlap(otherSelection));
            }else{
               //console.log("no infringement", this.resize);
            }
            this.selection = { x1: selX(min(this.x1, this.x2)), x2: selX(max(this.x1, this.x2)),
                y1: selY(min(this.y1, this.y2)), y2: selY(max(this.y1, this.y2)),
                width: abs(this.x2 - this.x1), height: abs(this.y2 - this.y1) };
        }
    };

    Selection.prototype.fixOneAxisResizeOverlaps = function(infringements){
       //console.log("fix 1 axis");
        var otherSelection = infringements.otherSelection;
        if (infringements){
            if(this.resize == "n"){
                this.y1 = otherSelection.y2;
            }else if(this.resize == "s"){
                this.y2 = otherSelection.y1;
            }else if(this.resize == "w"){
                this.x1 = otherSelection.x2;
            }else if(this.resize == "e"){
                this.x2 = otherSelection.x1;
            }
        }
    }

    Selection.prototype.fixTwoAxisResizeOverlaps = function(otherSelection){
        //TODO: refactor to actually change points based on doesOverlaps' return.

        /* if the non-moving point is "inside" the bounds of another selection on only the x axis */
        var x_axis_properly_oriented = this.x2 > this.x1;
        var y_axis_properly_oriented = this.y2 > this.y1;

        if((x_axis_properly_oriented ? this.x1 : this.x2) >= otherSelection.x1 && (x_axis_properly_oriented ? this.x1 : this.x2) < otherSelection.x2){
            if(y_axis_properly_oriented ? (this.y2 > otherSelection.y1 && this.y1 < otherSelection.y2) : (this.y2 < otherSelection.y2 && this.y1 > otherSelection.y1)){
               //console.log("disallowing overlap on y-axis");
                // set this.y2 to the top point if the current selection is oriented upright, (i.e. such that y2 > y1), bottom otherwise.
                this.y2 = y_axis_properly_oriented ? otherSelection.y1 : otherSelection.y2;
            }
        //if the non-moving point is "inside" the bounds of another selection on only the y axis
        }else if((y_axis_properly_oriented ? this.y1 : this.y2) > otherSelection.y1 && (y_axis_properly_oriented ? this.y1 : this.y2) < otherSelection.y2){
            if(x_axis_properly_oriented ? (this.x2 >= otherSelection.x1 && this.x1 <= otherSelection.x1) : (this.x2 < otherSelection.x2 && this.x1 > otherSelection.x2 )){
               //console.log("disallowing overlap on x-axis");
                // set this.x2 to the rightmost point if the current selection is oriented correctly, (i.e. such that x2 > x1), leftmost otherwise.
                this.x2 = x_axis_properly_oriented ? otherSelection.x1 : otherSelection.x2;
            }
        }else{
            if (   //if the non-moving point is not within the bounds of another selection on any axis
                ((y_axis_properly_oriented ? (this.y2 >= otherSelection.y1 && this.y1 < otherSelection.y2) : (this.y2 < otherSelection.y2 && this.y1 >= otherSelection.y1)) &&
                 (x_axis_properly_oriented ? (this.x2 >= otherSelection.x1 && this.x1 <= otherSelection.x1) : (this.x2 < otherSelection.x2 && this.x1 > otherSelection.x2 )))
                   //or if this selection wholly contains another selection.
              || ((x_axis_properly_oriented ? this.x1 : this.x2) <= otherSelection.x1 && (y_axis_properly_oriented ? this.y1 : this.y2) <= otherSelection.y1
                   && (!x_axis_properly_oriented ? this.x1 : this.x2) > otherSelection.x2 && (!y_axis_properly_oriented ? this.y1 : this.y2) > otherSelection.y2)
            ){
               //console.log("disallowing overlap on both axes");
                //reset the "less-infringing" amount.
                var x_infringement_distance = x_axis_properly_oriented ? this.x2 - otherSelection.x1 : otherSelection.x2 - this.x2;
                var y_infringement_distance = y_axis_properly_oriented ? this.y2 - otherSelection.y1 : otherSelection.y2 - this.y2;
                if(x_infringement_distance > y_infringement_distance){
                    this.y2 = y_axis_properly_oriented ? otherSelection.y1 : otherSelection.y2;
                }else{
                    this.x2 = x_axis_properly_oriented ? otherSelection.x1 : otherSelection.x2;
                }
            }
        }
    }

    // Selection.prototype.fixOverlaps = function(otherSelection){
    //     //TODO: this doesn't respect minHeight, minWidth
    //     console.log("fixOverlaps");
    //     this.fixResizeOverlaps(otherSelection); //fixes x1, x2
    //     this.x2 = max(left, min(this.x2, left + imgWidth));
    //     this.y2 = max(top, min(this.y2, top + imgHeight));
    //     this.selection = { x1: selX(min(this.x1, this.x2)), x2: selX(max(this.x1, this.x2)),
    //         y1: selY(min(this.y1, this.y2)), y2: selY(max(this.y1, this.y2)),
    //         width: abs(this.x2 - this.x1), height: abs(this.y2 - this.y1) };
    //     this.update();
    // }

    /**
     * Resize the selection area respecting the minimum/maximum dimensions and
     * aspect ratio
     */
    Selection.prototype.doResize = function() {
        /*
         * Make sure the top left corner of the selection area stays within
         * image boundaries (it might not if the image source was dynamically
         * changed).
         *
         * How this works: this.x2 and this.y2 are set directly from the event.
         * Then, this.x2 and this.y2 are reset based on imgWidth/imgHeight.
         * And, then, if allowOverlaps is false, they're restricted not to be
         */

        this.x1 = min(this.x1, left + imgWidth);
        this.y1 = min(this.y1, top + imgHeight);

        if (abs(this.x2 - this.x1) < minWidth) {
            /* Selection width is smaller than minWidth */
            x2 = x1 - minWidth * (x2 < x1 || -1);

            if (this.x2 < left)
                this.x1 = left + minWidth;
            else if (this.x2 > left + imgWidth)
                this.x1 = left + imgWidth - minWidth;
        }

        if (abs(this.y2 - this.y1) < minHeight) {
            /* Selection height is smaller than minHeight */
            this.y2 = this.y1 - minHeight * (this.y2 < this.y1 || -1);

            if (this.y2 < top)
                this.y1 = top + minHeight;
            else if (this.y2 > top + imgHeight)
                this.y1 = top + imgHeight - minHeight;
        }

        this.x2 = max(left, min(this.x2, left + imgWidth));
        this.y2 = max(top, min(this.y2, top + imgHeight));

        this.fixAspectRatio(abs(this.x2 - this.x1) < abs(this.y2 - this.y1) * this.aspectRatio);

        if (abs(this.x2 - this.x1) > maxWidth) {
            /* Selection width is greater than maxWidth */
            this.x2 = this.x1 - maxWidth * (this.x2 < this.x1 || -1);
            this.fixAspectRatio();
        }

        if (abs(this.y2 - this.y1) > maxHeight) {
            /* Selection height is greater than maxHeight */
            this.y2 = this.y1 - maxHeight * (this.y2 < this.y1 || -1);
            this.fixAspectRatio(true);
        }


        if(!options.allowOverlaps){
            /* Restrict the dimensions of the selection based on the other selections that already exist.
             * It's not possible for a selection to begin inside another one (except via the API, moving).
             *
             */
            _(_(selections).filter(_.bind(function(otherSelection){ return otherSelection && this != otherSelection }, this))).each( _.bind( function(otherSelection){ this.fixResizeOverlaps(otherSelection) }, this) );

            var overlaps = _(_(selections).filter(_.bind(function(otherSelection){ return otherSelection && this != otherSelection; }, this)))
                .map(_.bind(function(otherSelection){ return this.doesOverlap(otherSelection) || this == otherSelection; }, this) );
           //console.log(overlaps);
            var legal = (_(overlaps).map(function(o){ return !o; }).indexOf(false) == -1) &&
            ( this.x1 > 0 && this.x2 < left + imgWidth && //if you ask "lolwut?," I'd agree.
             this.y1 > 0 && this.y2 < imgHeight + top );

            //console.log("legal", legal, this.x2, imgWidth);

            if(legal){
                this.selection = { x1: selX(min(this.x1, this.x2)), x2: selX(max(this.x1, this.x2)),
                    y1: selY(min(this.y1, this.y2)), y2: selY(max(this.y1, this.y2)) };
                this.selection.width = abs(this.selection.x2 - this.selection.x1);
                this.selection.height = abs(this.selection.y2 - this.selection.y1);
            }else{
                this.x2 = this.oldX2
                this.y2 = this.oldY2;
                this.selection = { x1: selX(min(this.x1, this.x2)), x2: selX(max(this.x1, this.x2)),
                    y1: selY(min(this.y1, this.y2)), y2: selY(max(this.y1, this.y2)) };
                this.selection.width = abs(this.selection.x2 - this.selection.x1);
                this.selection.height = abs(this.selection.y2 - this.selection.y1);
            }
        }else{
            this.selection = { x1: selX(min(this.x1, this.x2)), x2: selX(max(this.x1, this.x2)),
                y1: selY(min(this.y1, this.y2)), y2: selY(max(this.y1, this.y2)) };
            this.selection.width = abs(this.selection.x2 - this.selection.x1);
            this.selection.height = abs(this.selection.y2 - this.selection.y1);
        }

        this.update();

        options.onSelectChange(img, this.getSelection());
    }

    /**
     * Mousemove event handler triggered when the user is selecting an area (or resizing)
     *
     * @param event
     *            The event object
     * @return false
     */
    Selection.prototype.selectingMouseMove = function(event) {
        this.oldX2 = this.x2;
        this.oldY2 = this.y2;

        $('.imgareaselect-closebtn').css("cursor", "default");

        this.x2 = (/w|e|^$/.test(this.resize) || this.aspectRatio) ? evX(event) : viewX(this.selection.x2);
        this.y2 = (/n|s|^$/.test(this.resize) || this.aspectRatio) ? evY(event) : viewY(this.selection.y2);

        this.doResize();

        return false;
    }

    /**
     * Move the selection area
     *
     * @param newX1
     *            New viewport X1
     * @param newY1
     *            New viewport Y1
     */
    Selection.prototype.doMove = function(newX1, newY1) {
        oldX1 = this.selection.x1;
        oldY1 = this.selection.y1;
        oldX2 = this.selection.x2;
        oldY2 = this.selection.y2;

        this.x2 = (this.x1 = newX1) + this.selection.width;
        this.y2 = (this.y1 = newY1) + this.selection.height;

        if(!options.allowOverlaps){
            //move stuff
            _(_(selections).filter(function(s){ return s})).each(_.bind(function(otherSelection){ this.fixMoveOverlaps(this.doesOverlap(otherSelection)) }, this) );

            //check if those moves are legal.
            var overlaps = _(_(selections).filter(function(otherSelection){ return otherSelection && this != otherSelection; }))
                .map(_.bind(function(otherSelection){ return this.doesOverlap(otherSelection) }, this) );
           //console.log(overlaps);
            var legal = (_(overlaps).map(function(o){ return !o; }).indexOf(false) == -1) &&
            ( min(this.x1, this.x2) > left && max(this.x1 + this.selection.width, this.x2) < (left + imgWidth) && //if you ask "lolwut?," I'd agree.
             min(this.y1, this.y2) > top && max(this.y1 + this.selection.height, this.y2) < top + imgHeight );

           //console.log("legal", legal, max(this.x1, this.x2), left, imgWidth);

            if(legal){
                $.extend(this.selection, { x1: selX(this.x1), y1: selY(this.y1), x2: selX(this.x2),
                    y2: selY(this.y2) });
            }else{
                this.x1 = oldX1;
                this.y1 = oldY1;
                this.x2 = oldX2;
                this.y2 = oldY2;
                $.extend(this.selection, { x1: oldX1, y1: oldY1, x2: oldX2, y2: oldY2 });
            }
        }else{
            $.extend(this.selection, { x1: selX(this.x1), y1: selY(this.y1), x2: selX(this.x2),
                y2: selY(this.y2) });
        }

        this.update();

        options.onSelectChange(img, this.getSelection());
    }

    /**
     * Mousemove event handler triggered when the selection area is being moved
     *
     * @param event
     *            The event object
     * @return false
     */
    Selection.prototype.movingMouseMove = function(event) {
        this.x1 = max(left, min(this.startX + evX(event), left + imgWidth - this.selection.width));
        this.y1 = max(top, min(this.startY + evY(event), top + imgHeight - this.selection.height));

        this.doMove(this.x1, this.y1);

        event.preventDefault();
        return false;
    }

    Selection.prototype.cancelSelection = function(skipCallbacks) {
        $(document).unbind('mousemove.imgareaselect')
            .unbind('mouseup', this.cancelSelection);
        this.hide(this.$box /*.add(this.$outer)*/);
        this.hide(this.$closeBtn);
        this.shown = false;
        
        
        
        //remove this selection from the closure-global `selections` list.
        var index_of_this = selections.indexOf(this);
        if(index_of_this >= 0){
            selections.splice(index_of_this, 1, null);
        }

        if (!skipCallbacks && !(this instanceof $.imgAreaSelect)) {
            options.onSelectChange(img, this.getSelection());
            options.onSelectEnd(img, this.getSelection());
        }
        options.onSelectCancel(img, this.getSelection(), index_of_this);
        
        //MDEO CODE
        this.$box.remove();
        this.$closeBtn.remove();
        
    }























    //methods on the plugin

    function startSelection() {
        $(document).unbind('mousemove', startSelection).unbind('mouseup.nozerosize');

        s = new Selection();
        selections.push(s);
        most_recent_selection = s;

        adjust();
        //TODO: move most of this to the constructor?
        s.startX = startX;
        s.startY = startY;
        s.x1 = startX;
        s.y1 = startY;
        s.x2 = s.x1;
        s.y2 = s.y1;

        s.doResize(); // I think this does the actual drawing? -J
        s.resize = '';
        //if (!$outer.is(':visible'))
            /* Show the plugin elements */
        //   $box/*.add($outer)*/.hide().fadeIn(options.fadeSpeed||0);
        s.shown = true;

        $(document).on('mousemove.imgareaselect', _.bind(s.selectingMouseMove, s)).one('mouseup', docMouseUp);
        s.$box.unbind('mousemove.imgareaselect');

        options.onSelectStart(img, s.getSelection());
    }



    /**
     * Document mouseup event handler
     *
     * @param event
     *            The event object
     */
    function docMouseUp(event) {
        /* Set back the default cursor */
        $('body').css('cursor', '');
        $('.imgareaselect-closebtn').css("cursor", "pointer");
        /*
         * If autoHide is enabled, or if the selection has zero width/height,
         * hide the selection and the outer area
         */

        if (options.autoHide /*|| selection.width * selection.height == 0*/)
            hide(most_recent_selection.$box/*.add($outer)*/, function () { $(most_recent_selection).hide(); });

        $(document).unbind('mousemove.imgareaselect');
        most_recent_selection.$box.on('mousemove.imgareaselect', _.bind(most_recent_selection.areaMouseMove, most_recent_selection));

        options.onSelectEnd(img, most_recent_selection.getSelection());
    }


    /**
     * Recalculate image and parent offsets
     */
    function adjust() {
        /*
         * Do not adjust if image has not yet loaded or if width is not a
         * positive number. The latter might happen when imgAreaSelect is put
         * on a parent element which is then hidden.
         */
        if (!imgLoaded || !$img.width())
            return;

        /*
         * Get image offset. The .offset() method returns float values, so they
         * need to be rounded.f
         */
        imgOfs = { left: round($img.offset().left), top: round($img.offset().top) };

        /* Get image dimensions */
        imgWidth = $img.innerWidth();
        imgHeight = $img.innerHeight();

        imgOfs.top += ($img.outerHeight() - imgHeight) >> 1;
        imgOfs.left += ($img.outerWidth() - imgWidth) >> 1;

        /* Set minimum and maximum selection area dimensions */
        minWidth = round(options.minWidth / scaleX) || 0;
        minHeight = round(options.minHeight / scaleY) || 0;
        maxWidth = round(min(options.maxWidth / scaleX || 1<<24, imgWidth));
        maxHeight = round(min(options.maxHeight / scaleY || 1<<24, imgHeight));

        /*
         * Workaround for jQuery 1.3.2 incorrect offset calculation, originally
         * observed in Safari 3. Firefox 2 is also affected.
         */
        if ($().jquery == '1.3.2' && position == 'fixed' &&
            !docElem['getBoundingClientRect'])
        {
            imgOfs.top += max(document.body.scrollTop, docElem.scrollTop);
            imgOfs.left += max(document.body.scrollLeft, docElem.scrollLeft);
        }

        /* Determine parent element offset */
        parOfs = /absolute|relative/.test($parent.css('position')) ?
            { left: round($parent.offset().left) - $parent.scrollLeft(),
                top: round($parent.offset().top) - $parent.scrollTop() } :
            this.position == 'fixed' ?
                { left: $(document).scrollLeft(), top: $(document).scrollTop() } :
                { left: 0, top: 0 };

        left = viewX(0);
        top = viewY(0);

        /*
         * Check if selection area is within image boundaries, adjust if
         * necessary
         */
        _(selections).each(function(s){
            if (s && (s.selection.x2 > imgWidth || s.selection.y2 > imgHeight)){
                s.doResize();
            }
        });
    }

    //"static" lol
    /*
     * Translate selection coordinates (relative to scaled image) to viewport
     * coordinates (relative to parent element)
     */

    /**
     * Translate selection X to viewport X
     *
     * @param x
     *            Selection X
     * @return Viewport X
     */
    function viewX(x) {
        return x + imgOfs.left - parOfs.left;
    }

    /**
     * Translate selection Y to viewport Y
     *
     * @param y
     *            Selection Y
     * @return Viewport Y
     */
    function viewY(y) {
        return y + imgOfs.top - parOfs.top;
    }

    /*
     * Translate viewport coordinates to selection coordinates
     */

    /**
     * Translate viewport X to selection X
     *
     * @param x
     *            Viewport X
     * @return Selection X
     */
    function selX(x) {
        return x - imgOfs.left + parOfs.left;
    }

    /**
     * Translate viewport Y to selection Y
     *
     * @param y
     *            Viewport Y
     * @return Selection Y
     */
    function selY(y) {
        return y - imgOfs.top + parOfs.top;
    }

    /*
     * Translate event coordinates (relative to document) to viewport
     * coordinates
     */

    /**
     * Get event X and translate it to viewport X
     *
     * @param event
     *            The event object
     * @return Viewport X
     */
    function evX(event) {
        return event.pageX - parOfs.left;
    }

    /**
     * Get event Y and translate it to viewport Y
     *
     * @param event
     *            The event object
     * @return Viewport Y
     */
    function evY(event) {
        return event.pageY - parOfs.top;
    }

    /**
     * Image mousedown event handler
     *
     * @param event
     *            The event object
     * @return false
     */


    function imgMouseDown(event) {
        if (event.which != 1 /*|| $outer.is(':animated') */) return false;

        adjust();
        startX = /*x1 =*/ evX(event);
        startY = /*y1 =*/ evY(event);

        $(document).on("mousemove.imgareaselect", startSelection).on('mouseup.nozerosize.imgareaselect', function(){
            $(document).unbind("mousemove.imgareaselect");
        });
        //for multi-select, remove mouseup(); a click on the image doesn't erase the previous selection.
        // on second thought, I'm not sure that's what's going on. I think mouseup just erases the selection if you didn't move the mouse.
        // on third thought, I need to reengineer this so that I have a cancelSelection fucntion.
        return false;
    }


    /**
     * Image load event handler. This is the final part of the initialization
     * process.
     */
    function imgLoad() {
        imgLoaded = true;

        setOptions(options = $.extend({
            classPrefix: 'imgareaselect',
            movable: true,
            parent: $('body'),
            resizable: true,
            resizeMargin: 10,
            onInit: function () {},
            onSelectStart: function () {},
            onSelectChange: function () {},
            onSelectEnd: function () {},
            onSelectCancel: function () {}
            
        }, options));

        _(selections).each(function(s){
            if(s){
                s.$box/*.add(s.$outer)*/.css({ visibility: '' });

                if (options.show) {
                    shown = true;
                    s.adjust();
                    s.update();
                    s.$box/*.add(s.$outer)*/.hide().fadeIn(options.fadeSpeed||0);
                }
            }
        });

        /*
         * Call the onInit callback. The setTimeout() call is used to ensure
         * that the plugin has been fully initialized and the object instance is
         * available (so that it can be obtained in the callback).
         */
        setTimeout(function () { options.onInit(img, _(selections).map(function(s){ return s.getSelection() })) }, 0);
    }

    var docKeyPress = function(event) {
        var k = options.keys, d, t, key = event.keyCode;

        d = !isNaN(k.alt) && (event.altKey || event.originalEvent.altKey) ? k.alt :
            !isNaN(k.ctrl) && event.ctrlKey ? k.ctrl :
            !isNaN(k.shift) && event.shiftKey ? k.shift :
            !isNaN(k.arrows) ? k.arrows : 10;

        if (k.arrows == 'resize' || (k.shift == 'resize' && event.shiftKey) ||
            (k.ctrl == 'resize' && event.ctrlKey) ||
            (k.alt == 'resize' && (event.altKey || event.originalEvent.altKey)))
        {
            /* Resize selection */

            switch (key) {
            case 37:
                /* Left */
                d = -d;
            case 39:
                /* Right */
                t = max(x1, x2);
                x1 = min(x1, x2);
                x2 = max(t + d, x1);
                fixAspectRatio();
                break;
            case 38:
                /* Up */
                d = -d;
            case 40:
                /* Down */
                t = max(y1, y2);
                y1 = min(y1, y2);
                y2 = max(t + d, y1);
                fixAspectRatio(true);
                break;
            default:
                return;
            }

            doResize();
        }
        else {
            /* Move selection */

            x1 = min(x1, x2);
            y1 = min(y1, y2);

            switch (key) {
            case 37:
                /* Left */
                doMove(max(x1 - d, left), y1);
                break;
            case 38:
                /* Up */
                doMove(x1, max(y1 - d, top));
                break;
            case 39:
                /* Right */
                doMove(x1 + min(d, imgWidth - selX(x2)), y1);
                break;
            case 40:
                /* Down */
                doMove(x1, y1 + min(d, imgHeight - selY(y2)));
                break;
            default:
                return;
            }
        }

        return false;
    };

    /**
     * Apply style options to plugin element (or multiple elements)
     *
     * @param $elem
     *            A jQuery object representing the element(s) to style
     * @param props
     *            An object that maps option names to corresponding CSS
     *            properties
     */
    function styleOptions($elem, props) {
        for (var option in props)
            if (options[option] !== undefined)
                $elem.css(props[option], options[option]);
    }

    /**
     * Set plugin options
     *
     * @param newOptions
     *            The new options object
     */
    function setOptions(newOptions) {
        if (newOptions.parent){
            _(_(selections).filter(function(s){ return s})).each(function(s){
                ($parent = $(newOptions.parent)).append(s.$box)/*.append($outer)*/;
            });
        }

        /* Merge the new options with the existing ones */
        $.extend(options, newOptions);

        adjust();

        if (newOptions.handles != null) {
            /* Recreate selection area handles */
            _(_(selections).filter(function(s){ return s})).each(function(s){
                s.$handles.remove();
                s.$handles = $([]);

                i = newOptions.handles ? newOptions.handles == 'corners' ? 4 : 8 : 0;

                while (i--)
                    s.$handles = s.$handles.add(div());

                /* Add a class to handles and set the CSS properties */
                s.$handles.addClass(options.classPrefix + '-handle').css({
                    position: 'absolute',
                    /*
                     * The font-size property needs to be set to zero, otherwise
                     * Internet Explorer makes the handles too large
                     */
                    fontSize: 0,
                    zIndex: zIndex + 1 || 1
                });

                /*
                 * If handle width/height has not been set with CSS rules, set the
                 * default 5px
                 */
                if (!parseInt(s.$handles.css('width')) >= 0)
                    s.$handles.width(5).height(5);

                /*
                 * If the borderWidth option is in use, add a solid border to
                 * handles
                 */
                if (o = options.borderWidth)
                    s.$handles.css({ borderWidth: o, borderStyle: 'solid' });

                /* Apply other style options */
                styleOptions(s.$handles, { borderColor1: 'border-color',
                    borderColor2: 'background-color',
                    borderOpacity: 'opacity' });
            });
        }

        /* Calculate scale factors */
        scaleX = options.imageWidth / imgWidth || 1;
        scaleY = options.imageHeight / imgHeight || 1;

        /* Set selection */
        if (newOptions.x1 != null) {
            setSelection(newOptions.x1, newOptions.y1, newOptions.x2,
                newOptions.y2);
            newOptions.show = !newOptions.hide;
        }

        if (newOptions.keys)
            /* Enable keyboard support */
            options.keys = $.extend({ shift: 1, ctrl: 'resize' },
                newOptions.keys);

        /* Add classes to plugin elements */
        //$outer.addClass(options.classPrefix + '-outer');
        _(_(selections).filter(function(s){ return s})).each(function(s){
            s.$area.addClass(options.classPrefix + '-selection');
            for (i = 0; i++ < 4;)
                $(s.$border[i-1]).addClass(options.classPrefix + '-border' + i);

            /* Apply style options */
            styleOptions(s.$area, { selectionColor: 'background-color',
                selectionOpacity: 'opacity' });
            styleOptions(s.$border, { borderOpacity: 'opacity',
                borderWidth: 'border-width' });
            /*styleOptions($outer, { outerColor: 'background-color',
                outerOpacity: 'opacity' });*/
            if (o = options.borderColor1)
                $(s.$border[0]).css({ borderStyle: 'solid', borderColor: o });
            if (o = options.borderColor2)
                $(s.$border[1]).css({ borderStyle: 'dashed', borderColor: o });

            /* Append all the selection area elements to the container box */
            s.$box.append(s.$area.add(s.$border).add(s.$areaOpera)).append(s.$handles);


            /*if (msie) {
                if (o = ($outer.css('filter')||'').match(/opacity=(\d+)/))
                    $outer.css('opacity', o[1]/100);
                if (o = ($border.css('filter')||'').match(/opacity=(\d+)/))
                    $border.css('opacity', o[1]/100);
            }*/

            if (newOptions.hide)
                hide(s.$box/*.add(s.$outer)*/);
            else if (newOptions.show && imgLoaded) {
                s.shown = true;
                s.$box/*.add(s.$outer)*/.fadeIn(options.fadeSpeed||0);
                s.doUpdate();
            }

            $img/*.add($outer)*/.unbind('mousedown', imgMouseDown);

            if (options.disable || options.enable === false) {
                /* Disable the plugin */
                s.$box.unbind('mousemove.imgareaselect').unbind('mousedown.imgareaselect', s.areaMouseDown);
            }
            else {
                if (options.enable || options.disable === false) {
                    /* Enable the plugin */
                    if (options.resizable || options.movable)
                        s.$box.mousemove(_.bind(s.areaMouseMove,s)).on('mousedown.imgareaselect', _.bind(s.areaMouseDown, s));
                }
            }
        });

        /* Calculate the aspect ratio factor */
        aspectRatio = (d = (options.aspectRatio || '').split(/:/))[0] / d[1];

        $img.unbind('mousedown', imgMouseDown);

        if (options.disable || options.enable === false) {
            /* Disable the plugin */
            $(window).unbind('resize', this.windowResize);
        }
        else {
            if (options.enable || options.disable === false) {
                $(window).resize(this.windowResize);
            }
            if (!options.persistent)
                $img/*.add($outer)*/.mousedown(imgMouseDown);
        }


        options.enable = options.disable = undefined;
    }

    /**
     * Remove plugin completely
     */
    this.remove = function () {
        /*
         * Call setOptions with { disable: true } to unbind the event handlers
         */
        this.setOptions({ disable: true });
        _(selections).each(function(s){
            if(s){
                s.$box/*.add($outer)*/.remove();
                s.$closeBtn.remove();
            }
        })
    };

    /*
     * Public API
     */

     /*
      *
      *
      *
      */
    this.getImg = function(){
        return $img;
    }

    this.getDebugPositioning = function(){
        return {left: left,
        top: top,
        imgWidth: imgWidth,
        imgHeight: imgHeight};
    }

    /**
     * Get current options
     *
     * @return An object containing the set of options currently in use
     */
    this.getOptions = function () { return options; };

    /**
     * Set plugin options
     *
     * @param newOptions
     *            The new options object
     */
    this.setOptions = setOptions;

    /**
     * Get all of the current selections.
     *
     * @param noScale
     *            If set to <code>true</code>, scaling is not applied to the
     *            returned selection
     * @return An array of selection objects.
     */
     this.getSelections = function(noScale) {
        // filter out the nulls.
        //console.log(this);
        return _( _(selections).filter(function(s){ return !!s; }) ).map(function(s){
            return s.getSelection(noScale);
        });
    }

    /**
     * Create a new selection
     *
     * @param x1
     *            X coordinate of the upper left corner of the selection area
     * @param y1
     *            Y coordinate of the upper left corner of the selection area
     * @param x2
     *            X coordinate of the lower right corner of the selection area
     * @param y2
     *            Y coordinate of the lower right corner of the selection area
     * @param noScale
     *            If set to <code>true</code>, scaling is not applied to the
     *            new selection
     * @return selection object from the newly-created Selection. May be
     *            different from given coordinates if they overlap.
     */
    this.createNewSelection = function(x1, y1, x2, y2){
        if(!options.multipleSelections){
            selections[0].setSelection(x1, y1, x2, y2, noScale)
        }else{
            var s = new Selection(x1, y1, x2, y2);
            if(!options.allowOverlaps){
                //this selection is guaranteed not to be in `selections` yet.
                var overlaps = _(_(selections).filter(function(otherSelection){ return otherSelection; }))
                    .map(function(otherSelection){ return s.overlapsOrAbuts(otherSelection)} );
                var legal = (_(overlaps).map(function(o){ return !o; }).indexOf(false) == -1);
            }
            if(options.allowOverlaps || legal){
                //if the selection is illegal, don't create it.
                selections.push(s);
                return s.getSelection();
            }else{
                //but if the selection is illegal and overlaps only one other thing, change that other one
                if (_(overlaps).reject(function(v){ return v; }).length <= 1){
                    //return their union.
                    var overlap_index = _(overlaps).map(function(v){ return v; }).indexOf(true);
                    var overlap = selections[overlap_index];
                    overlap.setSelection( min(overlap.selection.x1, x1, overlap.selection.x2, x2),
                                          min(overlap.selection.y1, y1, overlap.selection.y2, y2),
                                          max(overlap.selection.x1, x1, overlap.selection.x2, x2),
                                          max(overlap.selection.y1, y1, overlap.selection.y2, y2) );
                    overlap.update();
                    s.cancelSelection(true);
                    return false;
                }else{
                    s.cancelSelection(true);
                    return false;
                }
            }
        }
    };

    this.setSelection = function (x1, y1, x2, y2, noScale){
        //if(!options.multipleSelections){
            selections[0].setSelection(x1, y1, x2, y2, noScale)
            return true;
        //}else{
            //this method makes no sense with multiple selections.
            //return false;
        //}
    };



    //TODO: create a setSelection method that modifies all selection objects. (maybe?)

    this.update = function(){ _(_(selections).filter(function(s){ return s})).each(function(s){ s.doUpdate() }); };


    /**
     * Window resize event handler
     */
    this.windowResize = function() {
        this.update();
    };


    /**
     * Cancel selection
     */
    this.cancelSelections = function(){
        //shoudl work fine as is for !options.multipleSelections
        // I can't simply do `_(selections).each(function(s){ s.cancelSelection(true); });` because cancelSelection modifies `selections` concurrently with iterating over `selections`, so some selections get skipped.
        var selectionsIndex = selections.length
        while(selectionsIndex >= 1){
            if(selections[selectionsIndex - 1]) //skip the nulls.
                selections[selectionsIndex - 1].cancelSelection(true);
            selectionsIndex--;
            //console.log(selectionsIndex, selections);
        }
        selections = _(selections).reject(function(sel){ return _(sel).isNull(); });
    };

    this.cancelSelection = function(){
        if(!options.multipleSelections){
            selections[0].cancelSelection(true);
        }else{
            return false;
        }
    };

    /**
     * Update plugin elements
     *
     * @param resetKeyPress
     *            If set to <code>false</code>, this instance's keypress
     *            event handler is not activated
     */
    //this.update = doUpdate;

    /* Do the dreaded browser detection */
    var msie = (/msie ([\w.]+)/i.exec(ua)||[])[1],
        opera = /opera/i.test(ua),
        safari = /webkit/i.test(ua) && !/chrome/i.test(ua);

    /*
     * Traverse the image's parent elements (up to <body>) and find the
     * highest z-index
     */
    $p = $img;

    while ($p.length) {
        zIndex = max(zIndex,
            !isNaN($p.css('z-index')) ? $p.css('z-index') : zIndex);
        /* Also check if any of the ancestor elements has fixed position */
        if ($p.css('position') == 'fixed')
            position = 'fixed';

        $p = $p.parent(':not(body)');
    }

    /*
     * If z-index is given as an option, it overrides the one found by the
     * above loop
     */
    zIndex = options.zIndex || zIndex;

    if (msie)
        $img.attr('unselectable', 'on');

    /*
     * In MSIE and WebKit, we need to use the keydown event instead of keypress
     */
    $.imgAreaSelect.keyPress = msie || safari ? 'keydown' : 'keypress';

    /*
     * There is a bug affecting the CSS cursor property in Opera (observed in
     * versions up to 10.00) that prevents the cursor from being updated unless
     * the mouse leaves and enters the element again. To trigger the mouseover
     * event, we're adding an additional div to $box and we're going to toggle
     * it when mouse moves inside the selection area.
     */
    if (opera)
        $areaOpera = div().css({ width: '100%', height: '100%',
            position: 'absolute', zIndex: zIndex + 2 || 2 });

    /*
     * We initially set visibility to "hidden" as a workaround for a weird
     * behaviour observed in Google Chrome 1.0.154.53 (on Windows XP). Normally
     * we would just set display to "none", but, for some reason, if we do so
     * then Chrome refuses to later display the element with .show() or
     * .fadeIn().
     */
     //Jeremy is doing this in teh construcotr.
    // _(selections).each(function(s){
    //     s.$box/*.add($outer)*/.css({ visibility: 'hidden', position: position,
    //         overflow: 'hidden', zIndex: zIndex || '0' });
    //     s.$box.css({ zIndex: zIndex + 2 || 2 });
    //     s.$closeBtn.css({ zIndex: zIndex + 3 || 3 });
    //     s.$area.add($border).css({ position: 'absolute', fontSize: 0 });
    // })


    /*
     * If the image has been fully loaded, or if it is not really an image (eg.
     * a div), call imgLoad() immediately; otherwise, bind it to be called once
     * on image load event.
     */
    img.complete || img.readyState == 'complete' || !$img.is('img') ?
        imgLoad() : $img.one('load', imgLoad);

    /*
     * MSIE 9.0 doesn't always fire the image load event -- resetting the src
     * attribute seems to trigger it. The check is for version 7 and above to
     * accommodate for MSIE 9 running in compatibility mode.
     */
    if (!imgLoaded && msie && msie >= 7)
        img.src = img.src;
};

/**
 * Invoke imgAreaSelect on a jQuery object containing the image(s)
 *
 * @param options
 *            Options object
 * @return The jQuery object or a reference to imgAreaSelect instance (if the
 *         <code>instance</code> option was specified)
 */
$.fn.imgAreaSelect = function (options) {
    options = options || {};

    this.each(function () {
        /* Is there already an imgAreaSelect instance bound to this element? */
        if ($(this).data('imgAreaSelect')) {
            /* Yes there is -- is it supposed to be removed? */
            if (options.remove) {
                /* Remove the plugin */
                $(this).data('imgAreaSelect').remove();
                $(this).removeData('imgAreaSelect');
            }
            else
                /* Reset options */
                $(this).data('imgAreaSelect').setOptions(options);
        }
        else if (!options.remove) {
            /* No exising instance -- create a new one */

            /*
             * If neither the "enable" nor the "disable" option is present, add
             * "enable" as the default
             */
            if (options.enable === undefined && options.disable === undefined)
                options.enable = true;

            $(this).data('imgAreaSelect', new $.imgAreaSelect(this, options));
        }
    });

    if (options.instance)
        /*
         * Return the imgAreaSelect instance bound to the first element in the
         * set
         */
        return $(this).data('imgAreaSelect');

    return this;
};

})(jQuery);
;!function(a,b){"function"==typeof define&&define.amd?define("wavesurfer",[],function(){return a.WaveSurfer=b()}):"object"==typeof exports?module.exports=b():a.WaveSurfer=b()}(this,function(){"use strict";var a={defaultParams:{height:128,waveColor:"#999",progressColor:"#555",cursorColor:"#333",cursorWidth:1,skipLength:2,minPxPerSec:20,pixelRatio:window.devicePixelRatio||screen.deviceXDPI/screen.logicalXDPI,fillParent:!0,scrollParent:!1,hideScrollbar:!1,normalize:!1,audioContext:null,container:null,dragSelection:!0,loopSelection:!0,audioRate:1,interact:!0,splitChannels:!1,mediaContainer:null,mediaControls:!1,renderer:"Canvas",backend:"WebAudio",mediaType:"audio",autoCenter:!0},init:function(b){if(this.params=a.util.extend({},this.defaultParams,b),this.container="string"==typeof b.container?document.querySelector(this.params.container):this.params.container,!this.container)throw new Error("Container element not found");if(null==this.params.mediaContainer?this.mediaContainer=this.container:"string"==typeof this.params.mediaContainer?this.mediaContainer=document.querySelector(this.params.mediaContainer):this.mediaContainer=this.params.mediaContainer,!this.mediaContainer)throw new Error("Media Container element not found");this.savedVolume=0,this.isMuted=!1,this.tmpEvents=[],this.currentAjax=null,this.createDrawer(),this.createBackend(),this.isDestroyed=!1},createDrawer:function(){var b=this;this.drawer=Object.create(a.Drawer[this.params.renderer]),this.drawer.init(this.container,this.params),this.drawer.on("redraw",function(){b.drawBuffer(),b.drawer.progress(b.backend.getPlayedPercents())}),this.drawer.on("click",function(a,c){setTimeout(function(){b.seekTo(c)},0)}),this.drawer.on("scroll",function(a){b.fireEvent("scroll",a)})},createBackend:function(){var b=this;this.backend&&this.backend.destroy(),"AudioElement"==this.params.backend&&(this.params.backend="MediaElement"),"WebAudio"!=this.params.backend||a.WebAudio.supportsWebAudio()||(this.params.backend="MediaElement"),this.backend=Object.create(a[this.params.backend]),this.backend.init(this.params),this.backend.on("finish",function(){b.fireEvent("finish")}),this.backend.on("play",function(){b.fireEvent("play")}),this.backend.on("pause",function(){b.fireEvent("pause")}),this.backend.on("audioprocess",function(a){b.drawer.progress(b.backend.getPlayedPercents()),b.fireEvent("audioprocess",a)})},getDuration:function(){return this.backend.getDuration()},getCurrentTime:function(){return this.backend.getCurrentTime()},play:function(a,b){this.fireEvent("interaction",this.play.bind(this,a,b)),this.backend.play(a,b)},pause:function(){this.backend.pause()},playPause:function(){this.backend.isPaused()?this.play():this.pause()},isPlaying:function(){return!this.backend.isPaused()},skipBackward:function(a){this.skip(-a||-this.params.skipLength)},skipForward:function(a){this.skip(a||this.params.skipLength)},skip:function(a){var b=this.getCurrentTime()||0,c=this.getDuration()||1;b=Math.max(0,Math.min(c,b+(a||0))),this.seekAndCenter(b/c)},seekAndCenter:function(a){this.seekTo(a),this.drawer.recenter(a)},seekTo:function(a){this.fireEvent("interaction",this.seekTo.bind(this,a));var b=this.backend.isPaused(),c=this.params.scrollParent;b&&(this.params.scrollParent=!1),this.backend.seekTo(a*this.getDuration()),this.drawer.progress(this.backend.getPlayedPercents()),b||(this.backend.pause(),this.backend.play()),this.params.scrollParent=c,this.fireEvent("seek",a)},stop:function(){this.pause(),this.seekTo(0),this.drawer.progress(0)},setVolume:function(a){this.backend.setVolume(a)},setPlaybackRate:function(a){this.backend.setPlaybackRate(a)},toggleMute:function(){this.isMuted?(this.backend.setVolume(this.savedVolume),this.isMuted=!1):(this.savedVolume=this.backend.getVolume(),this.backend.setVolume(0),this.isMuted=!0)},toggleScroll:function(){this.params.scrollParent=!this.params.scrollParent,this.drawBuffer()},toggleInteraction:function(){this.params.interact=!this.params.interact},drawBuffer:function(){var a=Math.round(this.getDuration()*this.params.minPxPerSec*this.params.pixelRatio),b=this.drawer.getWidth(),c=a;this.params.fillParent&&(!this.params.scrollParent||a<b)&&(c=b);var d=this.backend.getPeaks(c);this.drawer.drawPeaks(d,c),this.fireEvent("redraw",d,c)},zoom:function(a){this.params.minPxPerSec=a,this.params.scrollParent=!0,this.drawBuffer(),this.drawer.progress(this.backend.getPlayedPercents()),this.drawer.recenter(this.getCurrentTime()/this.getDuration()),this.fireEvent("zoom",a)},loadArrayBuffer:function(a){this.decodeArrayBuffer(a,function(a){this.isDestroyed||this.loadDecodedBuffer(a)}.bind(this))},loadDecodedBuffer:function(a){this.backend.load(a),this.drawBuffer(),this.fireEvent("ready")},loadBlob:function(a){var b=this,c=new FileReader;c.addEventListener("progress",function(a){b.onProgress(a)}),c.addEventListener("load",function(a){b.loadArrayBuffer(a.target.result)}),c.addEventListener("error",function(){b.fireEvent("error","Error reading file")}),c.readAsArrayBuffer(a),this.empty()},load:function(a,b){switch(this.empty(),this.params.backend){case"WebAudio":return this.loadBuffer(a,b);case"MediaElement":return this.loadMediaElement(a,b)}},loadBuffer:function(a,b){var c=function(b){return b&&this.tmpEvents.push(this.once("ready",b)),this.getArrayBuffer(a,this.loadArrayBuffer.bind(this))}.bind(this);return b?(this.backend.setPeaks(b),this.drawBuffer(),this.tmpEvents.push(this.once("interaction",c)),void 0):c()},loadMediaElement:function(a,b){var c=a;if("string"==typeof a)this.backend.load(c,this.mediaContainer,b);else{var d=a;this.backend.loadElt(d,b),c=d.src}this.tmpEvents.push(this.backend.once("canplay",function(){this.drawBuffer(),this.fireEvent("ready")}.bind(this)),this.backend.once("error",function(a){this.fireEvent("error",a)}.bind(this))),b?this.backend.setPeaks(b):this.backend.supportsWebAudio()&&this.getArrayBuffer(c,function(a){this.decodeArrayBuffer(a,function(a){this.backend.buffer=a,this.drawBuffer()}.bind(this))}.bind(this))},decodeArrayBuffer:function(a,b){this.arraybuffer=a,this.backend.decodeArrayBuffer(a,function(c){this.isDestroyed||this.arraybuffer!=a||(b(c),this.arraybuffer=null)}.bind(this),this.fireEvent.bind(this,"error","Error decoding audiobuffer"))},getArrayBuffer:function(b,c){var d=this,e=a.util.ajax({url:b,responseType:"arraybuffer"});return this.currentAjax=e,this.tmpEvents.push(e.on("progress",function(a){d.onProgress(a)}),e.on("success",function(a,b){c(a),d.currentAjax=null}),e.on("error",function(a){d.fireEvent("error","XHR error: "+a.target.statusText),d.currentAjax=null})),e},onProgress:function(a){if(a.lengthComputable)var b=a.loaded/a.total;else b=a.loaded/(a.loaded+1e6);this.fireEvent("loading",Math.round(100*b),a.target)},exportPCM:function(a,b,c){a=a||1024,b=b||1e4,c=c||!1;var d=this.backend.getPeaks(a,b),e=[].map.call(d,function(a){return Math.round(a*b)/b}),f=JSON.stringify(e);return c||window.open("data:application/json;charset=utf-8,"+encodeURIComponent(f)),f},exportImage:function(a,b){return a||(a="image/png"),b||(b=1),this.drawer.getImage(a,b)},cancelAjax:function(){this.currentAjax&&(this.currentAjax.xhr.abort(),this.currentAjax=null)},clearTmpEvents:function(){this.tmpEvents.forEach(function(a){a.un()})},empty:function(){this.backend.isPaused()||(this.stop(),this.backend.disconnectSource()),this.cancelAjax(),this.clearTmpEvents(),this.drawer.progress(0),this.drawer.setWidth(0),this.drawer.drawPeaks({length:this.drawer.getWidth()},0)},destroy:function(){this.fireEvent("destroy"),this.cancelAjax(),this.clearTmpEvents(),this.unAll(),this.backend.destroy(),this.drawer.destroy(),this.isDestroyed=!0}};return a.create=function(b){var c=Object.create(a);return c.init(b),c},a.util={extend:function(a){var b=Array.prototype.slice.call(arguments,1);return b.forEach(function(b){Object.keys(b).forEach(function(c){a[c]=b[c]})}),a},min:function(a){var b=+(1/0);for(var c in a)a[c]<b&&(b=a[c]);return b},max:function(a){var b=-(1/0);for(var c in a)a[c]>b&&(b=a[c]);return b},getId:function(){return"wavesurfer_"+Math.random().toString(32).substring(2)},ajax:function(b){var c=Object.create(a.Observer),d=new XMLHttpRequest,e=!1;return d.open(b.method||"GET",b.url,!0),d.responseType=b.responseType||"json",d.addEventListener("progress",function(a){c.fireEvent("progress",a),a.lengthComputable&&a.loaded==a.total&&(e=!0)}),d.addEventListener("load",function(a){e||c.fireEvent("progress",a),c.fireEvent("load",a),200==d.status||206==d.status?c.fireEvent("success",d.response,a):c.fireEvent("error",a)}),d.addEventListener("error",function(a){c.fireEvent("error",a)}),d.send(),c.xhr=d,c}},a.Observer={on:function(a,b){this.handlers||(this.handlers={});var c=this.handlers[a];return c||(c=this.handlers[a]=[]),c.push(b),{name:a,callback:b,un:this.un.bind(this,a,b)}},un:function(a,b){if(this.handlers){var c=this.handlers[a];if(c)if(b)for(var d=c.length-1;d>=0;d--)c[d]==b&&c.splice(d,1);else c.length=0}},unAll:function(){this.handlers=null},once:function(a,b){var c=this,d=function(){b.apply(this,arguments),setTimeout(function(){c.un(a,d)},0)};return this.on(a,d)},fireEvent:function(a){if(this.handlers){var b=this.handlers[a],c=Array.prototype.slice.call(arguments,1);b&&b.forEach(function(a){a.apply(null,c)})}}},a.util.extend(a,a.Observer),a.WebAudio={scriptBufferSize:256,PLAYING_STATE:0,PAUSED_STATE:1,FINISHED_STATE:2,supportsWebAudio:function(){return!(!window.AudioContext&&!window.webkitAudioContext)},getAudioContext:function(){return a.WebAudio.audioContext||(a.WebAudio.audioContext=new(window.AudioContext||window.webkitAudioContext)),a.WebAudio.audioContext},getOfflineAudioContext:function(b){return a.WebAudio.offlineAudioContext||(a.WebAudio.offlineAudioContext=new(window.OfflineAudioContext||window.webkitOfflineAudioContext)(1,2,b)),a.WebAudio.offlineAudioContext},init:function(b){this.params=b,this.ac=b.audioContext||this.getAudioContext(),this.lastPlay=this.ac.currentTime,this.startPosition=0,this.scheduledPause=null,this.states=[Object.create(a.WebAudio.state.playing),Object.create(a.WebAudio.state.paused),Object.create(a.WebAudio.state.finished)],this.createVolumeNode(),this.createScriptNode(),this.createAnalyserNode(),this.setState(this.PAUSED_STATE),this.setPlaybackRate(this.params.audioRate)},disconnectFilters:function(){this.filters&&(this.filters.forEach(function(a){a&&a.disconnect()}),this.filters=null,this.analyser.connect(this.gainNode))},setState:function(a){this.state!==this.states[a]&&(this.state=this.states[a],this.state.init.call(this))},setFilter:function(){this.setFilters([].slice.call(arguments))},setFilters:function(a){this.disconnectFilters(),a&&a.length&&(this.filters=a,this.analyser.disconnect(),a.reduce(function(a,b){return a.connect(b),b},this.analyser).connect(this.gainNode))},createScriptNode:function(){this.ac.createScriptProcessor?this.scriptNode=this.ac.createScriptProcessor(this.scriptBufferSize):this.scriptNode=this.ac.createJavaScriptNode(this.scriptBufferSize),this.scriptNode.connect(this.ac.destination)},addOnAudioProcess:function(){var a=this;this.scriptNode.onaudioprocess=function(){var b=a.getCurrentTime();b>=a.getDuration()?(a.setState(a.FINISHED_STATE),a.fireEvent("pause")):b>=a.scheduledPause?a.pause():a.state===a.states[a.PLAYING_STATE]&&a.fireEvent("audioprocess",b)}},removeOnAudioProcess:function(){this.scriptNode.onaudioprocess=null},createAnalyserNode:function(){this.analyser=this.ac.createAnalyser(),this.analyser.connect(this.gainNode)},createVolumeNode:function(){this.ac.createGain?this.gainNode=this.ac.createGain():this.gainNode=this.ac.createGainNode(),this.gainNode.connect(this.ac.destination)},setVolume:function(a){this.gainNode.gain.value=a},getVolume:function(){return this.gainNode.gain.value},decodeArrayBuffer:function(a,b,c){this.offlineAc||(this.offlineAc=this.getOfflineAudioContext(this.ac?this.ac.sampleRate:44100)),this.offlineAc.decodeAudioData(a,function(a){b(a)}.bind(this),c)},setPeaks:function(a){this.peaks=a},getPeaks:function(a){if(this.peaks)return this.peaks;for(var b=this.buffer.length/a,c=~~(b/10)||1,d=this.buffer.numberOfChannels,e=[],f=[],g=0;g<d;g++)for(var h=e[g]=[],i=this.buffer.getChannelData(g),j=0;j<a;j++){for(var k=~~(j*b),l=~~(k+b),m=0,n=0,o=k;o<l;o+=c){var p=i[o];p>n&&(n=p),p<m&&(m=p)}h[2*j]=n,h[2*j+1]=m,(0==g||n>f[2*j])&&(f[2*j]=n),(0==g||m<f[2*j+1])&&(f[2*j+1]=m)}return this.params.splitChannels?e:f},getPlayedPercents:function(){return this.state.getPlayedPercents.call(this)},disconnectSource:function(){this.source&&this.source.disconnect()},destroy:function(){this.isPaused()||this.pause(),this.unAll(),this.buffer=null,this.disconnectFilters(),this.disconnectSource(),this.gainNode.disconnect(),this.scriptNode.disconnect(),this.analyser.disconnect()},load:function(a){this.startPosition=0,this.lastPlay=this.ac.currentTime,this.buffer=a,this.createSource()},createSource:function(){this.disconnectSource(),this.source=this.ac.createBufferSource(),this.source.start=this.source.start||this.source.noteGrainOn,this.source.stop=this.source.stop||this.source.noteOff,this.source.playbackRate.value=this.playbackRate,this.source.buffer=this.buffer,this.source.connect(this.analyser)},isPaused:function(){return this.state!==this.states[this.PLAYING_STATE]},getDuration:function(){return this.buffer?this.buffer.duration:0},seekTo:function(a,b){if(this.buffer)return this.scheduledPause=null,null==a&&(a=this.getCurrentTime(),a>=this.getDuration()&&(a=0)),null==b&&(b=this.getDuration()),this.startPosition=a,this.lastPlay=this.ac.currentTime,this.state===this.states[this.FINISHED_STATE]&&this.setState(this.PAUSED_STATE),{start:a,end:b}},getPlayedTime:function(){return(this.ac.currentTime-this.lastPlay)*this.playbackRate},play:function(a,b){if(this.buffer){this.createSource();var c=this.seekTo(a,b);a=c.start,b=c.end,this.scheduledPause=b,this.source.start(0,a,b-a),this.setState(this.PLAYING_STATE),this.fireEvent("play")}},pause:function(){this.scheduledPause=null,this.startPosition+=this.getPlayedTime(),this.source&&this.source.stop(0),this.setState(this.PAUSED_STATE),this.fireEvent("pause")},getCurrentTime:function(){return this.state.getCurrentTime.call(this)},setPlaybackRate:function(a){a=a||1,this.isPaused()?this.playbackRate=a:(this.pause(),this.playbackRate=a,this.play())}},a.WebAudio.state={},a.WebAudio.state.playing={init:function(){this.addOnAudioProcess()},getPlayedPercents:function(){var a=this.getDuration();return this.getCurrentTime()/a||0},getCurrentTime:function(){return this.startPosition+this.getPlayedTime()}},a.WebAudio.state.paused={init:function(){this.removeOnAudioProcess()},getPlayedPercents:function(){var a=this.getDuration();return this.getCurrentTime()/a||0},getCurrentTime:function(){return this.startPosition}},a.WebAudio.state.finished={init:function(){this.removeOnAudioProcess(),this.fireEvent("finish")},getPlayedPercents:function(){return 1},getCurrentTime:function(){return this.getDuration()}},a.util.extend(a.WebAudio,a.Observer),a.MediaElement=Object.create(a.WebAudio),a.util.extend(a.MediaElement,{init:function(a){this.params=a,this.media={currentTime:0,duration:0,paused:!0,playbackRate:1,play:function(){},pause:function(){}},this.mediaType=a.mediaType.toLowerCase(),this.elementPosition=a.elementPosition,this.setPlaybackRate(this.params.audioRate),this.createTimer()},createTimer:function(){var a=this,b=function(){if(!a.isPaused()){a.fireEvent("audioprocess",a.getCurrentTime());var c=window.requestAnimationFrame||window.webkitRequestAnimationFrame;c(b)}};this.on("play",b)},load:function(a,b,c){var d=document.createElement(this.mediaType);d.controls=this.params.mediaControls,d.autoplay=this.params.autoplay||!1,d.preload="auto",d.src=a,d.style.width="100%";var e=b.querySelector(this.mediaType);e&&b.removeChild(e),b.appendChild(d),this._load(d,c)},loadElt:function(a,b){var c=a;c.controls=this.params.mediaControls,c.autoplay=this.params.autoplay||!1,this._load(c,b)},_load:function(a,b){var c=this;a.load(),a.addEventListener("error",function(){c.fireEvent("error","Error loading media element")}),a.addEventListener("canplay",function(){c.fireEvent("canplay")}),a.addEventListener("ended",function(){c.fireEvent("finish")}),this.media=a,this.peaks=b,this.onPlayEnd=null,this.buffer=null,this.setPlaybackRate(this.playbackRate)},isPaused:function(){return!this.media||this.media.paused},getDuration:function(){var a=this.media.duration;return a>=1/0&&(a=this.media.seekable.end(0)),a},getCurrentTime:function(){return this.media&&this.media.currentTime},getPlayedPercents:function(){return this.getCurrentTime()/this.getDuration()||0},setPlaybackRate:function(a){this.playbackRate=a||1,this.media.playbackRate=this.playbackRate},seekTo:function(a){null!=a&&(this.media.currentTime=a),this.clearPlayEnd()},play:function(a,b){this.seekTo(a),this.media.play(),b&&this.setPlayEnd(b),this.fireEvent("play")},pause:function(){this.media&&this.media.pause(),this.clearPlayEnd(),this.fireEvent("pause")},setPlayEnd:function(a){var b=this;this.onPlayEnd=function(c){c>=a&&(b.pause(),b.seekTo(a))},this.on("audioprocess",this.onPlayEnd)},clearPlayEnd:function(){this.onPlayEnd&&(this.un("audioprocess",this.onPlayEnd),this.onPlayEnd=null)},getPeaks:function(b){return this.buffer?a.WebAudio.getPeaks.call(this,b):this.peaks||[]},getVolume:function(){return this.media.volume},setVolume:function(a){this.media.volume=a},destroy:function(){this.pause(),this.unAll(),this.media&&this.media.parentNode&&this.media.parentNode.removeChild(this.media),this.media=null}}),a.AudioElement=a.MediaElement,a.Drawer={init:function(a,b){this.container=a,this.params=b,this.width=0,this.height=b.height*this.params.pixelRatio,this.lastPos=0,this.initDrawer(b),this.createWrapper(),this.createElements()},createWrapper:function(){this.wrapper=this.container.appendChild(document.createElement("wave")),this.style(this.wrapper,{display:"block",position:"relative",userSelect:"none",webkitUserSelect:"none",height:this.params.height+"px"}),(this.params.fillParent||this.params.scrollParent)&&this.style(this.wrapper,{width:"100%",overflowX:this.params.hideScrollbar?"hidden":"auto",overflowY:"hidden"}),this.setupWrapperEvents()},handleEvent:function(a,b){!b&&a.preventDefault();var c,d=a.targetTouches?a.targetTouches[0].clientX:a.clientX,e=this.wrapper.getBoundingClientRect(),f=this.width,g=this.getWidth();return!this.params.fillParent&&f<g?(c=(d-e.left)*this.params.pixelRatio/f||0,c>1&&(c=1)):c=(d-e.left+this.wrapper.scrollLeft)/this.wrapper.scrollWidth||0,c},setupWrapperEvents:function(){var a=this;this.wrapper.addEventListener("click",function(b){var c=a.wrapper.offsetHeight-a.wrapper.clientHeight;if(0!=c){var d=a.wrapper.getBoundingClientRect();if(b.clientY>=d.bottom-c)return}a.params.interact&&a.fireEvent("click",b,a.handleEvent(b))}),this.wrapper.addEventListener("scroll",function(b){a.fireEvent("scroll",b)})},drawPeaks:function(a,b){this.resetScroll(),this.setWidth(b),this.params.barWidth?this.drawBars(a):this.drawWave(a)},style:function(a,b){return Object.keys(b).forEach(function(c){a.style[c]!==b[c]&&(a.style[c]=b[c])}),a},resetScroll:function(){null!==this.wrapper&&(this.wrapper.scrollLeft=0)},recenter:function(a){var b=this.wrapper.scrollWidth*a;this.recenterOnPosition(b,!0)},recenterOnPosition:function(a,b){var c=this.wrapper.scrollLeft,d=~~(this.wrapper.clientWidth/2),e=a-d,f=e-c,g=this.wrapper.scrollWidth-this.wrapper.clientWidth;if(0!=g){if(!b&&-d<=f&&f<d){var h=5;f=Math.max(-h,Math.min(h,f)),e=c+f}e=Math.max(0,Math.min(g,e)),e!=c&&(this.wrapper.scrollLeft=e)}},getWidth:function(){return Math.round(this.container.clientWidth*this.params.pixelRatio)},setWidth:function(a){this.width=a,this.params.fillParent||this.params.scrollParent?this.style(this.wrapper,{width:""}):this.style(this.wrapper,{width:~~(this.width/this.params.pixelRatio)+"px"}),this.updateSize()},setHeight:function(a){a!=this.height&&(this.height=a,this.style(this.wrapper,{height:~~(this.height/this.params.pixelRatio)+"px"}),this.updateSize())},progress:function(a){var b=1/this.params.pixelRatio,c=Math.round(a*this.width)*b;if(c<this.lastPos||c-this.lastPos>=b){if(this.lastPos=c,this.params.scrollParent&&this.params.autoCenter){var d=~~(this.wrapper.scrollWidth*a);this.recenterOnPosition(d)}this.updateProgress(a)}},destroy:function(){this.unAll(),this.wrapper&&(this.container.removeChild(this.wrapper),this.wrapper=null)},initDrawer:function(){},createElements:function(){},updateSize:function(){},drawWave:function(a,b){},clearWave:function(){},updateProgress:function(a){}},a.util.extend(a.Drawer,a.Observer),a.Drawer.Canvas=Object.create(a.Drawer),a.util.extend(a.Drawer.Canvas,{createElements:function(){var a=this.wrapper.appendChild(this.style(document.createElement("canvas"),{position:"absolute",zIndex:1,left:0,top:0,bottom:0}));if(this.waveCc=a.getContext("2d"),this.progressWave=this.wrapper.appendChild(this.style(document.createElement("wave"),{position:"absolute",zIndex:2,left:0,top:0,bottom:0,overflow:"hidden",width:"0",display:"none",boxSizing:"border-box",borderRightStyle:"solid",borderRightWidth:this.params.cursorWidth+"px",borderRightColor:this.params.cursorColor})),this.params.waveColor!=this.params.progressColor){var b=this.progressWave.appendChild(document.createElement("canvas"));this.progressCc=b.getContext("2d")}},updateSize:function(){var a=Math.round(this.width/this.params.pixelRatio);this.waveCc.canvas.width=this.width,this.waveCc.canvas.height=this.height,this.style(this.waveCc.canvas,{width:a+"px"}),this.style(this.progressWave,{display:"block"}),this.progressCc&&(this.progressCc.canvas.width=this.width,this.progressCc.canvas.height=this.height,this.style(this.progressCc.canvas,{width:a+"px"})),this.clearWave()},clearWave:function(){this.waveCc.clearRect(0,0,this.width,this.height),this.progressCc&&this.progressCc.clearRect(0,0,this.width,this.height)},drawBars:function(b,c){if(b[0]instanceof Array){var d=b;if(this.params.splitChannels)return this.setHeight(d.length*this.params.height*this.params.pixelRatio),void d.forEach(this.drawBars,this);b=d[0]}var e=[].some.call(b,function(a){return a<0});e&&(b=[].filter.call(b,function(a,b){return b%2==0}));var f=.5/this.params.pixelRatio,g=this.width,h=this.params.height*this.params.pixelRatio,i=h*c||0,j=h/2,k=b.length,l=this.params.barWidth*this.params.pixelRatio,m=Math.max(this.params.pixelRatio,~~(l/2)),n=l+m,o=1;this.params.normalize&&(o=a.util.max(b));var p=k/g;this.waveCc.fillStyle=this.params.waveColor,this.progressCc&&(this.progressCc.fillStyle=this.params.progressColor),[this.waveCc,this.progressCc].forEach(function(a){if(a)for(var c=0;c<g;c+=n){var d=Math.round(b[Math.floor(c*p)]/o*j);a.fillRect(c+f,j-d+i,l+f,2*d)}},this)},drawWave:function(b,c){if(b[0]instanceof Array){var d=b;if(this.params.splitChannels)return this.setHeight(d.length*this.params.height*this.params.pixelRatio),void d.forEach(this.drawWave,this);b=d[0]}var e=[].some.call(b,function(a){return a<0});if(!e){for(var f=[],g=0,h=b.length;g<h;g++)f[2*g]=b[g],f[2*g+1]=-b[g];b=f}var i=.5/this.params.pixelRatio,j=this.params.height*this.params.pixelRatio,k=j*c||0,l=j/2,m=~~(b.length/2),n=1;this.params.fillParent&&this.width!=m&&(n=this.width/m);var o=1;if(this.params.normalize){var p=a.util.max(b),q=a.util.min(b);o=-q>p?-q:p}this.waveCc.fillStyle=this.params.waveColor,this.progressCc&&(this.progressCc.fillStyle=this.params.progressColor),[this.waveCc,this.progressCc].forEach(function(a){if(a){a.beginPath(),a.moveTo(i,l+k);for(var c=0;c<m;c++){var d=Math.round(b[2*c]/o*l);a.lineTo(c*n+i,l-d+k)}for(var c=m-1;c>=0;c--){var d=Math.round(b[2*c+1]/o*l);a.lineTo(c*n+i,l-d+k)}a.closePath(),a.fill(),a.fillRect(0,l+k-i,this.width,i)}},this)},updateProgress:function(a){var b=Math.round(this.width*a)/this.params.pixelRatio;this.style(this.progressWave,{width:b+"px"})},getImage:function(a,b){return this.waveCc.canvas.toDataURL(a,b)}}),a.Drawer.MultiCanvas=Object.create(a.Drawer),a.util.extend(a.Drawer.MultiCanvas,{initDrawer:function(a){if(this.maxCanvasWidth=null!=a.maxCanvasWidth?a.maxCanvasWidth:4e3,this.maxCanvasElementWidth=Math.round(this.maxCanvasWidth/this.params.pixelRatio),this.maxCanvasWidth<=1)throw"maxCanvasWidth must be greater than 1.";if(this.maxCanvasWidth%2==1)throw"maxCanvasWidth must be an even number.";this.hasProgressCanvas=this.params.waveColor!=this.params.progressColor,this.halfPixel=.5/this.params.pixelRatio,this.canvases=[]},createElements:function(){this.progressWave=this.wrapper.appendChild(this.style(document.createElement("wave"),{position:"absolute",zIndex:2,left:0,top:0,bottom:0,overflow:"hidden",width:"0",display:"none",boxSizing:"border-box",borderRightStyle:"solid",borderRightWidth:this.params.cursorWidth+"px",borderRightColor:this.params.cursorColor})),this.addCanvas()},updateSize:function(){for(var a=Math.round(this.width/this.params.pixelRatio),b=Math.ceil(a/this.maxCanvasElementWidth);this.canvases.length<b;)this.addCanvas();for(;this.canvases.length>b;)this.removeCanvas();for(var c in this.canvases){var d=this.maxCanvasWidth+2*Math.ceil(this.params.pixelRatio/2);c==this.canvases.length-1&&(d=this.width-this.maxCanvasWidth*(this.canvases.length-1)),this.updateDimensions(this.canvases[c],d,this.height),this.clearWaveForEntry(this.canvases[c])}},addCanvas:function(){var a={},b=this.maxCanvasElementWidth*this.canvases.length;a.wave=this.wrapper.appendChild(this.style(document.createElement("canvas"),{position:"absolute",zIndex:1,left:b+"px",top:0,bottom:0})),a.waveCtx=a.wave.getContext("2d"),this.hasProgressCanvas&&(a.progress=this.progressWave.appendChild(this.style(document.createElement("canvas"),{position:"absolute",left:b+"px",top:0,bottom:0})),a.progressCtx=a.progress.getContext("2d")),this.canvases.push(a)},removeCanvas:function(){var a=this.canvases.pop();a.wave.parentElement.removeChild(a.wave),this.hasProgressCanvas&&a.progress.parentElement.removeChild(a.progress)},updateDimensions:function(a,b,c){var d=Math.round(b/this.params.pixelRatio),e=Math.round(this.width/this.params.pixelRatio);a.start=a.waveCtx.canvas.offsetLeft/e||0,a.end=a.start+d/e,a.waveCtx.canvas.width=b,a.waveCtx.canvas.height=c,this.style(a.waveCtx.canvas,{width:d+"px"}),this.style(this.progressWave,{display:"block"}),this.hasProgressCanvas&&(a.progressCtx.canvas.width=b,a.progressCtx.canvas.height=c,this.style(a.progressCtx.canvas,{width:d+"px"}))},clearWave:function(){for(var a in this.canvases)this.clearWaveForEntry(this.canvases[a])},clearWaveForEntry:function(a){a.waveCtx.clearRect(0,0,a.waveCtx.canvas.width,a.waveCtx.canvas.height),this.hasProgressCanvas&&a.progressCtx.clearRect(0,0,a.progressCtx.canvas.width,a.progressCtx.canvas.height)},drawBars:function(b,c){if(b[0]instanceof Array){var d=b;if(this.params.splitChannels)return this.setHeight(d.length*this.params.height*this.params.pixelRatio),void d.forEach(this.drawBars,this);b=d[0]}var e=[].some.call(b,function(a){return a<0});e&&(b=[].filter.call(b,function(a,b){return b%2==0}));var f=this.width,g=this.params.height*this.params.pixelRatio,h=g*c||0,i=g/2,j=b.length,k=this.params.barWidth*this.params.pixelRatio,l=Math.max(this.params.pixelRatio,~~(k/2)),m=k+l,n=1;this.params.normalize&&(n=a.util.max(b));for(var o=j/f,p=0;p<f;p+=m){var q=Math.round(b[Math.floor(p*o)]/n*i);this.fillRect(p+this.halfPixel,i-q+h,k+this.halfPixel,2*q)}},drawWave:function(b,c){if(b[0]instanceof Array){var d=b;if(this.params.splitChannels)return this.setHeight(d.length*this.params.height*this.params.pixelRatio),void d.forEach(this.drawWave,this);b=d[0]}var e=[].some.call(b,function(a){return a<0});if(!e){for(var f=[],g=0,h=b.length;g<h;g++)f[2*g]=b[g],f[2*g+1]=-b[g];b=f}var i=this.params.height*this.params.pixelRatio,j=i*c||0,k=i/2,l=1;if(this.params.normalize){var m=a.util.max(b),n=a.util.min(b);l=-n>m?-n:m}this.drawLine(b,l,k,j),this.fillRect(0,k+j-this.halfPixel,this.width,this.halfPixel)},drawLine:function(a,b,c,d){for(var e in this.canvases){var f=this.canvases[e];this.setFillStyles(f),this.drawLineToContext(f,f.waveCtx,a,b,c,d),this.drawLineToContext(f,f.progressCtx,a,b,c,d)}},drawLineToContext:function(a,b,c,d,e,f){if(b){var g=c.length/2,h=1;this.params.fillParent&&this.width!=g&&(h=this.width/g);var i=Math.round(g*a.start),j=Math.round(g*a.end);b.beginPath(),b.moveTo(this.halfPixel,e+f);for(var k=i;k<j;k++){var l=Math.round(c[2*k]/d*e);b.lineTo((k-i)*h+this.halfPixel,e-l+f)}for(var k=j-1;k>=i;k--){var l=Math.round(c[2*k+1]/d*e);b.lineTo((k-i)*h+this.halfPixel,e-l+f)}b.closePath(),b.fill()}},fillRect:function(a,b,c,d){for(var e in this.canvases){var f=this.canvases[e],g=e*this.maxCanvasWidth,h={x1:Math.max(a,e*this.maxCanvasWidth),y1:b,x2:Math.min(a+c,e*this.maxCanvasWidth+f.waveCtx.canvas.width),y2:b+d};h.x1<h.x2&&(this.setFillStyles(f),this.fillRectToContext(f.waveCtx,h.x1-g,h.y1,h.x2-h.x1,h.y2-h.y1),this.fillRectToContext(f.progressCtx,h.x1-g,h.y1,h.x2-h.x1,h.y2-h.y1))}},fillRectToContext:function(a,b,c,d,e){a&&a.fillRect(b,c,d,e)},setFillStyles:function(a){a.waveCtx.fillStyle=this.params.waveColor,this.hasProgressCanvas&&(a.progressCtx.fillStyle=this.params.progressColor)},updateProgress:function(a){var b=Math.round(this.width*a)/this.params.pixelRatio;this.style(this.progressWave,{width:b+"px"})}}),function(){var b=function(){var b=document.querySelectorAll("wavesurfer");Array.prototype.forEach.call(b,function(b){var c=a.util.extend({container:b,backend:"MediaElement",mediaControls:!0},b.dataset);b.style.display="block";var d=a.create(c);if(b.dataset.peaks)var e=JSON.parse(b.dataset.peaks);d.load(b.dataset.url,e)})};"complete"===document.readyState?b():window.addEventListener("load",b)}(),a});
;!function(a,b){"function"==typeof define&&define.amd?define(["wavesurfer"],function(a){return b(a)}):"object"==typeof exports?module.exports=b(require("wavesurfer.js")):b(WaveSurfer)}(this,function(a){"use strict";a.Regions={init:function(a){this.wavesurfer=a,this.wrapper=this.wavesurfer.drawer.wrapper,this.list={}},add:function(b){var c=Object.create(a.Region);return c.init(b,this.wavesurfer),this.list[c.id]=c,c.on("remove",function(){delete this.list[c.id]}.bind(this)),c},clear:function(){Object.keys(this.list).forEach(function(a){this.list[a].remove()},this)},enableDragSelection:function(a){var b,c,d,e,f=this,g=a.slop||2,h=0,i=function(a){a.touches&&a.touches.length>1||(e=a.targetTouches?a.targetTouches[0].identifier:null,b=!0,c=f.wavesurfer.drawer.handleEvent(a,!0),d=null)};this.wrapper.addEventListener("mousedown",i),this.wrapper.addEventListener("touchstart",i),this.on("disable-drag-selection",function(){f.wrapper.removeEventListener("touchstart",i),f.wrapper.removeEventListener("mousedown",i)});var j=function(a){a.touches&&a.touches.length>1||(b=!1,h=0,d&&(d.fireEvent("update-end",a),f.wavesurfer.fireEvent("region-update-end",d,a)),d=null)};this.wrapper.addEventListener("mouseup",j),this.wrapper.addEventListener("touchend",j),this.on("disable-drag-selection",function(){f.wrapper.removeEventListener("touchend",j),f.wrapper.removeEventListener("mouseup",j)});var k=function(i){if(b&&!(++h<=g||i.touches&&i.touches.length>1||i.targetTouches&&i.targetTouches[0].identifier!=e)){d||(d=f.add(a||{}));var j=f.wavesurfer.getDuration(),k=f.wavesurfer.drawer.handleEvent(i);d.update({start:Math.min(k*j,c*j),end:Math.max(k*j,c*j)})}};this.wrapper.addEventListener("mousemove",k),this.wrapper.addEventListener("touchmove",k),this.on("disable-drag-selection",function(){f.wrapper.removeEventListener("touchmove",k),f.wrapper.removeEventListener("mousemove",k)})},disableDragSelection:function(){this.fireEvent("disable-drag-selection")}},a.util.extend(a.Regions,a.Observer),a.Region={style:a.Drawer.style,init:function(b,c){this.wavesurfer=c,this.wrapper=c.drawer.wrapper,this.id=null==b.id?a.util.getId():b.id,this.start=Number(b.start)||0,this.end=null==b.end?this.start+4/this.wrapper.scrollWidth*this.wavesurfer.getDuration():Number(b.end),this.resize=void 0===b.resize||Boolean(b.resize),this.drag=void 0===b.drag||Boolean(b.drag),this.loop=Boolean(b.loop),this.color=b.color||"rgba(0, 0, 0, 0.1)",this.data=b.data||{},this.attributes=b.attributes||{},this.maxLength=b.maxLength,this.minLength=b.minLength,this.bindInOut(),this.render(),this.wavesurfer.on("zoom",this.updateRender.bind(this)),this.wavesurfer.fireEvent("region-created",this)},update:function(a){null!=a.start&&(this.start=Number(a.start)),null!=a.end&&(this.end=Number(a.end)),null!=a.loop&&(this.loop=Boolean(a.loop)),null!=a.color&&(this.color=a.color),null!=a.data&&(this.data=a.data),null!=a.resize&&(this.resize=Boolean(a.resize)),null!=a.drag&&(this.drag=Boolean(a.drag)),null!=a.maxLength&&(this.maxLength=Number(a.maxLength)),null!=a.minLength&&(this.minLength=Number(a.minLength)),null!=a.attributes&&(this.attributes=a.attributes),this.updateRender(),this.fireEvent("update"),this.wavesurfer.fireEvent("region-updated",this)},remove:function(){this.element&&(this.wrapper.removeChild(this.element),this.element=null,this.fireEvent("remove"),this.wavesurfer.un("zoom",this.updateRender.bind(this)),this.wavesurfer.fireEvent("region-removed",this))},play:function(){this.wavesurfer.play(this.start,this.end),this.fireEvent("play"),this.wavesurfer.fireEvent("region-play",this)},playLoop:function(){this.play(),this.once("out",this.playLoop.bind(this))},render:function(){var a=document.createElement("region");a.className="wavesurfer-region",a.title=this.formatTime(this.start,this.end),a.setAttribute("data-id",this.id);for(var b in this.attributes)a.setAttribute("data-region-"+b,this.attributes[b]);this.wrapper.scrollWidth;if(this.style(a,{position:"absolute",zIndex:2,height:"100%",top:"0px"}),this.resize){var c=a.appendChild(document.createElement("handle")),d=a.appendChild(document.createElement("handle"));c.className="wavesurfer-handle wavesurfer-handle-start",d.className="wavesurfer-handle wavesurfer-handle-end";var e={cursor:"col-resize",position:"absolute",left:"0px",top:"0px",width:"1%",maxWidth:"4px",height:"100%"};this.style(c,e),this.style(d,e),this.style(d,{left:"100%"})}this.element=this.wrapper.appendChild(a),this.updateRender(),this.bindEvents(a)},formatTime:function(a,b){return(a==b?[a]:[a,b]).map(function(a){return[Math.floor(a%3600/60),("00"+Math.floor(a%60)).slice(-2)].join(":")}).join("-")},updateRender:function(a){var b,c=this.wavesurfer.getDuration();if(b=a?Math.round(this.wavesurfer.getDuration()*a):this.wrapper.scrollWidth,this.start<0&&(this.start=0,this.end=this.end-this.start),this.end>c&&(this.end=c,this.start=c-(this.end-this.start)),null!=this.minLength&&(this.end=Math.max(this.start+this.minLength,this.end)),null!=this.maxLength&&(this.end=Math.min(this.start+this.maxLength,this.end)),null!=this.element){var d=Math.round(this.start/c*b),e=Math.round(this.end/c*b)-d;this.style(this.element,{left:d+"px",width:e+"px",backgroundColor:this.color,cursor:this.drag?"move":"default"});for(var f in this.attributes)this.element.setAttribute("data-region-"+f,this.attributes[f]);this.element.title=this.formatTime(this.start,this.end)}},bindInOut:function(){var a=this;a.firedIn=!1,a.firedOut=!1;var b=function(b){!a.firedOut&&a.firedIn&&(a.start>=Math.round(100*b)/100||a.end<=Math.round(100*b)/100)&&(a.firedOut=!0,a.firedIn=!1,a.fireEvent("out"),a.wavesurfer.fireEvent("region-out",a)),!a.firedIn&&a.start<=b&&a.end>b&&(a.firedIn=!0,a.firedOut=!1,a.fireEvent("in"),a.wavesurfer.fireEvent("region-in",a))};this.wavesurfer.backend.on("audioprocess",b),this.on("remove",function(){a.wavesurfer.backend.un("audioprocess",b)}),this.on("out",function(){a.loop&&a.wavesurfer.play(a.start)})},bindEvents:function(){var a=this;this.element.addEventListener("mouseenter",function(b){a.fireEvent("mouseenter",b),a.wavesurfer.fireEvent("region-mouseenter",a,b)}),this.element.addEventListener("mouseleave",function(b){a.fireEvent("mouseleave",b),a.wavesurfer.fireEvent("region-mouseleave",a,b)}),this.element.addEventListener("click",function(b){b.preventDefault(),a.fireEvent("click",b),a.wavesurfer.fireEvent("region-click",a,b)}),this.element.addEventListener("dblclick",function(b){b.stopPropagation(),b.preventDefault(),a.fireEvent("dblclick",b),a.wavesurfer.fireEvent("region-dblclick",a,b)}),(this.drag||this.resize)&&function(){var b,c,d,e,f=a.wavesurfer.getDuration(),g=function(g){g.touches&&g.touches.length>1||(e=g.targetTouches?g.targetTouches[0].identifier:null,g.stopPropagation(),d=a.wavesurfer.drawer.handleEvent(g,!0)*f,"handle"==g.target.tagName.toLowerCase()?c=g.target.classList.contains("wavesurfer-handle-start")?"start":"end":(b=!0,c=!1))},h=function(d){d.touches&&d.touches.length>1||(b||c)&&(b=!1,c=!1,a.fireEvent("update-end",d),a.wavesurfer.fireEvent("region-update-end",a,d))},i=function(g){if(!(g.touches&&g.touches.length>1)&&(!g.targetTouches||g.targetTouches[0].identifier==e)&&(b||c)){var h=a.wavesurfer.drawer.handleEvent(g)*f,i=h-d;d=h,a.drag&&b&&a.onDrag(i),a.resize&&c&&a.onResize(i,c)}};a.element.addEventListener("mousedown",g),a.element.addEventListener("touchstart",g),a.wrapper.addEventListener("mousemove",i),a.wrapper.addEventListener("touchmove",i),document.body.addEventListener("mouseup",h),document.body.addEventListener("touchend",h),a.on("remove",function(){document.body.removeEventListener("mouseup",h),document.body.removeEventListener("touchend",h),a.wrapper.removeEventListener("mousemove",i),a.wrapper.removeEventListener("touchmove",i)}),a.wavesurfer.on("destroy",function(){document.body.removeEventListener("mouseup",h),document.body.removeEventListener("touchend",h)})}()},onDrag:function(a){var b=this.wavesurfer.getDuration();this.end+a>b||this.start+a<0||this.update({start:this.start+a,end:this.end+a})},onResize:function(a,b){"start"==b?this.update({start:Math.min(this.start+a,this.end),end:Math.max(this.start+a,this.end)}):this.update({start:Math.min(this.end+a,this.start),end:Math.max(this.end+a,this.start)})}},a.util.extend(a.Region,a.Observer),a.initRegions=function(){this.regions||(this.regions=Object.create(a.Regions),this.regions.init(this))},a.addRegion=function(a){return this.initRegions(),this.regions.add(a)},a.clearRegions=function(){this.regions&&this.regions.clear()},a.enableDragSelection=function(a){this.initRegions(),this.regions.enableDragSelection(a)},a.disableDragSelection=function(){this.regions.disableDragSelection()}});;!function(a,b){"function"==typeof define&&define.amd?define(["wavesurfer"],function(a){return b(a)}):"object"==typeof exports?module.exports=b(require("wavesurfer.js")):b(WaveSurfer)}(this,function(a){"use strict";a.Timeline={init:function(a){this.params=a;var b=this.wavesurfer=a.wavesurfer;if(!this.wavesurfer)throw Error("No WaveSurfer intance provided");var c=this.drawer=this.wavesurfer.drawer;if(this.container="string"==typeof a.container?document.querySelector(a.container):a.container,!this.container)throw Error("No container for WaveSurfer timeline");this.width=c.width,this.pixelRatio=this.drawer.params.pixelRatio,this.maxCanvasWidth=c.maxCanvasWidth||this.width,this.maxCanvasElementWidth=c.maxCanvasElementWidth||Math.round(this.maxCanvasWidth/this.pixelRatio),this.height=this.params.height||20,this.notchPercentHeight=this.params.notchPercentHeight||90,this.primaryColor=this.params.primaryColor||"#000",this.secondaryColor=this.params.secondaryColor||"#c0c0c0",this.primaryFontColor=this.params.primaryFontColor||"#000",this.secondaryFontColor=this.params.secondaryFontColor||"#000",this.fontFamily=this.params.fontFamily||"Arial",this.fontSize=this.params.fontSize||10,this.timeInterval=this.params.timeInterval,this.primaryLabelInterval=this.params.primaryLabelInterval,this.secondaryLabelInterval=this.params.secondaryLabelInterval,this.formatTimeCallback=this.params.formatTimeCallback,this.canvases=[],this.createWrapper(),this.render(),c.wrapper.addEventListener("scroll",function(a){this.updateScroll(a)}.bind(this)),b.on("redraw",this.render.bind(this)),b.on("destroy",this.destroy.bind(this))},destroy:function(){this.unAll(),this.wrapper&&this.wrapper.parentNode&&(this.wrapper.parentNode.removeChild(this.wrapper),this.wrapper=null)},createWrapper:function(){var a=this.container.querySelector("timeline");a&&this.container.removeChild(a);var b=this.wavesurfer.params;this.wrapper=this.container.appendChild(document.createElement("timeline")),this.drawer.style(this.wrapper,{display:"block",position:"relative",userSelect:"none",webkitUserSelect:"none",height:this.height+"px"}),(b.fillParent||b.scrollParent)&&this.drawer.style(this.wrapper,{width:"100%",overflowX:"hidden",overflowY:"hidden"});var c=this;this.wrapper.addEventListener("click",function(a){a.preventDefault();var b="offsetX"in a?a.offsetX:a.layerX;c.fireEvent("click",b/c.wrapper.scrollWidth||0)})},removeOldCanvases:function(){for(;this.canvases.length>0;){var a=this.canvases.pop();a.parentElement.removeChild(a)}},createCanvases:function(){this.removeOldCanvases();for(var a,b=Math.round(this.drawer.wrapper.scrollWidth),c=Math.ceil(b/this.maxCanvasElementWidth),d=0;d<c;d++)a=this.wrapper.appendChild(document.createElement("canvas")),this.canvases.push(a),this.drawer.style(a,{position:"absolute",zIndex:4})},render:function(){this.createCanvases(),this.updateCanvasStyle(),this.drawTimeCanvases()},updateCanvasStyle:function(){for(var a=this.canvases.length,b=0;b<a;b++){var c=this.canvases[b],d=this.maxCanvasElementWidth;b===a-1&&(d=this.drawer.wrapper.scrollWidth-this.maxCanvasElementWidth*(a-1)),c.width=d*this.pixelRatio,c.height=this.height*this.pixelRatio,c.style.width=d+"px",c.style.height=this.height+"px",c.style.left=b*this.maxCanvasElementWidth+"px"}},drawTimeCanvases:function(){var a=this.wavesurfer.backend,b=this.wavesurfer.params,c=a.getDuration(),d=this;if(b.fillParent&&!b.scrollParent)var e=this.drawer.getWidth();else e=this.drawer.wrapper.scrollWidth*b.pixelRatio;var f=e/c;if(!(c<=0)){var g=0,h=0,i=parseInt(c,10)+1,j=function(a){if("function"==typeof d.formatTimeCallback)return d.formatTimeCallback(a);if(a/60>1){var b=parseInt(a/60),a=parseInt(a%60);return a=a<10?"0"+a:a,""+b+":"+a}return a};if(1*f>=25)var k=1,l=10,m=5;else if(5*f>=25)var k=5,l=6,m=2;else if(15*f>=25)var k=15,l=4,m=2;else var k=60,l=4,m=2;k=this.timeInterval||k,l=this.primaryLabelInterval||l,m=this.secondaryLabelInterval||m;for(var n=this.height-4,o=this.height*(this.notchPercentHeight/100)-4,p=this.fontSize*b.pixelRatio,q=0;q<i/k;q++)q%l==0?(this.setFillStyles(this.primaryColor),this.fillRect(g,0,1,n),this.setFonts(p+"px "+this.fontFamily),this.setFillStyles(this.primaryFontColor),this.fillText(j(h),g+5,n)):q%m==0?(this.setFillStyles(this.secondaryColor),this.fillRect(g,0,1,n),this.setFonts(p+"px "+this.fontFamily),this.setFillStyles(this.secondaryFontColor),this.fillText(j(h),g+5,n)):(this.setFillStyles(this.secondaryColor),this.fillRect(g,0,1,o)),h+=k,g+=f*k}},setFillStyles:function(a){for(var b in this.canvases)this.canvases[b].getContext("2d").fillStyle=a},setFonts:function(a){for(var b in this.canvases)this.canvases[b].getContext("2d").font=a},fillRect:function(a,b,c,d){for(var e in this.canvases){var f=this.canvases[e],g=e*this.maxCanvasWidth,h={x1:Math.max(a,e*this.maxCanvasWidth),y1:b,x2:Math.min(a+c,e*this.maxCanvasWidth+f.width),y2:b+d};h.x1<h.x2&&f.getContext("2d").fillRect(h.x1-g,h.y1,h.x2-h.x1,h.y2-h.y1)}},fillText:function(a,b,c){var d,e=0;for(var f in this.canvases){var g=this.canvases[f].getContext("2d"),h=g.canvas.width;if(e>b+d)break;e+h>b&&(d=g.measureText(a).width,g.fillText(a,b-e,c)),e+=h}},updateScroll:function(){this.wrapper.scrollLeft=this.drawer.wrapper.scrollLeft}},a.util.extend(a.Timeline,a.Observer)});;/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
(function ($) {
    $.fn.divtotable = function ()
    {
                
    //AFFICHAGE DU HEADER : TITRE, OPTIONS D'AFFICHAGE
    //var div_header = $('<div xmlns:php="http://php.net/xsl" xmlns:crdo="http://crdo.risc.cnrs.fr/schemas/" xmlns:annot="http://crdo.risc.fr/schemas/annotation" style="margin-left: 5px;">');
    var div_header = $('<div class="row">');
  
    var header = $('<h2 align="center"></h2>');
    var title = $('<strong style="font-size:16px"></strong>');
    title.html($(this).find('#titre').html());
    title.append('<a href="show_metadatas.php?id='+$(this).find('#crdo_id').html()+'&amp;lg='+$(this).find('#langue').html()+'" target="_blank"><img class="sansBordure" src="http://lacito.vjf.cnrs.fr/images/icones/info_marron.jpg"></a>');

    header.append(title);
    var link_langue = $('<a></a>');
    link_langue.append($(this).find('#langue').html());
    var table_contributeurs = $('<table width="100%"></table>');
    var tbody_contributeurs = $('<tbody></tbody>');
    var tr_contributeurs = $('<tr></tr>');
    
    var td_chercheurs = $('<td align="left"></td>');
    var td_locuteurs = $('<td align="right"></td>');
    
    td_chercheurs.html('Chercheur(s) : ');   
    var span = $('<span style="color:#333"></span>');
    span.append($(this).find('#chercheurs').html());
    td_chercheurs.append(span);
            
    td_locuteurs.html('Locuteur(s) : ');
    var span = $('<span style="color:#333"></span>');
    span.append($(this).find('#locuteurs').html());
    td_locuteurs.append(span);
    
    tr_contributeurs.append(td_chercheurs).append(td_locuteurs);
    tbody_contributeurs.append(tr_contributeurs);
    table_contributeurs.append(tbody_contributeurs);
    
    header.append('<br>').append(messages('Langue')+' : ').append(link_langue).append('<br><br>').append(table_contributeurs);
    
    
    //AFFICHAGE DES OPTIONS DE LECTURE
    var div_audio = $('<div class="sixteen wide column"></div>');    
    div_audio.append($(this).find('audio'));
    
    div_audio.append('<span style="margin-left:10px">Lecture en continu :</span>');
    div_audio.append('<input id="karaoke" name="karaoke" checked="checked" type="checkbox">');   
    div_header.append(header).append('<br>').append(div_audio);
    
    //il faut détecter les types de transcription et les langues disponibles en traduction
    var opt_transcriptions = new Array();
    var opt_traductions = new Array();
    
    $(this).find('.transcription').each(function(){
        var text = $(this).attr('class').replace('transcription ','');
        
        if($.inArray(text, opt_transcriptions)<0)       
            opt_transcriptions.push(text);
        
    });
    //opt_transcriptions = $.unique(opt_transcriptions);

    
    $(this).find('.traduction').each(function(){
        var text = $(this).attr('class').replace('traduction ','');
        
        if($.inArray(text, opt_traductions)<0)       
            opt_traductions.push(text);
    });
    //opt_traductions = $.unique(opt_traductions);

    
    var div_opts = $('<div class="sixteen wide column"></div>');
    var table_opts = $('<table width="100%"></table>');
    var tbody_opts = $('<tbody></tbody>');
    var tr_opts = $('<tr></tr>');
    
    var td_opt1 = $('<td></td>');
    var table_opt1 = $('<table></table>');
    var tbody_opt1 = $('<tbody></tbody>');
    
    tbody_opt1.append('<tr><th>'+messages('Transcription par phrase')+'</th></tr>');
    var tr_transcription = $('<tr></tr>');
    var td_transcription = $('<td></td>');
    
    $.each(opt_transcriptions,function(){
        var name = 'transcription_'+this;
        var input_transcription = $('<input type="checkbox" checked="checked" name="'+name+'">');
        
        td_transcription.append(input_transcription).append(this);
    });
    
    tbody_opt1.append(tr_transcription.append(td_transcription));
    
    tbody_opt1.append('<tr> </tr>').append('<tr> </tr>').append('<tr> </tr>').append('<tr> </tr>').append('<tr><td><br></td></tr>');
    
    tbody_opt1.append('<tr><th>'+messages('Traduction par phrase')+'</th></tr>');
    var tr_traduction = $('<tr></tr>');
    var td_traduction = $('<td></td>');
    
    $.each(opt_traductions,function(){
        var name = 'translation_'+this;
        var input_traduction = $('<input type="checkbox" checked="checked" name="'+name+'">');
        
        td_traduction.append(input_traduction).append(this.toUpperCase());
    });
    
    tbody_opt1.append(tr_traduction.append(td_traduction));
    
       
    td_opt1.append(table_opt1.append(tbody_opt1));
    
    var td_opt2 = $('<td></td>');
    var table_opt2 = $('<table></table>');
    var tbody_opt2 = $('<tbody></tbody>');
    
    tbody_opt2.append('<tr><th>'+messages('Transcription du texte complet')+'</th></tr>');
    //tbody_opt2.append('<tr><td><input name="trans_text" type="checkbox"></td></tr>');
    var tr_transcription = $('<tr></tr>');
    var td_transcription = $('<td></td>');
    
    $.each(opt_transcriptions,function(){
        var name = 'trans_text_'+this;
        var input_transcription = $('<input type="checkbox" name="'+name+'">');
        
        td_transcription.append(input_transcription).append(this);
    });
    
    tbody_opt2.append(tr_transcription.append(td_transcription));
    
    tbody_opt2.append('<tr><td><br></td></tr>');
    
    tbody_opt2.append('<tr><th>'+messages('Traduction du texte complet')+'</th></tr>');
    var tr_traduction = $('<tr></tr>');
    var td_traduction = $('<td></td>');
    
    $.each(opt_traductions,function(){
        var name = 'trad_text_'+this;
        var input_traduction = $('<input type="checkbox" name="'+name+'">');
        
        td_traduction.append(input_traduction).append(this.toUpperCase());
    });
    
    tbody_opt2.append(tr_traduction.append(td_traduction));
    
    
    td_opt2.append(table_opt2.append(tbody_opt2));
    
    var td_opt3 = $('<td></td>');
    td_opt3.append('<table><tbody><tr><th>'+messages('Mot à mot')+'</th><td><input checked="checked" name="interlinear" type="checkbox"></td></tr><tr><td><br></td></tr><tr><td><br></td></tr></tbody></table>');    
    
    div_header.append(div_opts.append(table_opts.append(tbody_opts.append(tr_opts.append(td_opt1).append(td_opt2).append(td_opt3)))));
    
    //ajout du bloc entête au document
    $(this).parent().append(div_header);
    
    
    //----------------------------------------------------------------------------------
    //
    //AFFICHAGE DES ANNOTATIONS 
    //
    //----------------------------------------------------------------------------------
    
    var html_table = $('<table xmlns:php="http://php.net/xsl" xmlns:crdo="http://crdo.risc.cnrs.fr/schemas/" xmlns:annot="http://crdo.risc.fr/schemas/annotation" width="100%" border="1" bordercolor="#993300" cellspacing="0" cellpadding="0"></table>');
    
    var tbody = $('<tbody></tbody>');
    var main_tr = $('<tr></tr>');
    var main_td = $('<td></td>');
    
    var annotations_table = $('<table width="100%" border="0" cellpadding="5" cellspacing="0" bordercolor="#993300" class="it"></table>');
    var tbody_annotations = $('<tbody></tbody>');
    
    var cptSentence = 0;
    
    $(this).find('#sentences .sentence').each(function(){
        var tr = $('<tr class="transcriptTable"></tr>');
        
        var td_info = $('<td class="segmentInfo"></td>');       
        td_info.attr('width','25');
        cptSentence++;
        td_info.html('S'+cptSentence);       
        tr.append(td_info);
        
        var td_content = $('<td class="segmentContent"></td>');  
        var id = $(this).attr('id');       
        td_content.attr('id',id);
        
        td_content.append($(this).find('.map').parent());
        //td_content.append('<a href="javascript:boutonStop()"><img src="http://lacito.vjf.cnrs.fr/pangloss/tools/stop.gif" alt="stop"></a>');
        //td_content.append('<a href="javascript:playFrom(\''+id+'\')"><img src="http://lacito.vjf.cnrs.fr/pangloss/tools/play.gif" alt="écouter"></a>');
        
        td_content.append('<a href="#" class="boutonStop"><img src="http://lacito.vjf.cnrs.fr/images/icones/stop.gif" alt="stop"></a>');
        td_content.append('<a href="#" class="playFrom"><img src="http://lacito.vjf.cnrs.fr/images/icones/play.gif" alt="écouter"></a>');
        
        
        tr.append(td_content);
        
        var div_w_s = $('<div class="word_sentence"></div>');      
        
        $(this).find('.transcription').each(function(){
            var newclass = $(this).attr('class').replace(' ','_');
            var div_transcription = $('<div class="'+newclass+'"></div>');
            div_transcription.html($(this).html());
            
            div_w_s.append(div_transcription);
        });
        td_content.append(div_w_s);
        td_content.append('<br>');
        
        $(this).find('.words > .word').each(function(){
            
            var table_w = $('<table class="word" link="'+$(this).attr('link')+'"></table>');
            var tbody_w = $('<tbody></tbody>');
            
            var tr_w_form = $('<tr></tr>');
            var td_w_form = $('<td class="word_form"></td>');
            td_w_form.html($(this).find('.word_transcription').html());
            tr_w_form.append(td_w_form);
            tbody_w.append(tr_w_form);
            
            var tr_w_transl = $('<tr></tr>');
            var td_w_transl = $('<td class="word_transl" valign="top"></td>');
            td_w_transl.html($(this).find('.word_traduction').first().html());
            tr_w_transl.append(td_w_transl);
            tbody_w.append(tr_w_transl);
            
            table_w.append(tbody_w);
            td_content.append(table_w);
        });
        
        td_content.append('<br><br>');
        
        $(this).find('.traduction').each(function(){
            //var newclass = $(this).attr('class').replace(' ','_').replace('traduction','translation').replace('eng','en').replace('fra','fr');//pas propre    
            var newclass = $(this).attr('class').replace(' ','_').replace('traduction','translation');    
            var div_translation = $('<div class="'+newclass+'"></div>');
            div_translation.html($(this).html());
            div_translation.append('<br><br>');
            td_content.append(div_translation);
        });
        
        td_content.append('<div class="note_info></div>'); //que met-on ici ?
        
        tbody_annotations.append(tr);
    });
    
    annotations_table.append(tbody_annotations);
    main_td.append(annotations_table);
    main_tr.append(main_td);
    tbody.append(main_tr);
    
    
    html_table.append(tbody);
    
    $(this).parent().append(html_table);
    
    
    //Ajout des traductions de texte
    $.each(opt_traductions,function(){
        var tr_trans_text = $('<tr class="transcriptTable"></tr>');
        tr_trans_text.append('<td class="segmentInfo"></td>');
        var td_trans_text = $('<td class="segmentContent"></td>');
        var div_trans_text = $('<div style="display:none;" class="trans_text trad_text_'+this+'"></div>');
        
        $('.translation_'+this).each(function(){
            div_trans_text.append($(this).html().replace(/<br>/g,''));
            div_trans_text.append('<br>');  
        });
        tbody_annotations.prepend(tr_trans_text.append(td_trans_text.append(div_trans_text)));
              
    });
    //Ajout des transcriptions de texte
    $.each(opt_transcriptions,function(){
        var tr_trans_text = $('<tr class="transcriptTable"></tr>');
        tr_trans_text.append('<td class="segmentInfo"></td>');
        var td_trans_text = $('<td class="segmentContent"></td>');
        var div_trans_text = $('<div class="trans_text trans_text_'+this+'"></div>');
        
        $('.word_sentence > .transcription_'+this).each(function(){
            div_trans_text.append($(this).html());
            div_trans_text.append('<br>');  
        });
        tbody_annotations.prepend(tr_trans_text.append(td_trans_text.append(div_trans_text)));
              
    });
       
    //gestion de l'affichage des transcriptions et traductions selon les options cochées
    $("input[name^='trans_text_']").bind('click',function(){
        var c = $(this).attr('name');
        if($(this).is(':checked')){
            $('.'+c).css('display','block');
        }else{
            $('.'+c).css('display','none');
        }    
    });
    
    $("input[name^='trad_text_']").bind('click',function(){
        var c = $(this).attr('name');
        if($(this).is(':checked')){
            $('.'+c).css('display','block');
        }else{
            $('.'+c).css('display','none');
        }    
    });
    
    $("input[name^='transcription_'], input[name^='translation_']").bind('click',function(){
        var c = $(this).attr('name');
        if($(this).is(':checked')){
            //$('.'+c).css('display','block !important');

            $('.'+c).each(function(){
                this.style.setProperty('display','block','important');
            });

        }else{
            //$('.'+c).css('display','none !important');

            $('.'+c).each(function(){
                this.style.setProperty('display','none','important');
            });
        }    
    });
    
    $("input[name='interlinear']").bind('click',function(){
        
        if($(this).is(':checked')){
            $('.word').css('display','inline-block');
        }else{
            $('.word').css('display','none');
        }    
    });
    
    $('a.playFrom').bind('click',function(){
        var id = $(this).parent().attr('id');
        playFrom(id);
    });
    
    $('a.boutonStop').bind('click',function(){
        boutonStop();
        console.log('click stop');
    });
    
    //
    $(this).css('display','none');
    };
})(jQuery);



;/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var idlist = new Array();
var timelist_starts = new Array();
var timelist_ends = new Array();

var idwordlist = new Array();
var timewordlist_starts = new Array();
var timewordlist_ends = new Array();

var idwordlist2 = new Array();
var timewordlist_starts2 = new Array();
var timewordlist_ends2 = new Array();

var highlight_color = 'blue';

(function ($) {
    $.fn.eastlingplayer = function (options)
    {
        var defauts=
            {
                idref:null,
                url:null,
                local:false,
                localDocument:null,
                callback: null,
                strokeColor: "0088cc",
                strokeWidth:4,
                fillColor:"ffffff",
                fillOpacity:0.0
            };
        //On fusionne nos deux objets ! =D
        var parametres=$.extend(defauts, options);

        highlight_color = "#"+parametres.strokeColor;
        
        
        this.each(function () {
            // Les instructions du plugin
            var player = $('<audio class="eastlingplayer" id="player" src="" controls></audio>');
            
            $(this).empty();
            $(this).append(player);

            
            var p_metadata;
            var p_url_images = new Array();
            var p_url_audio;
            var p_annotations;

            //REVUE 28/05/2015 : en paramètre, il n'y a plus de fichier metadata_crdo...xml
                    //il faut lire les metadata dans metadata_lacito.xml avec l'identifiant, ainsi que les url            

            if(parametres.local){
                var localDocument = parametres.localDocument;
                p_annotations = localDocument.annotations;
                p_metadata = localDocument.metadata;
                p_url_images = localDocument.url_images;
                p_url_audio = localDocument.url_audio;
                
                local_to_DOM(p_annotations,p_metadata,p_url_images,p_url_audio,player);   
                        
                if(parametres.callback)
                    {
                       parametres.callback();
                    }
                
            }else{
                if(parametres.url){
                    
                }else{
                                    
                    $.ajax({
                        type: "POST",
                        url: "getDocument.php",
                        data: {idref:parametres.idref},
                        dataType: "json",
                        success: function (oDocument)
                        {
                            p_annotations = oDocument.annotations;
                            p_metadata = oDocument.metadata;
                            p_url_images = oDocument.url_image;
                            p_url_audio = oDocument.url_audio;

                            to_DOM(p_annotations,p_metadata,p_url_images,p_url_audio,player);
                             //Si le parametre callback ne vaut pas null, c'est qu'on a précisé une fonction !   

                            if(parametres.callback)
                                {
                                    //console.log("callback OK");
                                   parametres.callback();
                                }
                            },
                        error: function (xhr, ajaxOptions, thrownError) {
                            console.log(xhr);
                            console.log(thrownError);
                          }

                    });

                }

            }

        });//]]> 
        
        function to_DOM(annotations,metadata,url_images,url_audio,player){
            
            var doc_id = '';
            var i = 1;

            var titles = new Array();
            var contributors = new Array();
            var subject;
            var crdo_id_audio;
            var spatials = new Array();
            var date = '';
            
            
            var ligne = 0;
            var nb_mots = 0;

            player.attr('src', url_audio);

            var doc_identifier = doc_id.split('_')[1];

            //console.log(titles); // TODO: regrouper dans un objet METADATA
            //console.log(annotations.length);

            var div_info = $('<div id="info"></div>');
            var div_titre = $('<div id="titre"></div>');
            var div_chercheurs = $('<div id="chercheurs"></div>');
            var div_langue = $('<div id="langue"></div>');
            var div_locuteurs = $('<div id="locuteurs"></div>');
            var div_date = $('<div id="date"></div>');
            var div_crdo_id = $('<div id="crdo_id"></div>');

            //METADONNEES
            //**********************************************************
            var researchers = new Array();
            var speakers = new Array();

            $.each(metadata.contributors,function(){
                switch(this.code){
                    case 'researcher':researchers.push(this.contributor);break;
                    case 'speaker':speakers.push(this.contributor);break;                               
                }
            });

            div_titre.html(metadata.title.title);
            div_chercheurs.html(researchers.join((';')));
            div_langue.html(metadata.subject[0].subject);//BUG sans [0]
            div_locuteurs.html(speakers.join(','));
            //div_info.append(' / Locuteur: ' + locuteur + ' (' + lieu + ')');
            //div_info.append(' / Enregistrement: ' + droits);
            div_date.html(metadata.date);
            
            //console.log(parametres.local);
            if(!parametres.local){
                div_crdo_id.html(metadata.crdo_id_audio);
            }
            div_info.append(div_titre).append(div_chercheurs).append(div_langue);
            div_info.append(div_locuteurs).append(div_date).append(div_crdo_id);

            player.before(div_info);

            //**********************************************************
            //Parse des lignes du texte
            //**********************************************************
            //  
            //A CHANGER
            var offset = -120;

            var div_sentences = $('<div id="sentences"></div>');
            var i_s = 1;
            var i_w = 1;
            
             $.each(annotations,function () {

             offset +=120;

             ligne++;

             //var offset = $(this).find('offset').text();
             var xMin = 99999;
             var xMax = 0;
             var yMin = 99999;
             var yMax = 0;

             $.each(this.areas,function(){
                if(this.y2 > yMax) yMax = this.y2;
                if(this.y1 < yMin) yMin = this.y1;
                if(this.x2 > xMax) xMax = this.x2;
                if(this.x1 < xMin) xMin = this.x1;

             });


             //image_scope = this.areas[0].y2-this.areas[0].y1;
             //image_width = this.areas[0].x2-this.areas[0].x1;
             image_scope = yMax-yMin;
             image_width = xMax-xMin;


             var image_bottom = 0;
             //image_bottom = parseInt(this.areas[0].y1);   
            image_bottom = parseInt(yMin);   

             //var audio_tag = doc_identifier + 's' + i_s;
             //TODO: javascript qui transforme une structure DIV en TABLE style LACITO

             var div_sentence = $('<div class="sentence"></div>');
             div_sentence.attr('id',this.id);

             idlist.push(this.id);
             timelist_starts.push(this.startPosition*1000);
             timelist_ends.push(this.endPosition*1000);

             // IMAGE
             var div_map = $("<div class='map'></div>");

             var img = $("<img>");

             var map = $('<map></map>');

             var div_div_map = $("<div></div>");

             //************************
             //TODO : phrase multi-page
             //************************

             image_id = this.areas[0].image;
             var url_image = '';

             $.each(url_images,function(){
                 if(this.indexOf(image_id) > 0){
                     url_image = this;
                 }
             });


             img.attr('src', url_image);
             img.attr('width', image_width);
             img.attr('height', image_scope);
             img.attr('usemap', '#map' + ligne);
             img.attr('id', 'ligne' + ligne);
             img.attr('class', 'map maphilighted');
             
             //var delta_x = this.areas[0].x1;
             //var delta_y = this.areas[0].y1;
             var delta_x = xMin;
             var delta_y = yMin;
             
                 
             img.css('background-position', '-' + delta_x + 'px -' + delta_y + 'px');

             div_map.append(img);

             div_map.css('background','url('+url_image+') -' + delta_x + 'px -' + delta_y + 'px');
             div_map.css('width',image_width);
             div_map.css('height',image_scope);

             // fin affichage des images => OK

             map.attr('id', 'map' + ligne);
             map.attr('name', 'map' + ligne);

             div_div_map.append(div_map);
             div_sentence.append(div_div_map);
             //FIN IMAGE

             $.each(this.transcriptions,function(){
                 var div_transcription = $('<div class="transcription '+this.lang+'">'+this.transcription+'</div>');
                 div_sentence.append(div_transcription);
             });

             var div_words = $('<div class="words"></div>');

             /*
              * les variables suivantes permettent de positionner 
              * correctement les portions/clips d'image
              * 
              */

             var first_word = true;                     
             var offset_left = 0;
             var offset_top = 0;
             
             //PATCH TEMPORAIRE
             var words = new Array();
             if(parametres.local){
                words = this.children; 
             }else{
                words = this.words; 
             }
             //END PATCH
                 
             if(words.length > 0){

                $.each(words,function(){

                    var id_area = this.id;

                    if(first_word){
                        offset_left = this.areas[0].x1;
                        offset_top = this.areas[0].y1;   
                        first_word = false;
                    }
                  
                   this.areas[0].x1-=delta_x;
                   this.areas[0].y1-=delta_y;
                   this.areas[0].x2-=delta_x;
                   this.areas[0].y2-=delta_y;  
                   
                   

                    var div_word = $('<div class="word" link="'+this.id+'"></div>');

                    $.each(this.transcriptions,function(){
                        div_word.append('<div class="word_transcription '+this.lang+'">'+this.transcription+'</div>');
                    });

                    $.each(this.traductions,function(){
                        div_word.append('<div class="word_traduction '+this.lang+'">'+this.traduction+'</div>');
                    });

                    div_words.append(div_word);

                   var area = $("<area>");                        

                   //données pour le lecteur audio
                   idwordlist.push(id_area);
                   timewordlist_starts.push(this.startPosition*1000);
                   timewordlist_ends.push(this.endPosition*1000);
                   //

                   area.attr("id", id_area);
                   area.attr("shape", "rect");
                   area.attr("coords", this.areas[0].x1 + "," +this.areas[0].y1 + "," +this.areas[0].x2 + "," +this.areas[0].y2);
                   area.attr("title", this.transcriptions[0].transcription);
                   area.attr("href", "#");
                   area.attr('data-maphilight', '{"strokeColor":"'+parametres.strokeColor+
                           '","strokeWidth":'+parametres.strokeWidth+',"fillColor":"'+parametres.fillColor+'","fillOpacity":'+parametres.fillOpacity+'}');

                   area.appendTo(map);

                });

             }
             div_div_map.append(map);


             div_sentence.append(div_words);


             $.each(this.traductions,function(){
                 var div_traduction = $('<div class="traduction '+this.lang+'">'+this.traduction+'</div>');
                 div_sentence.append(div_traduction);
             });

             i_s++;

             div_sentences.append(div_sentence);

             player.parent().append(div_sentences);

             });
             
             $('#player').on('play',function(){
                console.log(this.currentTime);
                if(this.currentTime === 0){
                    $('a.playFrom:first').click();
                }
            });

        }

        //09/02/2017 : forked from to_DOM and adapted to JSON version for images urls
        function local_to_DOM(annotations,metadata,url_images,url_audio,player){
            
            var doc_id = '';
            var i = 1;

            var titles = new Array();
            var contributors = new Array();
            var subject;
            var crdo_id_audio;
            var spatials = new Array();
            var date = '';
            
            
            var ligne = 0;
            var nb_mots = 0;

            player.attr('src', url_audio);

            var doc_identifier = doc_id.split('_')[1];

            //console.log(titles); // TODO: regrouper dans un objet METADATA
            //console.log(annotations.length);

            var div_info = $('<div id="info"></div>');
            var div_titre = $('<div id="titre"></div>');
            var div_chercheurs = $('<div id="chercheurs"></div>');
            var div_langue = $('<div id="langue"></div>');
            var div_locuteurs = $('<div id="locuteurs"></div>');
            var div_date = $('<div id="date"></div>');
            var div_crdo_id = $('<div id="crdo_id"></div>');

            //METADONNEES
            //**********************************************************
            var researchers = new Array();
            var speakers = new Array();

            $.each(metadata.contributors,function(){
                switch(this.code){
                    case 'researcher':researchers.push(this.contributor);break;
                    case 'speaker':speakers.push(this.contributor);break;                               
                }
            });

            div_titre.html(metadata.title.title);
            div_chercheurs.html(researchers.join((';')));
            div_langue.html(metadata.subject[0].subject);//BUG sans [0]
            div_locuteurs.html(speakers.join(','));
            //div_info.append(' / Locuteur: ' + locuteur + ' (' + lieu + ')');
            //div_info.append(' / Enregistrement: ' + droits);
            div_date.html(metadata.date);
            
            //console.log(parametres.local);
            if(!parametres.local){
                div_crdo_id.html(metadata.crdo_id_audio);
            }
            div_info.append(div_titre).append(div_chercheurs).append(div_langue);
            div_info.append(div_locuteurs).append(div_date).append(div_crdo_id);

            player.before(div_info);

            //**********************************************************
            //Parse des lignes du texte
            //**********************************************************
            //  
            //A CHANGER
            var offset = -120;

            var div_sentences = $('<div id="sentences"></div>');
            var i_s = 1;
            var i_w = 1;
            
             $.each(annotations,function () {

                var idSentence = this.id;

                //25/04/2017 TEST improve perf live play
                idwordlist2[idSentence] = new Array();
                timewordlist_starts2[idSentence] = new Array();
                timewordlist_ends2[idSentence] = new Array();

                //

             offset +=120;

             ligne++;

             //var offset = $(this).find('offset').text();

             var xMin = 99999;
             var xMax = 0;
             var yMin = 99999;
             var yMax = 0;

             $.each(this.areas,function(){
                if(this.y2 > yMax) yMax = this.y2;
                if(this.y1 < yMin) yMin = this.y1;
                if(this.x2 > xMax) xMax = this.x2;
                if(this.x1 < xMin) xMin = this.x1;

             });


             //image_scope = this.areas[0].y2-this.areas[0].y1;
             //image_width = this.areas[0].x2-this.areas[0].x1;
             image_scope = yMax-yMin;
             image_width = xMax-xMin;


             var image_bottom = 0;
             //image_bottom = parseInt(this.areas[0].y1);   
            image_bottom = parseInt(yMin);  

             //var audio_tag = doc_identifier + 's' + i_s;
             //TODO: javascript qui transforme une structure DIV en TABLE style LACITO

             var div_sentence = $('<div class="sentence"></div>');

             div_sentence.attr('id',idSentence);

             idlist.push(idSentence);
             timelist_starts.push(this.startPosition*1000);
             timelist_ends.push(this.endPosition*1000);

             // IMAGE
             var div_map = $("<div class='map'></div>");

             var img = $("<img>");

             var map = $('<map></map>');

             var div_div_map = $("<div></div>");

             image_id = this.areas[0].image;
             var url_image = '';

             //09/02/2017
             //DEPRECATED in JSON version 
             /*$.each(url_images,function(){
                 if(this.indexOf(image_id) > 0){
                     url_image = this;
                 }
             });
             */
             //replaced by the following code ($.each statement)

             $.each(url_images,function(){
                 if(this.id == image_id){
                     url_image = this.url;
                 }
             });

             img.attr('src', url_image);
             img.attr('width', image_width);
             img.attr('height', image_scope);
             img.attr('usemap', '#map' + ligne);
             img.attr('id', 'ligne' + ligne);
             img.attr('class', 'map maphilighted');
             //img.attr('style', 'width:' + image_width + 'px;height:' + image_scope + 'px;position: absolute; padding: 0px; border: 0px; clip:rect(' + offset + 'px,' + image_width + 'px,' + image_bottom + 'px,0px);');
             
             var delta_x = xMin;
             var delta_y = yMin;
             
                 
             img.css('background-position', '-' + delta_x + 'px -' + delta_y + 'px');

             div_map.append(img);

             div_map.css('background','url('+url_image+') -' + delta_x + 'px -' + delta_y + 'px');
             div_map.css('width',image_width);
             div_map.css('height',image_scope);

             // fin affichage des images => OK

             map.attr('id', 'map' + ligne);
             map.attr('name', 'map' + ligne);

             div_div_map.append(div_map);
             div_sentence.append(div_div_map);
             //FIN IMAGE

             $.each(this.transcriptions,function(){
                 var div_transcription = $('<div class="transcription '+this.lang+'">'+this.transcription+'</div>');
                 div_sentence.append(div_transcription);
             });

             var div_words = $('<div class="words"></div>');

             /*
              * les variables suivantes permettent de positionner 
              * correctement les portions/clips d'image
              * 
              */

             var first_word = true;                     
             var offset_left = 0;
             var offset_top = 0;
             
             //PATCH TEMPORAIRE
             var words = new Array();
             words = this.children;
                 
             if(words.length > 0){

                $.each(words,function(){

                    if(this.areas.length == 0){
                        this.areas.push({
                            x1:0,x2:0,y1:0,y2:0
                        });

                    }

                    var id_area = this.id;

                    if(first_word){
                        offset_left = this.areas[0].x1;
                        offset_top = this.areas[0].y1;   
                        first_word = false;
                    }
                  
                   var correctedCoords = {
                    x1:this.areas[0].x1-delta_x,
                    x2:this.areas[0].x2-delta_x,
                    y1:this.areas[0].y1-delta_y,
                    y2:this.areas[0].y2-delta_y
                   };

                    var div_word = $('<div class="word" link="'+this.id+'"></div>');

                    $.each(this.transcriptions,function(){
                        div_word.append('<div class="word_transcription '+this.lang+'">'+this.transcription+'</div>');
                    });

                    $.each(this.traductions,function(){
                        div_word.append('<div class="word_traduction '+this.lang+'">'+this.traduction+'</div>');
                    });

                    div_words.append(div_word);

                   var area = $("<area>");                        

                   //données pour le lecteur audio
                   idwordlist.push(id_area);
                   timewordlist_starts.push(this.startPosition*1000);
                   timewordlist_ends.push(this.endPosition*1000);
                   //

                   //25/04/2017 TEST improve perf audio live play
                   idwordlist2[idSentence].push(id_area);
                   timewordlist_starts2[idSentence].push(this.startPosition*1000);
                   timewordlist_ends2[idSentence].push(this.endPosition*1000);
                   //


                   area.attr("id", id_area);
                   area.attr("shape", "rect");
                   area.attr("coords", correctedCoords.x1 + "," +correctedCoords.y1 + "," +correctedCoords.x2 + "," +correctedCoords.y2);
                   area.attr("title", this.transcriptions[0].transcription);
                   area.attr("href", "#");
                   area.attr('data-maphilight', '{"strokeColor":"'+parametres.strokeColor+
                           '","strokeWidth":'+parametres.strokeWidth+',"fillColor":"'+parametres.fillColor+'","fillOpacity":'+parametres.fillOpacity+'}');

                   area.appendTo(map);

                });

             }
             div_div_map.append(map);


             div_sentence.append(div_words);


             $.each(this.traductions,function(){
                 var div_traduction = $('<div class="traduction '+this.lang+'">'+this.traduction+'</div>');
                 div_sentence.append(div_traduction);
             });

             i_s++;

             div_sentences.append(div_sentence);

             player.parent().append(div_sentences);

             });
             
             $('#player').on('play',function(){
                console.log(this.currentTime);
                if(this.currentTime === 0){
                    $('a.playFrom:first').click();
                }
            });

        }
        
        return true;
        
        //return this;
        
    };
})(jQuery);

;/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
(function ($) {
    $.fn.eastlingShape = function ()
    {
                
    //AFFICHAGE DU HEADER : TITRE, OPTIONS D'AFFICHAGE
    //var div_header = $('<div xmlns:php="http://php.net/xsl" xmlns:crdo="http://crdo.risc.cnrs.fr/schemas/" xmlns:annot="http://crdo.risc.fr/schemas/annotation" style="margin-left: 5px;">');
    var div_titre = $('<div class="row ui one column doubling grid">');
    var div_info = $('<div class="row ui three column doubling grid">');
    var div_lecteur = $('<div class="row ui two column doubling grid">');
    var div_options_lecteur = $('<div class="row ui three column doubling grid">');
    
    $(this).parent().append(div_titre);
    $(this).parent().append(div_info);
    $(this).parent().append(div_lecteur);
    $(this).parent().append(div_options_lecteur);
    
    //$(this).parent().addClass('ui form');
    
    var header = $('<h2 align="center"></h2>');
    var title = $('<h1 class="ui header aligned center"></h1>');
    div_titre.append(title);
    
    title.html($(this).find('#titre').html());
    //title.append('<a href="show_metadatas.php?id='+$(this).find('#crdo_id').html()+'&amp;lg='+$(this).find('#langue').html()+'" target="_blank"><img class="sansBordure" src="http://lacito.vjf.cnrs.fr/images/icones/info_marron.jpg"></a>');

    //header.append(title);
    var link_langue = $('<a></a>');
    link_langue.append($(this).find('#langue').html());
    //var div_contributeurs = $('<div class="column"></div>');
    
    var div_langue = $('<div class="column"></div>');
    div_langue.html('Langue : ');   
    div_langue.append($(this).find('#langue').html());
    
    var div_chercheurs = $('<div class="column"></div>');
    div_chercheurs.html('Chercheur(s) : ');   
    div_chercheurs.append($(this).find('#chercheurs').html());
    
    var div_locuteurs = $('<div class="column"></div>');   
    div_locuteurs.html('Locuteur(s) : ');
    div_locuteurs.append($(this).find('#locuteurs').html());
        
    div_info.append(messages('Langue')+' : ').append(div_langue).append(div_chercheurs).append(div_locuteurs);    
      
    //AFFICHAGE DES OPTIONS DE LECTURE
    var div_audio = $('<div class="column"></div>');    
    div_audio.append($(this).find('audio'));
          
    //div_header.append(header).append('<br>').append(div_audio);
    div_lecteur.append(div_audio);
    
    div_lecteur.append('<div class="column checkbox"><label>Lecture en continu</label> : <input id="karaoke" name="karaoke" checked="checked" type="checkbox"></div>');
    
    //il faut détecter les types de transcription et les langues disponibles en traduction
    var opt_transcriptions = new Array();
    var opt_traductions = new Array();
    
    $(this).find('.transcription').each(function(){
        var text = $(this).attr('class').replace('transcription ','');
        
        if($.inArray(text, opt_transcriptions)<0)       
            opt_transcriptions.push(text);
        
    });
 
    $(this).find('.traduction').each(function(){
        var text = $(this).attr('class').replace('traduction ','');
        
        if($.inArray(text, opt_traductions)<0)       
            opt_traductions.push(text);
    });

    var div_opt_motamot = $('<div class="column"></div>');
    
    var div_transc_phrase = $('<div class="column"></div>');
    var div_transc_complet = $('<div class="column"></div>');
    var div_trad_phrase = $('<div class="column"></div>');
    var div_trad_complet = $('<div class="column"></div>');
    var sizes = ["zero","one","two","three","four","five","six","seven","eight","nine","ten"];
    
    div_options_lecteur.append(div_transc_phrase).append(div_transc_complet).append(div_opt_motamot);
    div_options_lecteur.append(div_trad_phrase).append(div_trad_complet);
    
    div_transc_phrase.append('<h3 class="ui header">'+messages('Transcription par phrase')+'</h3>');
       
    var div_transc_phrase_opts = $('<div class="ui '+sizes[opt_transcriptions.length]+' column grid"></div>');
    div_transc_phrase.append(div_transc_phrase_opts);
    
    var div_form = $('<div class="ui form"></div>');
    
    $.each(opt_transcriptions,function(){
        var div_item = $('<div class="column inline field"><div class = "ui checkbox"></div></div>');
        var name = 'transcription_'+this;
        var input_transcription = $('<input type="checkbox" checked="checked" name="'+name+'">');
        
        div_item.append(input_transcription).append('<label>'+this+'</label>');
        div_transc_phrase_opts.append(div_item);
        
    });
    
    
    div_trad_phrase.append('<h3 class="ui header">'+messages('Traduction par phrase')+'</h3>');
    var div_trad_phrase_opts = $('<div class="ui '+sizes[opt_traductions.length]+' column grid"></div>');
    div_trad_phrase.append(div_trad_phrase_opts);
    
    $.each(opt_traductions,function(){
        var div_item = $('<div class="column inline field"><div class = "ui checkbox"></div></div>');
        var name = 'translation_'+this;
        var input_traduction = $('<input type="checkbox" checked="checked" name="'+name+'">');
        
        div_item.append(input_traduction).append('<label>'+this.toUpperCase()+'</label>');
        div_trad_phrase_opts.append(div_item);
    });
    
    div_transc_complet.append('<h3 class="ui header">'+messages('Transcription du texte complet')+'</div>');
    var div_transc_complet_opts = $('<div class="ui '+sizes[opt_transcriptions.length]+' column grid"></div>');
    div_transc_complet.append(div_transc_complet_opts);

    $.each(opt_transcriptions,function(){
        var div_item = $('<div class="column inline field"><div class = "ui checkbox"></div></div>');
        var name = 'trans_text_'+this;
        var input_transcription = $('<input type="checkbox" name="'+name+'">');
        
        div_item.append(input_transcription).append('<label>'+this+'</label>');
        div_transc_complet_opts.append(div_item);
        
    });

    
    div_trad_complet.append('<h3 class="ui header">'+messages('Traduction du texte complet')+'</div>');
    var div_trad_complet_opts = $('<div class="ui '+sizes[opt_traductions.length]+' column grid"></div>');
    div_trad_complet.append(div_trad_complet_opts);
    
    $.each(opt_traductions,function(){
        var div_item = $('<div class="column inline field"><div class = "ui checkbox"></div></div>');
        var name = 'trad_text_'+this;
        var input_traduction = $('<input type="checkbox" name="'+name+'">');
        
        div_item.append(input_traduction).append('<label>'+this.toUpperCase()+'</label>');
        div_trad_complet_opts.append(div_item);
        
    });

    var div_item = $('<div class="inline field"><div class = "ui checkbox"></div></div>');
    div_item.append('<input checked="checked" name="interlinear" type="checkbox">').append('<label>'+messages('Mot à mot')+'</label>');
        
    div_opt_motamot.append(div_item);    
    
    
    //----------------------------------------------------------------------------------
    //
    //AFFICHAGE DES ANNOTATIONS 
    //
    //----------------------------------------------------------------------------------
    
    var html_table = $('<div class="ui"></div>');
    
    var cptSentence = 0;
    
    $(this).find('#sentences .sentence').each(function(){
        var tr = $('<div class=""></div>');
        
        var td_info = $('<div class="segmentInfo"></div>');       
        td_info.attr('width','25');
        cptSentence++;
        td_info.html('S'+cptSentence);       
        tr.append(td_info);
        
        var td_content = $('<div class="eastlingShape"></td>');  
        var id = $(this).attr('id');       
        td_content.attr('id',id);
        
        td_content.append($(this).find('.map').parent());
        //td_content.append('<a href="javascript:boutonStop()"><img src="http://lacito.vjf.cnrs.fr/pangloss/tools/stop.gif" alt="stop"></a>');
        //td_content.append('<a href="javascript:playFrom(\''+id+'\')"><img src="http://lacito.vjf.cnrs.fr/pangloss/tools/play.gif" alt="écouter"></a>');
        
        //td_content.append('<a href="#" class="boutonStop"><img src="http://lacito.vjf.cnrs.fr/pangloss/tools/stop.gif" alt="stop"></a>');
        //td_content.append('<a href="#" class="playFrom"><img src="http://lacito.vjf.cnrs.fr/pangloss/tools/play.gif" alt="écouter"></a>');
        td_content.append('<a href="#" class="boutonStop" style="font-size:12px;">⏹</a>');
        td_content.append('<a href="#" class="playFrom" style="font-size:12px;">▶️</a>');
        
        
        tr.append(td_content);
        
        var div_w_s = $('<div class="word_sentence"></div>');      
        
        $(this).find('.transcription').each(function(){
            var newclass = $(this).attr('class').replace(' ','_');
            var div_transcription = $('<div class="'+newclass+'"></div>');
            div_transcription.html($(this).html());
            
            div_w_s.append(div_transcription);
        });
        td_content.append(div_w_s);
        td_content.append('<br>');
        
        $(this).find('.words > .word').each(function(){
    
            var div_w = $('<div style="display:inline;" class="word ui basic accordion" link="'+$(this).attr('link')+'"></div>');

            var div_w_form = $('<div class="word_form title" style="padding:0px !important;"></div>');
            div_w_form.append('<i class="dropdown icon"></i>');
            div_w_form.append($(this).find('.word_transcription').html());
            div_w.append(div_w_form);

            var div_w_transl= $('<div class="content"></div>');
            div_w.append(div_w_transl);
            
            $(this).find('.word_traduction').each(function(){
                var lang = $(this).attr('class').split('word_traduction')[1].trim();
                div_w_transl.append('<p>'+lang+' : '+$(this).html()+'</p>');
            });
            
            td_content.append(div_w);
            div_w.accordion();
        });
              
        
        $(this).find('.traduction').each(function(){
            //var newclass = $(this).attr('class').replace(' ','_').replace('traduction','translation').replace('eng','en').replace('fra','fr');//pas propre    
            var newclass = $(this).attr('class').replace(' ','_').replace('traduction','translation');    
            var div_translation = $('<div class="'+newclass+'"></div>');
            div_translation.html($(this).html());
            div_translation.append('<br><br>');
            td_content.append(div_translation);
        });
        
        td_content.append('<div class="note_info></div>'); //que met-on ici ?
        
        html_table.append(tr);
        
    });

    
    $(this).parent().append(html_table);
    
    
    //Ajout des traductions de texte
    $.each(opt_traductions,function(){
        var tr_trans_text = $('<div class="transcriptTable"></div>');
        tr_trans_text.append('<div class="segmentInfo"></div>');
        var td_trans_text = $('<div class="segmentContent"></div>');
        var div_trans_text = $('<div style="display:none;" class="trans_text trad_text_'+this+'"></div>');
        
        $('.translation_'+this).each(function(){
            div_trans_text.append($(this).html().replace(/<br>/g,''));
            div_trans_text.append('<br>');  
        });
        html_table.prepend(tr_trans_text.append(td_trans_text.append(div_trans_text)));
              
    });
    //Ajout des transcriptions de texte
    $.each(opt_transcriptions,function(){
        var tr_trans_text = $('<tr class="transcriptTable"></tr>');
        tr_trans_text.append('<td class="segmentInfo"></td>');
        var td_trans_text = $('<td class="segmentContent"></td>');
        var div_trans_text = $('<div class="trans_text trans_text_'+this+'"></div>');
        
        $('.word_sentence > .transcription_'+this).each(function(){
            div_trans_text.append($(this).html());
            div_trans_text.append('<br>');  
        });
        html_table.prepend(tr_trans_text.append(td_trans_text.append(div_trans_text)));
              
    });
       
    //gestion de l'affichage des transcriptions et traductions selon les options cochées
    $("input[name^='trans_text_']").bind('click',function(){
        var c = $(this).attr('name');
        if($(this).is(':checked')){
            $('.'+c).css('display','block');
        }else{
            $('.'+c).css('display','none');
        }    
    });
    
    $("input[name^='trad_text_']").bind('click',function(){
        var c = $(this).attr('name');
        if($(this).is(':checked')){
            $('.'+c).css('display','block');
        }else{
            $('.'+c).css('display','none');
        }    
    });
    
    $("input[name^='transcription_'], input[name^='translation_']").bind('click',function(){
        var c = $(this).attr('name');
        if($(this).is(':checked')){
            $('.'+c).css('display','block');
        }else{
            $('.'+c).css('display','none');
        }    
    });
    
    $("input[name='interlinear']").bind('click',function(){
        
        if($(this).is(':checked')){
            $('.word').css('display','inline');
        }else{
            $('.word').css('display','none');
        }    
    });
    
    $('a.playFrom').bind('click',function(){
        var id = $(this).parent().attr('id');
        playFrom(id);
    });
    
    $('a.boutonStop').bind('click',function(){
        boutonStop();
        console.log('click stop');
    });
    
    //
    $(this).css('display','none');
    };

})(jQuery);



;/* ***** BEGIN LICENSE BLOCK *****
 *    Copyright 2002 Michel Jacobson jacobson@idf.ext.jussieu.fr
 *
 *    This program is free software; you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation; either version 2 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program; if not, write to the Free Software
 *    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 * ***** END LICENSE BLOCK ***** */





//here you have to change the parameters
var styleProperty   = "border";                //what property you want to change for rendering startplay and the value of the styleProperty for a startplay event events (color, backgroundColor, fontSize, fontWeight, fontStyle,...)
var activateState   = "solid 1px #993300";         //the value of the styleProperty for a startplay event
var inactivateState = "solid 0px white";       //the value of the styleProperty for a endplay event


//-----------------------------------------------> you do not have to change these parameters
var ns = (navigator.appName =="Netscape");

//----------------------------------------------> from the applet or the plugin to the document
//what the browser should do when it recieve a startplay event
function startplay(id) {
	with(document) {
		if (ns) {
			var n = getElementById(id);
			if (n) {
				n.style[styleProperty] = activateState;
			}
		} else {
			var theItem = all.item(id);
			if (theItem) {
				eval('theItem.style.'+styleProperty+' = '+ "'" + activateState + "'");
			}
		}
	}
}
//what the browser should do when it recieve a stopplay event
function endplay(id) {
	with(document) {
		if (ns) {
			var n = getElementById(id);
			if (n) {
				n.style[styleProperty] = inactivateState;
			}
		} else {
			var theItem = all.item(id);
			if (theItem) {
				eval('theItem.style.'+styleProperty+' = '+ "'" + inactivateState + "'");
			}
		}
	}
};var before = 0;
var currentSentenceId = 0;

function getplayer(id) {
	var player = document.getElementById(id);
	return player;
}

function boutonStop() {
	getplayer('player').pause();
}

function playFrom(id) {
	
	var node = document.getElementById('karaoke');
	if (node && node.checked) {
	
	var i=0;
	while ((i<idlist.length) && (idlist[i] != id)) {
		i++;
	}
	var time = timelist_starts[i]/1000;
	var player = getplayer('player');
	if (player) {	
		//player.addEventListener("seeked", placement(player,time), true);
		player.addEventListener("seeked", function() { player.play(); }, true);
		setposition(id,time);
		player.addEventListener("timeupdate", timeUpdate, true);  
	
	//stoptime=timelist_ends[i]-timelist_starts[i];
	//setTimeout(function() { player.pause() }, stoptime*1000);
		/*if (player.currentTime>=timelist_ends[i]){
			getplayer('player').pause();
		
			}*/
	
	}
	
	}
	else {
		playOne(id);
	}
}

function playOne(id) {
var i=0;
	while ((i<idlist.length) && (idlist[i] != id)) {
		i++;
	}
	var time = timelist_starts[i]/1000;

	var player = getplayer('player');
	if (player) {	
		//player.addEventListener("seeked", placement(player,time), true);
		player.addEventListener("seeked", function() { player.play(); }, true);
		setposition(id,time);
		player.addEventListener("timeupdate", timeUpdate, true);  
	
	duration=timelist_ends[i]-timelist_starts[i];
	setTimeout(function() { player.pause() }, duration);
		
	
	}
		
	
}

function playFrom_W(id) {
	var i=0;
	while ((i<idlist.length) && (idlist[i] != id)) {
		i++;
	}
	var time = timelist_starts[i]/1000;

	var player = getplayer('player');
	if (player) {	
		//player.addEventListener("seeked", placement(player,time), true);
		player.addEventListener("seeked", function() { player.play(); }, true);
		setposition(id,time);
		player.addEventListener("timeupdate", timeUpdate, true);  
	
	duration=timelist_ends[i]-timelist_starts[i];
	setTimeout(function() { player.pause() }, duration);
		if (player.currentTime>=timelist_ends[i]){
			getplayer('player').pause();
		
			}
	
	}
		
	
}

function placement(player,time){

	var player = getplayer('player');
	player.currentTime = time;
	
	player.play();
	//dohighlight(time);
	
    dohighlight(player.currentTime);
	
}

function timeUpdate() {  
	var player = getplayer('player');
    dohighlight(player.currentTime);
	  
}  

function setposition(id,time) {
	var player = getplayer('player');
	
	player.currentTime = time;
	
	dohighlight(time);
	 
}

//Fonction ajoutée par Matthew DEO pour surlignage des mots en temps réel
function dohighlight(time) {

	time=time*1000;
                           
    for (var i=0;i<timelist_starts.length;i++) {
        var sentence = $('.eastlingShape#'+idlist[i]).parent().find('.segmentInfo');
        if ((timelist_starts[i]) < time) {
            if ((timelist_ends[i]) > time) {
                    sentence.css('background-color',highlight_color);
                    $(document).scrollTop(sentence.position().top);

                    if(currentSentenceId!=i){
                    	currentSentenceId = i;
                    	console.log(i);
                    }
                    

                    break;
            } 
            else {
                sentence.css('background-color','');
            }
        }
    }

    //surlignage du mot en cours de lecture
    /*
	for (var i=0;i<timewordlist_starts.length;i++) {
		var word = $('#'+idwordlist[i]);
		if ((timewordlist_starts[i]) < time) {

			if ((timewordlist_ends[i]) > time) {
				word.mouseover();
				break;
			} 
			else {
				$('#'+idwordlist[i]).mouseout();
			}
		}
	}
	*/
	var idSentence = idlist[currentSentenceId];

	$.each(timewordlist_starts2[idSentence],function(i){

		if(this < time && timewordlist_ends2[idSentence][i] > time){
			var word = $('#'+idwordlist2[idSentence][i]);
			word.mouseover();
			return false;
			
		}else{
			$('#'+idwordlist2[idSentence][i]).mouseout();
		}
	});


}
;(function($) {
	var has_VML, has_canvas, create_canvas_for, add_shape_to, clear_canvas, shape_from_area,
		canvas_style, hex_to_decimal, css3color, is_image_loaded, options_from_area;

	has_canvas = !!document.createElement('canvas').getContext;

	// VML: more complex
	has_VML = (function() {
		var a = document.createElement('div');
		a.innerHTML = '<v:shape id="vml_flag1" adj="1" />';
		var b = a.firstChild;
		b.style.behavior = "url(#default#VML)";
		return b ? typeof b.adj == "object": true;
	})();

	if(!(has_canvas || has_VML)) {
		$.fn.maphilight = function() { return this; };
		return;
	}
	
	if(has_canvas) {
		hex_to_decimal = function(hex) {
			return Math.max(0, Math.min(parseInt(hex, 16), 255));
		};
		css3color = function(color, opacity) {
			return 'rgba('+hex_to_decimal(color.substr(0,2))+','+hex_to_decimal(color.substr(2,2))+','+hex_to_decimal(color.substr(4,2))+','+opacity+')';
		};
		create_canvas_for = function(img) {
			var c = $('<canvas style="width:'+img.width+'px;height:'+img.height+'px;"></canvas>').get(0);
			c.getContext("2d").clearRect(0, 0, c.width, c.height);
			return c;
		};
		var draw_shape = function(context, shape, coords, x_shift, y_shift) {
			x_shift = x_shift || 0;
			y_shift = y_shift || 0;
			
			context.beginPath();
			if(shape == 'rect') {
				// x, y, width, height
				context.rect(coords[0] + x_shift, coords[1] + y_shift, coords[2] - coords[0], coords[3] - coords[1]);
			} else if(shape == 'poly') {
				context.moveTo(coords[0] + x_shift, coords[1] + y_shift);
				for(i=2; i < coords.length; i+=2) {
					context.lineTo(coords[i] + x_shift, coords[i+1] + y_shift);
				}
			} else if(shape == 'circ') {
				// x, y, radius, startAngle, endAngle, anticlockwise
				context.arc(coords[0] + x_shift, coords[1] + y_shift, coords[2], 0, Math.PI * 2, false);
			}
			context.closePath();
		}
		add_shape_to = function(canvas, shape, coords, options, name) {
			var i, context = canvas.getContext('2d');
			
			// Because I don't want to worry about setting things back to a base state
			
			// Shadow has to happen first, since it's on the bottom, and it does some clip /
			// fill operations which would interfere with what comes next.
			if(options.shadow) {
				context.save();
				if(options.shadowPosition == "inside") {
					// Cause the following stroke to only apply to the inside of the path
					draw_shape(context, shape, coords);
					context.clip();
				}
				
				// Redraw the shape shifted off the canvas massively so we can cast a shadow
				// onto the canvas without having to worry about the stroke or fill (which
				// cannot have 0 opacity or width, since they're what cast the shadow).
				var x_shift = canvas.width * 100;
				var y_shift = canvas.height * 100;
				draw_shape(context, shape, coords, x_shift, y_shift);
				
				context.shadowOffsetX = options.shadowX - x_shift;
				context.shadowOffsetY = options.shadowY - y_shift;
				context.shadowBlur = options.shadowRadius;
				context.shadowColor = css3color(options.shadowColor, options.shadowOpacity);
				
				// Now, work out where to cast the shadow from! It looks better if it's cast
				// from a fill when it's an outside shadow or a stroke when it's an interior
				// shadow. Allow the user to override this if they need to.
				var shadowFrom = options.shadowFrom;
				if (!shadowFrom) {
					if (options.shadowPosition == 'outside') {
						shadowFrom = 'fill';
					} else {
						shadowFrom = 'stroke';
					}
				}
				if (shadowFrom == 'stroke') {
					context.strokeStyle = "rgba(0,0,0,1)";
					context.stroke();
				} else if (shadowFrom == 'fill') {
					context.fillStyle = "rgba(0,0,0,1)";
					context.fill();
				}
				context.restore();
				
				// and now we clean up
				if(options.shadowPosition == "outside") {
					context.save();
					// Clear out the center
					draw_shape(context, shape, coords);
					context.globalCompositeOperation = "destination-out";
					context.fillStyle = "rgba(0,0,0,1);";
					context.fill();
					context.restore();
				}
			}
			
			context.save();
			
			draw_shape(context, shape, coords);
			
			// fill has to come after shadow, otherwise the shadow will be drawn over the fill,
			// which mostly looks weird when the shadow has a high opacity
			if(options.fill) {
				context.fillStyle = css3color(options.fillColor, options.fillOpacity);
				context.fill();
			}
			// Likewise, stroke has to come at the very end, or it'll wind up under bits of the
			// shadow or the shadow-background if it's present.
			if(options.stroke) {
				context.strokeStyle = css3color(options.strokeColor, options.strokeOpacity);
				context.lineWidth = options.strokeWidth;
				context.stroke();
			}
			
			context.restore();
			
			if(options.fade) {
				$(canvas).css('opacity', 0).animate({opacity: 1}, 100);
			}
		};
		clear_canvas = function(canvas) {
			canvas.getContext('2d').clearRect(0, 0, canvas.width,canvas.height);
		};
	} else {   // ie executes this code
		create_canvas_for = function(img) {
			return $('<var style="zoom:1;overflow:hidden;display:block;width:'+img.width+'px;height:'+img.height+'px;"></var>').get(0);
		};
		add_shape_to = function(canvas, shape, coords, options, name) {
			var fill, stroke, opacity, e;
			for (var i in coords) { coords[i] = parseInt(coords[i], 10); }
			fill = '<v:fill color="#'+options.fillColor+'" opacity="'+(options.fill ? options.fillOpacity : 0)+'" />';
			stroke = (options.stroke ? 'strokeweight="'+options.strokeWidth+'" stroked="t" strokecolor="#'+options.strokeColor+'"' : 'stroked="f"');
			opacity = '<v:stroke opacity="'+options.strokeOpacity+'"/>';
			if(shape == 'rect') {
				e = $('<v:rect name="'+name+'" filled="t" '+stroke+' style="zoom:1;margin:0;padding:0;display:block;position:absolute;left:'+coords[0]+'px;top:'+coords[1]+'px;width:'+(coords[2] - coords[0])+'px;height:'+(coords[3] - coords[1])+'px;"></v:rect>');
			} else if(shape == 'poly') {
				e = $('<v:shape name="'+name+'" filled="t" '+stroke+' coordorigin="0,0" coordsize="'+canvas.width+','+canvas.height+'" path="m '+coords[0]+','+coords[1]+' l '+coords.join(',')+' x e" style="zoom:1;margin:0;padding:0;display:block;position:absolute;top:0px;left:0px;width:'+canvas.width+'px;height:'+canvas.height+'px;"></v:shape>');
			} else if(shape == 'circ') {
				e = $('<v:oval name="'+name+'" filled="t" '+stroke+' style="zoom:1;margin:0;padding:0;display:block;position:absolute;left:'+(coords[0] - coords[2])+'px;top:'+(coords[1] - coords[2])+'px;width:'+(coords[2]*2)+'px;height:'+(coords[2]*2)+'px;"></v:oval>');
			}
			e.get(0).innerHTML = fill+opacity;
			$(canvas).append(e);
		};
		clear_canvas = function(canvas) {
			// jquery1.8 + ie7 
			var $html = $("<div>" + canvas.innerHTML + "</div>");
			$html.children('[name=highlighted]').remove();
			canvas.innerHTML = $html.html();
		};
	}
	
	shape_from_area = function(area) {
		var i, coords = area.getAttribute('coords').split(',');
		for (i=0; i < coords.length; i++) { coords[i] = parseFloat(coords[i]); }
		return [area.getAttribute('shape').toLowerCase().substr(0,4), coords];
	};

	options_from_area = function(area, options) {
		var $area = $(area);
		return $.extend({}, options, $.metadata ? $area.metadata() : false, $area.data('maphilight'));
	};
	
	is_image_loaded = function(img) {
		if(!img.complete) { return false; } // IE
		if(typeof img.naturalWidth != "undefined" && img.naturalWidth === 0) { return false; } // Others
		return true;
	};

	canvas_style = {
		position: 'absolute',
		left: 0,
		top: 0,
		padding: 0,
		border: 0
	};
	
	var ie_hax_done = false;
	$.fn.maphilight = function(opts) {
	
		/******/
		//console.log($(this));
		//console.log(opts);
	
		/******/
		
		opts = $.extend({}, $.fn.maphilight.defaults, opts);
		
		if(!has_canvas && !ie_hax_done) {
			$(window).ready(function() {
				document.namespaces.add("v", "urn:schemas-microsoft-com:vml");
				var style = document.createStyleSheet();
				var shapes = ['shape','rect', 'oval', 'circ', 'fill', 'stroke', 'imagedata', 'group','textbox'];
				$.each(shapes,
					function() {
						style.addRule('v\\:' + this, "behavior: url(#default#VML); antialias:true");
					}
				);
			});
			ie_hax_done = true;
		}
		
		return this.each(function() {
			var img, wrap, options, map, canvas, canvas_always, mouseover, highlighted_shape, usemap;
			img = $(this);

			if(!is_image_loaded(this)) {
				// If the image isn't fully loaded, this won't work right.  Try again later.
				return window.setTimeout(function() {
					img.maphilight(opts);
				}, 200);
			}

			options = $.extend({}, opts, $.metadata ? img.metadata() : false, img.data('maphilight'));

			// jQuery bug with Opera, results in full-url#usemap being returned from jQuery's attr.
			// So use raw getAttribute instead.
			usemap = img.get(0).getAttribute('usemap');

			if (!usemap) {
				return
			}

			map = $('map[name="'+usemap.substr(1)+'"]');

			if(!(img.is('img,input[type="image"]') && usemap && map.size() > 0)) {
				return;
			}

			if(img.hasClass('maphilighted')) {
				// We're redrawing an old map, probably to pick up changes to the options.
				// Just clear out all the old stuff.
				var wrapper = img.parent();
				img.insertBefore(wrapper);
				wrapper.remove();
				$(map).unbind('.maphilight').find('area[coords]').unbind('.maphilight');
			}

			wrap = $('<div></div>').css({
				display:'block',
				background:'url("'+this.src+'")',
				position:'relative',
				padding:0,
				width:this.width,
				height:this.height
				});
			if(options.wrapClass) {
				if(options.wrapClass === true) {
					wrap.addClass($(this).attr('class'));
				} else {
					wrap.addClass(options.wrapClass);
				}
				
			}
			img.before(wrap).css('opacity', 0).css(canvas_style).remove();
			if(has_VML) { img.css('filter', 'Alpha(opacity=0)'); }
			wrap.append(img);
			
			canvas = create_canvas_for(this);
			$(canvas).css(canvas_style);
			canvas.height = this.height;
			canvas.width = this.width;
			
			mouseover = function(e) {
				var shape, area_options;
				area_options = options_from_area(this, options);
				if(
					!area_options.neverOn
					&&
					!area_options.alwaysOn
				) {
					shape = shape_from_area(this);
					add_shape_to(canvas, shape[0], shape[1], area_options, "highlighted");
					if(area_options.groupBy) {
						var areas;
						// two ways groupBy might work; attribute and selector
						if(/^[a-zA-Z][\-a-zA-Z]+$/.test(area_options.groupBy)) {
							areas = map.find('area['+area_options.groupBy+'="'+$(this).attr(area_options.groupBy)+'"]');
						} else {
							areas = map.find(area_options.groupBy);
						}
						var first = this;
						areas.each(function() {
							if(this != first) {
								var subarea_options = options_from_area(this, options);
								if(!subarea_options.neverOn && !subarea_options.alwaysOn) {
									var shape = shape_from_area(this);
									add_shape_to(canvas, shape[0], shape[1], subarea_options, "highlighted");
								}
							}
						});
					}
					// workaround for IE7, IE8 not rendering the final rectangle in a group
					if(!has_canvas) {
						$(canvas).append('<v:rect></v:rect>');
					}
				}
			}

			$(map).bind('alwaysOn.maphilight', function() {
				// Check for areas with alwaysOn set. These are added to a *second* canvas,
				// which will get around flickering during fading.
				if(canvas_always) {
					clear_canvas(canvas_always);
				}
				if(!has_canvas) {
					$(canvas).empty();
				}
				$(map).find('area[coords]').each(function() {
					var shape, area_options;
					area_options = options_from_area(this, options);
					if(area_options.alwaysOn) {
						if(!canvas_always && has_canvas) {
							canvas_always = create_canvas_for(img[0]);
							$(canvas_always).css(canvas_style);
							canvas_always.width = img[0].width;
							canvas_always.height = img[0].height;
							img.before(canvas_always);
						}
						area_options.fade = area_options.alwaysOnFade; // alwaysOn shouldn't fade in initially
						shape = shape_from_area(this);
						if (has_canvas) {
							add_shape_to(canvas_always, shape[0], shape[1], area_options, "");
						} else {
							add_shape_to(canvas, shape[0], shape[1], area_options, "");
						}
					}
				});
			});
			
			$(map).trigger('alwaysOn.maphilight').find('area[coords]')
				.bind('mouseover.maphilight', mouseover)
				.bind('mouseout.maphilight', function(e) { clear_canvas(canvas); });
			
			img.before(canvas); // if we put this after, the mouseover events wouldn't fire.
			
			img.addClass('maphilighted');
			
			img.parent().css('background-position',img.css('background-position'));
		});
	};
	$.fn.maphilight.defaults = {
		fill: true,
		fillColor: '000000',
		fillOpacity: 0.2,
		stroke: true,
		strokeColor: 'ff0000',
		strokeOpacity: 1,
		strokeWidth: 1,
		fade: true,
		alwaysOn: false,
		neverOn: false,
		groupBy: false,
		wrapClass: true,
		// plenty of shadow:
		shadow: false,
		shadowX: 0,
		shadowY: 0,
		shadowRadius: 6,
		shadowColor: '000000',
		shadowOpacity: 0.8,
		shadowPosition: 'outside',
		shadowFrom: false
	};
})(jQuery);;function word_highlight(dom,highlight,strokeWidth,strokeColor){
    if(highlight){
        dom.css('border-style','solid');
        dom.css('border-width',strokeWidth+'px');
        dom.css('border-color','#'+strokeColor);
    }else{
        dom.css('border-style','none');
        dom.css('border-width','0px');
    }
}  ;function sortJSON(tableau,key,asc){
    tableau = tableau.sort(function(a, b) {
        if (asc) return (a[key] > b[key]) ? 1 : ((a[key] < b[key]) ? -1 : 0);
        else return (b[key] > a[key]) ? 1 : ((b[key] < a[key]) ? -1 : 0);
    });
}

function bindAutocomplete(){
        $('.autocomplete.isolangue').each(function(){
        var that = $(this);
        
        $(this).next('.results_autocomplete').remove();
        
        var div_result_autocomplete = $('<div></div>');
        div_result_autocomplete.addClass('results_autocomplete');
        div_result_autocomplete.css('position','absolute');
        //div_result_autocomplete.css('top','100%');
        div_result_autocomplete.css('left','0');
        div_result_autocomplete.css('-webkit-transform-origin','center top');
        div_result_autocomplete.css('-ms-transform-origin','center top');
        div_result_autocomplete.css('transform-origin','center top');
        div_result_autocomplete.css('background','#fff');
        div_result_autocomplete.css('z-index','998');
        div_result_autocomplete.css('border-radius','.30rem');
        div_result_autocomplete.css('border','1px solid #d4d4d5');

        $(this).after(div_result_autocomplete);
        
        $(this).on('keyup', function() {

            var that = $(this);
            var search = that.val();       
            var acin = $(this).attr('acin');
            $(this).next('.results_autocomplete').empty().show();

            if(search.length < 3) return false;

            $.post(
                'getLanguageFromISO',
                {
                    YII_CSRF_TOKEN: token,
                    search: search,
                    in: acin
                },
                function (result) {
 
                    var languesISO = $.parseJSON(result);
                    
                    $.each(languesISO,function(){
                        that.next('.results_autocomplete').append('<a class="result"><div class="">'+this["langue"]+' / '+this["codeISO"]+'</div></a>');
                    });
                    
                    $('.results_autocomplete .result').on('click',function(){
                        var that = $(this).parent().parent().find('input');
                        var id = that.attr('id');
                        var actarget = that.attr('actarget');
                        var acin = that.attr('acin');
                        
                        var langueStr = $(this).text();
                        var libLangue = langueStr.split(' / ')[0];
                        var codeLangue = langueStr.split(' / ')[1];

                        if(actarget === id){
                            that.val(codeLangue);
                        }else{
                            if(acin === 'Id'){
                                that.val(codeLangue);
                                that.parent().parent().find('#'+actarget).val(libLangue); 
                            }else{
                                that.val(libLangue);
                                that.parent().parent().find('#'+actarget).val(codeLangue); 
                            }
                        }
                        
                        $(this).parent().empty().hide();
                        //console.log(that.attr('id'));
                        if($.inArray(that.attr('id'),["codelangue_1","subject_1"])){
                            var d = new Date();
                            $("#identifier-doc").html('crdo-' + $('#codelangue_1').val().toUpperCase() + '_' + $("#user").val() + '_' + d.getTime().toString());
                        }
                        
                    });

                }
            );
            
        });
    });
    
}

$(document).ready(function(){
    
    bindAutocomplete();
    
    //FACTORISER AVEC AUTOCOMPLETE LANGUE ISO
    $('.autocomplete.isopays').each(function(){
        var that = $(this);
        
        $(this).next('results_autocomplete').remove();
        
        var div_result_autocomplete = $('<div></div>');
        div_result_autocomplete.addClass('results_autocomplete');
        div_result_autocomplete.css('position','absolute');
        //div_result_autocomplete.css('top','100%');
        div_result_autocomplete.css('left','0');
        div_result_autocomplete.css('-webkit-transform-origin','center top');
        div_result_autocomplete.css('-ms-transform-origin','center top');
        div_result_autocomplete.css('transform-origin','center top');
        div_result_autocomplete.css('background','#fff');
        div_result_autocomplete.css('z-index','998');
        div_result_autocomplete.css('border-radius','.30rem');
        div_result_autocomplete.css('border','1px solid #d4d4d5');
        
        $(this).after(div_result_autocomplete);
        

        $(this).on('keyup', function() {
            
            $(this).next('.results_autocomplete').empty().show();
            
            var that = $(this);
            var search = that.val();       
            var acin = $(this).attr('acin');
            
            $.post(
                'getCountryFromISO',
                {
                    YII_CSRF_TOKEN: token,
                    search: search,
                    in: acin
                },
                function (result) {
 
                    var countriesISO = $.parseJSON(result);
                    
                    $.each(countriesISO,function(){
                        that.next('.results_autocomplete').append('<a class="result"><div class="content"><div class="title">'+this["Name"]+' / '+this["Code"]+'</div></div></a>');
                    });
                    
                    $('.results_autocomplete .result').on('click',function(){
                        var that = $(this).parent().parent().find('input');
                        var id = that.attr('id');
                        var actarget = that.attr('actarget');
                        var acin = that.attr('acin');
                        
                        var paysStr = $(this).find('.title').html();
                        var Pays = paysStr.split(' / ')[0];
                        var codePays = paysStr.split(' / ')[1];

                        if(actarget === id){
                            that.val(codePays);
                        }else{
                            if(acin === 'Code'){
                                that.val(codePays);
                                that.parent().parent().find('#'+actarget).val(Pays); 
                            }else{
                                that.val(Pays);
                                that.parent().parent().find('#'+actarget).val(codePays); 
                            }
                        }
                        
                        $(this).parent().empty().hide();
                        $("input#codepays").change();
                        
                    });

                }
            );

        });
    });
    
});

;
$(document).ready(function(){
    console.log('eastling_menu');
    
    $('#mainmenu')
            .sidebar({
            exclusive:false})
                .sidebar('attach events', '.toggle-menu', 'toggle')
        .sidebar('hide')
                ;
         
    
    $('#lang_user').dropdown('setting','onChange',function(val){
            localStorage.setItem('langUser',val);
            var url = window.location.href;

            var curLang = window.location.href.split('index.php/')[1].split('/')[0]; 

            var strSearch = 'index.php/' + curLang;
            var strReplace = 'index.php/' + val;

            var newUrl = url.replace(strSearch,strReplace);

            window.location.href = newUrl;
        }
    );
    
    var curLang = window.location.href.split('index.php/')[1].split('/')[0];
    if(curLang == 'fr'){
        $('#traduction_1_langue').val('fra');
        $('#title_1_langue').val('fra');
        
    }else if(curLang == 'en'){
        $('#traduction_1_langue').val('eng');
        $('#title_1_langue').val('eng');
    }
});

;    //Variables globales
    var documents = new Array();
    var user;
    var currentDocument = localStorage.getItem('document');
    var currentLangue = localStorage.getItem('langue');
    var currentStep = localStorage.getItem('step');
    var langUser = localStorage.getItem('langUser');
    
    var langues_user = new Array();
    // Create an instance
    //var wavesurfer = Object.create(WaveSurfer);


    var wavesurfer = WaveSurfer.create({
        container: '#waveform',
        scrollParent: true,
        waveColor: 'rgba(0,0,0,1)',
        height: 100
    });
    var timeline = Object.create(WaveSurfer.Timeline);

    var slider = document.querySelector('#slider');

    slider.oninput = function () {
      var zoomLevel = Number(slider.value);
      wavesurfer.zoom(zoomLevel);
    };
    //wavesurfer.enableDragSelection();

    var playerAction = "";

    var o_imgAreaSelect;

    var rules_newdoc;
    var rules_newselection;

    var selected_areas = new Array();
    
    var file_mp3 = '';
    var file_wav = '';
    var images = new Array();
    
    var o_Currentdocument;
    var json_document;
    
//____________________________________________________________________________________
//____________________________________________________________________________________
    // FONCTION POUR SELECTION SUR L'IMAGE           
    function preview(img, selections) {
        selected_areas = o_imgAreaSelect.getSelections();
    }
  

//______________________________________________
//______________________________________________
    // NOTIFICATIONS UTILISATEUR
    function notifier(message,type,target){
        
        target = target || "#annotations";
        
        var colordiv = "yellow";
        
        switch(type){
            case "success": colordiv = "green";
                break;
            case "error":  colordiv = "red";
                break;
            default: colordiv = "yellow";                       
        }
        var div_message = '<div class="ui '+colordiv+' message">'+message+'</div>';       
        
        $('#notification').popup({
            position : 'top left',
            target   : target, 
            transition : 'fade up',
            html  : div_message,
            onShow : function(){
                setTimeout(function () {
                        $('#notification').popup('hide');                    
                }, 3000);
            }
          })
        ;
        
        $('#notification').popup('show');
        $('.ui.popup').bind('click',function(){$(this).remove();})
    }

    //Récupère toutes les données d'une sélection depuis le DOM
    function Annotation2Json(idAnnotation){
        var title = $('#annotations .title[id-selection="'+idAnnotation+'"]');
        var container = $('#annotations .content[id-selection="'+idAnnotation+'"]');

        var startPosition = container.children('.recording').find('.audio.start').val();
        var endPosition = container.children('.recording').find('.audio.end').val();

        //TODO : multi-image
        var areas = new Array();

        container.find('>.image > .input > .input.image > div').each(function(){

            var image = $(this).attr('image');
            var x1 = parseInt($(this).attr('x1'));
            var y1 = parseInt($(this).attr('y1'));
            var h = parseInt($(this).attr('h'));
            var w = parseInt($(this).attr('w'));

            areas.push({
                image:image,
                x1:x1,
                y1:y1,
                x2:(x1+w),
                y2:(y1+h),
                w:w,
                h:h
            });
        });

        
        ///

        var transcriptions = [];
        var traductions = [];

        container.children('.transcriptions').children('.input').each(function(){
            var transcription = $(this).find('.transcription input').val();
            var lang = $(this).find('.selection > .menu> .item.active').attr('data-value');
            transcriptions.push({lang:lang,transcription:transcription});
        });

        container.children('.traductions').children('.input').each(function(){
            var traduction = $(this).find('.traduction input').val();
            var lang = $(this).find('.traduction-lang input').val();
            traductions.push({lang:lang,traduction:traduction});
        });

        var typeselection = $('.title[id-selection="'+idAnnotation+'"]').attr('typeannotation');

        result = {
            id:idAnnotation,
            typeselection:typeselection,
            startPosition:startPosition,
            endPosition:endPosition,
            areas:areas,
            transcriptions:transcriptions,
            traductions:traductions
        };

        $.each(o_Currentdocument.annotations.sentences,function(){
            if(typeselection == "sentence"){
                if(idAnnotation == this.id){
                    this.startPosition = startPosition;
                    this.endPosition = endPosition;
                    this.areas = areas;
                    this.transcriptions = transcriptions;
                    this.traductions = traductions;
                }
            }else{
                $.each(this.children,function(){
                    if(idAnnotation == this.id){
                        this.startPosition = startPosition;
                        this.endPosition = endPosition;
                        this.areas = areas;
                        this.transcriptions = transcriptions;
                        this.traductions = traductions;
                    }
                });
            }
        });

        return result;
    }

    function createMetadataInput(data, value, div){
        var d = $('<div class="metadata '+data+'"></div>');
        d.append('<h5 class="ui header">'+data+'</h5>');

        var input = $('<input disabled type="text">');
        input.attr('value',value);
        input.attr('text',value);


        d.append(input);
        d.append('<div class="edit-metadata ui icon button"><i class="green pencil icon"></i></div>');

        div.append(d);
    }


//_______________________________________________
//_______________________________________________
    //  AFFICHAGE DES METADATA
    function displayMetadata(metadata, div, hovercolor, borderStyle) {
    //_______________________________________________

        /////////////TITLE
        var div_accordion = $('<div></div>');
        var div_title = $('<div>Titre</div>');
        div_title.addClass('title');        
        div_title.append('<i class="dropdown icon"></i>');
        
        var div_content = $('<div></div>');
        div_content.addClass('content');
        div_content.css('background-color','rgba(0,0,0,0.1)');

        var div_form = $('<div class="ui form"></div>');
        var div_fields = $('<div class="inline fields"></div>');

        var input_titre = $('<input size="40" id="metadata-title" class="metadata-title" type="text" name="metadata-title"/>');
        input_titre.val(metadata['title']['title']);
        var div_field_titre = $('<div class="field"></div>');
        
        var input_titre_lang = $('<input size="3" id="metadata-title-lang" class="metadata-title" type="text" name="metadata-title-lang"/>');
        input_titre_lang.val(metadata['title']['lang']);
        var div_field_titre_lang = $('<div class="field"></div>');


        div_field_titre.append(input_titre);
        div_field_titre_lang.append(input_titre_lang);

        div_fields.append(div_field_titre).append(div_field_titre_lang);
        div_form.append(div_fields);
        div_content.append(div_form);

        div_accordion.append(div_title);
        div_accordion.append(div_content);
        div_accordion.addClass('ui accordion');
        div_accordion.accordion({exclusive: false});
        div.append(div_accordion);
        //////////////////////////

        //////////////ALTERNATIVES

        var div_accordion = $('<div></div>');
            var div_title = $('<div>Titres alternatifs</div>');
            div_title.addClass('title');        
            div_title.append('<i class="dropdown icon"></i>');
            
            var div_content = $('<div></div>');
            div_content.addClass('content');
            div_content.css('background-color','rgba(0,0,0,0.1)');

            var div_form = $('<div class="ui form"></div>');

        $.each(metadata['alternatives'],function(){

            var div_fields = $('<div class="inline fields"></div>');

            var input_titre = $('<input size="40" id="metadata-title" class="metadata-title" type="text" name="metadata-title"/>');
            input_titre.val(this['alternative']);
            var div_field_titre = $('<div class="field"></div>');
            
            var input_titre_lang = $('<input size="3" id="metadata-title-lang" class="metadata-title" type="text" name="metadata-title-lang"/>');
            input_titre_lang.val(this['lang']);
            var div_field_titre_lang = $('<div class="field"></div>');


            div_field_titre.append(input_titre);
            div_field_titre_lang.append(input_titre_lang);

            div_fields.append(div_field_titre).append(div_field_titre_lang);
            div_form.append(div_fields);
            div_content.append(div_form);

            
        });
        
        div_accordion.append(div_title);
        div_accordion.append(div_content);
        div_accordion.addClass('ui accordion');
        div_accordion.accordion({exclusive: false});
        div.append(div_accordion);

        //////////////SUBJECT

        var div_accordion = $('<div></div>');
            var div_title = $('<div>Objets</div>');
            div_title.addClass('title');        
            div_title.append('<i class="dropdown icon"></i>');
            
            var div_content = $('<div></div>');
            div_content.addClass('content');
            div_content.css('background-color','rgba(0,0,0,0.1)');

            var div_form = $('<div class="ui form"></div>');

        $.each(metadata['subject'],function(){

            var div_fields = $('<div class="inline fields"></div>');

            var input_titre = $('<input size="40" id="metadata-title" class="metadata-title" type="text" name="metadata-title"/>');
            input_titre.val(this['subject']);
            var div_field_titre = $('<div class="field"></div>');
            
            var input_titre_lang = $('<input size="3" id="metadata-title-lang" class="metadata-title" type="text" name="metadata-title-lang"/>');
            input_titre_lang.val(this['codelang']);
            var div_field_titre_lang = $('<div class="field"></div>');


            div_field_titre.append(input_titre);
            div_field_titre_lang.append(input_titre_lang);

            div_fields.append(div_field_titre).append(div_field_titre_lang);
            div_form.append(div_fields);
            div_content.append(div_form);

            
        });
        
        div_accordion.append(div_title);
        div_accordion.append(div_content);
        div_accordion.addClass('ui accordion');
        div_accordion.accordion({exclusive: false});
        div.append(div_accordion);
        //////////////////////////

        //////////////LANGUAGES

        var div_accordion = $('<div></div>');
            var div_title = $('<div>Langues</div>');
            div_title.addClass('title');        
            div_title.append('<i class="dropdown icon"></i>');
            
            var div_content = $('<div></div>');
            div_content.addClass('content');
            div_content.css('background-color','rgba(0,0,0,0.1)');

            var div_form = $('<div class="ui form"></div>');

        $.each(metadata['languages'],function(){

            var div_fields = $('<div class="inline fields"></div>');

            var input_titre = $('<input size="40" id="metadata-title" class="metadata-title" type="text" name="metadata-title"/>');
            input_titre.val(this);
            var div_field_titre = $('<div class="field"></div>');
            

            div_field_titre.append(input_titre);

            div_fields.append(div_field_titre);
            div_form.append(div_fields);
            div_content.append(div_form);

            
        });
        
        div_accordion.append(div_title);
        div_accordion.append(div_content);
        div_accordion.addClass('ui accordion');
        div_accordion.accordion({exclusive: false});
        div.append(div_accordion);
        //////////////////////////

        /////////////SPATIAL / GEOGRAPHIE
        var div_accordion = $('<div></div>');
        var div_title = $('<div>Géographie</div>');
        div_title.addClass('title');        
        div_title.append('<i class="dropdown icon"></i>');
        
        var div_content = $('<div></div>');
        div_content.addClass('content');
        div_content.css('background-color','rgba(0,0,0,0.1)');

        var div_form = $('<div class="ui form"></div>');
        //Code pays
        var div_fields = $('<div class="inline fields"></div>');
        var input_titre = $('<input size="40" id="metadata-title" class="metadata-title" type="text" name="metadata-title"/>');
        input_titre.val(metadata['spatial']['countrycode']);
        var div_field_titre = $('<div class="field"></div>');

        div_field_titre.append(input_titre);

        div_fields.append(div_field_titre);
        div_form.append(div_fields);
        //
        //Coordonnées east
        var div_fields = $('<div class="inline fields"></div>');
        var input_titre = $('<input size="40" id="metadata-title" class="metadata-title" type="text" name="metadata-title"/>');
        input_titre.val(metadata['spatial']['geo']['east']);
        var div_field_titre = $('<div class="field"></div>');

        div_field_titre.append(input_titre);

        div_fields.append(div_field_titre);
        div_form.append(div_fields);
        //
        //Coordonnées north
        var div_fields = $('<div class="inline fields"></div>');
        var input_titre = $('<input size="40" id="metadata-title" class="metadata-title" type="text" name="metadata-title"/>');
        input_titre.val(metadata['spatial']['geo']['north']);
        var div_field_titre = $('<div class="field"></div>');

        div_field_titre.append(input_titre);

        div_fields.append(div_field_titre);
        div_form.append(div_fields);
        //
        //Coordonnées langue
        var div_fields = $('<div class="inline fields"></div>');
        var input_titre = $('<input size="40" id="metadata-title" class="metadata-title" type="text" name="metadata-title"/>');
        input_titre.val(metadata['spatial']['lang']);
        var div_field_titre = $('<div class="field"></div>');

        div_field_titre.append(input_titre);

        div_fields.append(div_field_titre);
        div_form.append(div_fields);
        //
        //Coordonnées localité
        var div_fields = $('<div class="inline fields"></div>');
        var input_titre = $('<input size="40" id="metadata-title" class="metadata-title" type="text" name="metadata-title"/>');
        input_titre.val(metadata['spatial']['place']);
        var div_field_titre = $('<div class="field"></div>');

        div_field_titre.append(input_titre);

        div_fields.append(div_field_titre);
        div_form.append(div_fields);
        //

        //////////////CONTRIBUTEURS

        var div_accordion = $('<div></div>');
            var div_title = $('<div>Contributeurs</div>');
            div_title.addClass('title');        
            div_title.append('<i class="dropdown icon"></i>');
            
            var div_content = $('<div></div>');
            div_content.addClass('content');
            div_content.css('background-color','rgba(0,0,0,0.1)');

            var div_form = $('<div class="ui form"></div>');

        $.each(metadata['contributors'],function(){

            var div_fields = $('<div class="inline fields"></div>');
            var input_titre = $('<input size="40" id="metadata-title" class="metadata-title" type="text" name="metadata-title"/>');
            input_titre.val(this['contributor']);
            var div_field_titre = $('<div class="field"></div>');
            
            div_field_titre.append(input_titre);

            div_fields.append(div_field_titre);
            div_form.append(div_fields);
            div_content.append(div_form);

            
        });
        
        div_accordion.append(div_title);
        div_accordion.append(div_content);
        div_accordion.addClass('ui accordion');
        div_accordion.accordion({exclusive: false});
        div.append(div_accordion);
        //////////////////////////


        div_content.append(div_form);

        div_accordion.append(div_title);
        div_accordion.append(div_content);
        div_accordion.addClass('ui accordion');
        div_accordion.accordion({exclusive: false});
        div.append(div_accordion);
        //////////////////////////

    }

//_______________________________________________
    //  AFFICHAGE DES ANNOTATIONS DANS LE VOLET "ANNOTATIONS"
    function displayAnnotation(annotation, div, hovercolor, borderStyle,typeannotation,idparent) {
        ////console.log(annotation);
        var div_annotation = $('<div></div>');
        var div_title = $('<div></div>');
        div_title.addClass('title');
        div_title.attr('id-selection',annotation['id']);
        //useful for sortable changes
        div_title.attr('typeannotation',typeannotation);
        div_title.attr('idparent',idparent);

        if(annotation.hasOwnProperty('areas') && annotation['areas'][0]){
            div_title.attr('x1',annotation['areas'][0]['x1']);
            div_title.attr('y1',annotation['areas'][0]['y1']);
            div_title.attr('w',annotation['areas'][0]['w']);
            div_title.attr('h',annotation['areas'][0]['h']);
            div_title.attr('image',annotation['areas'][0]['image']);
        }
        
        div_title.append('<i class="dropdown icon"></i>');

        var transcriptionToDisplay = annotation['transcriptions'][0]['transcription']; 

        $.each(annotation['transcriptions'],function(){
            if(this['lang'] === 'phono'){
                transcriptionToDisplay = this['transcription'];
            }
        });

        div_title.append(transcriptionToDisplay);
        
        var div_content = $('<div></div>');
        div_content.append('<i class="delete-selection ui red trash icon"></i>');
        div_content.addClass('content');
        div_content.attr('id-selection',annotation['id']);
        div_content.attr('startposition',annotation['startPosition']);
        div_content.attr('endposition',annotation['endPosition']);
        div_content.css('background-color','rgba(0,0,0,0.1)');


        /////////////////////////////////////////
        // AUDIO
        ///////////////////////////////////////
        var div_audio = $('<div></div>');
        div_audio.addClass('recording');
        div_audio.append('<h5 class="ui header">Audio position</h5>');

        var div_play = $('<div class="play-selection ui icon button"><i class="dark icon play"></i></div>');
        

        var div_line_input = $('<div class="line input"></div>');

        var div_input_audio = $('<div class="ui input audio"></div>');

        div_input_audio.append('Start : <input class="audio start" disabled type="text" value="' + annotation['startPosition'] + '" text="' + annotation['startPosition'] + '">');
        div_input_audio.append('End : <input class="audio end" disabled type="text" value="' + annotation['endPosition'] + '" text="' + annotation['endPosition'] + '">');

        div_line_input.append(div_input_audio);

        div_line_input.append(div_play);
        div_line_input.append('<div class="edit-audio ui icon button"><i class="green pencil icon"></i></div>');
        div_line_input.append('<div class="delete-audio ui icon button"><i class="red trash icon"></i></div>');

        div_line_input.appendTo(div_audio);

        div_audio.appendTo(div_content);
          
        // IMAGE
        div_content.append('<div class="ui divider"></div>');
        var div_image = $('<div></div>');
        div_image.addClass('image');
        div_image.append('<h5 class="ui header">Image position</h5>');

        var div_line_input = $('<div class="line input"></div>');
        var div_input_image = $('<div class="ui input image"></div>');

        if(annotation.hasOwnProperty('areas') && annotation['areas'][0]){

            $.each(annotation['areas'],function(){

                var that = this;
                var img = $("<img>");
                var div_img = $("<div>");
                var path_doc = window.location.href.split('index.php')[0]+ "documents/"+user+"/"+o_Currentdocument.id+"/";
                var image_file = "";

                $.each(images,function(){
                    image_str = this.file.toString();
                     if(this.id == that['image']){
                         image_file = image_str;
                     }
                 });

                img.attr('src', path_doc+image_file);
                img.attr('width', that['w']);
                img.attr('height', that['h']);
                
                div_img.css('display','block');
                div_img.css('position','relative');
                div_img.css('padding','0px');
                div_img.css('width',that['w']);
                div_img.css('height',that['h']);
                div_img.css('background-image','url('+path_doc+image_file+')');
                div_img.css('background-position-x',0-that['x1']);
                div_img.css('background-position-y',0-that['y1']);

                 //img.attr('class', '');

                var a_input = $('<a>View Image on screen</a>');
                a_input.attr('href','#');

                if(that){
                    div_img.attr('x1',that['x1']);
                    div_img.attr('y1',that['y1']);
                    div_img.attr('w',that['w']);
                    div_img.attr('h',that['h']);
                    div_img.attr('image',that['image']);
                }else{
                    div_img.attr('x1',0);
                    div_img.attr('y1',0);
                    div_img.attr('w',0);
                    div_img.attr('h',0);
                    div_img.attr('image','');
                }
                

                //div_input_image.append(a_input);
                //div_input_image.append(img);
                div_input_image.append(div_img);

            });

            

        }
        

        div_line_input.append(div_input_image);
        div_line_input.append('<div class="edit-image ui icon button"><i class="green pencil icon"></i></div>');
        div_line_input.append('<div class="delete-image ui icon button"><i class="red trash icon"></i></div>');

        div_line_input.appendTo(div_image);
        div_image.appendTo(div_content);


        //////////////////////////////////////////////
        // TRANSCRIPTIONS
        /////////////////////////////////////////////
        div_content.append('<div class="ui divider"></div>');
        var div_transc = $('<div></div>');
        div_transc.addClass('transcriptions');
        div_transc.append('<h5 class="ui header">Transcriptions</h5>');

        var firstInputLine = true;
        
                    
        $.each(annotation['transcriptions'], function () {

            var line_transc = $('<div></div>');
            line_transc.addClass('line input');

            var input_transc = $('<div></div>');
            input_transc.addClass('ui input transcription');
            input_transc.append('<input disabled lang="' + this['lang'] + '" type="text" value="' + this['transcription'] + '" text="' + this['transcription'] + '">');
                                      
            var input_transc_lg = $('<div></div>');
            input_transc_lg.addClass('ui input transcription-lang');
            input_transc_lg.append('<input disabled type="text" value="' + this['lang'] + '" maxlength=10 size=2>');
            
            var div_transc_dropdown_ui = $('<div class="ui selection dropdown disabled"></div>');
            div_transc_dropdown_ui.append('<input type="hidden" name="transcription-lang">')
            var div_transc_dropdown_text = $('<div class="text">Transcription<i class="dropdown icon"></i></div>');
            var div_transc_dropdown_menu = $('<div class="menu"></div>');
            div_transc_dropdown_menu.append('<div class="item" data-value="phono">Phonologique</div>');
            div_transc_dropdown_menu.append('<div class="item" data-value="phone">Phonétique</div>');
            div_transc_dropdown_menu.append('<div class="item" data-value="ortho">Orthographique</div>');
            div_transc_dropdown_menu.append('<div class="item" data-value="transliter">Translittération</div>');
            
            div_transc_dropdown_ui.append(div_transc_dropdown_text).append(div_transc_dropdown_menu);
                       
            //DIV DE STOCKAGE DE L'AUTOCOMPLETE
            //input_transc_lg.append('<div class="autocomplete"></div>');
  
            //line_transc.append(input_transc).append(input_transc_lg);
            line_transc.append(input_transc).append(div_transc_dropdown_ui);
            line_transc.append('<div class="edit-annotation edit-transcription ui icon button"><i class="green pencil icon"></i></div>');
            
            if(!firstInputLine){
                line_transc.append('<div class="delete-annotation delete-transcription ui icon button"><i class="red trash icon"></i></div>');
            }

            line_transc.appendTo(div_transc);
            
            firstInputLine = false;
            
            div_transc_dropdown_ui.dropdown('set selected',this['lang']);     
            div_transc_dropdown_ui.dropdown('destroy');

        });

        div_transc.append('<br><div class="add-transcription ui icon tiny button"><i class="blue plus icon"></i></div>');
        div_transc.appendTo(div_content);                    

        //////////////////////////////////////////////
        // TRADUCTIONS
        /////////////////////////////////////////////
        div_content.append('<div class="ui divider"></div>');
        var div_transl = $('<div></div>');
        div_transl.addClass('traductions');
        div_transl.append('<h5 class="ui header">'+messages("Traductions")+'</h5>');

        var firstInputLine = true;

        $.each(annotation['traductions'], function () {
            var line_transc = $('<div></div>');
            line_transc.addClass('line input');

            var input_transc = $('<div></div>');
            input_transc.addClass('ui input traduction');
            input_transc.append('<input disabled lang="' + this['lang'] + '" type="text" value="' + this['traduction'] + '" text="' + this['traduction'] + '">');


            var input_transc_lg = $('<div></div>');
            input_transc_lg.addClass('ui input traduction-lang');
            input_transc_lg.append('<input id="traduction-lang_'+annotation['id']+'" class="autocomplete isolangue" actarget="traduction-lang_'+annotation['id']+'" acin="Id" disabled type="text" value="' + this['lang'] + '" maxlength=3 size=2>');

            line_transc.append(input_transc).append(input_transc_lg);
            line_transc.append('<div class="edit-annotation edit-traduction ui icon button"><i class="green pencil icon"></i></div>');
            
            if(!firstInputLine){
                line_transc.append('<div class="delete-annotation delete-traduction ui icon button"><i class="red trash icon"></i></div>');
            }

            line_transc.appendTo(div_transl);
            
            firstInputLine = false;

        });
        div_transl.append('<br><div class="add-traduction ui icon tiny button"><i class="blue plus icon"></i></div>');
        div_transl.appendTo(div_content);

        //////////////////////////////////
        /// MOTS
        ///////////////////////////////////
        //Plus tard si morphèmes ? if(annotation['children']){
        if(idparent == 0){
            div_content.append('<div class="ui divider"></div>');
            var div_mots = $('<div></div>');
            div_mots.addClass('words').addClass('segment sortable');
            //div_mots.css('font-size','0.8rem').css('background-color','lightblue');
            div_mots.append('<h5 class="ui header">'+messages("Mots")+'</h5>');


            $.each(annotation['children'], function () {
                displayAnnotation(this,div_mots,"rgba(255, 0, 0, 0.2)","dotted","word",annotation['id']);
            });

            div_mots.appendTo(div_content);
            div_mots.append('<div class="add-word ui icon tiny button"><i class="blue plus icon"></i></div>');

        }
       

        ///////////////////////////////////////
        //TODO (not important) 13/02/2017 : replace typeannotation by typeselection IN THIS KIND OF CASE (not everywhere)
        $( ".sortable" ).sortable({
            stop: function( event, ui ) {
               // var idAnnotation = ui.item[0].firstChild.attributes['id-selection'].nodeValue;
                var typeAnnotation = ui.item[0].firstChild.attributes['typeannotation'].nodeValue;
                var idparent = ui.item[0].firstChild.attributes['idparent'].nodeValue;
                var sortedIds = [];
                //sortChange();
                if(typeAnnotation=="sentence"){
                    //console.log("change sort sentences");

                    $('#annotations-sentences [typeannotation="sentence"]').each(function(){
                        sortedIds.push($(this).attr('id-selection'));
                    });

                    var sortedData = [];

                    $.each(sortedIds,function(){
                        var idselection = this;
                        $.each(o_Currentdocument.annotations.sentences,function(){
                            if(this.id == idselection){
                                sortedData.push(this);
                            }
                        });
                    });

                    o_Currentdocument.annotations.sentences = sortedData;


                }else if(typeAnnotation=="word"){
                    
                    $('#annotations-sentences [id-selection="'+idparent+'"] [typeannotation="word"]').each(function(){
                        sortedIds.push($(this).attr('id-selection'));
                    });

                    var sortedData = [];

                    $.each(o_Currentdocument.annotations.sentences,function(){
                        var sentence = this;
                        if(sentence.id == idparent){
                            $.each(sortedIds,function(){
                                var idselection = this;
                                $.each(sentence.children,function(){
                                    if(this.id == idselection){
                                        sortedData.push(this);
                                    }
                                });
                            });
                            this.children = sortedData;
                        }

                    });

                }

                //console.log(sortedIds);
                //console.log(idparent);
                $.ajax({
                    url: "sortAnnotations",
                    data: {
                        YII_CSRF_TOKEN: token,
                        user:user,
                        iddoc:o_Currentdocument.id,
                        idparent:idparent,
                        sortedIds:sortedIds
                    },
                    type:'POST',
                    success:function(response){
                        
                    },
                    error:function(){}
                });

            }
        });

        $( ".sortable" ).disableSelection();

        div_annotation.append(div_title);
        div_annotation.append(div_content);
        div_annotation.addClass('ui accordion');
        div_annotation.accordion({exclusive: false,callback: function(){
            //01/11/2016 - Bouton pour la suppression de la sélection
            var i_trash = $('<i class="red trash icon"></i>');
            var div_trash = $('<div class="delete-selection ui icon"></div>');
            div_title.append(i_trash);
            div_trash.append(i_trash);
        }});

        div.append(div_annotation);
        

        // EN COURS 24.07.2015
        //var padding = parseInt($('.ui.tab.segment.active').css('padding'));
        var padding = parseInt($("body").css("font-size"));

        var x1 = 0;
        var y1 = 0;
        var w = 0;
        var h = 0;
        var image = '';

        if(annotation['areas'] && annotation['areas'].length > 0){
            x1 = parseInt(annotation['areas'][0]['x1']) + padding;
            y1 = parseInt(annotation['areas'][0]['y1']) + padding;
            w = parseInt(annotation['areas'][0]['w']);
            h = parseInt(annotation['areas'][0]['h']);
            image = annotation['areas'][0]['image'];
        }
        

        //if ($('.images-tab .item.active').html() == image) {
            var mask = $('<div id="maskSelection_'+annotation['id']+'" style="cursor:pointer;float: left; position: absolute; display: block; border-style: '+borderStyle+'; border-width: 1px; background-color: '+hovercolor+';"></div>');
            mask.css('left',x1);
            mask.css('top',y1);
            mask.css('width',w);
            mask.css('height',h);
            mask.css('display', 'none');

            $("img[id='"+image+"']").before(mask);                        
        //}
    }

//_______________________________________________
//_______________________________________________
    // SURLIGNAGE DES ANNOTATIONS MANQUANTES
    function checkMissingAnnotations(){
        //28/11/2015 MISE EN EVIDENCE DES ANNOTATIONS INCOMPLETES (POSITIONNEMENT AUDIO/IMAGE, TRANSCR/TRADUC)
        //30/01/2016 CAS PARTICULIER pour les mots écrits et non lus
        //$('.words .title').css('background-color','inherit');
        //$("#annotations-sentences .title").css('background-color','inherit');
        $("#annotations-sentences .title i.icon.red").remove();
        

        $('.words .content .input input.audio.end').each(function(){
            var div_word = $(this).parent().parent().parent().parent().prev();
       
            if($(this).val()==0) {
                
                if((div_word.text().indexOf('(') === -1) && (div_word.text().indexOf(')') === -1)){
                    //div_word.css('background-color','orange');
                    div_word.addClass('ui message warning');
                    div_word.append('<i class="icon red music"></i>');
                }


                //$(this).parent().parent().parent().parent().prev().append('<i class="icon red chat outline"></i>');
                //$(this).parent().parent().parent().parent().prev().append('<i class="icon red screenshot"></i>');
            }

        });

        $(".words .transcriptions").each(function(){
           if($(this).find('.line.input').length ==0){
             var div_word = $(this).parent().prev(); 
             if((div_word.text().indexOf('(') === -1) && (div_word.text().indexOf(')') === -1)){
                    //div_word.css('background-color','orange');
                    div_word.addClass('ui message warning');
                    div_word.append('<i class="icon red code"></i>');
              }
            }

        });

        $("#annotations-sentences .content").each(function(){
           if(($(this).find('.icon.red.code').length + $(this).find('.icon.red.music').length) > 0){
             //$(this).prev().css('background-color','orange');  
             $(this).prev().addClass('ui message warning');
            }

        });
    }

    //Find last available word ID
    function generateNewId(motphrase){
        var prefixId = o_Currentdocument.id.replace('crdo-','');

        var idMax = 0;
        var idSentenceMax = 0;
        var idWordMax = 0;

        var newId = prefixId + '_' + motphrase;

        $('#annotations-sentences > div > .title').each(
            function(){
                ids = $(this).attr('id-selection').split(prefixId+'_S');
                id = parseInt(ids[1]);
                idSentenceMax = (id > idSentenceMax)?id:idSentenceMax;
            }
        );

        $('.words > div > .title').each(
            function(){
                ids = $(this).attr('id-selection').split(prefixId+'_W');
                id = parseInt(ids[1]);
                idWordMax = (id > idWordMax)?id:idWordMax;
            }
        );

        if(o_Currentdocument.hasOwnProperty('annotations')){
            //on récupère le dernier id disponible
            if(motphrase == 'S'){
                idMax = idSentenceMax;
            }else{
                idMax = idWordMax;
            }

            //digit = ("000" + (idMax+1)).slice(-3);
            digit = idMax+1;
            newId += digit;   
            

        }else{
            o_Currentdocument.annotations = {};
            o_Currentdocument.annotations.sentences = [];
            newId += '1';
            
        }

        return newId;
    }

//_______________________________________________
//_______________________________________________
    // REFRESH DE LA FENETRE DES ANNOTATIONS
    function refreshAnnotations(doc) {

        if(doc == null) doc = o_Currentdocument;

        $('#annotations-sentences').empty();
        
        var id_doc = doc.id;
        
        displayMetadata(doc['metadata'], $('#metadata-data'),"rgba(0,0,0,0.2)","dashed");
        //13/11/2016 order of sentences in 'annotations'
       // $.each(doc['annotations'], function () { 
        //    var id_sentence = this;

            $.each(doc.annotations.sentences, function () { 
                //if(this.id == id_sentence)
                displayAnnotation(this, $('#annotations-sentences'),"rgba(0, 0, 0, 0.2)","dashed","sentence",0);                      
            });

        //});

        $('#annotations-sentences .words .accordion').accordion();

        $('.add-word').bind('click',function(){
            
            var idparent =  $(this).parent().parent().attr('id-selection');

            var newId = generateNewId('W');

            var newAnnotation = {
                id:newId,
                startPosition:0,
                endPosition:0,
                areas:[],
                transcriptions:[{lang:'phono',transcription:' '}],
                traductions:[{lang:'phono',traduction:' '}],
                children:[]
            };


            //displayAnnotation(newAnnotation,$(this).parent(),"rgba(255, 0, 0, 0.2)","dotted","word",idparent);

//var lastWordDiv = $(this).parent().find('.ui.accordion:last');
            //var newWordDiv = lastWordDiv.clone();

            //$(this).before(newWordDiv);
            //newWordDiv.accordion();

            //var newvalues = Annotation2Json(newId);

            //console.log(newAnnotation);


            $.ajax({
                    //url: "createSelection",
                    url: "createAnnotation",
                    dataType: 'json',
                    data: {
                        YII_CSRF_TOKEN: token,
                        user: user,
                        iddoc: o_Currentdocument.id,
                        annotation: newAnnotation,
                        idparent: idparent
                    },
                    type: 'POST',
                    success: function (response) {

                        notifier(messages("Création de l'annotation réussie."),"success");

                        $.each(o_Currentdocument.annotations.sentences,function(){
                            if(this.id == idparent){
                                this.children.push(newAnnotation);
                                refreshAnnotations();
                            }
                        });

                        //refreshPreview();
                        o_imgAreaSelect.cancelSelections();

                        $('wave region').remove();
                        checkMissingAnnotations(); 
                        
                    },
                    error: function (request, status, error) {
                        notifier(messages("Erreur lors de la création de l'annotation (createAnnotation).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");  
                    }
                });
        


        });


        $('.add-transcription,.add-traduction').bind('click', function () {
            //
            var div_line = $(this).parent().find('.line.input:last');
            var new_div_line = div_line.clone();
            div_line.after(new_div_line);
            //
            $(this).hide();


            new_div_line.find('input').each(function () {
                $(this).val('');
                $(this).removeAttr('disabled');
                
                if($(this).parent().hasClass('dropdown')){
                    $(this).parent().dropdown();
                }
            });

            new_div_line.find('.button.edit-annotation').addClass('save-edit-annotation').find('.pencil').removeClass('pencil').addClass('save');
            new_div_line.find('.button.edit-annotation').bind('click', function () {
                var typeAnnotation;

                $(this).hasClass('edit-traduction') ? typeAnnotation = 'traduction' : typeAnnotation = 'transcription';

                var idAnnotation = $(this).parent().parent().parent().attr('id-selection');

                //var inputText = $(this).prev().prev().find('input');
                //var inputLang = $(this).prev().find('input');

                var inputText = $(this).parent().find('.input:nth-of-type(1) input');
                var Text = inputText.val();
                var inputLang;
                var Lang;
                
                if($(this).parent().find('.ui.dropdown').length > 0){
                    Lang = $(this).parent().find('.ui.dropdown').dropdown('get value');
                }else{
                    inputLang = $(this).parent().find('.input:nth-of-type(2) input');
                    Lang = inputLang.val();
                }


/*deprecated
                $.ajax({
                    url: "addAnnotation",
                    data: {
                        YII_CSRF_TOKEN: token,
                        document: id_doc,
                        directory: user,
                        typeannotation: typeAnnotation,
                        idannotation: idAnnotation,
                        text: Text,
                        lang: Lang
                    },
                    type: 'POST',
                    success: function (response) {

                        ////console.log(response);
                        //getDoc(id_doc);
                        notifier(messages("Ajout de l'annotation réussie."),"success");
                        refreshContent(id_doc);
                        checkMissingAnnotations();
                    },
                    error: function (resultat, statut, erreur) {
                        notifier(messages("Erreur lors de l'ajout de l'annotation (addAnnotation).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");

                    }
                });
*/

                //on enregistre les modifications
                newvalues = Annotation2Json(idAnnotation);

                $.ajax({
                    url: "updateAnnotation",
                    data: {
                        YII_CSRF_TOKEN: token,
                        iddoc: id_doc,
                        user: user,
                        json: newvalues
                    },
                    type: 'POST',
                    success: function (response) {
                        notifier(messages("Mise à jour de l'annotation réussie."),"success");
                        $('wave region').remove();
                        //refreshContent(id_doc);
                        //refreshPreview();
                        checkMissingAnnotations();
                    },
                    error: function (resultat, statut, erreur) {
                        notifier(messages("Erreur lors de la mise à jour de l'annotation (updateAnnotation).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");

                    }
                });

                $(this).removeClass('save-edit-annotation');
                $(this).find('.save').removeClass('save').addClass('pencil');
                $(this).after('<div class="delete-annotation delete-transcription ui icon button"><i class="red trash icon"></i></div>');

                inputText.attr('disabled', 'disabled');
                inputLang.attr('disabled', 'disabled');
                
                $('.delete-annotation').bind('click', function () {
                    $('.basic.modal').find('.header').html('Supprimer');
                    $('.basic.modal').find('.content .right').html("Supprimer l'annotation ?");

                    var divInput = $(this).parent();

                    var typeAnnotation;
                    $(this).hasClass('delete-traduction') ? typeAnnotation = 'traduction' : typeAnnotation = 'transcription';

                    var idAnnotation = divInput.parent().parent().attr('id-selection');

                    var inputText = $(this).parent().find('.input:nth-of-type(1) input');
                    var Text = inputText.val();
                    var Lang = inputText.attr('lang');


                    $('.basic.modal').modal('setting', {
                        closable: false,
                        onDeny: function () {
                            //return false;
                        },
                        onApprove: function () {

                            $.ajax({
                                //url: "delAnnotation",//DEPRECATED since JSON version
                                url: "delAnnotation",
                                data: {
                                    YII_CSRF_TOKEN: token,
                                    iddoc: o_Currentdocument.id,
                                    user: user,
                                    typeannotation: typeAnnotation,
                                    idannotation: idAnnotation,
                                    text: Text,
                                    lang: Lang,
                                },
                                type: 'POST',
                                success: function (response) {
                                    //console.log(response);
                                    //getDoc(id_doc);
                                    //refreshPreview(o_Currentdocument)
                                    notifier(messages("Suppression de l'annotation réussie."),"success");
                                    divInput.remove();
                                    refreshContent(id_doc);

                                },
                                error: function (resultat, statut, erreur) {
                                    notifier(messages("Erreur lors de la suppression de l'annotation (delAnnotation).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");

                                }
                            });


                        }
                    }).modal('show');


                });

                
            });
            
            $(this).show();
        });
        
        //DECLARE 2 FOIS A CAUSE DE LA CREATION DYNAMQIUE DU BOUTON DE SUPPRESSION DES ANNOTATIONS DANS addAnnotation
        $('.delete-annotation').bind('click', function () {
            $('.basic.modal').find('.header').html('Supprimer');
            $('.basic.modal').find('.content .right').html("Supprimer l'annotation ?");

            var divInput = $(this).parent();

            var typeAnnotation;
            $(this).hasClass('delete-traduction') ? typeAnnotation = 'traduction' : typeAnnotation = 'transcription';

            var idAnnotation = divInput.parent().parent().attr('id-selection');

            var inputText = $(this).parent().find('.input:nth-of-type(1) input');
            var Text = inputText.val();
            var Lang = inputText.attr('lang');
            
            $('.basic.modal').modal('setting', {
                closable: false,
                onDeny: function () {
                    //return false;
                },
                onApprove: function () {

                    $.ajax({
                        url: "delAnnotation",
                        data: {
                            YII_CSRF_TOKEN: token,
                            document: id_doc,
                            directory: user,
                            typeannotation: typeAnnotation,
                            idannotation: idAnnotation,
                            text: Text,
                            lang: Lang,
                        },
                        type: 'POST',
                        success: function (response) {
                            //console.log(response);
                            //getDoc(id_doc);
                            //refreshPreview(o_Currentdocument)
                            notifier(messages("Suppression de l'annotation réussie."),"success");
                            divInput.remove();
                            refreshContent(id_doc);

                        },
                        error: function (resultat, statut, erreur) {
                            notifier(messages("Erreur lors de la suppression de l'annotation (delAnnotation).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");

                        }
                    });


                }
            }).modal('show');


        });
        
        //IHM : boutons de MAJ des annotations
        $('.button.edit-annotation').bind('click', function () {

            var typeAnnotation;
            $(this).hasClass('edit-traduction') ? typeAnnotation = 'traduction' : typeAnnotation = 'transcription';

            var idAnnotation = $(this).parent().parent().parent().attr('id-selection');

            var inputText = $(this).parent().find('.input:nth-of-type(1) input');
            
            var Text = inputText.val();
            
            var inputLang = $(this).parent().find('.input:nth-of-type(2) input');;
            var Lang;

            if($(this).parent().find('.ui.dropdown').length > 0){
                Lang = $(this).parent().find('.ui.dropdown').dropdown('get value');
            }else{                 
                Lang = inputLang.val();
            }


            var TextBeforeUpdate = inputText.attr('text');
            var LangBeforeUpdate = inputText.attr('lang');

            if (!$(this).hasClass('save-edit-annotation')) {
                //on rentre en mode édition
                $(this).addClass('save-edit-annotation');
                $(this).find('.pencil').removeClass('pencil').addClass('save');
                
                inputText.removeAttr('disabled');
                inputLang.removeAttr('disabled');                
                $(this).parent().find('.ui.dropdown').dropdown();

                $(this).after('<div class="button cancel-edition ui icon"><i class="blue icon undo"></i></div>');

                $('.button.cancel-edition').bind('click',function(){
                    $(this).parent().find('.save').removeClass('save').addClass('pencil');
                    $(this).parent().find('.save-edit-annotation').removeClass('save-edit-annotation');
                    inputText.attr('disabled', 'disabled');
                    inputLang.attr('disabled', 'disabled');
                    $(this).parent().find('.ui.dropdown').dropdown('destroy');
                    $(this).remove();
                });

            } else {
                //on enregistre les modifications
                newvalues = Annotation2Json(idAnnotation);

                $.ajax({
                    url: "updateAnnotation",
                    data: {
                        YII_CSRF_TOKEN: token,
                        iddoc: id_doc,
                        user: user,
                        json: newvalues
                    },
                    type: 'POST',
                    success: function (response) {
                        notifier(messages("Mise à jour de l'annotation réussie."),"success");
                        $('wave region').remove();
                        //refreshContent(id_doc);
                        if(typeAnnotation == "transcription"){
                            refreshAnnotations();
                        }
                        //refreshPreview();
                        checkMissingAnnotations();
                    },
                    error: function (resultat, statut, erreur) {
                        notifier(messages("Erreur lors de la mise à jour de l'annotation (updateAnnotation).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");

                    }
                });

                $(this).removeClass('save-edit-annotation');
                $(this).find('.save').removeClass('save').addClass('pencil');

                inputText.attr('disabled', 'disabled');
                inputLang.attr('disabled', 'disabled');
                $(this).parent().find('.ui.dropdown').dropdown('destroy');

                $(this).next('.cancel-edition').remove();

            }

        });

        //IHM : boutons de MAJ des position audio
        $('.button.edit-audio').bind('click', function () {

            var idAnnotation = $(this).parent().parent().parent().attr('id-selection');
            var typeAnnotation = $('.title[id-selection="'+idAnnotation+'"]').attr('typeannotation');

            var spInput = $(this).parent().find('.input.audio > .start');
            var sp = spInput.val();

            var epInput = $(this).parent().find('.input.audio > .end');
            var ep = epInput.val();


            if (!$(this).hasClass('save-edit-annotation')) {
                $('.edit-audio.save-edit-annotation').removeClass('save-edit-annotation').find('.save').removeClass('save').addClass('pencil');
                //on rentre en mode édition
                $(this).addClass('save-edit-annotation');
                $(this).find('.pencil').removeClass('pencil').addClass('save');

                spInput.removeAttr('disabled');
                epInput.removeAttr('disabled');

                if((parseFloat(spInput)===0 && parseFloat(epInput)===0) || (spInput==="" && epInput==="")){
                    spInput.val($('#startPosition').val());
                    epInput.val($('#endPosition').val());
                }

                $(this).after('<div class="button cancel-edition ui icon"><i class="blue icon undo"></i></div>');

                $('.button.cancel-edition').bind('click',function(){
                    $(this).parent().find('.save').removeClass('save').addClass('pencil');
                    $(this).parent().find('.save-edit-annotation').removeClass('save-edit-annotation');

                    $.each(o_Currentdocument.annotations.sentences, function(){
                        if(typeAnnotation == "sentence"){
                            if(this.id == idAnnotation){
                                spInput.val(this.startPosition);
                                epInput.val(this.endPosition);
                            }
                        }else{
                            $.each(this.children, function(){
                                if(this.id == idAnnotation){
                                    spInput.val(this.startPosition);
                                    epInput.val(this.endPosition);
                                }
                            });
                        }
                        
                    });        

                    spInput.attr('disabled', 'disabled');
                    epInput.attr('disabled', 'disabled');
                    $(this).remove();
                });

            } else {
                //on enregistre les modifications
                newvalues = Annotation2Json(idAnnotation);

                $.ajax({
                    url: "updateAnnotation",
                    data: {
                        YII_CSRF_TOKEN: token,
                        iddoc: id_doc,
                        user: user,
                        json: newvalues
                    },
                    type: 'POST',
                    success: function (response) {
                        notifier(messages("Mise à jour de l'annotation réussie."),"success");
                        $('wave region').remove();
                        //refreshContent(id_doc);
                        //refreshPreview();
                        checkMissingAnnotations();
                    },
                    error: function (resultat, statut, erreur) {
                        notifier(messages("Erreur lors de la mise à jour de l'annotation (updateAnnotation).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");

                    }
                });

                $(this).removeClass('save-edit-annotation');
                $(this).find('.save').removeClass('save').addClass('pencil');

                spInput.attr('disabled', 'disabled');
                epInput.attr('disabled', 'disabled');
                
                $(this).next('.cancel-edition').remove();
            }

        });

        //IHM : boutons de MAJ des positions area image
        $('.button.edit-image').bind('click', function () {
            //TODO : il faut autant de div_preview que de sélections
            var that = this;
            var div_preview;

            if($(this).parent().find('.input.image > div').length != 0){
                div_preview = $(this).parent().find('.input.image > div');
            }else{
                div_preview = $('<div></div>');
                div_preview.css('display','block');
                div_preview.css('position','relative');
                div_preview.css('padding','0px');
                $(this).parent().find('.input.image').append(div_preview);              

            }
            

            var idAnnotation = $(this).parent().parent().parent().attr('id-selection');
            var selected_areas = new Array();

            var div_bloc =$('[id-selection="'+idAnnotation+'"]:first');

            $.each(o_imgAreaSelect.getSelections(), function () {
                selected_areas.push({
                    image: $('.images-tab a.item.active').attr('image'),
                    area: this
                });
            });


            if (!$(this).hasClass('save-edit-annotation')) {
                $('.edit-image.save-edit-annotation').removeClass('save-edit-annotation').find('.save').removeClass('save').addClass('pencil');
                //on rentre en mode édition
                $(this).addClass('save-edit-annotation');
                $(this).find('.pencil').removeClass('pencil').addClass('save');

                $(this).after('<div class="button cancel-edition ui icon"><i class="blue icon undo"></i></div>');
                $('.button.cancel-edition').bind('click',function(){
                    $(this).parent().find('.save').removeClass('save').addClass('pencil');
                    $(this).parent().find('.save-edit-annotation').removeClass('save-edit-annotation');
                                   
                    $(this).remove();
                });

            } else {
                if(selected_areas.length > 0){

                    $(this).parent().find('.input.image > div').remove();

                    $.each(selected_areas,function(){
                        var x1 = this.area.x1;
                        var y1 = this.area.y1;
                        var x2 = this.area.x2;
                        var y2 = this.area.y2;

                        var w = x2 - x1;
                        var h = y2 - y1;
                        var padding = isNaN(parseInt($('.ui.tab.segment.active').css('padding-top'))) ? 0 : parseInt($('.ui.tab.segment.active').css('padding-top'));

                        var x12 = x1 + padding;
                        var y12 = y1 + padding;
                        //     
                        
                        var div_preview;

                        div_preview = $('<div></div>');
                        div_preview.css('display','block');
                        div_preview.css('position','relative');
                        div_preview.css('padding','0px');
                        $(that).parent().find('.input.image').append(div_preview);              
   
                        //

                        //var path_doc = window.location.href.split('index.php')[0]+ "documents/"+user+"/"+o_Currentdocument.id+"/";
                        div_preview.css('background-image','url('+$('.images-tab .tab.active img').attr('src')+')');
                        div_preview.attr('x1',x12);
                        div_preview.attr('y1',y12);
                        div_preview.attr('h',h);
                        div_preview.attr('w',w);
                        div_preview.attr('image',this.image);
                        div_preview.css('background-position-x','-'+x12+'px');
                        div_preview.css('background-position-y','-'+y12+'px');


                        div_preview.css('width',w);
                        div_preview.css('height',h);
                    });

                    

                    div_bloc.attr('x1',selected_areas[0].x1);
                    div_bloc.attr('y1',selected_areas[0].y1);
                    div_bloc.attr('h',selected_areas[0].h);
                    div_bloc.attr('w',selected_areas[0].w);
                    div_bloc.attr('image',selected_areas[0].image);



                    //on enregistre les modifications
                    newvalues = Annotation2Json(idAnnotation);

                    $.ajax({
                        url: "updateAnnotation",
                        data: {
                            YII_CSRF_TOKEN: token,
                            iddoc: id_doc,
                            user: user,
                            json: newvalues
                        },
                        type: 'POST',
                        success: function (response) {
                            notifier(messages("Mise à jour de l'annotation réussie."),"success");
                            $('wave region').remove();
                            //refreshContent(id_doc);
                            //refreshAnnotations();
                            //refreshPreview(); put only on preview click, not performant at each update
                            checkMissingAnnotations();
                            o_imgAreaSelect.cancelSelections();
                        },
                        error: function (resultat, statut, erreur) {
                            notifier(messages("Erreur lors de la mise à jour de l'annotation (updateAnnotation).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");

                        }
                    });

                    $(this).removeClass('save-edit-annotation');
                    $(this).find('.save').removeClass('save').addClass('pencil');

                }

                $(this).parent().find('.cancel-edition').click();

            }

        });

        //$('#annotations-sentences .title').bind('mouseover', function() {
        $('[id^="annotations-"] .title').bind('mouseover', function () {
            ////console.log('mouseover');

            //var padding = parseInt($('.ui.tab.segment.active').css('padding'));
            //BUG FIXED 04/09/2015 : comportement different entre Chrome et Firefox
            var padding = isNaN(parseInt($('.ui.tab.segment.active').css('padding-top'))) ? 0 : parseInt($('.ui.tab.segment.active').css('padding-top'));

            var x1 = parseInt($(this).attr('x1')) + padding;
            var y1 = parseInt($(this).attr('y1')) + padding;
            var w = parseInt($(this).attr('w'));
            var h = parseInt($(this).attr('h'));
            var image = $(this).attr('image');


            if ($('.images-tab .item.active').attr('image') == image) {

                $('div#maskCurrentSelection').css('left', x1);
                $('div#maskCurrentSelection').css('top', y1);
                $('div#maskCurrentSelection').css('width', w);
                $('div#maskCurrentSelection').css('height', h);
                $('div#maskCurrentSelection').css('display', 'block');
            }

        });

        $('[id^="annotations-"] .input.image a').bind('mouseover', function(){
            var padding = isNaN(parseInt($('.ui.tab.segment.active').css('padding-top'))) ? 0 : parseInt($('.ui.tab.segment.active').css('padding-top'));

            var x1 = parseInt($(this).attr('x1')) + padding;
            var y1 = parseInt($(this).attr('y1')) + padding;
            var w = parseInt($(this).attr('w'));
            var h = parseInt($(this).attr('h'));
            var image = $(this).attr('image');


            if ($('.images-tab .item.active').attr('image') == image) {

                $('div#maskCurrentSelection').css('left', x1);
                $('div#maskCurrentSelection').css('top', y1);
                $('div#maskCurrentSelection').css('width', w);
                $('div#maskCurrentSelection').css('height', h);
                $('div#maskCurrentSelection').css('display', 'block');
            }
        });

        //$('#annotations-sentences .title').bind('mouseout', function() {
        $('[id^="annotations-"] .title').bind('mouseout', function () {
            ////console.log('mouseout');
            $('div#maskCurrentSelection').css('display', 'none');
        });

        $('[id^="annotations-"] .input.image a').bind('mouseout', function () {
            ////console.log('mouseout');
            $('div#maskCurrentSelection').css('display', 'none');
        });

        $('.play-selection').bind('click', function () {
            //var start = $(this).parent().parent().attr('startposition');
            //var end = $(this).parent().parent().attr('endposition');
            //31/01/2016 POUR LECTURE LIVE SANS RECHARGEMENT (PLUS LOGIQUE)
            if($(this).hasClass('stop')){
                $(this).removeClass('stop');
                $(this).find('i').removeClass('stop').addClass('play');
                wavesurfer.pause();
            }else{
                $(this).addClass('stop');
                $(this).find('i').removeClass('play').addClass('stop');

                var start = parseFloat($(this).parent().find('input.audio.start').val());
                var end = parseFloat($(this).parent().find('input.audio.end').val());
                wavesurfer.play(start, end);
            }

        });

        // suppression de la sélection complète : positionnement image+audio et annotations
        $('.delete-selection').bind('click', function () {
            var motphrase;
            var id_selection = $(this).parent().attr('id-selection');

            /*if ($(this).parent().parent().attr('id') == 'annotations-sentences') {
                motphrase = 'phrase';
            } else {
                motphrase = 'mot';
            }
            */

            //13/02/2017 : TODO (not important) replace typeannotation by typeselection IN THIS CASE 
            //--> typeannotation enable to distinguish between translation and transcription
            //--> typeselection between sentence and word

            motphrase = $('.title[id-selection="'+id_selection+'"]').attr('typeannotation');


            $('.basic.modal').find('.header').html(messages("Supprimer"));
            $('.basic.modal').find('.content .right').html(messages("Supprimer la sélection ?"));

            $('.basic.modal').modal('setting', {
                closable: false,
                onDeny: function () {
                    //return false;
                },
                onApprove: function () {

                    $.ajax({
                        //url: "delSelection",
                        url: "deleteSelection",
                        data: {
                            YII_CSRF_TOKEN: token,
                            iddoc: o_Currentdocument.id,
                            user: user,
                            idselection: id_selection,
                            motphrase: motphrase
                        },
                        type: 'POST',
                        success: function (response) {
                            //console.log(response);
                            notifier(messages("Suppression de la sélection réussie."),"success");

                            $.each(o_Currentdocument.annotations.sentences, function(id){

                                var that = this;

                                if(motphrase == 'sentence'){
                                    
                                    if(this.id == id_selection){

                                        o_Currentdocument.annotations.sentences.splice(id,1);
                                        refreshAnnotations(o_Currentdocument);
                                        
                                    }
                                }else{
                                    $.each(that.children,function(idw){
                                        if(this.id == id_selection){
                                            o_Currentdocument.annotations.sentences[id].children.splice(idw,1);
                                            refreshAnnotations(o_Currentdocument);
                                            //refreshPreview(o_Currentdocument);
                                        }   
                                    });
                                }
                            });
                            
                        },
                        error: function (resultat, statut, erreur) {
                            //sinon on le crée
                            //console.log("suppression en erreur");
                            notifier(messages("Suppression en erreur.")+" "+messages("Veuillez reporter l'incident à l'équipe informatique."),"error");
                        }
                    });
                }
            }).modal('show');


        });

        $("#select-ressources > tbody > tr > td > i.trash").on("click", function () {

            var idresource = $(this).parent().parent().attr("id");
            var typeresource = $(this).parent().parent().attr("type");

            $('#file-to-delete').html(idresource);

            $('.basic.modal').find('.header').html(messages("Supprimer"));
            $('.basic.modal').find('.content .right').html(messages("Supprimer la ressource ?"));

            $('.basic.modal').modal('setting', {
                closable: false,
                onDeny: function () {
                    //return false;
                },
                onApprove: function () {                            
                    $.ajax({
                        //url: "delCrdo",//deprecated in JSON version
                        url: "delResource",
                        data: {
                            YII_CSRF_TOKEN: token,
                            iddoc: id_doc,
                            user: user,
                            idresource: idresource,
                            typeresource: typeresource
                        },
                        type: 'POST',
                        //dataType: 'xml',
                        success: function (response) { 
                            localStorage.setItem('step',$('#steps .step:nth(1)').attr('id'));
                            location.reload();                        
                            notifier(messages("Suppression de la ressource réussie."),"success");

                        },
                        error: function (resultat, statut, erreur) {
                            //sinon on le crée

                            notifier(messages("Erreur lors de la suppression de la ressource (delResource).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");

                        }
                    });
                }
            }).modal('show');
        });
        //$("audio > source").attr("src");
        //refreshAudio();

        checkMissingAnnotations();

    }
//____________________________________________________________________________________
//____________________________________________________________________________________
    // RECUPERATION DES ANNOTATIONS DU DOCUMENT id_doc    
    //deprecated in JSON version
    function refreshContent(id_doc){
        
        var activeTabs = [];
        $('#annotations .title.active').each(function(){
            activeTabs.push($(this).attr('id-selection'));
        });

        
        $.post(
            "getDoc",
            {
                YII_CSRF_TOKEN: token,
                metadata_file: id_doc,
                directory: user
            },
            function (response) {
                o_Currentdocument = $.parseJSON(response);
                refreshAnnotations(o_Currentdocument);
                refreshPreview(o_Currentdocument);
                $.each(activeTabs,function(){
                    $('[id-selection="'+this+'"]').show().addClass('active');
                });
                bindAutocomplete();
            }
        );
    }

//_________________________

//__________________________
//  REFRESH DU PREVIEW
    function refreshPreview(o_document){
        if(o_document == null) o_document = o_Currentdocument;
        //29/01/2016
        var path_doc = window.location.href.split('index.php')[0]+ "documents/"+user+"/"+o_document.id+"/";
        var url_doc = path_doc + o_document.metadata_file;
        var http_url_images = new Array();

        $.each(o_Currentdocument.resources.images,function(){
           var url = path_doc + this.file;
           http_url_images.push({"id":this.id,"url":url});
        });                       

        var strokeColor = "333333"; //!!toujours mettre le code couleur hexadecimal !!
        var strokeWidth = 4;
        var fillColor = "ffffff";
        var fillOpacity = 0.0;

        //$('.eastling').parent().empty().append("<div class='eastling'></div>");
        $('.eastling').parent().children(':not(.eastling,.preview)').remove();

        $('.eastling').eastlingplayer({
            idref: url_doc,
            local:true,
            localDocument:{
                annotations : o_document.annotations.sentences,
                metadata : o_document.metadata,
                url_images : http_url_images,
                url_audio : path_doc + o_document.resources.audio
            },
            strokeColor: strokeColor,
            strokeWidth: strokeWidth,
            fillColor: fillColor,
            fillOpacity: fillOpacity,
            callback:function(){

                $('.map').maphilight();

                $('.eastling').eastlingShape();

                //surlignage de la zone sur survol du mot
                $('.word').bind('mouseover',function(){
                 var link = $(this).attr('link');                        
                 $('#'+link).mouseover();
                 word_highlight($(this),true,strokeWidth,strokeColor);

                }).bind('mouseout',function(){
                    var link = $(this).attr('link');
                    $('#'+link).mouseout();
                    word_highlight($(this),false,'','');

                });

                $('area').bind('mouseover',function(){
                    var link = $(this).attr('id');
                    word_highlight($("[link='"+link+"']"),true,strokeWidth,strokeColor);
                }).bind('mouseout',function(){
                    var link = $(this).attr('id');
                    word_highlight($("[link='"+link+"']"),false,'','');
                });


            }
        });
    }
//____________________________________________________________________________________
//____________________________________________________________________________________
    // RECUPERATION DU DOCUMENT id_doc
    //DEPRECATED IN JSON VERSION 
    function getDoc(id_doc) {

        var nb_error = 0;
        //console.log('getDoc:');
        ////console.log("set dimmer");
        //$("#loading .loader").html('<?php echo Yii::t('general', 'Chargement du document'); ?>');
        $("#loading .loader").html(messages("Chargement du document"));
        
        $("#loading").addClass('active');       
 

        $(".images-tab").empty();
        //$("#images-compo > div[class!=images-tab]").remove();
        $("#images-compo > div:not(.images-tab)").remove();



        $.post(
            "getDoc",
            {
                YII_CSRF_TOKEN: token,
                metadata_file: id_doc,
                user: user

            },
            //type: 'POST',
            //dataType: 'xml',
            function (response) {

                //var o_Currentdocument = $.parseJSON(response);
                o_Currentdocument = $.parseJSON(response);

                ////console.log(['sentences']);

                $("#select-ressources tbody").empty();
                $("#selected-doc").html(" : <b>" + o_Currentdocument['metadata']['crdos'][0]['title']['title'] + "</b>&nbsp;<div class='ui icon green button'><i class='icon download disk'></i></div>");

                //bouton de téléchargement
                $('#selected-doc .button').bind('click', function () {

                    $.ajax({
                        url: 'zipDoc',
                        data: {
                            YII_CSRF_TOKEN: token,
                            metadata_file: $("#select-document > tbody > tr.active").attr('id'),
                            directory: $("#user").val()
                        },
                        type: 'POST',
                        dataType: 'text',
                        success: function (result) {
                            //ZIP SUR LE VRAI FICHIER
                            var url_file = window.location.href.split('index.php')[0]+ "documents/"+user+"/" + result;

                            var link = document.createElement('a');
                            document.body.appendChild(link);
                            link.href = url_file;
                            link.download = $("#select-document > tbody > tr.active").attr('id') + '.zip';
                            link.click();
                            notifier(messages("Création de l'archive réussie."),"success");
                        
                            
                        },
                        error: function (resultat, statut, erreur) {
                            notifier(messages("Erreur lors de la création de l'archive (zipDoc).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");
                        
                        }
                    });
                });

                var cpt_images = 0;
                
                var repertoire = baseUrl+'/documents/' + o_Currentdocument['user'] + '/';
                
                
                var coordGeo = o_Currentdocument['metadata']['crdos'][0].spatial[1].spatial.split(';');
                
                var east = coordGeo[0].split('=')[1];
                var north = coordGeo[1].split('=')[1];
                
                //map.setCenter({ lat: north, lng: east });
                    
                $.each(o_Currentdocument['metadata']['crdos'], function () {

                    var icon_type = '';
                    var that = this; //that -> crdo en cours
                    //02/02/2016
                    //Modification du programme pour importation ancien format Pangloss
                    //Factoriser ???
                    if(this['type']===""){
                        
                        var extImage = new Array('jpg','jpeg','png','tiff','pdf','bmp','gif');
                        var extSound = new Array('mp3','wav','ogg');
                        
                       $.each(this['isFormatOf'], function (i, col) {
                           
                            var filePath = this.split('.'); 
                            var ext = filePath[filePath.length-1].toLowerCase();

                            if($.inArray(ext,extImage)>=0){
                                that['type']='Image';
                            }
                            if($.inArray(ext,extSound)>=0){
                                that['type']='Sound';
                            }
                        }); 
                    }

                    
                    ///////////////////////////////////////////////////////

                    if (this['type'] == 'Sound') {

                        icon_type = 'music';
                        
                        
                        $.each(this['isFormatOf'], function (i, col) {
                            if (col.toLowerCase().indexOf('mp3') >= 0) {
                                file_mp3 = col;
                            } else if (col.toLowerCase().indexOf('wav') >= 0) {
                                file_wav = col;
                            }
                        });
                        
                        //TESTER L'EXISTENCE DU FICHIER ICI
                        //nb_error++; --> rapport d'erreur


                        if (file_mp3 != '') {
                            if(file_mp3.indexOf("http://")>=0){
                                $("#src-mp3").attr("src", file_mp3);
                            }else{
                                $("#src-mp3").attr("src", repertoire + file_mp3);
                            }
                            
                            $("#src-mp3").attr("type", "audio/mpeg");


                        } else {
                            if(file_wav.indexOf("http://")>=0){
                                $("#src-wav").attr("src", file_wav);
                            }else{
                                $("#src-wav").attr("src", repertoire + file_wav);
                            }
                            $("#src-wav").attr("type", "audio/wav");
                        }


                    } else if (this['type'] == 'Image') {
                        icon_type = 'photo';

                        
                        var urls_image = this['isFormatOf'];
                        //OK //console.log(urls_image);
                        var img_id = this['id'];
          
                        $.each(urls_image,function(){
                            //Vérification de l'existence du fichier
                            var that_image = this;
                            images.push(that_image);
                            $.ajax({
                                url: repertoire + that_image, 
                                type: 'get',
                                error: function(XMLHttpRequest, textStatus, errorThrown){
                                    if(XMLHttpRequest.status === 404){
                                       notifier("Fichier image introuvable.","error","tr#"+img_id);
                                       nb_error++;
                                       //console.log()
                                       $("tr#"+img_id).addClass('error');
                                    }
                                },
                                success: function(data){
                                    //images.push(that_image);

                                    cpt_images++;
                                    //var html_tab = '<a class="teal item" data-tab="tab_image_' + cpt_images + '">' + this['identifier'] + '</a>';
                                    var html_tab = '<a class="teal item" data-tab="tab_image_' + cpt_images + '" image="'+that['id']+'">...' + that['id'].slice(-12) + '</a>';
                                    var html_div = '<div class="ui tab segment" style="position:relative;" data-tab="tab_image_' + cpt_images + '">';
                                    html_div += '<div id="maskCurrentSelection" style="display:none;float: left;position: absolute;left: 59px;top: 150px;width: 934px;height: 76px;background-color: rgba(110,207,245,0.3);"></div>';
                                    html_div += '<img src="' + repertoire + that_image + '" id="' + that['id'] + '" />';
                                    //html_div += '<map name="map_' + this['id'] + '" id="map_' + this['id'] + '" href="#"></map>';
                                    html_div += '</div>';
                                    $(".images-tab").append(html_tab);
                                    $(".images-tab").after(html_div);
                                }
                            });
                        });


                    } else if (this['type'] == 'Text') {
                        icon_type = 'file outline';
                        var name_file = this['identifier'];
                        var id_file = this['id'];
                        
                        $.ajax({
                            url: repertoire + name_file, 
                            type: 'get',
                            error: function(XMLHttpRequest, textStatus, errorThrown){
                                if(XMLHttpRequest.status === 404){
                                   notifier("Fichier d'annotation introuvable.","error","tr#"+id_file);
                                   nb_error++;
                                   $("tr#"+id_file).addClass('error');
                                }
                            },
                            success: function(data){
                                
                            }
                        });
                    }

                    var html_crdo = '<tr id="' + this['id'] + '">';
                    html_crdo += '<td>' + this['id'] + '</td>';
                    html_crdo += '<td>' + this['type'] + ' <i class="icon ' + icon_type + '"></i></td>';
                    html_crdo += '<td>';
                    /*html_crdo += '<i class="icon blue edit"></i>';*/
                    
                    ////console.log(this['type'].trim());
                    
                    if (this['type'].trim()==="Sound" || this['type'].trim()==="Image") {
                        html_crdo += '<i class="icon red trash"></i>';
                    }
                    
                    html_crdo += '</td>';
                    html_crdo += '</tr>';
                    $("#select-ressources > tbody").append(html_crdo);
                    //$("#fieldset-ressources > label").append("<a style='display:inherit;'>" + this['id'] + "</a>");
                });

                $('#metadata .ui.form').empty();
                $('#annotations-sentences').empty();
                $('#annotations-words').empty();
                $('.imgareaselect-box').remove();
                $('.imgareaselect-closebtn').remove();

                //$('map[name^="map_"]').empty();
                
                refreshContent(id_doc);

                if (file_mp3 !== '') {
                    //console.log(file_mp3+ ' audio loading wavesurfer');
                    if(file_mp3.indexOf("http://")>=0){                        
                        wavesurfer.load(file_mp3);
                    }else{
                        var repertoire = baseUrl+'/documents/' + o_Currentdocument['user'] + '/';                        
                        wavesurfer.load(repertoire + file_mp3);
                    }

                }

            }

        ).done(function(){
            //console.log("remove dimmer");
            $("#loading").removeClass('active');
        });

        

    }

    //CURRENT : ajout d'un mot à une phrase
    function addSelectionToDOM(parameters){

        var motphrase = (parameters.motphrase == "phrase") ? 'S' : 'W' ;
        var prefixId = o_Currentdocument.id.replace('crdo-','');

        var idMax = 0;
        var idSentenceMax = 0;
        var idWordMax = 0;

        var newId = prefixId + '_' + motphrase;

        $('#annotations-sentences > div > .title').each(
            function(){
                id = parseInt($(this).attr('id-selection').substr(prefixId.length+2));
                idSentenceMax = (id > idSentenceMax)?id:idSentenceMax;
            }
        );

        $('.words > div > .title').each(
            function(){
                id = parseInt($(this).attr('id-selection').substr(prefixId.length+2));
                idWordMax = (id > idWordMax)?id:idWordMax;
            }
        ); 

        if(o_Currentdocument.hasOwnProperty('annotations')){
            //on récupère le dernier id disponible
            if(motphrase == 'S'){
                idMax = idSentenceMax;
            }else{
                idMax = idWordMax;
            }

            //digit = ("000" + (idMax+1)).slice(-3);
            digit = idMax+1;
            newId += digit;   
            

        }else{
            o_Currentdocument.annotations = {};
            o_Currentdocument.annotations.sentences = [];
            //newId += '001';
            newId += '1';
            
        }

        //10/02/2017
        //MOT à MOT
        var arrayMots = [];

        if(motphrase == 'S'){
            var mots = parameters.transcriptions[0].transcription.split(' ');
        
            $.each(mots,function(){
                idWordMax++;
                //digit = ("000" + (idWordMax+1)).slice(-3);
                digit = idWordMax+1;
                var idWord = prefixId + '_W' + digit;
                arrayMots.push({
                    id: idWord,
                    startPosition: parameters.startPosition,
                    endPosition: parameters.endPosition,
                    areas: [],
                    traductions: [],
                    transcriptions: [{'lang':parameters.transcriptions[0].lang,'transcription':this}]
                    });


            });
        }
        
        //

        var annotation = {
            id: newId,
            startPosition: parameters.startPosition,
            endPosition: parameters.endPosition,
            areas: parameters.selectedAreas,
            traductions: parameters.traductions,
            transcriptions: parameters.transcriptions,
            children: arrayMots
        };

        console.log(annotation);

        if(motphrase == 'S'){
            o_Currentdocument.annotations.sentences.push(annotation);
        }else{
            //o_Currentdocument.annotations.sentences.push(annotation);
            $.each(o_Currentdocument.annotations.sentences,function(){
                if(this.id == parameters.idParent){
                    this.children.push(annotation);
                }
            });
        }

        refreshAnnotations();

    }

function addInfoRessource(ressource){
    var html_crdo = '<tr id="' + ressource['id'] + '" type="'+ressource['type']+'">';
    html_crdo += '<td>' + ressource['id'] + '</td>';
    html_crdo += '<td>' + ressource['type'] + ' <i class="icon ' + ((ressource['type']=="image")?'photo':'music') + '"></i></td>';
    html_crdo += '<td>';

    if (ressource['type'].trim()==="audio" || ressource['type'].trim()==="image") {
        html_crdo += '<i class="icon red trash"></i>';
    }
    
    html_crdo += '</td>';
    html_crdo += '</tr>';
    $("#select-ressources > tbody").append(html_crdo);
}

function progressCompute(toload,loaded){
    var totalToLoad = 0;
    var totalLoaded = 0;
    var progressRate = 0;
    
    $.each(toload,function(im){                           
        totalToLoad += toload[im];
        totalLoaded += loaded[im];
    });

    progressRate = (totalLoaded/totalToLoad)*100;

    if(progressRate == 100) $("#loading").removeClass('active');

    return progressRate;

}

var fileids = [];
var toload = [];
var loaded = [];

//13/11/2016 : get everything about a document to the DOM : meta (todo), annotations, resources (audio+images)
function getDocument(){

    var filepath = baseUrl+'/documents/'+user+'/'+o_Currentdocument.id+'/';
    var cpt_images = 0;
    var nb_files = 0;

    fileids = [];
    toload = [];
    loaded = [];

    $('#annotations-sentences').empty();
    $('#metadata-data').empty();
    $("#select-ressources > tbody").empty();
    $("#images-compo").empty();
    wavesurfer.empty(); //ignoré, why??

    if(o_Currentdocument.hasOwnProperty('resources')){
        if(o_Currentdocument.resources.hasOwnProperty('images') && (o_Currentdocument.resources.images.length > 0)){

            nb_files = o_Currentdocument.resources.images.length;

            var div_image_tab = $('<div class="images-tab ui pointing secondary menu"></div>');
            //get images
            $.each(o_Currentdocument.resources.images,function(){

                var that = this;
                var that_image = this.file;
                images.push({id:this.id,file:this.file});

                addInfoRessource({id:this.id,type:"image"});

                cpt_images++;

                //toload[that.id] = 0;loaded[that.id] = 0; 
                fileids.push(that.id);
                toload.push(100000);
                loaded.push(0);
                

                var active = (cpt_images==1) ? "active":"";

                var dom_tab_item = $('<a class="teal '+ active +' item" data-tab="tab_image_' + cpt_images + '" image="'+that.id+'">...' + that.id.slice(-12) + '</a>');
                var dom_segment = $('<div class="ui tab segment '+ active +'" style="position:relative;" data-tab="tab_image_' + cpt_images + '"></div>');
                var dom_mask = $('<div id="maskCurrentSelection" style="display:none;float: left;position: absolute;left: 59px;top: 150px;width: 934px;height: 76px;background-color: rgba(110,207,245,0.3);"></div>');
                var dom_img = $('<img src="' + filepath + that_image + '" id="' + that.id + '" />');

                dom_img.load(function() {

                    if(that.id == fileids[0]){
                        o_imgAreaSelect = $('#images-compo [data-tab=tab_image_1] img').imgAreaSelect({
                            instance: true,
                            handles: true,
                            fadeSpeed: 200,
                            parent: $('#images-compo'),
                            onSelectEnd: preview
                        });
                    };
                
                    $(".images-tab .item").bind("click", function () {
                    //$(document).bind("click",".images-tab .item", function () {

                        $(".images-tab .item").removeClass("active");
                        var that = $(this);
                        var id_img = that.attr('data-tab');
                        that.tab('deactivate all')
                                .tab('activate tab', id_img)
                                .tab('activate navigation', id_img)
                                ;

                        var indice = $(this).attr('data-tab');

                        //console.log(indice);

                        o_imgAreaSelect.cancelSelections();
                        o_imgAreaSelect.remove();

                        o_imgAreaSelect = $('#images-compo [data-tab="' + indice + '"] img').imgAreaSelect({
                            instance: true,
                            handles: true,
                            fadeSpeed: 200,
                            parent: $('#images-compo'),
                            onSelectEnd: preview
                        });
                    });

                    $.each(fileids,function(im){
                        if(fileids[im] == that.id){
                            //toload[im] = e.total;
                            loaded[im] = 100000; 
                        }
                    });

                    $('progress').val(progressCompute(toload,loaded));
                });
                //TODO: OPTIMISER CAR 2 chargement pas image : XHR + IMG REQUEST SEE NETWORK ACTIVITY) var dom_img = $('<test />');
                
                dom_segment.append(dom_mask).append(dom_img);

                if(div_image_tab.find('.item').length > 0){
                    div_image_tab.find('.item:last').after(dom_tab_item);
                }else{
                    div_image_tab.append(dom_tab_item);
                }
                div_image_tab.append(dom_segment);
                
                        
                        ////////
                /*
                $.ajax({
                    url: filepath + that_image, 
                    type: 'get',
                    error: function(XMLHttpRequest, textStatus, errorThrown){
                        if(XMLHttpRequest.status === 404){
                           notifier("Fichier image introuvable.","error","tr#"+this.id);
                           nb_error++;
                           //console.log()
                           $("tr#"+this.id).addClass('error');
                        }
                    },
                    success: function(data){
                        //console.log(this);
                        //: jquery object style code

                        if(cpt_images==1){
                            o_imgAreaSelect = $('#images-compo [data-tab=tab_image_1] img').imgAreaSelect({
                                instance: true,
                                handles: true,
                                fadeSpeed: 200,
                                parent: $('#images-compo'),
                                onSelectEnd: preview
                            });
                        }
                        
                        $(".images-tab .item").bind("click", function () {
                        //$(document).bind("click",".images-tab .item", function () {

                            $(".images-tab .item").removeClass("active");
                            that = $(this);
                            var id_img = that.attr('data-tab');
                            that.tab('deactivate all')
                                    .tab('activate tab', id_img)
                                    .tab('activate navigation', id_img)
                                    ;

                            var indice = $(this).attr('data-tab');

                            console.log(indice);

                            o_imgAreaSelect.cancelSelections();
                            o_imgAreaSelect.remove();

                            o_imgAreaSelect = $('#images-compo [data-tab="' + indice + '"] img').imgAreaSelect({
                                instance: true,
                                handles: true,
                                fadeSpeed: 200,
                                parent: $('#images-compo'),
                                onSelectEnd: preview
                            });
                        });

                    }
                });
                */
            });


            $("#images-compo").append(div_image_tab);
        }else{

        }
        
        if(o_Currentdocument.resources.hasOwnProperty('audio') && (o_Currentdocument.resources.audio !== "")){
            //get audio
            nb_files++;
            fileids.push(o_Currentdocument.resources.audio);
            toload.push(1000000);
            loaded.push(0);

            wavesurfer.load(filepath+o_Currentdocument.resources.audio);
            addInfoRessource({id:o_Currentdocument.resources.audio,type:"audio"});
        }

    }

    if(nb_files==0){
        $("#loading").removeClass('active');
    }

    if(o_Currentdocument.hasOwnProperty('annotations')){
        //get annotations
        refreshAnnotations(); 
    }else{
        displayMetadata(o_Currentdocument.metadata, $('#metadata-data'),"rgba(0,0,0,0.2)","dashed");
    }  
}
//____________________________________________________________________________________
//____________________________________________________________________________________
    // RAFRAICHISSEMENT DE LA LISTE DES DOCUMENTS DE L'UTILISATEUR POUR LA LANGUE SELECTIONNEE

    function refreshDocLang(langue) {

        //console.log('refreshDocLang:');

        $("#select-document tbody").empty();
        $("#select-langue tbody").empty();
        $("#select-ressources tbody").empty();

        $("#step0Next").hide();

        $("#stepDesc1").addClass("disabled");
        $("#stepDesc2").addClass("disabled");
        $("#stepDesc3").addClass("disabled");


        $.each(documents, function () {
            /*var json_document = JSON.stringify(this);
             var document = $.parseJSON(json_document);*/
        
             //CORRECTION EVOL Plusieurs sujets dans un doc (27/05/2015)
             var langues_doc = new Array();
            $.each(this.metadata.subject,function(){
                langues_doc.push(this.codelang);
            });
            

            //if (this.metadata.crdos[0].subject.codelang == langue) {
            if ($.inArray(langue,langues_doc) !== -1) {
                
                var htmlToAppend = '<tr id="' + this.id + '">';
                htmlToAppend += '<td class="ui accordion">';


                htmlToAppend += '<div class="title">';
                htmlToAppend += '<i class="dropdown icon"></i>';
                htmlToAppend += this.metadata.title.title;
                htmlToAppend += '</div>';

                htmlToAppend += '<div class="content ui small message info">';
                htmlToAppend += '<p>'+messages("fichier")+' : ' + this.id + '</p>';

                $.each(this.metadata.contributors, function () {
                    if (this.code == "speaker")
                        htmlToAppend += '<p>'+messages("locuteur")+' : ' + this.contributor + '</p>';
                });

                if(this.hasOwnProperty('resources')){
                    if(this.resources.hasOwnProperty('images')){
                        $.each(this.resources.images, function () {
                            htmlToAppend += '<p>' +messages("ressource") +' : <i class="ui icon photo"></i> ' + this.id + '</p>';          
                        });
                    }
                    
                    if(this.resources.hasOwnProperty('audio')){
                        htmlToAppend += '<p>' +messages("ressource") +' : <i class="ui icon music"></i> ' + this.resources.audio + '</p>';
                    }
                }

                

                htmlToAppend += '</div>';

                htmlToAppend += '</td>';
                //htmlToAppend += '<td>' + this.metadata.crdos[0].datestamp + '</td>';
                htmlToAppend += '<td>';

                htmlToAppend += '<a class="ui"><i class="ui red icon trash"></i></a>';
                htmlToAppend += '<a class="ui action-select-document" idDoc="' + this.id + '"><i class="ui icon check"></i></a>';
                htmlToAppend += '</td></tr>';

                $("#select-document > tbody").append(htmlToAppend);

                $("#select-document tbody .ui.trash").bind("click", function () {
                    //var token = "<?php echo Yii::app()->request->csrfToken; ?>";
                    var id_doc = $(this).parent().parent().parent().attr('id');

                    $('.basic.modal').find('.header').html(messages("Supprimer"));
                    $('.basic.modal').find('.content .right').html(messages("Supprimer le document ? (les ressources associées seront également supprimées)"));

                    $('.basic.modal').modal('setting', {
                        closable: false,
                        onDeny: function () {
                            //return false;
                        },
                        onApprove: function () {
                            $.ajax({
                                url: "deleteDocument",
                                data: {
                                    YII_CSRF_TOKEN: token,
                                    iddoc: id_doc,
                                    user: user
                                },
                                type: 'POST',
                                success: function (response) {
                                    //console.log(response);
                                    location.reload();
                                    notifier(messages("Suppression du document réussie."),"success");
                           
                                    //refreshUserDoc(token);
                                },
                                error: function (resultat, statut, erreur) {
                                    //sinon on le crée
                                    notifier(messages("Erreur lors de la suppression du document (delDoc).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");
                           
                                }
                            });
                        }
                    }).modal('show');


                });

                $('.images-doc.menu .item')
                        .tab('deactivate all')
                        .tab('activate tab', 'third')
                        .tab('activate navigation', 'third')
                        ;
            }

        });

        $('.ui.accordion').accordion();

        //$("#select-document > tbody > tr").bind("click", function () {
        $(".action-select-document").bind("click", function () {
            alert(messages('Le document va se charger. Cela peut prendre plusieurs secondes à minutes selon le nombre et la taille des fichiers. Merci de patienter.'));
            //$('#loading').show();
            $("#loading").addClass('active'); 

            $('#metadata-data').empty();
            
            $("#newdoc").hide();
            var id_doc = $(this).attr('idDoc');

            $("#uploaded-document").val(id_doc);
            $("#import-iddoc").val(id_doc);

            $("#select-document > tbody > tr").removeClass("active");
            $(this).parent().parent().addClass("active");
            //console.log(id_doc);

            localStorage.setItem('document', id_doc);
            currentDocument = id_doc;

            $("#step0Next").show();
            $("#stepDesc1").removeClass("disabled");
            $("#stepDesc2").removeClass("disabled");
            $("#stepDesc3").removeClass("disabled");
            

            //getDoc(id_doc);

            $.each(documents,function(){
                //if(this['metadata_file']==id_doc)
                if(this['id']==id_doc){
                    $("#loading .loader").html(messages("Chargement en cours"));
                    o_Currentdocument = this;
                    getDocument();
                    //$("#loading").removeClass('active');

                }
            });


            $("#selected-doc").html(o_Currentdocument.metadata.title.title + "</b>&nbsp;<div class='ui icon green button'><i class='icon download disk'></i></div>");

            //bouton de téléchargement
            $('#selected-doc .button').bind('click', function () {

                $.ajax({
                    url: 'zipDoc',
                    data: {
                        YII_CSRF_TOKEN: token,
                        iddoc: id_doc,
                        user: user
                        /*metadata_file: $("#select-document > tbody > tr.active").attr('id'),
                        directory: $("#user").val()
                        */

                    },
                    type: 'POST',
                    dataType: 'text',
                    success: function (result) {
                        // ZIP SUR LE VRAI FICHIER
                        var url_file = window.location.href.split('index.php')[0]+ "documents/"+user+"/"+id_doc+"/"+result;

                        var link = document.createElement('a');
                        document.body.appendChild(link);
                        link.href = url_file;
                        link.download = $("#select-document > tbody > tr.active").attr('id') + '.zip';
                        link.click();
                        notifier(messages("Création de l'archive réussie."),"success");
                    
                        
                    },
                    error: function (resultat, statut, erreur) {
                        notifier(messages("Erreur lors de la création de l'archive (zipDoc).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");
                    
                    }
                });
            });
            /*$.each(activeTabs,function(){
                $('[id-selection="'+this+'"]').show().addClass('active');
            });*/
            bindAutocomplete();

            //getJSON(id_doc.replace('metadata_','').replace('.xml',''),user);
            ////////////////
            $('#selected-doc').show();
            //$('#selected-doc').css('display','block');
            //$("#loading").removeClass('active');

        });
        
             
        if($('#identifier-doc').html().length > 0){
            //console.log('select on ' + $('#identifier-doc').html())
            $("#metadata_" + $('#identifier-doc').html()).click();
        }
        
        return true;
    }

//____________________________________________________________________________________
//____________________________________________________________________________________
    // RAFRAICHISSEMENT DE LA PAGE EN FONCTION DE L'UTILISATEUR

    function refreshUserDoc(token) {
        //console.log('refreshUserDoc:');
        var res = false;
        //Récupération de la liste des documents de l'utilisateur
        //return $.post('getListDocUser',{YII_CSRF_TOKEN: token,user: user},
        return $.post('getListJSON',{YII_CSRF_TOKEN: token,user: user},
            function (result) {

                documents.length = 0;
                langues_user.length = 0;
                $("#select-document tbody").empty();
                $("#select-langue").empty();
                $("#select-langue").parent().find("div.text").empty();
                $("#selected-doc").empty();

                var data = jQuery.parseJSON(result);
                // ON AFFICHE LES DOCUMENTS DE L'UTILISATEUR DANS LA LISTE
                $.each(data, function (index, document) {
                    if(document){
                        //console.log(document);
                        $.each(document['metadata']['subject'],function(index,subject){
                            langues_user.push({"codelang":this['codelang'],"subject":this['subject']});
                        });
                        
                        //langues_user.push(document['crdos'][0]['subject']['codelang']);
                        
                        documents.push(document);
                    }

                });

                langues_user = $.unique(langues_user);
                langues_user.sort();
                
                
                $.each(langues_user, function () {  
                    var active_item="";
                    if(this['codelang'] == currentLangue){ 
                        //console.log(currentLangue);
                        active_item = " active";
                    }
                    $("#select-langue").append('<div class="item'+active_item+'" data-value="' + this['codelang'] + '">' + this['subject'] + '</div>');
                });
                
                $("#select_subject").dropdown('setting','onChange',function (val) {
                   
                    currentLangue = val;
                    localStorage.setItem('langue',val);
                    refreshDocLang(val);

                });
                
                //Pour charger automatiquement le document en cours de travail
                //console.log(currentDocument);
                $("#select_subject").dropdown('set selected',currentLangue);
                $("#select-langue .item.active").click();
                $('#select-document tr[id="'+currentDocument+'"]').click(); 
                //
                
                $("[id='"+localStorage.getItem('step')+"']").click();
                
                $('table').tablesort();
                //$("#select-langue").change();
                res = true;
            }
            
        ).promise();

        
    }

function getAnnotationsFromUser(div){
    var result = new Object;
    result.id = div.attr('id-selection');
    var div_recording = div.children('.recording');
    var div_image = div.children('.image');
    var div_transcriptions = div.children('.transcriptions');
    var div_traductions = div.children('.traductions');

    //audio data
    var audio_start = div_recording.find('.audio.start').val();
    var audio_end = div_recording.find('.audio.end').val();
    result.startPosition = audio_start;
    result.endPosition = audio_end;

    //image data
    var image = div_image.find('.image > div').attr('image');
    var x1 = parseInt(div_image.find('.image > div').attr('x1'));
    var y1 = parseInt(div_image.find('.image > div').attr('y1'));
    var w = parseInt(div_image.find('.image > div').attr('w'));
    var h = parseInt(div_image.find('.image > div').attr('h'));
    var x2 = x1 + w;
    var y2 = y1 + h;
    /*
    result.x1 = x1;
    result.y1 = y1;
    result.w = w;
    result.h = h;
    */
    result.areas = new Array();
    result.areas.push({
        image:image,
        x1:x1,
        y1:y1,
        x2:x2,
        y2:y2,
        w:w,
        h:h
    });

    //transcriptions data
    var transcriptions = new Array();
    div_transcriptions.find('.transcription > input').each(function(){
        transcriptions.push({lang:$(this).attr('lang'),transcription:$(this).val()});
    });
    result.transcriptions = transcriptions;

    //traductions data
    var traductions = new Array();
    div_traductions.find('.traduction > input').each(function(){
        traductions.push({lang:$(this).attr('lang'),traduction:$(this).val()});
    });
    result.traductions = traductions;

    return result;

}

function postJSON(parameters){
    $.ajax({           
            url: "storeJSON",
            data: {
                YII_CSRF_TOKEN: token,
                id: parameters.id,
                jsonfile: parameters.jsonfile,
                user: parameters.user,
                content: parameters.content
            },
            //datatype: 'json',
            type: 'POST',
            success: function (response) {
                //notifier(messages("Document enregistré sur le serveur."),"success");  
                //console.log(parameters.jsonfile+".json mis à jour sur le serveur")                                      
            },
            error: function (request, status, error) {
                //BUG AU MOMENT DE LA CREATION D'UN NOUVEAU TJRS MESSAGE ERREUR --> attente d'un format JSON retourné par le serveur ?
                notifier(messages("Erreur lors de la sauvegarde du document (json).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");
                //console.log(error);
                //console.log(request);
            }
        });
}
//TODO function with parameter on sentence ID to update only sentence JSON file
//NOT USED !
function postAllJSON(){
    var result = new Object;
    result.metadata = new Object;
    result.annotations = new Object;

    result.id = currentDocument.split('metadata_')[1].replace('.xml','');
    result.user = user;
    result.annotations.sentences = new Array();

    $('#annotations #annotations-sentences > div > .content').each(function(){
        
        var data = getAnnotationsFromUser($(this));
        //data.words = new Array();
        data.children = new Array();
        var div_words = $(this).find('.words > div > .content');

        div_words.each(function(){
            var data_word = getAnnotationsFromUser($(this));
            data.children.push(data_word);
        });

        result.annotations.sentences.push(data);
    });  

    $.each(result.annotations.sentences,function(){
        postJSON({id: result.id,jsonfile: this.id,user: user,content: this});
    });

    localStorage.setItem('annotations',JSON.stringify(result));
    //console.log(result);
    //console.log(o_Currentdocument);

}
//getJSON reparse le JSON sur le serveur pour prendre en compte les changements de contenu suite à l'ajout de ressources notamment 
function getJSON(id,user){

    $.ajax({                   
        url: "getJSON",
        data: {
            YII_CSRF_TOKEN: token,
            user:user,
            iddoc: id,
            jsonfile: id
        },
        type: 'POST',
        success: function (response) {
            notifier(messages("Document téléchargé."),"success"); 
            o_Currentdocument = JSON.parse(response);   


                getDocument();
                /*$.each(activeTabs,function(){
                    $('[id-selection="'+this+'"]').show().addClass('active');
                });
                */
                bindAutocomplete();
                $("#loading").removeClass('active');

                                                 
        },
        error: function (request, status, error) {
            
            notifier(messages("Erreur lors du téléchargement du document (json).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");
            //console.log(error);
            //console.log(request);
            return false;
        }
    });
}


/////////////////////////////////////////////////////////////////////////////////////////////////
//
//
// DOCUMENT CHARGE
// 
// 
/////////////////////////////////////////////////////////////////////////////////////////////////
$( document ).ajaxStart(function() {
  $("#loading").addClass('active');
});
$( document ).ajaxStop(function() {
  $("#loading").removeClass('active');
});

    $(document).ready(function () {

        //____________________________________________________________________________________
        // AFFICHAGE DU FORMULAIRE D'AJOUT DE RESSOURCE POUR LE DOCUMENT
        $("#btn-refresh-preview").on("click", function () {
            refreshPreview();
        });

        //____________________________________________________________________________________

        $( ".sortable" ).sortable();
        $( ".sortable" ).disableSelection();
        
        //on cache la barre d'édition au début
        $("#audio-compo").toggle();

        //on construit la sidebar pour les annotations
        $('#annotations')
                .sidebar({
                    exclusive: false,
                    onShow: function () {
                        $('#open-annotations').css('right', $(this).width());
                    },
                    onHide: function () {
                        $('#open-annotations').css('right', 0);
                    }
                })
                .sidebar('attach events', '#open-annotations', 'toggle')
                ;
        //on construit la sidebar pour les metadata
        $('#metadata')
                .sidebar({
                    exclusive: false,
                    onShow: function () {
                        $('#open-metadata').css('right', $(this).width());
                    },
                    onHide: function () {
                        $('#open-metadata').css('right', 0);
                    }
                })
                .sidebar('attach events', '#open-metadata', 'toggle')
                ;

        //si un document est sélectionné dans la liste -> $("#select-document  tr.active").length
        $("#loading .loader").html(messages("Chargement du formulaire"));
        $("#loading").addClass('active'); 

        $("#form-compo").formToWizard({
            submitButton: 'Enregistrer',
            //prevLbl:messages("Précédent"),
            //nextLbl:messages("Suivant")
        });
        $("#loading").removeClass('active'); 
        $('#form-compo').show();

        //$("button.next").hide();//A revoir plus tard au moment des annotations
        $("#step0Next").hide();
        
        //par défaut on cache les boutons de suppressions de lignes input
        $('#newdoc .fields .remove').hide();

        $("#form-compo button[id^='step']").on('click', function () {
            if ($("#step2").css('display') == 'block') {
                $("#audio-compo").show();
                wavesurfer.drawBuffer();
            } else {
                $("#audio-compo").hide();
            }

        });

        $("[id^='stepDesc']").on('click', function () {
            localStorage.setItem('step',$(this).attr('id'));
            if ($("#step2").css('display') == 'block') {
                $("#audio-compo").show();
                wavesurfer.drawBuffer();
            } else {
                $("#audio-compo").hide();
            }

        });
  
        jQuery("#upload-wrapper").detach().insertAfter('#btn-add-crdo');
        jQuery("#newdoc").detach().insertAfter('#btn-add-doc');
        jQuery("#import-form").detach().insertAfter('#btn-import-doc');


        user = $("#user").val();
        localStorage.setItem('user', user);


        //var token = "<?php echo Yii::app()->request->csrfToken; ?>";

        $("#uploaded-user").val(user);
        $("#import-user").val(user);

        $("#form-newdoc .field").each(function () {
            $(this).children("input").attr("placeholder", $(this).children("label").html());
            $(this).addClass('ui small input');
        });

        //_______________________________________________________
        // INITIALISATION DU WAVESURFER
        //_______________________________________________________
        
        //DEPRECATED
        /*
        wavesurfer.init({
            container: document.querySelector('#waveform'),
            scrollParent: true,
            minPxPerSec: 200,
            waveColor: 'violet',
            progressColor: 'purple',
            selectionColor: '#ccc',
            height: 100,
            normalize: true
        });
*/
        wavesurfer.on('loading', function (e) {
            //$("#loading .loader").html(messages("Chargement du fichier audio"));
            //console.log(e);
            //$('#progress_audio').attr('value',e);
            //$('progress').max = e.total;
            //$('progress').val($('progress').val() + e);
            loaded[o_Currentdocument.resources.images.length] = e * 10000;
            $('progress').val(progressCompute(toload,loaded));

        });
        
        wavesurfer.on('ready', function () {

            var totalPixels = $('#waveform').width();
            var minRatio = Math.round(totalPixels/wavesurfer.getDuration());
            var maxRatio = Math.round(32000/wavesurfer.getDuration());

            $('#slider').attr('min',minRatio).attr('max',maxRatio);

            timeline.init({
                wavesurfer: wavesurfer,
                container: '#waveform-timeline'
              });

            //$("#loading").removeClass("active");
            //wavesurfer.toggleScroll();
            wavesurfer.enableDragSelection(
                {
                    //'region-created':function(){//console.log(e);},
                    'color':'rgba(0,0,0,0.3)'
                    
                });

            wavesurfer.on('region-created',function(e){
                $('wave region[data-id!="'+$(e.element).attr('data-id')+'"]').remove();
            });
            
            wavesurfer.on('region-updated',function(e){
                ////console.log(e);
                var eid = e.id;
                ////console.log(wavesurfer.regions.list[eid].start);
                $('#startPosition').val(e.start);
                $('#endPosition').val(e.end); 

                $('input.audio.start:enabled').val(e.start);
                $('input.audio.end:enabled').val(e.end);


            });
            
            wavesurfer.on('region-dblclick',function(e){
                e.remove();
            });


        });
        
        wavesurfer.on('pause',function(){
            $('.play-selection i.stop').removeClass('stop').addClass('play');
            $('.play-selection').removeClass('stop');

        });
        
        wavesurfer.on('error', function () {
            $("#loading").removeClass("active");
            $("#select-ressources .music").parent().parent().addClass('error');

            notifier("Fichier audio introuvable.","error",$("#select-ressources .music").parent().parent().attr('id'));
        });

        



        rules_newdoc = {
            title: {
                identifier: 'title_1', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez saisir un titre'
                    }
                ]
            },
            titlelangue: {
                identifier: 'title_1_langue', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez saisir la langue du titre'
                    }
                ]
            },
            codelangue: {
                identifier: 'codelangue_1', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez saisir un code langue'
                    },
                    {
                        type: 'maxLength[3]',
                        prompt: 'Le code langue doit être sur 3 caractères'
                    }
                ]
            }, codelanguerec: {
                identifier: 'codelanguerec_1', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez saisir un code langue'
                    },
                    {
                        type: 'maxLength[3]',
                        prompt: 'Le code langue doit être sur 3 caractères'
                    }
                ]
            },
            codepays: {
                identifier: 'codepays', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez saisir un code pays'
                    },
                    {
                        type: 'maxLength[2]',
                        prompt: 'Le code pays doit être sur 2 caractères'
                    }
                ]
            }, lieu: {
                identifier: 'spatial_1', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez saisir un lieu'
                    },
                    {
                        type: 'length[2]',
                        prompt: 'Veuillez saisir au moins 2 caractères'
                    }
                ]
            }, depositor: {
                identifier: 'depositor_1', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez saisir un dépositaire'
                    },
                    {
                        type: 'length[2]',
                        prompt: 'Veuillez saisir au moins 2 caractères'
                    }
                ]
            }, researcher: {
                identifier: 'researcher_1', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez saisir un chercheur'
                    },
                    {
                        type: 'length[2]',
                        prompt: 'Veuillez saisir au moins 2 caractères'
                    }
                ]
            }, sponsor: {
                identifier: 'sponsor_1', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez saisir un sponsor'
                    }
                ]
            }, publisher: {
                identifier: 'publisher_1', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez saisir un éditeur'
                    },
                    {
                        type: 'length[2]',
                        prompt: 'Veuillez saisir au moins 2 caractères'
                    }
                ]
              }, 
//            identifieruser: {
//                identifier: 'identifier-user', rules: [
//                    {
//                        type: 'empty',
//                        prompt: 'Veuillez saisir un identifiant de document'
//                    },
//                    {
//                        type: 'length[2]',
//                        prompt: 'Veuillez saisir au moins 2 caractères'
//                    }
//                ]
//            }

        };

        $('#newdoc').form(rules_newdoc, {
            inline: true,
            on: 'blur'
        });

        rules_newselection = {
            transcription: {
                identifier: 'transcription_1', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez saisir une transcription'
                    }
                ]
            },
            transcriptionlangue: {
                identifier: 'transcription_1_langue', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez saisir la langue de la transcription'
                    }
                ]
            },
            traduction: {
                identifier: 'traduction_1', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez saisir une traduction'
                    }
                ]
            },
            traductionlangue: {
                identifier: 'traduction_1_langue', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez saisir la langue de la traduction'
                    }
                ]
            },
            startPosition: {
                identifier: 'startPosition', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez sélectionner une plage audio'
                    }
                ]
            },
            endPosition: {
                identifier: 'endPosition', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez sélectionner une plage audio'
                    }
                ]
            }

        };

        $('#newselection').form(rules_newselection, {
            inline: true,
            on: 'blur'
        });

        refreshUserDoc(token);


//____________________________________________________________________________________
//____________________________________________________________________________________


        // AJOUT D'UNE LIGNE DE SAISIE
        $(".btn-add-input-line").click(function () {

            //var $new_div_title = $("<div class='" + $(this).parent().parent()[0].className + "'></div>");
            var $new_div = $(this).parent().parent().clone(true,true);
            $(this).parent().parent().after($new_div);
            $new_div.find('.remove').show();
//          $(this).hide();
            //$new_div.append($(this).parent().parent().html());

            $new_div.find('input').val('');
            var id = $(this).parent().parent().find('input:first').attr('id');
            
            var id_array = id.split('_');
            var id_num = parseInt(id_array[1]) + 1;

            $new_div.find('input').each(function(){    
                var id = $(this).attr('id');
                var id_array = id.split('_');
                var new_id_id = id_array[0] + '_' + id_num;
                $(this).attr('id', new_id_id); 
                $(this).attr('name', new_id_id); 
                
                var actarget = $(this).attr('actarget');
                if(typeof actarget!== typeof undefined && actarget !== false){   
                    var actarget_array = actarget.split('_');
                    var new_id_actarget = actarget_array[0] + '_' + id_num;
                    $(this).attr('actarget', new_id_actarget); 
                }       
            });

            //CHECK CORRECTION REVUE LACITO 08/01/2015 : liste déroulante pour valeurs de transcription
            $new_div.find('.ui.dropdown').each(function () {
                $(this).dropdown();
            });
        });
        
        $(".remove, .btn-remove").click(function () {
            $(this).parent().parent().remove();
        });

//____________________________________________________________________________________
//____________________________________________________________________________________


        // CODES LANGUES ISO
//        $('body').on('keyup', '.codelangue', function() {
//
//            var that = $(this);
//            $.post(
//                'getLanguageFromISO',
//                {
//                    YII_CSRF_TOKEN: token,
//                    codelang: $(this).val(),
//                },
//                function (result) {
//                    //$("#subject").val(result);
//                    //console.log(that);
//                    ////console.log($(this).parent().next().find('input').attr('id'));
//                    that.parent().next().find('input').val(result);
////                    $("#subject").next('.label').html(result);
//                }
//            );
//            var d = new Date();
//            $("#identifier-doc").html('crdo-' + $(this).val().toUpperCase() + '_' + $("#user").val() + '_' + d.getTime().toString());
//        });

//____________________________________________________________________________________
//____________________________________________________________________________________


        // GOOGLE MAP API: MISE A JOUR DES LOCALITES EN FONCTION DU PAYS SELECTIONNE
        $("input#codepays").on('change', function () {

            var input = document.getElementById('spatial_1');
            var options = {componentRestrictions: {country: $(this).val()}};
            var autocomplete = new google.maps.places.Autocomplete(input, options);

            google.maps.event.addListener(autocomplete, 'place_changed', function () {
                var place = autocomplete.getPlace();

                /* CORRECTION REVUE LACITO 08/01/2015 : 2 chiffres après la virgule */
                $("input#spatial_lat").val(Math.round(place.geometry.location.lat() * 100) / 100);
                $("input#spatial_long").val(Math.round(place.geometry.location.lng() * 100) / 100);

            });
        });
                
        $("#select_transcription").dropdown();
        $('.ui.radio.checkbox').checkbox();

//____________________________________________________________________________________
//____________________________________________________________________________________

        // CREATION D'UN NOUVEAU DOCUMENT
        $("#creer-doc").click(function () {

            if ($('#newdoc').form('validate form')) {

                //var token = "<?php echo Yii::app()->request->csrfToken; ?>";

                var depositors = new Array();
                var researchers = new Array();
                var speakers = new Array();
                var recorders = new Array();
                var interviewers = new Array();
                var sponsors = new Array();
                //BUG: oubli 060315
                var publishers = new Array();

                $(".depositor").each(function () {
                    depositors.push($(this).val());
                });
                $(".researcher").each(function () {
                    researchers.push($(this).val());
                });
                $(".speaker").each(function () {
                    speakers.push($(this).val());
                });
                $(".recorder").each(function () {
                    recorders.push($(this).val());
                });
                $(".interviewer").each(function () {
                    interviewers.push($(this).val());
                });
                $(".sponsor").each(function () {
                    sponsors.push($(this).val());
                });
                //BUG oubli 060315
                $(".publisher").each(function () {
                    publishers.push($(this).val());
                });
                
                var contributors = {
                    depositor: depositors,
                    researcher: researchers,
                    speaker: speakers,
                    recorder: recorders,
                    interviewer: interviewers,
                    sponsor: sponsors

                };

                var title = new Array();

                $(".doc-title").each(function () {
                    var title_langue = $(this).parent().parent().find('.doc-title-langue').val();
                    //console.log(title_langue);
                    title.push({title: $(this).val(), lang: title_langue});
                });

                /* CORRECTION REVUE LACITO 08/01/2015 */
                var codelanguerec = new Array();

                $(".codelanguerec").each(function () {
                    codelanguerec.push($(this).val());
                });
                /**/

                var spatial = {
                    place: $("#spatial_1").val(),
                    geo: {
                        east: $("#spatial_long").val(),
                        north: $("#spatial_lat").val()
                    }, 
                    countrycode: $("#codepays").val(),
                    lang:'en'
                };
                
                /* CORRECTION REVUE LACITO 27/05/2015 */
                var subject = new Array();

                $(".codelangue").each(function () {
                    subject.push({
                        codelangue:$(this).val(),
                        subject:$(this).parent().next().find('.subject').val()
                    });
                });
                /*        
                var subject = {
                    codelang: $("#codelangue").val(),
                    subject: $("#subject").val(),
                };
                */

                $.ajax({
                    url: "createDocument",
                    dataType: 'json',
                    data: {
                        YII_CSRF_TOKEN: token,
                        user: user,
                        id: $('#identifier-doc').html(),
                        title: title,
                        languages: codelanguerec,
                        subject: subject,
                        spatial: spatial,
                        contributors: contributors,
                        publishers: publishers,
                        format: $('#format').val(),
                        type: $('#type').val(),
                        conformsTo: '',
                        identifier: $('#identifier-doc').html(),
                        isFormatOf: $('#identifier-doc').html() + '.xhtml',
                        isPartOf: $('#ispartof').val(),
                        collection: $('#collection').val(),
                        accessRights: $('#accessrights').val(),
                        license: $('#license').val(),
                        rights: $('#rights').val()
                    },
                    type: 'POST',
                    success: function (response) {
                        $("#newdoc").hide();
                        //console.log("Document créé");
                        //DEPRECATED
                        //currentDocument = "metadata_"+$('#identifier-doc').html()+".xml";
                        currentLangue = $('#codelangue_1').val();
                        localStorage.setItem('document',currentDocument);
                        localStorage.setItem('langue',currentLangue);
                        
                        //console.log(currentDocument);
                        
                        location.reload();
                        //TODO reload doc
                        notifier(messages("Création du document réussie."),"success");
                                                              

                    },
                    error: function (request, status, error) {
                        //TODO : BUG AU MOMENT DE LA CREATION D'UN NOUVEAU TJRS MESSAGE ERREUR
                        console.log(status);
                        console.log(error);
                        //console.log("Erreur création Document");
                        notifier(messages("Erreur lors de la création du document (createDoc).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");
                           
                        refreshDocLang($("#codelangue").val());
                        //$("#newdoc").form('add prompt', 'identifier-user', "Un document porte déjà ce nom. Veuillez changer d'identifiant.");
                    }
                });

            } else {
                $('#newdoc').find('.field.error:first input').focus();
            }
        });


//____________________________________________________________________________________
//____________________________________________________________________________________

        // CREATION D'UNE NOUVELLE SELECTION (MOT, PHRASE)
        $("#creer-selection").click(function () {

            if ($('#newselection').form('validate form')) {

                //var token = "<?php echo Yii::app()->request->csrfToken; ?>";

                var transcriptions = new Array();
                var traductions = new Array();
                var selected_areas = new Array();//deprecated, use following areas instead
                var areas = new Array();


                $.each(o_imgAreaSelect.getSelections(), function () {
                    selected_areas.push({
                        image: $('.images-tab a.item.active').attr('image'),
                        area: this
                    });

                    areas.push({
                        image: $('.images-tab a.item.active').attr('image'),
                        h:this.height,
                        w:this.width,
                        x1:this.x1,
                        y1:this.y1,
                        x2:this.x2,
                        y2:this.y2
                    });
                });

                $("#newselection .transcription").each(function () {
                    //var transcription_langue = $(this).parent().parent().find('.transcription-langue').val();
                    var transcription_langue = $(this).parent().parent().find('.transcription-langue').find('.item.active').attr('data-value');
                    /*  : CORRECTION REVUE LACITO 08/01/2015 : liste déroulante 4 type de transcriptions */
                    //console.log(transcription_langue);
                    transcriptions.push({transcription: $(this).val(), lang: transcription_langue});
                });

                $("#newselection .traduction").each(function () {
                    var traduction_langue = $(this).parent().parent().find('.traduction-langue').val();
                    //console.log(traduction_langue);
                    traductions.push({traduction: $(this).val(), lang: traduction_langue});
                });
                
                
                if($("#startPosition").val().trim()===""){
                    var sp = 0;
                }else{
                    var sp = parseFloat($("#startPosition").val());
                }
                
                if($("#endPosition").val().trim()===""){
                    var ep = 0;
                }else{
                    var ep = parseFloat($("#endPosition").val());
                }
                
                var motphrase = $("[name=motphrase]:checked").attr('id');

                //update DOM 
                var parameters ={
                    startPosition: sp,
                    endPosition: ep,
                    selectedAreas: areas,
                    transcriptions: transcriptions,
                    traductions: traductions,
                    motphrase: motphrase
                };

                var motphrase = (parameters.motphrase == "phrase") ? 'S' : 'W' ;

                var prefixId = o_Currentdocument.id.replace('crdo-','');

                var idMax = 0;
                var idSentenceMax = 0;
                var idWordMax = 0;


                //var newId = prefixId + '_' + motphrase;

                $('#annotations-sentences > div > .title').each(
                    function(){
                        id = parseInt($(this).attr('id-selection').substr(prefixId.length+2));
                        idSentenceMax = (id > idSentenceMax)?id:idSentenceMax;
                    }
                );

                $('.words > div > .title').each(
                    function(){
                        id = parseInt($(this).attr('id-selection').substr(prefixId.length+2));
                        idWordMax = (id > idWordMax)?id:idWordMax;
                    }
                );
    

                if(o_Currentdocument.hasOwnProperty('annotations')){
                    //on récupère le dernier id disponible
                    if(motphrase == 'S'){
                        idMax = idSentenceMax;
                    }else{
                        idMax = idWordMax;
                    }

                    //digit = ("000" + (idMax+1)).slice(-3);
                    //newId += digit;   
                    

                }else{
                    o_Currentdocument.annotations = {};
                    o_Currentdocument.annotations.sentences = [];
                    //newId += '001';
                    
                }

                //
                newId = generateNewId('S');

                //10/02/2017
                //MOT à MOT
                var mots = parameters.transcriptions[0].transcription.trim().split(' ');

                var arrayMots = [];

                $.each(mots,function(){
                    idWordMax++;
                    //digit = ("000" + (idWordMax+1)).slice(-3);
                    digit = idWordMax+1;
                    var idWord = prefixId + '_W' + digit;

                    arrayMots.push({
                        id: idWord,
                        startPosition: parameters.startPosition,
                        endPosition: parameters.endPosition,
                        areas: parameters.selectedAreas,
                        traductions: [{'lang':'','traduction':''}],
                        transcriptions: [{'lang':parameters.transcriptions[0].lang,'transcription':this}]
                        });


                });
                //

                var annotation = {
                    id: newId,
                    startPosition: parameters.startPosition,
                    endPosition: parameters.endPosition,
                    areas: parameters.selectedAreas,
                    traductions: parameters.traductions,
                    transcriptions: parameters.transcriptions,
                    children: arrayMots
                };

                //addSelectionToDOM(selection);

                // push json on server

                
                $.ajax({
                    //url: "createSelection",
                    url: "createAnnotation",
                    dataType: 'json',
                    data: {
                        YII_CSRF_TOKEN: token,
                        user: user,
                        iddoc: o_Currentdocument.id,
                        annotation: annotation
                    },
                    type: 'POST',
                    success: function (response) {

                        notifier(messages("Création de l'annotation réussie."),"success");
                        o_Currentdocument.annotations.sentences.push(annotation);
                        refreshAnnotations();
                        //refreshPreview();
                        o_imgAreaSelect.cancelSelections();

                        $('wave region').remove();
                        checkMissingAnnotations(); 
                        
                    },
                    error: function (request, status, error) {
                        notifier(messages("Erreur lors de la création de l'annotation (createAnnotation).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");  
                    }
                });
                
                $('#audio-compo input:not(.traduction-langue):not(.transcription-langue)[type=text]').val('');
                //getDoc(currentDocument);

            } else {
                $('#newdoc').find('.field.error:first input').focus();
            }
        });

//        $("#uploaded-type").val($("[name=file-type]:checked").attr('id'));
//        $('[name=file-type]').change(function () {
//            $("#uploaded-type").val($("[name=file-type]:checked").attr('id'));
//        });

        //$("#uploaded-file")[0].files[0].name


        $("input#uploaded-file").change(function () {
 
            $("#selected-file").html($("#uploaded-file")[0].files[0].name);
            notifier(messages("Fichier importé avec succès.")+' ('+$("#uploaded-file")[0].files[0].name+')',"success");
            
        });

        $("input#annotation-file").change(function () {
 
            $("#selected-annotation-file").html($("#annotation-file")[0].files[0].name);
            notifier(messages("Fichier importé avec succès.")+' ('+$("#annotation-file")[0].files[0].name+')',"success");
            
        });
        /*
        $("input#meta-file").change(function () {
 
            $("#selected-meta-file").html($("#meta-file")[0].files[0].name);
            notifier(messages("Fichier importé avec succès.")+' ('+$("#meta-file")[0].files[0].name+')',"success");
            
        });
        */
        $('#toggleSelections').checkbox({
            "onEnable":function(){
                $('[id^="maskSelection"]').css('display','block');
                
                $('[id^="maskSelection"]').bind('click',function(){
                    var idSel = $(this).attr('id').replace('maskSelection_','');
                    
                    $('#annotations .title.active').click();
                    $('.title[id-selection^="'+idSel+'"]').click();
                    $('.content[id-selection^="'+idSel+'"] .play-selection').click();
                    
                });
            },
            "onDisable":function(){
                $('[id^="maskSelection"]').css('display','none');
            }
            
        });
      
    });

//____________________________________________________________________________________
//____________________________________________________________________________________


    // AFFICHAGE DU FORMULAIRE D'AJOUT DE RESSOURCE POUR LE DOCUMENT
    $("#btn-add-crdo").on("click", function () {
        $("#upload-wrapper").toggle();
    });

//____________________________________________________________________________________
//____________________________________________________________________________________


    // AFFICHAGE DU FORMULAIRE DE SAISIE D'UN NOUVEAU DOCUMENT
    $("#btn-add-doc").on("click", function () {
        $("#newdoc").toggle();
    });
    
        // AFFICHAGE DU FORMULAIRE DE SAISIE D'UN NOUVEAU DOCUMENT
    $("#btn-import-doc").on("click", function () {
        $("#import-form").toggle();
    });

//____________________________________________________________________________________
//____________________________________________________________________________________


    // SOUMISSION DU FORMULAIRE D'AJOUT DE RESSOURCE/CRDO
    $('form#upload').submit(function () {

        /* nouvelle version JSON : 
        il faut:
            - valider la ressource à uploader : image ou audio
            - convertir si WAV ? Pas pour le moment
            - uploader le fichier
            - modifier le metadata.resources
        */

        $('#upload-wrapper').hide();
        ////console.log('set dimmer upload');
        $("#loading .loader").html(messages("Téléchargement en cours"));
        $('#loading').addClass('active');
        
        $('#upload-target').unbind().load(function () {
            var filename = $('#upload-target').contents().find('#filename').html();           

            $("#selected-file").html($("#upload-target body").html());
            //getDoc($("#select-document > tbody > tr.active").attr('id'));
            getJSON($("#select-document > tbody > tr.active").attr('id'),user);
            
            //$("#select-document > tbody > tr.active").click();            
        });
        
    });
    
    // SOUMISSION DU FORMULAIRE D'IMPORT DE DOC XML
    $('form#import').submit(function () {

        $('#import-form').hide();
        ////console.log('set dimmer upload');
        $("#loading .loader").html(messages("Téléchargement en cours"));
        $('#loading').addClass('active');
        
        $('#import-target').unbind().load(function () {
            var filename = $('#import-target').contents().find('#filename').html();         
            getJSON($("#select-document > tbody > tr.active").attr('id'),user);  
            
        });
        
    });

    $("#step2").show(function () {
        $("#audio-compo").show();
    });

//____________________________________________________________________________________
//____________________________________________________________________________________


    // CONTROLES AUDIO
    $('#player-controls button[data-action=play]').click(function () {
        wavesurfer.playPause();

        //if (playerAction != "playSelOnce") {
        if ($(this).find('i').hasClass('play')) {
            $(this).find('i').removeClass('play').addClass('pause');
        } else {
            $(this).find('i').removeClass('pause').addClass('play');
        }
        //}

        playerAction = $(this).attr("data-action");
        //if(wavesurfer.getSelection()){
        //wavesurfer.play(wavesurfer.getSelection().startPosition,wavesurfer.getSelection().endPosition);
        //}else{

        //}

    });

    $('#player-controls button[data-action=playSelOnce]').click(function () {
        playerAction = $(this).attr("data-action");
        var sel = wavesurfer.getSelection();
        if (sel) {
            wavesurfer.play(sel.startPosition, sel.endPosition);
            $('#player-controls button[data-action=play] i').removeClass('play').addClass('pause');
            //wavesurfer.seekAndCenter(sel.startPercentage);
        }

    });
    /*
     $('#player-controls button[data-action=playSelLoop]').click(function() {
     wavesurfer.playPauseSelection();
     });
     */
    $('#player-controls button[data-action=rewind]').click(function () {
        playerAction = $(this).attr("data-action");
        wavesurfer.stop();
        wavesurfer.seekAndCenter(0);
        $('#player-controls button[data-action=play] i').removeClass('pause').addClass('play');


    });

    $('#player-controls button[data-action=toggleScroll]').click(function () {
        wavesurfer.toggleScroll();

        var sel = wavesurfer.getSelection();
        var SP = sel.startPercentage;
        var EP = sel.endPercentage;

        wavesurfer.updateSelection({startPercentage: SP, endPercentage: EP});
        ////console.log(EP);
        wavesurfer.seekAndCenter(SP);

        if ($(this).find('i').hasClass('in')) {
            $(this).find('i').removeClass('in').addClass('out');
        } else {
            $(this).find('i').removeClass('out').addClass('in');
        }
    });
    
    $('#startPosition,#endPosition').change(function(){
        
        var SP = parseFloat($('#startPosition').val()/wavesurfer.getDuration());
        var EP = parseFloat($('#endPosition').val()/wavesurfer.getDuration());

        wavesurfer.updateSelection({startPercentage: SP, endPercentage: EP});
    });
   /* 
    * 
$('#annotations .words .traduction input:text[value=""]').each(function(){
    var block = $(this).parent().parent().parent().parent();
    var transcr = block.find('.transcriptions .transcription:first input').val();
    //console.log(transcr);
    
    var inputToCopy = $('#annotations .words .title:contains("'+transcr+'")').next().find('.traductions .traduction:first input:text[value!=""]').first();
    
    var text = inputToCopy.val();
    var lang = inputToCopy.attr('lang');
    
    $(this).val(text);
    $(this).attr('lang',lang);
    
    $(this).parent().parent().find('.button.edit-annotation').click().click();
    

    });
 */

;/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/*
	A simple, lightweight jQuery plugin for creating sortable tables.
	https://github.com/kylefox/jquery-tablesort
	Version 0.0.2
*/

$(function() {

	var $ = window.jQuery;

	$.tablesort = function ($table, settings) {
		var self = this;
		this.$table = $table;
		this.$thead = this.$table.find('thead');
		this.settings = $.extend({}, $.tablesort.defaults, settings);
		this.$table.find('th').bind('click.tablesort', function() {
			self.sort($(this));
		});
		this.index = null;
		this.$th = null;
		this.direction = null;
	};

	$.tablesort.prototype = {

		sort: function(th, direction) {
			var start = new Date(),
				self = this,
				table = this.$table,
				rows = this.$thead.length > 0 ? table.find('tbody tr') : table.find('tr').has('td'),
				cells = table.find('tr td:nth-of-type(' + (th.index() + 1) + ')'),
				sortBy = th.data().sortBy,
				sortedMap = [];

			var unsortedValues = cells.map(function(idx, cell) {
				if (sortBy)
					return (typeof sortBy === 'function') ? sortBy($(th), $(cell), self) : sortBy;
				return ($(this).data().sortValue != null ? $(this).data().sortValue : $(this).text());
			});
			if (unsortedValues.length === 0) return;

			self.$table.find('th').removeClass(self.settings.asc + ' ' + self.settings.desc);

			if (direction !== 'asc' && direction !== 'desc')
				this.direction = this.direction === 'asc' ? 'desc' : 'asc';
			else
				this.direction = direction;

			direction = this.direction == 'asc' ? 1 : -1;

			self.$table.trigger('tablesort:start', [self]);
			self.log("Sorting by " + this.index + ' ' + this.direction);

			for (var i = 0, length = unsortedValues.length; i < length; i++)
			{
				sortedMap.push({
					index: i,
					cell: cells[i],
					row: rows[i],
					value: unsortedValues[i]
				});
			}

			sortedMap.sort(function(a, b) {
				if (a.value > b.value) {
					return 1 * direction;
				} else if (a.value < b.value) {
					return -1 * direction;
				} else {
					return 0;
				}
			});

			$.each(sortedMap, function(i, entry) {
				table.append(entry.row);
			});

			th.addClass(self.settings[self.direction]);

			self.log('Sort finished in ' + ((new Date()).getTime() - start.getTime()) + 'ms');
			self.$table.trigger('tablesort:complete', [self]);
		},

		log: function(msg) {
			if(($.tablesort.DEBUG || this.settings.debug) && console && console.log) {
				console.log('[tablesort] ' + msg);
			}
		},

		destroy: function() {
			this.$table.find('th').unbind('click.tablesort');
			this.$table.data('tablesort', null);
			return null;
		}

	};

	$.tablesort.DEBUG = false;

	$.tablesort.defaults = {
		debug: $.tablesort.DEBUG,
		asc: 'sorted ascending',
		desc: 'sorted descending'
	};

	$.fn.tablesort = function(settings) {
		var table, sortable, previous;
		return this.each(function() {
			table = $(this);
			previous = table.data('tablesort');
			if(previous) {
				previous.destroy();
			}
			table.data('tablesort', new $.tablesort(table, settings));
		});
	};

});;/**
 * jQuery.ajax mid - CROSS DOMAIN AJAX 
 * ---
 * @author James Padolsey (http://james.padolsey.com)
 * @version 0.11
 * @updated 12-JAN-10
 * ---
 * Note: Read the README!
 * ---
 * @info http://james.padolsey.com/javascript/cross-domain-requests-with-jquery/
 */

jQuery.ajax = (function(_ajax){
    
    var protocol = location.protocol,
        hostname = location.hostname,
        exRegex = RegExp(protocol + '//' + hostname),
        YQL = 'http' + (/^https/.test(protocol)?'s':'') + '://query.yahooapis.com/v1/public/yql?callback=?',
        query = 'select * from html where url="{URL}" and xpath="*"';
    
    function isExternal(url) {
        return !exRegex.test(url) && /:\/\//.test(url);
    }
    
    return function(o) {
        
        var url = o.url;
        
        if ( /get/i.test(o.type) && !/json/i.test(o.dataType) && isExternal(url) ) {
            
            // Manipulate options so that JSONP-x request is made to YQL
            
            o.url = YQL;
            o.dataType = 'json';
            
            o.data = {
                q: query.replace(
                    '{URL}',
                    url + (o.data ?
                        (/\?/.test(url) ? '&' : '?') + jQuery.param(o.data)
                    : '')
                ),
                format: 'xml'
            };
            
            // Since it's a JSONP request
            // complete === success
            if (!o.success && o.complete) {
                o.success = o.complete;
                delete o.complete;
            }
            
            o.success = (function(_success){
                return function(data) {
                    
                    if (_success) {
                        // Fake XHR callback.
                        _success.call(this, {
                            responseText: (data.results[0] || '')
                                // YQL screws with <script>s
                                // Get rid of them
                                .replace(/<script[^>]+?\/>|<script(.|\s)*?\/script>/gi, '')
                        }, 'success');
                    }
                    
                };
            })(o.success);
            
        }
        
        return _ajax.apply(this, arguments);
        
    };
    
})(jQuery.ajax);
;/**
 * jQuery.ajax mid - CROSS DOMAIN AJAX 
 * ---
 * @author James Padolsey (http://james.padolsey.com)
 * @version 0.11
 * @updated 12-JAN-10
 * ---
 * Note: Read the README!
 * ---
 * @info http://james.padolsey.com/javascript/cross-domain-requests-with-jquery/
 */

jQuery.ajax = (function(_ajax){
    
    var protocol = location.protocol,
        hostname = location.hostname,
        exRegex = RegExp(protocol + '//' + hostname),
        YQL = 'http' + (/^https/.test(protocol)?'s':'') + '://query.yahooapis.com/v1/public/yql?callback=?',
        query = 'select * from html where url="{URL}" and xpath="*"';
    
    function isExternal(url) {
        return !exRegex.test(url) && /:\/\//.test(url);
    }
    
    return function(o) {
        
        var url = o.url;
        
        if ( /get/i.test(o.type) && !/json/i.test(o.dataType) && isExternal(url) ) {
            
            // Manipulate options so that JSONP-x request is made to YQL
            
            o.url = YQL;
            o.dataType = 'json';
            
            o.data = {
                q: query.replace(
                    '{URL}',
                    url + (o.data ?
                        (/\?/.test(url) ? '&' : '?') + jQuery.param(o.data)
                    : '')
                ),
                format: 'xml'
            };
            
            // Since it's a JSONP request
            // complete === success
            if (!o.success && o.complete) {
                o.success = o.complete;
                delete o.complete;
            }
            
            o.success = (function(_success){
                return function(data) {
                    
                    if (_success) {
                        // Fake XHR callback.
                        _success.call(this, {
                            responseText: (data.results[0] || '')
                                // YQL screws with <script>s
                                // Get rid of them
                                .replace(/<script[^>]+?\/>|<script(.|\s)*?\/script>/gi, '')
                        }, 'success');
                    }
                    
                };
            })(o.success);
            
        }
        
        return _ajax.apply(this, arguments);
        
    };
    
})(jQuery.ajax);
;function transcrire(mot,t_source,t_cible){
	
    jQuery.ajax({
      type: "POST", // Le type de ma requete
      url: "../fonctions/transcrire", // L url vers laquelle la requete sera envoyee
      data: {
        mots: mot,
        transcription_from: t_source,
        transcription_to: t_cible
      }, 
      success: function(data, textStatus, jqXHR) {// La reponse du serveur est contenu dans data
        return data;
      },
      error: function(jqXHR, textStatus, errorThrown) {
          return "erreur";
      }
    });

};(function(){var n=this,t=n._,r={},e=Array.prototype,u=Object.prototype,i=Function.prototype,a=e.push,o=e.slice,c=e.concat,l=u.toString,f=u.hasOwnProperty,s=e.forEach,p=e.map,h=e.reduce,v=e.reduceRight,d=e.filter,g=e.every,m=e.some,y=e.indexOf,b=e.lastIndexOf,x=Array.isArray,_=Object.keys,j=i.bind,w=function(n){return n instanceof w?n:this instanceof w?(this._wrapped=n,void 0):new w(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=w),exports._=w):n._=w,w.VERSION="1.4.4";var A=w.each=w.forEach=function(n,t,e){if(null!=n)if(s&&n.forEach===s)n.forEach(t,e);else if(n.length===+n.length){for(var u=0,i=n.length;i>u;u++)if(t.call(e,n[u],u,n)===r)return}else for(var a in n)if(w.has(n,a)&&t.call(e,n[a],a,n)===r)return};w.map=w.collect=function(n,t,r){var e=[];return null==n?e:p&&n.map===p?n.map(t,r):(A(n,function(n,u,i){e[e.length]=t.call(r,n,u,i)}),e)};var O="Reduce of empty array with no initial value";w.reduce=w.foldl=w.inject=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),h&&n.reduce===h)return e&&(t=w.bind(t,e)),u?n.reduce(t,r):n.reduce(t);if(A(n,function(n,i,a){u?r=t.call(e,r,n,i,a):(r=n,u=!0)}),!u)throw new TypeError(O);return r},w.reduceRight=w.foldr=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),v&&n.reduceRight===v)return e&&(t=w.bind(t,e)),u?n.reduceRight(t,r):n.reduceRight(t);var i=n.length;if(i!==+i){var a=w.keys(n);i=a.length}if(A(n,function(o,c,l){c=a?a[--i]:--i,u?r=t.call(e,r,n[c],c,l):(r=n[c],u=!0)}),!u)throw new TypeError(O);return r},w.find=w.detect=function(n,t,r){var e;return E(n,function(n,u,i){return t.call(r,n,u,i)?(e=n,!0):void 0}),e},w.filter=w.select=function(n,t,r){var e=[];return null==n?e:d&&n.filter===d?n.filter(t,r):(A(n,function(n,u,i){t.call(r,n,u,i)&&(e[e.length]=n)}),e)},w.reject=function(n,t,r){return w.filter(n,function(n,e,u){return!t.call(r,n,e,u)},r)},w.every=w.all=function(n,t,e){t||(t=w.identity);var u=!0;return null==n?u:g&&n.every===g?n.every(t,e):(A(n,function(n,i,a){return(u=u&&t.call(e,n,i,a))?void 0:r}),!!u)};var E=w.some=w.any=function(n,t,e){t||(t=w.identity);var u=!1;return null==n?u:m&&n.some===m?n.some(t,e):(A(n,function(n,i,a){return u||(u=t.call(e,n,i,a))?r:void 0}),!!u)};w.contains=w.include=function(n,t){return null==n?!1:y&&n.indexOf===y?n.indexOf(t)!=-1:E(n,function(n){return n===t})},w.invoke=function(n,t){var r=o.call(arguments,2),e=w.isFunction(t);return w.map(n,function(n){return(e?t:n[t]).apply(n,r)})},w.pluck=function(n,t){return w.map(n,function(n){return n[t]})},w.where=function(n,t,r){return w.isEmpty(t)?r?null:[]:w[r?"find":"filter"](n,function(n){for(var r in t)if(t[r]!==n[r])return!1;return!0})},w.findWhere=function(n,t){return w.where(n,t,!0)},w.max=function(n,t,r){if(!t&&w.isArray(n)&&n[0]===+n[0]&&65535>n.length)return Math.max.apply(Math,n);if(!t&&w.isEmpty(n))return-1/0;var e={computed:-1/0,value:-1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;a>=e.computed&&(e={value:n,computed:a})}),e.value},w.min=function(n,t,r){if(!t&&w.isArray(n)&&n[0]===+n[0]&&65535>n.length)return Math.min.apply(Math,n);if(!t&&w.isEmpty(n))return 1/0;var e={computed:1/0,value:1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;e.computed>a&&(e={value:n,computed:a})}),e.value},w.shuffle=function(n){var t,r=0,e=[];return A(n,function(n){t=w.random(r++),e[r-1]=e[t],e[t]=n}),e};var k=function(n){return w.isFunction(n)?n:function(t){return t[n]}};w.sortBy=function(n,t,r){var e=k(t);return w.pluck(w.map(n,function(n,t,u){return{value:n,index:t,criteria:e.call(r,n,t,u)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index<t.index?-1:1}),"value")};var F=function(n,t,r,e){var u={},i=k(t||w.identity);return A(n,function(t,a){var o=i.call(r,t,a,n);e(u,o,t)}),u};w.groupBy=function(n,t,r){return F(n,t,r,function(n,t,r){(w.has(n,t)?n[t]:n[t]=[]).push(r)})},w.countBy=function(n,t,r){return F(n,t,r,function(n,t){w.has(n,t)||(n[t]=0),n[t]++})},w.sortedIndex=function(n,t,r,e){r=null==r?w.identity:k(r);for(var u=r.call(e,t),i=0,a=n.length;a>i;){var o=i+a>>>1;u>r.call(e,n[o])?i=o+1:a=o}return i},w.toArray=function(n){return n?w.isArray(n)?o.call(n):n.length===+n.length?w.map(n,w.identity):w.values(n):[]},w.size=function(n){return null==n?0:n.length===+n.length?n.length:w.keys(n).length},w.first=w.head=w.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:o.call(n,0,t)},w.initial=function(n,t,r){return o.call(n,0,n.length-(null==t||r?1:t))},w.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:o.call(n,Math.max(n.length-t,0))},w.rest=w.tail=w.drop=function(n,t,r){return o.call(n,null==t||r?1:t)},w.compact=function(n){return w.filter(n,w.identity)};var R=function(n,t,r){return A(n,function(n){w.isArray(n)?t?a.apply(r,n):R(n,t,r):r.push(n)}),r};w.flatten=function(n,t){return R(n,t,[])},w.without=function(n){return w.difference(n,o.call(arguments,1))},w.uniq=w.unique=function(n,t,r,e){w.isFunction(t)&&(e=r,r=t,t=!1);var u=r?w.map(n,r,e):n,i=[],a=[];return A(u,function(r,e){(t?e&&a[a.length-1]===r:w.contains(a,r))||(a.push(r),i.push(n[e]))}),i},w.union=function(){return w.uniq(c.apply(e,arguments))},w.intersection=function(n){var t=o.call(arguments,1);return w.filter(w.uniq(n),function(n){return w.every(t,function(t){return w.indexOf(t,n)>=0})})},w.difference=function(n){var t=c.apply(e,o.call(arguments,1));return w.filter(n,function(n){return!w.contains(t,n)})},w.zip=function(){for(var n=o.call(arguments),t=w.max(w.pluck(n,"length")),r=Array(t),e=0;t>e;e++)r[e]=w.pluck(n,""+e);return r},w.object=function(n,t){if(null==n)return{};for(var r={},e=0,u=n.length;u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},w.indexOf=function(n,t,r){if(null==n)return-1;var e=0,u=n.length;if(r){if("number"!=typeof r)return e=w.sortedIndex(n,t),n[e]===t?e:-1;e=0>r?Math.max(0,u+r):r}if(y&&n.indexOf===y)return n.indexOf(t,r);for(;u>e;e++)if(n[e]===t)return e;return-1},w.lastIndexOf=function(n,t,r){if(null==n)return-1;var e=null!=r;if(b&&n.lastIndexOf===b)return e?n.lastIndexOf(t,r):n.lastIndexOf(t);for(var u=e?r:n.length;u--;)if(n[u]===t)return u;return-1},w.range=function(n,t,r){1>=arguments.length&&(t=n||0,n=0),r=arguments[2]||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=0,i=Array(e);e>u;)i[u++]=n,n+=r;return i},w.bind=function(n,t){if(n.bind===j&&j)return j.apply(n,o.call(arguments,1));var r=o.call(arguments,2);return function(){return n.apply(t,r.concat(o.call(arguments)))}},w.partial=function(n){var t=o.call(arguments,1);return function(){return n.apply(this,t.concat(o.call(arguments)))}},w.bindAll=function(n){var t=o.call(arguments,1);return 0===t.length&&(t=w.functions(n)),A(t,function(t){n[t]=w.bind(n[t],n)}),n},w.memoize=function(n,t){var r={};return t||(t=w.identity),function(){var e=t.apply(this,arguments);return w.has(r,e)?r[e]:r[e]=n.apply(this,arguments)}},w.delay=function(n,t){var r=o.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},w.defer=function(n){return w.delay.apply(w,[n,1].concat(o.call(arguments,1)))},w.throttle=function(n,t){var r,e,u,i,a=0,o=function(){a=new Date,u=null,i=n.apply(r,e)};return function(){var c=new Date,l=t-(c-a);return r=this,e=arguments,0>=l?(clearTimeout(u),u=null,a=c,i=n.apply(r,e)):u||(u=setTimeout(o,l)),i}},w.debounce=function(n,t,r){var e,u;return function(){var i=this,a=arguments,o=function(){e=null,r||(u=n.apply(i,a))},c=r&&!e;return clearTimeout(e),e=setTimeout(o,t),c&&(u=n.apply(i,a)),u}},w.once=function(n){var t,r=!1;return function(){return r?t:(r=!0,t=n.apply(this,arguments),n=null,t)}},w.wrap=function(n,t){return function(){var r=[n];return a.apply(r,arguments),t.apply(this,r)}},w.compose=function(){var n=arguments;return function(){for(var t=arguments,r=n.length-1;r>=0;r--)t=[n[r].apply(this,t)];return t[0]}},w.after=function(n,t){return 0>=n?t():function(){return 1>--n?t.apply(this,arguments):void 0}},w.keys=_||function(n){if(n!==Object(n))throw new TypeError("Invalid object");var t=[];for(var r in n)w.has(n,r)&&(t[t.length]=r);return t},w.values=function(n){var t=[];for(var r in n)w.has(n,r)&&t.push(n[r]);return t},w.pairs=function(n){var t=[];for(var r in n)w.has(n,r)&&t.push([r,n[r]]);return t},w.invert=function(n){var t={};for(var r in n)w.has(n,r)&&(t[n[r]]=r);return t},w.functions=w.methods=function(n){var t=[];for(var r in n)w.isFunction(n[r])&&t.push(r);return t.sort()},w.extend=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]=t[r]}),n},w.pick=function(n){var t={},r=c.apply(e,o.call(arguments,1));return A(r,function(r){r in n&&(t[r]=n[r])}),t},w.omit=function(n){var t={},r=c.apply(e,o.call(arguments,1));for(var u in n)w.contains(r,u)||(t[u]=n[u]);return t},w.defaults=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)null==n[r]&&(n[r]=t[r])}),n},w.clone=function(n){return w.isObject(n)?w.isArray(n)?n.slice():w.extend({},n):n},w.tap=function(n,t){return t(n),n};var I=function(n,t,r,e){if(n===t)return 0!==n||1/n==1/t;if(null==n||null==t)return n===t;n instanceof w&&(n=n._wrapped),t instanceof w&&(t=t._wrapped);var u=l.call(n);if(u!=l.call(t))return!1;switch(u){case"[object String]":return n==t+"";case"[object Number]":return n!=+n?t!=+t:0==n?1/n==1/t:n==+t;case"[object Date]":case"[object Boolean]":return+n==+t;case"[object RegExp]":return n.source==t.source&&n.global==t.global&&n.multiline==t.multiline&&n.ignoreCase==t.ignoreCase}if("object"!=typeof n||"object"!=typeof t)return!1;for(var i=r.length;i--;)if(r[i]==n)return e[i]==t;r.push(n),e.push(t);var a=0,o=!0;if("[object Array]"==u){if(a=n.length,o=a==t.length)for(;a--&&(o=I(n[a],t[a],r,e)););}else{var c=n.constructor,f=t.constructor;if(c!==f&&!(w.isFunction(c)&&c instanceof c&&w.isFunction(f)&&f instanceof f))return!1;for(var s in n)if(w.has(n,s)&&(a++,!(o=w.has(t,s)&&I(n[s],t[s],r,e))))break;if(o){for(s in t)if(w.has(t,s)&&!a--)break;o=!a}}return r.pop(),e.pop(),o};w.isEqual=function(n,t){return I(n,t,[],[])},w.isEmpty=function(n){if(null==n)return!0;if(w.isArray(n)||w.isString(n))return 0===n.length;for(var t in n)if(w.has(n,t))return!1;return!0},w.isElement=function(n){return!(!n||1!==n.nodeType)},w.isArray=x||function(n){return"[object Array]"==l.call(n)},w.isObject=function(n){return n===Object(n)},A(["Arguments","Function","String","Number","Date","RegExp"],function(n){w["is"+n]=function(t){return l.call(t)=="[object "+n+"]"}}),w.isArguments(arguments)||(w.isArguments=function(n){return!(!n||!w.has(n,"callee"))}),"function"!=typeof/./&&(w.isFunction=function(n){return"function"==typeof n}),w.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},w.isNaN=function(n){return w.isNumber(n)&&n!=+n},w.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"==l.call(n)},w.isNull=function(n){return null===n},w.isUndefined=function(n){return n===void 0},w.has=function(n,t){return f.call(n,t)},w.noConflict=function(){return n._=t,this},w.identity=function(n){return n},w.times=function(n,t,r){for(var e=Array(n),u=0;n>u;u++)e[u]=t.call(r,u);return e},w.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))};var M={escape:{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","/":"&#x2F;"}};M.unescape=w.invert(M.escape);var S={escape:RegExp("["+w.keys(M.escape).join("")+"]","g"),unescape:RegExp("("+w.keys(M.unescape).join("|")+")","g")};w.each(["escape","unescape"],function(n){w[n]=function(t){return null==t?"":(""+t).replace(S[n],function(t){return M[n][t]})}}),w.result=function(n,t){if(null==n)return null;var r=n[t];return w.isFunction(r)?r.call(n):r},w.mixin=function(n){A(w.functions(n),function(t){var r=w[t]=n[t];w.prototype[t]=function(){var n=[this._wrapped];return a.apply(n,arguments),D.call(this,r.apply(w,n))}})};var N=0;w.uniqueId=function(n){var t=++N+"";return n?n+t:t},w.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var T=/(.)^/,q={"'":"'","\\":"\\","\r":"r","\n":"n","	":"t","\u2028":"u2028","\u2029":"u2029"},B=/\\|'|\r|\n|\t|\u2028|\u2029/g;w.template=function(n,t,r){var e;r=w.defaults({},r,w.templateSettings);var u=RegExp([(r.escape||T).source,(r.interpolate||T).source,(r.evaluate||T).source].join("|")+"|$","g"),i=0,a="__p+='";n.replace(u,function(t,r,e,u,o){return a+=n.slice(i,o).replace(B,function(n){return"\\"+q[n]}),r&&(a+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'"),e&&(a+="'+\n((__t=("+e+"))==null?'':__t)+\n'"),u&&(a+="';\n"+u+"\n__p+='"),i=o+t.length,t}),a+="';\n",r.variable||(a="with(obj||{}){\n"+a+"}\n"),a="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+a+"return __p;\n";try{e=Function(r.variable||"obj","_",a)}catch(o){throw o.source=a,o}if(t)return e(t,w);var c=function(n){return e.call(this,n,w)};return c.source="function("+(r.variable||"obj")+"){\n"+a+"}",c},w.chain=function(n){return w(n).chain()};var D=function(n){return this._chain?w(n).chain():n};w.mixin(w),A(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=e[n];w.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!=n&&"splice"!=n||0!==r.length||delete r[0],D.call(this,r)}}),A(["concat","join","slice"],function(n){var t=e[n];w.prototype[n]=function(){return D.call(this,t.apply(this._wrapped,arguments))}}),w.extend(w.prototype,{chain:function(){return this._chain=!0,this},value:function(){return this._wrapped}})}).call(this);;"use strict";var WaveSurfer={defaultParams:{height:128,waveColor:"#999",progressColor:"#555",cursorColor:"#333",selectionColor:"#0fc",selectionBorder:!1,selectionForeground:!1,selectionBorderColor:"#000",cursorWidth:1,markerWidth:2,skipLength:2,minPxPerSec:50,pixelRatio:window.devicePixelRatio,fillParent:!0,scrollParent:!1,hideScrollbar:!1,normalize:!1,audioContext:null,container:null,dragSelection:!0,loopSelection:!0,audioRate:1,interact:!0,renderer:"Canvas",backend:"WebAudioBuffer"},init:function(e){if(this.params=WaveSurfer.util.extend({},this.defaultParams,e),this.container="string"==typeof e.container?document.querySelector(this.params.container):this.params.container,!this.container)throw new Error("wavesurfer.js: container element not found");this.markers={},this.once("marked",this.bindMarks.bind(this)),this.once("region-created",this.bindRegions.bind(this)),this.regions={},this.savedVolume=0,this.isMuted=!1,this.bindUserAction(),this.createDrawer(),this.createBackend()},bindUserAction:function(){var e=this,t=function(){e.fireEvent("user-action")};document.addEventListener("mousedown",t),document.addEventListener("keydown",t),this.on("destroy",function(){document.removeEventListener("mousedown",t),document.removeEventListener("keydown",t)})},createMedia:function(e){var t=this,i=document.createElement("audio");i.controls=!1,i.autoplay=!1,i.src=e,i.addEventListener("error",function(){t.fireEvent("error","Error loading media element")}),i.addEventListener("canplay",function(){t.fireEvent("media-canplay")});var r=this.container.querySelector("audio");return r&&this.container.removeChild(r),this.container.appendChild(i),i},createDrawer:function(){var e=this;this.drawer=Object.create(WaveSurfer.Drawer[this.params.renderer]),this.drawer.init(this.container,this.params),this.drawer.on("redraw",function(){e.drawBuffer(),e.drawer.progress(e.backend.getPlayedPercents())}),this.on("progress",function(t){e.drawer.progress(t)}),this.drawer.on("mousedown",function(t){setTimeout(function(){e.seekTo(t)},0)}),this.drawer.on("mark-dblclick",function(t){var i=e.markers[t];i&&i.remove()}),this.params.dragSelection&&(this.drawer.on("drag",function(t){e.dragging=!0,e.updateSelection(t)}),this.drawer.on("drag-clear",function(){e.clearSelection()})),this.drawer.on("drag-mark",function(e,t){t.fireEvent("drag",e)}),this.drawer.on("mouseup",function(t){e.fireEvent("mouseup",t),e.dragging=!1}),this.drawer.on("region-over",function(t,i){t.fireEvent("over",i),e.fireEvent("region-over",t,i)}),this.drawer.on("region-leave",function(t,i){t.fireEvent("leave",i),e.fireEvent("region-leave",t,i)}),this.drawer.on("region-click",function(t,i){t.fireEvent("click",i),e.fireEvent("region-click",t,i)}),this.drawer.on("mark-over",function(t,i){t.fireEvent("over",i),e.fireEvent("mark-over",t,i)}),this.drawer.on("mark-leave",function(t,i){t.fireEvent("leave",i),e.fireEvent("mark-leave",t,i)}),this.drawer.on("mark-click",function(t,i){t.fireEvent("click",i),e.fireEvent("mark-click",t,i)}),this.drawer.on("scroll",function(t){e.fireEvent("scroll",t)})},createBackend:function(){var e=this;this.backend&&this.backend.destroy(),this.backend=Object.create(WaveSurfer[this.params.backend]),this.backend.on("play",function(){e.fireEvent("play"),e.restartAnimationLoop()}),this.backend.on("finish",function(){e.fireEvent("finish")});try{this.backend.init(this.params)}catch(t){"wavesurfer.js: your browser doesn't support WebAudio"==t.message&&(this.params.backend="AudioElement",this.backend=null,this.createBackend())}},restartAnimationLoop:function(){var e=this,t=window.requestAnimationFrame||window.webkitRequestAnimationFrame,i=function(){e.backend.isPaused()||(e.fireEvent("progress",e.backend.getPlayedPercents()),t(i))};i()},getDuration:function(){return this.backend.getDuration()},getCurrentTime:function(){return this.backend.getCurrentTime()},play:function(e,t){this.backend.play(e,t)},pause:function(){this.backend.pause()},playPause:function(){this.backend.isPaused()?this.play():this.pause()},playPauseSelection:function(){var e=this.getSelection();null!==e&&(this.seekTo(e.startPercentage),this.playPause())},skipBackward:function(e){this.skip(e||-this.params.skipLength)},skipForward:function(e){this.skip(e||this.params.skipLength)},skip:function(e){var t=this.timings(e),i=t[0]/t[1];this.seekTo(i)},seekAndCenter:function(e){this.seekTo(e),this.drawer.recenter(e)},seekTo:function(e){var t=this.backend.isPaused(),i=this.params.scrollParent;t&&(this.params.scrollParent=!1,this.savedVolume=this.backend.getVolume(),this.backend.setVolume(0)),this.play(e*this.drawer.width/this.realPxPerSec),t&&(this.pause(),this.backend.setVolume(this.savedVolume)),this.params.scrollParent=i,this.fireEvent("seek",e)},stop:function(){this.pause(),this.seekTo(0),this.drawer.progress(0)},setVolume:function(e){this.backend.setVolume(e)},toggleMute:function(){this.isMuted?(this.backend.setVolume(this.savedVolume),this.isMuted=!1):(this.savedVolume=this.backend.getVolume(),this.backend.setVolume(0),this.isMuted=!0)},toggleScroll:function(){this.params.scrollParent=!this.params.scrollParent,this.drawBuffer()},mark:function(e){var t=this,i=WaveSurfer.util.extend({id:WaveSurfer.util.getId(),width:this.params.markerWidth},e);if(i.percentage&&!i.position&&(i.position=i.percentage*this.getDuration()),i.percentage=i.position/this.getDuration(),i.id in this.markers)return this.markers[i.id].update(i);i.position||(i.position=this.getCurrentTime(),i.percentage=i.position/this.getDuration());var r=Object.create(WaveSurfer.Mark);return r.init(i),this.dragging?(r.type="selMark",r.on("drag",function(e){t.updateSelectionByMark(e,r)})):r.on("drag",function(e){t.moveMark(e,r)}),r.on("update",function(){t.drawer.updateMark(r),t.fireEvent("mark-updated",r)}),r.on("remove",function(){t.drawer.removeMark(r),delete t.markers[r.id],t.fireEvent("mark-removed",r)}),this.drawer.addMark(r),this.markers[r.id]=r,this.fireEvent("marked",r),r},clearMarks:function(){Object.keys(this.markers).forEach(function(e){this.markers[e].remove()},this),this.markers={}},redrawRegions:function(){Object.keys(this.regions).forEach(function(e){this.region(this.regions[e])},this)},clearRegions:function(){Object.keys(this.regions).forEach(function(e){this.regions[e].remove()},this),this.regions={}},region:function(e){var t=this,i=WaveSurfer.util.extend({id:WaveSurfer.util.getId()},e);if(i.startPercentage=i.startPosition/this.getDuration(),i.endPercentage=i.endPosition/this.getDuration(),i.id in this.regions)return this.regions[i.id].update(i);var r=Object.create(WaveSurfer.Region);return r.init(i),r.on("update",function(){t.drawer.updateRegion(r),t.fireEvent("region-updated",r)}),r.on("remove",function(){t.drawer.removeRegion(r),t.fireEvent("region-removed",r),delete t.regions[r.id]}),this.drawer.addRegion(r),this.regions[r.id]=r,this.fireEvent("region-created",r),r},timings:function(e){var t=this.getCurrentTime()||0,i=this.getDuration()||1;return t=Math.max(0,Math.min(i,t+(e||0))),[t,i]},drawBuffer:function(){if(this.params.fillParent&&!this.params.scrollParent)var e=this.drawer.getWidth();else e=Math.round(this.getDuration()*this.params.minPxPerSec*this.params.pixelRatio);this.realPxPerSec=e/this.getDuration(),this.drawer.drawPeaks(this.backend.getPeaks(e),e),this.fireEvent("redraw")},drawAsItPlays:function(){var e=this;this.realPxPerSec=this.params.minPxPerSec*this.params.pixelRatio;var t,i=1/this.realPxPerSec,r=0;this.drawFrame=function(n){if(!(n>r&&i>n-r)){r=n;var a=e.getDuration();if(1/0>a){var s=Math.round(a*e.realPxPerSec);t=t||new Uint8Array(s)}else t=t||[],s=t.length;var o=~~(e.backend.getPlayedPercents()*s);t[o]||(t[o]=WaveSurfer.util.max(e.backend.waveform(),128),e.drawer.setWidth(s),e.drawer.clearWave(),e.drawer.drawWave(t,128))}},this.backend.on("audioprocess",this.drawFrame)},loadArrayBuffer:function(e){var t=this;this.backend.decodeArrayBuffer(e,function(e){t.loadDecodedBuffer(e)},function(){t.fireEvent("error","Error decoding audiobuffer")})},loadDecodedBuffer:function(e){this.empty(),"WebAudioBuffer"!=this.params.backend&&(this.params.backend="WebAudioBuffer",this.createBackend()),this.backend.load(e),this.drawBuffer(),this.fireEvent("ready")},loadBlob:function(e){var t=this,i=new FileReader;i.addEventListener("progress",function(e){t.onProgress(e)}),i.addEventListener("load",function(e){t.empty(),t.loadArrayBuffer(e.target.result)}),i.addEventListener("error",function(){t.fireEvent("error","Error reading file")}),i.readAsArrayBuffer(e)},load:function(e,t){switch(this.params.backend){case"WebAudioBuffer":return this.loadBuffer(e);case"WebAudioMedia":return this.loadStream(e);case"AudioElement":return this.loadAudioElement(e,t)}},loadBuffer:function(e){return this.empty(),this.downloadArrayBuffer(e,this.loadArrayBuffer.bind(this))},loadStream:function(e){var t=this;"WebAudioMedia"!=this.params.backend&&(this.params.backend="WebAudioMedia",this.createBackend()),this.empty(),this.drawAsItPlays(),this.media=this.createMedia(e),this.once("user-action",function(){t.backend.load(t.media)}),setTimeout(this.fireEvent.bind(this,"ready"),0)},loadAudioElement:function(e,t){var i=this;"AudioElement"!=this.params.backend&&(this.params.backend="AudioElement",this.createBackend()),this.empty(),this.media=this.createMedia(e),this.once("media-canplay",function(){i.backend.load(i.media,t),i.drawBuffer(),i.fireEvent("ready")})},downloadArrayBuffer:function(e,t){var i=this,r=WaveSurfer.util.ajax({url:e,responseType:"arraybuffer"});return r.on("progress",function(e){i.onProgress(e)}),r.on("success",t),r.on("error",function(e){i.fireEvent("error","XHR error: "+e.target.statusText)}),r},onProgress:function(e){if(e.lengthComputable)var t=e.loaded/e.total;else t=e.loaded/(e.loaded+1e6);this.fireEvent("loading",Math.round(100*t),e.target)},bindMarks:function(){var e=this,t=0;this.backend.on("play",function(){Object.keys(e.markers).forEach(function(t){e.markers[t].played=!1})}),this.backend.on("audioprocess",function(i){Object.keys(e.markers).forEach(function(r){var n=e.markers[r];n.played||n.position<=i&&n.position>=t&&(n.played=!0,e.fireEvent("mark",n),n.fireEvent("reached"))}),t=i})},bindRegions:function(){var e=this;this.backend.on("play",function(){Object.keys(e.regions).forEach(function(t){e.regions[t].firedIn=!1,e.regions[t].firedOut=!1})}),this.backend.on("audioprocess",function(t){Object.keys(e.regions).forEach(function(i){var r=e.regions[i];!r.firedIn&&r.startPosition<=t&&r.endPosition>=t&&(e.fireEvent("region-in",r),r.fireEvent("in"),r.firedIn=!0),!r.firedOut&&r.firedIn&&r.endPosition<t&&(e.fireEvent("region-out",r),r.fireEvent("out"),r.firedOut=!0)})})},empty:function(){this.drawFrame&&(this.un("progress",this.drawFrame),this.drawFrame=null),this.backend&&!this.backend.isPaused()&&(this.stop(),this.backend.disconnectSource()),this.clearMarks(),this.clearRegions(),this.drawer.setWidth(0),this.drawer.drawPeaks({length:this.drawer.getWidth()},0)},destroy:function(){this.fireEvent("destroy"),this.clearMarks(),this.clearRegions(),this.unAll(),this.backend.destroy(),this.drawer.destroy(),this.media&&this.container.removeChild(this.media)},updateSelectionByMark:function(e,t){var i;i=t.id==this.selMark0.id?{startPercentage:e.endPercentage,endPercentage:this.selMark1.percentage}:{startPercentage:this.selMark0.percentage,endPercentage:e.endPercentage},this.updateSelection(i)},updateSelection:function(e){var t=this,i=e.startPercentage,r=e.endPercentage,n=this.params.selectionColor,a=0;if(this.params.selectionBorder&&(n=this.params.selectionBorderColor,a=2),i>r){var s=i;i=r,r=s}this.selMark0?this.selMark0.update({percentage:i,position:i*this.getDuration()}):this.selMark0=this.mark({width:a,percentage:i,position:i*this.getDuration(),color:n,draggable:t.params.selectionBorder}),this.selMark1?this.selMark1.update({percentage:r,position:r*this.getDuration()}):this.selMark1=this.mark({width:a,percentage:r,position:r*this.getDuration(),color:n,draggable:t.params.selectionBorder}),this.drawer.updateSelection(i,r),this.params.loopSelection&&this.backend.updateSelection(i,r),t.fireEvent("selection-update",this.getSelection())},moveMark:function(e,t){t.update({percentage:e.endPercentage,position:e.endPercentage*this.getDuration()}),this.markers[t.id]=t},clearSelection:function(){this.selMark0&&this.selMark1&&(this.drawer.clearSelection(this.selMark0,this.selMark1),this.selMark0.remove(),this.selMark0=null,this.selMark1.remove(),this.selMark1=null,this.params.loopSelection&&this.backend.clearSelection(),this.fireEvent("selection-update",this.getSelection()))},toggleLoopSelection:function(){this.params.loopSelection=!this.params.loopSelection,this.params.loopSelection?this.selMark0&&this.selMark1&&this.updateSelection({startPercentage:this.selMark0.percentage,endPercentage:this.selMark1.percentage}):this.backend.clearSelection()},getSelection:function(){return this.selMark0&&this.selMark1?{startPercentage:this.selMark0.percentage,startPosition:this.selMark0.position,endPercentage:this.selMark1.percentage,endPosition:this.selMark1.position,startTime:this.selMark0.getTitle(),endTime:this.selMark1.getTitle()}:null},enableInteraction:function(){this.params.interact=!0},disableInteraction:function(){this.params.interact=!1},toggleInteraction:function(){this.params.interact=!this.params.interact},enableDragSelection:function(){this.params.dragSelection=!0},disableDragSelection:function(){this.params.dragSelection=!1},toggleDragSelection:function(){this.params.dragSelection=!this.params.dragSelection}};WaveSurfer.Mark={defaultParams:{id:null,position:0,percentage:0,width:1,color:"#333",draggable:!1},init:function(e){return this.apply(WaveSurfer.util.extend({},this.defaultParams,e)),this},getTitle:function(){return[~~(this.position/60),("00"+~~(this.position%60)).slice(-2)].join(":")},apply:function(e){Object.keys(e).forEach(function(t){t in this.defaultParams&&(this[t]=e[t])},this)},update:function(e){this.apply(e),this.fireEvent("update")},remove:function(){this.fireEvent("remove"),this.unAll()}},WaveSurfer.Region={defaultParams:{id:null,startPosition:0,endPosition:0,startPercentage:0,endPercentage:0,color:"rgba(0, 0, 255, 0.2)"},init:function(e){return this.apply(WaveSurfer.util.extend({},this.defaultParams,e)),this},apply:function(e){Object.keys(e).forEach(function(t){t in this.defaultParams&&(this[t]=e[t])},this)},update:function(e){this.apply(e),this.fireEvent("update")},remove:function(){this.fireEvent("remove"),this.unAll()}},WaveSurfer.Observer={on:function(e,t){this.handlers||(this.handlers={});var i=this.handlers[e];i||(i=this.handlers[e]=[]),i.push(t)},un:function(e,t){if(this.handlers){var i=this.handlers[e];if(i)if(t)for(var r=i.length-1;r>=0;r--)i[r]==t&&i.splice(r,1);else i.length=0}},unAll:function(){this.handlers=null},once:function(e,t){var i=this,r=function(){t(),setTimeout(function(){i.un(e,r)},0)};this.on(e,r)},fireEvent:function(e){if(this.handlers){var t=this.handlers[e],i=Array.prototype.slice.call(arguments,1);t&&t.forEach(function(e){e.apply(null,i)})}}},WaveSurfer.util={extend:function(e){var t=Array.prototype.slice.call(arguments,1);return t.forEach(function(t){Object.keys(t).forEach(function(i){e[i]=t[i]})}),e},getId:function(){return"wavesurfer_"+Math.random().toString(32).substring(2)},max:function(e,t){for(var i=-1/0,r=0,n=e.length;n>r;r++){var a=e[r];null!=t&&(a=Math.abs(a-t)),a>i&&(i=a)}return i},ajax:function(e){var t=Object.create(WaveSurfer.Observer),i=new XMLHttpRequest,r=!1;return i.open(e.method||"GET",e.url,!0),i.responseType=e.responseType,i.addEventListener("progress",function(e){t.fireEvent("progress",e),e.lengthComputable&&e.loaded==e.total&&(r=!0)}),i.addEventListener("load",function(e){r||t.fireEvent("progress",e),t.fireEvent("load",e),200==i.status||206==i.status?t.fireEvent("success",i.response,e):t.fireEvent("error",e)}),i.addEventListener("error",function(e){t.fireEvent("error",e)}),i.send(),t.xhr=i,t},throttle:function(e,t,i){var r,n,a,s=null,o=0;i||(i={});var c=function(){o=i.leading===!1?0:Date.now(),s=null,a=e.apply(r,n),r=n=null};return function(){var h=Date.now();o||i.leading!==!1||(o=h);var u=t-(h-o);return r=this,n=arguments,0>=u?(clearTimeout(s),s=null,o=h,a=e.apply(r,n),r=n=null):s||i.trailing===!1||(s=setTimeout(c,u)),a}}},WaveSurfer.util.extend(WaveSurfer,WaveSurfer.Observer),WaveSurfer.util.extend(WaveSurfer.Mark,WaveSurfer.Observer),WaveSurfer.util.extend(WaveSurfer.Region,WaveSurfer.Observer),WaveSurfer.WebAudio={scriptBufferSize:256,fftSize:128,getAudioContext:function(){if(!window.AudioContext&&!window.webkitAudioContext)throw new Error("wavesurfer.js: your browser doesn't support WebAudio");return WaveSurfer.WebAudio.audioContext||(WaveSurfer.WebAudio.audioContext=new(window.AudioContext||window.webkitAudioContext)),WaveSurfer.WebAudio.audioContext},init:function(e){this.params=e,this.ac=e.audioContext||this.getAudioContext(),this.loop=!1,this.prevFrameTime=0,this.scheduledPause=null,this.firedFinish=!1,this.postInit(),this.createVolumeNode(),this.createScriptNode(),this.createAnalyserNode(),this.setPlaybackRate(this.params.audioRate)},disconnectFilters:function(){this.filters&&(this.filters.forEach(function(e){e&&e.disconnect()}),this.filters=null)},setFilter:function(){this.setFilters([].slice.call(arguments))},setFilters:function(e){this.disconnectFilters(),e&&e.length?(this.filters=e,e.reduce(function(e,t){return e.connect(t),t},this.analyser).connect(this.gainNode)):this.analyser.connect(this.gainNode)},createScriptNode:function(){var e=this,t=this.scriptBufferSize;this.scriptNode=this.ac.createScriptProcessor?this.ac.createScriptProcessor(t):this.ac.createJavaScriptNode(t),this.scriptNode.connect(this.ac.destination),this.scriptNode.onaudioprocess=function(){var t=e.getCurrentTime();!e.firedFinish&&e.buffer&&t>=e.getDuration()&&(e.firedFinish=!0,e.fireEvent("finish")),e.isPaused()||(e.onPlayFrame(t),e.fireEvent("audioprocess",t))}},onPlayFrame:function(e){null!=this.scheduledPause&&this.prevFrameTime>=this.scheduledPause&&this.pause(),this.loop&&this.prevFrameTime>this.loopStart&&this.prevFrameTime<=this.loopEnd&&e>this.loopEnd&&this.play(this.loopStart),this.prevFrameTime=e},createAnalyserNode:function(){this.analyser=this.ac.createAnalyser(),this.analyser.fftSize=this.fftSize,this.analyserData=new Uint8Array(this.analyser.frequencyBinCount),this.analyser.connect(this.gainNode)},createVolumeNode:function(){this.gainNode=this.ac.createGain?this.ac.createGain():this.ac.createGainNode(),this.gainNode.connect(this.ac.destination)},setVolume:function(e){this.gainNode.gain.value=e},getVolume:function(){return this.gainNode.gain.value},decodeArrayBuffer:function(e,t,i){var r=this;this.ac.decodeAudioData(e,function(e){r.buffer=e,t(e)},i)},getPeaks:function(e){for(var t=this.buffer,i=t.length/e,r=~~(i/10)||1,n=t.numberOfChannels,a=new Float32Array(e),s=0;n>s;s++)for(var o=t.getChannelData(s),c=0;e>c;c++){for(var h=~~(c*i),u=~~(h+i),d=0,l=h;u>l;l+=r){var f=o[l];f>d?d=f:-f>d&&(d=-f)}(0==s||d>a[c])&&(a[c]=d)}return a},getPlayedPercents:function(){var e=this.getDuration();return this.getCurrentTime()/e||0},disconnectSource:function(){this.firedFinish=!1,this.source&&this.source.disconnect()},destroy:function(){this.pause(),this.unAll(),this.buffer=null,this.disconnectFilters(),this.disconnectSource(),this.gainNode.disconnect(),this.scriptNode.disconnect(),this.analyser.disconnect()},updateSelection:function(e,t){var i=this.getDuration();this.loop=!0,this.loopStart=i*e,this.loopEnd=i*t},clearSelection:function(){this.loop=!1,this.loopStart=0,this.loopEnd=0},waveform:function(){return this.analyser.getByteTimeDomainData(this.analyserData),this.analyserData},postInit:function(){},load:function(){},getCurrentTime:function(){return 0},isPaused:function(){return!0},getDuration:function(){return 0},setPlaybackRate:function(e){this.playbackRate=e||1},play:function(){},pause:function(){}},WaveSurfer.util.extend(WaveSurfer.WebAudio,WaveSurfer.Observer),WaveSurfer.WebAudioBuffer=Object.create(WaveSurfer.WebAudio),WaveSurfer.util.extend(WaveSurfer.WebAudioBuffer,{postInit:function(){this.lastStartPosition=0,this.lastPlay=this.lastPause=this.nextPause=this.ac.currentTime},load:function(e){this.lastStartPosition=0,this.lastPlay=this.lastPause=this.nextPause=this.ac.currentTime,this.buffer=e,this.createSource()},createSource:function(){this.disconnectSource(),this.source=this.ac.createBufferSource(),this.source.playbackRate.value=this.playbackRate,this.source.buffer=this.buffer,this.source.connect(this.analyser)},isPaused:function(){return this.nextPause<=this.ac.currentTime},getDuration:function(){return this.buffer.duration},play:function(e,t){this.createSource(),null==e&&(e=this.getCurrentTime()),null==t&&(t=null!=this.scheduledPause?this.scheduledPause:this.getDuration()),this.lastPlay=this.ac.currentTime,this.lastStartPosition=e,this.lastPause=this.nextPause=this.ac.currentTime+(t-e),this.prevFrameTime=-1,this.source.start?this.source.start(0,e,t-e):this.source.noteGrainOn(0,e,t-e),this.fireEvent("play")},pause:function(){this.scheduledPause=null,this.lastPause=this.nextPause=this.ac.currentTime,this.source&&(this.source.stop?this.source.stop(0):this.source.noteOff(0)),this.fireEvent("pause")},getCurrentTime:function(){return this.isPaused()?this.lastStartPosition+(this.lastPause-this.lastPlay)*this.playbackRate:this.lastStartPosition+(this.ac.currentTime-this.lastPlay)*this.playbackRate},setPlaybackRate:function(e){this.playbackRate=e||1,this.source&&(this.source.playbackRate.value=this.playbackRate)}}),WaveSurfer.WebAudioMedia=Object.create(WaveSurfer.WebAudio),WaveSurfer.util.extend(WaveSurfer.WebAudioMedia,{postInit:function(){var e=this;this.media={currentTime:0,duration:0,paused:!0,playbackRate:1,play:function(){},pause:function(){}},this.maxCurrentTime=0,this.on("audioprocess",function(t){t>e.maxCurrentTime&&(e.maxCurrentTime=t)})},load:function(e){this.disconnectSource(),this.media=e,this.maxCurrentTime=0,this.source=this.ac.createMediaElementSource(this.media),this.media.playbackRate=this.playbackRate,this.source.connect(this.analyser)},isPaused:function(){return this.media.paused},getDuration:function(){return this.media.duration},getCurrentTime:function(){return this.media.currentTime},getPlayedPercents:function(){var e=this.getDuration(),t=this.getCurrentTime();return e>=1/0&&(e=this.maxCurrentTime),t/e||0},setPlaybackRate:function(e){this.playbackRate=e||1,this.media.playbackRate=this.playbackRate},play:function(e,t){null!=e&&(this.media.currentTime=e),this.scheduledPause=null==t?null:t,this.media.play(),this.fireEvent("play")},pause:function(){this.scheduledPause=null,this.media.pause(),this.fireEvent("pause")}}),WaveSurfer.AudioElement=Object.create(WaveSurfer.WebAudioMedia),WaveSurfer.util.extend(WaveSurfer.AudioElement,{init:function(e){this.params=e,this.loop=!1,this.prevFrameTime=0,this.scheduledPause=null,this.postInit(),this.setPlaybackRate(this.params.audioRate)},load:function(e,t){this.media=e,this.peaks=t,this.maxCurrentTime=0,this.setPlaybackRate(this.playbackRate)},getPeaks:function(){return this.peaks||[]},getVolume:function(){return this.media.volume},setVolume:function(e){this.media.volume=e},destroy:function(){this.pause(),this.unAll(),this.media=null}}),WaveSurfer.Drawer={init:function(e,t){this.container=e,this.params=t,this.width=0,this.height=t.height*this.params.pixelRatio,this.lastPos=0,this.createWrapper(),this.createElements()},createWrapper:function(){this.wrapper=this.container.appendChild(document.createElement("wave")),this.style(this.wrapper,{display:"block",position:"relative",userSelect:"none",webkitUserSelect:"none",height:this.params.height+"px"}),(this.params.fillParent||this.params.scrollParent)&&this.style(this.wrapper,{width:"100%",overflowX:this.params.hideScrollbar?"hidden":"auto",overflowY:"hidden"}),this.setupWrapperEvents()},handleEvent:function(e){e.preventDefault();var t=this.wrapper.getBoundingClientRect();return(e.clientX-t.left+this.wrapper.scrollLeft)/this.wrapper.scrollWidth||0},setupWrapperEvents:function(){var e=this,t={};this.wrapper.addEventListener("mousedown",function(i){var r=e.wrapper.offsetHeight-e.wrapper.clientHeight;if(0!=r){var n=e.wrapper.getBoundingClientRect();if(i.clientY>=n.bottom-r)return}e.params.interact&&e.fireEvent("mousedown",e.handleEvent(i),i),t.startPercentage=e.handleEvent(i)}),this.wrapper.addEventListener("mouseup",function(t){e.params.interact&&e.fireEvent("mouseup",t)}),this.wrapper.addEventListener("dblclick",function(t){(e.params.interact||e.params.dragSelection)&&("handler"!=t.target.tagName.toLowerCase()||t.target.classList.contains("selection-wavesurfer-handler")?e.fireEvent("drag-clear"):e.fireEvent("mark-dblclick",t.target.parentNode.id))});var i=function(){t.startPercentage=t.endPercentage=null};document.addEventListener("mouseup",i),this.on("destroy",function(){document.removeEventListener("mouseup",i)}),this.wrapper.addEventListener("mousemove",WaveSurfer.util.throttle(function(i){i.stopPropagation(),null!=t.startPercentage&&(t.endPercentage=e.handleEvent(i),e.params.interact&&e.params.dragSelection&&e.fireEvent("drag",t))},30))},drawPeaks:function(e,t){if(this.resetScroll(),this.setWidth(t),this.params.normalize)var i=WaveSurfer.util.max(e);else i=1;this.drawWave(e,i)},style:function(e,t){return Object.keys(t).forEach(function(i){e.style[i]!=t[i]&&(e.style[i]=t[i])}),e},resetScroll:function(){this.wrapper.scrollLeft=0},recenter:function(e){var t=this.wrapper.scrollWidth*e;this.recenterOnPosition(t,!0)},recenterOnPosition:function(e,t){var i=this.wrapper.scrollLeft,r=~~(this.containerWidth/2),n=e-r,a=n-i,s=this.wrapper.scrollWidth-this.wrapper.clientWidth;if(0!=s){if(!t&&a>=-r&&r>a){var o=5;a=Math.max(-o,Math.min(o,a)),n=i+a}n=Math.max(0,Math.min(s,n)),n!=i&&(this.wrapper.scrollLeft=n)}},getWidth:function(){return Math.round(this.container.clientWidth*this.params.pixelRatio)},setWidth:function(e){e!=this.width&&(this.width=e,this.params.fillParent||this.params.scrollParent?this.style(this.wrapper,{width:""}):this.style(this.wrapper,{width:~~(this.width/this.params.pixelRatio)+"px"}),this.updateWidth())},progress:function(e){var t=1/this.params.pixelRatio,i=Math.round(e*this.width)*t;if(i<this.lastPos||i-this.lastPos>=t){if(this.lastPos=i,this.params.scrollParent){var r=~~(this.wrapper.scrollWidth*e);this.recenterOnPosition(r)}this.updateProgress(e)}},destroy:function(){this.unAll(),this.container.removeChild(this.wrapper),this.wrapper=null},updateSelection:function(e,t){this.startPercent=e,this.endPercent=t,this.drawSelection()},clearSelection:function(e,t){this.startPercent=null,this.endPercent=null,this.eraseSelection(),this.eraseSelectionMarks(e,t)},createElements:function(){},updateWidth:function(){},drawWave:function(){},clearWave:function(){},updateProgress:function(){},addMark:function(){},removeMark:function(){},updateMark:function(){},addRegion:function(){},removeRegion:function(){},updateRegion:function(){},drawSelection:function(){},eraseSelection:function(){},eraseSelectionMarks:function(){}},WaveSurfer.util.extend(WaveSurfer.Drawer,WaveSurfer.Observer),WaveSurfer.Drawer.Canvas=Object.create(WaveSurfer.Drawer),WaveSurfer.util.extend(WaveSurfer.Drawer.Canvas,{createElements:function(){var e=this.wrapper.appendChild(this.style(document.createElement("canvas"),{position:"absolute",zIndex:1}));this.progressWave=this.wrapper.appendChild(this.style(document.createElement("wave"),{position:"absolute",zIndex:2,overflow:"hidden",width:"0",height:this.params.height+"px",borderRight:[this.params.cursorWidth+"px","solid",this.params.cursorColor].join(" ")}));var t=this.progressWave.appendChild(document.createElement("canvas")),i=0;this.params.selectionForeground&&(i=3);var r=this.wrapper.appendChild(this.style(document.createElement("canvas"),{position:"absolute",zIndex:i}));this.waveCc=e.getContext("2d"),this.progressCc=t.getContext("2d"),this.selectionCc=r.getContext("2d")},updateWidth:function(){var e=Math.round(this.width/this.params.pixelRatio);[this.waveCc,this.progressCc,this.selectionCc].forEach(function(t){t.canvas.width=this.width,t.canvas.height=this.height,this.style(t.canvas,{width:e+"px"})},this),this.clearWave()},clearWave:function(){this.waveCc.clearRect(0,0,this.width,this.height),this.progressCc.clearRect(0,0,this.width,this.height)},drawWave:function(e,t){var i=.5/this.params.pixelRatio;this.waveCc.fillStyle=this.params.waveColor,this.progressCc.fillStyle=this.params.progressColor;var r=this.height/2,n=r/t,a=1;this.params.fillParent&&this.width>e.length&&(a=this.width/e.length);var s=e.length;this.waveCc.beginPath(),this.waveCc.moveTo(i,r),this.progressCc.beginPath(),this.progressCc.moveTo(i,r);for(var o=0;s>o;o++){var c=Math.round(e[o]*n);this.waveCc.lineTo(o*a+i,r+c),this.progressCc.lineTo(o*a+i,r+c)}this.waveCc.lineTo(this.width+i,r),this.progressCc.lineTo(this.width+i,r),this.waveCc.moveTo(i,r),this.progressCc.moveTo(i,r);for(var o=0;s>o;o++){var c=Math.round(e[o]*n);this.waveCc.lineTo(o*a+i,r-c),this.progressCc.lineTo(o*a+i,r-c)}this.waveCc.lineTo(this.width+i,r),this.waveCc.fill(),this.progressCc.lineTo(this.width+i,r),this.progressCc.fill(),this.waveCc.fillRect(0,r-i,this.width,i)},updateProgress:function(e){var t=Math.round(this.width*e)/this.params.pixelRatio;this.style(this.progressWave,{width:t+"px"})},addMark:function(e){var t=this,i=document.createElement("mark");i.id=e.id,e.type&&"selMark"===e.type&&(i.className="selection-mark"),this.wrapper.appendChild(i);var r;e.draggable&&(r=document.createElement("handler"),r.id=e.id+"-handler",r.className="selMark"===e.type?"selection-wavesurfer-handler":"wavesurfer-handler",i.appendChild(r)),i.addEventListener("mouseover",function(i){t.fireEvent("mark-over",e,i)}),i.addEventListener("mouseleave",function(i){t.fireEvent("mark-leave",e,i)}),i.addEventListener("click",function(i){t.fireEvent("mark-click",e,i)}),e.draggable&&function(){var i={},n=function(e){e.stopPropagation(),i.startPercentage=i.endPercentage=null};document.addEventListener("mouseup",n),t.on("destroy",function(){document.removeEventListener("mouseup",n)}),r.addEventListener("mousedown",function(e){e.stopPropagation(),i.startPercentage=t.handleEvent(e)}),t.wrapper.addEventListener("mousemove",WaveSurfer.util.throttle(function(r){r.stopPropagation(),null!=i.startPercentage&&(i.endPercentage=t.handleEvent(r),t.fireEvent("drag-mark",i,e))},30))}(),this.updateMark(e),e.draggable&&(this.style(r,{position:"absolute",cursor:"col-resize",width:"12px",height:"15px"}),this.style(r,{left:r.offsetWidth/2*-1+"px",top:i.offsetHeight/2-r.offsetHeight/2+"px",backgroundColor:e.color}))},updateMark:function(e){var t=document.getElementById(e.id);t.title=e.getTitle(),this.style(t,{height:"100%",position:"absolute",zIndex:4,width:e.width+"px",left:Math.max(0,Math.round(e.percentage*this.wrapper.scrollWidth-e.width/2))+"px",backgroundColor:e.color})},removeMark:function(e){var t=document.getElementById(e.id);t&&this.wrapper.removeChild(t)},addRegion:function(e){var t=this,i=document.createElement("region");i.id=e.id,this.wrapper.appendChild(i),i.addEventListener("mouseover",function(i){t.fireEvent("region-over",e,i)}),i.addEventListener("mouseleave",function(i){t.fireEvent("region-leave",e,i)}),i.addEventListener("click",function(i){t.fireEvent("region-click",e,i)}),this.updateRegion(e)},updateRegion:function(e){var t=document.getElementById(e.id),i=Math.max(0,Math.round(e.startPercentage*this.wrapper.scrollWidth)),r=Math.max(0,Math.round(e.endPercentage*this.wrapper.scrollWidth))-i;this.style(t,{height:"100%",position:"absolute",zIndex:4,left:i+"px",top:"0px",width:r+"px",backgroundColor:e.color})},removeRegion:function(e){var t=document.getElementById(e.id);t&&this.wrapper.removeChild(t)},drawSelection:function(){this.eraseSelection(),this.selectionCc.fillStyle=this.params.selectionColor;var e=this.startPercent*this.width,t=this.endPercent*this.width-e;this.selectionCc.fillRect(e,0,t,this.height)},eraseSelection:function(){this.selectionCc.clearRect(0,0,this.width,this.height)
},eraseSelectionMarks:function(e,t){this.removeMark(e),this.removeMark(t)}});
//# sourceMappingURL=/build/wavesurfer-js-map.json