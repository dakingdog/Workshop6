var express = require('express');
var app = express();
// var poster = require('./util');
// var rev = poster.reverseString;
// var bodyParser = require('body-parser');
app.use(express.static('../client/build'));
app.listen(3000, function() {
  console.log('Example app listening on port 3000.');
});

