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
var model;
var input;
var output;
var nounList;
//hacky way to get around node's exports
var exports = {};
//these are the types transpiled for node modules, not system.js modules
importScripts("../ts/tokenizer.js");
importScripts("../ts/statsGenerate.js");
importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js");
importScripts("../../../js/chance.min.js");
var tokenizer = exports.tokenizer;
self.addEventListener("message", function (e) {
    return __awaiter(this, void 0, void 0, function () {
        var vocab_1, url, trie_1, enteredValue, randomness, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(e.data[0] == "load")) return [3 /*break*/, 2];
                    vocab_1 = e.data[1];
                    url = e.data[2];
                    nounList = e.data[3];
                    return [4 /*yield*/, exports.loadModel(tf, url)];
                case 1:
                    model = _a.sent();
                    trie_1 = tokenizer.load(vocab_1);
                    input = function (text) {
                        return tokenizer.processInput(text, exports.maskToken, tf, trie_1);
                    };
                    output = function (predictions, index, noun) {
                        return tokenizer.processOutput(predictions, index, vocab_1, noun);
                    };
                    self.postMessage("loaded");
                    return [3 /*break*/, 4];
                case 2:
                    if (!(e.data[0] == "generate")) return [3 /*break*/, 4];
                    enteredValue = e.data[1];
                    randomness = e.data[2];
                    return [4 /*yield*/, exports.generateStat(model, enteredValue, nounList, input, output, randomness)];
                case 3:
                    results = _a.sent();
                    self.postMessage(results);
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
});
//# sourceMappingURL=statsWorker.js.map