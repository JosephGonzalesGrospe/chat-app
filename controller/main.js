$( document ).ready(function() {
  console.log('asdsad')
  $("#signin").click( () => {
    var password = $('#password').val();
    var username = $('#username').val();
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://localhost:3000/api/users/_",
        "method": "POST",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded",
          "cache-control": "no-cache",
          "Postman-Token": "a16bf626-8eb9-4d79-bf36-a34fa60710e5"
        },
        "data": {
          "username": username,
          "password": password
        }
      }
      
      $.ajax(settings)
      .done( (response) => {
        console.log(response)
          if(response.data) {
                alert('Account Created Successfully...');
                  window.location = `/dashboard?sender=${username}`
          }
          else {
            for(var i in response) {
              alert(response[i].message)
            }
          }
      });
});

$("#login").click( () => {
  console.log('asdsadsa')
  var username = $('#username').val();
  var password = $('#password').val();
  var settings = {
      "async": true,
      "crossDomain": true,
      "url": "http://localhost:3000/api/users",
      "method": "POST",
      "headers": {
        "Content-Type": "application/x-www-form-urlencoded",
        "cache-control": "no-cache",
        "Postman-Token": "a16bf626-8eb9-4d79-bf36-a34fa60710e5"
      },
      "data": {
        "username": username,
        "password": password
      }
    }
    
    $.ajax(settings)
    .done( (response) => {
      console.log(response)
        if(response.auth) {
              localStorage.setItem("username", username)
              alert('Successfully Login...');
              window.location = `/dashboard?sender=${username}`
        }
        else {
          for(var i in response) {
            alert(response[i].message)
          }
        }
    });
});

    
  });



