(function() {
  var query_chunk_size;
  query_chunk_size = 8 * 6;
  $(document).ready(function() {
    var LOG, gen_player, search_state, set_search_finished, set_search_started, set_typing, slow_log, yt_player, yt_srch, yt_thumbnail;
    LOG = function(txt) {
      return $('#scratch').get(0).innerHTML = txt;
    };
    yt_player = function(item) {
      return item.player["default"];
    };
    yt_thumbnail = function(id) {
      return "http://img.youtube.com/vi/" + id + "/2.jpg";
    };
    gen_player = function(item_id) {
      return $('<iframe>', {
        src: "http://www.youtube.com/embed/" + item_id + "?autoplay=1&controls=0",
        width: 240,
        height: 180,
        frameborder: 0
      });
    };
    search_state = {
      READY: 0,
      TYPING: 1,
      SEARCHING: 2,
      ERROR: 3
    };
    search_state.status = search_state.READY;
    set_typing = function(local_search_state) {
      if (local_search_state.status === search_state.TYPING) {
        return;
      }
      local_search_state.status = search_state.TYPING;
      return $('#search_status').removeClass().addClass('alert-message info').html('<p><strong>Typing.</strong>  Waiting to quiesce...</p>');
    };
    set_search_started = function(local_search_state, opts) {
      var status;
      local_search_state.status = search_state.SEARCHING;
      return status = $('#search_status').removeClass().addClass('alert-message warning').html("<p><strong>Searching</strong> for '" + opts.txt + "'</p>");
    };
    set_search_finished = function(local_search_state, opts) {
      local_search_state.status = search_state.READY;
      local_search_state.query = opts.txt;
      if (!opts.append) {
        local_search_state.range = opts.range;
      } else {
        local_search_state.range.end += opts.range.end - opts.range.start;
      }
      return $('#search_status').removeClass().addClass('alert-message success').html("<p><strong>Search done!</strong>  Displaying results for '" + opts.txt + "'</p>");
    };
    yt_srch = function(opts) {
      var opts2, _ref, _ref2, _ref3;
      opts2 = {
        txt: (_ref = opts.txt) != null ? _ref : '',
        range: (_ref2 = opts.range) != null ? _ref2 : {
          start: 1,
          end: 1 + query_chunk_size
        },
        append: (_ref3 = opts.append) != null ? _ref3 : false
      };
      set_search_started(search_state, opts2);
      return $.get('/search', {
        'q': opts2.txt,
        'start-index': opts2.range.start,
        'max-results': opts2.range.end - opts2.range.start
      }, function(body) {
        var make_img, make_player;
        if (!opts2.append) {
          $('#results').empty().append($('<ul/>', {
            id: 'results_list',
            "class": 'media-grid'
          }));
        }
        make_player = function(node, id) {
          return $(node).empty().html(gen_player(id)).data('mode', 'player');
        };
        make_img = function(node, id) {
          var img2;
          img2 = $('<img/>', {
            src: yt_thumbnail(id)
          });
          return $(node).empty().append(img2).data('mode', 'img');
        };
        _.each($.parseJSON(body).data.items, function(item) {
          var a, li;
          li = $('<li/>');
          a = $('<a/>', {
            'data-content': item.description,
            'data-original-title': item.title,
            href: yt_player(item)
          }).popover({
            html: true,
            content: (function() {
              return a['data-content'] = gen_player(item.id);
            })
          });
          make_img(a, item.id);
          return $('#results_list').append(li.append(a));
        });
        return set_search_finished(search_state, opts2);
      });
    };
    slow_log = _.debounce((function(local_search_state, event) {
      var not_searching;
      not_searching = local_search_state.status === search_state.TYPING || local_search_state.status === search_state.READY;
      if (not_searching) {
        return yt_srch({
          txt: event.target.value
        });
      }
    }), 250);
    $('#search_bar').keypress(function(event) {
      set_typing(search_state);
      return slow_log(search_state, event);
    });
    $(window).scroll(function() {
      var bottom, has_query, ready;
      bottom = $(window).scrollTop() === $(document).height() - $(window).height();
      ready = search_state.status === search_state.READY;
      has_query = search_state.query;
      if (ready && bottom && (search_state.query != null)) {
        return yt_srch({
          txt: search_state.query,
          append: true,
          range: {
            start: search_state.range.end,
            end: search_state.range.end + query_chunk_size
          }
        });
      }
    });
    return yt_srch({
      txt: ''
    });
  });
}).call(this);
