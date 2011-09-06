(function() {
  var MONTH, Meetups, Nav, Tabs, log;
  var __slice = Array.prototype.slice;
  log = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (this.console != null) {
      return console.log.apply(console, args);
    }
  };
  MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  window.ParisJS = {
    ICAL: "http://h2vx.com/ics/www.eventbrite.com/org/862067525"
  };
  Nav = (function() {
    function Nav() {
      var $window, activeTarget, nav, offsets, processScroll, setButton, setTarget, targets;
      $window = $(window);
      nav = $('body .topbar li a');
      targets = (function(el) {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = nav.length; _i < _len; _i++) {
          el = nav[_i];
          _results.push($(el).attr('href'));
        }
        return _results;
      })();
      offsets = (function(id) {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = targets.length; _i < _len; _i++) {
          id = targets[_i];
          _results.push($(id).offset().top);
        }
        return _results;
      })();
      setButton = function(id) {
        nav.parent("li").removeClass('active');
        return $(nav[$.inArray(id, targets)]).parent("li").addClass('active');
      };
      activeTarget = null;
      setTarget = function(i, scrollTop) {
        if (activeTarget !== targets[i] && scrollTop >= offsets[i] && (!offsets[i + 1] || scrollTop <= offsets[i + 1])) {
          activeTarget = targets[i];
          return setButton(activeTarget);
        }
      };
      processScroll = function(e) {
        var i, scrollTop, _ref, _results;
        scrollTop = $window.scrollTop() + 10;
        _results = [];
        for (i = _ref = offsets.length; _ref <= 0 ? i <= 0 : i >= 0; _ref <= 0 ? i++ : i--) {
          _results.push(setTarget(i, scrollTop));
        }
        return _results;
      };
      nav.click(processScroll);
      $window.scroll(processScroll);
      processScroll();
    }
    return Nav;
  })();
  Tabs = (function() {
    function Tabs() {
      var getPanel, oldTabs, tabs;
      getPanel = function(tab) {
        return $($('a', tab).attr('href'));
      };
      $('.panel').hide();
      $('.tabs li').click(function(e) {
        var previous;
        e.preventDefault();
        previous = $('.tabs .active');
        getPanel(previous).hide();
        previous.removeClass('active');
        $(this).addClass('active');
        return getPanel(this).show();
      });
      getPanel($('.tabs .active')).show();
      tabs = $('.tabs');
      oldTabs = this._olderTabs();
      if (oldTabs.size() === 0) {
        return;
      }
      oldTabs = oldTabs.add(oldTabs.first().prev());
      $('<li>').addClass('dropdown').append($('<a>').addClass('dropdown-toggle').text('olders')).append($('<ul>').addClass('dropdown-menu').append(oldTabs)).click(function() {
        return $(this).toggleClass('open');
      }).appendTo(tabs);
    }
    Tabs.prototype._olderTabs = function() {
      var actual, maxWidth, tabs;
      tabs = $('.tabs');
      maxWidth = tabs.width();
      actual = 0;
      return $('li', tabs).filter(function() {
        actual += $(this).width();
        return actual > maxWidth;
      });
    };
    return Tabs;
  })();
  Meetups = (function() {
    function Meetups() {
      this.load(0);
    }
    Meetups.prototype.load = function(tries) {
      return $.ajax({
        url: "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'https%3A%2F%2Fwww.eventbrite.com%2Fxml%2Forganizer_list_events%3Fapp_key%3DOTlkMWFkODNjYThl%26id%3D856075'&format=json&diagnostics=true",
        jsonp: "callback",
        success: function(result) {
          var $event, event, events, nextEvent;
          events = [];
          if (typeof result === "string") {
            result = $.parseJSON(result);
          }
          if (result.query.count === 0 && tries < 2) {
            Meetups.load(tries + 1);
            return;
          }
          if (result.query.count > 0) {
            events = events.concat(result.query.results.events.event);
          }
          nextEvent = null;
          $(events).each(function() {
            if (this.status === "Completed") {
              return;
            }
            return nextEvent = this;
          });
          $event = $("#event");
          if (nextEvent) {
            $event.find('h2').append(": " + nextEvent.title);
            event = $("#eventTmpl").tmpl({
              event: nextEvent
            });
            $event.append(event);
            event.find(".span4").css('min-height', event.height());
          } else {
            $event.append("No event scheduled yet.");
          }
          return $("#eventsSpinner").hide();
        }
      });
    };
    return Meetups;
  })();
  window.Utils = {
    formatDate: function(date) {
      var day, hour, month, year;
      hour = date.split(" ")[1];
      date = date.split(" ")[0];
      year = date.split("-")[0];
      month = date.split("-")[1] - 1;
      day = date.split("-")[2];
      return MONTH[month] + " " + day + ", " + year + " " + hour;
    }
  };
  $(function() {
    new Meetups;
    new Tabs;
    return new Nav;
  });
}).call(this);
