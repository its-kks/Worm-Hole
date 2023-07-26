const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const boardSize = 10;
const width = 740;
const height = 740;
canvas.width = width;
canvas.height = height;
const blockSize = canvas.width / boardSize;
const borderW = 1;
import { drawBoard, createDice, randomizeDice } from './utility.js';

//making client instance
const socket = io('http://localhost:3000');
socket.on('updateGoti',moveGoti);
socket.on('addGameCode',addGameCode);
socket.on('setGoti',setGoti);
socket.on('gameIsFull',()=>{
    alert("Sorry this game has began!!!")
})
socket.on('invalidCode',()=>{
    alert("Sorry invalid code!!!")
})

drawBoard(ctx,height,width,boardSize,blockSize,borderW);

const diceContainer = document.querySelector(".diceContainer");
const btnRollDice = document.querySelector(".rollDiceBtn");


randomizeDice(diceContainer);


btnRollDice.addEventListener("click", () => {
    let diceValue = -1;
	const interval = setInterval(() => {
		diceValue = randomizeDice(diceContainer);
	}, 50);
	setTimeout(() => {clearInterval(interval)
        //sending data to server
        socket.emit('diceRolled',diceValue,socket.id,blockSize);
        console.log("Returning Dice Value");//actually here we are passing parameters of the function
    console.log(diceValue)}, 1000);
});

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

function addGameCode(code){
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