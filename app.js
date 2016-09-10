var express = require('express'),
	bodyParser = require('body-parser'),
	handlebars = require('express-handlebars').create({
		defaultLayout: null
	});

var app = express();

app.set('port', process.env.PORT || 3000);
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get("/", function(req, res){
	res.sendFile(__dirname + '/views/index.html');
});	

app.listen(app.get('port'), function(){
	console.log("Server running on port " + app.get('port'));
})