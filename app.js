var express = require('express'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
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
app.use(session({secret: "ThisIsAFu**ingSecret"}));

app.get("/", function(req, res){
	if(req.session.email)
		res.sendFile(__dirname + '/views/dashboard.html');
	else
		res.sendFile(__dirname + '/views/index.html');
});

app.get("/dashboard", function(req, res){
	if(req.session.email)
		res.sendFile(__dirname + '/views/dashboard.html');
	else
		res.redirect("/");
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
			"email": req.body.email,
			"pass": req.body.pass,
			"food": [],
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
						res.json({"success": 1, "error": false});
						req.session.email = user.email;
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
							req.session.email = user.email;
							req.session.save();
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
});

/*--------------------------------------
-------------- ADD FOOD ----------------
--------------------------------------*/

app.post('/addfood', function(req, res){
	var food = {
		//"id": req.body.foodid,
		"category": req.body.category,
		"name": req.body.foodname,
		"date": req.body.date
	}

	mongoClient.connect('mongodb://127.0.0.1:27017/devPost', function(err, db){
		if(err){
			res.json({"success": 0, "error": "Internal error"});
			return;
		}

		if(req.session.email){
			db.collection('users').find({'email': req.session.email}).count(function(err, c){
				if(err){
					res.json({"success": 0, "error": "Internal error"});
					return;
				}

				if(c == 0){
					res.json({"success": 0, "error": "Please sign in to do this!"});
					return;
				}	

				db.collection('users').update({'email': req.session.email}, {$push: {'food': food}}, function(err, result){
					if(err){
						db.close();
						res.json({"success": 0, "error": "Internal error"});
						return;
					}

					res.json({"success": 1, "error": 0, "food": food});
				});

				/* LEFT FOR LATER!!! ;)
				var c1 = db.collection('food').find({'foodid': food.foodid});

				c1.each(function(err, d){
					if(d != null){
						fdetails = d.nutrients;
						for(var x in fdetails){
							food[x] = fdetails[x];
						}

						db.collection('users').update({'email': req.body.email}, {$push: {'food': food}}, function(err, result){
							if(err){
								db.close();
								res.json({"success": 0, "error": "Internal error"});
								return;
							}

							db.close();
							res.json({"success": 1, "error": 0});
						});
					}
				});

				*/
			});
		}

		else {
			res.json({"success": 0, "error": "Please login to continue"});
		}
	});
});

/*------------------------------------
----------SHOW FOOD EATEN-------------
------------------------------------*/

app.post('/getfood', function(req, res){
	if(req.session.email){
		mongoClient.connect("mongodb://127.0.0.1:27017/devPost", function(err, db){
			if(err){
				res.json({"success": 0, "error": 1});
				return;
			}

			db.collection('users').find({'email': req.session.email}).count(function(err, c){
				if(c == 0){
					db.close();
					res.json({'success': 0, 'error': 'Please login to continue'});
					return;
				}

				var cursor = db.collection('users').find({'email': req.session.email});

				cursor.each(function(err, doc){
					if(doc != null){
						res.json({"success": 1, "food": doc.food});
						return;
					}
				});

				db.close();
			});

		})
	}

	else {
		res.json({"success": 0, "error": "Please login to continue"});
	}
});

/*------------------------------------
------------ LOG OUT -----------------
------------------------------------*/

app.get("/logout", function(req, res){
	delete req.session.email;
	res.redirect("/");
});


/*-------------------------------------
-------------- TIPS -------------------
-------------------------------------*/

app.post('/gettips', function(req, res){
	mongoClient.connect('mongodb://127.0.0.1:27017/devPost', function(err, db){
		if(err){
			res.json({"error": 1});
			return;
		}

		db.collection.find({}).toArray(function(err, arr){
			if(err){
				db.close();
				res.json({"error": 1});
				return;
			}

			db.close();
			res.json({"error": 0, "tip": arr[Math.random()*arr.length]});
		});
	});
});

app.listen(app.get('port'), function(){
	console.log("Server running on port " + app.get('port'));
});