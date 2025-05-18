import natural from 'natural';

export function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

export function lemmatizeWord(word) {
    // Lemmatize the guess
    const lemmatizer = new natural.LancasterStemmer(); 
    return lemmatizer.stem(guess);
}