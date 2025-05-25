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
const submitButton = document.getElementById("submit-button");
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

function displayCluesandGuesses() { 
  let allClues = "";
      for (let i = 0; i < clueWords.length; i++) {
        allClues += `<p>Clue ${i + 1}: ${
          clueWords[i]
        }  <span class="guessed-word">  ${
          previousGuesses[i] ? previousGuesses[i] : ""
        } </span></p>`;
      }
      clueWordDisplay.innerHTML = allClues;
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
  submitButton.style.display = "none"; // Hide submit button
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
guessInput.addEventListener("input", () => {
  if (guessInput.value.trim() !== "") {
    submitButton.style.display = "inline-block";
  } else {
    submitButton.style.display = "none";
  }
});

// Event listener for the guess input
guessInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && guessInput.value.trim() !== "") {
    // Trigger the submit button's click event
    submitButton.click();
  }
});

// Event listener for the submit button
submitButton.addEventListener("click", async () => {
  const guess = guessInput.value.trim().toLowerCase();
  if (!previousGuesses.includes(guess)) {
    guessInput.value = "";
  }
  submitButton.style.display = "none";
  gameMessage.textContent = "";

  if (previousGuesses.includes(guess)) {
    gameMessage.textContent = "Already guessed. Try again.";
  } else {
    console.log(`right above updateScore`);
    await calculator.updateScore(guess);
    previousGuesses.push(guess);
    if (guess === mysteryWord) {
      let score = await calculator.getScore();
      guessInput.style.display = "none";
      displayCluesandGuesses()
      mysteryWordDisplay.textContent = `The word was ${mysteryWord}`;
      mysteryWordDisplay.style.color = "green";
      gameMessage.textContent = `Congratulations! You guessed the word! Your score is ${score}.`;
    } else {
      gameMessage.textContent = "Incorrect guess. Try again.";
      if (currentClueIndex < clueWords.length) {
        let displayedClues = "";
        for (let i = 0; i < currentClueIndex + 1; i++) {
          displayedClues += `<p>Clue ${i + 1}: ${
            clueWords[i]
          }  <span class="guessed-word">  ${
            previousGuesses[i] ? previousGuesses[i] : ""
          } </span></p>`;
        }
        clueWordDisplay.innerHTML = displayedClues;
        currentClueIndex++;
      } else {
        let score = await calculator.getScore();
        guessInput.style.display = "none";
        displayCluesandGuesses()
        gameMessage.textContent = `Game over!  Your score is ${score}.`;
        mysteryWordDisplay.textContent = `The word was ${mysteryWord}`;
        mysteryWordDisplay.style.color = "red";
        gameMessage.textContent = `Game over!  Your score is ${score}.`;
      }
    }
  }
});
