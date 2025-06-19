import { wordData } from "./constants/words.js";
import { Calculator } from "./helpers/calculator.js";

const mainPage = document.getElementById("main-page");
const gamePage = document.getElementById("game-page");
const startNewGameButton = document.getElementById("start-new-game");
const joinGameCodeInput = document.getElementById("join-game-code");
const joinExistingGameButton = document.getElementById("join-existing-game");
const gameCodeDisplay = document.getElementById("game-code");
const mysteryWordDisplay = document.getElementById("mystery-word-display");
const clueWordDisplay = document.getElementById("clue-word-display");
const guessInput = document.getElementById("guess-input");
const codeError = document.getElementById("code-error");
const gameMessage = document.getElementById("game-message");

let mysteryWord = "";
let clueWords = [];
let currentClueIndex = 0;
let gameCode = "";
let isNewGame = false;
let previousGuesses = [];
let calculator;

// Function to generate a mystery word and related clues
async function generateMysteryWordAndClues(code) {
  if (wordData[code]) {
    mysteryWord = wordData[code].word;
    clueWords = wordData[code].clues;
  } else {
    mysteryWord = "";
    clueWords = [];
  }
  currentClueIndex = 0;
  previousGuesses = [];
}

function displayCluesandGuesses(length) {
  let allClues = "";
  for (let i = 0; i < length; i++) {
    const fadeClass = i > currentClueIndex - 1 ? "fade-in" : ""; // Add fade-in class for clues greater than currentClueIndex
    allClues += `<p class="${fadeClass}">Clue ${i + 1}: ${
      clueWords[i]
    }  <span class="guessed-word">  ${
      previousGuesses[i] ? previousGuesses[i] : ""
    } </span></p>`;
  }
  clueWordDisplay.innerHTML = allClues;
}

function displaySuccessMessage(mysteryWord, score) {
  mysteryWordDisplay.textContent = `The word was ${mysteryWord}`;
  mysteryWordDisplay.style.color = "green";
  gameMessage.textContent = `Congratulations! You guessed the word! Your score is ${score}.`;

  // Add highlight animation for correct guess
  mysteryWordDisplay.classList.add("highlight");

  // Remove the highlight class after the animation ends
  mysteryWordDisplay.addEventListener("animationend", () => {
    mysteryWordDisplay.classList.remove("highlight");
  });
}

function shakeWrongGuess() {
  gameMessage.textContent = "";
  guessInput.classList.add("shake");

  // Remove the shake class after the animation ends
  guessInput.addEventListener("animationend", () =>
    guessInput.classList.remove("shake")
  );
}

// Function to switch to the game page
async function startGame() {
  mainPage.style.display = "none";
  gamePage.style.display = "block";
  if (isNewGame) {
    // Generate the game code (which is the key)
    const wordKeys = Object.keys(wordData);
    gameCode = wordKeys[Math.floor(Math.random() * wordKeys.length)];
    await generateMysteryWordAndClues(gameCode);
  }
  gameCodeDisplay.textContent = `Game Code: ${gameCode}`;
  mysteryWordDisplay.textContent = ""; // Clear any previous content
  clueWordDisplay.innerHTML = ""; // Clear any previous content
  guessInput.value = ""; // Clear input
  gameMessage.textContent = "";
  guessInput.focus();
  currentClueIndex = 0;
  previousGuesses = [];
  if (clueWords.length > 0) {
    clueWordDisplay.innerHTML += `<p>Clue 1: ${clueWords[currentClueIndex]}</p>`;
    currentClueIndex++;
  }
  console.log(`bout to create calculator`);
  calculator = await Calculator.create(mysteryWord);
  console.log(`calculator created: ${calculator}`);
}

// Event listener for the "Start New Game" button
startNewGameButton.addEventListener("click", async () => {
  isNewGame = true;
  await startGame();
});

// Add event listener for the "Enter" key
joinGameCodeInput.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") {
    joinExistingGameButton.click(); // Trigger the button click
  }
});

// Event listener for the "Join Existing Game" button
joinExistingGameButton.addEventListener("click", async () => {
  const enteredCode = joinGameCodeInput.value;
  if (wordData[enteredCode]) {
    gameCode = enteredCode;
    isNewGame = false;
    await generateMysteryWordAndClues(gameCode); // Call here to set clues
    startGame();
  } else {
    codeError.textContent =
      "Invalid code. Please enter a valid 4-digit number.";
    codeError.style.display = "block";
    joinGameCodeInput.classList.add("border-red-500");
  }
});


// Event listener for the guess input
guessInput.addEventListener("keydown", async (event) => {
  if (event.key === "Enter" && guessInput.value.trim() !== "") {
    // Trigger the submit button's click event
    await submitGuess();
  }
});

function flashRed() {
  const textbox = guessInput; // Target the guess input textbox
  textbox.style.backgroundColor = "#ffcccc"; // Set background to a lighter red
  setTimeout(() => {
    guessInput.value = "";
    textbox.style.backgroundColor = ""; // Reset background to normal after 0.5 seconds
  }, 1000);
}

// Event listener for the submit button
async function submitGuess() {
  const guess = guessInput.value.trim().toLowerCase();
  gameMessage.textContent = "";

  if (previousGuesses.includes(guess)) {
    gameMessage.textContent = "Already guessed. Try again.";
  } else {
    await calculator.updateScore(guess);
    previousGuesses.push(guess);
    if (guess === mysteryWord) {
      let score = await calculator.getScore();
      guessInput.style.display = "none";
      displayCluesandGuesses(clueWords.length);
      displaySuccessMessage(mysteryWord, score);
    } else {
      flashRed(); // Flash red when the guess is wrong
      shakeWrongGuess();
      if (currentClueIndex < clueWords.length) {
        displayCluesandGuesses(currentClueIndex + 1);
        currentClueIndex++;
      } else {
        let score = await calculator.getScore();
        guessInput.style.display = "none";
        displayCluesandGuesses(clueWords.length);
        gameMessage.textContent = `Game over!  Your score is ${score}.`;
        mysteryWordDisplay.textContent = `The word was ${mysteryWord}`;
        mysteryWordDisplay.style.color = "red";
        gameMessage.textContent = `Game over!  Your score is ${score}.`;
      }
    }
  }
}