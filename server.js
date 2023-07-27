const express = require("express");
const app = express();
const http = require("http").createServer(app);
const { v4: uuidv4 } = require('uuid');
const COLORS=['red','blue','green','magenta'];
const {numToCoordinates,randomArr} = require('./utility.js');
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

const NO_WORM=15;
const IN_X=5;
const IN_Y=640;
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
        gameStarted:false,
        currentTurn:1
    }
    return gameState;
}

io.on('connection',(socket)=>{
    console.log("New connection");
    socket.on('diceRolled',gotiCoordinates);
    socket.on('newGame',handleNewGame);
    socket.on('joinGame',handleJoinGame);
    socket.on('closeEntry',handleCloseEntry);
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

        //generate position of wormholes
        let from=randomArr(NO_WORM,[]);

        state[roomName].from=from;

        socket.emit('addGameCodeAndGenerateBoard',roomName,from);
        io.sockets.in(roomName).emit('setGoti',state[roomName]);
    }
    function handleJoinGame(roomName){
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
                x:IN_X+gameState.noPlayers*5, 
                y:IN_Y,
                pos:1,
                color:COLORS[gameState.noPlayers]
            });
            gameState.noPlayers+=1;
            socket.number = gameState.noPlayers;
            io.sockets.in(roomName).emit('setGoti',state[roomName]);
            socket.emit('addGameCodeAndGenerateBoard',roomName,gameState.from);
            socket.emit('addPlayerHeading',gameState.noPlayers);

            //if no of players are 4 start game automatically
            if(gameState.noPlayers===4){
                handleCloseEntry();
                gameState.gameStarted = true;
            }
        }
    }
    function handleCloseEntry(){
        //set game to start
        roomName=clientRooms[socket.id][0];
        let gameState=state[roomName];
        gameState.gameStarted = true;
        io.sockets.in(roomName).emit('removeStartBtn');
    }
})

const port =  process.env.PORT || 3000;
try {
    http.listen(port, () => {
        console.log("listening on localhost:" + port);
    });
} catch (e) {
    console.error("Server failed to listen " + e);
}

function setNextTurn(id){
    let noOfPlay=state[clientRooms[id][0]].noPlayers;
    let newTurn = (state[clientRooms[id][0]].currentTurn+1)%noOfPlay;
    newTurn = (newTurn==0)?noOfPlay:newTurn;
    state[clientRooms[id][0]].currentTurn= newTurn;
    io.sockets.in(clientRooms[id]).emit('updateTurn',newTurn);
}

async function gotiCoordinates(dice, id, blockSize) {
    // Find player no
    const playerNo = clientRooms[id][1];
    if(playerNo===state[clientRooms[id][0]].currentTurn){
        const clientArr = clientRooms[id];
        let delay=200;//delay to move from one position to another in ms
        const oldPos = state[clientRooms[id][0]].players[playerNo - 1].pos;
        let newPos = dice + state[clientRooms[id][0]].players[playerNo - 1].pos;
        const from = state[clientRooms[id][0]].from;
        // Check for out of bounds
        if(newPos>100){
            setNextTurn(id);
            return;
        }
        state[clientRooms[id][0]].players[playerNo - 1].pos = newPos;
        const inX=state[clientRooms[id][0]].players[playerNo - 1].x;
        const inY=state[clientRooms[id][0]].players[playerNo - 1].y;
        // Looping to mimic moving behavior with delay only at the end
        for (let p = oldPos + 1; p <= newPos; p++) {
            let arr = numToCoordinates(p, blockSize,inX,inY);
            io.sockets.in(clientRooms[id]).emit('updateGoti', arr[0], arr[1], playerNo);
            
            // Introduce a delay only for the last iteration of the loop
            if (p < newPos) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        // Check for winner 
        if(newPos==100){
            io.sockets.in(clientRooms[id]).emit('winnerFound',playerNo,id);
            return;
        }
        //check for wormholes
        if(from.includes(newPos)){
            io.sockets.in(clientRooms[id]).emit('makeSmall',playerNo);
            await new Promise(resolve => setTimeout(resolve, 1200));

            newPos=from[Math.floor(Math.random()*NO_WORM)];
            let arr = numToCoordinates(newPos, blockSize,inX,inY);
            state[clientRooms[id][0]].players[playerNo - 1].pos = newPos;
            io.sockets.in(clientRooms[id]).emit('updateGoti', arr[0], arr[1], playerNo);
            io.sockets.in(clientRooms[id]).emit('regrow',playerNo);
        }
        // setting turn of next player
        setNextTurn(id);
    }
}
