const map=[
	[100, 99, 98, 97, 96, 95, 94, 93, 92, 91],
	[81, 82, 83, 84, 85, 86, 87, 88, 89, 90],
	[80, 79, 78, 77, 76, 75, 74, 73, 72, 71],
	[61, 62, 63, 64, 65, 66, 67, 68, 69, 70],
	[60, 59, 58, 57, 56, 55, 54, 53, 52, 51],
	[41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
	[40, 39, 38, 37, 36, 35, 34, 33, 32, 31],
	[21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
	[20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
	[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
]

export function drawBoard(ctx, height, width, boardSize, blockSize, borderW, image, warArr) {
	console.log(warArr);
    ctx.fillStyle = 'grey';
    ctx.fillRect(0, 0, width, height);

    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';

    let countLR = 100;
    let countRL = 81;
    let flag = 0;
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            ctx.fillStyle = '#0D0D37';
            const x = c * blockSize + borderW;
            const y = r * blockSize + borderW;
            const rectWidth = blockSize - borderW * 2;
            const rectHeight = blockSize - borderW * 2;

            ctx.fillRect(x, y, rectWidth, rectHeight);
			//adding wormhole
			let mapVal = map[r][c];
			if(warArr.includes(mapVal)){
				ctx.drawImage(image,x,y,rectHeight,rectHeight);
			}
            let val;
            if (flag % 2 == 0) {
                val = countLR--;
            } else {
                val = countRL++;
            }

			//number color
            ctx.fillStyle = "white";
            ctx.fillText(val, x + rectWidth - 5, y + 5);
        }
        if (flag % 2 == 0) {
            countLR -= 10;
        } else {
            countRL = countLR - 19;
        }
        flag++;
    }
}

 
//randomise dice roll
export function createDice(number) {
    const dotPositionMatrix = {
		1: [
			[50, 50]
		],
		2: [
			[20, 20],
			[80, 80]
		],
		3: [
			[20, 20],
			[50, 50],
			[80, 80]
		],
		4: [
			[20, 20],
			[20, 80],
			[80, 20],
			[80, 80]
		],
		5: [
			[20, 20],
			[20, 80],
			[50, 50],
			[80, 20],
			[80, 80]
		],
		6: [
			[20, 20],
			[20, 80],
			[50, 20],
			[50, 80],
			[80, 20],
			[80, 80]
		]
	};

	const dice = document.createElement("div");

	dice.classList.add("dice");

	for (const dotPosition of dotPositionMatrix[number]) {
		const dot = document.createElement("div");

		dot.classList.add("diceDot");
		dot.style.setProperty("--top", dotPosition[0] + "%");
		dot.style.setProperty("--left", dotPosition[1] + "%");
		dice.appendChild(dot);
	}

	return dice;
}
  
export function randomizeDice(diceContainer) {
    diceContainer.innerHTML = "";
	const random = Math.floor((Math.random() * 6) + 1);
	const dice = createDice(random);
	diceContainer.appendChild(dice);
    return random;
}
