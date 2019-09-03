const home = function () {
    let _params = {};

	// search for a food
    const _searchRequest = function (event) {
        event.preventDefault();
        let headers = {
            "x-app-key": "02976e4e9ef2faf5912a8979ed74e9c2",
            "x-remote-user-id": 0,
            "x-app-id": "c76787f5",
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
            if(data.common.length === 0 && data.branded.length === 0){
                //add no search results div here
            }
            else{
            nutrientsDiv(data.branded[0]);
            data.branded.forEach(datum => {
               nutrientsDiv(datum);
                });
            data.common.forEach(datum =>{
              nutrientsDiv(datum);  });
            }
        });
    }

	// run these things after the body has loaded since our script is in the head tag
    document.addEventListener("DOMContentLoaded", function () {
        document.getElementById("form").addEventListener("submit", _searchRequest);
    });
}();

function nutrientsDiv(data){
    
    //begin the fetch request for each items details
    let queryRequest = encodeURI(data.food_name);
    let body = new URLSearchParams("query=" + queryRequest);
    let headers = {
        "x-app-key": "02976e4e9ef2faf5912a8979ed74e9c2",
        "x-remote-user-id": 0,
        "x-app-id": "c76787f5",
        "Content-Type": "application/x-www-form-urlencoded"
    }

    fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
        method: 'Post',
        body: body,
        headers: headers
    }).then(function (response) {
        return response.json();
    }).then(function (dataum) {
    console.log(dataum);
    let data = dataum.foods[0];
    console.log(data);
    //clones template node
    let template = document.getElementById("cardTemplate").children[0].cloneNode(true);

    //change the Name for the div
    template.getElementsByClassName("card-header-title")[0].innerHTML = data.food_name.toUpperCase();

    //Adding the image to a new created div
    let image = template.getElementsByClassName("food-image")[0];
    image.src = data.photo.thumb;
    
    //sets the correct Image
    if (data.message !== "usage limits exceeded") {
        template.getElementsByClassName("food-image")[0].setAttribute("src", data.photo.thumb);
        //Sets Serving Size
        template.getElementsByClassName("servingSize")[0].innerHTML = "Serving Size: " + data.serving_qty + " " + data.serving_unit + " (About " + data.serving_weight_grams + "g )";
        // Set Calorie
        template.getElementsByClassName("calories")[0].innerHTML = Math.floor(data.nf_calories);
        template.getElementsByClassName("calories")[1].innerHTML = Math.floor(data.nf_calories);
        // Set Fats
        template.getElementsByClassName("totalFat")[0].innerHTML =" " + Math.floor(parseInt(data.nf_total_fat));
        template.getElementsByClassName("totalFatPercent")[0].innerHTML =Math.floor((parseInt(data.nf_total_fat) / 65) * 100) + "%";
        template.getElementsByClassName("saturatedFat")[0].innerHTML =" " + Math.floor(parseInt(data.nf_saturated_fat));
        template.getElementsByClassName("satFatPercent")[0].innerHTML =Math.floor((parseInt(data.nf_saturated_fat) / 20) * 100) + "%";
        //Set Cholesterol
        template.getElementsByClassName("cholesterolID")[0].innerHTML =" " +  Math.floor(data.nf_cholesterol);
        template.getElementsByClassName("cholID")[0].innerHTML = Math.floor((data.nf_cholesterol / 300) *100) + "%";
        //Set Sodium
        template.getElementsByClassName("sodiumID")[0].innerHTML =" " + Math.floor(data.nf_sodium);
        template.getElementsByClassName("sodiumPercent")[0].innerHTML = Math.floor((data.nf_sodium / 2300) * 100) + "%";
        //Set Carbs
        template.getElementsByClassName("carbsID")[0].innerHTML = " " + Math.floor(data.nf_total_carbohydrate);
        template.getElementsByClassName("carbsPercent")[0].innerHTML = Math.floor((data.nf_total_carbohydrate / 300) * 100) + "%";
        template.getElementsByClassName("sugarID")[0].innerHTML =" " + Math.floor(data.nf_sugars);
        //Set Protein
        template.getElementsByClassName("proteinID")[0].innerHTML =" " + Math.floor(data.nf_protein);

        const caloriesDiv = template.getElementsByClassName("calories")[0];
        caloriesDiv.innerHTML = Math.floor(parseInt(data.nf_calories));
        template.getElementsByClassName("calories")[1].innerHTML = Math.floor(data.nf_calories);

        const createButton = template.getElementsByClassName("ate-food-button")[0];
        createButton.setAttribute("data-calories", data.nf_calories);
        createButton.setAttribute("data-name", data.food_name);
        createButton.addEventListener("click", function clickHandler() {
            if (localStorage.getItem("calories") !== null) {
                const caloriesEaten = parseInt(this.getAttribute("data-calories"));
                const foodName = this.getAttribute("data-name");
                const calories = parseInt(document.getElementById("caloriesRemaining").textContent) - caloriesEaten;
                localStorage.setItem("calories", data.nf_calories);
                //_updateFitbitCalories(calories);
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
    }
    )}
    document.getElementById("cardContainer").append(template);
    });
}