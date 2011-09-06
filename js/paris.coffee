log = (args...) ->
    console.log(args...) if this.console?

MONTH = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

window.ParisJS =
    ICAL: "http://h2vx.com/ics/www.eventbrite.com/org/862067525"

class Nav
  constructor: () ->
        $window = $(window)
        nav = $('body .topbar li a')
        targets = ((el) -> $(el).attr('href') for el in nav)()
        offsets = ((id) -> $(id).offset().top for id in targets)()

        setButton = (id) ->
            nav.parent("li").removeClass('active')
            $(nav[$.inArray(id, targets)]).parent("li").addClass('active')

        activeTarget = null
        setTarget = (i, scrollTop) ->
           if (activeTarget != targets[i] && scrollTop >= offsets[i] && (!offsets[i + 1] || scrollTop <= offsets[i + 1]))
                activeTarget = targets[i]
                setButton(activeTarget)

        processScroll = (e) ->
            scrollTop = $window.scrollTop() + 10
            setTarget(i, scrollTop) for i in [offsets.length..0]

        nav.click(processScroll)
        $window.scroll(processScroll)
        processScroll()

class Tabs
  constructor: () ->
        getPanel = (tab) ->
            $($('a', tab).attr('href'))

        $('.panel').hide()
        $('.tabs li').click (e) ->
            e.preventDefault()
            previous = $('.tabs .active')
            getPanel(previous).hide()
            previous.removeClass('active')

            $(this).addClass('active')
            getPanel(this).show()

        getPanel($('.tabs .active')).show()
        tabs = $('.tabs')
        oldTabs = this._olderTabs()
        return if oldTabs.size() is 0
        oldTabs = oldTabs.add(oldTabs.first().prev())
        $('<li>').addClass('dropdown').append(
            $('<a>').addClass('dropdown-toggle').text('olders')
        ).append(
            $('<ul>').addClass('dropdown-menu').append(oldTabs)
        ).click(() ->
            $(this).toggleClass('open')
        ).appendTo(tabs)

   _olderTabs: ->
        tabs = $('.tabs')
        maxWidth = tabs.width()
        actual = 0
        $('li', tabs).filter () ->
            actual += $(this).width()
            (actual > maxWidth)


class Meetups
   constructor: () ->
     @load(0)

   load: (tries) ->
        $.ajax {
          url: "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'https%3A%2F%2Fwww.eventbrite.com%2Fxml%2Forganizer_list_events%3Fapp_key%3DOTlkMWFkODNjYThl%26id%3D856075'&format=json&diagnostics=true",
          jsonp: "callback",
          success: (result) ->
            events = []
            if (typeof result == "string")
                result = $.parseJSON(result)
            if (result.query.count is 0 && tries < 2)
                # Once in a while YQL sends an empty result: try again!
                Meetups.load(tries + 1)
                return

            if (result.query.count > 0)
                events = events.concat(result.query.results.events.event)
            nextEvent = null

            $(events).each(() ->
                return if (this.status == "Completed")
                nextEvent = this
            )

            $event = $("#event")
            if (nextEvent)
                $event.find('h2').append(": "+ nextEvent.title)
                event = $("#eventTmpl").tmpl({event: nextEvent})
                $event.append(event)
                event.find(".span4").css('min-height', event.height())
            else
                $event.append("No event scheduled yet.")
            $("#eventsSpinner").hide()
        }

window.Utils =
    formatDate: (date) ->
        hour = date.split(" ")[1]
        date = date.split(" ")[0]
        year = date.split("-")[0]
        month = date.split("-")[1] - 1
        day = date.split("-")[2]
        MONTH[month] + " " + day + ", " + year + " "+ hour

$ () ->
  new Meetups
  new Tabs
  new Nav
