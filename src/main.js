import { wordData } from "./constants/words.js";
import { basicScore } from "./helpers/basicCalculator.js";

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

// Function to generate a random 4-digit code - Not needed anymore
// function generateGameCode() {
//     return Math.floor(1000 + Math.random() * 9000).toString();
// }


let mysteryWord = "";
let clueWords = [];
let currentClueIndex = 0;
let gameCode = "";
let isNewGame = false;
let previousGuesses = [];

// Function to calculate "distance" between two words (basic approach)
function getWordDistance(word1, word2) {
  if (!word1 || !word2) return 0;
  let distance = 0;
  const maxLength = Math.max(word1.length, word2.length);
  for (let i = 0; i < maxLength; i++) {
    if (word1[i] !== word2[i]) {
      distance++;
    }
  }
  return distance + Math.abs(word1.length - word2.length); // Add length difference
}

// Function to sort clues based on their distance from the mystery word
function sortCluesByDistance(word, clues) {
  if (!word || !clues || clues.length === 0) return [];
  const sortedClues = [...clues].sort((a, b) => {
    const distanceA = getWordDistance(word, a);
    const distanceB = getWordDistance(word, b);
    return distanceB - distanceA; // Sort descending (farthest first)
  });
  return sortedClues;
}

// Function to generate a mystery word and related clues
function generateMysteryWordAndClues(code) {
  if (wordData[code]) {
    mysteryWord = wordData[code].word;
    clueWords = wordData[code].clues;
    clueWords = sortCluesByDistance(mysteryWord, clueWords); // Sort the clues
  } else {
    mysteryWord = "";
    clueWords = [];
  }
  currentClueIndex = 0;
  previousGuesses = [];
}

// Function to switch to the game page
function startGame() {
  mainPage.style.display = "none";
  gamePage.style.display = "block";
  if (isNewGame) {
    // Generate the game code (which is the key)
    const wordKeys = Object.keys(wordData);
    gameCode = wordKeys[Math.floor(Math.random() * wordKeys.length)];
    generateMysteryWordAndClues(gameCode);
  }
  gameCodeDisplay.textContent = `Game Code: ${gameCode}`;
  mysteryWordDisplay.textContent = ""; // Clear any previous content
  clueWordDisplay.innerHTML = ""; // Clear any previous content
  guessInput.value = ""; // Clear input
  submitButton.style.display = "none"; // Hide submit button
  gameMessage.textContent = "";
  currentClueIndex = 0;
  previousGuesses = [];
  if (clueWords.length > 0) {
    clueWordDisplay.innerHTML += `<p>Clue 1: ${clueWords[currentClueIndex]}</p>`;
    currentClueIndex++;
  }
}

// Event listener for the "Start New Game" button
startNewGameButton.addEventListener("click", () => {
  isNewGame = true;
  startGame();
});

// Event listener for the "Join Existing Game" button
joinExistingGameButton.addEventListener("click", () => {
  const enteredCode = joinGameCodeInput.value;
  if (wordData[enteredCode]) {
    gameCode = enteredCode;
    isNewGame = false;
    generateMysteryWordAndClues(gameCode); // Call here to set clues
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
submitButton.addEventListener("click", () => {
  const guess = guessInput.value.trim().toLowerCase();
  if (!previousGuesses.includes(guess)) {
    guessInput.value = "";
  }
  submitButton.style.display = "none";
  gameMessage.textContent = "";

  if (previousGuesses.includes(guess)) {
    gameMessage.textContent = "Already guessed. Try again.";
  } else {
    previousGuesses.push(guess);
    if (guess === mysteryWord) {
      let score = basicScore(mysteryWord,previousGuesses);
      gameMessage.textContent = `Congratulations! You guessed the word! Your score is ${score}.`;
      let allClues = "";
      for (let i = 0; i < clueWords.length; i++) {
        allClues += `<p>Clue ${i + 1}: ${
          clueWords[i]
        }  <span class="guessed-word"> ${
          previousGuesses[i] ? previousGuesses[i] : ""
        } </span></p>`;
      }
      clueWordDisplay.innerHTML = allClues;
      mysteryWordDisplay.textContent = `The word was ${mysteryWord}`;
      mysteryWordDisplay.style.color = "green";
      guessInput.style.display = "none";
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
        let score = basicScore(mysteryWord,previousGuesses);
        let allClues = "";
        for (let i = 0; i < clueWords.length; i++) {
          allClues += `<p>Clue ${i + 1}: ${
            clueWords[i]
          }  <span class="guessed-word">  ${
            previousGuesses[i] ? previousGuesses[i] : ""
          } </span></p>`;
        }
        clueWordDisplay.innerHTML = allClues;
        gameMessage.textContent = `Game over!  Your score is ${score}.`;
        mysteryWordDisplay.textContent = `The word was ${mysteryWord}`;
        mysteryWordDisplay.style.color = "red";
        guessInput.style.display = "none";
      }
    }
  }
});
