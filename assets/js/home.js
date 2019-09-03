const home = function () {
    let _params = {};

	// search for a food
    const _searchRequest = function (event) {
        event.preventDefault();
        let headers = {
            "x-app-key": "3a63f5345ced508dd2c4a951e8a7a892",
            "x-remote-user-id": 0,
            "x-app-id": "b27f5737",
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

            //resets the card section at the bottom
            document.getElementById("cardContainer").innerHTML = "";
            
            data.branded.forEach(datum => {
				const calories = parseInt(datum.nf_calories);
                //clones template node
                let template = document.getElementById("cardTemplate").children[0].cloneNode(true);

                //takes name of Item
                template.getElementsByClassName("card-header-title")[0].innerHTML = datum.food_name.toUpperCase();

                //Adding the image to a new created div
                let image = template.getElementsByClassName("food-image")[0];
                image.src = datum.photo.thumb;

                //begin the fetch request for each items details
                let queryRequest = encodeURI(datum.food_name);

                let body = new URLSearchParams("query=" + queryRequest);

                fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
                    method: 'Post',
                    body: body,
                    headers: headers
                }).then(function (response) {
                    return response.json();
                }).then(function (data) {
                    //sets the correct Image
                    if (data.message !== "usage limits exceeded") {
                        template.getElementsByClassName("food-image")[0].setAttribute("src", data.photo.thumb);
                        //Sets Serving Size
                        template.getElementById("servingSize").innerHTML = data.serving_unit + "(About " + data.serving_weight_grams + ")";
                        // Set Calorie
                        template.getElementById("foodCalories").innerHTML = data.nf_calories;
                        template.getElementById("caloriesID").innerHTML = data.nf_calories;
                        // Set Fats
                        template.getElementId("totalFat").innerHTML = Math.floor(data.nf_total_fat);
                        template.getElementById("totalFatPerent").innerHTML = Math.floor((data.nf_total_fat / 65) * 100) + "%";
                        template.getElementById("saturatedFat").innerHTML = Math.floor(nf_saturated_fat);
                        template.getElementById("satFatPercent").innerHTML = Math.floor((nf_saturated_fat / 20) * 100) + "%";
                        //Set Cholesterol
                        template.getElementById("cholesterolID").innerHTML = Math.floor(data.nf_cholesterol);
                        template.getElementById("cholID").innerHTML = Math.floor((nf_cholesterol / 300) *100) + "%";
                        //Set Sodium
                        template.getElementById("sodiumID").innerHTML = Math.floor(data.nf_sodium);
                        template.getElementById("sodiumPercent").innerHTML = Math.floor((data.nf_sodium / 2300) * 100) + "%";
                        //Set Carbs
                        template.getElementById("carbsID").innerHTML = Math.floor(data.nf_total_carbohydrates);
                        template.getElementById("carbsPercent").innerHTML = Math.floor((data.nf_total_carbohydrates / 300) * 100) + "%";
                        template.getElementById("sugarID").innerHTML = Math.floor(data.nf_sugars);
                        //Set Protein
                        template.getElementById("proteinID").innerHTML = Math.floor(data_nf_protein);
                    }
                });

                const caloriesDiv = template.getElementsByClassName("calories")[0];
                caloriesDiv.innerHTML = calories;//Need to figure out solution for this area, endpoint for common doesn't give calories
                template.getElementsByClassName("calories")[1].innerHTML = calories;
				
                const createButton = template.getElementsByClassName("ate-food-button")[0];
				createButton.setAttribute("data-calories", calories);
				createButton.setAttribute("data-name", datum.food_name);
				createButton.addEventListener("click", function clickHandler() {
					if (localStorage.getItem("calories") !== null) {
						const caloriesEaten = parseInt(this.getAttribute("data-calories"));
						const foodName = this.getAttribute("data-name");
						const calories = parseInt(document.getElementById("caloriesRemaining").textContent) - caloriesEaten;
						localStorage.setItem("calories", calories);
						script.updateFitbitCalories(calories);
                        const myFoods = JSON.parse(localStorage.getItem("my_foods")) || [];
                        const date = JSON.stringify(new Date());
                        const myFood = {
                            food: foodName,
                            calories: caloriesEaten,
                            date: date
                        }
                        myFoods.push(myFood);
                        localStorage.setItem("my_foods", JSON.stringify(myFoods));
					} else {
						_displayMessage("You cannot add these calories yet. Please log in to Fitbit or manually set your Calorie Goal in the settings page.");
					}
				});
                document.getElementById("cardContainer").append(template);
            });
        });
    }

	// run these things after the body has loaded since our script is in the head tag
    document.addEventListener("DOMContentLoaded", function () {
        document.getElementById("form").addEventListener("submit", _searchRequest);
    });
}();