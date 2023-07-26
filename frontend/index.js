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
        socket.emit('newGame')
        socket.emit('diceRolled',diceValue,socket.id);//actually here we are passing parameters of the function
    console.log(diceValue)}, 1000);
});

//Moving Goti
function moveGoti(x,y,n){
    console.log("Hi moving goti");
    const goti = document.querySelector(`.overlay div:nth-child(${n})`);
    goti.style.transform = `translate(${x}px, ${y}px)`;
}
