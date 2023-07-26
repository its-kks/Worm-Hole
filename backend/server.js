const express = require("express");
const app = express();
const http = require("http").createServer(app);
const { v4: uuidv4 } = require('uuid');
const COLORS=['red','blue','green','magenta'];
const {numToCoordinates} = require('./utility.js');

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
                pos:1,
                color:COLORS[0]
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
    socket.on('joinGame',handleJoinGame)
    function handleNewGame(){
        let roomName = generateCustomUUID(7);
        socket.emit('handleGameCode',roomName);
        
        //Using square brackets allows you to use a variable 
        // (or an expression) to dynamically specify the property name.
        //here socket.id will be replace with the id of the client and it
        //will be used as a property having value roomName
        clientRooms[socket.id]=[roomName,1];

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
        io.sockets.in(roomName).emit('addGameCode',roomName);
        io.sockets.in(roomName).emit('setGoti',state[roomName]);
    }
    function handleJoinGame(roomName){
        console.log("Adding new player");
        if(state[roomName]===undefined){
            socket.emit('invalidCode');
        }
        else if(state[roomName].gameStarted==true){
            socket.emit('gameIsFull');
        }
        else{
            let gameState=state[roomName];
            clientRooms[socket.id]=[roomName,gameState.noPlayers+1];
            socket.join(roomName);
            gameState.players.push({
                x:IN_X, 
                y:IN_Y,
                pos:1,
                color:COLORS[gameState.noPlayers]
            });
            gameState.noPlayers+=1;
            socket.number = gameState.noPlayers;
            io.sockets.in(roomName).emit('setGoti',state[roomName]);
            socket.emit('addGameCode',roomName);
        }
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

async function gotiCoordinates(dice, id, blockSize) {
    // Find player no
    const playerNo = clientRooms[id][1];
    const clientArr = clientRooms[id];
    const oldPos = state[clientRooms[id][0]].players[playerNo - 1].pos;
    const newPos = dice + state[clientRooms[id][0]].players[playerNo - 1].pos;
    // Check for winner 
    // Check for out of bounds
    state[clientRooms[id][0]].players[playerNo - 1].pos = newPos;

    // Looping to mimic moving behavior with delay only at the end
    for (let p = oldPos + 1; p <= newPos; p++) {
        let arr = numToCoordinates(p, blockSize);
        io.sockets.in(clientRooms[id]).emit('updateGoti', arr[0], arr[1], playerNo);

        // Introduce a delay only for the last iteration of the loop
        if (p < newPos) {
            await new Promise(resolve => setTimeout(resolve, 500)); // 500 milliseconds (0.5 seconds) delay
        }
    }
}
