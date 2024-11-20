System.register(["./statsGenerate.js", "./tokenizer.js", "./statsUI.js"], function (exports_1, context_1) {
    "use strict";
    var generate, tokenizer, stats, statsUI;
    var __moduleName = context_1 && context_1.id;
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
    exports_1("mainMobile", mainMobile);
    return {
        setters: [
            function (generate_1) {
                generate = generate_1;
            },
            function (tokenizer_1) {
                tokenizer = tokenizer_1;
            },
            function (stats_1) {
                stats = stats_1;
            }
        ],
        execute: function () {
            statsUI = stats.statsUI;
        }
    };
});
//# sourceMappingURL=statsMobile.js.map