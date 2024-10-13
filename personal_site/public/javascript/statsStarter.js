System.register(["./statsDisplayGet.js", "./statsMobile.js", "./statsDesktop.js"], function (exports_1, context_1) {
    "use strict";
    var modelUrl, statsDisplayGet_js_1, mobile, desktop;
    var __moduleName = context_1 && context_1.id;
    async function getServerCsv(url) {
        const result = await fetch(url);
        const csv = await result.text();
        const array = csv.split("\n");
        const cleaned = array.slice(1).map(word => word.replace("\r", ""));
        return Promise.resolve(cleaned);
    }
    async function main() {
        const vocab = await (await fetch("/words/vocab.json")).json();
        if (getWords != undefined) {
            await statsDisplayGet_js_1.display(getWords);
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
    return {
        setters: [
            function (statsDisplayGet_js_1_1) {
                statsDisplayGet_js_1 = statsDisplayGet_js_1_1;
            },
            function (mobile_1) {
                mobile = mobile_1;
            },
            function (desktop_1) {
                desktop = desktop_1;
            }
        ],
        execute: function () {
            modelUrl = `${window.location.origin}/model/model.json`;
            main();
        }
    };
});
//# sourceMappingURL=statsStarter.js.map