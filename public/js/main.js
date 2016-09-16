(function(){

	document.getElementsByName("signinform")[0].addEventListener("submit", function(e){
		e.preventDefault();
		var signin = new XMLHttpRequest();

		signin.onreadystatechange = function(){
			if(signin.readyState == 4){
				var res = JSON.parse(signin.responseText);
				if(res.success == 1){
					window.location = window.location + "dashboard";
				}

				else {
					console.log("Wrong username/password");
				}
			}
		}

		if(this.email.value.trim() != '' && this.pass.value.trim() != ''){
			signin.open("POST", '/signin');
			signin.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			signin.send("email=" + this.email.value.trim() + "&pass=" + this.pass.value.trim());
		}
	});

	document.getElementsByName("signupform")[0].addEventListener("submit", function(e){
		e.preventDefault();
		var signup = new XMLHttpRequest();

		signup.onreadystatechange = function(){
			if(signup.readyState == 4){
				var res = JSON.parse(signup.responseText);
				if(res.success == 1){
					window.location = window.location + "dashboard";
				}

				else {
					console.log("Email already taken!");
				}
			}
		}

		if(this.email.value.trim() != '' && this.pass.value.trim() != ''){
			signup.open("POST", '/signup');
			signup.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			signup.send("email=" + this.email.value.trim() + "&pass=" + this.pass.value.trim());
		}
	});

})();