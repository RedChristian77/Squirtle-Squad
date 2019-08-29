const script = function () {
    const _initBulma = function () {
        // Get all "navbar-burger" elements
        const navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
        // Check if there are any navbar burgers
        if (navbarBurgers.length > 0) {
            // Add a click event on each of them
            navbarBurgers.forEach(el => {
                el.addEventListener('click', () => {
                    // Get the target from the "data-target" attribute
                    const target = el.dataset.target;
                    const targetElement = document.getElementById(target);
                    // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
                    el.classList.toggle('is-active');
                    targetElement.classList.toggle('is-active');
                });
            });
        }
    }

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

    document.addEventListener("DOMContentLoaded", function () {
        _initBulma();
        document.getElementById("form").addEventListener("submit", _searchRequest);
    });
}();