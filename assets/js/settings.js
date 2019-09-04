    const settings = function () {
	// run these things after the body has loaded since our script is in the head tag
    document.addEventListener("DOMContentLoaded", function () {

        const userHist = JSON.parse(localStorage.getItem("settings")) || [];
        userHist.forEach(user => {
            document.getElementById("table-info").insertAdjacentHTML("afterbegin",
            "<tr><td>" + user.name + "</td><td>" + user.calories + "</td><td>" + user.gender + "</td></tr>")
            
        });
        
    document.getElementById("form1").addEventListener("submit", function
        (event) {
        event.preventDefault()

        let name = document.getElementById("name-input").value.trim()
        let calories = document.getElementById("calorie-input").value.trim()
        let gender = document.querySelector('input[name = "gender"]:checked').value;
        console.log(name, calories, gender)

        if(name === "" || calories === ""){           
            script.displayMessage("Please fill in information!")
            return false;          
    }

        document.getElementById("table-info").insertAdjacentHTML("afterbegin",
            "<tr><td>" + name + "</td><td>" + calories + "</td><td>" + gender + "</td></tr>")
  
            document.getElementById("name-input").value=""
            document.getElementById("calorie-input").value=""
            
            document.getElementById("caloriesRemaining").textContent = calories;


        
        const userHist = JSON.parse(localStorage.getItem("settings")) || [];

        const newUser = {
        name: name,
        calories: calories,
        gender: gender
        }
        userHist.push(newUser)
        localStorage.setItem("settings", JSON.stringify(userHist))
        script.updateCalories(calories);


        
        })
    })
    }();
