import * as stats from "./statsUI.js";
const statsUI = stats.statsUI;

declare const Worker;

function startWorker(url, nouns, vocab){
    const worker = new Worker(new URL("statsWorker.js", import.meta.url));
    worker.addEventListener("message", function (e) {
        if(e.data == "loaded"){
            statsUI.setOnGenerate(() => {
                worker.postMessage(["generate", statsUI.getEnteredValue(), statsUI.randomnessValue()]);
            });
            statsUI.toggleGenerate(true);
            statsUI.toggleLoadingScreen(false);
        }
        else{
            statsUI.setGenerateText(e.data.percentage, e.data.noun, e.data.chosen);
        }
    });
    worker.postMessage(["load", vocab, url, nouns]);
    return worker;
}

export async function mainDesktop(getModelUrl, nouns, vocab){
    statsUI.setLoadingText("Loading");
    statsUI.toggleLoadingScreen(true);
    const worker = startWorker(getModelUrl(false), nouns, vocab);
    statsUI.enableLoadingSuggestion(async function(){
        statsUI.setLoadingText("Loading (small model)");
        await worker.terminate();
        startWorker(getModelUrl(true), nouns, vocab);
    });
}