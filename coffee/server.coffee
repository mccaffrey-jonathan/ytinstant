request = require 'request'
querystring = require 'querystring'
express = require 'express'
_u = require 'underscore'

rootdir = __dirname + '/..'

app = express.createServer()
    .use(express.logger())
    .use(express.bodyParser())

_u(['html', 'lib', 'js', ]).each (fold) ->
    app.use "/#{fold}", express.static "#{rootdir}/#{fold}"

app.use "/", express.static "#{rootdir}/html"

yt_url = 'https://gdata.youtube.com/feeds/api/videos'

app.get '/search', (req, res) ->
    qstr = querystring.stringify {
        'q': (req.param 'q'),
        'max-results': (req.param 'max-results'),
        'start-index': (req.param 'start-index'),
        'alt': 'jsonc',
        'v': 2,
    }
    request.get {
        uri:  "#{yt_url}?#{qstr}",
    }, (error, response, body) ->
            res.send(body) unless error

port = process.env.PORT || 1340
app.listen port

console.log "Server running #{__dirname} on port #{port}"
