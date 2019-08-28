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

        fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
            method: 'Post',
            body: body,
            headers: headers
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            document.getElementById("form").reset();
            console.log(data);
        });
    }

    const _test = function () {
        // get the url 
        var url = window.location.href;
        //getting the access token from url 
        var access_token = url.split("#")[1].split("=")[1].split("&")[0];
        // get the userid 
        var userId = url.split("#")[1].split("=")[2].split("&")[0];
        console.log(access_token);
        console.log(userId);
    }

    document.addEventListener("DOMContentLoaded", function () {
        _initBulma();
        _test();
        document.getElementById("form").addEventListener("submit", _searchRequest);
    });
}();