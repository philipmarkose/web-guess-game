import { GoogleGenAI } from "@google/genai";
import { system_prompt } from '../constants/systemPrompt.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function calculateScore(mysteryWord, guesses) {

  const lostPoints = [0,5,10,20,40];
  let numberOfGuessesScore = lostPoints[guesses.length-1];

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
        {
            text: `Mystery Word: ${mysteryWord}, Guesses: ${guesses.join(", ")}, Points to Deduct: ${numberOfGuessesScore}.`,
        }
    ],
    config: {
      systemInstruction: system_prompt,
    },
  });
  console.log(response.text);
  let scoreAndExplanation = extractFirstLineNumberAndSecondLine(response.text);
  console.log(scoreAndExplanation);
  return scoreAndExplanation;
}
function extractFirstLineNumberAndSecondLine(text) {
  const regex = /^.*?(\d+).*?\n(?:\s*\n)*(.*\S.*)$/m;
  const match = text.match(regex);

  if (match) {
    const firstNumber = match[1];
    const secondLine = match[2];
    return { firstNumber, secondLine };
  } else {
    return (null);
  }
}


await calculateScore("jungle", ["monkey", "train", "forest", "fegfaf"]);