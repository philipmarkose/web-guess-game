import natural from 'natural';
import { lemmatizer } from 'lemmatizer';

export async function getAcceptedGuesses(word) {
  const stemmer = natural.PorterStemmer;
  const forms = new Set();
  forms.add(stemmer.stem(word));
  forms.add(lemmatizer(word));
  return Array.from(forms);
}

export async function isGuessCorrect(mysteryWord, guess) {
  const mysteryForms = getAcceptedGuesses(mysteryWord.toLowerCase());
  const guessForms = getAcceptedGuesses(guess.toLowerCase());
  return mysteryForms.some(form => guessForms.includes(form));
}


console.log(isGuessCorrect("running", "ran")); // true (stem: "run")
console.log(isGuessCorrect("dogs", "dog")); // true (lemma: "dog")
console.log(isGuessCorrect("talked", "talks")); // true (stem/lemma: "talk")
console.log(isGuessCorrect("art", "artwork")); // false
