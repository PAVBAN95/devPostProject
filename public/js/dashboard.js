
(function(){

	window.onload = function(){
		var getfood = new XMLHttpRequest();

		getfood.onreadystatechange = function(){
			if(getfood.readyState == 4){
				var res = JSON.parse(getfood.responseText).food, i, newItem, elems;

				for(i = 0; i < res.length; ++i){
					newItem = createItem(res[i]);
					elems = document.getElementsByClassName("list_item");
					if(elems.length){
						document.getElementById("foodHistory").insertBefore(newItem, elems[0]);
					}

					else {
						document.getElementById("foodHistory").appendChild(newItem);
					}
				}

			}
		}

		getfood.open("POST", "/getfood");
		getfood.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		getfood.send();
	}

	function createItem(res){
		var newItem = document.createElement('div');
		newItem.className = "list_item";
		var span1 = document.createElement('span');
		span1.className = "food_item";
		var span2 = document.createElement('span');
		span2.className = "food_categ";
		var span3 = document.createElement('span');
		span3.className = "timespan";
		span1.appendChild(document.createTextNode(res.name));
		span2.appendChild(document.createTextNode(" ( " + res.category + " ) "));
		span3.appendChild(document.createTextNode(res.date));
		newItem.appendChild(span1);
		newItem.appendChild(span2);
		newItem.appendChild(span3);

		return newItem;
	}

	document.getElementsByName("addfoodform")[0].addEventListener("submit", function(e){
		e.preventDefault();

		if(this.category.value != "category" && this.item.value.trim() != ''){
			var addfood = new XMLHttpRequest(), cur = new Date();

			addfood.onreadystatechange = function(){
				if(addfood.readyState == 4){
					var res = JSON.parse(addfood.responseText);
					if(res.success){
						var elems = document.getElementsByClassName("list_item");

						var newItem = createItem(res.food);

						if(elems.length){
							document.getElementById("foodHistory").insertBefore(newItem, elems[0]);
						}

						else {
							document.getElementById("foodHistory").appendChild(newItem);
						}
					}
				}
			}

			var date = cur.getDate() + "/" + (cur.getMonth() + 1);
			addfood.open('POST', '/addfood');
			addfood.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			addfood.send("foodname=" + this.item.value.trim() + "&category=" + this.category.value + "&date=" + date);
		}
	});
})();