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
			"email": req.body.email,
			"pass": req.body.pass,
			"food": [],
			"total": {}
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
});

/*--------------------------------------
-------------- ADD FOOD ----------------
--------------------------------------*/

app.post('/addfood', function(req, res){
	var food = {
		"id": req.body.foodid,
		"name": req.body.foodname,
		"date": req.body.date
	}

	mongoClient.connect('mongodb://127.0.0.1:27017/devPost', function(err, db){
		if(err){
			res.json({"success": 0, "error": "Internal error"});
			return;
		}

		db.collection('users').find({'email': req.body.email}).count(function(err, c){
			if(err){
				res.json({"success": 0, "error": "Internal error"});
				return;
			}

			if(c == 0){
				res.json({"success": 0, "error": "Please sign in to do this!"});
				return;
			}

			db.collection('users').update({'email': req.body.email}, {$push: {'food': food}}, function(err, result){
				if(err){
					db.close();
					res.json({"success": 0, "error": "Internal error"});
					return;
				}

				var c2 = db.collection('users').find({'email': req.body.email}), tot, fdetails;

				c2.each(function(err, d){
					if(d != null){
						tot = d.total;
						var c1 = db.collection('food').find({'foodid': food.foodid});

						c1.each(function(err, d){
							if(d != null){
								fdetails = d.nutrients;
								for(var x in fdetails){
									if(tot.hasOwnProperty(x)){
										tot[x] = tot[x] + fdetails[x];
									}
									else{
										tot[x] = fdetails[x];
									}
								}

								db.collection('users').update({'email': req.body.email}, {$set: {total: tot}}, function(err, result2){
									db.close();
									res.json({"success": 1, "error": 0});
								});	
							}
						});
					}
				});
			});
		});
	});
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