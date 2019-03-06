$(() => {
    let socket = io()
    let url = new URL (window.location)
    let reciever = url.searchParams.get('reciever')
    let me = url.searchParams.get('sender')
    let group = url.searchParams.get('group')

    $(".msg_histo").animate({ scrollTop: $(document).height() }, 1000);


    if ( !reciever || !group ) {
      $(".write_msg").prop("disabled", true)
      $(".msg_send_btn").prop("disabled", true)
    }

    if($("#toggle").prop("checked", true)) {
      socket.emit('load:users')
    }

    $(document).on('click', '#toggle', function() {
      if (this.checked) {
        socket.emit('load:users')
      } else {
        socket.emit('load:groups')
      }
    })

    if (reciever) {  
      $("#toggle").prop("checked", true);
      $(".write_msg").prop("disabled", false)
      $(".msg_send_btn").prop("disabled", false)

      socket.emit('new:connection', { sender: me, reciever: reciever })
      socket.emit('load:messages', { sender: me, reciever: reciever })

      $(document).on('click', '.msg_send_btn', () => {
        console.log('personal')
        socket.emit('new:message', { sender: me, reciever: reciever, message: $('.write_msg').val() })
        $('.write_msg').val('')
      });
    }

    if (group) {
      socket.emit("join:group", {gc_name: group, gc_member: me})
      $("#toggle").prop("checked", false);
      $(".write_msg").prop("disabled", false)
      $(".msg_send_btn").prop("disabled", false)

      socket.emit('load:groups');
      socket.emit('check:group', { gc_name: group, gc_member: me })

      $(document).on('click', '.msg_send_btn', () => {
        console.log('group')
        socket.emit('new:group_message', {gc_name: group, gc_member: me, message: $('.write_msg').val() })
        $('.write_msg').val('')
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
        socket.emit('load:messages', {sender: me, reciever: reciever}); 
        socket.emit('load:users');
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
        socket.emit('load:messages', {sender: me, reciever: reciever}); 
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
          var months = ['January','February','March','April','May','June','July','August','September','October','November','December']
          var txt = ''
          console.log(response)
          $( response.data ).each( (i) => {
            var date = new Date(response.data[i].timestamp)
            var monthNow = months[date.getMonth()-1]
            if (response.data[i].sender == reciever) {
              txt += `<div class="incoming_msg">
                    <div class="incoming_msg_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> </div>
                    <div class="received_msg">
                    <div class="received_withd_msg">
                    <p>${response.data[i].message}</p>
                    <span class="time_date"> ${date.getHours()}:${date.getMinutes()}   |    ${monthNow} ${date.getDate()}</span></div><br>
                    </div>
                    </div>`
            } else {
              txt += `<div class="outgoing_msg">
                      <div class="sent_msg">
                      <p>${response.data[i].message}</p>
                      <span class="time_date"> ${date.getHours()}:${date.getMinutes()}   |     ${monthNow} ${date.getDate()}</span></div>
                      </div>`
              }
            
            $(".msg_history").html(txt);
          })  
        });
    });

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
            text +=  `<a href="?sender=${me}&reciever=${response.data[i].username}"><div class="chat_list active_chat" style="cursor: pointer;" >
                     <div class="chat_people">
                     <div class="chat_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> </div>
                     <div class="chat_ib">
                     <h5>${response.data[i].username}<span class="chat_date">Dec 25</span></h5>
                     <p>Test, which is a new approach to have all solutions 
                      astrology under one roof.</p>
                     </div>
                     </div>
                     </div>`
            $(".inbox_chat").html(text);
          })  
          
        });
    });

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
            var settings1 = {
              "async": true,
              "crossDomain": true,
              "url": `http://localhost:3000/api/messages/check_group/${response.data[i].gc_name}/${me}`,
              "method": "GET",
              "headers": {
                "Content-Type": "application/x-www-form-urlencoded",
                "cache-control": "no-cache",
                "Postman-Token": "9594ab96-89a7-4349-b657-961a90a9643a"
              },
              "data": {}
            }
                
            $.ajax(settings1)
              .done( (response1) => {
                if(response1.isMember == true) {
                  text +=  `<a href="?sender=${me}&group=${response.data[i].gc_name}"><div class="chat_list active_chat" style="cursor: pointer;" >
                     <div class="chat_people">
                     <div class="chat_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> </div>
                     <div class="chat_ib">
                     <h5>${response.data[i].gc_name}<span class="chat_date">Dec 25</span></h5>
                     <p>Test, which is a new approach to have all solutions 
                      astrology under one roof.</p>
                     </div>
                     </div>
                     </div>`
                    $(".inbox_chat").html(text);
                }
                else if (response1.isMember == false) {
                  text +=  `<a href="?sender=${me}&group=${response.data[i].gc_name}"><div class="chat_list active_chat" style="cursor: pointer;" >
                  <div class="chat_people">
                  <div class="chat_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> </div>
                  <div class="chat_ib">
                  <h5>${response.data[i].gc_name}</h5>
                  <button type="button" class="btn btn-info" onclick="joinGroup(${response.data[i].gc_name})">Join Group</button>
                  </div>
                  </div>
                  </div>`
                 $(".inbox_chat").html(text);
                }
              });
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
          if(response.isMember == true) {
            console.log(response.isMember)
            socket.emit('load:group_messages', {gc_name: msgObject.gc_name})
          }
          else if (response.isMember == false) {
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
          var months = ['January','February','March','April','May','June','July','August','September','October','November','December']
          var txt = ''
          $( response.data ).each( (i) => {
            var date = new Date(response.data[i].timestamp)
            var monthNow = months[date.getMonth()-1]
            if (response.data[i].sender != me) {
              txt += `<div class="incoming_msg">
                    <div class="incoming_msg_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> </div>
                    <div class="received_msg">
                    <div class="received_withd_msg">
                    <p>${response.data[i].message}</p>
                    <span class="time_date">${response.data[i].sender}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  ${date.getHours()}:${date.getMinutes()}   |    ${monthNow} ${date.getDate()}</span></div><br>
                    </div>
                    </div>`
            } else {
              txt += `<div class="outgoing_msg">
                      <div class="sent_msg">
                      <p>${response.data[i].message}</p>
                      <span class="time_date"> ${date.getHours()}:${date.getMinutes()}   |     ${monthNow} ${date.getDate()}</span></div>
                      </div>`
              }
            
            $(".msg_history").html(txt);
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
  