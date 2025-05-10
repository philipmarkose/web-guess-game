export async function semanticScore(mysteryWord, guesses) {
    // Your existing semanticScore function code
    const model = await use.load();
    const mysteryWordEmbedding = await model.embed([mysteryWord]);

    const lostPoints = [100, 95, 90, 70, 40]; // [0,5,10,20,40];
    let score = lostPoints[guesses.length - 1];

    for (const guess of guesses) {
        const guessEmbedding = await model.embed([guess]);
        const similarityScore = cosineSimilarity(
            mysteryWordEmbedding.arraySync()[0],
            guessEmbedding.arraySync()[0]
        );

        let deduction = 20 * (1 - similarityScore);
        score = score - deduction;
        console.log(
            `Semantic similarity between "${mysteryWord}" and "${guess}": ${similarityScore}. Deduction: ${deduction}. Current score: ${score}`
        );

    }

    return Math.max(0, Math.round(score));
}

function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}