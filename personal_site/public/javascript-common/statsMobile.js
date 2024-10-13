"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainMobile = mainMobile;
const generate = require("./statsGenerate.js");
const tokenizer = require("./tokenizer.js");
const stats = require("./statsUI.js");
const statsUI = stats.statsUI;
async function mainMobile(vocab, nouns, modelName) {
    statsUI.setLoadingText("Loading Mobile");
    statsUI.toggleLoadingScreen(true);
    const model = await generate.loadModel(tf, modelName);
    const trie = tokenizer.load(vocab);
    statsUI.toggleLoadingScreen(false);
    const processInput = (text) => {
        return tokenizer.processInput(text, generate.maskToken, tf, trie);
    };
    const processOutput = (predictions, index, noun) => {
        return tokenizer.processOutput(predictions, index, vocab, noun);
    };
    statsUI.setOnGenerate(async function () {
        statsUI.toggleGenerate(false);
        const enteredValue = statsUI.getEnteredValue();
        const results = await generate.generateStat(model, enteredValue, nouns, processInput, processOutput, statsUI.randomnessValue());
        statsUI.setGenerateText(results.percentage, results.noun, results.chosen);
        statsUI.toggleGenerate(true);
    });
    statsUI.toggleGenerate(true);
}
//# sourceMappingURL=statsMobile.js.map