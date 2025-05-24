import natural from 'natural';
const WordNet = natural.WordNet;
const wordnet = new WordNet();

export function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

export async function lemmatizeWord(word) {
    return new Promise((resolve, reject) => {
        wordnet.lookup(word, (results) => {
            if (results && results.length > 0) {
                // Return the lemma (base form) of the first result
                resolve(results[0].lemma || word);
            } else {
                // If no results, return the original word
                resolve(word);
            }
        });
    });
}

// Example usage
(async () => {
    const lemmatizedWord = await lemmatizeWord("playing");
    console.log("Lemmatized word:", lemmatizedWord); // Output: "run"
})();