"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStat = exports.loadModel = exports.randomPercentage = exports.getNoun = exports.maskToken = void 0;
exports.maskToken = "***mask***";
var cutoffRange = [0.0002, 0.001];
var cleanInput = function (userInput) {
    userInput = userInput.replace(/[^0-9a-z ]/gi, '');
    if (userInput.length < 1)
        return undefined;
    if (userInput.length > 512)
        return userInput.substring(0, 512);
    return userInput;
};
var sample = function (array, limit) {
    if (limit === void 0) { limit = undefined; }
    limit = limit === undefined ? array.length : Math.min(array.length, limit);
    return array[Math.floor(Math.random() * limit)];
};
function getNoun(nounList, input) {
    if (input != undefined) {
        var cleaned = cleanInput(input);
        if (cleaned != undefined)
            return cleaned;
    }
    return sample(nounList);
}
exports.getNoun = getNoun;
function randomPercentage() {
    var number = Math.random() * 100;
    return Math.round(number * 10) / 10;
}
exports.randomPercentage = randomPercentage;
function loadModel(tf, modelUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var model, dummyInput;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, tf.loadGraphModel(modelUrl)];
                case 1:
                    model = _a.sent();
                    dummyInput = new tf.zeros([1, 512], "int32");
                    model.execute({
                        "input_ids": dummyInput,
                        "attention_mask": dummyInput
                    });
                    dummyInput.dispose();
                    return [2 /*return*/, model];
            }
        });
    });
}
exports.loadModel = loadModel;
function generateStat(model, input, nounList, processInput, processOutput, randomness) {
    return __awaiter(this, void 0, void 0, function () {
        var noun, percentage, text, tokenized, predictions, wordsProbs, cutoffValue, cutOffProbs, probabilities, sum, average, weights, words, chosen;
        return __generator(this, function (_a) {
            noun = getNoun(nounList, input);
            percentage = randomPercentage();
            text = "".concat(percentage, " percent of ").concat(noun, " are ").concat(exports.maskToken, ".");
            tokenized = processInput(text);
            predictions = model.execute(tokenized.inputs);
            wordsProbs = processOutput(predictions, tokenized.maskIndex, noun);
            cutoffValue = (cutoffRange[1] - cutoffRange[0]) * (1 - randomness) + cutoffRange[0];
            cutOffProbs = wordsProbs.filter(function (pair) { return pair[0].length > 2 && pair[1] > cutoffValue; });
            probabilities = Array.from(cutOffProbs, function (pair) { return pair[1]; });
            sum = probabilities.reduce((function (previousValue, currentValue) { return previousValue + currentValue; }));
            average = sum / probabilities.length;
            weights = Array.from(probabilities, function (probability) {
                var deviation = probability - average;
                return average + deviation * (1 - randomness);
            });
            words = Array.from(cutOffProbs, function (pair) { return pair[0]; });
            chosen = chance.weighted(words, weights);
            return [2 /*return*/, { percentage: percentage, noun: noun, chosen: chosen }];
        });
    });
}
exports.generateStat = generateStat;
//# sourceMappingURL=statsGenerate.js.map