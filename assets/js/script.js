const script = function () {
    let _params = {};

	const _clearCaloriesModal = function (element) {
		const modalElement = element.closest(".modal");
		modalElement.classList.remove("is-active");
		modalElement.querySelectorAll("input").forEach(
			input => {
				input.value = "";
				input.checked = false;
			}
		);
	}
	
	const _deleteAccessToken = function () {
		// otherwise get rid of the access_token param so we can grab it again next time
		delete _params["access_token"];
		localStorage.setItem("authentication", JSON.stringify(_params));
		_displayFitbitLogin(true);
	}
	
	const _displayMessage = function (message) {
		const messageModal = document.getElementById("messageModal");
		messageModal.getElementsByClassName("message-body")[0].innerHTML = message;
		messageModal.classList.add("is-active");
	}
	
	const _displayCalories = function (calories, timeout) {
		document.getElementById("mealIcon").src = "assets/images/loading.gif";
		document.getElementById("caloriesRemaining").style.opacity = "0";
		setTimeout(function () {
			if (calories !== void 0) {
				document.getElementById("caloriesRemaining").textContent = calories;
			}
			document.getElementById("mealIcon").src = "assets/images/meal.png";
			document.getElementById("caloriesRemaining").style.opacity = "1";
		}, timeout);
	}
	
	const _displayFitbitLogin = function (flag) {
		if (flag) {
			document.getElementById("fitbitLoginButton").classList.remove("is-hidden");
			document.getElementById("fitbitLogoutButton").classList.add("is-hidden");
		} else {
			document.getElementById("fitbitLoginButton").classList.add("is-hidden");
			document.getElementById("fitbitLogoutButton").classList.remove("is-hidden");
		}
	}

	// get day's remaining calories from fitbit
    const _getFitbitCalories = function () {
		const completeFunction = function (calories) {
			if (calories === void 0) {
				calories = localStorage.getItem("calories");
			}
			document.getElementById("caloriesRemaining").textContent = calories;
			if (calories === null) {
				_displayMessage("This page won't work until you set a Calorie Goal. Please log in to Fitbit or manually set your Calorie Goal in the settings page.");
			} else {
				_displayCalories(calories);
			}
		}
		
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
					localStorage.setItem("authentication", JSON.stringify(_params));
					document.getElementById("caloriesRemaining").textContent = data.goals.calories;
					// save the new remaining calories
					localStorage.setItem("calories", data.goals.calories);
					completeFunction(data.goals.calories);
				} else {
					_deleteAccessToken();
					completeFunction();
				}
			});
		} else {
			completeFunction();
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
				_displayCalories(calories, 250);
			});
		} else {
			_displayCalories(calories, 250);
		}
    }

	// run these things after the body has loaded since our script is in the head tag
    document.addEventListener("DOMContentLoaded", function () {
        _params = _getUrlVars();
		_getFitbitCalories();
		// if there's an access token saved
		_displayFitbitLogin(_params["access_token"] === void 0);
        _initBulma();
        
        const clearHistoryButton = document.getElementById("clear-history");
        if (clearHistoryButton) {
            clearHistoryButton.addEventListener("click", function () {
                //set the my_foods array to a blank array
                localStorage.setItem("my_foods", JSON.stringify([]));
                document.getElementById("historyTbody").innerHTML = "";
            });
        }
        document.getElementById("fitbitLogoutButton").addEventListener("click", function () {
            _deleteAccessToken();
            _displayFitbitLogin(true);
        });
        document.getElementById("caloriesButton").addEventListener("click", function () {
            if (localStorage.getItem("calories") !== null) {
                document.getElementById("calorieLogModal").classList.add("is-active");
            } else {
                _displayMessage("You cannot log calories yet. Please log in to Fitbit or manually set your Calorie Goal in the settings page.");
            }
        });
        document.querySelectorAll(".clear-form").forEach(
            deleteButton => {
                deleteButton.addEventListener("click", function () {_clearCaloriesModal(deleteButton)});
            }
        );
        document.querySelectorAll(".close-modal").forEach(
            deleteButton => {
                deleteButton.addEventListener("click", function () {
                    this.closest(".modal").classList.remove("is-active");
                });
            }
        );
        document.getElementById("saveCalorieGoal").addEventListener("click", function () {
            const caloriesEaten = parseInt(document.getElementById("caloriesEatenInput").value);
            if (Number.isInteger(caloriesEaten)) {
                let caloriesRemaining = parseInt(document.getElementById("caloriesRemaining").textContent);
                caloriesRemaining = caloriesRemaining - caloriesEaten;
                localStorage.setItem("calories", caloriesRemaining);
                _updateFitbitCalories(caloriesRemaining);
            }
            _clearCaloriesModal(this);
        });
    });
}();