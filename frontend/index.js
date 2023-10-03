const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const boardSize = 10;
const width = 700;
const height = 700;
canvas.width = width;
canvas.height = height;
const blockSize = canvas.width / boardSize;
const borderW = 0;
let currTurn = 1;
let playerNo = 1;
import { drawBoard, createDice, randomizeDice } from './utility.js';

//making client instance
// const socket = io('https://worm-hole-production.up.railway.app/');
const socket = io('https://wormhole-ysdg.onrender.com');
socket.on('updateGoti',moveGoti);
socket.on('addGameCodeAndGenerateBoard',generateBackground);
socket.on('setGoti',setGoti);
socket.on('addPlayerHeading',(no)=>{
    document.querySelector('#playerHeading').innerText = `Player ${no}`;
    playerNo = no;
})
socket.on('gameIsFull',()=>{
    alert("Sorry this game has began!!!")
})
socket.on('invalidCode',()=>{
    alert("Sorry invalid code!!!")
})
socket.on('removeStartBtn',removeStart)
socket.on('updateTurn', (turn) => {
    const label = document.querySelector("#turnLabel");
    label.innerHTML = `<b>Turn: Player ${turn}</b>`;
    currTurn = turn;
});
socket.on('winnerFound',declareWinner)
socket.on('makeSmall',(n)=>{
    const goti = document.querySelector(`.overlay div:nth-child(${n})`);
    goti.classList.add('animatedSmall');
    goti.classList.remove('animatedLarge');
})
socket.on('regrow',(n)=>{
    const goti = document.querySelector(`.overlay div:nth-child(${n})`);
    goti.classList.add('animatedLarge');
    goti.classList.remove('animatedSmall');
})



const diceContainer = document.querySelector(".diceContainer");
const btnRollDice = document.querySelector(".rollDiceBtn");
const btnStart = document.querySelector(".startBtn");
let gameStarted = false;

randomizeDice(diceContainer);


btnRollDice.addEventListener("click", () => {
    if(gameStarted && currTurn==playerNo){
        let diceValue = -1;
        currTurn = -1;//preventing multiple clicks
	    const interval = setInterval(() => {
	    	diceValue = randomizeDice(diceContainer);
	    }, 50);
	    setTimeout(() => {clearInterval(interval)
            //sending data to server
            socket.emit('diceRolled',diceValue,socket.id,blockSize);
            console.log("Returning Dice Value");//actually here we are passing parameters of the function
        console.log(diceValue)}, 1000);
    }
});

//start game for all
btnStart.addEventListener("click",()=>{
    if(!gameStarted)
    {
        socket.emit('closeEntry');
        gameStarted=true;
    }
    
})

//remove start
function removeStart(){
    gameStarted=true;
        //close entry
    btnRollDice.classList.remove('btn-secondary')
    btnRollDice.classList.add('btn-primary');
    btnStart.remove();
    const turnLabel = document.createElement('dive');
    turnLabel.id = 'turnLabel';
    turnLabel.innerHTML = '<b>Turn: Player 1</b>';
    btnRollDice.insertAdjacentElement('afterend',turnLabel);
}

//Moving Goti
function moveGoti(x,y,n){
    console.log("Hi moving goti");
    console.log(socket.id);
    const goti = document.querySelector(`.overlay div:nth-child(${n})`);
    goti.style.transform = `translate(${x}px, ${y}px)`;
}

//handling new comer
const newGameBtn=document.querySelector('#newGameButton');
newGameBtn.addEventListener('click',()=>{
    document.querySelector('#initialScreen').style.display='none';
    document.querySelector('#gameScreen').style.display='flex'
    document.querySelector('#gameScreen').classList.add('gameDisplay');
    socket.emit('newGame');
})

function generateBackground(code,arr){
    const img = new Image();
    img.onload = function () {
        drawBoard(ctx, height, width, boardSize, blockSize, borderW, img, arr);
    };
    img.src = 'wormhole.png';
    const label=document.querySelector('#codeLabel');
    label.innerText=label.innerText+" "+code;
}
function setGoti(object){
    //to prevent invalid code from entering
    document.querySelector('#initialScreen').style.display='none';
    document.querySelector('#gameScreen').style.display='flex'
    document.querySelector('#gameScreen').classList.add('gameDisplay');
    for(let i=0;i<object.noPlayers;i++){
        const goti = document.querySelector(`.overlay div:nth-child(${i+1})`);
        goti.style.backgroundColor=object.players[i].color;
        goti.style.display='block';
    }

}
//joining game
const joinBtn=document.querySelector('#joinGameButton');
joinBtn.addEventListener('click',()=>{
    const inputCodeField=document.querySelector('#gameCodeInput');
    socket.emit('joinGame',inputCodeField.value);
})

//declare winner
function declareWinner(winner,id){
    if(socket.id==id){
        document.querySelector('#playerHeading').innerText = `You Won!!!`
    }
    else{
        document.querySelector('#playerHeading').innerText = `Player ${winner} won :)`
    }
    btnRollDice.remove();
    document.querySelector("#turnLabel").remove();
}
