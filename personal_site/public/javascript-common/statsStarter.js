"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modelUrl = `${window.location.origin}/model/model.json`;
async function getServerCsv(url) {
    const result = await fetch(url);
    const csv = await result.text();
    const array = csv.split("\n");
    const cleaned = array.slice(1).map(word => word.replace("\r", ""));
    return Promise.resolve(cleaned);
}
const statsDisplayGet_js_1 = require("./statsDisplayGet.js");
const mobile = require("./statsMobile.js");
const desktop = require("./statsDesktop.js");
async function main() {
    const vocab = await (await fetch("/words/vocab.json")).json();
    if (getWords != undefined) {
        await (0, statsDisplayGet_js_1.display)(getWords);
        return;
    }
    const nouns = await getServerCsv("/words/Nouns.csv");
    if (isMobile) {
        await mobile.mainMobile(vocab, nouns, modelUrl);
    }
    else {
        await desktop.mainDesktop(modelUrl, nouns, vocab);
    }
}
main();
//# sourceMappingURL=statsStarter.js.map