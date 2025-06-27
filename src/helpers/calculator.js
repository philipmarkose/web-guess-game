
export class Calculator {
    constructor(mysteryWord, mysteryWordEmbedding, model) {
        this.mysteryWord = mysteryWord;
        this.mysteryWordEmbedding = mysteryWordEmbedding;
        this.model = model;
        this.guessCounter = 0;
        this.deduction = 0;
        this.maxScore = [100, 90, 70, 40, 0];
        this.numberOfGuessesDeduction = [0, 5, 10, 30, 40];
        this.score = 100;
        this.useBasicCalculator = model===false;
    }

    static async create(mysteryWord) {
        try {
            const model = await use.load();
            const mysteryWordEmbedding = await model.embed([mysteryWord]);
            return new Calculator(mysteryWord, mysteryWordEmbedding, model);
        } catch (error) {
            console.log
            ('using basic calculator');
            return new Calculator(mysteryWord, false, false);
        }
        
    }

    async getScore() {
        if(this.useBasicCalculator) {return this.maxScore[this.guessCounter-1]}
        this.score = this.score - this.numberOfGuessesDeduction[this.guessCounter-1];
        console.log(
            `Current score after ${this.guessCounter} guesses: ${this.score}`
        );
        return Promise.resolve(Math.max(0,Math.round(this.score)));
    }

    async updateScore(guess) {
        this.guessCounter++;
        if(this.useBasicCalculator){return Promise.resolve()}

        const guessEmbedding = await this.model.embed([guess]);
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
