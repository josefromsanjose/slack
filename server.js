var express = require('express');
var app = express();


//server static index html file, no routing. 
app.use(express.static('./public'));


var server = app.listen(3000, function (){
   console.log('Listening on http://localhost:3000'); 
});