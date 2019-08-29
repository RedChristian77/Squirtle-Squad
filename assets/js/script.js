const script = function () {
    let _params = {};
	
	const _deleteAccessToken = function () {
		// otherwise get rid of the access_token param so we can grab it again next time
		delete _params["access_token"];
		localStorage.setItem("authentication", JSON.stringify(_params));
		document.getElementById("fitbitLoginButton").style.display = "block";
	}

	// get day's remaining calories from fitbit
    const _getFitbitCalories = function () {
		if (_params["access_token"] !== void 0) {
			fetch("https://api.fitbit.com/1/user/" + _params["user_id"] + "/foods/log/goal.json", {
				method: "GET",
				headers: {
					"Authorization": "Bearer " + _params["access_token"]
				}
			})
			.then(function (result) {
				return result.json();
			})
			.then(function (data) {
				// if there are goals (ie we didnt get an error)
				if (data.goals) {
					document.getElementById("caloriesRemaining").textContent = data.goals.calories;
					// save the new remaining calories
					localStorage.setItem("calories", data.goals.calories);
				} else {
					_deleteAccessToken();
				}
				document.getElementById("mealIcon").src = "assets/images/meal.png";
				document.getElementById("caloriesRemaining").style.opacity = "1";
			});
		}
    }

	// encodes the url parameters into an object
    const _getUrlVars = function () {
        const vars = JSON.parse(localStorage.getItem("authentication")) || {};
        window.location.href.replace(/[?&#]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
            vars[key] = value;
        });
        return vars;
    }

    const _initBulma = function () {
        // Get all "navbar-burger" elements
        const navbarBurgers = Array.prototype.slice.call(document.querySelectorAll(".navbar-burger"), 0);
        // Check if there are any navbar burgers
        if (navbarBurgers.length > 0) {
            // Add a click event on each of them
            navbarBurgers.forEach(el => {
                el.addEventListener("click", () => {
                    // Get the target from the "data-target" attribute
                    const target = el.dataset.target;
                    const targetElement = document.getElementById(target);
                    // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
                    el.classList.toggle("is-active");
                    targetElement.classList.toggle("is-active");
                });
            });
        }
    }

	// post to fitbit to update remaining calories
    const _updateFitbitCalories = function (calories) {
		if (_params["access_token"] !== void 0) {
			document.getElementById("caloriesRemaining").style.opacity = "0";
			document.getElementById("mealIcon").src = "assets/images/loading.gif";
			fetch("https://api.fitbit.com/1/user/" + _params["user_id"] + "/foods/log/goal.json?calories=" + calories, {
				method: "POST",
				headers: {
					"Authorization": "Bearer " + _params["access_token"]
				}
			})
			.then(function (result) {
				return result.json();
			})
			.then(function (data) {
				// if there are no goals (ie we got an error)
				if (!data.goals) {
					_deleteAccessToken();
				}
				// give the number changing a nice effect
				setTimeout(function() {
					document.getElementById("mealIcon").src = "assets/images/meal.png";
					document.getElementById("caloriesRemaining").textContent = calories;
					document.getElementById("caloriesRemaining").style.opacity = "1";
				}, 250);
			});
		}
    }

	// search for a food
    const _searchRequest = function (event) {
        event.preventDefault();
        let headers = {
            "x-app-key": "dda87a7beb9557383f39f2753bca8f84",
            "x-remote-user-id": 0,
            "x-app-id": "2aab2c41",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        let queryRequest = encodeURI(document.getElementById("searchInput").value);

        let body = new URLSearchParams("query=" + queryRequest);

        fetch('https://trackapi.nutritionix.com/v2/search/instant', {
            method: 'Post',
            body: body,
            headers: headers
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            document.getElementById("form").reset();
            console.log(data);

            //resets the card section at the bottom
            document.getElementById("cardContainer").innerHTML = "";
            
            data.common.forEach(element => {
                //clones template node
                let template = document.getElementById("cardTemplate").children[0].cloneNode(true);

                //takes name of Item
                template.getElementsByClassName("card-header-title")[0].innerHTML = element.food_name.toUpperCase();

                //Adding the image to a new created div
                let photoDiv = document.createElement("div");
                photoDiv.className += " column"
                photoDiv.className += " is-one-quarter";
                photoDiv.className += " is-mobile";
                let image = document.createElement("img");
                image.src = element.photo.thumb;
                photoDiv.append(image);
                template.getElementsByClassName("content")[0].append(photoDiv);

                //Div for Information added
                let infoDiv = document.createElement("div");
                infoDiv.className += " column";
                infoDiv.className += " is-half";
                infoDiv.className += " is-mobile";
                infoDiv.innerHTML = "Calories: " + //Need to figure out solution for this area, endpoint for common doesn't give calories
                template.getElementsByClassName("content")[0].append(infoDiv);

                //Creating Buttons
                let buttonsDiv = document.createElement("div");
                buttonsDiv.className += " column";
                buttonsDiv.className += " is-one-quarter";
                buttonsDiv.className += " is-mobile";
                let createButton = document.createElement("a");
                createButton.className += "button";
                createButton.className += "is-link";
                createButton.innerHTML = "Add +";
                //Spot here for buttons queryselector

                //
                buttonsDiv.append(createButton);
                template.getElementsByClassName("content")[0].append(buttonsDiv);

                document.getElementById("cardContainer").append(template);
            });
        });
    }

	// run these things after the body has loaded since our script is in the head tag
    document.addEventListener("DOMContentLoaded", function () {
        _params = _getUrlVars();
		let calories = localStorage.getItem("calories");
		document.getElementById("caloriesRemaining").textContent = calories;
		// if there's an access token saved
		if (_params["access_token"] !== void 0) {
			localStorage.setItem("authentication", JSON.stringify(_params));
			document.getElementById("fitbitLoginButton").style.display = "none";
			calories = _getFitbitCalories();
		}
		if (calories === null) {
			alert("Please log in to Fitbit or manually set your Calorie Goal in the settings page.");
		}
        _initBulma();
        document.getElementById("form").addEventListener("submit", _searchRequest);
		document.querySelectorAll(".ate-food-button").forEach(function(button) {
			button.addEventListener("click", function() {
				// only allow the button to be pressed once
				if (this.getAttribute("disabled") !== "disabled") {
					const caloriesEaten = parseInt(this.getAttribute("data-calories"));
					const calories = parseInt(document.getElementById("caloriesRemaining").textContent) - caloriesEaten;
					localStorage.setItem("calories", calories);
					_updateFitbitCalories(calories);
					this.setAttribute("disabled", "disabled");
				}
			});
		});
    });
}();