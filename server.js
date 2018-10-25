var express = require('express'),
    app = express(),
    http = require('http'),
    httpServer = http.Server(app);

app.use(express.static(__dirname + '/game'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/game/index.html');
});
const port = 8181;
app.listen(port);
console.log('Server is running at port: ' + port);