query_chunk_size = 8*6 #max is 50

$(document).ready ->
    LOG = (txt) -> $('#scratch').get(0).innerHTML = txt

    yt_player = (item) ->
        item.player.default
    yt_thumbnail = (id) ->
        "http://img.youtube.com/vi/#{id}/2.jpg"
    gen_player = (item_id) ->
        $ '<iframe>', {
            src: "http://www.youtube.com/embed/#{item_id}?autoplay=1&controls=0"
            width: 240
            height: 180
            frameborder: 0
        }

    search_state = {
        READY: 0,
        TYPING: 1,
        SEARCHING: 2,
        ERROR: 3,
    }
    search_state.status = search_state.READY

    set_typing = (local_search_state) ->
        return if local_search_state.status == search_state.TYPING
        local_search_state.status = search_state.TYPING
        $('#search_status')
            .removeClass()
            .addClass('alert-message info')
            .html('<p><strong>Typing.</strong>  Waiting to quiesce...</p>')
    set_search_started = (local_search_state, opts) ->
        local_search_state.status = search_state.SEARCHING
        status = $('#search_status')
            .removeClass()
            .addClass('alert-message warning')
            .html("<p><strong>Searching</strong> for '#{opts.txt}'</p>")
    set_search_finished = (local_search_state, opts) ->
        local_search_state.status = search_state.READY
        local_search_state.query = opts.txt
        unless opts.append
            local_search_state.range = opts.range
        else
            local_search_state.range.end += opts.range.end - opts.range.start
        $('#search_status')
            .removeClass()
            .addClass('alert-message success')
            .html("<p><strong>Search done!</strong>  Displaying results for '#{opts.txt}'</p>")


    yt_srch = (opts) ->
        opts2 = {
            txt : opts.txt ? '',
            range: opts.range ? {start: 1, end: 1 + query_chunk_size},
            append: opts.append ? false,
        }
        set_search_started search_state, opts2

        $.get '/search', {
            'q': opts2.txt,
            'start-index': opts2.range.start,
            'max-results': opts2.range.end - opts2.range.start,
        }, (body) ->
            $('#results')
                .empty()
                .append $('<ul/>', {
                    id: 'results_list',
                    class: 'media-grid',
                }) unless opts2.append
            
            make_player = (node, id) ->
                $(node)
                    .empty()
                    .html(gen_player id)
                    .data('mode', 'player')

            make_img = (node, id) ->
                img2 = $ '<img/>', {
                    src: (yt_thumbnail id),
                }
                $(node)
                    .empty()
                    .append(img2)
                    .data('mode', 'img')

            _.each $.parseJSON(body).data.items, (item) ->
                li = $ '<li/>'

                a = $('<a/>', {
                    'data-content': item.description,
                    'data-original-title': item.title,
                    href: yt_player item,
                }).popover({
                    html: true,
                    content: (-> gen_player item.id),
                    placement: 'below',
                })

                make_img a, item.id
                $('#results_list').append li.append a

            set_search_finished search_state, opts2

    slow_log = _.debounce ((local_search_state, event) ->
        not_searching = local_search_state.status == search_state.TYPING ||
            local_search_state.status == search_state.READY
        yt_srch {txt: event.target.value} if not_searching), 250
    $('#search_bar').keypress (event) ->
        set_typing search_state
        slow_log search_state, event

    $(window).scroll ->
        bottom = $(window).scrollTop() == $(document).height() - $(window).height()
        ready = search_state.status == search_state.READY
        has_query = search_state.query
        yt_srch {
            txt: search_state.query
            append: true
            range: {
                start: search_state.range.end
                end: search_state.range.end + query_chunk_size
            }
        } if ready and bottom and search_state.query?

    yt_srch {txt: '' }


