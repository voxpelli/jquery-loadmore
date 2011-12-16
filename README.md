loadMore.js
=======

loadMore.js is a jQuery plugin for easily adding a "more"-link based pagination to an element on ones site.

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
      'pageParam' : 'page',
      loaded : false
    });

## Advanced options

* **className** - extra classes to add to the more-link container
* **text** - text to use in the more-link - should be either a string or a function
* **loadingText** - text to use in the more-link when it is loading - should be either a string or a function
* **page** - which page should be fetched on the first more-click?
* **pageSize** - how many elements should be expected on a new page? If less than this amount is received we've reached the end and removes the more-link.
* **pageParam** - what's the name of the query parameter for the page to fetch in the AJAX-requests?
* **loaded** - a function to execute once a new page has been loaded

## Support

[![Flattr this git repo](http://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=voxpelli&url=https://github.com/voxpelli/jquery-loadmore&title=loadMore.js&language=en_GB&tags=github&category=software)
