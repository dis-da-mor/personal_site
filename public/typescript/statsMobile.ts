import * as generate from "./statsGenerate.js";
import * as tokenizer from "./tokenizer.js";
import * as stats from "./statsUI.js";
const statsUI = stats.statsUI;
declare const tf: any;

export async function mainMobile(vocab: string[], nouns: string[], modelName: string): Promise<void>{
    statsUI.setLoadingText("Loading Mobile");
    statsUI.toggleLoadingScreen(true);
    const model = await generate.loadModel(tf, modelName);
    const trie = tokenizer.load(vocab);
    statsUI.toggleLoadingScreen(false);

    const processInput = (text: string): tokenizer.ProcessedInputs => {
        return tokenizer.processInput(text, generate.maskToken, tf, trie);
    };
    const processOutput = (predictions: any, index: number, noun: string) => {
        return tokenizer.processOutput(predictions, index, vocab, noun);
    }

    statsUI.setOnGenerate(async function(){
        statsUI.toggleGenerate(false);
        const enteredValue: string|undefined = statsUI.getEnteredValue();
        const results = await generate.generateStat(
            model, enteredValue, nouns,
            processInput, processOutput,
            statsUI.randomnessValue()
        );
        statsUI.setGenerateText(results.percentage, results.noun, results.chosen);
        statsUI.toggleGenerate(true);
    });
    statsUI.toggleGenerate(true);
}

