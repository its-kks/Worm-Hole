const express = require("express");
const app = express();
const http = require("http").createServer(app);
const { v4: uuidv4 } = require('uuid');

let io = require('socket.io')(http, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
});

function generateCustomUUID(size) {
    const id = uuidv4().replace(/-/g, '');
    return id.slice(0, size);
}

const clientRooms = {};//store which client belongs to which room
const state={};//stores gameState of each room


const IN_X=5;
const IN_Y=680;
function generateState(){
    gameState={
        noPlayers:1,
        players:[
            {
                x:IN_X, 
                y:IN_Y,
                num:1,
                color:'red'
            },
        ],
        gameStarted:false
    }
    return gameState;
}

io.on('connection',(socket)=>{
    console.log("New connection");
    socket.on('diceRolled',gotiCoordinates);
    socket.on('newGame',handleNewGame);

    function handleNewGame(){
        let roomName = generateCustomUUID(7);
        socket.emit('handleGameCode',roomName);

        //Using square brackets allows you to use a variable 
        // (or an expression) to dynamically specify the property name.
        //here socket.id will be replace with the id of the client and it
        //will be used as a property having value roomName
        clientRooms[socket.id]=roomName;
        console.log(socket.id);

        //adding gameState to state
        state[roomName]=generateState();

        //update client with gameState
        // client.emit()

        //The join method allows you to add the client 
        // to the specified room, which means the client will now be part of 
        // the communication in that room.
        socket.join(roomName);
        socket.number = 1;
    }
})

const port = 3000;
try {
  http.listen(port, () => {
    console.log("listening on localhost:" + port);
  });
} catch (e) {
  console.error("Server failed to listen " + e);
}


function gotiCoordinates(number,id){
    //add logic 

    // io.sockets.in(roomName).emit('event', value)); is used to send a 
    // 'event' event to all the connected clients who are present in the specified roomName.

    io.sockets.in(clientRooms[id]).emit('updateGoti',50,40,1);
    console.log(id);
}