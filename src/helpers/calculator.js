
export class Calculator {
    constructor(mysteryWord, mysteryWordEmbedding, model) {
        this.mysteryWord = mysteryWord;
        this.mysteryWordEmbedding = mysteryWordEmbedding;
        this.model = model;
        this.guessCounter = 0;
        this.deduction = 0;
        this.maxScore = [100, 95, 90, 70, 40];
    }

    static async create(mysteryWord) {
        const model = await use.load();
        const mysteryWordEmbedding = await model.embed([mysteryWord]);
        return new Calculator(mysteryWord, mysteryWordEmbedding, model);
    }

    async getScore() {
        let score = this.maxScore[this.guessCounter-1]- this.deduction;
        console.log(
            `Current score after ${this.guessCounter} guesses: ${score}`
        );
        return Math.max(0,Math.round(score));
    }

    async updateScore(guess) {
        const guessEmbedding = await this.model.embed([guess]);
        this.guessCounter++;
        const similarityScore = this.cosineSimilarity(
            this.mysteryWordEmbedding.arraySync()[0],
            guessEmbedding.arraySync()[0]
        );

        this.deduction = this.deduction + (20 * similarityScore);
        console.log(
            `Semantic similarity between "${this.mysteryWord}" and "${guess}": ${similarityScore}. Deduction: ${this.deduction}. Current score: ${this.maxScore[this.guessCounter-1]- this.deduction}`
        );
        return this.deduction;
    }

    cosineSimilarity(vecA, vecB) {
        const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
        const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    }
}
