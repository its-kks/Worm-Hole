export function drawBoard(ctx, height, width, boardSize, blockSize, borderW) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';

    let countLR = 100;
    let countRL = 81;
    let flag = 0;

    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            ctx.fillStyle = '#ffbb33';
            const x = c * blockSize + borderW;
            const y = r * blockSize + borderW;
            const rectWidth = blockSize - borderW * 2;
            const rectHeight = blockSize - borderW * 2;

            ctx.fillRect(x, y, rectWidth, rectHeight);
            ctx.fillStyle = 'black'; // Set the color for the number

            let val;
            if (flag % 2 == 0) {
                val = countLR--;
            } else {
                val = countRL++;
            }
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
