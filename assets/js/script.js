 let headers = {
     "x-app-key" : "dda87a7beb9557383f39f2753bca8f84",
     "x-remote-user-id" : 0,
     "x-app-id" : "2aab2c41",
     "Content-Type" : "application/x-www-form-urlencoded"
 }

document.getElementById("form").addEventListener("submit",function(){
let queryRequest = encodeURI(document.getElementById("searchInput").value);

let body = new URLSearchParams("query="+queryRequest);

    fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
      method: 'Post',
      body: body,
      headers: headers
    }).then(function(response) {
      return response.json();
    }).then(function(data) {
        console.log(data);
    });
});
  