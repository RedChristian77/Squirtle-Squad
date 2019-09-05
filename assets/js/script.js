const script = (function () {
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

    const _displayMessage = function (message) {
        const messageModal = document.getElementById("messageModal");
        messageModal.getElementsByClassName("message-body")[0].innerHTML = message;
        messageModal.classList.add("is-active");
    }

	// get day's remaining calories from fitbit
    const _getFitbitCalories = function () {
		const completeFunction = function (calories) {
			if (calories === void 0) {
				calories = _getLocalCalories();
			}
			document.getElementById("caloriesRemaining").textContent = calories;
			if (calories === null) {
                var urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get("redirect") !== "settings") {
                    window.location = "./settings.html?redirect=settings";
                } else {
                    _displayMessage("This page won't work until you set a Calorie Goal. Please log in to Fitbit or manually set your Calorie Goal in the settings page.");
                }
			} else {
				_displayCalories(calories);
			}
		}
		
		if (_params["access_token"] !== void 0) {
			axios({
                method: "get",
                url: "https://api.fitbit.com/1/user/" + _params["user_id"] + "/foods/log/goal.json", 
				headers: {
					"Authorization": "Bearer " + _params["access_token"]
				}
            })
			.then(function (response) {
				// if there are goals (ie we didnt get an error)
				if (response.data.goals) {
					localStorage.setItem("authentication", JSON.stringify(_params));
					document.getElementById("caloriesRemaining").textContent = response.data.goals.calories;
                    // save the new remaining calories
					localStorage.setItem("calories", response.data.goals.calories);
					completeFunction(response.data.goals.calories);
				} else {
					_deleteAccessToken();
					completeFunction();
				}
			});
		} else {
			completeFunction();
		}
    }

    const _getLocalCalories = function () {
        const floorDate = function (date) {
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            return date;
        }
        const calories = localStorage.getItem("calories");
        const lastEatenDateString = localStorage.getItem("lastEatenDate");
        if (lastEatenDateString !== null) {
            const date = floorDate(new Date(localStorage.getItem("lastEatenDate")));
            const newDate = floorDate(new Date());
            if (date !== newDate) {
                return localStorage.getItem("calorieGoal");
            }
        }
        return calories;
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
    
    const _updateLocalCalories = function (caloriesRemaining, logDate) {
        localStorage.setItem("calories", caloriesRemaining);
        if (logDate) {
            const date = new Date();
            date.setDate(date.getDate() - 1);
            localStorage.setItem("timeLastEaten", JSON.stringify(date));
        }
    }

    // run these things after the body has loaded since our script is in the head tag
    document.addEventListener("DOMContentLoaded", function () {
        _params = _getUrlVars();
        _getFitbitCalories();
        // if there's an access token saved
        _displayFitbitLogin(_params["access_token"] === void 0);
        _initBulma();

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
                deleteButton.addEventListener("click", function () { _clearCaloriesModal(deleteButton) });
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
            let foodInput = document.getElementById("foodEatenInput").value;
            let myFoods = JSON.parse(localStorage.getItem("my_foods")) || [];
            const myFood = {
                food: foodInput,
                calories: caloriesEaten,
                date: JSON.stringify(new Date())
            }
            myFoods.push(myFood);
            localStorage.setItem("my_foods", JSON.stringify(myFoods));
            history.addHistoryItems();
            if (Number.isInteger(caloriesEaten)) {
                let caloriesRemaining = parseInt(document.getElementById("caloriesRemaining").textContent);
                caloriesRemaining = caloriesRemaining - caloriesEaten;
                this.updateCalories(caloriesRemaining, true);
            }
            _clearCaloriesModal(this);
        });
    });

    return {
        displayMessage: function(message) {
            _displayMessage(message);
        },
        updateCalories: function(calories, logDate) {
            _updateFitbitCalories(calories);
            _updateLocalCalories(calories, logDate);
        }
    }
})();