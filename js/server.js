(function() {
  var app, express, port, querystring, request, rootdir, yt_url, _u;
  request = require('request');
  querystring = require('querystring');
  express = require('express');
  _u = require('underscore');
  rootdir = __dirname + '/..';
  app = express.createServer().use(express.logger()).use(express.bodyParser());
  _u(['html', 'lib', 'js']).each(function(fold) {
    return app.use("/" + fold, express.static("" + rootdir + "/" + fold));
  });
  app.use("/", express.static("" + rootdir + "/html"));
  yt_url = 'https://gdata.youtube.com/feeds/api/videos';
  app.get('/search', function(req, res) {
    var qstr;
    qstr = querystring.stringify({
      'q': req.param('q'),
      'max-results': req.param('max-results'),
      'start-index': req.param('start-index'),
      'alt': 'jsonc',
      'v': 2
    });
    return request.get({
      uri: "" + yt_url + "?" + qstr
    }, function(error, response, body) {
      if (!error) {
        return res.send(body);
      }
    });
  });
  port = process.env.PORT || 1340;
  app.listen(port);
  console.log("Server running " + __dirname + " on port " + port);
}).call(this);
