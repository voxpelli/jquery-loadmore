/*jslint browser: true, maxerr: 50, indent: 2 */
/*global jQuery: false */
(function ($) {
  "use strict";

  // Below taken from tipsy.js
  var maybeCall = function (value, context) {
    return (typeof value === 'function') ? (value.call(context)) : value;
  };

  $.fn.loadMore = function (url, options) {
    var done, update;

    options = $.extend({}, $.fn.loadMore.defaults, options);

    done = function () {
      var $this = $(this);
      if (options.done) {
        options.done.call($this);
      }
      $this.remove();
    };

    update = function () {
      var $this = $(this), $text = $this.children('span.text'), requestedPage = options.page;

      if ($this.hasClass('loading')) {
        return false;
      }

      $this.addClass('loading');
      $text.text(maybeCall(options.loadingText, $text[0]));

      $.get(url, {page : (options.page + 1)})
        .fail(function () {
          //TODO: Do the fail dance
        })
        .done(function (data) {
          if (requestedPage !== options.page) {
            return;
          }

          options.page += 1;
          $this.removeClass('loading');
          $text.text(maybeCall(options.text, $text[0]));

          var $newData = $(data).filter('*').insertBefore($this);

          if (options.pageSize !== false && $newData.length < options.pageSize) {
            done.call($this[0]);
          }

          if (options.loaded && options.loaded.call($newData) === false && $this.closest('.more').length) {
            done.call($this[0]);
          }
        });
      return false;
    };

    this.each(function () {
      if (options.pageSize !== false && $(this).children().length < options.pageSize) {
        return;
      }

      var $more = $('<a />', {
          'class' : 'more ' + options.className,
          'href' : '#'
        }),
        $text = $('<span />', {'class' : 'text'});
      $text
        .appendTo($more)
        .text(maybeCall(options.text, $text[0]));
      $more.appendTo(this).click(update);
    });

    return this;
  };

  $.fn.loadMore.defaults = {
    'className' : '',
    text : 'More',
    loadingText : 'Loading',
    page : 0,
    pageSize : false,
    'pageParam' : 'page',
    loaded : false
  };
}(jQuery));
