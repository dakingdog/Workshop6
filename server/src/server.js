var express = require('express');
var app=express();
var poster = require('./util');
var rev=poster.reverseString;
var bodyParser = require('body-parser');
app.use(bodyParser.text());
app.get('/', function (req, res) {
	res.send("hello world!");
});
app.listen(3000, function(){
	console.log('Example app listening on port 3000.');
});
app.post('/reverse', function (req, res) {
	 /* body... */ 
	 //input, output somewhere in there
	 if (typeof(req.body)==='string'){
	 	var reversed=rev(req.body);
	 	res.send(reversed);
	 }
	 else {
	 	res.status(400).end();
	 }
})
