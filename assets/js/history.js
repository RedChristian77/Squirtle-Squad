const history = function () {    
    const _addHistoryItems = function() {
        const table = document.getElementById("historyTbody");
        if (table) {
            const foods = JSON.parse(localStorage.getItem("my_foods")) || [];
            for (i = 0; i < foods.length; i++) {
                const newTr = table.insertRow(0);
                const cell1 = newTr.insertCell(0);
                const cell3 = newTr.insertCell(1);
                const cell4 = newTr.insertCell(2);
                cell1.innerHTML = foods[i].food;
                cell3.innerHTML = foods[i].calories;
                const date = new Date(JSON.parse(foods[i].date));
                let hours = date.getHours();
                let isPm = false;
                if (hours > 12) {
                    hours = hours - 12;
                    isPm = true;
                }
                hours = (hours < 10 ? "0" : "") + hours;
                const minutes = (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
                const dateString = (date.getMonth() + 1) + "/" + (date.getDate() + 1) + "/" + (date.getFullYear()) 
                                    + " " + hours + ":" + minutes + (isPm ? "pm" : "am");
                cell4.innerHTML = dateString;
            }
        }
    }

	// run these things after the body has loaded since our script is in the head tag
    document.addEventListener("DOMContentLoaded", function () {
        _addHistoryItems();
        const clearHistoryButton = document.getElementById("clear-history");
        if (clearHistoryButton) {
            clearHistoryButton.addEventListener("click", function () {
                //set the my_foods array to a blank array
                localStorage.setItem("my_foods", JSON.stringify([]));
                document.getElementById("historyTbody").innerHTML = "";
            });
        }
    });
}();