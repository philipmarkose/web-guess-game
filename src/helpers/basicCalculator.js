export function basicScore(mysteryWord, guesses) {

    if (guesses[guesses.length - 1] !== mysteryWord) {
        guesses.push(mysteryWord);
    }
    
    const lostPoints = [100, 90, 75, 50, 10, 0];
    let numberOfGuessesScore = 100 - lostPoints[guesses.length - 1];
    console.log(lostPoints[guesses.length - 1]);
    return lostPoints[guesses.length - 1];
}

basicScore("jungle", ["monkey", "jungle"]);
