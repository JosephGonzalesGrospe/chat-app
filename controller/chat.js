$(() => {
    let socket = io()

    let url = new URL (window.location)
    let username = url.searchParams.get('username')
    let me = url.searchParams.get('sender')
    let group = url.searchParams.get('group')

    $(document).on('click', '#join', () => {
      console.log('asdasd')
      socket.emit('join:group', {gc_name: group, gc_member: me})
    });

    if (username) {
      socket.emit('new:connection', { sender: me, reciever: username })
      socket.emit('load:messages', { sender: me, reciever: username })

      $(document).on('click', '#abtn', () => {
        console.log('personal')
        socket.emit('new:message', { sender: me, reciever: username, message: $('.form-control').val() })
      });
    }

    if (group) {
      socket.emit('check:group', { gc_name: group, gc_member: me })

    $(document).on('click', '#bbtn', () => {
      console.log('group')
      socket.emit('new:group_message', {gc_name: group, gc_member: me, message: $('.form-control').val() })
    });
    }

    socket.on('new:connection', function(msgObject){
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://localhost:3000/api/messages/personal",
        "method": "POST",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded",
          "cache-control": "no-cache",
          "Postman-Token": "078ce3c6-d188-4f87-ab74-51659ec3e3ca"
        },
        "data": {
          "user1": msgObject.sender,
          "user2": msgObject.reciever
        }
      }
      
      $.ajax(settings).done(function (response) {
        socket.emit('load:messages', {sender: me, reciever: username}); 
      });
    });
  
    // handle receiving new messages
    socket.on('new:message', function(msgObject){
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://localhost:3000/api/messages/personal_message",
        "method": "POST",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded",
          "cache-control": "no-cache",
          "Postman-Token": "b561c7f1-21c7-419b-85e9-50861dcd1e52"
        },
        "data": {
          "sender": msgObject.sender,
          "reciever": msgObject.reciever,
          "message": msgObject.message
        }
      }
      
      $.ajax(settings).done(function (response) {
        socket.emit('load:messages', {sender: me, reciever: username}); 
      });
    });
    
    socket.on('load:messages', (msgObject) => {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": `http://localhost:3000/api/messages/personal_message/${msgObject.sender}/${msgObject.reciever}`,
        "method": "GET",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded",
          "cache-control": "no-cache",
          "Postman-Token": "29230a9c-fba2-4691-aa17-e4c146844752"
        }
      }
      $.ajax(settings)
        .done( (response) => {
          var txt = ''
          $( response.data ).each( (i) => {
            var date = new Date(response.data[i].timestamp)
            txt += `<tr>
                      <td><img src="http://via.placeholder.com/80x50?text=${response.data[i].sender}" /></td>
                      <td>${response.data[i].message}</td>
                      <td>${date.getHours()}:${date.getMinutes()}</td>
                   </tr>`
            $(".table").html(txt);
          })  
        });
    });
    
    socket.emit('load:users');
    socket.on('load:users', function(){
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": `http://localhost:3000/api/users/${me}`,
        "method": "GET",
        "headers": {
          "cache-control": "no-cache",
          "Postman-Token": "0fb8f3a0-f61b-42fa-99a1-c0d4b014a52f"
        }
      }
          
      $.ajax(settings)
        .done( (response) => {
          var text = ''
          $( response.data ).each( (i) => {
            text +=  `<a href="?sender=${me}&username=${response.data[i].username}" class="chatperson-${response.data[i].username}">
            <span class="chatimg">'
            <img src="http://via.placeholder.com/100x100?text=${response.data[i].username}" alt="" />
            </span> 
            <div class="namechat"> 
            </div> 
            </a><br>`
            $("#personal").html(text);
          })  
          
        });
    });

    socket.emit('load:groups');
    socket.on('load:groups', function(){
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://localhost:3000/api/messages/group",
        "method": "GET",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded",
          "cache-control": "no-cache",
          "Postman-Token": "a84faecc-ef4d-4bb9-b7fb-3379d001c1da"
        },
        "data": ""
      }
          
      $.ajax(settings)
        .done( (response) => {
          var text = ''
          $( response.data ).each( (i) => {
            text +=  `<a href="?sender=${me}&group=${response.data[i].gc_name}">
            <span class="chatimg">'
            <img src="http://via.placeholder.com/100x100?text=${response.data[i].gc_name}" alt="" />
            </span> 
            <div class="namechat"> 
            </div> 
            </a><br>`
            $("#group").html(text);
          })  
          
        });
    });

    socket.on('check:group', function(msgObject){
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": `http://localhost:3000/api/messages/check_group/${msgObject.gc_name}/${msgObject.gc_member}`,
        "method": "GET",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded",
          "cache-control": "no-cache",
          "Postman-Token": "9594ab96-89a7-4349-b657-961a90a9643a"
        },
        "data": {}
      }
          
      $.ajax(settings)
        .done( (response) => {
          console.log(response)
          if(response.isMember == true) {
            console.log(response.isMember)
            socket.emit('load:group_messages', {gc_name: msgObject.gc_name})
            var text = `<div class="col-xs-9">
                       <input type="text" class="form-control" id="bform"/>
                       </div>
                       <div class="col-xs-3">
                       <button class="btn btn-info btn-block" id="bbtn">Send</button>
                       </div>`  
              $('#form').html(text)
          }
          else if (response.isMember == false) {
            console.log(response.isMember)
            var text = `<div class="col-xs-3">
                        <button class="btn btn-info btn-block" id="join">Join Conversation</button>
                        </div>`
            $('#form').html(text)
          }
        });
    });

    socket.on('load:group_messages', (msgObject) => {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": `http://localhost:3000/api/messages/group_messages/${msgObject.gc_name}`,
        "method": "GET",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded",
          "cache-control": "no-cache",
          "Postman-Token": "23910ac9-fe9c-47c8-b061-2913c0f494f2"
        },
        "data": ""
      }
      
      $.ajax(settings)
        .done( (response) => {
          console.log(response)
          var txt = ''
          $( response.data ).each( (i) => {
            var date = new Date(response.data[i].timestamp)
            txt += `<tr>
                      <td><img src="http://via.placeholder.com/80x50?text=${response.data[i].sender}" /></td>
                      <td>${response.data[i].message}</td>
                      <td>${date.getHours()}:${date.getMinutes()}</td>
                   </tr>`
            $(".table").html(txt);
          })  
        });
    });

    socket.on('join:group', function(msgObject) {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://localhost:3000/api/messages/join_group",
        "method": "POST",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded",
          "cache-control": "no-cache",
          "Postman-Token": "f9921567-c81c-44c7-a647-a038814389d3"
        },
        "data": {
          "gc_name": msgObject.gc_name,
          "gc_member": msgObject.gc_member
        }
      }
      
      $.ajax(settings)
        .done(function (response) {
          if(response.error) {
            console.log('error')
            alert(response.error)
          } else {
            socket.emit('load:group_messages', {gc_name: msgObject.gc_name})
            var text = `<div class="col-xs-9">
                       <input type="text" class="form-control" id="bform"/>
                       </div>
                       <div class="col-xs-3">
                       <button class="btn btn-info btn-block" id="bbtn">Send</button>
                       </div>`
              $('#form').html(text)
          }
      });
    })

    socket.on('new:group_message', function(msgObject) {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://localhost:3000/api/messages/group_message",
        "method": "POST",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded",
          "cache-control": "no-cache",
          "Postman-Token": "6505c8d4-e8b7-4587-8722-5b50eca7cf55"
        },
        "data": {
          "gc_name": msgObject.gc_name,
          "gc_member": msgObject.gc_member,
          "message": msgObject.message
        }
      }
      
      $.ajax(settings).done(function (response) {
        console.log(response)
        if (response.result) {
          socket.emit('load:group_messages', {gc_name: msgObject.gc_name})
        }
      });
    })
  });
  