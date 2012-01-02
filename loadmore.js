/*jslint browser: true, maxerr: 50, indent: 2 */
/*global jQuery: false */
(function ($) {
  "use strict";

  var maybeCall, update, supportsHistory, replaceHistoryState, idCount = 0;

  // Below taken from tipsy.js
  maybeCall = function (value, context) {
    return (typeof value === 'function') ? (value.call(context)) : value;
  };

  update = function (pageTarget) {
    var $this = $(this),
      options = $this.data('loadmore-options'),
      $text = $this.children('span.text'),
      currentPage = $this.data('loadmore-page'),
      params = {};

    if ($this.hasClass('loading') || pageTarget <= currentPage) {
      return false;
    }

    $this.addClass('loading');
    $text.text(maybeCall(options.loadingText, $text[0]));

    if (pageTarget - currentPage > 1) {
      params[options.pageStartParam] = currentPage + 1;
      if (options.maxPageCount !== false && options.maxPageCount < pageTarget - currentPage) {
        pageTarget = currentPage + options.maxPageCount;
      }
    }
    params[options.pageParam] = pageTarget;

    $.get(options.url, params)
      .fail(function () {
        //TODO: Do the fail dance
      })
      .done(function (data) {
        if (currentPage !== $this.data('loadmore-page')) {
          return;
        }

        var historyState = {}, $newData;

        $this.data('loadmore-page', pageTarget);
        $this.removeClass('loading');
        $text.text(maybeCall(options.text, $text[0]));

        if (options.useHistoryAPI) {
          historyState[$this.attr('id')] = pageTarget;
          replaceHistoryState({loadmore : historyState});
        }

        $newData = $(data).filter('*').insertBefore($this);

        if (options.rowsPerPage !== false && $newData.length < options.rowsPerPage) {
          $this.trigger('loadmore:last').remove();
        }

        if (options.complete && options.complete.call($newData) === false && $this.closest('.more').length) {
          $this.trigger('loadmore:last').remove();
        }
      });
    return false;
  };

  $.fn.loadmore = function (url, options) {
    if (typeof url === 'object') {
      options = $.extend({}, $.fn.loadmore.defaults, url);
    } else {
      options = $.extend({}, $.fn.loadmore.defaults, options);
      options.url = url;
    }

    this.each(function () {
      if (options.rowsPerPage !== false && $(this).children().length < options.rowsPerPage) {
        return;
      }

      var $more, $text, id, idDuplicates = 0;

      if (options.id) {
        id = options.id;
        while ($('#' + id).length) {
          idDuplicates += 1;
          id = options.id + '-' + idDuplicates;
        }
      } else {
        idCount += 1;
        id = 'loadmore-' + idCount;
      }

      $more = $('<a />', {
        'id' : id,
        'class' : 'more ' + options.className,
        'href' : '#'
      })
        .data('loadmore-page', options.page)
        .data('loadmore-options', options);

      $text = $('<span />', {'class' : 'text'});
      $text.appendTo($more)
        .text(maybeCall(options.text, $text[0]));

      $more.appendTo(this).click(function () {
        return update.call(this, $(this).data('loadmore-page') + 1);
      });

      if (window.history.state && window.history.state.loadmore && window.history.state.loadmore[id]) {
        update.call($more[0], window.history.state.loadmore[id]);
      }
    });

    return this;
  };

  $.fn.loadmore.defaults = {
    id : null,
    className : '',
    text : 'More',
    loadingText : 'Loading',
    page : 0,
    rowsPerPage : false,
    maxPageCount : false,
    pageParam : 'page',
    pageStartParam : 'start',
    complete : false,
    useHistoryAPI : true
  };

  // Below taken from jquery.pjax.js
  supportsHistory =
    window.history && window.history.pushState && window.history.replaceState
    // pushState isn't reliable on iOS yet.
    && !navigator.userAgent.match(/(iPod|iPhone|iPad|WebApps\/.+CFNetwork)/);

  replaceHistoryState = function (state, title, url) {
    if (supportsHistory) {
      window.history.replaceState(
        jQuery.extend(true, window.history.state, state),
        title || document.title,
        url || window.location.href
      );
    }
  };

  if (supportsHistory) {
    $(window).on('popstate', function (event) {
      var id, $elem, state = event.originalEvent.state.loadmore || {};
      for (id in state) {
        if (state.hasOwnProperty(id)) {
          $elem = $('#' + id);
          if ($elem.length) {
            update.call($elem[0], state[id]);
          }
        }
      }
    });
  }
}(jQuery));
