loadMore.js
=======

loadMore.js is a jQuery plugin for easily adding an AJAX-based "more"-link pagination to an element on ones site.

## Usage

Simple:

    $('.list').loadmore('/path/to/more/html');

Advanced:

    $('.list').loadmore('/path/to/more/html', {
      'className' : '',
      text : 'More',
      loadingText : 'Loading',
      page : 0,
      pageSize : false,
      'pageParam' : 'page'
    });

## Advanced options

* **id** - a string identifier for this particular pager to make it easier for the History API integration to restore the correct pager.
* **className** - extra classes to add to the more-link container
* **text** - text to use in the more-link - should be either a string or a function
* **loadingText** - text to use in the more-link when it is loading - should be either a string or a function
* **page** - the current page in the list
* **rowsPerPage** - how many elements should be expected on a new page? If less than this amount is received we've reached the end and will remove the pager
* **maxPageCount** - the maximum numbers of pages to fetch at once - used by the History API integration
* **pageParam** - the query parameter used to specify which page to fetch. If set to `false` no param will be specified.
* **pageStartParam** - when more than one page is fetched at once this is the query parameter used to specify the page to start from. If set to `false` no param will be specified.
* **complete** - a function to execute once a new page has been loaded, return false if the pager should be removed
* **useHistoryAPI** - whether to use the History API in supported browsers or not
* **useOffset** – whether to use offsets rather than page numbers
* **useExistingButton** – rather than creating a new button, use an existing one matching this selector / element
* **filterResult** – filter the received result by these selectors
* **itemSelector** – the selector used to count items
* **baseOffset** – an offset to add to all offsets. Will be parsed from any `pageParam` or `pageStartParam` query params on an existing button.
* **processUrl** – for complex URL cases, define a method that will be sent `url` and `params` and returns either an object with a `url` and `params` key or a `url` string if no params should be used anymore.
* **interpretUrl** – if one uses both `processUrl` and `useExistingButton` then one will likely have to have a custom method to extract the modfied `baseOffset` from the existing button. Receives `Location` object, `itemCount` and `options`.

### Events

* **loadmore:last** - triggered on the pager when the last page has been fetched

## In action on

* **Flattr.com**, eg. https://flattr.com/profile/voxpelli

## Support

[![Flattr this git repo](http://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=voxpelli&url=https://github.com/voxpelli/jquery-loadmore&title=loadmore.js&language=en_GB&tags=github&category=software)
