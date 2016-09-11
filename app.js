var express = require('express'),
	bodyParser = require('body-parser'),
	mongoClient = require('mongodb').MongoClient,
	bcrypt = require('bcrypt'),
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

/*-----------------------------------------
--------------- SIGN UP -------------------
-----------------------------------------*/

app.post('/signup', function(req, res){

	mongoClient.connect("mongodb://127.0.0.1:27017/devPost", function(err, db){
		if(err){
			res.json({"success": 0, "error": "Unable to connect to server"});
			return;
		}

		var user = {
			"email": req.body.username,
			"pass": req.body.password
		};

		bcrypt.genSalt(10, function(err, salt){
			bcrypt.hash(user.pass, salt, function(err, hashedPass){
				user.pass = hashedPass;

				db.collection('users').find({"email": user.email}).count(function(err, val){
					if(val != 0){
						res.json({"success": 0, "error": "email taken"});
						return;
					}

					db.collection('users').insertOne(user, function(err, result){
						if(err){
							db.close();
							res.json({"success": 0, "error": "Internal error"});
							return;
						}

						db.close();
						req.session.email = user.email;
						res.json({"success": 1, "error": false})
					});

				});
			});
		});
	});

});

/*-----------------------------------------
---------------- LOG IN -------------------
-----------------------------------------*/

app.post("/signin", function(req, res){

	mongoClient.connect("mongodb://127.0.0.1:27017/devPost", function(err, db){
		if(err){
			res.json({"success": 0, "error": "Internal error"});
			return;
		}

		var user = {
			"email": req.body.email,
			"pass": req.body.pass
		};

		bcrypt.genSalt(10, function(err, salt){
			bcrypt.hash(user.pass, salt, function(err, hashedPass){
				user.pass = hashedPass;

				db.collection('users').find({"email": user.email}).count(function(err, c){
					if(c == 0){
						db.close();
						res.json({"success": 0, "error": "Wrong username or password"});
						return;
					}

					var cursor = db.collection('users').find({"email": user.email});

					cursor.each(function(err, d){
						if(err){
							res.json({"success": 0, "error": "Internal error"});
							return;
						}

						if(d != null){
							bcrypt.compare(user.pass, d.pass, function(err, ans){
								if(ans){
									db.close();
									res.json({"success": 1, "error": 0});
									return;
								}

								else {
									db.close();
									res.json({"success": 0, "error": "Wrong username or password"});
									return;
								}
							});
						}
					});
				})
			});
		})
	});

});

app.listen(app.get('port'), function(){
	console.log("Server running on port " + app.get('port'));
})