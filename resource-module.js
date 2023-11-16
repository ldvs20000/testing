// Begin Search Input
$(document).ready(function() {
//     $('.hs-search-results .categories .results-filters').select2({
//       minimumResultsForSearch: -1
//     });
    // Check if the query string does not contain "term="
  if (window.location.search.indexOf("term=") === -1) {
    // Hide the "featured-resources-section" div container
    $(".resources-section .featured-resources-section").show();
    $(".resources-section .bottom-results .listing").show();
    $('.resources-section .bottom-results .load-more').show();
  }
});
var hsSearch = function(_instance) {
  var TYPEAHEAD_LIMIT = 3;
  var KEYS = {
    TAB: 'Tab',
    ESC: 'Esc', // IE11 & Edge 16 value for Escape
    ESCAPE: 'Escape',
    UP: 'Up', // IE11 & Edge 16 value for Arrow Up
    ARROW_UP: 'ArrowUp',
    DOWN: 'Down', // IE11 & Edge 16 value for Arrow Down
    ARROW_DOWN: 'ArrowDown',
  };
  var searchTerm = '',
    searchForm = _instance,
    searchField = _instance.querySelector('.hs-search-field__input'),
    searchResults = _instance.querySelector('.hs-search-field__suggestions'),
    searchOptions = function() {
      var formParams = [];
      var form = _instance.querySelector('form');
      for (
        var i = 0;
        i < form.querySelectorAll('input[type=hidden]').length;
        i++
      ) {
        var e = form.querySelectorAll('input[type=hidden]')[i];
        if (e.name !== 'limit') {
          formParams.push(
            encodeURIComponent(e.name) + '=' + encodeURIComponent(e.value)
          );
        }
      }
      var queryString = formParams.join('&');
      return queryString;
    };

  var debounce = function(func, wait, immediate) {
      var timeout;
      return function() {
        var context = this,
          args = arguments;
        var later = function() {
          timeout = null;
          if (!immediate) {
            func.apply(context, args);
          }
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait || 200);
        if (callNow) {
          func.apply(context, args);
        }
      };
    },
    emptySearchResults = function() {
      searchResults.innerHTML = '';
      searchField.focus();
      searchForm.classList.remove('hs-search-field--open');
    },
    fillSearchResults = function(response) {
      var items = [];
      items.push(
        "<li id='results-for'>Results for \"" + response.searchTerm + '"</li>'
      );
      response.results.forEach(function(val, index) {
        items.push(
          "<li id='result" +
            index +
            "'><a href='" +
            val.url +
            "'>" +
            val.title +
            '</a></li>'
        );
      });

      emptySearchResults();
      searchResults.innerHTML = items.join('');
      searchForm.classList.add('hs-search-field--open');
    },
    getSearchResults = function() {
      var request = new XMLHttpRequest();
      var requestUrl =
        '/_hcms/search?&term=' +
        encodeURIComponent(searchTerm) +
        '&limit=' +
        encodeURIComponent(TYPEAHEAD_LIMIT) +  
        '&autocomplete=true&analytics=true&' +
        searchOptions();

      request.open('GET', requestUrl, true);
      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          var data = JSON.parse(request.responseText);
          if (data.total > 0) {
            fillSearchResults(data);
            trapFocus();
          } else {
            emptySearchResults();
          }
        } else {
          console.error('Server reached, error retrieving results.');
        }
      };
      request.onerror = function() {
        console.error('Could not reach the server.');
      };
      request.send();
    },
    trapFocus = function() {
      var tabbable = [];
      tabbable.push(searchField);
      var tabbables = searchResults.getElementsByTagName('A');
      for (var i = 0; i < tabbables.length; i++) {
        tabbable.push(tabbables[i]);
      }
      var firstTabbable = tabbable[0],
        lastTabbable = tabbable[tabbable.length - 1];
      var tabResult = function(e) {
          if (e.target == lastTabbable && !e.shiftKey) {
            e.preventDefault();
            firstTabbable.focus();
          } else if (e.target == firstTabbable && e.shiftKey) {
            e.preventDefault();
            lastTabbable.focus();
          }
        },
        nextResult = function(e) {
          e.preventDefault();
          if (e.target == lastTabbable) {
            firstTabbable.focus();
          } else {
            tabbable.forEach(function(el) {
              if (el == e.target) {
                tabbable[tabbable.indexOf(el) + 1].focus();
              }
            });
          }
        },
        lastResult = function(e) {
          e.preventDefault();
          if (e.target == firstTabbable) {
            lastTabbable.focus();
          } else {
            tabbable.forEach(function(el) {
              if (el == e.target) {
                tabbable[tabbable.indexOf(el) - 1].focus();
              }
            });
          }
        };
      searchForm.addEventListener('keydown', function(e) {
        switch (e.key) {
          case KEYS.TAB:
            tabResult(e);
            break;
          case KEYS.ESC:
          case KEYS.ESCAPE:
            emptySearchResults();
            break;
          case KEYS.UP:
          case KEYS.ARROW_UP:
            lastResult(e);
            break;
          case KEYS.DOWN:
          case KEYS.ARROW_DOWN:
            nextResult(e);
            break;
        }
      });
    },
    isSearchTermPresent = debounce(function() {
      searchTerm = searchField.value;
      if (searchTerm.length > 2) {
        getSearchResults();
      } else if (searchTerm.length == 0) {
        emptySearchResults();
      }
    }, 250),
    init = (function() {
      searchField.addEventListener('input', function(e) {
        if (searchTerm != searchField.value) {
          isSearchTermPresent();
        }
      });
    })();
};

if (
  document.attachEvent
    ? document.readyState === 'complete'
    : document.readyState !== 'loading'
) {
  var searchResults = document.querySelectorAll('.hs-search-field');
  Array.prototype.forEach.call(searchResults, function(el) {
    var hsSearchModule = hsSearch(el);
  });
} else {
  document.addEventListener('DOMContentLoaded', function() {
    var searchResults = document.querySelectorAll('.hs-search-field');
    Array.prototype.forEach.call(searchResults, function(el) {
      var hsSearchModule = hsSearch(el);
    });
  });
}
// End Search Input

// Begin Search Results
var hsResultsPage = function(_resultsClass, _filterMethod = '') {
  function buildResultsPage(_instance) {
    var resultTemplate = _instance.querySelector(
      '.hs-search-results__template'
    );
    var resultsSection = _instance.querySelector('.hs-search-results__listing');
    var searchPath = _instance
      .querySelector('.hs-search-results__pagination')
      .getAttribute('data-search-path');
    var prevLink = _instance.querySelector('.hs-search-results__prev-page');
    var nextLink = _instance.querySelector('.hs-search-results__next-page');
    
    var searchParams = new URLSearchParams(window.location.search.slice(1));
    var results_total = 0;
    var searchedTerm = "";

    /**
     * v1 of the search input module uses the `q` param for the search query.
     * This check is a fallback for a mixed v0 of search results and v1 of search input.
     */

    if (searchParams.has('q')) {
      searchParams.set('term', searchParams.get('q'));
      searchParams.delete('q');
    }

    function getTerm() {
      return searchParams.get('term') || '';
    }
    function getOffset() {
      return parseInt(searchParams.get('offset')) || 0;
    }
    function getLimit() {
      return parseInt(searchParams.get('limit'));
    }
    function addResult(title, url, description, featuredImage, tableId, rowId, score) {
      var newResult = document.importNode(resultTemplate.content, true);
      if (typeof tableId !== 'undefined' && tableId != '' && typeof rowId !== 'undefined' && rowId != '' && score > 2 ) {
        var row = $.get( 'https://api.hubapi.com/cms/v3/hubdb/tables/' + tableId + '/rows/' + rowId + '?portalId=8645105', function(resource_row) {
            var title = resource_row.values.resource_title;
//             var summary = resource_row.values.resource_summary;
//             var image = resource_row.values.resource_image.url;
            var category = resource_row.values.resource_category.label;
            var resource_type = resource_row.values.resource_type.label;
            var link = resource_row.values.resource_link;
            var resource_type_class = 'resource-type-' + resource_row.values.resource_type.id;
            newResult.querySelector('.title').innerHTML = title;
            newResult.querySelector('.item').href = link;
            newResult.querySelector('.icon').classList.add(resource_type_class);
            newResult.querySelector('.category').innerHTML = resource_type;
//             newResult.querySelector('.summary').innerHTML = summary;
            resultsSection.appendChild(newResult);
        });
      }
    }
    function fillResults(results) {
      $('.resources-section .resources .resource').removeClass('active');
      $('.hs_cos_wrapper_type_inline_rich_text >h1').html('SEARCH RESULTS');
      $('.resources-section .featured-resources-section, .resources-section .bottom-results .load-more, .resources-section .bottom-results .listing').html('');
      $('.resources-section .hs-search-results').addClass('active');
      searchedTerm = results.searchTerm;
                
      function getRow(rowId) {
        return new Promise(function(resolve, reject) {
          var request_row = new XMLHttpRequest();
          request_row.open('GET', 'https://api.hubapi.com/cms/v3/hubdb/tables/6157938/rows/' + rowId + '?portalId=8645105' , true);
          request_row.onload = function() {
            if (request_row.status >= 200 && request_row.status < 400) {
              var data_row = JSON.parse(request_row.responseText);
              resolve({
                resource_title: data_row.values.resource_title,
                resource_summary: data_row.values.resource_summary,
                resource_date: data_row.createdAt
              });
            } else {
              reject('Server reached, error retrieving results.');
            }
          };
          request_row.send();
        });
      }
      
      // Define the compare function to sort based on score 
      function compare(a, b, prop, isString, isDate, order) {
        let propA, propB;
        if (isString) {
          propA = a[prop].toUpperCase();
          propB = b[prop].toUpperCase();
        } else if (isDate) {
          propA = new Date(a[prop]);
          propB = new Date(b[prop]);
        } else {
          propA = a[prop];
          propB = b[prop];
        }
        let comparison = 0;
        if (propA > propB) {
          comparison = 1;
        } else if (propA < propB) {
          comparison = -1;
        }
        return order === "desc" ? comparison * -1 : comparison;
      }

      var promises = results.results.map(function(result, i) {
        var row_id_result = result.rowId;
        return getRow(row_id_result).then(function(rowData) {
          result.resource_title = rowData.resource_title;
          result.resource_summary = rowData.resource_summary;
          result.resource_date = rowData.resource_date;
          return result;
        }).catch(function(error) {
          console.error(error);
        });
      });

      Promise.all(promises).then(function(results) {
        // Use the resource_title property here
//         console.log(results);
        //Sort the results array using the compare function
        switch(_filterMethod) {
          case "a-z":
            results.sort((a, b) => compare(a, b, "resource_title", true, false, "asc"));
            break;
          case "z-a":
            results.sort((a, b) => compare(a, b, "resource_title", true, false, "desc"));
            break;
          case "newest":
            results.sort((a, b) => compare(a, b, "resource_date", false, true, "asc"));
            break;
          case "most-relevant":
            break;
          default:
            console.log("Error");
        }
        results.forEach(function(result, i) {
          addResult(
            result.title,
            result.url,
            result.description,
            result.featuredImageUrl,
            result.tableId,
            result.rowId,
            result.score
          );
          if (typeof result.tableId !== 'undefined' && result.tableId != '' && typeof result.rowId !== 'undefined' && result.rowId != '' && result.score > 2 ) {
            results_total += 1;
          }
        });
        $('.resources-section .hs-search-results .subtitle .results-count').html('We found <strong>' + results_total + '</strong> results for “' + searchedTerm + '"' );    
      }).catch(function(error) {
        console.error(error);
      });
   
    }
    function emptyPagination() {
      prevLink.innerHTML = '';
      nextLink.innerHTML = '';
    }
    function emptyResults(searchedTerm) {
      resultsSection.innerHTML =
        '<div class="hs-search__no-results"><p>Sorry. There are no results for "' +
        searchedTerm +
        '"</p>' +
        '<p>Try rewording your query, or browse through our site.</p></div>';
    }
    function setSearchBarDefault(searchedTerm) {
      var searchBars = document.querySelectorAll('.hs-search-field__input');
      Array.prototype.forEach.call(searchBars, function(el) {
        el.value = searchedTerm;
      });
    }
    function httpRequest(term, offset) {
      var SEARCH_URL = '/_hcms/search?';
      var requestUrl = SEARCH_URL + searchParams + '&tableId=6157938&analytics=true';
      var request = new XMLHttpRequest();

      request.open('GET', requestUrl, true);
      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          var data = JSON.parse(request.responseText);
          setSearchBarDefault(data.searchTerm);
            var total_count = 0;
//             console.log(data);
            $.each(data.results, function(index, result) {
              if (typeof result.tableId !== 'undefined' && result.tableId != '' && typeof result.rowId !== 'undefined' && result.rowId != '' && result.score > 2 ) {
                total_count += 1;
              }
            });
          if (total_count > 0) {
            fillResults(data);
            paginate(data, total_count);
          } else {
            emptyResults(data.searchTerm);
            emptyPagination();
          }
        } else {
          console.error('Server reached, error retrieving results.');
        }
      };
      request.onerror = function() {
        console.error('Could not reach the server.');
      };
      request.send();
    }
    function paginate(results, total_count) {
      var updatedLimit = getLimit() || results.limit;

      function hasPreviousPage() {
        return results.page > 0;
      }
      function hasNextPage() {
        return results.offset <= total_count - updatedLimit;
      }

      if (hasPreviousPage()) {
        var prevParams = new URLSearchParams(searchParams.toString());
        prevParams.set(
          'offset',
          results.page * updatedLimit - parseInt(updatedLimit)
        );
        prevLink.href = searchPath + '?' + prevParams;
        prevLink.innerHTML = '&lt; Previous page';
      } else {
        prevLink.parentNode.removeChild(prevLink);
      }

      if (hasNextPage()) {
        var nextParams = new URLSearchParams(searchParams.toString());
        nextParams.set(
          'offset',
          results.page * updatedLimit + parseInt(updatedLimit)
        );
        nextLink.href = searchPath + '?' + nextParams;
        nextLink.innerHTML = 'Next page &gt;';
      } else {
        nextLink.parentNode.removeChild(nextLink);
      }
    }
    var getResults = (function() {
      if (getTerm()) {
        httpRequest(getTerm(), getOffset());
      } else {
        emptyPagination();
      }
    })();
  }
  (function() {
    var searchResults = document.querySelectorAll(_resultsClass);
    Array.prototype.forEach.call(searchResults, function(el) {
      buildResultsPage(el);
    });
  })();
};

if (
  document.attachEvent
    ? document.readyState === 'complete'
    : document.readyState !== 'loading'
) {
  $('.resources-section .results-filters.chips').change(function(e) {
    $('div.hs-search-results .hs-search-results__listing').html('');
    var resultsPages = hsResultsPage('div.hs-search-results', $(this).val());
  });
  var resultsPages = hsResultsPage('div.hs-search-results');
} else {
  document.addEventListener('DOMContentLoaded', function() {
    $('.resources-section .results-filters.chips').change(function(e) {
      $('div.hs-search-results .hs-search-results__listing').html('');
      var resultsPages = hsResultsPage('div.hs-search-results', $(this).val());
    });
    var resultsPages = hsResultsPage('div.hs-search-results');
  });
}

// End Search Results



var loadingIcon = $('<div class="loading"> <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: rgb(255, 255, 255); display: block; shape-rendering: auto;" width="40px" height="40px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"> <circle cx="50" cy="50" fill="none" stroke="#17c671" stroke-width="10" r="35" stroke-dasharray="164.93361431346415 56.97787143782138"> <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform> </circle> </div>').hide();
var categories = {};

function getFilteredRows(filterValue, chipCategory, orderResource) {
  var filterData = 'https://api.hubapi.com/cms/v3/hubdb/tables/6157938/rows?portalId=8645105';
  var latestResource;
  var sortClass;
  if (typeof filterValue !== 'undefined' && filterValue != '') {
      
      switch(filterValue) {
        case "Documents":
          latestResource = 'Latest documents';
          break;
        case "Videos":
          latestResource = 'Latest videos';
          break;
        case "Blog Posts":
          latestResource = 'Latest blog posts';
          break;
        case "Slides":
          latestResource = 'Latest slides'
          break;
        case "Scripts":
          latestResource = 'Latest scripts'
          break;
        case "Demos":
          latestResource = 'Latest demos'
          break;
        case "Glossary":
          latestResource = 'Latest glossary'
          break;  
        default:
          console.log("Error");
      }  
      filterData = filterData + '&resource_type__in=' + filterValue; 
  }
  if (typeof chipCategory !== 'undefined' && chipCategory != '') {
     filterData = filterData + '&resource_category__in=' + chipCategory; 
  }
  if (typeof orderResource !== 'undefined' && orderResource != '') {
     filterData = filterData + '&sort=' + orderResource;
     sortClass = 'active'
  } else {
    filterData = filterData + '&sort=resource_title'; 
    sortClass = '';
  }
  $.ajax({
    url: filterData,
    type: "GET",
    beforeSend: function() {
    // show the loading message before the AJAX call is made
      $('.resources-section .bottom-results .listing').html(loadingIcon);
      loadingIcon.show();
    },
    success: function(response) {
      // Do something with the filtered rows
      loadingIcon.hide();
      var html = '';
      $.each(response.results, function(index, resource) {
        // Access the resource properties here
//         console.log(resource);
        var disabled = resource.values.disabled_resource;
        
         if (disabled != 1) {
          var title = resource.values.resource_title;
//         var summary = resource.values.resource_summary;
//         var image = resource.values.resource_image.url;
          var category = resource.values.resource_category.label;
          var category_class = category.toLowerCase().replace(/[^a-z0-9-_]/g, '_');

          var link = resource.values.resource_link;
          var resource_type = 'resource-type-' + resource.values.resource_type.id;
        
        
          function replacePluralWithSingular(inputString) {
            // Define a special marker
            const specialMarker = '*';

            // Check if the string starts with the special marker
            if (inputString.startsWith(specialMarker)) {
              // It's marked to be excluded from processing, so return it as is,
              // but you might want to remove the marker before returning
              return inputString.slice(1); // or return inputString; if you want to keep the marker
            }

            // ... rest of your original function ...
            var words = inputString.split(' ');
            var lastWord = words[words.length - 1];

            if (lastWord.endsWith('ies')) {
              return inputString.replace(lastWord, lastWord.slice(0, -3) + 'y');
            } else if (lastWord.endsWith('s')) {
              return inputString.replace(lastWord, lastWord.slice(0, -1));
            }

            return inputString;  // No plural found
          }


          var category_singular = replacePluralWithSingular(category);
          categories[category] = true;
          // Print HTML for the resource
          html += '<a class="item ' + category_class + '" target="_blank" href="' + link + '">' +
                    '<div class="top">' +  
                      '<div class="icon ' + resource_type + '">' +
                      '</div>' +
                      '<h6 class="category">' + category_singular + '</h6>' +
                    '</div>' +
                    '<div class="bottom">' +
                      '<h4 class="title">' + title + '</h4>' +
                    '</div>' +
                  '</a>';
         }
    });
//       console.log(categories);
      // create a <ul> element to hold the links
      var $list = $('<ul class="chips" type="' + filterValue + '">');
      
      // iterate over the unique values in the seen object
      $list.append('<li><a class="order-resource ' + sortClass + '" href="#">' + latestResource + '</a></li>');
      
      // Sort categories alphabetically
      var sortedCategories = Object.keys(categories).sort();
      
      function removeSpecialCharacter(inputString, specialCharacter) {
        // Replace instances of the special character with an empty string
        var outputString = inputString.replace(new RegExp('\\' + specialCharacter, 'g'), '');
        return outputString;
      }

      // Iterate over sorted categories and create HTML elements
      $.each(sortedCategories, function(index, category) {
        if (categories[category]) {
          var category_class = category.toLowerCase().replace(/[^a-z0-9-_]/g, '_');
          var $li = $('<li class="' + category_class + '">');

          if (category == chipCategory) {
            var $a = $('<a>').attr({ href: '#', category: category, class: 'active' }).text(removeSpecialCharacter(category, '*'));
          } else {
            var $a = $('<a>').attr({ href: '#', category: category }).text(removeSpecialCharacter(category, '*'));
          }

          $li.append($a);
          $list.append($li);
        }
      });
      
      // Append the HTML to the page
      // add the <ul> list to the document body
      $('.resources-section .bottom-results .categories').html($list);
      $('.resources-section .categories .chips li a:not(.order-resource)').click(function(e) {
        e.preventDefault();
        if ($( this ).hasClass('active')) {
            var mainType = $('.resources-section .bottom-results .categories .chips').attr( 'type' );
            $('.resources-section .resources a[name="' + mainType + '"]').trigger('click');
        } else {
          var chipCategory = $(this).attr( 'category' );
          getFilteredRows(filterValue, chipCategory, '');
        }
      });
      $('.resources-section .categories .chips li a.order-resource').click(function(e) {
        e.preventDefault();
        if ($( this ).hasClass('active')) {
            getFilteredRows(filterValue, chipCategory, '');
        } else {
            var orderResource = "-hs_created_at";
            getFilteredRows(filterValue, chipCategory, orderResource);
        }
      });
      $('.resources-section .bottom-results .listing').html(html);
    },
    error: function(xhr, status, error) {
      console.log(status + ": " + error);
    }
  });
}

$('.resources-section .load-more a').click(function(e) {
  e.preventDefault();
    $.ajax({
    url: "https://api.hubapi.com/cms/v3/hubdb/tables/6157938/rows?hs_static_app=endpoint-reference-ui&hs_static_app_version=1.2583&portalId=8645105",
    type: "GET",
    beforeSend: function() {
    // show the loading message before the AJAX call is made
      $('.resources-section .bottom-results .listing').append(loadingIcon);
      loadingIcon.show();
    },
    success: function(response) {
      // Do something with the filtered rows
      loadingIcon.hide();
      var html = '';
      $.each(response.results, function(index, resource) {
        // Access the resource properties here
//         console.log(resource);
        
        var disabled = resource.values.disabled_resource;
        
         if (disabled != 1) {
          var title = resource.values.resource_title;
//         var summary = resource.values.resource_summary;
//         var image = resource.values.resource_image.url;
          var category = resource.values.resource_category.label; 
          var category_class = category.toLowerCase().replace(/[^a-z0-9-_]/g, '_');
          var category_singular = '';
          if (category == 'Case studies') {
            category_singular = 'Case study';
          } else {
            category_singular = category.slice(0, -1);
          }
          var link = resource.values.resource_link;
          var resource_type = 'resource-type-' + resource.values.resource_type.id;

          // Print HTML for the resource
          html += '<a class="item ' + category_class + '" target="_blank" href="' + link + '">' +
                    '<div class="top">' +  
                      '<div class="icon ' + resource_type + '">' +
                      '</div>' +
                      '<h6 class="category">' + category_singular + '</h6>' +
                    '</div>' +
                    '<div class="bottom">' +
                      '<h4 class="title">' + title + '</h4>' +
                    '</div>' +
                  '</a>'; 
        }
    });
      $('.resources-section .bottom-results .listing').append(html);
      $('.resources-section .load-more a').hide();
    },
    error: function(xhr, status, error) {
      console.log(status + ": " + error);
    }
  });
});

$('.resources-section .resources .resource').click(function(e) {
  e.preventDefault();
  categories = {};
  $(".resources-section .bottom-results .listing").show(); 
  $('.resou.resources-section .bottom-results .load-more').show();
  var filterValue = $(this).attr('name');
  if (filterValue == 'Featured') {
    var path = window.location.pathname;
    var filename = path.split("/").pop();
    window.location.href = filename;
  }
  $(this).addClass('active');
  $('.resources-section .resources .resource').not(this).removeClass('active');
  $('.hs_cos_wrapper_type_inline_rich_text >h1').html($(this).attr('title'));
  $('.resources-section .bottom-results .subtitle >h2').html($(this).attr('subtitle'));
  $('.resources-section .featured-resources-section, .resources-section .bottom-results .load-more').html('');
  $('.resources-section .hs-search-results').html('');
  $('.resources-section .hs-search-field__input').val('');
  // Get the current URL
  var url = window.location.href;
  // Clear the query string
  var newUrl = url.split('?')[0];
  // Modify the URL without reloading the page
  history.pushState({}, document.title, newUrl);
  getFilteredRows(filterValue, '', '');
});


