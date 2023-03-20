const express = require("express");
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const {userJoin,getCurrentUser,getRoomUsers,removeRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const PORT = 4000 || process.env.PORT;
const formatMessage = require('./utils/messages')
const cors = require('cors');

app.use(express.static(path.join(__dirname, 'public')));


app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const botName = 'ChatCord Bot';

io.on('connection', socket => {
    let user;
    socket.on('joinRoom', (a) => {
        console.log(a.username,a.room);
        console.log('New Connection.. ');
        user = userJoin(socket.id,a.username,a.room);
        socket.join(a.room);
        socket.emit('message', formatMessage(botName, 'welcome to chatcord'));
        socket.broadcast.to(a.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));

        io.to(a.room).emit('roomUsers',{
            room:a.room,
            users:getRoomUsers(a.room)
        })

    });



    socket.on('chatMessage', (msg) => {
        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })
    socket.on('disconnect', () => {
        let updatedUsers = removeRoomUsers(user.username,user.room);
       
        
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:updatedUsers
        })
        io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat` ));
    })
});


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});