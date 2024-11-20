System.register([], function (exports_1, context_1) {
    "use strict";
    var maskToken, cutoffRange, cleanInput, sample;
    var __moduleName = context_1 && context_1.id;
    function getNoun(nounList, input) {
        if (input != undefined) {
            const cleaned = cleanInput(input);
            if (cleaned != undefined)
                return cleaned;
        }
        return sample(nounList);
    }
    exports_1("getNoun", getNoun);
    function randomPercentage() {
        const number = Math.random() * 100;
        return Math.round(number * 10) / 10;
    }
    exports_1("randomPercentage", randomPercentage);
    async function loadModel(tf, modelUrl) {
        const model = await tf.loadGraphModel(modelUrl);
        const dummyInput = new tf.zeros([1, 512], "int32");
        model.execute({
            "input_ids": dummyInput,
            "attention_mask": dummyInput
        });
        dummyInput.dispose();
        return model;
    }
    exports_1("loadModel", loadModel);
    async function generateStat(model, input, nounList, processInput, processOutput, randomness) {
        const noun = getNoun(nounList, input);
        const percentage = randomPercentage();
        const text = `${percentage} percent of ${noun} are ${maskToken}.`;
        const tokenized = processInput(text);
        const predictions = model.execute(tokenized.inputs);
        const wordsProbs = processOutput(predictions, tokenized.maskIndex, noun);
        const cutoffValue = (cutoffRange[1] - cutoffRange[0]) * (1 - randomness) + cutoffRange[0];
        const cutOffProbs = wordsProbs.filter((pair) => pair[0].length > 2 && pair[1] > cutoffValue);
        const probabilities = Array.from(cutOffProbs, pair => pair[1]);
        const sum = probabilities.reduce(((previousValue, currentValue) => previousValue + currentValue));
        const average = sum / probabilities.length;
        const weights = Array.from(probabilities, probability => {
            const deviation = probability - average;
            return average + deviation * (1 - randomness);
        });
        const words = Array.from(cutOffProbs, pair => pair[0]);
        const chosen = chance.weighted(words, weights);
        return { percentage, noun, chosen };
    }
    exports_1("generateStat", generateStat);
    return {
        setters: [],
        execute: function () {
            exports_1("maskToken", maskToken = "***mask***");
            cutoffRange = [0.0002, 0.001];
            cleanInput = (userInput) => {
                userInput = userInput.replace(/[^0-9a-z ]/gi, '');
                if (userInput.length < 1)
                    return undefined;
                if (userInput.length > 512)
                    return userInput.substring(0, 512);
                return userInput;
            };
            sample = (array) => {
                return array[Math.floor(Math.random() * array.length)];
            };
        }
    };
});
//# sourceMappingURL=statsGenerate.js.map