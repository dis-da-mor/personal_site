System.register(["./statsUI.js"], function (exports_1, context_1) {
    "use strict";
    var stats, statsUI;
    var __moduleName = context_1 && context_1.id;
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
    exports_1("mainDesktop", mainDesktop);
    return {
        setters: [
            function (stats_1) {
                stats = stats_1;
            }
        ],
        execute: function () {
            statsUI = stats.statsUI;
        }
    };
});
//# sourceMappingURL=statsDesktop.js.map