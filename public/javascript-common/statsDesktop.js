"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainDesktop = mainDesktop;
const stats = require("./statsUI.js");
const statsUI = stats.statsUI;
function startWorker(url, nouns, vocab) {
    const worker = new Worker("javascript-common/statsWorker.js");
    worker.addEventListener("message", function (e) {
        if (e.data == "loaded") {
            statsUI.setOnGenerate(() => {
                worker.postMessage(["generate", statsUI.getEnteredValue(), statsUI.randomnessValue()]);
            });
            statsUI.toggleGenerate(true);
            statsUI.toggleLoadingScreen(false);
        }
        else {
            statsUI.setGenerateText(e.data.percentage, e.data.noun, e.data.chosen);
        }
    });
    worker.postMessage(["load", vocab, url, nouns]);
    return worker;
}
async function mainDesktop(modelUrl, nouns, vocab) {
    statsUI.setLoadingText("Loading");
    statsUI.toggleLoadingScreen(true);
    startWorker(modelUrl, nouns, vocab);
}
//# sourceMappingURL=statsDesktop.js.map