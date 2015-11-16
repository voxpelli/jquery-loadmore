/*jslint browser: true, maxerr: 50, indent: 2 */
/*global jQuery: false */
(function ($) {
  "use strict";

  var maybeCall, update, getItemCount, moreClick, supportsHistory, idCount = 0;

  // Below taken from tipsy.js
  maybeCall = function (value, context) {
    return (typeof value === 'function') ? (value.call(context)) : value;
  };

  update = function (pageTarget) {
    var $this = $(this),
      options = $this.data('loadmore-options'),
      $text = $this.children('span.text'),
      currentPage = (options.useOffset ? getItemCount($this, options) : $this.data('loadmore-page')),
      url = options.url,
      params = {};

    if ($this.hasClass('loading') || pageTarget <= currentPage) {
      return false;
    }

    $this.addClass('loading');
    $text.text(maybeCall(options.loadingText, $text[0]));

    if (pageTarget - currentPage > 1 && options.pageStartParam) {
      params[options.pageStartParam] = currentPage + 1 + options.baseOffset;
      if (options.maxPageCount !== false && (options.maxPageCount * (options.useOffset ? options.rowsPerPage : 1)) < pageTarget - currentPage) {
        pageTarget = currentPage + options.maxPageCount;
      }
    }
    if (options.pageParam) {
      params[options.pageParam] = pageTarget + options.baseOffset;
    }

    if (options.processUrl) {
      url = options.processUrl(url, params);
      params = url.params || {};
      url = url.url || url;
    }

    $.get(url, params)
      .fail(function () {
        //TODO: Do the fail dance
      })
      .done(function (data) {
        if (!options.useOffset && currentPage !== $this.data('loadmore-page')) {
          return;
        }

        var historyState = {}, $newData, itemCount;

        if (!options.useOffset) {
          $this.data('loadmore-page', pageTarget);
        }
        $this.removeClass('loading');
        $text.text(maybeCall(options.text, $text[0]));

        if (supportsHistory && options.useHistoryAPI) {
          historyState[$this.attr('id')] = pageTarget;
          window.history.replaceState(jQuery.extend(true, window.history.state, {loadmore : historyState}), document.title);
        }

        $newData = $(data).filter('*');
        if (options.filterResult) {
          $newData = $newData.find(options.filterResult).add($newData.filter(options.filterResult));
        }

        $newData = $('<div>').append($newData);

        itemCount = (options.itemSelector ? $(options.itemSelector, $newData) : $newData).length;

        if (options.useExistingButton) {
          $newData.children().appendTo($this.data('loadmore-container'));
        } else {
          $newData.children().insertBefore($this);
        }

        if (options.rowsPerPage !== false && itemCount < (options.useOffset ? 1 : options.rowsPerPage) * (pageTarget - currentPage)) {
          $this.trigger('loadmore:last').remove();
        }

        if (options.complete && options.complete.call($newData) === false && $this.parent().length) {
          $this.trigger('loadmore:last').remove();
        }
      });
    return false;
  };

  getItemCount = function ($this, options) {
    return (options.itemSelector ? $(options.itemSelector, $this.data('loadmore-container')) : $this.siblings()).length;
  };

  moreClick = function (e) {
    var page, $this = $(this), options = $this.data('loadmore-options');
    if (options.useOffset) {
      page = getItemCount($this, options) + options.rowsPerPage;
    }
    else
    {
      page = $this.data('loadmore-page') + 1;
    }
    return update.call(this, page);
  };

  $.fn.loadmore = function (url, options) {
    if (typeof url === 'object') {
      options = $.extend({}, $.fn.loadmore.defaults, url);
    } else {
      options = $.extend({}, $.fn.loadmore.defaults, options);
      options.url = url;
    }

    this.each(function () {
      var $more, $text, id, itemCount, moreBaseOffset, idDuplicates = 0;

      itemCount = (options.itemSelector ? $(options.itemSelector, this) : $(this).children()).length;

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

      if (options.useExistingButton) {
        $more = $(options.useExistingButton);

        options.text = $more.text();

        moreBaseOffset = options.interpretUrl ? options.interpretUrl($more.get(0), itemCount, options): undefined;

        if (moreBaseOffset) {
          options.baseOffset = moreBaseOffset;
        }
      } else {
        $more = $('<a />', {
          'id' : id,
          'class' : options.className,
          'href' : '#'
        });

        $text = $('<span />', {'class' : 'text'});
        $text.appendTo($more)
          .text(maybeCall(options.text, $text[0]));
      }

      $more.data('loadmore-options', options);
      $more.data('loadmore-container', this);

      if (!options.useOffset) {
        $more.data('loadmore-page', options.page);
      }

      if (!options.useExistingButton) {
        if (options.rowsPerPage !== false && itemCount < options.rowsPerPage) {
          return;
        }

        $more.appendTo(this);
      }

      $more.click(moreClick);

      if (supportsHistory && options.useHistoryAPI && window.history.state && window.history.state.loadmore && window.history.state.loadmore[id]) {
        update.call($more[0], window.history.state.loadmore[id]);
      }
    });

    return this;
  };

  $.fn.loadmore.defaults = {
    id : null,
    className : 'more',
    useExistingButton: false,
    text : 'More',
    loadingText : 'Loading',
    page : 0,
    rowsPerPage : false,
    maxPageCount : false,
    pageParam : 'page',
    pageStartParam : 'start',
    filterResult: '*',
    complete : false,
    useHistoryAPI : true,
    useOffset : false,
    baseOffset: 0,
    processUrl: false,
    interpretUrl: function (loc, itemCount, options) {
      var result;

      loc.search.substr(1).split('&').some(function (pair) {
        pair = pair.split('=');
        if (pair[0] === options.pageParam) {
          result = parseInt(pair[1]) + options.baseOffset;
          return true;
        } else if (pair[0] === options.pageStartParam) {
          result = parseInt(pair[1]) + options.baseOffset - itemCount;
          return true;
        }
      });

      return result;
    }
  };

  // Below partly taken from jquery.pjax.js
  supportsHistory =
    window.history && window.history.pushState && window.history.replaceState
    // History API isn't reliable on iOS yet and Safari and Chrome doesn't implement history.state
    && !navigator.userAgent.match(/(iPod|iPhone|iPad|Safari\/|Chrome\/|WebApps\/.+CFNetwork)/);

  if (supportsHistory) {
    // Below taken from jquery.pjax.js
    // Add the state property to jQuery's event object so we can use it in
    // $(window).bind('popstate')
    if ($.inArray('state', $.event.props) < 0) {
      $.event.props.push('state');
    }

    $(window).on('popstate', function (event) {
      var id, $elem, state = (event.state || {}).loadmore || {};
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

  $.loadmore = {
    supportsHistory : supportsHistory,
    removeHistoryState : function (id) {
        if (supportsHistory && window.history.state && window.history.state.loadmore && window.history.state.loadmore[id]) {
          var state =  window.history.state;
          delete state.loadmore[id];
          window.history.replaceState(state, document.title);
        }
      }
  };
}(jQuery));
