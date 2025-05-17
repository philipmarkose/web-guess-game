
export class Calculator {
    constructor(mysteryWord, mysteryWordEmbedding, model) {
        this.mysteryWord = mysteryWord;
        this.mysteryWordEmbedding = mysteryWordEmbedding;
        this.model = model;
        this.guessCounter = 0;
        this.deduction = 0;
        this.maxScore = [100, 95, 90, 70, 40];
        this.numberOfGuessesDeduction = [0, 5, 10, 30, 40];
        this.score = 100;
    }

    static async create(mysteryWord) {
        const model = await use.load();
        const mysteryWordEmbedding = await model.embed([mysteryWord]);
        return new Calculator(mysteryWord, mysteryWordEmbedding, model);
    }

    async getScore() {
        this.score = this.score - this.numberOfGuessesDeduction[this.guessCounter-1];
        console.log(
            `Current score after ${this.guessCounter} guesses: ${this.score}`
        );
        return Promise.resolve(Math.max(0,Math.round(this.score)));
    }

    async updateScore(guess) {
        const guessEmbedding = await this.model.embed([guess]);
        this.guessCounter++;
        const similarityScore = this.cosineSimilarity(
            this.mysteryWordEmbedding.arraySync()[0],
            guessEmbedding.arraySync()[0]
        );

        this.deduction = 20 * (1 - similarityScore);
        this.score = this.score - this.deduction;
        console.debug(
            `Semantic similarity between "${this.mysteryWord}" and "${guess}": ${similarityScore}. Deduction: ${this.deduction}. Current score: ${this.score}`
        );
        return Promise.resolve(this.deduction);
    }

    cosineSimilarity(vecA, vecB) {
        const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
        const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    }
}
