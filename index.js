var https =require("https");
var fs = require("fs");
var express = require('express');
// var videoStream = require('video-stream')
var app = express();
var pk =  fs.readFileSync("./sll/Apache/3_xx123321.club.key"); 
var pc  = fs.readFileSync("./sll/Apache/2_xx123321.club.crt");


app.use(express.static('www'))

var opts = {
    key: pk,
    cert: pc
};
var httpsServer = https.createServer(opts, app);

var SSLPORT = 443;
app.listen(8080,()=>{
    console.log('HTTP Server is running on: http://localhost:%s', 8080);
})
httpsServer.listen(SSLPORT, function() {
    console.log('HTTPS Server is running on: https://localhost:%s', SSLPORT);
});