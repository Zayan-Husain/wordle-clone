//get definitions of words/check if they exist
let tempIsAWord = "among us";

const isAWord = word => {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
	xhr.responseType = 'json';
	xhr.onload = () => {
		if (xhr.response[0]) { tempIsAWord = true; } else { tempIsAWord = false; }
	}
	xhr.send();
}
let q = qr => document.querySelector(qr);
let tempWord = "";
let gameStart = false;
let guesses = [];
let currLetter;
let keydownEvent;
q(".play").addEventListener('click', e => {
	q('.menuscreen').style.display = 'none';
	q('.gamescreen').style.display = 'block';
	randWord(Number(q('.wordlengthselect').value));
	setTimeout(() => {
		if (tempWord == "") alert("Process took too long. Please reload!")
		startGame();
		gameStart = true;
	}, 2000)
})

const startGame = () => {
	var guessLen = 6;
	var wordLen = Number(q('.wordlengthselect').value);
	window.addEventListener("keydown", e => {
		let letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
		if (letters.includes(e.key)) typeLetter(e.key)
		if (e.key === "Backspace") backspaceLetter();
		if (e.key === "Enter") submitWord(tempWord);
	})
	q('.submitwordbtn').addEventListener("click", () => {
		submitWord(tempWord);
	})
	q('.letterbtnbackspace').addEventListener("click", () => {
		backspaceLetter()
	})
	forRange(i => {
		var newRow = document.createElement("div");
		newRow.classList.add(`row${i + 1}`)
		newRow.classList.add(`row`)
		guesses.push([]);
		q(".letters").appendChild(newRow);
		forRange((j, params) => {
			nr = params[0];
			i = params[1];
			guesses[i].push('')
			var newDiv = document.createElement("div")
			var newDivLetter = document.createElement("span");
			var newDivLetterText = document.createTextNode("A");
			newDivLetter.appendChild(newDivLetterText);
			nr.appendChild(newDivLetter)
			newDiv.classList.add(`letter${j + 1}`);
			newDiv.classList.add(`letterdiv`);
			newDivLetter.classList.add(`divletter${j + 1}`);
			newDivLetter.classList.add(`letterspan`);
			nr.appendChild(newDiv);
		}, wordLen, newRow, i)
	}, guessLen)
	currLetter = "00";
}

const typeLetter = letter => {
	if (Number(currLetter[1]) === (guesses[0].length)) return;
	guesses[Number(currLetter[0])][Number(currLetter[1])] = letter;
	q(`.row${Number(currLetter[0]) + 1} .divletter${Number(currLetter[1]) + 1}`).innerText = letter.toUpperCase();
	q(`.row${Number(currLetter[0]) + 1} .divletter${Number(currLetter[1]) + 1}`).style.color = "white";
	currLetter = currLetter[0] + ((Number(currLetter[1]) + 1) + "");
}

const backspaceLetter = () => {
	if (currLetter[1] === "0") return;
	guesses[Number(currLetter[0])][Number(currLetter[1]) - 1] = '';
	q(`.row${Number(currLetter[0]) + 1} .divletter${Number(currLetter[1])}`).innerText = "A";
	q(`.row${Number(currLetter[0]) + 1} .divletter${Number(currLetter[1])}`).style.color = "rgb(182, 182, 182)";
	currLetter = currLetter[0] + ((Number(currLetter[1]) - 1) + "");
}

const submitWord = correctWord => {
	if (Number(currLetter[1]) !== guesses[0].length) {
		console.log("You have to put " + guesses[0].length + " letters in your word.");
		return;
	}
	let word = "";
	for (var l of guesses[currLetter[0]]) word += l
	isAWord(word);
	setTimeout(() => {
		if (tempIsAWord !== "among us" && !tempIsAWord) return;
		//find out if its the right word
		let submitResult = Array(guesses[0].length);
		//example: submitResult = ["correct", "wrongplace", "wrongplace", "notinword", "correct"]
		//         correct word = "FLOOR"
		//         guessed word = "FOLAR"
		//         F is correct, O is in the wrong place, L is also in the wrong place, A is not in the word, and R is correct.
		//find out similarities from word to correctWord
		var wordArr = guesses[currLetter[0]]
		var correctWordArr = Array.from(correctWord);
		//find correct letters (green)
		let x = forRange((i, params) => {
			let submitResult = params[0];
			let wordArr = params[1];
			let correctWordArr = params[2];
			if (wordArr[i] === correctWordArr[i]) {
				submitResult[i] = "correct";
				wordArr = [...wordArr.slice(0, i), ...wordArr.slice(i + 1)];
				correctWordArr = [...correctWordArr.slice(0, i), ...correctWordArr.slice(i + 1)];
			}
			return [submitResult, wordArr, correctWordArr]
		}, wordArr.length, submitResult, wordArr, correctWordArr)
		console.log(submitResult)
		submitResult = x[2][0];
		wordArr = x[2][1];
		correctWordArr = x[2][2];
		//find wrong place letters (orange/yellow)
		for (var l in wordArr) {
			var p = wordArr[l];
			if (correctWordArr.includes(p) && !submitResult[l]) {
				submitResult[l] = 'wrongplace'
				wordArr = [...wordArr.slice(0, Number(l)), ...wordArr.slice(Number(l) + 1)];
				correctWordArr = [...correctWordArr.slice(0, correctWord.indexOf(p)), ...correctWordArr.slice(correctWord.indexOf(p) + 1)];

			}
		}

		//compile the array and put it on screen (the colors)

		forRange((i, submitRes) => {
			let row = Number(currLetter[0]) + 1;
			let letter = Number(i) + 1;
			switch (submitRes[i]) {
				case "correct":
					q(`.row${row} .letter${letter}`).classList.add("correct")
					break;

				case "wrongplace":
					q(`.row${row} .letter${letter}`).classList.add("wrongspot")
					break;

				default:
					q(`.row${row} .letter${letter}`).classList.add("notinword")
					break;
			}
		}, guesses[0].length, submitResult)

		//check if player won the game
		let wonTheGame = true;
		for (var i of submitResult) {
			if (i !== "correct") wonTheGame = false;
		}

		if (wonTheGame) {
			alert("you won! Reload to play again.")
		}

		console.log(submitResult)
		currLetter = (Number(currLetter[0]) + 1) + "0"
		if (Number(currLetter[0]) === guesses.length) {
			alert("You lose!");
			setTimeout(() => {
				window.location.reload();
			}, 3000)
		}
	}, 1000)
}


//help funcs

function occurrences(string, subString, allowOverlapping) {

	string += "";
	subString += "";
	if (subString.length <= 0) return (string.length + 1);

	var n = 0,
		pos = 0,
		step = allowOverlapping ? 1 : subString.length;

	while (true) {
		pos = string.indexOf(subString, pos);
		if (pos >= 0) {
			++n;
			pos += step;
		} else break;
	}
	return n;
}

const forRange = (callback, range, ...parameters) => {
	let returnValArr = [];
	for (var i = 0; i < range; i++) {
		let returnVal;
		if (parameters.length === 1) {
			returnVal = callback(i, parameters[0]);
		} else if (parameters.length === 0) {
			returnVal = callback(i);
		} else {
			returnVal = callback(i, parameters);
		}
		returnValArr.push(returnVal);
	}
	return returnValArr;
}
const randNumInRange = (startNum, endNum) => {
	var num = Math.round((Math.random() * Number(endNum)) + Number(startNum));
	return num;
}
const randWord = (length = 5) => {
	const data = null;
	const xhr = new XMLHttpRequest();
	xhr.withCredentials = true;

	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === this.DONE) {
			tempWord = this.responseText;
		}
	});

	xhr.open("GET", `https://random-words5.p.rapidapi.com/getRandom?wordLength=${length + ""}`);
	xhr.setRequestHeader("x-rapidapi-host", "random-words5.p.rapidapi.com");
	xhr.setRequestHeader("x-rapidapi-key", "8d89ef0fdamshc39d2db0d14623cp1a4313jsn79ad0edf93cc");

	xhr.send(data);
}