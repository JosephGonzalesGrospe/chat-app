const express = require('express')
const config = require('config')
const users = require('./routes/user')
const messages = require('./routes/messages')
const mongoose = require('mongoose')
const path = require('path')
const app = express()
const http = require('http').Server(app)
const io = require('Socket.io')(http)

if(!config.get('jwtPrivateKey')) {
    console.error('FATAL ERROR: jwtPrivateKey is not defined...')
    process.exit(1)
}

mongoose.connect('mongodb://localhost/messages')
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.log('Disconnected to MongoDB...', err))

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'views')))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'controller')))
    
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
    
app.use('/api/users', users)
app.use('/api/messages', messages)
    
app.get('/', (req, res) => {
    res.render('index')
})
app.get('/dashboard', (req, res) => {
    res.render('dashboard')
})

app.get('/chatroom', (req, res) => {
    res.render('chatroom')
})

const port = process.env.PORT || 3000;
http.listen(port, () => {
    console.log(`Listening on port ${port}...`)

    io.on('connection', function (client) {
        console.log("USER CONNECTED...");
    
        // handle new messages
        client.on('new:message', function (msgObject) {
            client.emit('new:message', msgObject);
            console.log(msgObject)
        });
    
        // handle new members
        client.on('new:member', function (name) {
            client.emit('new:member', name);
        });

        // handle new connection
        client.on('new:connection', function (msgObject) {
            client.emit('new:connection', msgObject);
          });

          // handle joining group
        client.on('join:group', function (msgObject) {
            client.emit('join:group', msgObject);
            console.log('asdasd')
          });

          // handle new group message
        client.on('new:group_message', function (msgObject) {
            client.emit('new:group_message', msgObject);
            console.log(msgObject)
        });

        // handle messages
        client.on('load:messages', function (msgObject) {
            io.emit('load:messages', msgObject);
          });

          // handle users
        client.on('load:users', function () {
            client.emit('load:users');
          });

           // handle groups
        client.on('load:groups', function () {
            client.emit('load:groups');
          });

           // check if member
        client.on('check:group', function (msgObject) {
            io.emit('check:group', msgObject);
          });

          // handle group message
        client.on('load:group_messages', function (msgObject) {
            io.emit('load:group_messages', msgObject);
          });

      });
})